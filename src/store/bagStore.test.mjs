import assert from 'node:assert'
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} }
const { useBagStore } = await import('./bagStore.js')

const { setItems, toggleCoupon } = useBagStore.getState()
// same product, two lines (S and M) + a different product
setItems([
  { id: 1, productId: 'P1', size: 'S', selected: true, qty: 1, price: 100, couponDiscount: 10, discountType: 'PERCENTAGE' },
  { id: 2, productId: 'P1', size: 'M', selected: true, qty: 1, price: 100, couponDiscount: 10, discountType: 'PERCENTAGE' },
  { id: 3, productId: 'P2', size: 'L', selected: true, qty: 1, price: 100, couponDiscount: 10, discountType: 'PERCENTAGE' },
])
const applied = () => [...useBagStore.getState().appliedCoupons.keys()].sort()

toggleCoupon(1)
assert.deepEqual(applied(), [1])
toggleCoupon(2)                       // same product -> replaces, not adds
assert.deepEqual(applied(), [2], 'only one coupon per product')
toggleCoupon(3)                       // different product -> coexists
assert.deepEqual(applied(), [2, 3], 'other products unaffected')
toggleCoupon(3)                       // untoggle still works
assert.deepEqual(applied(), [2])
assert.equal(useBagStore.getState().getCouponSavings(), 10, 'savings counted once')
console.log('ok — one coupon per product enforced')

// ---- getCouponSavings math: FLAT branch, PERCENTAGE floor at qty>1, gating ----
const { setItems: setItems2, toggleCoupon: toggle2, toggleSelected } = useBagStore.getState()
setItems2([
  { id: 10, productId: 'A', size: 'S', selected: true, qty: 2, price: 100, couponDiscount: 25, discountType: 'FLAT' },       // 25*2 = 50
  { id: 11, productId: 'B', size: 'S', selected: true, qty: 3, price: 100, couponDiscount: 10, discountType: 'PERCENTAGE' }, // floor(300*10/100) = 30
  { id: 12, productId: 'C', size: 'S', selected: true, qty: 1, price: 100, couponDiscount: 10, discountType: 'FLAT' },       // applied then de-selected -> ignored
])
useBagStore.setState({ appliedCoupons: new Map() })
toggle2(10); toggle2(11); toggle2(12)
assert.equal(useBagStore.getState().getCouponSavings(), 90, 'FLAT 50 + PERCENTAGE 30 + FLAT 10')

toggleSelected(12)                       // de-select an applied line -> drops out of savings
assert.equal(useBagStore.getState().getCouponSavings(), 80, 'de-selected line excluded even while applied')

toggle2(10)                              // un-apply the FLAT coupon -> its 50 drops
assert.equal(useBagStore.getState().getCouponSavings(), 30, 'un-applied coupon excluded')
console.log('ok — FLAT/PERCENTAGE math + selected-gating')

// ---- several offers on one item: the customer picks, default is the biggest ----
const { setItems: setItems3, toggleCoupon: toggle3 } = useBagStore.getState()
setItems3([
  {
    id: 20, productId: 'D', size: 'S', selected: true, qty: 1, price: 1588,
    couponDiscount: 1477, discountType: 'FLAT',
    offers: [
      { code: 'TRENDY10', discount_type: 'FLAT', value: 1477 },
      { code: 'TRENDY100', discount_type: 'FLAT', value: 100 },
    ],
  },
])
useBagStore.setState({ appliedCoupons: new Map() })
const { itemOffers } = await import('./bagStore.js')
assert.deepEqual(itemOffers(useBagStore.getState().items[0]).map((o) => o.code), ['TRENDY10', 'TRENDY100'], 'best offer first')
toggle3(20, 'TRENDY100')
assert.equal(useBagStore.getState().getCouponSavings(), 100, 'the picked offer wins, not the biggest')
toggle3(20, 'TRENDY10')                  // switching offers on the same line
assert.equal(useBagStore.getState().getCouponSavings(), 1477)
toggle3(20)                              // no code -> best offer -> already applied -> off
assert.equal(useBagStore.getState().getCouponSavings(), 0, 'untoggle via the default code')
console.log('ok — multiple offers per item, customer picks')

// ---- removing a line drops its applied coupon ----
const s = useBagStore.getState()
s.setItems([
  { id: 20, productId: 'X', selected: true, qty: 1, price: 100, couponDiscount: 10, discountType: 'FLAT' },
  { id: 21, productId: 'Y', selected: true, qty: 1, price: 100, couponDiscount: 10, discountType: 'FLAT' },
])
s.toggleCoupon(20); s.toggleCoupon(21)
s.setItems(useBagStore.getState().items.filter((i) => i.id !== 20))
assert.deepEqual(applied(), [21], 'setItems prunes removed line')
useBagStore.getState().removeItem(21)
assert.deepEqual(applied(), [], 'removeItem prunes too')
console.log('ok — removed items drop their coupon')
