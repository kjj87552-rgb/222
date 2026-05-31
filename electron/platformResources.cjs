const path = require("node:path");

function platformResourceDir(options = {}) {
  const platform = String(options.platform || process.platform || "").trim();
  const arch = String(options.arch || process.arch || "").trim();
  if (platform === "win32" && arch === "x64") return "win32-x64";
  return `${platform || "unknown"}-${arch || "unknown"}`;
}

function ffmpegResourceSubdir(options = {}) {
  return path.join("tools", "ffmpeg", platformResourceDir(options)).replace(/\\/g, "/");
}

module.exports = {
  ffmpegResourceSubdir,
  platformResourceDir,
};
