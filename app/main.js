const { BrowserWindow, app, ipcMain } = require("electron");
const { join, resolve, dirname } = require("path");
const openURL = require("./openURL");
const openExplorer = require("open-file-explorer");
const fs = require("fs/promises");
const { inspect } = require("util");
const crypto = require("crypto");
const { OpenAI } = require("openai");

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
    webPreferences: {
      preload: join(__dirname, "preload.js"),
    },
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
  const filePath = resolveSafePath(filename);
  const dir = dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, content, "utf-8");
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
ipcMain.handle("open-url", (_, url) => openURL(url));
ipcMain.handle("join", (_, ...args) => join(...args));
ipcMain.handle("inspect", (_, ...args) => inspect(...args));
ipcMain.handle("randomUUID", () => crypto.randomUUID());
ipcMain.handle("openai-request", async (_event, apiConfig, method, args) => {
  try {
    const openai = new OpenAI({
      apiKey: apiConfig.key || apiConfig.apiKey,
      baseURL: apiConfig.URL || apiConfig.baseURL,
    });

    // Dynamically resolve method (e.g. "chat.completions.create")
    const methodParts = method.split(".");
    let target = openai;
    for (const part of methodParts) {
      target = target[part];
    }

    if (typeof target !== "function") {
      throw new Error("Invalid OpenAI method");
    }

    const result = await target.call(openai, args);
    return { success: true, result };
  } catch (err) {
    console.error("OpenAI IPC error:", err);
    return { success: false, error: err.message };
  }
});

app.whenReady().then(async () => {
  await fs.mkdir(userDataDirectory, { recursive: true });
  createWindow();
});
