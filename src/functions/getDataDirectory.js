let hasMadeDir = false;
let userDataDirectory = null;
export default function getDataDirectory() {
  if (hasMadeDir) return userDataDirectory;
  const { APPDATA, HOME, platform } = eval(
    "({HOME: process.env.HOME, APPDATA: process.env.APPDATA, platform: process.env.platform})"
  );
  const { join } = require("path");
  userDataDirectory = join(
    APPDATA ||
      (platform == "darwin"
        ? HOME + "/Library/Preferences"
        : HOME + "/.local/share"),
    "Lili's LLM Chat"
  );
  //eval("process.env");
  const { mkdirSync } = require("fs");
  mkdirSync(userDataDirectory, { recursive: true });
  hasMadeDir = true;
  return userDataDirectory;
  // return (
  //   (process.env.APPDATA ||
  //     (process.platform == "darwin"
  //       ? process.env.HOME + "/Library/Preferences"
  //       : process.env.HOME + "/.local/share")) + "/Lili's LLM Chat"
  // );
}
