import { create } from 'zustand'
import { AUTH_URL } from '../config'

const AUTH_API = AUTH_URL

const readCustomer = () => {
  const raw = localStorage.getItem('customer')
  return raw && raw !== 'undefined' ? JSON.parse(raw) : null
}

const readRefreshToken = () => {
  const raw = localStorage.getItem('refresh_token')
  return raw && raw !== 'undefined' ? raw : null
}

export const useAuthStore = create((set, get) => ({
  // access token is in-memory only — never persisted to localStorage
  token: null,
  customer: readCustomer(),
  // refresh token persisted to localStorage: the httponly cookie is cross-site
  // (vaarria.com vs amazonaws.com) and gets blocked by Safari/modern browsers,
  // so localStorage is what actually keeps the user logged in across reloads.
  refresh: readRefreshToken(),

  login(token, customer, refreshToken) {
    // wipe any earlier session first so a stale refresh_token from a
    // previous mobile number can never survive a fresh login
    localStorage.removeItem('customer')
    localStorage.removeItem('refresh_token')
    localStorage.setItem('customer', JSON.stringify(customer))
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken)
    set({ token, customer, refresh: refreshToken || null })
  },

  setToken(token) {
    set({ token })
  },

  logout() {
    localStorage.removeItem('customer')
    localStorage.removeItem('refresh_token')
    set({ token: null, customer: null, refresh: null })
    fetch(`${AUTH_API}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {})
  },

  async refreshToken() {
    try {
      const stored = get().refresh
      const res = await fetch(`${AUTH_API}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stored ? { refresh_token: stored } : {}),
      })
      if (!res.ok) {
        if (res.status === 401) get().logout()
        return null
      }
      const { token, refresh_token } = await res.json()
      if (refresh_token) {
        localStorage.setItem('refresh_token', refresh_token)
        set({ token, refresh: refresh_token })
      } else {
        set({ token })
      }
      return token
    } catch {
      return null
    }
  },

  startAutoRefresh() {
    // Refresh access token every 25 min (expires at 30 min)
    const id = setInterval(() => {
      if (get().customer) get().refreshToken()
    }, 25 * 60 * 1000)
    return () => clearInterval(id)
  },
}))
