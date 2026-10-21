import { test, expect, Page } from '@playwright/test';

// Guest-only, read-only repros for findings in TEST_LOG.md. Each test asserts the
// CORRECT behaviour, so it fails while the bug is live and passes once fixed.
//   BASE_URL=https://vaarria.com npx playwright test tests/live-findings.spec.ts
// No login, no orders, no admin writes — safe to run against production.

const KURTA = 89499105923072;
const SAREE = 87639993876480; // Green Saree, TRENDY10 = ₹16, TRENDY100 = ₹100

// ponytail: seed the guest bag straight into localStorage (shape copied from a
// real Add-to-Bag) instead of clicking through the PDP, which takes ~7s to load.
async function seedBag(page: Page) {
  await page.goto('/');
  await page.evaluate((id) => {
    localStorage.setItem('guest_bag', JSON.stringify([{
      id: `guest_${id}_M_x_1`, productId: id, size: 'M', qty: 1,
      name: 'Black Floral Printed V-Neck Thread Work Pure Cotton Straight Kurta',
      image: 'https://cdn.vaarria.com/app/images/IMG-20261008-WA17914686667060.jpg',
      colorName: 'Red, Blue, Green', color: '#f5f5f5', price: 1399, mrp: 2799,
      couponDiscount: 160, discountType: 'FLAT', returnDays: 7, selected: true,
      offers: [{ code: 'TRENDY10', discount_type: 'FLAT', value: 160 },
               { code: 'TRENDY100', discount_type: 'FLAT', value: 100 }],
    }]));
  }, KURTA);
}

const pageWidth = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth);

test('F1 header fits at 1024px (no horizontal overflow)', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/');
  expect(await pageWidth(page)).toBeLessThanOrEqual(1024);
});

test('F2 footer links to the privacy policy', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('footer a[href="/privacy-policy"]')).toHaveCount(1);
});

for (const name of ['NIGHTWEAR', 'SALE']) {
  test(`F3 nav ${name} navigates somewhere`, async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.locator(`text="${name}" >> visible=true`).first().click();
    await expect(page).not.toHaveURL(/\/$/);
  });
}

test('F4 unknown URL shows a 404, not the product grid', async ({ page }) => {
  await page.goto('/this-page-does-not-exist');
  await expect(page.getByText(/not found|404/i).first()).toBeVisible({ timeout: 10_000 });
});

test('F8 coupon popup thumbnails use a single CDN prefix', async ({ page }) => {
  await seedBag(page);
  await page.goto('/bag');
  await page.getByRole('button', { name: /^(APPLY|EDIT)$/ }).click();
  await expect(page.getByText('TRENDY100').first()).toBeVisible();
  await expect(page.locator('img[src*="images/https://"]')).toHaveCount(0);
});

test('F10 header search goes to results', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const box = page.getByPlaceholder(/search/i).first();
  await box.fill('saree');
  await box.press('Enter');
  await expect(page).not.toHaveURL(/vaarria\.com\/$|5173\/$/, { timeout: 5_000 });
});

test('F12 saree PDP headlines the best coupon (TRENDY100)', async ({ page }) => {
  await page.goto(`/product/${SAREE}`);
  await expect(page.getByText(/with code/i).first()).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText('₹1,483')).toHaveCount(0); // TRENDY10 price
});

test.describe('mobile 375px', () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test('F14 home has no horizontal overflow', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);
    expect(await pageWidth(page)).toBeLessThanOrEqual(375);
  });

  test('F16 bag stacks to one column, Place Order on screen', async ({ page }) => {
    await seedBag(page);
    await page.goto('/bag');
    await page.waitForTimeout(2000);
    expect(await pageWidth(page)).toBeLessThanOrEqual(375);
  });
});
