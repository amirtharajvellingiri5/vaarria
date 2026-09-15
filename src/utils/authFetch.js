import { useAuthStore } from '../store/authStore'
import { getE2eAuth } from './e2e'

export async function authFetch(url, options = {}) {
  const store = useAuthStore.getState()
  let token = store.token

  if (!token && store.customer) {
    token = await store.refreshToken()
  }

  const e2e = getE2eAuth()
  const makeHeaders = (t) => ({
    ...(options.headers || {}),
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
    ...(e2e ? { 'X-E2E-Auth': e2e } : {}),
  })

  const res = await fetch(url, { ...options, headers: makeHeaders(token) })

  if (res.status === 401 && store.customer) {
    const newToken = await store.refreshToken()
    if (newToken) {
      return fetch(url, { ...options, headers: makeHeaders(newToken) })
    }
  }

  return res
}
