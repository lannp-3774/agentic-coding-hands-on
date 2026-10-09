import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { ensureUser } from './support/supabase-session';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MCwiZXhwIjoxMTExMTExMTExfQ.test';

test.describe('@supabase award details schema and RLS', () => {
  test('anon cannot insert into award_prizes', async () => {
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

    const { error } = await client.from('award_prizes').insert([
      {
        award_slug: 'top-talent',
        sort_order: 99,
        amount_vnd: 999999,
        note_vi: 'test',
        note_en: 'test',
      },
    ]);

    // Should be denied by RLS
    expect(error).not.toBeNull();
    expect(error?.message.toLowerCase()).toMatch(/permission|denied|rls/);
  });

  test('anon cannot update award_prizes', async () => {
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

    const { error } = await client
      .from('award_prizes')
      .update({ amount_vnd: 999999 })
      .eq('award_slug', 'top-talent')
      .eq('sort_order', 1);

    // Should be denied by RLS
    expect(error).not.toBeNull();
    expect(error?.message.toLowerCase()).toMatch(/permission|denied|rls/);
  });

  test('anon cannot delete from award_prizes', async () => {
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

    const { error } = await client
      .from('award_prizes')
      .delete()
      .eq('award_slug', 'top-talent')
      .eq('sort_order', 1);

    // Should be denied by RLS
    expect(error).not.toBeNull();
    expect(error?.message.toLowerCase()).toMatch(/permission|denied|rls/);
  });

  test('anon cannot update new awards columns', async () => {
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

    const { error } = await client
      .from('awards')
      .update({ detail_description_vi: 'test' })
      .eq('slug', 'top-talent');

    // Should be denied by RLS
    expect(error).not.toBeNull();
    expect(error?.message.toLowerCase()).toMatch(/permission|denied|rls/);
  });

  test('authenticated user cannot insert into award_prizes', async () => {
    const email = 'award-test@example.com';
    const password = 'password123';
    await ensureUser(email, password);

    // Really sign in: without a session this would just repeat the anon test
    const authClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: session, error: signInError } = await authClient.auth.signInWithPassword({
      email,
      password,
    });
    expect(signInError).toBeNull();
    expect(session.session?.access_token).toBeTruthy();

    const { error } = await authClient.from('award_prizes').insert([
      {
        award_slug: 'top-talent',
        sort_order: 99,
        amount_vnd: 888888,
        note_vi: 'authed test',
        note_en: 'authed test',
      },
    ]);

    // Authenticated role only has SELECT (migration grants): insert must be denied
    expect(error).not.toBeNull();
    expect(error?.message.toLowerCase()).toMatch(/permission|denied|rls|row-level security/);
  });
});
