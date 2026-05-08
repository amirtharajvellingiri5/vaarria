import React, { useState, useEffect, useRef } from 'react'
import Navbar from './Navbar' // your existing Navbar

// ─── Styles ──────────────────────────────────────────────────────────────────
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

  /* ── Card ── */
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

  /* ── Promo Banner ── */
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
    font-size: 22px;
    font-weight: 800;
    color: #ff3f6c;
    line-height: 1.1;
  }
  .lp-promo-text p {
    font-size: 11px;
    color: #999;
    margin-top: 2px;
    font-weight: 400;
  }
  .lp-promo-code {
    display: inline-block;
    background: #ff3f6c;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    padding: 3px 10px;
    border-radius: 3px;
    margin-top: 6px;
  }
  .lp-promo-badge {
    margin-left: auto;
    flex-shrink: 0;
    width: 56px;
    height: 56px;
    background: #ff3f6c;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    line-height: 1.3;
    text-align: center;
    box-shadow: 0 4px 12px rgba(255,63,108,0.4);
  }
  .lp-promo-badge strong { font-size: 15px; display: block; }

  /* ── Form Body ── */
  .lp-form-body {
    padding: 28px 24px 32px;
    animation: lp-fadeIn 0.25s ease both;
  }
  @keyframes lp-fadeIn {
    from { opacity: 0; transform: translateX(-10px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  .lp-title {
    font-size: 18px;
    font-weight: 400;
    color: #282c3f;
    margin-bottom: 24px;
  }
  .lp-title strong { font-weight: 700; }

  /* ── Phone Input ── */
  .lp-phone-wrap {
    display: flex;
    align-items: center;
    border: 1px solid #e8e8e8;
    border-radius: 4px;
    overflow: hidden;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .lp-phone-wrap:focus-within {
    border-color: #ff3f6c;
    box-shadow: 0 0 0 3px rgba(255,63,108,0.08);
  }
  .lp-phone-code {
    padding: 14px 12px;
    font-size: 14px;
    font-weight: 500;
    color: #282c3f;
    border-right: 1px solid #e8e8e8;
    background: #fafafa;
    white-space: nowrap;
    font-family: 'DM Sans', sans-serif;
  }
  .lp-phone-input {
    border: none;
    outline: none;
    padding: 14px 12px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    color: #282c3f;
    flex: 1;
    width: 100%;
  }
  .lp-phone-input::placeholder { color: #bbb; }

  /* ── Checkbox ── */
  .lp-checkbox-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-top: 16px;
  }
  .lp-checkbox-row input[type="checkbox"] {
    width: 15px;
    height: 15px;
    margin-top: 2px;
    accent-color: #ff3f6c;
    flex-shrink: 0;
    cursor: pointer;
  }
  .lp-checkbox-row label {
    font-size: 12px;
    color: #94969f;
    line-height: 1.5;
    cursor: pointer;
  }
  .lp-checkbox-row label a {
    color: #ff3f6c;
    text-decoration: none;
    font-weight: 500;
  }
  .lp-checkbox-row label a:hover { text-decoration: underline; }

  /* ── Button ── */
  .lp-btn-continue {
    display: block;
    width: 100%;
    background: #c0c0c0;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 14px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: not-allowed;
    margin-top: 20px;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.2s, transform 0.12s, box-shadow 0.2s;
  }
  .lp-btn-continue.active {
    background: #ff3f6c;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(255,63,108,0.35);
  }
  .lp-btn-continue.active:hover {
    background: #e5365f;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(255,63,108,0.4);
  }
  .lp-btn-continue.active:active { transform: translateY(0); }

  .lp-help {
    text-align: center;
    margin-top: 18px;
    font-size: 13px;
    color: #94969f;
  }
  .lp-help a { color: #ff3f6c; text-decoration: none; font-weight: 500; }
  .lp-help a:hover { text-decoration: underline; }

  /* ── OTP Screen ── */
  .lp-otp-body {
    padding: 36px 24px 40px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    animation: lp-fadeIn 0.25s ease both;
  }
  .lp-otp-icon {
    width: 72px;
    height: 72px;
    background: linear-gradient(135deg, #e8f4fd, #d0eaff);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    font-size: 32px;
    animation: lp-iconPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both 0.1s;
  }
  @keyframes lp-iconPop {
    from { transform: scale(0.5); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }
  .lp-otp-title {
    font-size: 20px;
    font-weight: 700;
    color: #282c3f;
    margin-bottom: 6px;
  }
  .lp-otp-subtitle {
    font-size: 13px;
    color: #94969f;
    margin-bottom: 28px;
  }
  .lp-otp-subtitle span { font-weight: 600; color: #282c3f; }

  /* ── OTP Digits ── */
  .lp-otp-inputs {
    display: flex;
    gap: 12px;
    margin-bottom: 20px;
  }
  .lp-otp-digit {
    width: 52px;
    height: 52px;
    border: 1.5px solid #e8e8e8;
    border-radius: 6px;
    text-align: center;
    font-size: 22px;
    font-weight: 700;
    color: #282c3f;
    font-family: 'DM Sans', sans-serif;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
    caret-color: #ff3f6c;
  }
  .lp-otp-digit:focus {
    border-color: #ff3f6c;
    box-shadow: 0 0 0 3px rgba(255,63,108,0.1);
    transform: scale(1.06);
  }
  .lp-otp-digit.filled {
    border-color: #ff3f6c;
    background: #fff0f3;
  }

  .lp-resend {
    font-size: 13px;
    color: #94969f;
    margin-bottom: 16px;
    min-height: 22px;
  }
  .lp-resend strong { color: #282c3f; font-weight: 700; }
  .lp-resend-btn {
    background: none;
    border: none;
    color: #ff3f6c;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    padding: 0;
  }
  .lp-resend-btn:hover { text-decoration: underline; }

  .lp-alt-login {
    font-size: 13px;
    color: #94969f;
    margin-bottom: 14px;
  }
  .lp-alt-login a { color: #ff3f6c; font-weight: 600; text-decoration: none; }
  .lp-alt-login a:hover { text-decoration: underline; }

  .lp-back-btn {
    background: none;
    border: none;
    color: #94969f;
    font-size: 12px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 6px;
    transition: color 0.15s;
    padding: 0;
  }
  .lp-back-btn:hover { color: #282c3f; }
`

// ─── OTP Screen ───────────────────────────────────────────────────────────────
function OtpScreen({ phone, onBack }) {
  const [digits, setDigits] = useState(['', '', '', ''])
  const [seconds, setSeconds] = useState(20)
  const [canResend, setCanResend] = useState(false)
  const refs = [useRef(), useRef(), useRef(), useRef()]

  useEffect(() => {
    refs[0].current?.focus()
  }, [])

  useEffect(() => {
    if (seconds <= 0) { setCanResend(true); return }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const handleResend = () => {
    setSeconds(20)
    setCanResend(false)
    setDigits(['', '', '', ''])
    refs[0].current?.focus()
  }

  const handleChange = (i, val) => {
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = v
    setDigits(next)
    if (v && i < 3) refs[i + 1].current?.focus()
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      refs[i - 1].current?.focus()
    }
  }

  const pad = n => String(n).padStart(2, '0')

  return (
    <div className="lp-otp-body">
      <div className="lp-otp-icon">📱</div>
      <h2 className="lp-otp-title">Verify with OTP</h2>
      <p className="lp-otp-subtitle">
        Sent to <span>+91 {phone}</span>
      </p>

      <div className="lp-otp-inputs">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={refs[i]}
            className={`lp-otp-digit${d ? ' filled' : ''}`}
            type="tel"
            maxLength={1}
            value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
          />
        ))}
      </div>

      <div className="lp-resend">
        {canResend ? (
          <button className="lp-resend-btn" onClick={handleResend}>
            Resend OTP
          </button>
        ) : (
          <>Resend OTP in: <strong>{pad(Math.floor(seconds / 60))}:{pad(seconds % 60)}</strong></>
        )}
      </div>

      <p className="lp-alt-login">
        Log in using <a href="#">Password</a>
      </p>
      <p className="lp-help">
        Having trouble logging in? <a href="#">Get help</a>
      </p>
      <button className="lp-back-btn" onClick={onBack}>
        ← Change number
      </button>
    </div>
  )
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
function LoginScreen({ onContinue }) {
  const [phone, setPhone] = useState('')
  const [agreed, setAgreed] = useState(false)

  const isReady = phone.length === 10 && agreed

  const handlePhone = e => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10)
    setPhone(val)
  }

  return (
    <>
      {/* Promo Banner */}
      <div className="lp-promo">
        <div className="lp-promo-text">
          <h2>FLAT ₹300 OFF</h2>
          <p>On your 1st order + exciting offers*</p>
          <span className="lp-promo-code">CODE: TRENDY300</span>
        </div>
        <div className="lp-promo-badge">
          <strong>₹300</strong>OFF
        </div>
      </div>

      {/* Form */}
      <div className="lp-form-body">
        <p className="lp-title">
          <strong>Login</strong> or <strong>Signup</strong>
        </p>

        <div className="lp-phone-wrap">
          <div className="lp-phone-code">+91</div>
          <input
            className="lp-phone-input"
            type="tel"
            placeholder="Mobile Number*"
            value={phone}
            onChange={handlePhone}
          />
        </div>

        <div className="lp-checkbox-row">
          <input
            type="checkbox"
            id="lp-terms"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
          />
          <label htmlFor="lp-terms">
            By continuing, I agree to the{' '}
            <a href="#">Terms of Use</a> &amp;{' '}
            <a href="#">Privacy Policy</a> and I am above 18 years old.
          </label>
        </div>

        <button
          className={`lp-btn-continue${isReady ? ' active' : ''}`}
          onClick={() => isReady && onContinue(phone)}
          disabled={!isReady}
        >
          CONTINUE
        </button>

        <p className="lp-help">
          Have trouble logging in? <a href="#">Get help</a>
        </p>
      </div>
    </>
  )
}

// ─── LoginPage (main export) ──────────────────────────────────────────────────
export default function LoginPage() {
  const [screen, setScreen] = useState('login') // 'login' | 'otp'
  const [phone, setPhone] = useState('')

  const handleContinue = p => {
    setPhone(p)
    setScreen('otp')
  }

  return (
    <>
      <style>{styles}</style>
      <Navbar />
      <div className="login-page">
        <div className="lp-card">
          {screen === 'login' ? (
            <LoginScreen onContinue={handleContinue} />
          ) : (
            <OtpScreen phone={phone} onBack={() => setScreen('login')} />
          )}
        </div>
      </div>
    </>
  )
}
