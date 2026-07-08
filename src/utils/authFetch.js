import { useAuthStore } from '../store/authStore'

export async function authFetch(url, options = {}) {
  const store = useAuthStore.getState()
  let token = store.token

  if (!token && store.customer) {
    token = await store.refreshToken()
  }

  const makeHeaders = (t) => ({
    ...(options.headers || {}),
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
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
