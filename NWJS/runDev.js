import pkg from "../package.json" with {type: 'json'};
import nwbuild from "nw-builder";
import { copyFile, rm, mkdir, copyDir } from "fs/promises";

const distDir = join(import.meta.dirname, "..", "dist");

nwbuild({...pkg.nwbuild, cacheDir: "./SDK"});
