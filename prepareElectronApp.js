import { rm, rename, writeFile } from "fs/promises";
import { join } from "path";
import pkg from "./package.json" with {type: 'json'};

const distOriginalPath = join(import.meta.dirname, "dist");
const appPath = join(import.meta.dirname, "app");
const distFinalPath = join(appPath, "dist");

await rm(distFinalPath, { recursive: true, force: true });
await rename(distOriginalPath, distFinalPath, { recursive: true });


const newPkg = {name: pkg.name, version: pkg.version, dependencies: pkg.dependencies, main: 'main.js', type: 'module', author: pkg.author, license: pkg.license, description: pkg.description}
const newPkgPath = join(appPath, 'package.json')

writeFile(newPkgPath, JSON.stringify(newPkg))