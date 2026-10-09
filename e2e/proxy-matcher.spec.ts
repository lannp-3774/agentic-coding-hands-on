import { AsyncLocalStorage } from 'node:async_hooks';
import { test, expect } from '@playwright/test';

/**
 * Technical-spec §4.6 — the proxy matcher scope, asked of Next's own matcher
 * (`unstable_doesMiddlewareMatch`, fed the real `config` exported by proxy.ts).
 * Every page route must reach the proxy (the gate lives there); `_next/*`,
 * `__nextjs*` and any path containing a dot (static files) must not.
 * The HTTP-level counterpart (matched routes redirect, assets do not, while the
 * gate is locked) lives in prelaunch-gate-guest-redirects.spec.ts.
 */
const MATCHED = ['/', '/login', '/awards-information', '/countdown', '/profile', '/auth/callback'];
const NOT_MATCHED = [
  '/_next/static/x.js',
  '/_next/image',
  '/favicon.ico',
  '/home/logo.png',
  '/__nextjs_original-stack-frame',
];

type DoesMatch = typeof import('next/experimental/testing/server.js').unstable_doesMiddlewareMatch;
type ProxyConfig = typeof import('../proxy').config;
let doesMatch: DoesMatch;
let config: ProxyConfig;

test.describe('proxy matcher scope (§4.6)', () => {
  test.beforeAll(async () => {
    // Next's server modules (proxy.ts pulls in next/server, and the matcher
    // helper) need the global AsyncLocalStorage that Next's own runtime provides;
    // plain Node does not, so supply it before importing either. Static imports
    // would run first and break every other spec loaded in the same worker.
    Object.assign(globalThis, { AsyncLocalStorage });
    ({ unstable_doesMiddlewareMatch: doesMatch } = await import(
      'next/experimental/testing/server.js'
    ));
    ({ config } = await import('../proxy'));
  });

  for (const url of MATCHED) {
    test(`proxy runs for ${url}`, () => {
      expect(doesMatch({ config, url })).toBe(true);
    });
  }

  for (const url of NOT_MATCHED) {
    test(`proxy does not run for ${url}`, () => {
      expect(doesMatch({ config, url })).toBe(false);
    });
  }
});
