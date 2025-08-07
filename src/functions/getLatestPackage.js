const packageURL =
  "https://raw.githubusercontent.com/L1lith/Lilis-LLM-Chat/refs/heads/main/package.json";

let pkg;

export default async function getLatestPackage() {
  if (pkg) return pkg;
  const res = await fetch(packageURL);
  pkg = await res.json();
  return pkg;
}
