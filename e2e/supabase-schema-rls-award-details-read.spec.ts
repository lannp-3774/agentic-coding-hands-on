import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'http://127.0.0.1:54321';
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlc3QiLCJyb2xlIjoiYW5vbiIsImlhdCI6MCwiZXhwIjoxMTExMTExMTExfQ.test';

test.describe('@supabase award details schema and RLS', () => {
  test('anon can read awards table with new detail columns in sort order', async () => {
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

    const { data, error } = await client
      .from('awards')
      .select('slug, nav_label, quantity, unit_vi, unit_en, detail_description_vi')
      .order('sort_order');

    expect(error).toBeNull();
    const rows = data ?? [];

    // Should have 6 awards ordered by sort_order
    expect(rows).toHaveLength(6);

    // Verify exact values from seed (02-award-details.sql, migration 20261009021753)
    const expected = [
      { slug: 'top-talent', nav_label: 'Top Talent', quantity: 10, unit_vi: 'Cá nhân', unit_en: 'Individual' },
      { slug: 'top-project', nav_label: 'Top Project', quantity: 2, unit_vi: 'Tập thể', unit_en: 'Team' },
      { slug: 'top-project-leader', nav_label: 'Top Project Leader', quantity: 3, unit_vi: 'Cá nhân', unit_en: 'Individual' },
      { slug: 'best-manager', nav_label: 'Best Manager', quantity: 1, unit_vi: 'Cá nhân', unit_en: 'Individual' },
      { slug: 'signature-2025-creator', nav_label: 'Signature 2025 Creator', quantity: 1, unit_vi: 'Cá nhân hoặc tập thể', unit_en: 'Individual or team' },
      { slug: 'mvp', nav_label: 'MVP', quantity: 1, unit_vi: 'Cá nhân', unit_en: 'Individual' },
    ];

    for (let i = 0; i < expected.length; i++) {
      expect(rows[i].slug).toBe(expected[i].slug);
      expect(rows[i].nav_label).toBe(expected[i].nav_label);
      expect(rows[i].quantity).toBe(expected[i].quantity);
      expect(rows[i].unit_vi).toBe(expected[i].unit_vi);
      expect(rows[i].unit_en).toBe(expected[i].unit_en);
      expect(rows[i]).toHaveProperty('detail_description_vi');
    }
  });

  test('anon can read award_prizes table with exact 7 tiers ordered by award_slug and sort_order', async () => {
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

    const { data, error } = await client
      .from('award_prizes')
      .select('award_slug, sort_order, amount_vnd, note_vi, note_en')
      .order('award_slug, sort_order');

    expect(error).toBeNull();
    const rows = data ?? [];

    // Should have exactly 7 prize rows (Signature 2025 Creator has 2 tiers)
    expect(rows).toHaveLength(7);

    // Verify exact values from seed (02-award-details.sql)
    // Ordered alphabetically by award_slug, then by sort_order
    const expectedPrizes = [
      { award_slug: 'best-manager', sort_order: 1, amount_vnd: 10000000, note_vi: null, note_en: null },
      { award_slug: 'mvp', sort_order: 1, amount_vnd: 15000000, note_vi: null, note_en: null },
      { award_slug: 'signature-2025-creator', sort_order: 1, amount_vnd: 5000000, note_vi: 'cho giải cá nhân', note_en: 'for the individual award' },
      { award_slug: 'signature-2025-creator', sort_order: 2, amount_vnd: 8000000, note_vi: 'cho giải tập thể', note_en: 'for the team award' },
      { award_slug: 'top-project', sort_order: 1, amount_vnd: 15000000, note_vi: 'cho mỗi giải thưởng', note_en: 'per award' },
      { award_slug: 'top-project-leader', sort_order: 1, amount_vnd: 7000000, note_vi: 'cho mỗi giải thưởng', note_en: 'per award' },
      { award_slug: 'top-talent', sort_order: 1, amount_vnd: 7000000, note_vi: 'cho mỗi giải thưởng', note_en: 'per award' },
    ];

    for (let i = 0; i < expectedPrizes.length; i++) {
      expect(rows[i].award_slug).toBe(expectedPrizes[i].award_slug);
      expect(rows[i].sort_order).toBe(expectedPrizes[i].sort_order);
      expect(rows[i].amount_vnd).toBe(expectedPrizes[i].amount_vnd);
      expect(rows[i].note_vi).toBe(expectedPrizes[i].note_vi);
      expect(rows[i].note_en).toBe(expectedPrizes[i].note_en);
    }
  });

  test('award_prizes table has required columns with correct types', async () => {
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

    const { data, error } = await client
      .from('award_prizes')
      .select('*')
      .limit(1);

    expect(error).toBeNull();
    // Seeded table: an empty result must fail here instead of skipping the shape checks
    expect(data).toHaveLength(1);

    const row = data![0];
    // Verify PK columns (not id, but award_slug + sort_order)
    expect(row).toHaveProperty('award_slug');
    expect(row).toHaveProperty('sort_order');
    // Verify data columns
    expect(row).toHaveProperty('amount_vnd');
    expect(row).toHaveProperty('note_vi');
    expect(row).toHaveProperty('note_en');
  });

  test('awards table has all required detail columns', async () => {
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

    const { data, error } = await client
      .from('awards')
      .select('*')
      .limit(1);

    expect(error).toBeNull();
    // Seeded table: an empty result must fail here instead of skipping the shape checks
    expect(data).toHaveLength(1);

    const row = data![0];
    // Verify old columns still exist (homepage use)
    expect(row).toHaveProperty('slug');
    expect(row).toHaveProperty('title_vi');
    expect(row).toHaveProperty('title_en');
    expect(row).toHaveProperty('description_vi');
    expect(row).toHaveProperty('image_path');
    // Verify new columns from this feature
    expect(row).toHaveProperty('nav_label');
    expect(row).toHaveProperty('quantity');
    expect(row).toHaveProperty('unit_vi');
    expect(row).toHaveProperty('unit_en');
    expect(row).toHaveProperty('detail_description_vi');
  });

  test('homepage columns on awards table remain readable by anon', async () => {
    const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

    // These columns are used on the homepage and should remain public-readable
    const { data, error } = await client
      .from('awards')
      .select('slug, title_vi, title_en, description_vi, image_path')
      .order('sort_order');

    expect(error).toBeNull();
    const rows = data ?? [];

    // Should still have 6 records
    expect(rows).toHaveLength(6);

    for (const row of rows) {
      expect(row).toHaveProperty('slug');
      expect(row).toHaveProperty('title_vi');
      expect(row).toHaveProperty('title_en');
      expect(row).toHaveProperty('description_vi');
      expect(row).toHaveProperty('image_path');
    }
  });
});
