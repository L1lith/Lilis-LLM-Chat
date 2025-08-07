import getDataDirectory from "./getDataDirectory";
import { format } from "date-fns";

export default async function saveError(error) {
  const { join } = require("path");
  const { mkdir, writeFile } = require("fs/promises");
  const { inspect } = require("util");
  const errorDirectory = join(getDataDirectory(), "errors");
  await mkdir(errorDirectory, { recursive: true });
  const crypto = require("crypto");

  console.log("got error", error, error instanceof Error);
  let outputString;
  if (error instanceof Error) {
    outputString = `~~~ Error Object:`;
    Object.getOwnPropertyNames(error).forEach((prop) => {
      outputString += `\n\n## Property "${prop}":\n` + inspect(error[prop]);
    });
  } else {
    outputString = "~~~ Error Data:\n" + inspect(error);
  }

  console.log(
    format(new Date(), "MMM do, Y HH-mma - ") + crypto.randomUUID() + ".txt"
  );
  const filePath = join(
    errorDirectory,
    format(new Date(), "MMM do, Y HH-mma - ") + crypto.randomUUID() + ".txt"
  );
  await writeFile(filePath, outputString);
}
