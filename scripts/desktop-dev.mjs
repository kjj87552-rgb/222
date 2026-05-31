import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rendererUrl = "http://127.0.0.1:5177/";

function spawnCommand(command, args, options = {}) {
  return spawn(command, args, {
    cwd: rootDir,
    stdio: "inherit",
    ...options,
  });
}

async function isRendererReady() {
  try {
    const res = await fetch(rendererUrl);
    return res.ok;
  } catch (error) {
    return false;
  }
}

async function waitForRenderer(timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isRendererReady()) return;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Renderer did not become ready at ${rendererUrl}`);
}

const startedVite = !(await isRendererReady());
let viteProcess = null;

if (startedVite) {
  viteProcess = spawnCommand(process.execPath, [
    path.join(rootDir, "node_modules", "vite", "bin", "vite.js"),
    "--host",
    "127.0.0.1",
    "--port",
    "5177",
  ]);
}

await waitForRenderer();

const electronProcess = spawnCommand(process.execPath, [
  path.join(rootDir, "node_modules", "electron", "cli.js"),
  ".",
], {
  env: {
    ...process.env,
    LIBAI_RENDERER_URL: rendererUrl,
  },
});

function shutdown() {
  if (electronProcess && !electronProcess.killed) electronProcess.kill();
  if (viteProcess && !viteProcess.killed) viteProcess.kill();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

electronProcess.on("exit", (code) => {
  if (viteProcess && !viteProcess.killed) viteProcess.kill();
  process.exit(code ?? 0);
});
