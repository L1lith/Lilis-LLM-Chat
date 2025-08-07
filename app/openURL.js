function openURL(url) {
  if (typeof url != "string") throw new Error("URL must be a string");
  const urlObj = new URL(url);
  console.log(url, urlObj);
  if (urlObj.protocol === "http:") urlObj.protocol = "https:";
  if (urlObj.protocol !== "https:") throw new Error("Invalid URL");
  var spawn = require("child_process").spawn;

  var command;

  switch (process.platform) {
    case "darwin":
      command = "open";
      break;
    case "win32":
      command = "explorer.exe";
      break;
    case "linux":
      command = "xdg-open";
      break;
    default:
      throw new Error("Unsupported platform: " + process.platform);
  }

  /**
   * Error handling is deliberately minimal, as this function is to be easy to use for shell scripting
   *
   * @param url The URL to open
   * @param callback A function with a single error argument. Optional.
   */

  return new Promise((resolve, reject) => {
    var child = spawn(command, [urlObj.href]);
    var errorText = "";
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", function (data) {
      errorText += data;
    });
    child.stderr.on("end", function () {
      if (errorText.length > 0) {
        var error = new Error(errorText);
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

module.exports = openURL;
