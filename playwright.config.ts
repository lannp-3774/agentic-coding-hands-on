import { defineConfig, devices } from '@playwright/test';

// Load .env file for server-side env vars (try-catch to avoid errors)
try {
  process.loadEnvFile('.env');
} catch {
  // .env doesn't exist yet, that's okay
}

const baseURL = 'http://localhost:3000';
const PRELAUNCH_GATE_SPECS = /prelaunch-gate-.*\.spec\.ts$/;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: PRELAUNCH_GATE_SPECS,
    },
    {
      name: 'prelaunch-gate',
      testMatch: PRELAUNCH_GATE_SPECS,
      dependencies: ['chromium'],
      workers: 1,
      fullyParallel: false,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: process.env.CI ? 'npm run build && npm run start' : 'npm run dev',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
  timeout: 60_000,
  expect: { timeout: 10_000 },
});
