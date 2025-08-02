import { rmdir } from "fs/promises";
import { join } from "path";

const distDir = join(import.meta.dirname, "..", "dist");

await rmdir(distDir, { recursive: true, force: true });
