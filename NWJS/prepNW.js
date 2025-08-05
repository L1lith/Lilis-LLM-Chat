import { rm } from "fs/promises";
import { join } from "path";

const distDir = join(import.meta.dirname, "..", "dist");

await rm(distDir, { recursive: true, force: true });
