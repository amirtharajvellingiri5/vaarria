import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

// ponytail: base64 is obfuscation, not encryption — matches the explicit
// "encode/decode, don't store in db" ask, not a real secret-storage mechanism
const ENCODED_PASSWORD = 'U2FpYmFiYSExOTAw'
const ADMIN_MOBILE_NUMBERS = new Set(['9731580157', '8553797479'])

// ponytail: strips +91/leading-zero formatting drift so a pre-existing
// customer record doesn't silently fail the exact-string admin check
const normalizeMobile = (mobileNo) => String(mobileNo || '').replace(/\D/g, '').slice(-10)

export default function AdminGate({ children }) {
  const location = useLocation()
  const customer = useAuthStore((s) => s.customer)
  const [unlocked, setUnlocked] = useState(
    sessionStorage.getItem('admin_unlocked') === 'true'
  )
  const [input, setInput] = useState('')
  const [error, setError] = useState('')

  if (!unlocked) {
    const submit = (e) => {
      e.preventDefault()
      if (input === atob(ENCODED_PASSWORD)) {
        sessionStorage.setItem('admin_unlocked', 'true')
        setUnlocked(true)
      } else {
        setError('Wrong password')
      }
    }

    return (
      <div style={{ maxWidth: 320, margin: '80px auto', textAlign: 'center' }}>
        <h2>Admin Access</h2>
        <form onSubmit={submit}>
          <input
            type="password"
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Password"
            style={{ width: '100%', padding: 8, marginBottom: 8 }}
          />
          <button type="submit" style={{ width: '100%', padding: 8 }}>
            Unlock
          </button>
        </form>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    )
  }

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
