import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const platformDir = process.platform === 'win32' && process.arch === 'x64'
  ? 'win32-x64'
  : `${process.platform}-${process.arch}`;
const ext = process.platform === 'win32' ? '.exe' : '';
const resourceDir = path.join(rootDir, 'tools', 'ffmpeg', platformDir);
const binaries = [
  path.join(resourceDir, `ffmpeg${ext}`),
  path.join(resourceDir, `ffprobe${ext}`),
];

for (const binary of binaries) {
  if (!fs.existsSync(binary)) {
    throw new Error(`Missing bundled binary: ${path.relative(rootDir, binary)}`);
  }
  const result = spawnSync(binary, ['-version'], {
    cwd: rootDir,
    encoding: 'utf8',
    windowsHide: true,
  });
  if (result.status !== 0) {
    throw new Error(`${path.basename(binary)} failed -version: ${result.stderr || result.stdout}`);
  }
  const firstLine = String(result.stdout || result.stderr || '').split(/\r?\n/)[0];
  console.log(`${path.basename(binary)} OK: ${firstLine}`);
}
