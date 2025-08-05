export default function getDataDirectory() {
  return (
    (process.env.APPDATA ||
      (process.platform == "darwin"
        ? process.env.HOME + "/Library/Preferences"
        : process.env.HOME + "/.local/share")) + "/Lili's LLM Chat"
  );
}
