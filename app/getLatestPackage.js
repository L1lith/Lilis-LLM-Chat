const packageURL =
  "https://raw.githubusercontent.com/L1lith/Lilis-LLM-Chat/refs/heads/main/package.json";

let pkg;

async function getLatestPackage(clearCache = false) {
  if (!clearCache && pkg) return pkg;
  const res = await fetch(packageURL);
  pkg = await res.json();
  return pkg;
}

module.exports = getLatestPackage;
