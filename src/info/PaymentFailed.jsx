import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { XCircle } from 'lucide-react'
import logo from '../assets/logo.jpg'

function PaymentFailed() {
  const location = useLocation()
  const navigate = useNavigate()

  const reason = location.state?.reason || 'Payment could not be completed'

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* <a href='/' style={styles.logoLink}>
          <img src={logo} alt='Logo' style={styles.logo} />
        </a> */}

        <div style={styles.iconWrapper}>
          <XCircle size={90} color='#ef4444' />
        </div>

        <h1 style={styles.title}>Payment Failed</h1>

        <p style={styles.subtitle}>{reason}</p>

        <div style={styles.actions}>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate('/bag')}
          >
            TRY AGAIN
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={() => navigate('/')}
          >
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  card: {
    width: '100%',
    maxWidth: 600,
    background: '#fff',
    borderRadius: 20,
    padding: 40,
    boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
    textAlign: 'center',
  },

  logoLink: {
    display: 'inline-block',
    marginBottom: 20,
  },

  logo: {
    height: 110,
    width: 'auto',
    objectFit: 'contain',
  },

  iconWrapper: {
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
  },

  title: {
    fontSize: 32,
    marginTop: 20,
    marginBottom: 10,
    color: '#111827',
  },

  subtitle: {
    color: '#6b7280',
    marginBottom: 30,
    fontSize: 15,
  },

  actions: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },

  primaryBtn: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    padding: '14px 24px',
    borderRadius: 10,
    fontWeight: 700,
    cursor: 'pointer',
  },

  secondaryBtn: {
    background: '#fff',
    color: '#111827',
    border: '1px solid #d1d5db',
    padding: '14px 24px',
    borderRadius: 10,
    fontWeight: 700,
    cursor: 'pointer',
  },
}

export default PaymentFailed