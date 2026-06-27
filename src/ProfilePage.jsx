import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Phone, Mail, MapPin, Plus, Pencil, Trash2, CheckCircle2, AlertCircle, Home, Briefcase } from 'lucide-react'
import { useAuthStore } from './store/authStore'
import { authFetch } from './utils/authFetch'

const GOLD = '#C9A84C'
const NAVY = '#050C1C'
import { ORDERS_URL } from './config'
const API = ORDERS_URL

const ADDR_FIELDS = [
  { key: 'full_name',      label: 'Full Name',      required: true,  col: 1 },
  { key: 'mobile_no',      label: 'Mobile',         required: true,  col: 1 },
  { key: 'address_line_1', label: 'Address Line 1', required: true,  col: 2 },
  { key: 'address_line_2', label: 'Address Line 2', required: false, col: 2 },
  { key: 'landmark',       label: 'Landmark',       required: false, col: 2 },
  { key: 'city',           label: 'City',           required: true,  col: 1 },
  { key: 'state',          label: 'State',          required: true,  col: 1 },
  { key: 'pincode',        label: 'Pincode',        required: true,  col: 1 },
]

function AddressModal({ addr, customerId, onClose, onSaved }) {
  const isEdit = !!addr?.address_id
  const [form, setForm] = useState({
    full_name:      addr?.full_name      || '',
    mobile_no:      addr?.mobile_no      || '',
    address_line_1: addr?.address_line_1 || '',
    address_line_2: addr?.address_line_2 || '',
    landmark:       addr?.landmark       || '',
    city:           addr?.city           || '',
    state:          addr?.state          || '',
    pincode:        addr?.pincode        || '',
    address_type:   addr?.address_type   || 'HOME',
    country:        'India',
    is_default:     addr?.is_default     || false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = key => e => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSave = async () => {
    const missing = ADDR_FIELDS.filter(f => f.required && !form[f.key]?.trim())
    if (missing.length) { setError(`Required: ${missing.map(f => f.label).join(', ')}`); return }
    try {
      setSaving(true); setError('')
      const res = isEdit
        ? await authFetch(`${API}/addresses/${addr.address_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, customer_id: customerId }),
          })
        : await authFetch(`${API}/addresses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...form, customer_id: customerId }),
          })
      if (!res.ok) {
        const d = (await res.json().catch(() => ({}))).detail
        setError(Array.isArray(d) ? d.map(e => e.msg).join(', ') : d || 'Failed to save address')
        setSaving(false)
        return
      }
      onSaved()
    } catch (err) {
      setError(err.message || 'Failed to save address')
      setSaving(false)
    }
  }

  const inp = {
    width: '100%', boxSizing: 'border-box', border: '1.5px solid #e8e0d0',
    borderRadius: 8, padding: '10px 12px', fontSize: 13, color: NAVY,
    outline: 'none', background: '#fff', fontFamily: 'inherit',
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && !saving && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(5,12,28,0.6)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div style={{
        width: '100%', maxWidth: 480, background: '#fff', borderRadius: 16,
        boxShadow: '0 24px 64px rgba(5,12,28,0.22)', border: '1px solid #e8e0d0',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <div style={{
          padding: '18px 22px 14px', borderBottom: `1px solid ${GOLD}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
        }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>
            {isEdit ? 'Edit Address' : 'Add New Address'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        <div style={{ padding: '18px 22px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Address type */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>Type</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['HOME', 'WORK', 'OTHER'].map(t => (
                <button
                  key={t}
                  onClick={() => setForm(f => ({ ...f, address_type: t }))}
                  style={{
                    padding: '7px 14px', borderRadius: 6, cursor: 'pointer',
                    border: form.address_type === t ? `1.5px solid ${GOLD}` : '1.5px solid #e8e0d0',
                    background: form.address_type === t ? '#fffdf5' : '#fff',
                    fontSize: 12, fontWeight: 600, color: form.address_type === t ? NAVY : '#888',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}
                >
                  {t === 'HOME' ? <Home size={12} /> : t === 'WORK' ? <Briefcase size={12} /> : <MapPin size={12} />}
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Name + Mobile row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {['full_name', 'mobile_no'].map(key => {
              const meta = ADDR_FIELDS.find(f => f.key === key)
              return (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>
                    {meta.label} {meta.required && <span style={{ color: GOLD }}>*</span>}
                  </label>
                  <input
                    value={form[key]} onChange={set(key)}
                    style={inp}
                    onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = `0 0 0 3px ${GOLD}18` }}
                    onBlur={e => { e.target.style.borderColor = '#e8e0d0'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              )
            })}
          </div>

          {/* Line 1, Line 2, Landmark */}
          {['address_line_1', 'address_line_2', 'landmark'].map(key => {
            const meta = ADDR_FIELDS.find(f => f.key === key)
            return (
              <div key={key}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>
                  {meta.label} {meta.required && <span style={{ color: GOLD }}>*</span>}
                </label>
                <input
                  value={form[key]} onChange={set(key)}
                  style={inp}
                  onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = `0 0 0 3px ${GOLD}18` }}
                  onBlur={e => { e.target.style.borderColor = '#e8e0d0'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            )
          })}

          {/* City / State / Pincode */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {['city', 'state', 'pincode'].map(key => {
              const meta = ADDR_FIELDS.find(f => f.key === key)
              return (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>
                    {meta.label} {meta.required && <span style={{ color: GOLD }}>*</span>}
                  </label>
                  <input
                    value={form[key]} onChange={set(key)}
                    style={inp}
                    onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = `0 0 0 3px ${GOLD}18` }}
                    onBlur={e => { e.target.style.borderColor = '#e8e0d0'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              )
            })}
          </div>

          {/* Set as default */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', userSelect: 'none' }}>
            <div
              onClick={() => setForm(f => ({ ...f, is_default: !f.is_default }))}
              style={{
                width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                border: form.is_default ? `2px solid ${GOLD}` : '2px solid #ddd',
                background: form.is_default ? GOLD : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              {form.is_default && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: NAVY, fontWeight: 500 }}>Set as default address</span>
          </label>

          {error && (
            <p style={{ fontSize: 12, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <AlertCircle size={13} /> {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              onClick={onClose} disabled={saving}
              style={{ padding: '10px 22px', borderRadius: 8, cursor: 'pointer', border: `1.5px solid ${GOLD}66`, background: '#fff', fontSize: 13, fontWeight: 600, color: NAVY, opacity: saving ? 0.5 : 1 }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave} disabled={saving}
              style={{ padding: '10px 28px', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', border: `1px solid ${GOLD}`, background: saving ? '#e8e0d0' : NAVY, fontSize: 13, fontWeight: 700, color: GOLD, fontFamily: "'Playfair Display', Georgia, serif", opacity: saving ? 0.8 : 1 }}
            >
              {saving ? 'Saving…' : 'Save Address'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { customer, login: storeLogin } = useAuthStore()

  const [name, setName] = useState(customer?.name || '')
  const [email, setEmail] = useState(customer?.email || '')
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState(null)

  const [addresses, setAddresses] = useState([])
  const [addrLoading, setAddrLoading] = useState(false)
  const [showAddrModal, setShowAddrModal] = useState(false)
  const [editingAddr, setEditingAddr] = useState(null)

  const customerId = customer?.customer_id
  const mobileNo = customer?.mobile_no

  useEffect(() => {
    if (!customerId) return
    loadAddresses()
    // Load email from backend (may not be in authStore)
    fetch(`${API}/customers/${mobileNo}`)
      .then(r => r.json())
      .then(d => { setEmail(d.email || '') })
      .catch(() => {})
  }, [customerId, mobileNo])

  const loadAddresses = async () => {
    setAddrLoading(true)
    try {
      const res = await authFetch(`${API}/addresses?customer_id=${customerId}`)
      const data = await res.json()
      setAddresses(data.items || [])
    } catch {
      setAddresses([])
    } finally {
      setAddrLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!mobileNo) return
    setSavingProfile(true); setProfileMsg(null)
    try {
      const res = await authFetch(`${API}/customers/${mobileNo}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.detail || 'Failed to save.')
      // Update authStore so Navbar / other components see the new name
      if (storeLogin) {
        const token = localStorage.getItem('token') || ''
        storeLogin(token, { ...customer, name: data.name, email: data.email })
      }
      setProfileMsg({ ok: true, text: 'Profile updated.' })
    } catch (err) {
      setProfileMsg({ ok: false, text: err.message || 'Failed to save.' })
    } finally {
      setSavingProfile(false)
    }
  }

  const deleteAddress = async (addrId) => {
    if (!window.confirm('Delete this address?')) return
    try {
      const res = await authFetch(`${API}/addresses/${addrId}?customer_id=${customerId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      loadAddresses()
    } catch {
      alert('Failed to delete address.')
    }
  }

  const setDefaultAddress = async (addrId) => {
    try {
      const res = await authFetch(`${API}/addresses/${addrId}/select?customer_id=${customerId}`, { method: 'PUT' })
      if (!res.ok) throw new Error()
      loadAddresses()
    } catch {
      alert('Failed to set default.')
    }
  }

  if (!customer) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f4f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <p style={{ fontSize: 15, color: '#666' }}>Please log in to view your profile.</p>
        <button onClick={() => navigate('/login')} style={{ background: NAVY, color: GOLD, border: `1px solid ${GOLD}`, borderRadius: 8, padding: '12px 32px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Playfair Display', Georgia, serif" }}>
          Login
        </button>
      </div>
    )
  }

  const inp = {
    width: '100%', boxSizing: 'border-box', border: '1.5px solid #e8e0d0',
    borderRadius: 8, padding: '11px 14px', fontSize: 14, color: NAVY,
    outline: 'none', background: '#fff', fontFamily: 'inherit',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', fontFamily: '"Sora", "Segoe UI", sans-serif' }}>

      {/* Top Nav */}
      <div style={{ background: NAVY, padding: '0 24px', position: 'sticky', top: 0, zIndex: 50, boxShadow: '0 2px 16px rgba(5,12,28,0.3)' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 64 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: `1px solid ${GOLD}44`, cursor: 'pointer', display: 'flex', alignItems: 'center', color: GOLD, padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600 }}
          >
            <ArrowLeft size={16} />
          </button>
          <img src="/vlogo.png" alt="Vaarria" onClick={() => navigate('/')} style={{ height: 38, objectFit: 'contain', cursor: 'pointer' }} />
          <div style={{ marginLeft: 'auto' }}>
            <span style={{ fontSize: 11, color: `${GOLD}cc`, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>My Profile</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 24px 60px' }}>

        {/* ── Personal Info ── */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e0d0', marginBottom: 20, overflow: 'hidden', boxShadow: '0 2px 8px rgba(5,12,28,0.05)' }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${NAVY}, ${GOLD})` }} />
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${GOLD}22`, border: `1.5px solid ${GOLD}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={20} color={GOLD} />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>Personal Information</h2>
                <p style={{ fontSize: 12, color: '#94969f', margin: '2px 0 0' }}>Update your name and email address</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                  <User size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Full Name
                </label>
                <input
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your full name"
                  style={inp}
                  onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = `0 0 0 3px ${GOLD}18` }}
                  onBlur={e => { e.target.style.borderColor = '#e8e0d0'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                  <Phone size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Mobile Number
                </label>
                <div style={{ ...inp, background: '#f9f8f6', color: '#94969f', cursor: 'not-allowed', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>+91 {mobileNo}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, background: '#e8f5e9', color: '#2e7d32', padding: '2px 8px', borderRadius: 10 }}>Verified</span>
                </div>
                <p style={{ fontSize: 11, color: '#94969f', margin: '4px 0 0' }}>Mobile number cannot be changed — it's your login ID.</p>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 6 }}>
                  <Mail size={11} style={{ verticalAlign: 'middle', marginRight: 4 }} />Email Address
                </label>
                <input
                  value={email} onChange={e => setEmail(e.target.value)}
                  type="email" placeholder="your@email.com"
                  style={inp}
                  onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = `0 0 0 3px ${GOLD}18` }}
                  onBlur={e => { e.target.style.borderColor = '#e8e0d0'; e.target.style.boxShadow = 'none' }}
                />
              </div>

              {profileMsg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: profileMsg.ok ? '#16a34a' : '#dc2626' }}>
                  {profileMsg.ok ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {profileMsg.text}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={saveProfile} disabled={savingProfile}
                  style={{
                    padding: '11px 32px', borderRadius: 8, cursor: savingProfile ? 'not-allowed' : 'pointer',
                    border: `1px solid ${GOLD}`, background: savingProfile ? '#e8e0d0' : NAVY,
                    fontSize: 13, fontWeight: 700, color: GOLD,
                    fontFamily: "'Playfair Display', Georgia, serif", opacity: savingProfile ? 0.8 : 1,
                  }}
                >
                  {savingProfile ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Addresses ── */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e8e0d0', overflow: 'hidden', boxShadow: '0 2px 8px rgba(5,12,28,0.05)' }}>
          <div style={{ height: 3, background: `linear-gradient(90deg, ${NAVY}, ${GOLD})` }} />
          <div style={{ padding: '20px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: `${GOLD}22`, border: `1.5px solid ${GOLD}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={20} color={GOLD} />
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: NAVY, margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>Saved Addresses</h2>
                  <p style={{ fontSize: 12, color: '#94969f', margin: '2px 0 0' }}>{addresses.length} address{addresses.length !== 1 ? 'es' : ''} saved</p>
                </div>
              </div>
              <button
                onClick={() => { setEditingAddr(null); setShowAddrModal(true) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px', borderRadius: 8, cursor: 'pointer',
                  border: `1px solid ${GOLD}`, background: NAVY,
                  fontSize: 12, fontWeight: 700, color: GOLD,
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                <Plus size={14} /> Add New
              </button>
            </div>

            {addrLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[1, 2].map(i => (
                  <div key={i} style={{ height: 100, background: '#f5f4f0', borderRadius: 10, animation: 'profPulse 1.5s ease-in-out infinite' }} />
                ))}
              </div>
            ) : addresses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 20px', color: '#94969f' }}>
                <MapPin size={32} style={{ color: '#ddd', marginBottom: 10 }} />
                <p style={{ fontSize: 14, marginBottom: 4 }}>No addresses saved yet.</p>
                <p style={{ fontSize: 12 }}>Add an address to make checkout faster.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {addresses.map(addr => (
                  <div
                    key={addr.address_id}
                    style={{
                      border: addr.is_default ? `1.5px solid ${GOLD}` : '1.5px solid #e8e0d0',
                      borderRadius: 10, padding: '14px 16px',
                      background: addr.is_default ? '#fffdf5' : '#fdfcf9',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>{addr.full_name}</span>
                          {addr.address_type && (
                            <span style={{ fontSize: 10, fontWeight: 700, background: `${GOLD}22`, color: GOLD, borderRadius: 4, padding: '2px 7px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              {addr.address_type}
                            </span>
                          )}
                          {addr.is_default && (
                            <span style={{ fontSize: 10, fontWeight: 700, background: '#dcfce7', color: '#16a34a', borderRadius: 4, padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 3 }}>
                              <CheckCircle2 size={10} /> Default
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, margin: '0 0 4px' }}>
                          {addr.address_line_1}
                          {addr.address_line_2 && `, ${addr.address_line_2}`}
                          {addr.landmark && `, Near ${addr.landmark}`}
                        </p>
                        <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, margin: '0 0 4px' }}>
                          {addr.city}{addr.state ? `, ${addr.state}` : ''} – {addr.pincode}
                        </p>
                        <p style={{ fontSize: 12, color: '#94969f', margin: 0 }}>📞 {addr.mobile_no}</p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                        <button
                          onClick={() => { setEditingAddr(addr); setShowAddrModal(true) }}
                          title="Edit"
                          style={{ background: '#fff', border: '1px solid #e8e0d0', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: NAVY, fontWeight: 600 }}
                        >
                          <Pencil size={12} color={GOLD} /> Edit
                        </button>
                        {!addr.is_default && (
                          <button
                            onClick={() => setDefaultAddress(addr.address_id)}
                            style={{ background: '#fff', border: '1px solid #e8e0d0', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12, color: '#666', fontWeight: 500 }}
                          >
                            Set default
                          </button>
                        )}
                        <button
                          onClick={() => deleteAddress(addr.address_id)}
                          title="Delete"
                          style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#dc2626', fontWeight: 600 }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddrModal && (
        <AddressModal
          addr={editingAddr}
          customerId={customerId}
          onClose={() => setShowAddrModal(false)}
          onSaved={() => { setShowAddrModal(false); loadAddresses() }}
        />
      )}

      <style>{`@keyframes profPulse { 0%,100%{opacity:1} 50%{opacity:.5} }`}</style>
    </div>
  )
}
