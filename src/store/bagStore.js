import { create } from 'zustand'

const GUEST_BAG_KEY = 'guest_bag'

export const getGuestBag = () => {
  try { return JSON.parse(localStorage.getItem(GUEST_BAG_KEY)) || [] } catch { return [] }
}

export const saveGuestBag = (items) => {
  localStorage.setItem(GUEST_BAG_KEY, JSON.stringify(items))
}

export const clearGuestBag = () => {
  localStorage.removeItem(GUEST_BAG_KEY)
}

// ponytail: an item can carry several coupons (hourly deal + catalog offer). These three
// helpers are the only place that knows the shape, so a new offer type needs no UI change.
export const offerAmount = (item, offer) =>
  !offer
    ? 0
    : offer.discount_type === 'PERCENTAGE'
      ? Math.floor((item.price * item.qty * offer.value) / 100)
      : offer.value * item.qty

export const itemOffers = (item) => {
  const offers = item.offers?.length
    ? item.offers
    : item.couponDiscount > 0
      ? [{ code: `TRENDY${item.couponDiscount}`, discount_type: item.discountType || 'FLAT', value: item.couponDiscount }]
      : []
  return [...offers].sort((a, b) => offerAmount(item, b) - offerAmount(item, a)) // best first
}

// ponytail: coupons are per product, not per bag line — one coupon covers every
// size/colour of that product in the bag.
export const couponKey = (item) => item.productId ?? item.id

export const appliedOffer = (item, appliedCoupons) =>
  itemOffers(item).find((o) => o.code === appliedCoupons.get(couponKey(item))) || null

const pruneCoupons = (applied, items) => {
  const ids = new Set(items.map(couponKey))
  const next = new Map([...applied].filter(([id]) => ids.has(id)))
  return next.size === applied.size ? applied : next
}

export const useBagStore = create((set, get) => ({
  items: [],

  // couponKey(item) -> the coupon code the customer picked for that product
  appliedCoupons: new Map(),

  toggleCoupon: (bagId, code) =>
    set((s) => {
      const item = s.items.find((i) => i.id === bagId)
      // ponytail: no code means "the best one", which is what a single-coupon caller meant.
      const picked = code ?? itemOffers(item || {})[0]?.code
      if (!picked) return {}
      const key = couponKey(item || { id: bagId })
      const next = new Map(s.appliedCoupons)
      if (next.get(key) === picked) next.delete(key)
      else next.set(key, picked)
      return { appliedCoupons: next }
    }),

  getCouponSavings: () => {
    const { items, appliedCoupons } = get()
    return items
      .filter((item) => item.selected)
      .reduce((total, item) => total + offerAmount(item, appliedOffer(item, appliedCoupons)), 0)
  },

  platformFee: 23,
  mobileMenuOpen: false,

  // ponytail: a removed line takes its applied coupon with it, whichever path removed it.
  setItems: (items) =>
    set((s) => ({ items, appliedCoupons: pruneCoupons(s.appliedCoupons, items) })),

  addGuestItem: (item) => {
    const existing = getGuestBag()
    const dup = existing.find(i => i.productId === item.productId && i.size === item.size && i.colorName === item.colorName)
    const updated = dup
      ? existing.map(i => i === dup ? { ...i, qty: i.qty + 1 } : i)
      : [...existing, item]
    saveGuestBag(updated)
    set({ items: updated })
  },

  toggleSelected: (id) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.id === id ? { ...i, selected: !i.selected } : i,
      ),
    })),

  removeItem: (id) => get().setItems(get().items.filter((i) => i.id !== id)),

  updateQty: (id, delta) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i,
      ),
    })),

  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
}))
