import { Jabr } from "jabr";
import syncToJSON from "./src/functions/syncToJSON";

const db = new Jabr();

if (this?.window) {
  syncToJSON(db, "lilis-llm-chat-config.json");
  window.db = db;
}

export default db;
