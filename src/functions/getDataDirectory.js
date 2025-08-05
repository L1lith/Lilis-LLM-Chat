let hasMadeDir = false;
export default function getDataDirectory() {
  if (hasMadeDir) return process.env.DATA_DIRECTORY;
  const { mkdirSync } = require("fs");
  mkdirSync(process.env.DATA_DIRECTORY, { recursive: true });
  hasMadeDir = true;
  return process.env.DATA_DIRECTORY;
  // return (
  //   (process.env.APPDATA ||
  //     (process.platform == "darwin"
  //       ? process.env.HOME + "/Library/Preferences"
  //       : process.env.HOME + "/.local/share")) + "/Lili's LLM Chat"
  // );
}
