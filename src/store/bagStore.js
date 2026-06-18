import { create } from 'zustand'

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
  donationAmount: 0,
  mobileMenuOpen: false,

  setItems: (items) => set({ items }),

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

  setDonation: (amt) =>
    set((s) => ({ donationAmount: s.donationAmount === amt ? 0 : amt })),

  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
}))
