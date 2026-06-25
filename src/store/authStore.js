import { create } from 'zustand'

const AUTH_API = 'https://api.vaarria.com'

const readCustomer = () => {
  const raw = localStorage.getItem('customer')
  return raw && raw !== 'undefined' ? JSON.parse(raw) : null
}

export const useAuthStore = create((set, get) => ({
  // access token is in-memory only — never persisted to localStorage
  token: null,
  customer: readCustomer(),

  login(token, customer) {
    localStorage.setItem('customer', JSON.stringify(customer))
    set({ token, customer })
  },

  setToken(token) {
    set({ token })
  },

  logout() {
    localStorage.removeItem('customer')
    set({ token: null, customer: null })
    fetch(`${AUTH_API}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {})
  },

  async refreshToken() {
    try {
      const res = await fetch(`${AUTH_API}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) {
        get().logout()
        return null
      }
      const { token } = await res.json()
      set({ token })
      return token
    } catch {
      return null
    }
  },
}))
