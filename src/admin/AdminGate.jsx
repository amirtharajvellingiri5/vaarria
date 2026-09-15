import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getE2eAuth } from '../utils/e2e'

const ADMIN_MOBILE_NUMBERS = new Set(['9731580157', '8553797479'])

// ponytail: strips +91/leading-zero formatting drift so a pre-existing
// customer record doesn't silently fail the exact-string admin check
const normalizeMobile = (mobileNo) => String(mobileNo || '').replace(/\D/g, '').slice(-10)

const AUTH_DISABLED = false // TEMP: admin auth bypass — flip to false before deploying

export default function AdminGate({ children }) {
  const location = useLocation()
  const customer = useAuthStore((s) => s.customer)

  if (AUTH_DISABLED || getE2eAuth()) return children

  if (!customer || !ADMIN_MOBILE_NUMBERS.has(normalizeMobile(customer.mobile_no))) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    )
  }

  return children
}
