import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY || '';
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || '';

type ProfileRow = { id: string; role: 'user' | 'admin' };

test.describe('Supabase schema & RLS contract', () => {
  test('anon can select 6 awards in slug order', async () => {
    const anon = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false },
    });
    const { data, error } = await anon
      .from('awards')
      .select('*')
      .order('sort_order');
    expect(error).toBeNull();
    expect(data).toHaveLength(6);
    const slugs = data!.map((a) => a.slug);
    expect(slugs).toEqual([
      'top-talent',
      'top-project',
      'top-project-leader',
      'best-manager',
      'signature-2025-creator',
      'mvp',
    ]);
  });

  test('anon cannot select profiles (RLS 42501)', async () => {
    const anon = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false },
    });
    const { error } = await anon.from('profiles').select('*');
    expect(error?.code).toBe('42501');
  });

  test('anon cannot insert or update awards (RLS 42501)', async () => {
    const anon = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false },
    });
    const insertErr = (
      await anon.from('awards').insert({ slug: 'test', sort_order: 999 })
    ).error;
    const updateErr = (
      await anon
        .from('awards')
        .update({ sort_order: 0 })
        .eq('slug', 'top-talent')
    ).error;
    expect(insertErr?.code).toBe('42501');
    expect(updateErr?.code).toBe('42501');
  });

  test('signed-in user reads own profile, not others', async () => {
    const secret = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
      auth: { persistSession: false },
    });
    const user1Id = '00000000-0000-0000-0000-000000000211';
    const user2Id = '00000000-0000-0000-0000-000000000212';
    const password = 'test123';

    await secret.auth.admin.deleteUser(user1Id).catch(() => {});
    await secret.auth.admin.deleteUser(user2Id).catch(() => {});
    await secret.auth.admin.createUser({
      id: user1Id,
      email: 'u1@t.com',
      password,
      email_confirm: true,
    });
    await secret.auth.admin.createUser({
      id: user2Id,
      email: 'u2@t.com',
      password,
      email_confirm: true,
    });

    const authClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false },
    });
    const { data: session } = await authClient.auth.signInWithPassword({
      email: 'u1@t.com',
      password,
    });

    const authed = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: `Bearer ${session!.session!.access_token}`,
        },
      },
    });

    // Read own profile
    const { data: ownProfiles } = await authed
      .from('profiles')
      .select('id, role')
      .eq('id', user1Id);
    expect(ownProfiles).toHaveLength(1);
    expect(ownProfiles![0].id).toBe(user1Id);
    expect(ownProfiles![0].role).toBe('user');

    // Cannot read other user's profile
    const { data: otherProfiles } = await authed
      .from('profiles')
      .select('id, role')
      .eq('id', user2Id);
    expect(otherProfiles).toHaveLength(0);
  });

  test('signed-in user cannot update own role', async () => {
    const secret = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
      auth: { persistSession: false },
    });
    const userId = '00000000-0000-0000-0000-000000000213';
    const password = 'test123';

    await secret.auth.admin.deleteUser(userId).catch(() => {});
    await secret.auth.admin.createUser({
      id: userId,
      email: 'norole@t.com',
      password,
      email_confirm: true,
    });

    const authClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false },
    });
    const { data: session } = await authClient.auth.signInWithPassword({
      email: 'norole@t.com',
      password,
    });

    const authed = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: `Bearer ${session!.session!.access_token}`,
        },
      },
    });

    // Try to update role; either error or 0 rows affected
    const { data, error } = await authed
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId)
      .select();

    if (error) {
      expect(error.code).toBe('42501');
    } else {
      expect((data as ProfileRow[])).toHaveLength(0);
    }

    // Verify with secret key that role is still 'user'
    const { data: verify } = await secret
      .from('profiles')
      .select('role')
      .eq('id', userId);
    expect((verify as ProfileRow[])[0].role).toBe('user');
  });

  test('secret-key can set role admin', async () => {
    const secret = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
      auth: { persistSession: false },
    });
    const userId = '00000000-0000-0000-0000-000000000214';

    await secret.auth.admin.deleteUser(userId).catch(() => {});
    await secret.auth.admin.createUser({
      id: userId,
      email: 'admin@t.com',
      password: 'test123',
      email_confirm: true,
    });

    const { data, error } = await secret
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId)
      .select();

    expect(error).toBeNull();
    expect((data as ProfileRow[])).toHaveLength(1);
    expect((data as ProfileRow[])[0].role).toBe('admin');
  });
});
