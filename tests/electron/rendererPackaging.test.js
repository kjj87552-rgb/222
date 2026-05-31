import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

function listBuiltTextFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const target = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return listBuiltTextFiles(target);
    return /\.(?:html|js|css)$/i.test(entry.name) && statSync(target).isFile() ? [target] : [];
  });
}

describe('electron renderer packaging', () => {
  it('configures Vite to emit relative asset paths for file:// Electron loading', () => {
    const viteConfig = readFileSync('vite.config.mjs', 'utf8');

    expect(viteConfig).toContain("base: './'");
  });

  it('does not block packaged renderer startup on remote font stylesheets', () => {
    const html = readFileSync('index.html', 'utf8');

    expect(html).not.toMatch(/fonts\.(?:googleapis|gstatic)\.com/i);
  });

  it('does not leave root-relative renderer assets in the current build output', () => {
    if (!existsSync('dist/index.html')) return;

    const html = readFileSync('dist/index.html', 'utf8');

    expect(html).not.toMatch(/\b(?:src|href)="\/(?:assets|favicon\.svg)\b/);
  });

  it('keeps public static assets relative so packaged file:// pages can load them', () => {
    const publicAssetPattern = /(?:url\(\s*['"]?|['"`])\/(?:ui-assets|style-library)\b/;
    const files = [
      'src/features/shell/styles.js',
      'src/shared/data/styleLibrary.js',
      'src/shared/store/styleLibraryStore.js',
    ];

    for (const file of files) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(publicAssetPattern);
    }
  });

  it('does not leave root-relative public static assets in the current build output', () => {
    const publicAssetPattern = /(?:url\(\s*['"]?|['"`])\/(?:ui-assets|style-library)\b/;

    for (const file of listBuiltTextFiles('dist')) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(publicAssetPattern);
    }
  });
});
