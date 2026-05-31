const fs = require("node:fs");
const path = require("node:path");

const PREFERENCES_FILENAME = "download-preferences.json";

function getAppPath(app, name) {
  try {
    return typeof app?.getPath === "function" ? app.getPath(name) : "";
  } catch (_) {
    return "";
  }
}

function preferencesFilePath(app) {
  const userDataDir = getAppPath(app, "userData");
  return userDataDir ? path.join(userDataDir, PREFERENCES_FILENAME) : "";
}

function directoryExists(directoryPath) {
  try {
    return Boolean(directoryPath && fs.existsSync(directoryPath) && fs.statSync(directoryPath).isDirectory());
  } catch (_) {
    return false;
  }
}

function readLastSaveDirectory(app) {
  const filePath = preferencesFilePath(app);
  if (!filePath || !fs.existsSync(filePath)) return "";
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const directoryPath = String(raw?.lastSaveDirectory || "").trim();
    return directoryExists(directoryPath) ? directoryPath : "";
  } catch (_) {
    return "";
  }
}

function resolveDefaultSavePath(app, filename) {
  const fallbackDirectory = getAppPath(app, "downloads") || process.cwd();
  const targetDirectory = readLastSaveDirectory(app) || fallbackDirectory;
  return path.join(targetDirectory, filename);
}

function rememberSaveDirectory(app, savedFilePath) {
  const filePath = preferencesFilePath(app);
  const directoryPath = savedFilePath ? path.dirname(savedFilePath) : "";
  if (!filePath || !directoryExists(directoryPath)) return false;
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(
      filePath,
      JSON.stringify({ lastSaveDirectory: directoryPath }, null, 2),
      "utf8",
    );
    return true;
  } catch (_) {
    return false;
  }
}

module.exports = {
  readLastSaveDirectory,
  rememberSaveDirectory,
  resolveDefaultSavePath,
};
