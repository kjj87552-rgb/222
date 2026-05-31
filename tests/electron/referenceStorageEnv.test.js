import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { afterEach, describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);

describe('reference storage environment loading', () => {
  const tempDirs = [];

  afterEach(() => {
    for (const dir of tempDirs.splice(0)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  function makeDir() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'libai-reference-storage-'));
    tempDirs.push(dir);
    return dir;
  }

  it('loads Rainyun S3 credentials from app data config without overriding process env', () => {
    const { loadReferenceStorageEnv } = require('../../electron/referenceStorageEnv.cjs');
    const rootDir = makeDir();
    const appDataDir = makeDir();
    fs.writeFileSync(
      path.join(appDataDir, 'reference-storage.env'),
      [
        'LIBAI_REFERENCE_IMAGE_S3_ENDPOINT=https://cn-nb1.rains3.com',
        'LIBAI_REFERENCE_IMAGE_S3_BUCKET=rain-bucket',
        'LIBAI_REFERENCE_IMAGE_S3_ACCESS_KEY=rain-access',
        'LIBAI_REFERENCE_IMAGE_S3_SECRET_KEY=rain-secret',
        'LIBAI_REFERENCE_IMAGE_S3_PREFIX=libai/reference-images',
        'OTHER_SECRET=must-not-load',
      ].join('\n'),
      'utf8',
    );

    const env = loadReferenceStorageEnv({
      rootDir,
      appDataDir,
      env: { LIBAI_REFERENCE_IMAGE_S3_BUCKET: 'explicit-bucket' },
    });

    expect(env).toMatchObject({
      LIBAI_REFERENCE_IMAGE_S3_ENDPOINT: 'https://cn-nb1.rains3.com',
      LIBAI_REFERENCE_IMAGE_S3_ACCESS_KEY: 'rain-access',
      LIBAI_REFERENCE_IMAGE_S3_SECRET_KEY: 'rain-secret',
      LIBAI_REFERENCE_IMAGE_S3_PREFIX: 'libai/reference-images',
    });
    expect(env.LIBAI_REFERENCE_IMAGE_S3_BUCKET).toBeUndefined();
    expect(env.OTHER_SECRET).toBeUndefined();
  });

  it('loads generic object storage credentials for Tencent COS', () => {
    const { loadReferenceStorageEnv } = require('../../electron/referenceStorageEnv.cjs');
    const rootDir = makeDir();
    const appDataDir = makeDir();
    fs.writeFileSync(
      path.join(appDataDir, 'reference-storage.env'),
      [
        'LIBAI_REFERENCE_STORAGE_PROVIDER=tencent-cos',
        'LIBAI_REFERENCE_STORAGE_S3_ENDPOINT=https://cos.ap-guangzhou.myqcloud.com',
        'LIBAI_REFERENCE_STORAGE_BUCKET=libai-1250000000',
        'LIBAI_REFERENCE_STORAGE_ACCESS_KEY=cos-access',
        'LIBAI_REFERENCE_STORAGE_SECRET_KEY=cos-secret',
        'LIBAI_REFERENCE_STORAGE_IMAGE_PREFIX=libai/reference-images',
        'OTHER_SECRET=must-not-load',
      ].join('\n'),
      'utf8',
    );

    const env = loadReferenceStorageEnv({
      rootDir,
      appDataDir,
      env: { LIBAI_REFERENCE_STORAGE_BUCKET: 'explicit-bucket' },
    });

    expect(env).toMatchObject({
      LIBAI_REFERENCE_STORAGE_PROVIDER: 'tencent-cos',
      LIBAI_REFERENCE_STORAGE_S3_ENDPOINT: 'https://cos.ap-guangzhou.myqcloud.com',
      LIBAI_REFERENCE_STORAGE_ACCESS_KEY: 'cos-access',
      LIBAI_REFERENCE_STORAGE_SECRET_KEY: 'cos-secret',
      LIBAI_REFERENCE_STORAGE_IMAGE_PREFIX: 'libai/reference-images',
    });
    expect(env.LIBAI_REFERENCE_STORAGE_BUCKET).toBeUndefined();
    expect(env.OTHER_SECRET).toBeUndefined();
  });

  it('lets app data config override project local config for reference storage keys', () => {
    const { loadReferenceStorageEnv } = require('../../electron/referenceStorageEnv.cjs');
    const rootDir = makeDir();
    const appDataDir = makeDir();
    fs.writeFileSync(
      path.join(rootDir, '.env.local'),
      'LIBAI_REFERENCE_IMAGE_S3_ENDPOINT=https://root.example.test\n',
      'utf8',
    );
    fs.writeFileSync(
      path.join(appDataDir, 'reference-storage.env'),
      'LIBAI_REFERENCE_IMAGE_S3_ENDPOINT=https://appdata.example.test\n',
      'utf8',
    );

    const env = loadReferenceStorageEnv({ rootDir, appDataDir, env: {} });

    expect(env.LIBAI_REFERENCE_IMAGE_S3_ENDPOINT).toBe('https://appdata.example.test');
  });

  it('loads packaged backend reference storage config before app data overrides', () => {
    const { loadReferenceStorageEnv } = require('../../electron/referenceStorageEnv.cjs');
    const rootDir = makeDir();
    const backendResourceDir = makeDir();
    const appDataDir = makeDir();
    fs.writeFileSync(
      path.join(backendResourceDir, 'reference-storage.env'),
      [
        'LIBAI_REFERENCE_IMAGE_S3_ENDPOINT=https://backend.example.test',
        'LIBAI_REFERENCE_IMAGE_S3_BUCKET=backend-bucket',
        'LIBAI_REFERENCE_IMAGE_S3_PREFIX=backend-prefix',
      ].join('\n'),
      'utf8',
    );
    fs.writeFileSync(
      path.join(appDataDir, 'reference-storage.env'),
      'LIBAI_REFERENCE_IMAGE_S3_PREFIX=appdata-prefix\n',
      'utf8',
    );

    const env = loadReferenceStorageEnv({ rootDir, backendResourceDir, appDataDir, env: {} });

    expect(env.LIBAI_REFERENCE_IMAGE_S3_ENDPOINT).toBe('https://backend.example.test');
    expect(env.LIBAI_REFERENCE_IMAGE_S3_BUCKET).toBe('backend-bucket');
    expect(env.LIBAI_REFERENCE_IMAGE_S3_PREFIX).toBe('appdata-prefix');
  });
});
