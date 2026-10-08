import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || '';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';

/**
 * Seed a user in local Supabase (idempotent: ignores existing emails).
 * Optionally set the user's role in profiles.role after creation.
 * Requires SUPABASE_SECRET_KEY and local supabase to be running.
 * Uses admin client to bypass RLS and auth constraints.
 * Handles concurrent race conditions when multiple workers create the same email.
 */
export async function ensureUser(
  email: string,
  password: string,
  role: 'user' | 'admin' = 'user'
) {
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

  const { data: userData, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  // Handle idempotency: email_exists or user_already_exists; also catch
  // concurrent race on HTTP 500 "Database error creating new user" when multiple
  // workers call createUser concurrently with the same email (losers get 500).
  // The 23505 constraint violation never reaches the client in this case.
  let userId: string | undefined;
  const isRaceCondition =
    error &&
    (error.code === 'email_exists' ||
      error.code === 'user_already_exists' ||
      error.message?.includes('already exists') ||
      (error.status === 500 &&
        error.message?.includes('Database error creating new user')));

  if (isRaceCondition) {
    console.log(
      `User ${email} already exists or lost race (status=${error?.status}, code=${error.code})`
    );
    // Poll for user ID with pagination. Retry up to 20 times over ~2s.
    // Use page-based iteration to handle large user lists.
    let userId_found: string | undefined;
    for (let attempt = 0; attempt < 20; attempt++) {
      let allFound = false;
      let page = 0;
      while (!allFound && !userId_found) {
        const { data, error: listErr } = await admin.auth.admin.listUsers({
          page,
          perPage: 1000,
        });
        if (listErr) {
          console.log(
            `listUsers page ${page} failed (attempt ${attempt}): ${listErr.message}`
          );
          break;
        }
        if (data?.users) {
          const user = data.users.find((u) => u.email === email);
          if (user) {
            userId_found = user.id;
            break;
          }
          // If we got fewer users than perPage, we've reached the end
          if (data.users.length < 1000) {
            allFound = true;
          }
        }
        page++;
      }
      if (userId_found) break;
      // Wait 100ms before retrying
      await new Promise((r) => setTimeout(r, 100));
    }
    userId = userId_found;
  } else if (error) {
    throw new Error(
      `Failed to create user ${email}: status=${error.status}, code=${error.code}, message=${error.message}`
    );
  } else {
    userId = userData?.user?.id;
    console.log(`Created user ${email}`);
  }

  // Update role in profiles if needed
  if (!userId) {
    throw new Error(`Could not resolve user id for ${email} after ${20} attempts`);
  }

  const { error: roleError } = await admin
    .from('profiles')
    .update({ role })
    .eq('id', userId);
  if (roleError) {
    // Fail loudly: a user seeded without the requested role would make
    // role-dependent assertions meaningless.
    throw new Error(`Failed to set role "${role}" for ${email}: ${roleError.message}`);
  }
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
