import { test, expect } from '@playwright/test';

// ponytail: every generated test starts here. `?e2e=$E2E_BYPASS_CODE` turns on the e2e
// bypass (admin/order APIs skip auth, MSG91 OTP widget is stubbed — see
// src/utils/e2e.js). OTP login only passes for numbers in TEST_MOBILES on the
// auth Lambda.
test.describe('Seed', () => {
  test('seed', async ({ page }) => {
    await page.goto(`/?e2e=${process.env.E2E_BYPASS_CODE}`);
    await expect(page).toHaveTitle(/VAARRIA/);
  });
});
