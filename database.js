import { Jabr } from "jabr";
import syncToJSON from "./src/functions/syncToJSON";
import getDataDirectory from "./src/functions/getDataDirectory";

const db = new Jabr();

if (global.window) {
  const { join } = require("path");
  syncToJSON(db, join(getDataDirectory(), "lilis-llm-chat-config.json"));
  window.db = db;
}

export default db;
