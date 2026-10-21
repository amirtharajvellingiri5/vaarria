# VAARRIA live E2E test log

- **Target:** https://vaarria.com (production; there is no staging)
- **Tester:** Claude (manual exploratory + automated repro)
- **Date:** 2026-10-20
- **Browser:** Chromium at 1280×800, 1024×768, 1440×900, and 375×812 (mobile)
- **Session:** guest. The admin and logged-in flows are in Phase 2, which is pending a sign-in.

**Automated repro:** `BASE_URL=https://vaarria.com npx playwright test tests/live-findings.spec.ts`
- Each test asserts the *correct* behaviour, so it fails while the bug is live and goes green once fixed.
- The suite is guest-only and read-only, so it is safe on prod.
- Last run (2026-10-20): **10 failed / 0 passed**, and every failure is the expected bug.

Severity: Critical > High > Medium > Low.

---

## Findings

**Status (2026-10-21):** F1–F4 and F6–F16 are fixed and shipped. F5 and the data/content notes are still open.

### F13: Static e2e bypass code grants admin on the live orders API (Critical, security)
- **Where:** `orders_handler/auth.py`, `BYPASS_CODE` constant.
  - Any request carrying that code in the `X-E2E-Auth` header is treated as an admin with `e2e_bypass: True`.
  - `assert_owns()` then lets **every** `customer_id` through.
- **Exposure:**
  - The same code is committed in plain text in `tests/seed.spec.ts` and `auth/lambda_function.py`.
  - It is a short numeric code, so it is brute-forceable without rate limiting (no WAF yet).
- **Client side:** `AdminGate.jsx` lets anyone in once `getE2eAuth()` is *any* non-empty string, so `?e2e=<anything>` renders the admin UI shell.
- **Repro:** source review only, deliberately **not exploited on live**.
  - Observed: a browser that had once used the e2e link rendered `/admin` (the product table) with no login.
- **Fix:**
  - Move the code to a Lambda env var that is empty in prod, or require it together with a valid test-account JWT.
  - Rotate the code.
  - Gate `AdminGate` on the real admin check only.

### F16: Bag page is not responsive; summary and Place Order are off-screen on mobile (High)
- **Repro:** at a 375px viewport, add any item and open `/bag`.
- **Expected:** a single column, with the price summary and PLACE ORDER below the items.
- **Actual:**
  - The two-column grid stays, and the page is 701–703px wide.
  - The price summary and PLACE ORDER sit off-screen to the right and need a sideways pan.
- **Root cause:** `Bag.jsx:2288` `gridTemplateColumns: '1fr 380px'` has no breakpoint.
- **Test:** `F16`.

### F10: Header search does nothing (High)
- **Repro:** on `/`, type `saree` in the header search and press Enter.
- **Expected:** a results page or suggestions.
- **Actual:** the URL stays `/`, with no suggestions and no results route.
- **Root cause:** `Navbar.jsx:404-409`: the input has only `onChange={setSearchValue}`, with no submit or navigate. Mobile search (~line 649) is the same.
- **Test:** `F10`.

### F3: NIGHTWEAR and SALE nav items are dead (High)
- **Repro:** at a desktop width, click NIGHTWEAR or SALE.
- **Expected:** navigate to the category.
- **Actual:** nothing happens.
- **Root cause:** `Navbar.jsx:134-145`: these entries have a top-level `url` (`/genz`, `/studio`) and empty `columns`, and the click handler never uses `url`.
  - Visiting `/genz` or `/studio` directly shows **all** products (see F4).
- **Test:** `F3 nav NIGHTWEAR` and `F3 nav SALE`.

### F14: Home page wider than a phone; the page pans sideways (Medium)
- **Repro:** at 375px, open `/`.
- **Actual:** the layout width is 481px.
  - The hero card "How your fabric gets to you" is clipped ("Brand" is cut off).
  - Opening the hamburger menu pans the page 106px left.
- **Root cause:** `Home.jsx:133-140`: the flex chips Mill → Distributor → Brand → Retailer → You keep the default `min-width:auto`, so "Distributor" can't shrink.
- **Fix:** `minWidth: 0` on the chips, or wrap the row.
- **Test:** `F14`.

### F12: PDP promotes the worse coupon (Medium)
- **Repro:** open `/product/87639993876480` (Green Saree, ₹1,499).
- **Expected:** the headline uses the best coupon: TRENDY100 → ₹1,399.
- **Actual:** "₹1,483 with code TRENDY10" (₹16 off). The offer card below does mention TRENDY100.
- **Test:** `F12`.

### F4: Unknown URLs render a category page instead of a 404 (Medium)
- **Repro:** open `/contact`, `/privacy`, `/shipping`, `/about`, or `/anything`.
- **Actual:** the h1 shows the slug above the **full product grid**.
- **Root cause:** `main.jsx:60` `{ path: '/:slug', element: <Products /> }` catches every path, and there is no 404 route or unknown-slug check.
- **Test:** `F4`.

