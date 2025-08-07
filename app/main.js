import { app, BrowserWindow } from "electron";
import path from "path";

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(import.meta.dirname, "preload.js"),
    },
  });

  win.loadFile(path.join(import.meta.dirname, "dist", "index.html"));
}

app.whenReady().then(createWindow);
