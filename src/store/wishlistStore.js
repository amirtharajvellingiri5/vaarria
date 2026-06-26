import { create } from 'zustand'

import { ORDERS_URL } from '../config'
const ORDERS = ORDERS_URL

export const useWishlistStore = create((set, get) => ({
  productIds: new Set(),
  loaded: false,

  async load(customerId) {
    try {
      const res = await fetch(`${ORDERS}/wishlist/${customerId}`, { credentials: 'include' })
      const { product_ids = [] } = await res.json()
      set({ productIds: new Set(product_ids.map(String)), loaded: true })
    } catch {
      set({ loaded: true })
    }
  },

  async toggle(customerId, productId) {
    const id = String(productId)
    const { productIds } = get()
    const isWishlisted = productIds.has(id)
    const next = new Set(productIds)

    if (isWishlisted) {
      next.delete(id)
      set({ productIds: next })
      fetch(`${ORDERS}/wishlist/remove`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ customer_id: customerId, product_id: Number(productId) }),
      }).catch(() => {})
    } else {
      next.add(id)
      set({ productIds: next })
      fetch(`${ORDERS}/wishlist/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ customer_id: customerId, product_id: Number(productId) }),
      }).catch(() => {})
    }
    return !isWishlisted
  },

  isWishlisted(productId) {
    return get().productIds.has(String(productId))
  },
}))