### F5: Stock differs between endpoints (Medium–High)
- **Actual:** the listing (KV-cached) and the detail and admin endpoints report different stock for the same product.
- **Impact:** the shop can show an item as in stock when it is sold out, or the reverse. Likely stale KV.
- **To verify in Phase 2:** use admin Category Sync.

### F1: Header overflows at 1024px; logo collapses (Medium)
- **Repro:** at a 1024×768 viewport, open `/`.
- **Actual:** `scrollWidth` is 1066, and the logo is squeezed.
- **Test:** `F1`.

### F2: Footer links wrong or missing (Medium)
- **Actual:**
  - "Lehengas" is listed, but there is no such category.
  - "Track Order" goes to `/bag`.
  - "Size Guide" goes to `/terms`.
  - There is no Privacy Policy link, although `/privacy-policy` exists.
- **Test:** `F2`.

### F6: Bag row mixes qty-scaled and unit prices (Low–Medium)
- **Repro:** add the kurta and set the quantity to 2.
- **Actual:** the row shows the price ×2 (₹2,798), but MRP and "₹1400 OFF" are per unit. The header says "(1 ITEM)" at qty 2.

### F7: Coupon label per-unit vs applied total (Low)
- **Repro:** at qty 2 with TRENDY10, the row says "Coupon Discount: ₹160 (TRENDY10)", but ₹320 is applied in the summary. The pre-apply hint also says ₹160.

### F8: Coupon popup thumbnails broken (Low–Medium)
- **Repro:** with an item in the bag, click APPLY on the coupons card.
- **Actual:** product images are broken; the src is `https://cdn.vaarria.com/app/images/https://cdn.vaarria.com/app/images/IMG-….jpg`.
- **Root cause:** `modals/CouponModal.jsx:281` prefixes a URL that is already absolute. `Bag.jsx:569` handles this correctly with `startsWith('http')`.
- **Test:** `F8`.

### F11: Applied coupons lost on reload (Low–Medium)
- **Repro:** apply TRENDY10 in the bag, then reload `/bag`.
- **Actual:** Coupon Discount resets to ₹0.

### F9: Full COD label not clickable (Low)
- **Repro:** in the bag, click the text "Full Cash on Delivery".
- **Actual:** the option is not selected; only the radio circle works.

### F15: Header icon buttons have no accessible name (Low, a11y)
- **Actual:** the Login, Wishlist, Bag and menu buttons expose no name to screen readers.

### Data / content notes
- **Kurta 89499105923072:** the title says "Black", the image is mustard, and the description says red.
- **Hardcoded values:** `ProductsListing.jsx` hardcodes `rating: 4.0` and `category: 'Ethnic'` on every card.
- **Speed:** the PDP takes about 7s to first content.
- **No feedback:** there is no toast after Add to Bag.
- **`/profile` as a guest:** renders a blank page instead of a login prompt.

---

## Passed

| Area | Check | Result |
|---|---|---|
| Home | Loads with no console errors; the mega menu opens with categories | PASS |
| Category | Pages for all 10 categories load; the filters, empty state and Clear work; sibling categories show | PASS |
| Listing API | Sort and filter results correct | PASS |
| PDP | Add without a size → validation; pincode check rejects invalid input and accepts a valid pincode | PASS |
| Bag math | Qty 2 TRENDY10: 2798 − 320 = 2478; online 2428 (−50); partial COD 2453 (₹49 + ₹2,404); full COD 2478 | PASS |
| Bag math | TRENDY100 at qty 2: 2598 / 2546 / 2572 | PASS |
| Bag multi-item | Kurta + saree: MRP 8597, discount 4300, coupons 420 → 3877; online 3799; partial 3838 (49 + 3789) | PASS |
| Coupons | Popup lists per-item coupons with the BEST tag; the two coupons for one item are mutually exclusive | PASS |
| Payment toggle | Selecting Full COD moves the highlight and removes the online-discount line | PASS |
| Qty | Minus 2 → 1 works; minus at 1 stays at 1 | PASS |
| Remove | "Are you sure" confirm; after confirming, the item is removed and totals update | PASS |
| Guest checkout | PLACE ORDER opens the OTP modal; letters are stripped; Send OTP is disabled under 10 digits | PASS |
| Guest wishlist | The heart opens the "Save to Wishlist" login modal | PASS |
| Static pages | `/terms`, `/refund-policy`, `/privacy-policy`, `/contact-us` load | PASS |
| Account | `/orders` (guest) shows "My Orders" with an empty state; `/wishlist` shows a login prompt | PASS |

---

## Phase 2: pending sign-in (admin + logged-in flows)
1. Create one product per category, each named `<Category> test`, for all 10 categories.
2. Check the admin listing, edit, no-stock, orphans, and Category Sync. Re-check F5.
3. Place one COD order with a test product → My Orders → cancel. Check the status flow, the "Refund due" box, and the admin orders qty column.
4. Clean up the test orders and test products.
