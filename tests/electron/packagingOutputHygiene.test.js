import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
const packageScript = readFileSync('scripts/package-win.ps1', 'utf8');

describe('electron packaging output hygiene', () => {
  it('keeps electron-builder output separate from the Vite renderer dist', () => {
    expect(packageJson.build.directories?.output).toBe('release');
    expect(packageJson.build.files).toEqual(expect.arrayContaining(['dist/**/*']));
    expect(packageJson.build.files).not.toEqual(expect.arrayContaining(['release/**/*']));
    expect(packageScript).toContain('$rendererOutputDir = Join-Path $rootDir "dist"');
    expect(packageScript).toContain('$electronOutputDir = Join-Path $rootDir "release"');
    expect(packageScript).toContain('Remove-WorkspaceChild $rendererOutputDir');
    expect(packageScript).toContain('Remove-WorkspaceChild $electronOutputDir');
  });

  it('uses an explicit NSIS wizard configuration for a normal guided installer', () => {
    expect(packageJson.build.artifactName).toBe('libai-canvas-setup-${version}.${ext}');
    expect(packageJson.build.nsis.oneClick).toBe(false);
    expect(packageJson.build.nsis.allowToChangeInstallationDirectory).toBe(true);
    expect(packageJson.build.nsis.createDesktopShortcut).toBe(true);
    expect(packageJson.build.nsis.createStartMenuShortcut).toBe(true);
    expect(packageJson.build.nsis.shortcutName).toBe('漫创AI');
    expect(packageJson.build.nsis.unicode).toBe(true);
  });
});
