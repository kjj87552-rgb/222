import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const mainProcess = readFileSync('electron/main.cjs', 'utf8');

describe('electron backend CORS origin', () => {
  it('passes the active renderer origin to the backend CORS allowlist', () => {
    expect(mainProcess).toContain('function rendererOriginForCors()');
    expect(mainProcess).toContain('new URL(process.env.LIBAI_RENDERER_URL || "http://127.0.0.1:5177/").origin');
    expect(mainProcess).toContain('LIBAI_CORS_ORIGINS: rendererOriginForCors()');
  });
});
