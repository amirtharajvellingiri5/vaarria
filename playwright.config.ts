import { defineConfig, devices } from '@playwright/test';

// ponytail: .env.development points at the PROD APIs (no staging tier), so any
// test that writes data hits production. Keep writes self-cleaning and tag E2E.
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // ponytail: BASE_URL=https://vaarria.com runs against live, no dev server
  webServer: process.env.BASE_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
  },
});
