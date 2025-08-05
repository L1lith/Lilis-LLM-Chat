export default async function searchDir(dir, check = () => true) {
  const { readdir, stat } = require("fs/promises");
  const { join } = require("path");
  // read the contents of the directory
  const files = await readdir(dir);
  let output = [];

  // search through the files
  await Promise.all(
    files.map(async (shortPath) => {
      const fullPath = join(dir, shortPath);

      // get the file stats
      const fileStat = await stat(fullPath);
      let extension = shortPath.split(".");
      extension = extension[extension.length - 1] || null;
      const details = {
        fullPath,
        shortPath,
        isDirectory: fileStat.isDirectory(),
        isFile: fileStat.isFile(),
        stat: fileStat,
        extension,
      };
      if (await check(details)) {
        output.push(details);
      }
      // if the file is a directory, recursively search the directory
      if (details.isDirectory)
        output = output.concat(await searchDir(fullPath, check));
    })
  );
  return output;
}
