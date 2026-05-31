import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';

const mainProcess = readFileSync('electron/main.cjs', 'utf8');
const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

describe('electron app icon packaging', () => {
  it('uses the recovered desktop icon for the window, executable, and installer', () => {
    const iconPath = 'assets/app-icon.ico';
    const sourcePath = 'assets/app-icon-source.png';
    const expectedSourceHash = '5e70ce765ed28c3f7794ff61874a283771a078144ec1adeaec110f5625774d25';

    expect(mainProcess).toContain('function resolveAppIconPath');
    expect(mainProcess).toContain('icon: resolveAppIconPath()');
    expect(packageJson.build.icon).toBe(iconPath);
    expect(packageJson.build.win.icon).toBe(iconPath);
    expect(packageJson.build.nsis.installerIcon).toBe(iconPath);
    expect(packageJson.build.nsis.uninstallerIcon).toBe(iconPath);
    expect(packageJson.build.files).toEqual(expect.arrayContaining([iconPath]));
    expect(existsSync(iconPath)).toBe(true);
    expect([...readFileSync(iconPath).subarray(0, 4)]).toEqual([0, 0, 1, 0]);
    expect(existsSync(sourcePath)).toBe(true);
    expect(createHash('sha256').update(readFileSync(sourcePath)).digest('hex')).toBe(expectedSourceHash);
  });
});
