import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { getE2eAuth } from './utils/e2e'

// ponytail: customer-facing twin of AdminGate — bounces logged-out visitors to
// /login?redirect=<here>, which LoginPage already reads and navigates back to.
// Guarding the route (not the page) covers every entry point at once: the
// navbar link, ReviewPage, OrderSuccess and a pasted URL.
// customer is hydrated from localStorage when the store is created, so this is
// correct on a hard reload — no auth round-trip to wait on.
export default function RequireAuth({ children }) {
  const location = useLocation()
  const customer = useAuthStore((s) => s.customer)

  if (customer || getE2eAuth()) return children

  return (
    <Navigate
      to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`}
      replace
    />
  )
}
