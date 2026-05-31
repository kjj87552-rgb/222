/* Node utility functions — copied from src/app.jsx (authoritative source) */

export function isNodeEmptyForKind(node, kind) {
  if (!node || node.type !== kind) return false;
  if (kind === "image") return !node.src && !node.generating;
  if (kind === "video") return !node.poster && !node.videoSrc && !node.generating;
  if (kind === "audio") return !node.waveform && !node.audioSrc && !node.generating;
  if (kind === "text") return !node.body || !node.body.trim();
  return false;
}

export function inferNodeTypeFromFile(file, fallback) {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return fallback || "image";
}
