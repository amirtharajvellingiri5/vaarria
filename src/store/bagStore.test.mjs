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
