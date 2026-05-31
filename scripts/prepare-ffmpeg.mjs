import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const platformDir = process.platform === 'win32' && process.arch === 'x64'
  ? 'win32-x64'
  : `${process.platform}-${process.arch}`;
const targetDir = path.join(rootDir, 'tools', 'ffmpeg', platformDir);

function resolvePackageBinary(name) {
  if (name === 'ffmpeg') {
    const resolved = require('ffmpeg-static');
    return typeof resolved === 'string' ? resolved : '';
  }
  if (name === 'ffprobe') {
    const resolved = require('ffprobe-static');
    return resolved?.path || '';
  }
  return '';
}

function copyBinary(name) {
  const source = resolvePackageBinary(name);
  if (!source || !fs.existsSync(source)) {
    throw new Error(`Cannot resolve ${name} binary from npm package`);
  }
  const ext = process.platform === 'win32' ? '.exe' : '';
  const target = path.join(targetDir, `${name}${ext}`);
  fs.mkdirSync(targetDir, { recursive: true });
  fs.copyFileSync(source, target);
  fs.chmodSync(target, 0o755);
  return target;
}

const copied = [
  copyBinary('ffmpeg'),
  copyBinary('ffprobe'),
];

const manifest = {
  platform: process.platform,
  arch: process.arch,
  resourceDir: path.relative(rootDir, targetDir).replace(/\\/g, '/'),
  binaries: copied.map((filePath) => path.basename(filePath)),
  generatedAt: new Date().toISOString(),
  source: 'ffmpeg-static + ffprobe-static npm packages',
};

fs.writeFileSync(
  path.join(targetDir, 'manifest.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
  'utf8',
);

console.log(`Prepared bundled FFmpeg resources in ${path.relative(rootDir, targetDir)}`);
