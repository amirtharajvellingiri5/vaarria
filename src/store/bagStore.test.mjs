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
const applied = () => [...useBagStore.getState().appliedCouponIds].sort()

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
useBagStore.setState({ appliedCouponIds: new Set() })
toggle2(10); toggle2(11); toggle2(12)
assert.equal(useBagStore.getState().getCouponSavings(), 90, 'FLAT 50 + PERCENTAGE 30 + FLAT 10')

toggleSelected(12)                       // de-select an applied line -> drops out of savings
assert.equal(useBagStore.getState().getCouponSavings(), 80, 'de-selected line excluded even while applied')

toggle2(10)                              // un-apply the FLAT coupon -> its 50 drops
assert.equal(useBagStore.getState().getCouponSavings(), 30, 'un-applied coupon excluded')
console.log('ok — FLAT/PERCENTAGE math + selected-gating')
