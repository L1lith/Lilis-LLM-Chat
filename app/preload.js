const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronPath", {});

contextBridge.exposeInMainWorld("electronAPI", {
  readFile: (filename) => ipcRenderer.invoke("read-file", filename),
  writeFile: (filename, content) =>
    ipcRenderer.invoke("write-file", filename, content),
  ls: (dirPath) => ipcRenderer.invoke("ls", dirPath),
  rm: (path) => ipcRenderer.invoke("rm", path),
  mkdir: (dirPath) => ipcRenderer.invoke("mkdir", dirPath),
  stat: (filePath) => ipcRenderer.invoke("stat", filePath), // 👈 new method
  openExplorer: (path) => ipcRenderer.invoke("open-file-explorer", path),
  openURL: (url) => ipcRenderer.invoke("open-url", url),
  join: (...args) => ipcRenderer.invoke("join", ...args),
  inspect: (...args) => ipcRenderer.invoke("inspect", ...args),
  randomUUID: () => ipcRenderer.invoke("randomUUID"),
  openAIRequest: (apiConfig, method, ...args) =>
    ipcRenderer.invoke("openai-request", apiConfig, method, ...args),
  getPlatform: () => ipcRenderer.invoke("get-platform"),
});
