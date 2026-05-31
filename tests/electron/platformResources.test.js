import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);

describe('electron platform resources', () => {
  it('keeps the current Windows ffmpeg resource directory stable', () => {
    const { ffmpegResourceSubdir, platformResourceDir } = require('../../electron/platformResources.cjs');

    expect(platformResourceDir({ platform: 'win32', arch: 'x64' })).toBe('win32-x64');
    expect(ffmpegResourceSubdir({ platform: 'win32', arch: 'x64' })).toBe('tools/ffmpeg/win32-x64');
  });

  it('resolves macOS ffmpeg resources by runner architecture', () => {
    const { ffmpegResourceSubdir, platformResourceDir } = require('../../electron/platformResources.cjs');

    expect(platformResourceDir({ platform: 'darwin', arch: 'arm64' })).toBe('darwin-arm64');
    expect(platformResourceDir({ platform: 'darwin', arch: 'x64' })).toBe('darwin-x64');
    expect(ffmpegResourceSubdir({ platform: 'darwin', arch: 'arm64' })).toBe('tools/ffmpeg/darwin-arm64');
  });
});
