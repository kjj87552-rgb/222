const fs = require("node:fs");
const path = require("node:path");

const ALLOWED_PREFIXES = ["LIBAI_REFERENCE_"];
const CONFIG_FILENAMES = [".env", ".env.local", "reference-storage.env"];

function isAllowedKey(key) {
  return ALLOWED_PREFIXES.some((prefix) => key.startsWith(prefix));
}

function parseEnvContent(content) {
  const result = {};
  for (const rawLine of String(content || "").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const separator = line.indexOf("=");
    if (separator <= 0) continue;
    const key = line.slice(0, separator).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key) || !isAllowedKey(key)) continue;
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
}

function readEnvFile(filePath) {
  try {
    if (!filePath || !fs.existsSync(filePath)) return {};
    return parseEnvContent(fs.readFileSync(filePath, "utf8"));
  } catch (_) {
    return {};
  }
}

function loadReferenceStorageEnv({ rootDir, backendResourceDir, appDataDir, env = process.env } = {}) {
  const sources = [];
  if (rootDir) {
    for (const name of CONFIG_FILENAMES) {
      sources.push(path.join(rootDir, name));
    }
    sources.push(path.join(rootDir, "backend", "reference-storage.env"));
  }
  if (backendResourceDir) {
    sources.push(path.join(backendResourceDir, "reference-storage.env"));
  }
  if (appDataDir) {
    sources.push(path.join(appDataDir, "reference-storage.env"));
  }

  const loaded = {};
  for (const source of sources) {
    Object.assign(loaded, readEnvFile(source));
  }

  const result = {};
  for (const [key, value] of Object.entries(loaded)) {
    if (!isAllowedKey(key)) continue;
    if (env && Object.prototype.hasOwnProperty.call(env, key)) continue;
    result[key] = value;
  }
  return result;
}

module.exports = {
  loadReferenceStorageEnv,
  parseEnvContent,
};
