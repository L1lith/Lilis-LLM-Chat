import { rm, rename, writeFile } from "fs/promises";
import { join } from "path";
import pkg from "./package.json" with {type: 'json'};

const distOriginalPath = join(import.meta.dirname, "dist");
const appPath = join(import.meta.dirname, "app");
const distFinalPath = join(appPath, "dist");

await rm(distFinalPath, { recursive: true, force: true });
await rename(distOriginalPath, distFinalPath, { recursive: true });


const newPkg = {name: pkg.name, devDependencies: pkg.devDependencies, version: pkg.version, dependencies: pkg.dependencies, main: 'main.js', type: 'commonjs', author: pkg.author, license: pkg.license, description: pkg.description}
//const fullPkg = { ...pkg, main: 'main.js', type: 'commonjs' };
const newPkgPath = join(appPath, 'package.json')
//await writeFile(newPkgPath, JSON.stringify(fullPkg, null, 2));

await writeFile(newPkgPath, JSON.stringify(newPkg))