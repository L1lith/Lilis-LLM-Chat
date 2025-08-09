const { BrowserWindow, app, ipcMain, session } = require("electron");
//const { autoUpdater } = require("electron-updater");
const { join, resolve, dirname } = require("path");
const openURL = require("./openURL");
const openExplorer = require("open-file-explorer");
const fs = require("fs/promises");
const { inspect } = require("util");
const crypto = require("crypto");
const { OpenAI } = require("openai");
const getLatestPackage = require("./getLatestPackage");

const { APPDATA, HOME, platform } = process.env;
userDataDirectory = join(
  APPDATA ||
    (platform == "darwin"
      ? HOME + "/Library/Preferences"
      : HOME + "/.local/share"),
  "Lili's LLM Chat"
);

function resolveSafePath(relativePath) {
  const fullPath = resolve(userDataDirectory, relativePath);
  if (!fullPath.startsWith(userDataDirectory)) {
    throw new Error("Access denied: Path outside allowed directory.");
  }
  return fullPath;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, "preload.js"),
    },
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("file://") || !url.includes("/app.asar/")) {
      event.preventDefault();
    }
  });

  win.loadFile(join(__dirname, "dist", "index.html"));
}

// 📖 Read file
ipcMain.handle("read-file", async (_, filename) => {
  const filePath = resolveSafePath(filename);
  return fs.readFile(filePath, "utf-8");
});

// 💾 Write file (recursive)
ipcMain.handle("write-file", async (_, filename, content) => {
  if (typeof content != "string")
    throw new Error("Expected file content to be a string");
  const filePath = resolveSafePath(filename);
  const dir = dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, content, "utf8");
  return true;
});

// 📁 List directory contents
ipcMain.handle("ls", async (_, dirPath = ".") => {
  const resolvedDir = resolveSafePath(dirPath);
  const entries = await fs.readdir(resolvedDir, { withFileTypes: true });

  return entries.map((entry) => ({
    name: entry.name,
    isFile: entry.isFile(),
    isDirectory: entry.isDirectory(),
  }));
});

// 🗑️ Remove file or directory
ipcMain.handle("rm", async (_, targetPath) => {
  const fullPath = resolveSafePath(targetPath);

  if (fullPath === userDataDirectory) {
    throw new Error("Cannot delete root user data directory.");
  }

  const stats = await fs.stat(fullPath);

  if (stats.isDirectory()) {
    await fs.rm(fullPath, { recursive: true, force: true });
  } else {
    await fs.unlink(fullPath);
  }

  return true;
});

// 🧱 Create directory (recursive)
ipcMain.handle("mkdir", async (_, dirPath) => {
  const fullDirPath = resolveSafePath(dirPath);
  await fs.mkdir(fullDirPath, { recursive: true });
  return true;
});

ipcMain.handle("stat", async (_, filePath) => {
  const fullPath = resolveSafePath(filePath);
  const stats = await fs.stat(fullPath);

  return {
    isFile: stats.isFile(),
    isDirectory: stats.isDirectory(),
    size: stats.size,
    mtime: stats.mtime, // Modified time
    ctime: stats.ctime, // Creation time
    atime: stats.atime, // Access time
  };
});
ipcMain.handle(
  "open-file-explorer",
  (_, path) =>
    new Promise((res, rej) => {
      openExplorer(resolveSafePath(path), (err) => {
        if (err) {
          rej(err);
        } else {
          res();
        }
      });
    })
);
ipcMain.handle("open-url", (_, urlIn) => openURL(urlIn));
ipcMain.handle("join", (_, ...args) => join(...args));
ipcMain.handle("inspect", (_, ...args) => inspect(...args));
ipcMain.handle("randomUUID", () => crypto.randomUUID());
ipcMain.handle("get-platform", () => process.platform);
ipcMain.handle("get-latest-package", (...args) => getLatestPackage(...args));
ipcMain.handle("openai-request", async (_event, apiConfig, method, ...args) => {
  console.log("Got OpenAI Request", apiConfig, method, args);
  const openAIConfig = {
    apiKey: apiConfig.key || apiConfig.apiKey,
    baseURL: apiConfig.URL || apiConfig.baseURL,
  };
  const openai = new OpenAI(openAIConfig);

  // Dynamically resolve method (e.g. "chat.completions.create")
  const methodParts = method.split(".");
  let target = openai;
  let parent = null;
  for (const part of methodParts) {
    if (!(part in target))
      throw new Error(`Invalid part "${part}" of method "${method}"`);
    parent = target;
    target = target[part];
  }

  if (typeof target !== "function") {
    throw new Error("Invalid OpenAI method");
  }

  const result = await target.call(parent || openai, ...args);
  return result;
});

const allowedProtocols = ["file://", "devtools://", "chrome-extension://"];

app.whenReady().then(async () => {
  // Prevents loading external websites for the benefit of security and user experience
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const url = details.url;
    if (allowedProtocols.some((protocol) => url.startsWith(protocol))) {
      return callback({ cancel: false });
    }
    return callback({ cancel: true });
  });
  await fs.mkdir(userDataDirectory, { recursive: true });
  createWindow();
  //autoUpdater.checkForUpdatesAndNotify();
});

// autoUpdater.on("error", (error) => {
//   console.error("There was an error updating the application:", error);
// });
