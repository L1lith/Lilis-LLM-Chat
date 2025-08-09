import { format } from "date-fns";
import pkg from "../../package.json" with {type: 'json'}
import {mkdir, writeFile, join, randomUUID, getPlatform, inspect} from '../functions/fs'

export default async function saveError(error) {
  const errorDirectory = "errors";
  await mkdir(errorDirectory, { recursive: true });

  console.error(error)
  let outputString;
  if (error instanceof Error) {
    outputString = `~~~ Error Object:`;
    Object.getOwnPropertyNames(error).forEach((prop) => {
      outputString += `\n\n## Property "${prop}":\n` + typeof error[prop] == 'string' ? '"'+ error[prop] + '"' : inspect(error[prop]);
    });
  } else if (typeof error == "string"){
    outputString = "~~~ Error String:\n" + error
  } else {
    outputString = "~~~ Error Data:\n" + inspect(error);
  }

  outputString += `\n\n~~~ Debug Info:\nOperating System: ${getPlatform()}\nApp Version: ${pkg.version}\nOccurred: ${Date.now()}`;
  const filePath = await join(
    errorDirectory,
    format(new Date(), "MMM do, Y HH-mma - ") + randomUUID() + ".txt"
  );
  await writeFile(filePath, outputString);
}
