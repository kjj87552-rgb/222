import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { afterEach, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);

describe('download save directory memory', () => {
  const tempDirs = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  function makeDir(label = 'dir') {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), `libai-${label}-`));
    tempDirs.push(dir);
    return dir;
  }

  function fakeApp({ userDataDir, downloadsDir }) {
    return {
      getPath(name) {
        if (name === 'userData') return userDataDir;
        if (name === 'downloads') return downloadsDir;
        throw new Error(`Unexpected app path: ${name}`);
      },
    };
  }

  it('uses downloads first, then opens the next save dialog in the last successful save directory', () => {
    const {
      rememberSaveDirectory,
      resolveDefaultSavePath,
    } = require('../../electron/downloadSaveDirectory.cjs');
    const userDataDir = makeDir('userdata');
    const downloadsDir = makeDir('downloads');
    const chosenDir = makeDir('chosen');
    const app = fakeApp({ userDataDir, downloadsDir });

    expect(resolveDefaultSavePath(app, 'image.png')).toBe(path.join(downloadsDir, 'image.png'));

    expect(rememberSaveDirectory(app, path.join(chosenDir, 'image.png'))).toBe(true);

    expect(resolveDefaultSavePath(app, 'video.mp4')).toBe(path.join(chosenDir, 'video.mp4'));
  });

  it('falls back to downloads when the remembered directory is gone', () => {
    const {
      rememberSaveDirectory,
      resolveDefaultSavePath,
    } = require('../../electron/downloadSaveDirectory.cjs');
    const userDataDir = makeDir('userdata');
    const downloadsDir = makeDir('downloads');
    const chosenDir = makeDir('chosen');
    const app = fakeApp({ userDataDir, downloadsDir });

    rememberSaveDirectory(app, path.join(chosenDir, 'clip.mp4'));
    fs.rmSync(chosenDir, { recursive: true, force: true });

    expect(resolveDefaultSavePath(app, 'next.jpg')).toBe(path.join(downloadsDir, 'next.jpg'));
  });
});
