import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SKILL = join(process.cwd(), "skill/morph");

const linesOf = (file: string) => readFileSync(/*turbopackIgnore: true*/ join(SKILL, file), "utf8").split("\n");
const indentOf = (line: string) => line.length - line.trimStart().length;

function dedent(lines: string[]) {
  const indent = Math.min(...lines.filter((line) => line.trim()).map(indentOf));
  return lines.map((line) => line.slice(indent)).join("\n");
}

/** The declaration starting with `opening` in a kit file, through its closing brace. */
export function excerpt(file: string, opening: string) {
  const lines = linesOf(file);
  const start = lines.findIndex((line) => line.trimStart().startsWith(opening));
  if (start < 0) throw new Error(`${opening} not found in ${file}`);
  const indent = indentOf(lines[start]);
  const end = lines.findIndex((line, index) => index > start && indentOf(line) === indent && /^[}\]]/.test(line.trimStart()));
  return dedent(lines.slice(start, end + 1));
}

/** Lines from the one starting with `first` through the one starting with `last`. */
export function excerptLines(file: string, first: string, last: string) {
  const lines = linesOf(file);
  const start = lines.findIndex((line) => line.trimStart().startsWith(first));
  const end = lines.findIndex((line, index) => index >= start && line.trimStart().startsWith(last));
  if (start < 0 || end < 0) throw new Error(`${first}…${last} not found in ${file}`);
  return dedent(lines.slice(start, end + 1));
}

export function lineCount(file: string) {
  return linesOf(file).length - 1;
}

export interface TreeEntry {
  path: string;
  depth: number;
  isFolder: boolean;
}

export function skillTree(): TreeEntry[] {
  const paths = readdirSync(/*turbopackIgnore: true*/ SKILL, { recursive: true, encoding: "utf8" });
  const folders = new Set(paths.filter((path) => statSync(/*turbopackIgnore: true*/ join(SKILL, path)).isDirectory()));
  const foldersFirst = (a: string, b: string) => {
    const [aParts, bParts] = [a.split("/"), b.split("/")];
    for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
      if (aParts[i] === bParts[i]) continue;
      const aIsFolder = i < aParts.length - 1 || folders.has(a);
      const bIsFolder = i < bParts.length - 1 || folders.has(b);
      return Number(bIsFolder) - Number(aIsFolder) || aParts[i].localeCompare(bParts[i]);
    }
    return aParts.length - bParts.length;
  };
  return [...paths].sort(foldersFirst).map((path) => ({ path, depth: path.split("/").length - 1, isFolder: folders.has(path) }));
}
