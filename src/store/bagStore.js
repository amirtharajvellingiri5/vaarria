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

export const useBagStore = create((set, get) => ({
  items: [],

  appliedCouponIds: new Set(),

  toggleCoupon: (bagId) =>
    set((s) => {
      const next = new Set(s.appliedCouponIds)
      next.has(bagId) ? next.delete(bagId) : next.add(bagId)
      return { appliedCouponIds: next }
    }),

  getCouponSavings: () => {
    const { items, appliedCouponIds } = get()
    return items
      .filter(
        (item) =>
          item.selected &&
          appliedCouponIds.has(item.id) &&
          item.couponDiscount > 0,
      )
      .reduce((total, item) => {
        if (item.discountType === 'PERCENTAGE') {
          return total + Math.floor((item.price * item.qty * item.couponDiscount) / 100)
        }
        return total + item.couponDiscount * item.qty
      }, 0)
  },

  platformFee: 23,
  mobileMenuOpen: false,

  setItems: (items) => set({ items }),

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

  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

  updateQty: (id, delta) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i,
      ),
    })),

  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
}))
