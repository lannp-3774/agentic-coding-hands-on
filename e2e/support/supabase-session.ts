import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || '';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';

/**
 * Seed a user in local Supabase (idempotent: ignores existing emails).
 * Requires SUPABASE_SECRET_KEY and local supabase to be running.
 * Uses admin client to bypass RLS and auth constraints.
 */
export async function ensureUser(email: string, password: string) {
  if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_SECRET_KEY required for ensureUser()'
    );
  }

  // Use admin client with opaque secret key
  const admin = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  // Handle idempotency: email_exists or user_already_exists (idempotent)
  if (
    error &&
    (error.code === 'email_exists' ||
      error.code === 'user_already_exists' ||
      error.message?.includes('already exists'))
  ) {
    console.log(`User ${email} already exists (idempotent)`);
    return;
  }

  if (error) {
    throw new Error(`Failed to create user ${email}: ${error.message}`);
  }

  console.log(`Created user ${email}`);
}

/**
 * Obtain session cookies for a user by signing in with password.
 * Returns cookies suitable for context.addCookies().
 */
export async function sessionCookies(
  email: string,
  password: string,
  baseURL: string = 'http://localhost:3000'
): Promise<{ name: string; value: string; url: string }[]> {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error(
      'SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY required for sessionCookies()'
    );
  }

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

  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) {
    throw new Error(`signInWithPassword failed: ${error.message}`);
  }

  // Verify cookies were captured (must be non-empty)
  if (jar.size === 0) {
    throw new Error(
      'No session cookies captured from signInWithPassword — jar is empty'
    );
  }

  // Verify auth token is present (Supabase chunks it as sb-*-auth-token.0, sb-*-auth-token.1, etc.)
  const hasAuthToken = [...jar.keys()].some((key) =>
    key.match(/^sb-.*-auth-token/)
  );
  if (!hasAuthToken) {
    throw new Error(
      'No Supabase auth token cookie found in jar: ' +
        [...jar.keys()].join(', ')
    );
  }

  // Add url for Playwright context.addCookies()
  // Keep sameSite Lax and path / as specified
  return [...jar].map(([name, value]) => ({
    name,
    value,
    url: baseURL,
  }));
}
