import { Jabr } from "jabr";
import syncToJSON from "./src/functions/syncToJSON";

const db = new Jabr();

if (global.window) {
  const { join } = require("path");
  const { mkdirSync } = require("fs");
  mkdirSync(process.env.DATA_DIRECTORY);
  syncToJSON(
    db,
    join(process.env.DATA_DIRECTORY, "lilis-llm-chat-config.json")
  );
  window.db = db;
}

export default db;
