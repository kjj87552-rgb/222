import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';

const rootDir = path.resolve(__dirname, '..', '..');

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
}

describe('VSR local runtime bundling', () => {
  test('does not include or inject local VSR resources', () => {
    const packageJson = JSON.parse(readProjectFile('package.json'));
    const packageWinScript = readProjectFile('scripts/package-win.ps1');
    const backendDevScript = readProjectFile('scripts/backend-dev.mjs');
    const electronMain = readProjectFile('electron/main.cjs');
    const subtitleCanvas = readProjectFile('src/app/subtitleRemovalCanvas.js');
    const subtitleModal = readProjectFile('src/features/modals/video-edit/VideoSubtitleRemoveModal.jsx');

    expect(packageJson.scripts).not.toHaveProperty('vsr:check');
    expect(JSON.stringify(packageJson.build.extraResources || [])).not.toContain('tools/vsr');
    expect(packageWinScript).not.toContain('vsr:check');
    expect(backendDevScript).not.toContain('LIBAI_VSR_DIR');
    expect(backendDevScript).not.toContain("tools', 'vsr");
    expect(electronMain).not.toContain('LIBAI_VSR_DIR');
    expect(electronMain).not.toContain('VSR_RESOURCE_SUBDIR');
    expect(electronMain).not.toContain('tools/vsr');
    expect(subtitleCanvas).not.toContain('VSR CPU');
    expect(subtitleModal).not.toContain('VSR CPU');
  });
});
