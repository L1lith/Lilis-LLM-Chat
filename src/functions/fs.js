/**
 * Reads a UTF-8 file from userDataDirectory via IPC
 * @param {string} filename - Relative path inside userDataDirectory
 * @returns {Promise<string>} File content
 */
export async function readFile(filename) {
  return await window.electronAPI.readFile(filename);
}

/**
 * Writes a UTF-8 file to userDataDirectory via IPC
 * @param {string} filename - Relative path
 * @param {string} content - File content
 * @returns {Promise<void>}
 */
export async function writeFile(filename, content) {
  await window.electronAPI.writeFile(filename, content);
}

/**
 * Lists contents of a directory inside userDataDirectory via IPC
 * @param {string} dirPath - Relative path
 * @returns {Promise<Array<{name: string, isFile: boolean, isDirectory: boolean}>>}
 */
export async function readdir(dirPath = ".") {
  return await window.electronAPI.ls(dirPath);
}

/**
 * Removes a file or directory inside userDataDirectory via IPC
 * @param {string} targetPath - Relative path
 * @returns {Promise<void>}
 */
export async function rm(targetPath) {
  await window.electronAPI.rm(targetPath);
}

/**
 * Creates a directory (recursively) inside userDataDirectory via IPC
 * @param {string} dirPath - Relative path
 * @returns {Promise<void>}
 */
export async function mkdir(dirPath) {
  await window.electronAPI.mkdir(dirPath);
}

export async function stat(filePath) {
  return await window.electronAPI.stat(filePath);
}

export function join(...args) {
  return window.electronAPI.join(...args);
}

export function randomUUID() {
  return window.electronAPI.randomUUID();
}

export function inspect() {
  return window.electronAPI.inspect();
}

export function openExplorer(path) {
  return window.electronAPI.openExplorer(path);
}

export function openURL(url) {
  return window.electronAPI.openURL(url);
}

export function openAIRequest(...args) {
  return window.electronAPI.openAIRequest(...args);
}

export function getPlatform() {
  return window.electronAPI.getPlatform();
}
