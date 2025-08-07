import pkg from "../package.json" with {type: 'json'};
import nwbuild from "nw-builder";
import {join} from 'path'
import { writeFile } from "fs/promises";

await nwbuild({...pkg.nwbuild, cacheDir: "./node_modules/nw", platform: 'osx'});

const bundleDir = join(import.meta.dirname, '..', 'bundle')
const tempPackagePath = join(bundleDir, 'package.json')
const tempPackage = {...pkg}
delete tempPackage.devDependencies

await writeFile(tempPackagePath, JSON.stringify(tempPackage))
console.log("wrote new package at", tempPackagePath)

process.exit(0)