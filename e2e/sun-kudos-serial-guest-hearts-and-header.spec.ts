import { test, expect } from '@playwright/test';
import { KUDOS_BY_N } from './support/kudos-board-seed';
import { readLikeCount } from './support/kudos-board-db';
import {
  countLikesOf, deleteGuestsCreatedSince, onlyAnonymousUserSince, windowStart,
} from './support/guest-anonymous-db';
import { BOARD_URL, countText, feedHeart } from './support/guest-anonymous-ui';

/**
 * Guests act as Anonymous (clarifications 2026-10-14; supersedes F007 "guest heart → /login").
 * A guest's first heart click creates the anonymous session server-side and likes; the
 * cookies keep that session, so a reload stays liked. The header still means "logged-in
 * account": an anonymous guest keeps the Login link and gets no account menu or bell.
 * Serial project: likes move shared counters; afterEach deletes every anonymous user created
 * during the test with its likes and guest Sunner (the like trigger restores like_count).
 */
const K60 = KUDOS_BY_N(60); // newest card, sent by Lê Kiều Trang, never by the guest
let startedAt = '';

test.describe('Sun* Kudos — guest hearts and header (serial)', () => {
  test.beforeEach(() => {
    startedAt = windowStart();
  });

  test.afterEach(async () => {
    await deleteGuestsCreatedSince(startedAt);
  });

  test('guest heart: red, count +1, stays on /sun-kudos; a reload keeps it liked (same session)', async ({ page, context }) => {
    const base = await readLikeCount(K60.id);
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    const heart = feedHeart(page, 60);
    await expect(heart).toHaveAttribute('aria-pressed', 'false');
    await expect(heart).toHaveText(countText(base));

    await heart.click();

    await expect(heart, "a guest's heart click likes the kudos (red), no /login").toHaveAttribute('aria-pressed', 'true');
    await expect(heart).toHaveText(countText(base + 1));
    await expect(page).toHaveURL(BOARD_URL);
    await expect.poll(() => readLikeCount(K60.id), 'like_count +1 in the DB').toBe(base + 1);
    const guestUid = await onlyAnonymousUserSince(startedAt);
    expect(await countLikesOf(guestUid, K60.id), 'the like belongs to the anonymous user').toBe(1);
    const authCookies = (await context.cookies()).filter((c) => /^sb-.*-auth-token/.test(c.name));
    expect(authCookies.length, 'the anonymous session is kept in cookies').toBeGreaterThan(0);

    await page.reload({ waitUntil: 'networkidle' });

    await expect(feedHeart(page, 60), 'still liked after a reload').toHaveAttribute('aria-pressed', 'true');
    await expect(feedHeart(page, 60)).toHaveText(countText(base + 1));
    expect(await onlyAnonymousUserSince(startedAt), 'the reload reused the same anonymous session').toBe(guestUid);
  });

  test('header: with an anonymous session the header still shows Login, no account menu or bell', async ({ page }) => {
    await page.goto('/sun-kudos', { waitUntil: 'networkidle' });
    await feedHeart(page, 60).click();
    await expect(feedHeart(page, 60), "the guest's first heart click creates the anonymous session")
      .toHaveAttribute('aria-pressed', 'true');
    await onlyAnonymousUserSince(startedAt);

    await page.reload({ waitUntil: 'networkidle' });
    await expect(feedHeart(page, 60), 'the session is active on the reloaded page').toHaveAttribute('aria-pressed', 'true');

    const header = page.getByRole('banner');
    const login = header.getByRole('link', { name: /^(Đăng nhập|Login)$/ });
    await expect(login, 'an anonymous guest still sees the Login link').toBeVisible();
    await expect(login).toHaveAttribute('href', '/login');
    await expect(header.getByRole('button', { name: /^(Tài khoản|Account)$/ })).toHaveCount(0);
    await expect(header.getByRole('button', { name: /^(Thông báo|Notifications)$/ })).toHaveCount(0);
  });
});
