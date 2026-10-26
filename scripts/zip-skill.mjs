import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { crc32 } from "node:zlib";

const SOURCE = "skill/morph";
const OUTPUT = "public/morph.zip";

const filesIn = (folder) =>
  readdirSync(folder)
    .sort()
    .flatMap((name) => {
      const path = join(folder, name);
      return statSync(path).isDirectory() ? filesIn(path) : [path];
    });

// Stored, not deflated: the skill is a few kilobytes and this keeps the writer to the zip format's bare headers.
const locals = [];
const centrals = [];
let offset = 0;
for (const path of filesIn(SOURCE)) {
  const name = Buffer.from(`morph/${relative(SOURCE, path)}`);
  const data = readFileSync(path);
  const checksum = crc32(data);

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt32LE(checksum, 14);
  local.writeUInt32LE(data.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(name.length, 26);

  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt32LE(checksum, 16);
  central.writeUInt32LE(data.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(name.length, 28);
  central.writeUInt32LE(offset, 42);

  locals.push(local, name, data);
  centrals.push(central, name);
  offset += local.length + name.length + data.length;
}

const directory = Buffer.concat(centrals);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(centrals.length / 2, 8);
end.writeUInt16LE(centrals.length / 2, 10);
end.writeUInt32LE(directory.length, 12);
end.writeUInt32LE(offset, 16);

// public/ holds nothing tracked but this zip, so a fresh checkout has no folder to write into.
mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, Buffer.concat([...locals, directory, end]));
console.log(`${OUTPUT}: ${centrals.length / 2} files`);
