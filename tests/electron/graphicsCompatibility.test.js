import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);

describe('electron graphics compatibility', () => {
  it('does not alter graphics settings by default on Windows', () => {
    const { configureGraphicsCompatibility } = require('../../electron/graphicsCompatibility.cjs');
    const app = {
      commandLine: {
        appendSwitch: vi.fn(),
      },
      disableHardwareAcceleration: vi.fn(),
    };

    const result = configureGraphicsCompatibility(app, {
      platform: 'win32',
      env: {},
    });

    expect(result).toEqual({ enabled: false, reason: 'not-requested' });
    expect(app.commandLine.appendSwitch).not.toHaveBeenCalled();
    expect(app.disableHardwareAcceleration).not.toHaveBeenCalled();
  });

  it('enables safe graphics mode on Windows when explicitly requested by environment', () => {
    const { configureGraphicsCompatibility } = require('../../electron/graphicsCompatibility.cjs');
    const app = {
      commandLine: {
        appendSwitch: vi.fn(),
      },
      disableHardwareAcceleration: vi.fn(),
    };

    const result = configureGraphicsCompatibility(app, {
      platform: 'win32',
      env: { LIBAI_SAFE_GRAPHICS: '1' },
    });

    expect(result).toEqual({ enabled: true, reason: 'windows-safe-graphics' });
    expect(app.commandLine.appendSwitch).toHaveBeenCalledWith('disable-features', 'DirectComposition');
    expect(app.disableHardwareAcceleration).toHaveBeenCalledTimes(1);
  });

  it('enables safe graphics mode on Windows when explicitly requested by launch argument', () => {
    const { configureGraphicsCompatibility } = require('../../electron/graphicsCompatibility.cjs');
    const app = {
      commandLine: {
        appendSwitch: vi.fn(),
      },
      disableHardwareAcceleration: vi.fn(),
    };

    const result = configureGraphicsCompatibility(app, {
      platform: 'win32',
      env: {},
      argv: ['app.exe', '--libai-safe-graphics'],
    });

    expect(result).toEqual({ enabled: true, reason: 'windows-safe-graphics' });
    expect(app.commandLine.appendSwitch).toHaveBeenCalledWith('disable-features', 'DirectComposition');
    expect(app.disableHardwareAcceleration).toHaveBeenCalledTimes(1);
  });

  it('does not alter graphics settings outside Windows', () => {
    const { configureGraphicsCompatibility } = require('../../electron/graphicsCompatibility.cjs');
    const app = {
      commandLine: {
        appendSwitch: vi.fn(),
      },
      disableHardwareAcceleration: vi.fn(),
    };

    const result = configureGraphicsCompatibility(app, {
      platform: 'darwin',
      env: {},
    });

    expect(result).toEqual({ enabled: false, reason: 'non-windows' });
    expect(app.commandLine.appendSwitch).not.toHaveBeenCalled();
    expect(app.disableHardwareAcceleration).not.toHaveBeenCalled();
  });

  it('allows safe graphics mode to be disabled for diagnostics', () => {
    const { configureGraphicsCompatibility } = require('../../electron/graphicsCompatibility.cjs');
    const app = {
      commandLine: {
        appendSwitch: vi.fn(),
      },
      disableHardwareAcceleration: vi.fn(),
    };

    const result = configureGraphicsCompatibility(app, {
      platform: 'win32',
      env: { LIBAI_DISABLE_SAFE_GRAPHICS: '1' },
    });

    expect(result).toEqual({ enabled: false, reason: 'disabled-by-env' });
    expect(app.commandLine.appendSwitch).not.toHaveBeenCalled();
    expect(app.disableHardwareAcceleration).not.toHaveBeenCalled();
  });

  it('applies the graphics compatibility switches before app.whenReady()', () => {
    const mainProcess = readFileSync('electron/main.cjs', 'utf8');
    const configureIndex = mainProcess.indexOf('configureGraphicsCompatibility(app);');
    const whenReadyIndex = mainProcess.indexOf('app.whenReady()');

    expect(configureIndex).toBeGreaterThan(-1);
    expect(whenReadyIndex).toBeGreaterThan(-1);
    expect(configureIndex).toBeLessThan(whenReadyIndex);
  });
});
