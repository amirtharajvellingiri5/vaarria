import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Heart } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const MSG91_WIDGET_ID = '366568623534393236303030'
const MSG91_TOKEN_AUTH = '147259Txua8xfclqV69fd54e9P1'
const GOLD = '#C9A84C'
const NAVY = '#050C1C'

// Singleton script loader — mirrors LoginPage pattern
let msg91Loaded = false
function useMSG91Script() {
  const [ready, setReady] = useState(() => msg91Loaded)
  useEffect(() => {
    if (msg91Loaded) { setReady(true); return }
    if (document.querySelector('script[src*="otp-provider.js"]')) { msg91Loaded = true; setReady(true); return }
    msg91Loaded = true
    const script = document.createElement('script')
    script.src = 'https://verify.msg91.com/otp-provider.js'
    script.async = true
    script.onload = () => {
      window.initSendOTP({
        widgetId: MSG91_WIDGET_ID,
        tokenAuth: MSG91_TOKEN_AUTH,
        exposeMethods: true,
        success: () => {},
        failure: () => {},
      })
      setReady(true)
    }
    script.onerror = () => { msg91Loaded = false }
    document.body.appendChild(script)
  }, [])
  return ready
}

// ─── Phone step ───────────────────────────────────────────────────────────────
function PhoneStep({ onContinue }) {
  const msg91Ready = useMSG91Script()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isReady = phone.length === 10 && msg91Ready

  const handleSend = () => {
    if (!isReady) return
    setLoading(true)
    setError('')
    window.sendOtp(
      `91${phone}`,
      () => { setLoading(false); onContinue(phone) },
      (err) => { setLoading(false); setError(typeof err === 'string' ? err : err?.message || 'Failed to send OTP') },
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', border: `1px solid #e5e7eb`, borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ padding: '12px 12px', background: '#f9f9f7', borderRight: '1px solid #e5e7eb', fontSize: 13, fontWeight: 600, color: '#555', flexShrink: 0 }}>+91</div>
        <input
          type='tel'
          inputMode='numeric'
          placeholder='Mobile number'
          value={phone}
          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          disabled={loading}
          style={{ flex: 1, border: 'none', outline: 'none', padding: '12px 14px', fontSize: 14, background: 'transparent' }}
        />
      </div>
      {error && <p style={{ fontSize: 12, color: '#e53935', margin: 0 }}>{error}</p>}
      <button
        onClick={handleSend}
        disabled={!isReady || loading}
        style={{
          padding: '13px', background: isReady && !loading ? NAVY : '#e5e7eb',
          color: isReady && !loading ? GOLD : '#aaa',
          border: isReady && !loading ? `1px solid ${GOLD}` : '1px solid transparent',
          borderRadius: 8, fontSize: 13, fontWeight: 700,
          cursor: isReady && !loading ? 'pointer' : 'not-allowed',
          letterSpacing: '0.06em', fontFamily: "'DM Sans', sans-serif",
          transition: 'all 0.2s',
        }}
      >
        {loading ? 'Sending…' : 'SEND OTP'}
      </button>
      <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', margin: 0 }}>
        By continuing, you agree to our Terms &amp; Privacy Policy
      </p>
    </div>
  )
}

// ─── OTP step ─────────────────────────────────────────────────────────────────
function OtpStep({ phone, onBack, onSuccess }) {
  const { login } = useAuthStore()
  const [digits, setDigits] = useState(['', '', '', ''])
  const [seconds, setSeconds] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [state, setState] = useState('idle') // idle | shake | success
  const refs = [useRef(), useRef(), useRef(), useRef()]

  useEffect(() => { refs[0].current?.focus() }, [])

  useEffect(() => {
    if (seconds <= 0) { setCanResend(true); return }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const pad = n => String(n).padStart(2, '0')

  const verifyOtp = useCallback(async (otp) => {
    setVerifying(true)
    setError('')
    try {
      const widgetData = await new Promise((resolve, reject) => {
        window.verifyOtp(otp, resolve, err => reject(new Error(typeof err === 'string' ? err : err?.message || 'Invalid OTP')))
      })
      const res = await fetch('https://b1ubc4krn6.execute-api.ap-south-1.amazonaws.com/prod/api/auth/msg91-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_no: phone, access_token: widgetData?.message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Invalid OTP')
      setState('success')
      login(data.token, data.customer)
      setTimeout(() => onSuccess(data.customer), 800)
    } catch (err) {
      setState('shake')
      setTimeout(() => { setState('idle'); setDigits(['', '', '', '']); refs[0].current?.focus() }, 400)
      setError(err.message)
    } finally {
      setVerifying(false)
    }
  }, [phone, onSuccess, login])

  const handleChange = (i, val) => {
    setError('')
    if (state !== 'idle') setState('idle')
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = v
    setDigits(next)
    if (v && i < 3) refs[i + 1].current?.focus()
    if (i === 3 && v) verifyOtp(next.join(''))
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs[i - 1].current?.focus()
  }

  const handleResend = useCallback(async () => {
    if (resending) return
    setResending(true)
    setError('')
    setDigits(['', '', '', ''])
    setState('idle')
    window.retryOtp('11',
      () => { setCanResend(false); setSeconds(30); setResending(false); refs[0].current?.focus() },
      (err) => { setError(typeof err === 'string' ? err : err?.message || 'Could not resend'); setResending(false) },
    )
  }, [resending])

  const digitClass = d => {
    let cls = 'lp-otp-digit'
    if (d || state === 'success') cls += ' filled'
    if (state === 'shake') cls += ' shake'
    if (state === 'success') cls += ' success'
    return cls
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px', textAlign: 'center' }}>
        Sent to <strong style={{ color: NAVY }}>+91 {phone}</strong>
      </p>
      <div className='lp-otp-inputs' style={{ justifyContent: 'center', marginBottom: 8 }}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={refs[i]}
            className={digitClass(d)}
            type='tel'
            inputMode='numeric'
            maxLength={1}
            value={d}
            disabled={verifying || state === 'success'}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
          />
        ))}
      </div>
      {error
        ? <p style={{ fontSize: 12, color: '#e53935', textAlign: 'center', margin: '4px 0' }}>{error}</p>
        : state === 'success'
          ? <p style={{ fontSize: 12, color: '#10b981', textAlign: 'center', margin: '4px 0' }}>✓ Verified!</p>
          : <div style={{ height: 20 }} />
      }
      <div style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
        {canResend
          ? <button onClick={handleResend} disabled={resending} style={{ background: 'none', border: 'none', color: GOLD, fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>{resending ? 'Sending…' : 'Resend OTP'}</button>
          : <>Resend in <strong>{pad(Math.floor(seconds / 60))}:{pad(seconds % 60)}</strong></>
        }
      </div>
      <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 12, cursor: 'pointer', marginTop: 8 }}>← Change number</button>
    </div>
  )
}

