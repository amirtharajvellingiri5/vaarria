import { create } from 'zustand'

import { ORDERS_URL } from '../config'
import { authFetch } from '../utils/authFetch'
const ORDERS = ORDERS_URL

export const useWishlistStore = create((set, get) => ({
  productIds: new Set(),
  loaded: false,

  async load(customerId) {
    try {
      const res = await authFetch(`${ORDERS}/wishlist/${customerId}`)
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
      authFetch(`${ORDERS}/wishlist/remove`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId, product_id: Number(productId) }),
      }).catch(() => {})
    } else {
      next.add(id)
      set({ productIds: next })
      authFetch(`${ORDERS}/wishlist/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId, product_id: Number(productId) }),
      }).catch(() => {})
    }
    return !isWishlisted
  },

  isWishlisted(productId) {
    return get().productIds.has(String(productId))
  },
}))
