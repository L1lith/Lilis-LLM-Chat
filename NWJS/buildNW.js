import { copyFile, rm, mkdir } from "fs/promises";
import { join } from "path";

const distDir = join(import.meta.dirname, "..", "dist");
const packageJSON = join(import.meta.dirname, "..", "package.json");
const indexJS = join(import.meta.dirname, "index.js");
const exeDir = join(import.meta.dirname, "..", "bundle");

await copyFile(packageJSON, join(distDir, "package.json"));
await copyFile(indexJS, join(distDir, "index.js"));
await rm(exeDir, { recursive: true, force: true });
await mkdir(exeDir);

console.log("~~~\n~ Starting NWJS\n~~~");
