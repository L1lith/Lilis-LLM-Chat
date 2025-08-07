import { ls, stat, join } from "./fs";

export default async function searchDir(dir, check = () => true) {
  // read the contents of the directory
  const files = await ls(dir);
  let output = [];

  // search through the files
  await Promise.all(
    files.map(async (details) => {
      const fullPath = await join(dir, details.name);

      // get the file stats
      const fileStat = await stat(fullPath);
      let extension = details.name.split(".");
      extension = extension[extension.length - 1] || null;
      const fullDetails = {
        fullPath,
        shortPath: details.name,
        extension,
        ...fileStat,
      };
      if (await check(fullDetails)) {
        output.push(fullDetails);
      }
      // if the file is a directory, recursively search the directory
      if (fullDetails.isDirectory)
        output = output.concat(await searchDir(fullPath, check));
    })
  );
  return output;
}
