import { test, expect, type APIRequestContext } from '@playwright/test';
import { APP_ORIGIN, lockGateFor, redirectPath, restorePrelaunchSeed } from './support/prelaunch-setting';
import { ensureUser, sessionCookies } from './support/supabase-session';

/**
 * FR-103, FR-601, BR-003, DEC-001, DEC-002, US030, SC-002 — while locked, only
 * a verified session whose profiles.role is exactly `admin` passes the gate;
 * a plain user, a guest and a request carrying garbage auth cookies are all
 * sent to /countdown. /login keeps its own rule (signed in -> 307 /).
 * The row is restored after each test.
 *
 * Each "admin passes" test first asserts, in the same locked state, that a
 * guest is redirected: without that control, a gate that was never wired would
 * also answer 200 and the test would prove nothing.
 */
const PASSWORD = 'password123';

async function signIn(role: 'admin' | 'user') {
  const email = `gate-${role}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
  await ensureUser(email, PASSWORD, role);
  return sessionCookies(email, PASSWORD, APP_ORIGIN);
}

function cookieHeader(cookies: { name: string; value: string }[]) {
  return { Cookie: cookies.map((c) => `${c.name}=${c.value}`).join('; ') };
}

async function expectGuestRedirected(request: APIRequestContext, path: string) {
  const guest = await request.get(path, { maxRedirects: 0 });
  expect(guest.status()).toBe(307);
  expect(redirectPath(guest)).toBe('/countdown');
}

test.describe('prelaunch-gate — roles while locked', () => {
  test.beforeEach(async () => {
    await lockGateFor(60 * 60 * 1000);
  });

  test.afterEach(async () => {
    await restorePrelaunchSeed();
  });

  for (const path of ['/', '/awards-information']) {
    test(`admin gets ${path} (200) while a guest is redirected`, async ({ request }) => {
      const headers = cookieHeader(await signIn('admin'));
      await expectGuestRedirected(request, path);

      const response = await request.get(path, { maxRedirects: 0, headers });

      expect(response.status()).toBe(200);
    });
  }

  test('admin is served /countdown while locked (DEC-002: every role)', async ({ request }) => {
    const headers = cookieHeader(await signIn('admin'));

    const response = await request.get('/countdown', { maxRedirects: 0, headers });

    expect(response.status()).toBe(200);
  });

  test('user (role=user) is redirected to /countdown', async ({ request }) => {
    const headers = cookieHeader(await signIn('user'));

    const response = await request.get('/', { maxRedirects: 0, headers });

    expect(response.status()).toBe(307);
    expect(redirectPath(response)).toBe('/countdown');
  });

  test('signed-in user opening /login is sent to / by the existing rule, not to /countdown', async ({
    request,
  }) => {
    const headers = cookieHeader(await signIn('user'));

    const response = await request.get('/login', { maxRedirects: 0, headers });

    expect(response.status()).toBe(307);
    expect(redirectPath(response)).toBe('/');
  });

  test('junk values in the real auth cookies are treated as a guest', async ({ request }) => {
    // Same cookie names the app uses, so the proxy really tries to parse them.
    const cookies = await signIn('admin');
    const junk = cookies.map((c) => ({ name: c.name, value: 'junk' }));

    const response = await request.get('/', { maxRedirects: 0, headers: cookieHeader(junk) });

    expect(response.status()).toBe(307);
    expect(redirectPath(response)).toBe('/countdown');
  });
});
