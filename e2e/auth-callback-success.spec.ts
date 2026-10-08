import { test, expect } from '@playwright/test';
import { createServerClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || '';
const MAILPIT_API = 'http://127.0.0.1:54324';

test.describe('OAuth Callback — Success Path', () => {
  test('callback success: real PKCE code exchange leads to / with authenticated header', async ({
    page,
    context,
  }) => {
    // Use a unique email per run to avoid rate limit issues
    const testEmail = `callback-test-${Date.now()}@example.com`;

    // Set up server client with a cookie jar to capture PKCE verifier
    const jar = new Map<string, string>();
    const sb = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      cookies: {
        getAll: () => [...jar].map(([name, value]) => ({ name, value })),
        setAll: (cs) =>
          cs.forEach(({ name, value }) =>
            value ? jar.set(name, value) : jar.delete(name)
          ),
      },
    });

    // Sign in with OTP (magic link) to get email verification flow
    const { error: otpError } = await sb.auth.signInWithOtp({
      email: testEmail,
      options: {
        emailRedirectTo: 'http://localhost:3000/auth/callback',
      },
    });

    if (otpError) {
      throw new Error(`signInWithOtp failed: ${otpError.message}`);
    }

    // Get the verify URL from Mailpit
    let verifyUrl: string | null = null;
    for (let i = 0; i < 10; i++) {
      const mailRes = await fetch(`${MAILPIT_API}/api/v1/messages`);
      const mailData = (await mailRes.json()) as {
        messages?: Array<{ ID: string }>;
      };
      if (mailData.messages && mailData.messages.length > 0) {
        const messageRes = await fetch(
          `${MAILPIT_API}/api/v1/message/${mailData.messages[0].ID}`
        );
        const messageData = (await messageRes.json()) as {
          HTML?: string;
        };
        if (messageData.HTML) {
          // Decode HTML entities and extract the verify URL
          const decoded = messageData.HTML
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"');

          const match = decoded.match(
            /https?:\/\/[^"<>]+\/auth\/v1\/verify[^"<>]+/
          );
          if (match) {
            verifyUrl = match[0];
            break;
          }
        }
      }
      await new Promise((r) => setTimeout(r, 100));
    }

    if (!verifyUrl) {
      throw new Error(
        'Verify URL not found in Mailpit after 1 second. ' +
          'Ensure Mailpit is running at 127.0.0.1:54324'
      );
    }

    // GET the verify URL with redirect: 'manual' to capture the code in Location header
    const verifyRes = await fetch(verifyUrl, { redirect: 'manual' });
    const locationHeader = verifyRes.headers.get('location');
    if (!locationHeader) {
      throw new Error(
        `Verify endpoint did not redirect. Status: ${verifyRes.status}`
      );
    }

    // Extract code from the Location header
    const codeMatch = locationHeader.match(/code=([^&]+)/);
    if (!codeMatch) {
      throw new Error(
        `Could not extract code from Location header: ${locationHeader}`
      );
    }
    const code = codeMatch[1];

    // Add PKCE verifier cookie from jar to context
    for (const [name, value] of jar) {
      if (name.includes('verifier')) {
        await context.addCookies([
          {
            name,
            value,
            url: 'http://localhost:3000',
          },
        ]);
      }
    }

    // Navigate to callback with the code
    await page.goto(`/auth/callback?code=${code}`);

    // Should redirect to homepage (/) exactly
    await page.waitForURL('http://localhost:3000/', { timeout: 5000 });
    await expect(page).toHaveURL('http://localhost:3000/');

    // Should display authenticated header with account button
    const accountBtn = page.getByRole('button', { name: /^(Tài khoản|Account)$/ });
    await expect(accountBtn).toBeVisible({ timeout: 5000 });
  });
});
