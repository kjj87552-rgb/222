import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);

describe('electron local asset protocol', () => {
  it('builds displayable libai-asset urls for Windows paths with unicode and reserved characters', () => {
    const { localAssetUrlFromPath, localPathFromLibaiAssetUrl } = require('../../electron/localAssetProtocol.cjs');

    const sourcePath = 'C:\\Users\\不够上心\\Pictures\\ai\\ScreenShot 1#2.png';
    const url = localAssetUrlFromPath(sourcePath);

    expect(url).toBe('libai-asset:///C:/Users/%E4%B8%8D%E5%A4%9F%E4%B8%8A%E5%BF%83/Pictures/ai/ScreenShot%201%232.png');
    expect(localPathFromLibaiAssetUrl(url)).toBe('C:/Users/不够上心/Pictures/ai/ScreenShot 1#2.png');
  });

  it('continues to decode old double-slash libai-asset urls', () => {
    const { localPathFromLibaiAssetUrl } = require('../../electron/localAssetProtocol.cjs');

    expect(localPathFromLibaiAssetUrl('libai-asset://C:/Users/%E4%B8%8D%E5%A4%9F%E4%B8%8A%E5%BF%83/Pictures/a.png'))
      .toBe('C:/Users/不够上心/Pictures/a.png');
  });

  it('preserves Windows UNC paths', () => {
    const { localAssetUrlFromPath, localPathFromLibaiAssetUrl } = require('../../electron/localAssetProtocol.cjs');

    const url = localAssetUrlFromPath('\\\\server\\share\\folder\\a.png');

    expect(url).toBe('libai-asset:////server/share/folder/a.png');
    expect(localPathFromLibaiAssetUrl(url)).toBe('//server/share/folder/a.png');
  });
});
