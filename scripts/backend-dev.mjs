import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { loadReferenceStorageEnv } = require('../electron/referenceStorageEnv.cjs');
const platformDir = process.platform === 'win32' && process.arch === 'x64'
  ? 'win32-x64'
  : `${process.platform}-${process.arch}`;
const ext = process.platform === 'win32' ? '.exe' : '';
const resourceDir = path.join(rootDir, 'tools', 'ffmpeg', platformDir);

function resolveBundledBinary(name) {
  const candidate = path.join(resourceDir, `${name}${ext}`);
  return fs.existsSync(candidate) ? candidate : '';
}

const port = process.env.LIBAI_BACKEND_PORT || '8765';
const ffmpegPath = resolveBundledBinary('ffmpeg');
const ffprobePath = resolveBundledBinary('ffprobe');
const appDataDir = process.env.LIBAI_APP_DATA_DIR
  || (process.env.APPDATA ? path.join(process.env.APPDATA, 'LibAI') : path.join(rootDir, '.codex-run', 'LibAI'));
const referenceStorageEnv = loadReferenceStorageEnv({
  rootDir,
  appDataDir,
  env: process.env,
});

const env = {
  ...process.env,
  ...referenceStorageEnv,
  LIBAI_APP_DATA_DIR: appDataDir,
  LIBAI_BACKEND_PORT: port,
  ...(ffmpegPath ? { LIBAI_FFMPEG_PATH: ffmpegPath } : {}),
  ...(ffprobePath ? { LIBAI_FFPROBE_PATH: ffprobePath } : {}),
  PYTHONUTF8: '1',
  PYTHONIOENCODING: 'utf-8',
};

const backend = spawn('python', [
  '-m',
  'uvicorn',
  'backend.app:app',
  '--host',
  '127.0.0.1',
  '--port',
  port,
], {
  cwd: rootDir,
  env,
  stdio: 'inherit',
  windowsHide: true,
});

backend.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});
