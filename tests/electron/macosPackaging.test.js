import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

describe('macOS desktop packaging', () => {
  it('defines macOS package scripts without changing the Windows build entrypoints', () => {
    expect(packageJson.scripts['backend:package']).toContain('scripts/build-backend-win.ps1');
    expect(packageJson.scripts['desktop:build']).toContain('scripts/package-win.ps1');
    expect(packageJson.scripts['backend:package:mac']).toBe('bash scripts/build-backend-mac.sh');
    expect(packageJson.scripts['desktop:build:mac']).toBe('bash scripts/package-mac.sh');
    expect(packageJson.scripts['icon:mac']).toBe('bash scripts/create-mac-icon.sh');
  });

  it('configures electron-builder to produce unsigned testable macOS dmg and zip artifacts', () => {
    expect(packageJson.build.mac).toEqual(expect.objectContaining({
      target: ['dmg', 'zip'],
      icon: 'assets/app-icon.icns',
      category: 'public.app-category.productivity',
    }));
    expect(packageJson.build.files).toEqual(expect.arrayContaining([
      'assets/app-icon.icns',
    ]));
  });

  it('ships a macOS GitHub Actions workflow that uploads installer artifacts', () => {
    const workflowPath = '.github/workflows/build-mac.yml';
    expect(existsSync(workflowPath)).toBe(true);

    const workflow = readFileSync(workflowPath, 'utf8');
    expect(workflow).toContain('runs-on: macos-latest');
    expect(workflow).toContain('npm ci');
    expect(workflow).toContain('npm run desktop:build:mac');
    expect(workflow).toContain('actions/upload-artifact@v4');
    expect(workflow).toContain('release/*.dmg');
    expect(workflow).toContain('release/*.zip');
  });
});
