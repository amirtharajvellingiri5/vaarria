import { useAuthStore } from '../store/authStore'
import { getE2eAuth } from './e2e'

// ponytail: one source of truth for the auth request headers, previously
// copy-pasted identically into ~8 components. Also attaches the e2e bypass
// code (X-E2E-Auth) when present so admin/order writes work under bypass.
export const authHeaders = () => {
  const token = useAuthStore.getState().token
  const e2e = getE2eAuth()
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(e2e ? { 'X-E2E-Auth': e2e } : {}),
  }
}
