import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Top } from "@/components/top";
import { excerpt, excerptLines, lineCount, skillTree } from "@/lib/source";
import { thinExampleOutput } from "@/lib/thin-example";

export const metadata: Metadata = { title: "How I built it · Morph" };

const NOTES: Record<string, string> = {
  "SKILL.md": "the steps and rules the agent follows",
  references: "read when a step needs more",
  "references/checking.md": "blank frames, and what to look for",
  "references/melt.md": "the melt's numbers and why",
  "references/pictures.md": "drawing in two inks",
  kit: "copied into your project",
  "kit/check.ts": "finds a melt's emptiest frame",
  "kit/dots.ts": "dots that ease, drawn in one path",
  "kit/grid.ts": "three states per cell",
  "kit/loop.ts": "beats on a loop",
  "kit/melt.ts": "blur and re-cut",
  "kit/paint.ts": "canvas drawing to cells",
  "kit/play.ts": "canvas, frames, reduced motion",
  "kit/toggle.ts": "two pictures and a switch",
};

function Code({ file, children }: { file: string; children: string }) {
  return (
    <figure className="code">
      <figcaption>{file}</figcaption>
      <pre>
        <code>{children}</code>
      </pre>
    </figure>
  );
}

const sectionId = (title: string) => title.toLowerCase().replaceAll(",", "").replaceAll(" ", "-");

function Section({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <section id={sectionId(title)}>
      <h2>
        <span className="number">{number}</span>
        {title}
      </h2>
      <div className="prose" style={{ marginTop: 0 }}>
        {children}
      </div>
    </section>
  );
}

function Tree() {
  const entries = skillTree();
  const width = Math.max(...entries.map(({ path, depth }) => depth * 2 + path.split("/").pop()!.length + 1)) + 4;
  return (
    <div className="tree">
      {"morph/\n"}
      {entries.map(({ path, depth, isFolder }) => {
        const name = `${"  ".repeat(depth + 1)}${path.split("/").pop()}${isFolder ? "/" : ""}`;
        const note = NOTES[path];
        return (
          <span key={path}>
            {note ? name.padEnd(width + 2) : name}
            {note && <span className="note">{note}</span>}
            {"\n"}
          </span>
        );
      })}
    </div>
  );
}

export default function HowIBuiltIt() {
  return (
    <main className="column">
      <Top current="/how-i-built-it" subtitle="how I built it" />
      <p className="tagline">
        It started as the dot illustrations on a product site: still pictures that needed to move without leaving the dot
        grid. These are the parts, in the order I built them.
      </p>

      <Section number="01" title="The folder">
        <p>
          The skill is a {lineCount("SKILL.md")}-line <code>SKILL.md</code>, three short notes, and a kit with no
          dependencies. This site imports the same kit, so every figure here runs the code the skill ships.
        </p>
        <Tree />
      </Section>

      <Section number="02" title="Three states">
        <p>
          A picture is one byte per cell. Solid dots carry structure, rings carry fill, and empty cells are what the eye
          reads as edges.
        </p>
        <Code file="kit/grid.ts">{excerptLines("kit/grid.ts", "export const EMPTY", "export type Picture")}</Code>
      </Section>

      <Section number="03" title="Draw, then read back">
        <p>
          Placing cells by hand stops working past a small icon. Every picture is drawn with the canvas API in cell units,
          black for solid and white for ring, and each cell is read back from the pixels it covers.
        </p>
        <Code file="kit/paint.ts">{excerptLines("kit/paint.ts", "if (coverage / samples", "picture[row * grid.columns")}</Code>
      </Section>

      <Section number="04" title="The melt">
        <p>
          Cross-fading two dot pictures looks like a slideshow. The melt lays both into one raster, blurs it, and cuts it
          back at half coverage. Where two shapes come close, the blur bridges them, so they join before they let go.
        </p>
        <Code file="kit/melt.ts">{excerpt("kit/melt.ts", "export function meltEnvelope")}</Code>
      </Section>

      <Section number="05" title="Dots that ease">
        <p>
          The cut flips cells in steps. Each dot eases its size and fill toward its cell over about 40 ms, so edges swell
          and drain. A dot on its way out keeps its fill; otherwise it flashes as a ring as it leaves.
        </p>
        <Code file="kit/dots.ts">{excerpt("kit/dots.ts", "ease(picture")}</Code>
      </Section>

      <Section number="06" title="Thin pictures">
        <p>
          A picture made of one-cell lines has nothing to melt. The blur drops it under half coverage before the next
          picture arrives, and the frame goes blank. I hit this on a JSON-braces picture, so the kit now checks every melt
          for its emptiest frame.
        </p>
        <Code file="kit/check.ts">{excerpt("kit/check.ts", "export function thinnestMeltFrame")}</Code>
        <Code file="square to circle, run as this page was built">{thinExampleOutput()}</Code>
      </Section>

      <Section number="07" title="Time in, frame out">
        <p>
          A beat holds for 2.4 s and melts for 1.1 s, unless it sets its own: a story like Search holds the terminal while
          the question is typed. Every picture is a function of time, so any second of a loop can be drawn on its own.
          That is what makes a single frame checkable and a loop recordable.
        </p>
        <Code file="kit/loop.ts">{excerpt("kit/loop.ts", "at(seconds")}</Code>
      </Section>

      <footer>
        <Link href="/">← Morph</Link>
      </footer>
    </main>
  );
}
