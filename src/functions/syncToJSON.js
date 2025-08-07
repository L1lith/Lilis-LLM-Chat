import { readFile, writeFile } from "./fs";

async function syncToJSON(store, jsonPath) {
  let data = null;
  try {
    const plain = await readFile(jsonPath);
    data = JSON.parse(plain);
    if (typeof data != "object" && data === null)
      throw new Error("json data should be an object");
  } catch (err) {
    if (err?.code !== "ENOENT" && !String(err).includes("ENOENT")) throw err;
  }
  if (data !== null) {
    const oldWarn = console.warn;
    console.warn = () => {}; // Suppress Redundancy Warnings
    Object.entries(data).forEach(([key, value]) => {
      store[key] = value;
    });
    console.warn = oldWarn;
  }

  store.on("*", () => {
    writeFile(jsonPath, JSON.stringify(store)).catch(console.error);
  });
  return store;
}

export default syncToJSON;
