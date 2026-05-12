import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Navbar from './Navbar'

// ─── MSG91 Config — replace with your real values ─────────────────────────────
const MSG91_WIDGET_ID = '366568623534393236303030' // widgetId from MSG91 dashboard
const MSG91_TOKEN_AUTH = '147259Txua8xfclqV69fd54e9P1' // tokenAuth from MSG91 dashboard

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .login-page * { box-sizing: border-box; }

  .login-page {
    font-family: 'DM Sans', sans-serif;
    background: linear-gradient(135deg, #ffe4ec 0%, #fff8f0 50%, #fce4d6 100%);
    min-height: calc(100vh - 60px);
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 40px 20px 60px;
  }

  .lp-card {
    background: #fff;
    border-radius: 2px;
    width: 100%;
    max-width: 360px;
    box-shadow: 0 2px 20px rgba(0,0,0,0.09);
    overflow: hidden;
    animation: lp-cardUp 0.35s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes lp-cardUp {
    from { opacity: 0; transform: translateY(22px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Promo ── */
  .lp-promo {
    background: linear-gradient(120deg, #fff5e0, #ffe8cc);
    padding: 18px 20px;
    display: flex;
    align-items: center;
    gap: 14px;
    border-bottom: 1px solid #fde8cc;
  }
  .lp-promo-text h2 {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 800;
    color: #ff3f6c; line-height: 1.1;
  }
  .lp-promo-text p { font-size: 11px; color: #999; margin-top: 2px; }
  .lp-promo-code {
    display: inline-block;
    background: #ff3f6c; color: #fff;
    font-size: 11px; font-weight: 700;
    letter-spacing: 0.08em;
    padding: 3px 10px; border-radius: 3px; margin-top: 6px;
  }
  .lp-promo-badge {
    margin-left: auto; flex-shrink: 0;
    width: 56px; height: 56px;
    background: #ff3f6c; border-radius: 50%;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    color: #fff; font-size: 9px; font-weight: 700;
    letter-spacing: 0.05em; text-transform: uppercase;
    line-height: 1.3; text-align: center;
    box-shadow: 0 4px 12px rgba(255,63,108,0.4);
  }
  .lp-promo-badge strong { font-size: 15px; display: block; }

  /* ── Form Body ── */
  .lp-form-body { padding: 28px 24px 32px; animation: lp-fadeIn 0.25s ease both; }
  @keyframes lp-fadeIn {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .lp-title { font-size: 18px; font-weight: 400; color: #282c3f; margin-bottom: 24px; }
  .lp-title strong { font-weight: 700; }

  /* ── Phone Input ── */
  .lp-phone-wrap {
    display: flex; align-items: center;
    border: 1px solid #e8e8e8; border-radius: 4px;
    overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .lp-phone-wrap:focus-within {
    border-color: #ff3f6c;
    box-shadow: 0 0 0 3px rgba(255,63,108,0.08);
  }
  .lp-phone-code {
    padding: 14px 12px; font-size: 14px; font-weight: 500;
    color: #282c3f; border-right: 1px solid #e8e8e8;
    background: #fafafa; white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
  }
  .lp-phone-input {
    border: none; outline: none;
    padding: 14px 12px; font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    color: #282c3f; flex: 1; width: 100%;
  }
  .lp-phone-input::placeholder { color: #bbb; }

  /* ── Checkbox ── */
  .lp-checkbox-row { display: flex; align-items: flex-start; gap: 10px; margin-top: 16px; }
  .lp-checkbox-row input[type="checkbox"] {
    width: 15px; height: 15px; margin-top: 2px;
    accent-color: #ff3f6c; flex-shrink: 0; cursor: pointer;
  }
  .lp-checkbox-row label { font-size: 12px; color: #94969f; line-height: 1.5; cursor: pointer; }
  .lp-checkbox-row label a { color: #ff3f6c; text-decoration: none; font-weight: 500; }
  .lp-checkbox-row label a:hover { text-decoration: underline; }

  /* ── Buttons ── */
  .lp-btn-continue, .lp-btn-verify {
    display: block; width: 100%;
    background: #c0c0c0; color: #fff;
    border: none; border-radius: 4px;
    padding: 14px;
    font-size: 14px; font-weight: 700;
    letter-spacing: 0.08em; text-transform: uppercase;
    cursor: not-allowed;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.2s, transform 0.12s, box-shadow 0.2s;
    position: relative;
  }
  .lp-btn-continue { margin-top: 20px; }
  .lp-btn-verify   { margin-top: 14px; margin-bottom: 16px; }

  .lp-btn-continue.active, .lp-btn-verify.active {
    background: #ff3f6c; cursor: pointer;
    box-shadow: 0 4px 14px rgba(255,63,108,0.35);
  }
  .lp-btn-continue.active:hover, .lp-btn-verify.active:hover {
    background: #e5365f; transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(255,63,108,0.4);
  }
  .lp-btn-continue.active:active, .lp-btn-verify.active:active { transform: translateY(0); }
  .lp-btn-continue.loading, .lp-btn-verify.loading { cursor: wait; opacity: 0.82; }

  /* ── Spinner ── */
  .lp-spinner {
    display: inline-block;
    width: 15px; height: 15px;
    border: 2px solid rgba(255,255,255,0.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: lp-spin 0.7s linear infinite;
    vertical-align: middle;
    margin-right: 7px;
  }
  @keyframes lp-spin { to { transform: rotate(360deg); } }

  /* ── Messages ── */
  .lp-error   { margin-top: 10px; font-size: 12px; color: #e53935; text-align: center; animation: lp-fadeIn 0.2s ease both; }
  .lp-success { margin-top: 10px; font-size: 12px; color: #2e7d32; text-align: center; animation: lp-fadeIn 0.2s ease both; }

  .lp-help { text-align: center; margin-top: 18px; font-size: 13px; color: #94969f; }
  .lp-help a { color: #ff3f6c; text-decoration: none; font-weight: 500; }
  .lp-help a:hover { text-decoration: underline; }

  /* ── OTP Screen ── */
  .lp-otp-body {
    padding: 36px 24px 40px;
    display: flex; flex-direction: column;
    align-items: center; text-align: center;
    animation: lp-fadeIn 0.25s ease both;
  }
  .lp-otp-icon {
    width: 72px; height: 72px;
    background: linear-gradient(135deg, #e8f4fd, #d0eaff);
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px; font-size: 32px;
    animation: lp-iconPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both 0.1s;
  }
  @keyframes lp-iconPop {
    from { transform: scale(0.5); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }
  .lp-otp-title { font-size: 20px; font-weight: 700; color: #282c3f; margin-bottom: 6px; }
  .lp-otp-subtitle { font-size: 13px; color: #94969f; margin-bottom: 28px; }
  .lp-otp-subtitle span { font-weight: 600; color: #282c3f; }

  /* ── OTP Digits ── */
  .lp-otp-inputs { display: flex; gap: 12px; margin-bottom: 4px; }
  .lp-otp-digit {
    width: 52px; height: 52px;
    border: 1.5px solid #e8e8e8; border-radius: 6px;
    text-align: center;
    font-size: 22px; font-weight: 700;
    color: #282c3f; font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
    caret-color: #ff3f6c;
  }
  .lp-otp-digit:focus {
    border-color: #ff3f6c;
    box-shadow: 0 0 0 3px rgba(255,63,108,0.1);
    transform: scale(1.06);
  }
  .lp-otp-digit.filled  { border-color: #ff3f6c; background: #fff0f3; }
  .lp-otp-digit.shake   { animation: lp-shake 0.35s ease both; border-color: #e53935; background: #fff5f5; }
  .lp-otp-digit.success { border-color: #2e7d32 !important; background: #f1f8f1 !important; }

  @keyframes lp-shake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-5px); }
    40%     { transform: translateX(5px); }
    60%     { transform: translateX(-4px); }
    80%     { transform: translateX(4px); }
  }

  /* ── Resend ── */
  .lp-resend { font-size: 13px; color: #94969f; margin-bottom: 16px; min-height: 22px; }
  .lp-resend strong { color: #282c3f; font-weight: 700; }
  .lp-resend-btn {
    background: none; border: none;
    color: #ff3f6c; font-size: 13px; font-weight: 600;
    cursor: pointer; font-family: 'DM Sans', sans-serif; padding: 0;
  }
  .lp-resend-btn:hover { text-decoration: underline; }
  .lp-resend-btn:disabled { color: #ccc; cursor: default; text-decoration: none; }

  .lp-back-btn {
    background: none; border: none;
    color: #94969f; font-size: 12px; cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    display: flex; align-items: center; gap: 4px;
    margin-top: 6px; transition: color 0.15s; padding: 0;
  }
  .lp-back-btn:hover { color: #282c3f; }
`

// ─── useMSG91Script ───────────────────────────────────────────────────────────
// Injects the MSG91 OTP provider script once and exposes a `ready` flag
function useMSG91Script() {
  const [ready, setReady] = useState(
    () => typeof window !== 'undefined' && !!window.initSendOTP,
  )

  useEffect(() => {
    if (window.initSendOTP) {
      setReady(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://verify.msg91.com/otp-provider.js'
    script.async = true
    script.onload = () => {
      window.initSendOTP({
        widgetId: MSG91_WIDGET_ID,
        tokenAuth: MSG91_TOKEN_AUTH,
        exposeMethods: true,

        success: (data) => {
          console.log('[MSG91] success', data)
        },

        failure: (err) => {
          console.log('[MSG91] failure', err)
        },
      })

      setReady(true)
      console.log('initSendOTP', window.initSendOTP)
      console.log('sendOtp', window.sendOtp)
      console.log('verifyOtp', window.verifyOtp)
      console.log('retryOtp', window.retryOtp)
    }
    script.onerror = () => console.error('[MSG91] Script load failed')
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script)
    }
  }, [])

  return ready
}

// ─── OTP Screen ───────────────────────────────────────────────────────────────
function OtpScreen({ phone, onBack, onVerified }) {
  const [digits, setDigits] = useState(['', '', '', ''])
  const [seconds, setSeconds] = useState(30)
const [redirectSeconds, setRedirectSeconds] = useState(null)
  const [canResend, setCanResend] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [digitState, setDigitState] = useState('idle') // 'idle' | 'shake' | 'success'

  const refs = [useRef(), useRef(), useRef(), useRef()]

  useEffect(() => {
    refs[0].current?.focus()
  }, [])

  // Countdown
  useEffect(() => {
    if (seconds <= 0) {
      setCanResend(true)
      return
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  useEffect(() => {
  if (redirectSeconds === null) return
  if (redirectSeconds <= 0) {
    onVerified?.()
    return
  }

  const timer = setTimeout(() => {
    setRedirectSeconds((s) => s - 1)
  }, 1000)

  return () => clearTimeout(timer)
}, [redirectSeconds, onVerified])

  const pad = (n) => String(n).padStart(2, '0')

  // ── MSG91 verify ──
  // MSG91's initSendOTP also handles verification when `otp` is passed in config
  const verifyOtp = useCallback(
    async (otpValue) => {
      setVerifying(true)
      setError('')

      try {
        const response = await fetch(
          'https://api.aarria.com/api/auth/verify-otp',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              mobile_no: phone,
              otp: otpValue,
            }),
          },
        )

        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.detail || 'Invalid OTP')
        }

        setDigitState('success')

        localStorage.setItem('jwt_token', data.token)
        localStorage.setItem('customer', JSON.stringify(data.customer))

        setVerifying(true)
setRedirectSeconds(5)
      } catch (err) {
        setDigitState('shake')

        setTimeout(() => {
          setDigitState('idle')
          setDigits(['', '', '', ''])
          refs[0].current?.focus()
        }, 400)

        setError(err.message)
      } finally {
        setVerifying(false)
      }
    },
    [phone, onVerified],
  )

  // ── Input change ──
  const handleChange = (i, val) => {
    setError('')
    if (digitState !== 'idle') setDigitState('idle')
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = v
    setDigits(next)
    if (v && i < 3) refs[i + 1].current?.focus()
    // Auto-verify when last digit entered
    if (i === 3 && v) verifyOtp(next.join(''))
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0)
      refs[i - 1].current?.focus()
  }

  // ── Manual verify (fallback button) ──
  const handleVerifyClick = () => {
    const otp = digits.join('')
    if (otp.length === 4 && !verifying) verifyOtp(otp)
  }
  const handleResend = useCallback(async () => {
    if (resending) return

    setResending(true)
    setError('')
    setDigits(['', '', '', ''])
    setDigitState('idle')

    try {
      const response = await fetch(
        'https://api.aarria.com/api/auth/generate-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobile_no: phone,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Could not resend OTP')
      }

      setCanResend(false)
      setSeconds(30)
      refs[0].current?.focus()
    } catch (err) {
      setError(err.message)
    } finally {
      setResending(false)
    }
  }, [resending, phone])

  const allFilled = digits.every((d) => d !== '')

  const digitClass = (d) => {
    let cls = 'lp-otp-digit'
    if (d || digitState === 'success') cls += ' filled'
    if (digitState === 'shake') cls += ' shake'
    if (digitState === 'success') cls += ' success'
    return cls
  }

  return (
    <div className='lp-otp-body'>
      <div className='lp-otp-icon'>📱</div>
      <h2 className='lp-otp-title'>Verify with OTP</h2>
      <p className='lp-otp-subtitle'>
        Sent to <span>+91 {phone}</span>
      </p>

      {/* 4-digit boxes */}
      <div className='lp-otp-inputs'>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={refs[i]}
            className={digitClass(d)}
            type='tel'
            inputMode='numeric'
            maxLength={1}
            value={d}
            disabled={verifying || digitState === 'success'}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
          />
        ))}
      </div>

      {/* Feedback */}
      {error ? (
        <p className='lp-error'>{error}</p>
      ) : digitState === 'success' ? (
    <p className='lp-success'>
  ✓ Verified successfully! Redirecting in {redirectSeconds}s...
</p>
      ) : (
        <div style={{ minHeight: 18 }} />
      )}

      {/* Verify button — auto-fires on last digit but kept as a manual fallback */}
      <button
        className={`lp-btn-verify${
  allFilled && !verifying && digitState !== 'success' ? ' active' : ''
}${verifying ? ' loading' : ''}`}
        onClick={handleVerifyClick}
        disabled={
  !allFilled ||
  verifying ||
  digitState === 'success' ||
  redirectSeconds !== null
}
      >
        {verifying ? (
          <>
            <span className='lp-spinner' />
            Verifying…
          </>
        ) : (
          'VERIFY OTP'
        )}
      </button>

      {/* Resend row */}
      <div className='lp-resend'>
        {canResend ? (
          <button
            className='lp-resend-btn'
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? 'Sending…' : 'Resend OTP'}
          </button>
        ) : (
          <>
            Resend OTP in:{' '}
            <strong>
              {pad(Math.floor(seconds / 60))}:{pad(seconds % 60)}
            </strong>
          </>
        )}
      </div>

      <p className='lp-help'>
        Having trouble logging in? <a href='#'>Get help</a>
      </p>
      <button className='lp-back-btn' onClick={onBack}>
        ← Change number
      </button>
    </div>
  )
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onContinue }) {
  const [phone, setPhone] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const msg91Ready = true

  const isReady = phone.length === 10 && agreed && msg91Ready

  const handlePhone = (e) => {
    setError('')
    setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
  }

  // ── Send OTP via MSG91 ──
  const handleContinue = async () => {
    if (!isReady) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        'https://api.aarria.com/api/auth/generate-otp',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mobile_no: phone,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to send OTP')
      }

      onContinue(phone)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <>
      {/* Promo Banner */}
      <div className='lp-promo'>
        <div className='lp-promo-text'>
          <h2>FLAT ₹300 OFF</h2>
          <p>On your 1st order + exciting offers*</p>
          <span className='lp-promo-code'>CODE: TRENDY300</span>
        </div>
        <div className='lp-promo-badge'>
          <strong>₹300</strong>OFF
        </div>
      </div>

      {/* Form */}
      <div className='lp-form-body'>
        <p className='lp-title'>
          <strong>Login</strong> or <strong>Signup</strong>
        </p>

        <div className='lp-phone-wrap'>
          <div className='lp-phone-code'>+91</div>
          <input
            className='lp-phone-input'
            type='tel'
            inputMode='numeric'
            placeholder='Mobile Number*'
            value={phone}
            onChange={handlePhone}
            disabled={loading}
          />
        </div>

        <div className='lp-checkbox-row'>
          <input
            type='checkbox'
            id='lp-terms'
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            disabled={loading}
          />
          <label htmlFor='lp-terms'>
            By continuing, I agree to the <a href='#'>Terms of Use</a> &amp;{' '}
            <a href='#'>Privacy Policy</a> and I am above 18 years old.
          </label>
        </div>

        <button
          className={`lp-btn-continue${isReady ? ' active' : ''}${loading ? ' loading' : ''}`}
          onClick={handleContinue}
          disabled={!isReady || loading}
        >
          {loading ? (
            <>
              <span className='lp-spinner' />
              Sending OTP…
            </>
          ) : !msg91Ready ? (
            'Loading…'
          ) : (
            'CONTINUE'
          )}
        </button>

        {error && <p className='lp-error'>{error}</p>}

        <p className='lp-help'>
          Have trouble logging in? <a href='#'>Get help</a>
        </p>
      </div>
    </>
  )
}

export default function LoginPage() {
  const [screen, setScreen] = useState('login')
  const [phone, setPhone] = useState('')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const handleVerified = (data) => {
    const redirectTo = searchParams.get('redirect') || '/'

    // token already stored in localStorage by OtpScreen
    navigate(redirectTo, { replace: true })
  }

  return (
    <>
      <style>{styles}</style>
      <Navbar />
      <div className='login-page'>
        <div className='lp-card'>
          {screen === 'login' ? (
            <LoginScreen
              onContinue={(p) => {
                setPhone(p)
                setScreen('otp')
              }}
            />
          ) : (
            <OtpScreen
              phone={phone}
              onBack={() => setScreen('login')}
              onVerified={handleVerified}
            />
          )}
        </div>
      </div>
    </>
  )
}