// ─── Modal shell ──────────────────────────────────────────────────────────────
export default function WishlistLoginModal({ onClose, onLoggedIn }) {
  const [phone, setPhone] = useState(null)

  // Close on Escape
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: 16, width: '100%', maxWidth: 360,
          padding: '28px 28px 24px',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
          animation: 'wishModalIn 0.22s cubic-bezier(.4,0,.2,1)',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <style>{`
          @keyframes wishModalIn { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: none; } }
          @keyframes lp-shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
          .lp-otp-inputs { display: flex; gap: 12px; margin-bottom: 4px; }
          .lp-otp-digit { width: 52px; height: 52px; border: 1.5px solid #e8e8e8; border-radius: 6px; text-align: center; font-size: 22px; font-weight: 700; color: #3A332A; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s; caret-color: #A65A66; }
          .lp-otp-digit:focus { border-color: #A65A66; box-shadow: 0 0 0 3px rgba(166,90,102,0.12); }
          .lp-otp-digit.filled { border-color: #A65A66; background: #fff0f3; }
          .lp-otp-digit.shake { animation: lp-shake 0.35s ease both; border-color: #e53935; background: #fff5f5; }
          .lp-otp-digit.success { border-color: #2e7d32 !important; background: #f1f8f1 !important; }
        `}</style>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Heart size={20} color={GOLD} fill={GOLD} />
            <span style={{ fontSize: 16, fontWeight: 700, color: NAVY, fontFamily: "'Playfair Display', Georgia, serif" }}>
              {phone ? 'Enter OTP' : 'Save to Wishlist'}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
            <X size={18} />
          </button>
        </div>

        {!phone
          ? <PhoneStep onContinue={setPhone} />
          : <OtpStep phone={phone} onBack={() => setPhone(null)} onSuccess={onLoggedIn} />
        }
      </div>
    </div>
  )
}
