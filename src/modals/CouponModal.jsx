// CouponModal.jsx
import React from 'react'
import { X, Check, Tag } from 'lucide-react'

/**
 * Props:
 *  isOpen          boolean
 *  onClose         () => void
 *  items           BagItem[]   — full bag items list from Zustand
 *  appliedCouponIds Set<number> — bag_ids whose coupon is toggled ON
 *  onToggleCoupon  (bagId: number) => void
 */
export default function CouponModal({
  isOpen,
  onClose,
  items = [],
  appliedCouponIds = new Set(),
  onToggleCoupon,
}) {
  if (!isOpen) return null

  // Only show items that have a coupon_discount > 0
  const couponItems = items.filter((i) => i.couponDiscount > 0)

  // Items currently selected in bag (eligible for coupon application)
  const selectedItems = couponItems.filter((i) => i.selected)
  const unselectedItems = couponItems.filter((i) => !i.selected)

  const calcDiscount = (item) => {
    if (item.discountType === 'PERCENTAGE') {
      return Math.round((item.price * item.qty * item.couponDiscount) / 100)
    }
    // FLAT
    return item.couponDiscount * item.qty
  }

  const totalSavings = selectedItems
    .filter((i) => appliedCouponIds.has(i.id))
    .reduce((sum, i) => sum + calcDiscount(i), 0)

  const appliedCount = selectedItems.filter((i) =>
    appliedCouponIds.has(i.id),
  ).length

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 8,
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.25s ease',
        }}
      >
        {/* ── Header ─────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '18px 20px 14px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          <div>
            <span
              style={{ fontWeight: 700, fontSize: 15, letterSpacing: 1, color: '#222' }}
            >
              APPLY COUPONS
            </span>
            {appliedCount > 0 && (
              <span
                style={{
                  marginLeft: 10,
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#ff3f6c',
                  background: '#fff0f4',
                  border: '1px solid #ffd0dc',
                  borderRadius: 20,
                  padding: '2px 9px',
                }}
              >
                {appliedCount} applied
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
          >
            <X size={22} color='#333' />
          </button>
        </div>

        {/* ── Coupon list ─────────────────────────────── */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {couponItems.length === 0 ? (
            <div
              style={{
                padding: '48px 20px',
                textAlign: 'center',
                color: '#aaa',
                fontSize: 14,
              }}
            >
              <Tag size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
              <p>No coupons available for items in your bag</p>
            </div>
          ) : (
            <>
              {/* Selected items — interactive */}
              {selectedItems.length > 0 && (
                <>
                  <div style={sectionLabel}>
                    Coupons for selected items ({selectedItems.length})
                  </div>
                  {selectedItems.map((item) => {
                    const isApplied = appliedCouponIds.has(item.id)
                    const discount = calcDiscount(item)
                    const isPercentage = item.discountType === 'PERCENTAGE'

                    return (
                      <CouponRow
                        key={item.id}
                        item={item}
                        isApplied={isApplied}
                        discount={discount}
                        isPercentage={isPercentage}
                        onToggle={() => onToggleCoupon(item.id)}
                        disabled={false}
                      />
                    )
                  })}
                </>
              )}

              {/* Unselected items — shown dimmed, non-interactive */}
              {unselectedItems.length > 0 && (
                <>
                  <div style={{ ...sectionLabel, color: '#bbb' }}>
                    Coupons for unselected items — select items in bag to apply
                  </div>
                  {unselectedItems.map((item) => {
                    const discount = calcDiscount(item)
                    const isPercentage = item.discountType === 'PERCENTAGE'
                    return (
                      <CouponRow
                        key={item.id}
                        item={item}
                        isApplied={false}
                        discount={discount}
                        isPercentage={isPercentage}
                        onToggle={() => {}}
                        disabled={true}
                      />
                    )
                  })}
                </>
              )}
            </>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────── */}
        <div
          style={{
            padding: '14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #f0f0f0',
            background: '#fff',
          }}
        >
          <div>
            <p style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>
              Total coupon savings
            </p>
            <p style={{ fontWeight: 800, fontSize: 20, color: totalSavings > 0 ? '#2e7d32' : '#222' }}>
              ₹{totalSavings.toLocaleString('en-IN')}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: '#ff3f6c',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '13px 40px',
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: 1,
              cursor: 'pointer',
            }}
          >
            {appliedCount > 0 ? 'DONE' : 'CLOSE'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(40px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
      `}</style>
    </div>
  )
}

// ── CouponRow ────────────────────────────────────────────────────────────────
function CouponRow({ item, isApplied, discount, isPercentage, onToggle, disabled }) {
  return (
    <div
      onClick={disabled ? undefined : onToggle}
      style={{
        padding: '16px 20px',
        borderBottom: '1px solid #f5f5f5',
        cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
        opacity: disabled ? 0.42 : 1,
        transition: 'background 0.15s',
        background: isApplied ? '#fffafc' : '#fff',
      }}
    >
      {/* Checkbox */}
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: 4,
          flexShrink: 0,
          marginTop: 3,
          background: isApplied ? '#ff3f6c' : '#fff',
          border: isApplied ? '2px solid #ff3f6c' : '2px solid #ccc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s ease',
        }}
      >
        {isApplied && <Check size={11} color='#fff' strokeWidth={3} />}
      </div>

      {/* Product thumbnail */}
      <div
        style={{
          width: 44,
          height: 54,
          borderRadius: 6,
          overflow: 'hidden',
          flexShrink: 0,
          background: '#f5f5f5',
          border: '1px solid #eee',
        }}
      >
        <img
          src={`https://cdn.aarria.com/app/images/${item.image}`}
          alt={item.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Coupon badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              border: `1.5px dashed ${isApplied ? '#ff3f6c' : '#ccc'}`,
              borderRadius: 5,
              padding: '3px 10px',
              transition: 'border-color 0.15s',
            }}
          >
            <Tag size={11} color={isApplied ? '#ff3f6c' : '#999'} />
            <span
              style={{
                color: isApplied ? '#ff3f6c' : '#999',
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: 0.5,
              }}
            >
              {isPercentage
                ? `${item.couponDiscount}% OFF`
                : `FLAT ₹${item.couponDiscount} OFF`}
            </span>
          </div>
        </div>

        {/* Product name */}
        <p
          style={{
            fontSize: 12,
            color: '#444',
            lineHeight: 1.4,
            marginBottom: 4,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {item.name}
        </p>

        {/* Size + qty meta */}
        <p style={{ fontSize: 11, color: '#999', marginBottom: 5 }}>
          Size: {item.size} &nbsp;·&nbsp; Qty: {item.qty}
        </p>

        {/* Savings line */}
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: isApplied ? '#2e7d32' : '#555',
          }}
        >
          Save ₹{discount.toLocaleString('en-IN')}
          {isPercentage && (
            <span style={{ fontSize: 11, fontWeight: 400, color: '#888', marginLeft: 5 }}>
              ({item.couponDiscount}% on ₹{(item.price * item.qty).toLocaleString('en-IN')})
            </span>
          )}
        </p>
      </div>
    </div>
  )
}

const sectionLabel = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 0.8,
  color: '#888',
  textTransform: 'uppercase',
  padding: '10px 20px 6px',
  background: '#fafafa',
  borderBottom: '1px solid #f0f0f0',
}
