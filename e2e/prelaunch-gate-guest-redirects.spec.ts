import { test, expect } from '@playwright/test';
import { lockGateFor, redirectPath, restorePrelaunchSeed } from './support/prelaunch-setting';

/**
 * FR-101, FR-102, FR-602, BR-004, DEC-001, US029, SC-001 — while the moment is
 * in the future a guest's GET/HEAD to any page route gets 307 /countdown (a
 * constant target: the query string is not echoed back). Exempt and unmatched
 * paths are untouched. Doubles as the HTTP proof of the matcher scope (§4.6):
 * matched routes redirect, `_next/*` and dotted paths never do.
 *
 * The "untouched" group (/login, /auth/callback, POST, assets, _next/*) also
 * passed before the gate was wired, by design: each guards against an
 * over-eager gate, and the redirect tests above them, run in the same locked
 * state, prove the gate is actually on. The row is restored after each test.
 */
test.describe('prelaunch-gate — guests while locked', () => {
  test.beforeEach(async () => {
    await lockGateFor(60 * 60 * 1000);
  });

  test.afterEach(async () => {
    await restorePrelaunchSeed();
  });

  for (const path of ['/', '/awards-information', '/profile']) {
    // /profile has no page yet on purpose: the gate answers before routing (spec edge case).
    test(`GET ${path} redirects to /countdown (307)`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });

      expect(response.status()).toBe(307);
      expect(redirectPath(response)).toBe('/countdown');
    });
  }

  test('HEAD / redirects to /countdown (307)', async ({ request }) => {
    const response = await request.head('/', { maxRedirects: 0 });

    expect(response.status()).toBe(307);
    expect(redirectPath(response)).toBe('/countdown');
  });

  test('the redirect target ignores the query string (BR-004, no open redirect)', async ({
    request,
  }) => {
    const response = await request.get('/?next=https://evil.example/&redirect_to=/profile', {
      maxRedirects: 0,
    });

    expect(response.status()).toBe(307);
    expect(redirectPath(response)).toBe('/countdown');
  });

  test('GET /countdown is served to a guest while locked (DEC-002)', async ({ request }) => {
    const response = await request.get('/countdown', { maxRedirects: 0 });

    expect(response.status()).toBe(200);
  });

  test('GET /login stays reachable (200, not redirected)', async ({ request }) => {
    const response = await request.get('/login', { maxRedirects: 0 });

    expect(response.status()).toBe(200);
  });

  test('GET /auth/callback without a code keeps its own redirect to /login?error=cancelled', async ({
    request,
  }) => {
    const response = await request.get('/auth/callback', { maxRedirects: 0 });

    expect(response.status()).toBe(302);
    expect(redirectPath(response)).toBe('/login?error=cancelled');
  });

  test('POST / is not redirected by the gate (Server Actions are exempt, BR-004)', async ({
    request,
  }) => {
    const response = await request.post('/', { maxRedirects: 0 });

    // The gate must not catch the POST; what Next answers is mode-dependent
    // (dev renders the page: 200, prod rejects a bodyless POST to a page: 405),
    // so assert the gate's own signature is absent, as for the `_next/*` cases.
    expect(response.status()).not.toBe(307);
    expect(response.headers()['location']).toBeUndefined();
  });

  for (const asset of ['/home/key-visual.png', '/favicon.ico']) {
    test(`static file ${asset} is served, not redirected`, async ({ request }) => {
      const response = await request.get(asset, { maxRedirects: 0 });

      expect(response.status()).toBe(200);
      expect(response.headers()['content-type']).toMatch(/^image\//);
    });
  }

  // Next answers these itself (404 / 400 / 400); the invariant is only that the
  // gate does not catch them: no 307 and no Location pointing at /countdown.
  for (const internal of [
    '/_next/static/chunks/does-not-exist.js',
    '/_next/image',
    '/__nextjs_original-stack-frames',
  ]) {
    test(`${internal} is not intercepted by the gate`, async ({ request }) => {
      const response = await request.get(internal, { maxRedirects: 0 });

      expect(response.status()).not.toBe(307);
      expect(response.headers()['location']).toBeUndefined();
    });
  }
});
