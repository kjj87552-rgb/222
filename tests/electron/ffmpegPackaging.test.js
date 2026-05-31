import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const mainProcess = readFileSync('electron/main.cjs', 'utf8');
const backendDevScript = readFileSync('scripts/backend-dev.mjs', 'utf8');
const backendApp = readFileSync('backend/app.py', 'utf8');
const backendRequirements = readFileSync('backend/requirements.txt', 'utf8');
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

describe('electron ffmpeg packaging', () => {
  it('resolves bundled ffmpeg binaries before falling back to PATH', () => {
    expect(mainProcess).toContain('function resolveBundledExecutable');
    expect(mainProcess).toContain('ffmpegResourceSubdir');
    expect(mainProcess).toContain('process.resourcesPath');
    expect(mainProcess).toContain('LIBAI_FFMPEG_PATH');
    expect(mainProcess).toContain('LIBAI_FFPROBE_PATH');
  });

  it('injects resolved ffmpeg paths into the backend process environment', () => {
    expect(mainProcess).toContain('const ffmpegRuntime = resolveFfmpegRuntime()');
    expect(mainProcess).toContain('const referenceStorageEnv = loadReferenceStorageEnv({');
    expect(mainProcess).toContain('...referenceStorageEnv');
    expect(mainProcess).toContain('...(ffmpegRuntime.ffmpegPath ? { LIBAI_FFMPEG_PATH: ffmpegRuntime.ffmpegPath } : {})');
    expect(mainProcess).toContain('...(ffmpegRuntime.ffprobePath ? { LIBAI_FFPROBE_PATH: ffmpegRuntime.ffprobePath } : {})');
  });

  it('defines a repeatable ffmpeg resource preparation and package resource contract', () => {
    expect(packageJson.scripts['ffmpeg:prepare']).toBe('node scripts/prepare-ffmpeg.mjs');
    expect(packageJson.scripts['ffmpeg:check']).toBe('node scripts/check-ffmpeg.mjs');
    expect(packageJson.scripts['backend:dev']).toBe('node scripts/backend-dev.mjs');
    expect(packageJson.build.extraResources).toEqual(expect.arrayContaining([
      expect.objectContaining({
        from: 'tools/ffmpeg',
        to: 'tools/ffmpeg',
      }),
    ]));
  });

  it('runs the browser development backend with bundled ffmpeg binaries', () => {
    expect(backendDevScript).toContain("const port = process.env.LIBAI_BACKEND_PORT || '8765'");
    expect(backendDevScript).toContain("LIBAI_FFMPEG_PATH");
    expect(backendDevScript).toContain("LIBAI_FFPROBE_PATH");
    expect(backendDevScript).toContain("PYTHONUTF8: '1'");
    expect(backendDevScript).toContain("'--port'");
  });

  it('packages and starts the desktop backend without relying on system python in production', () => {
    expect(mainProcess).toContain('function resolvePackagedBackendExecutable');
    expect(mainProcess).toContain('libai-backend.exe');
    expect(mainProcess).toContain('const backendResourceDir = resolveBackendResourceDir()');
    expect(mainProcess).toContain('backendCommand = resolvePackagedBackendExecutable()');
    expect(mainProcess).toContain('childProcess.spawn(backendCommand, backendArgs');
    expect(packageJson.scripts['backend:package']).toContain('scripts/build-backend-win.ps1');
    expect(packageJson.scripts['desktop:build']).toContain('scripts/package-win.ps1');
    expect(packageJson.scripts['backend:package:mac']).toContain('scripts/build-backend-mac.sh');
    expect(packageJson.scripts['desktop:build:mac']).toContain('scripts/package-mac.sh');
    expect(packageJson.build.extraResources).toEqual(expect.arrayContaining([
      expect.objectContaining({
        from: 'build/backend',
        to: 'backend',
      }),
    ]));
  });

  it('includes FastAPI multipart runtime dependency when backend has form uploads', () => {
    expect(backendApp).toContain('UploadFile');
    expect(backendApp).toContain('File(');
    expect(backendApp).toContain('Form(');
    expect(backendRequirements).toMatch(/^python-multipart==/m);
  });
});
