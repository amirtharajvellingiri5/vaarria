// CouponModal.jsx
import React, { useState } from 'react'
import { X, Tag, Check } from 'lucide-react'

const coupons = [
  {
    id: 1,
    code: 'MYNTRAEXCLUSIVE',
    savings: 251,
    description: '30% off on minimum purchase of Rs. 300',
    expires: '29th June 2026 | 11:30 PM',
  },
  {
    id: 2,
    code: 'FWDSAVE',
    savings: 150,
    description: '10% off upto Rs. 150 on minimum purchase of Rs. 198',
    expires: '30th April 2026 | 11:59 PM',
  },
]

export default function CouponModal({ isOpen, onClose, onApply }) {
  const [selected, setSelected] = useState(coupons.map(c => c.id))
  const [manualCode, setManualCode] = useState('')

  if (!isOpen) return null

  const toggle = (id) =>
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )

  const totalSavings = coupons
    .filter(c => selected.includes(c.id))
    .reduce((sum, c) => sum + c.savings, 0)

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: '6px',
          width: '100%', maxWidth: 480,
          maxHeight: '90vh',
          display: 'flex', flexDirection: 'column',
          animation: 'slideUp 0.3s ease',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 20px 16px',
          borderBottom: '1px solid #f0f0f0',
        }}>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: 1 }}>
            APPLY COUPON
          </span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={22} color="#333" />
          </button>
        </div>

        {/* Input */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{
            display: 'flex', alignItems: 'center',
            border: '1px solid #ddd', borderRadius: 8,
            overflow: 'hidden',
          }}>
            <input
              value={manualCode}
              onChange={e => setManualCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code"
              style={{
                flex: 1, padding: '12px 14px',
                border: 'none', outline: 'none',
                fontSize: 14, color: '#333',
              }}
            />
            <button style={{
              padding: '12px 16px',
              background: 'none', border: 'none',
              color: '#FF3F6C', fontWeight: 700,
              fontSize: 13, letterSpacing: 0.5, cursor: 'pointer',
            }}>
              CHECK
            </button>
          </div>
        </div>

        {/* Coupon List */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {coupons.map(coupon => {
            const isSelected = selected.includes(coupon.id)
            return (
              <div
                key={coupon.id}
                onClick={() => toggle(coupon.id)}
                style={{
                  padding: '20px',
                  borderBottom: '1px solid #f5f5f5',
                  cursor: 'pointer',
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                }}
              >
                {/* Checkbox */}
                <div style={{
                  width: 22, height: 22, borderRadius: 4, flexShrink: 0,
                  marginTop: 2,
                  background: isSelected ? '#FF3F6C' : '#fff',
                  border: isSelected ? '2px solid #FF3F6C' : '2px solid #ccc',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}>
                  {isSelected && <Check size={13} color="#fff" strokeWidth={3} />}
                </div>

                {/* Coupon Info */}
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'inline-block',
                    border: '1.5px dashed #FF3F6C',
                    borderRadius: 6, padding: '5px 12px',
                    marginBottom: 10,
                  }}>
                    <span style={{
                      color: '#FF3F6C', fontWeight: 700,
                      fontSize: 13, letterSpacing: 0.5,
                    }}>
                      {coupon.code}
                    </span>
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#222', marginBottom: 4 }}>
                    Save ₹{coupon.savings}
                  </p>
                  <p style={{ fontSize: 13, color: '#555', marginBottom: 3 }}>
                    {coupon.description}.
                  </p>
                  <p style={{ fontSize: 12, color: '#888' }}>
                    Expires on: {coupon.expires}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderTop: '1px solid #f0f0f0',
          background: '#fff',
        }}>
          <div>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>Maximum savings:</p>
            <p style={{ fontWeight: 800, fontSize: 20, color: '#222' }}>₹{totalSavings}</p>
          </div>
          <button
            onClick={() => { onApply(selected); onClose(); }}
            style={{
              background: '#FF3F6C', color: '#fff',
              border: 'none', borderRadius: 8,
              padding: '14px 48px',
              fontWeight: 700, fontSize: 14,
              letterSpacing: 1, cursor: 'pointer',
            }}
          >
            APPLY
          </button>
        </div>
<style>{`
  @keyframes slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`}</style>
      </div>
    </div>
  )
}
