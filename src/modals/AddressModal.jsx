import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'

import { ORDERS_URL } from '../config'
import { authFetch } from '../utils/authFetch'
const ORDERS_API_BASE = ORDERS_URL

const GOLD = '#C9A84C'
const NAVY = '#050C1C'

const inputStyle = {
  height: 40,
  width: '100%',
  borderRadius: 6,
  border: '1px solid #d4c9a8',
  padding: '0 12px',
  fontSize: 13,
  color: NAVY,
  background: '#fffdf5',
  outline: 'none',
  boxSizing: 'border-box',
}

export default function AddressModal({
  open,
  onClose,
  addresses = [],
  selectedAddress = null,
  onSelectAddress,
  onDeleteSuccess,
  onAddressAdded,
  customerId,
}) {
  const [showAddAddressPopup, setShowAddAddressPopup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const handleDeleteAddress = async (addressId) => {
    try {
      setDeletingId(addressId)
      const response = await authFetch(
        `${ORDERS_API_BASE}/addresses/${addressId}?customer_id=${customerId}`,
        { method: 'DELETE' },
      )
      if (!response.ok) throw new Error('Failed to delete address')
      if (selectedAddress?.address_id === addressId) {
        onClose()
      } else {
        onDeleteSuccess?.()
      }
    } catch (error) {
      alert(error.message)
    } finally {
      setDeletingId(null)
    }
  }

  const [form, setForm] = useState({
    full_name: '', mobile_no: '', address_line_1: '', address_line_2: '',
    landmark: '', city: '', state: '', country: 'India',
    pincode: '', address_type: 'HOME', is_default: false,
  })

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSaveAddress = async () => {
    try {
      setLoading(true)
      const response = await authFetch(`${ORDERS_API_BASE}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId, ...form }),
      })
      if (!response.ok) throw new Error('Failed to add address')
      const { address_id } = await response.json()
      const newAddress = { ...form, address_id, customer_id: customerId }
      setShowSuccess(true)
      setShowAddAddressPopup(false)
      onAddressAdded?.(newAddress)
      setTimeout(() => setShowSuccess(false), 1500)
      setForm({
        full_name: '', mobile_no: '', address_line_1: '', address_line_2: '',
        landmark: '', city: '', state: '', country: 'India',
        pincode: '', address_type: 'HOME', is_default: false,
      })
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <>
      {/* ── Main modal ── */}
      <div style={overlay}>
        <div style={{ ...sheet, maxWidth: 500 }}>
          {/* Header */}
          <div style={modalHeader}>
            <span style={modalTitle}>Select Delivery Address</span>
            <button onClick={onClose} style={closeBtn}><X size={18} /></button>
          </div>

          {/* Sub-header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 20px', background: '#f9f6ee',
            borderBottom: `1px solid ${GOLD}22`,
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, color: '#888', textTransform: 'uppercase' }}>
              Saved Addresses ({addresses.length})
            </span>
            <button
              onClick={() => setShowAddAddressPopup(true)}
              style={{ fontSize: 12, fontWeight: 700, color: GOLD, background: 'none', border: 'none', cursor: 'pointer' }}
            >
              + Add New
            </button>
          </div>

          {/* Address list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
            {addresses.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
                No saved addresses
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {addresses.map((address) => {
                  const isSelected = selectedAddress?.address_id === address.address_id
                  return (
                    <div
                      key={address.address_id}
                      style={{
                        borderRadius: 8,
                        border: isSelected ? `1.5px solid ${GOLD}` : '1px solid #e8e0d0',
                        background: isSelected ? '#fffbf0' : '#fff',
                        padding: 14,
                      }}
                    >
                      <div style={{ display: 'flex', gap: 12 }}>
                        {/* Radio */}
                        <div style={{
                          marginTop: 3, width: 18, height: 18, borderRadius: '50%',
                          border: `2px solid ${GOLD}`, flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {isSelected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: GOLD }} />}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: NAVY }}>
                                  {address.full_name}
                                </span>
                                {address.is_default && (
                                  <span style={{ fontSize: 10, color: '#aaa' }}>(Default)</span>
                                )}
                              </div>
                              <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6 }}>
                                <p style={{ margin: 0 }}>{address.address_line_1}</p>
                                {address.address_line_2 && <p style={{ margin: 0 }}>{address.address_line_2}</p>}
                                {address.landmark && <p style={{ margin: 0 }}>{address.landmark}</p>}
                                <p style={{ margin: 0 }}>{address.city}, {address.state} – {address.pincode}</p>
                              </div>
                              <p style={{ fontSize: 12, color: '#888', marginTop: 6, marginBottom: 0 }}>
                                Mobile: <span style={{ fontWeight: 700, color: NAVY }}>{address.mobile_no}</span>
                              </p>
                            </div>
                            <span style={{
                              fontSize: 10, fontWeight: 700,
                              border: `1px solid ${GOLD}`, borderRadius: 20,
                              padding: '2px 8px', color: GOLD, whiteSpace: 'nowrap',
                            }}>
                              {address.address_type}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                            <button
                              onClick={async () => {
                                if (isSelected || !onSelectAddress) return
                                try {
                                  const customer = JSON.parse(localStorage.getItem('customer') || 'null')
                                  const response = await authFetch(
                                    `${ORDERS_API_BASE}/addresses/${address.address_id}/select?customer_id=${customer.customer_id}`,
                                    { method: 'PUT' },
                                  )
                                  if (!response.ok) throw new Error('Failed to select address')
                                  onSelectAddress(address)
                                } catch (error) {
                                  alert(error.message)
                                }
                              }}
                              style={{
                                padding: '6px 14px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                                letterSpacing: 0.5, cursor: isSelected ? 'default' : 'pointer',
                                background: isSelected ? NAVY : '#fff',
                                color: isSelected ? GOLD : '#555',
                                border: isSelected ? `1px solid ${GOLD}` : '1px solid #ddd',
                              }}
                            >
                              {isSelected ? 'Delivering Here' : 'Deliver Here'}
                            </button>
                            <button
                              onClick={() => setDeleteTarget(address)}
                              disabled={deletingId === address.address_id}
                              style={{
                                width: 34, height: 34, borderRadius: 6,
                                border: '1px solid #e8e0d0', background: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', opacity: deletingId === address.address_id ? 0.5 : 1,
                              }}
                            >
                              {deletingId === address.address_id
                                ? <span style={{ fontSize: 10 }}>...</span>
                                : <Trash2 size={14} color='#888' />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ borderTop: '1px solid #e8e0d0', padding: '14px 20px' }}>
            <button
              onClick={() => setShowAddAddressPopup(true)}
              style={{
                width: '100%', padding: '11px', borderRadius: 6,
                border: `1.5px solid ${GOLD}`, background: '#fff',
                color: NAVY, fontSize: 13, fontWeight: 700,
                letterSpacing: 0.5, cursor: 'pointer',
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              Add New Address
            </button>
          </div>
        </div>
      </div>

      {/* ── Add address form modal ── */}
      {showAddAddressPopup && (
        <div style={{ ...overlay, zIndex: 60 }}>
          <div style={{ ...sheet, maxWidth: 420 }}>
            <div style={modalHeader}>
              <span style={modalTitle}>Add Address</span>
              <button onClick={() => setShowAddAddressPopup(false)} style={closeBtn}><X size={18} /></button>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['full_name', 'Full Name'],
                ['mobile_no', 'Mobile Number'],
                ['address_line_1', 'Address Line 1'],
                ['address_line_2', 'Address Line 2 (optional)'],
                ['landmark', 'Landmark (optional)'],
                ['city', 'City'],
                ['state', 'State'],
                ['pincode', 'PIN Code'],
              ].map(([field, label]) => (
                <input
                  key={field}
                  value={form[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                  placeholder={label}
                  style={inputStyle}
                />
              ))}
              <button
                onClick={handleSaveAddress}
                disabled={loading}
                style={{
                  height: 42, borderRadius: 6, background: NAVY,
                  color: GOLD, border: `1px solid ${GOLD}`,
                  fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
                  cursor: 'pointer', marginTop: 4,
                  fontFamily: "'Playfair Display', Georgia, serif",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success toast ── */}
      {showSuccess && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 100, background: NAVY, color: GOLD,
          border: `1px solid ${GOLD}`, borderRadius: 6,
          padding: '10px 20px', fontSize: 13, fontWeight: 600,
          boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        }}>
          Address added successfully
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {deleteTarget && (
        <div style={{ ...overlay, zIndex: 80 }}>
          <div style={{ ...sheet, maxWidth: 360 }}>
            <div style={modalHeader}>
              <span style={modalTitle}>Delete Address</span>
              <button onClick={() => setDeleteTarget(null)} style={closeBtn}><X size={18} /></button>
            </div>
            <div style={{ padding: '16px 20px' }}>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginTop: 0 }}>
                Are you sure you want to delete this address?
              </p>
              <div style={{
                borderRadius: 6, border: '1px solid #e8e0d0',
                background: '#fafafa', padding: 12, marginTop: 4,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>{deleteTarget.full_name}</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 4, lineHeight: 1.6 }}>
                  {deleteTarget.address_line_1}
                  {deleteTarget.address_line_2 && `, ${deleteTarget.address_line_2}`}
                  <br />
                  {deleteTarget.city}, {deleteTarget.state} – {deleteTarget.pincode}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, borderTop: '1px solid #e8e0d0', padding: '14px 20px' }}>
              <button
                onClick={() => setDeleteTarget(null)}
                style={{
                  flex: 1, height: 42, borderRadius: 6,
                  border: '1px solid #ddd', background: '#fff',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer', color: '#555',
                }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleDeleteAddress(deleteTarget.address_id)
                  setDeleteTarget(null)
                }}
                disabled={deletingId === deleteTarget.address_id}
                style={{
                  flex: 1, height: 42, borderRadius: 6,
                  background: NAVY, color: GOLD,
                  border: `1px solid ${GOLD}`,
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  opacity: deletingId === deleteTarget.address_id ? 0.6 : 1,
                }}
              >
                {deletingId === deleteTarget.address_id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Shared style tokens ────────────────────────────────────────────────────────
const overlay = {
  position: 'fixed', inset: 0, zIndex: 50,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
}

const sheet = {
  width: '100%', maxHeight: '90vh',
  background: '#fff',
  borderRadius: 8,
  display: 'flex', flexDirection: 'column',
  boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
  overflow: 'hidden',
}

const modalHeader = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '14px 20px',
  borderBottom: '1px solid #e8e0d0',
  flexShrink: 0,
}

const modalTitle = {
  fontSize: 15, fontWeight: 700, color: '#050C1C',
  fontFamily: "'Playfair Display', Georgia, serif",
  letterSpacing: 0.3,
}

const closeBtn = {
  background: 'none', border: 'none', cursor: 'pointer',
  color: '#888', padding: 4, display: 'flex',
}
