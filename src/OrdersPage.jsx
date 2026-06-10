import React, { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  Search,
  ChevronDown,
  ChevronRight,
  Star,
  RotateCcw,
  Truck,
  MapPin,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  ArrowLeft,
  Download,
  MessageCircle,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import axios from 'axios'
import logo from './assets/logo.jpg'
import './constants/global.css'

// ─── Constants ────────────────────────────────────────────────────────────────

// Orders handler (DynamoDB-backed)
const ORDERS_API_BASE =
  'https://zq0dbjycx6.execute-api.ap-south-1.amazonaws.com/prod'
const CDN = 'https://cdn.aarria.com/app/images/'

const getCustomerId = () => {
  const customer = JSON.parse(localStorage.getItem('customer') || 'null')
  return customer?.customer_id ?? 1
}

const SUPPORT_WHATSAPP = '919731580157'

const openWhatsAppSupport = (orderId) => {
  const text = encodeURIComponent(`Hi, I need help with my order #${orderId}`)
  window.open(`https://wa.me/${SUPPORT_WHATSAPP}?text=${text}`, '_blank')
}

// Opens a printable invoice in a new window — the browser's print dialog
// lets the user save it as PDF
const generateInvoice = (order) => {
  const win = window.open('', '_blank')
  if (!win) return

  const rows = order.items
    .map(
      (item) => `
        <tr>
          <td>${item.name || ''}${item.size ? ` (Size: ${item.size})` : ''}</td>
          <td style="text-align:center">${item.quantity || 1}</td>
          <td style="text-align:right">₹${Number(item.price).toLocaleString('en-IN')}</td>
          <td style="text-align:right">₹${Number(item.price * (item.quantity || 1)).toLocaleString('en-IN')}</td>
        </tr>`,
    )
    .join('')

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Invoice-${order.id}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #282c3f; padding: 40px; }
    .brand { color: #ff3f6c; font-size: 28px; font-weight: 800; margin: 0; }
    .muted { color: #94969f; font-size: 12px; }
    h2 { font-size: 16px; margin: 24px 0 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th { text-align: left; border-bottom: 2px solid #282c3f; padding: 8px 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    th:nth-child(2) { text-align: center; }
    th:nth-child(3), th:nth-child(4) { text-align: right; }
    td { border-bottom: 1px solid #eee; padding: 8px 6px; }
    .totals { margin-top: 16px; margin-left: auto; width: 260px; font-size: 13px; }
    .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
    .totals .grand { border-top: 1px solid #282c3f; font-weight: 700; margin-top: 4px; padding-top: 8px; }
    .footer { margin-top: 40px; font-size: 11px; color: #94969f; text-align: center; }
  </style>
</head>
<body>
  <p class="brand">aarria</p>
  <p class="muted">www.aarria.com</p>

  <h2>Invoice</h2>
  <p class="muted">
    Order #${order.id}<br/>
    Date: ${order.date} · Status: ${order.status}
  </p>

  <h2>Deliver To</h2>
  <p class="muted">
    ${order.address?.name || ''}<br/>
    ${order.address?.line1 || ''}${order.address?.city ? `, ${order.address.city}` : ''}${order.address?.pin ? ` – ${order.address.pin}` : ''}
  </p>

  <table>
    <thead>
      <tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div><span>MRP Total</span><span>₹${Number(order.mrp).toLocaleString('en-IN')}</span></div>
    <div><span>Discount</span><span>-₹${Number(order.discount).toLocaleString('en-IN')}</span></div>
    <div><span>Delivery</span><span>${order.delivery === 0 ? 'FREE' : `₹${order.delivery}`}</span></div>
    <div class="grand"><span>Total Paid</span><span>₹${Number(order.total).toLocaleString('en-IN')}</span></div>
  </div>

  <p class="footer">Thank you for shopping with Aarria.</p>
</body>
</html>`)
  win.document.close()
  win.focus()
  win.print()
}

const ORDER_STATUSES = {
  PLACED:    { label: 'Order Placed',  color: '#7c5cbf', bg: '#f3eeff', icon: Package },
  CONFIRMED: { label: 'Confirmed',     color: '#0a7ea4', bg: '#e6f4fb', icon: CheckCircle2 },
  SHIPPED:   { label: 'Shipped',       color: '#d97706', bg: '#fef3c7', icon: Truck },
  OUT:       { label: 'Out for Delivery', color: '#0891b2', bg: '#e0f7fa', icon: MapPin },
  DELIVERED: { label: 'Delivered',     color: '#16a34a', bg: '#dcfce7', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled',     color: '#dc2626', bg: '#fee2e2', icon: XCircle },
  RETURNED:  { label: 'Returned',      color: '#6b7280', bg: '#f3f4f6', icon: RotateCcw },
}

const FILTER_OPTIONS = [
  { label: 'All Orders', value: 'ALL' },
  { label: 'On the way', value: 'SHIPPED' },
  { label: 'Delivered',  value: 'DELIVERED' },
  { label: 'Cancelled',  value: 'CANCELLED' },
  { label: 'Returned',   value: 'RETURNED' },
]

// ─── Fetcher ──────────────────────────────────────────────────────────────────

const fetchOrders = async () => {
  const { data } = await axios.get(
    `${ORDERS_API_BASE}/customers/${getCustomerId()}/orders/full`,
  )

  return (data.orders || []).map((order) => ({
    ...order,
    items: (order.items || []).map((item) => ({
      ...item,
      brand: item.brand || 'Aarria',
      name: item.name || '',
      image: item.image ? `${CDN}${item.image}` : '',
    })),
  }))
}

// ─── Timeline Component ────────────────────────────────────────────────────────

function OrderTimeline({ status }) {
  const steps = ['PLACED', 'CONFIRMED', 'SHIPPED', 'OUT', 'DELIVERED']
  const idx = steps.indexOf(status)
  const isCancelled = status === 'CANCELLED' || status === 'RETURNED'

  if (isCancelled) {
    const meta = ORDER_STATUSES[status]
    const Icon = meta.icon
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 0' }}>
        <Icon size={16} color={meta.color} />
        <span style={{ fontSize: 13, color: meta.color, fontWeight: 500 }}>{meta.label}</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '16px 0 8px', overflowX: 'auto' }}>
      {steps.map((step, i) => {
        const meta = ORDER_STATUSES[step]
        const done = i <= idx
        const active = i === idx
        // current status in its own colour, completed steps in green
        const circleBg = active ? meta.color : done ? '#16a34a' : '#f0f0f0'
        return (
          <React.Fragment key={step}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 64 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: circleBg,
                border: active ? `2px solid ${meta.color}` : done ? 'none' : '2px solid #e0e0e0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: active ? `0 0 0 4px ${meta.bg}` : 'none',
              }}>
                {done
                  ? <CheckCircle2 size={14} color="#fff" strokeWidth={2.5} />
                  : <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ccc' }} />
                }
              </div>
              <span style={{
                fontSize: 10, marginTop: 5,
                color: active ? meta.color : done ? '#16a34a' : '#999',
                fontWeight: active ? 700 : done ? 500 : 400, textAlign: 'center', lineHeight: 1.3,
                whiteSpace: 'nowrap',
              }}>{meta.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, minWidth: 16,
                background: i < idx ? '#16a34a' : '#e8e8e8',
                marginBottom: 20, transition: 'background 0.3s',
              }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Cancel Confirmation Modal ────────────────────────────────────────────────

function CancelOrderModal({ order, onClose, onCancelled }) {
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState('')

  const handleConfirm = async () => {
    try {
      setCancelling(true)
      setError('')
      await axios.put(
        `${ORDERS_API_BASE}/orders/${order.id}/cancel?customer_id=${getCustomerId()}`,
      )
      onCancelled()
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to cancel order')
      setCancelling(false)
    }
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && !cancelling && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div style={{
        width: '100%', maxWidth: 380, background: '#fff', borderRadius: 12,
        padding: '22px 22px 18px', boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', background: '#fee2e2',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <XCircle size={18} color="#dc2626" />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: '#282c3f', margin: 0 }}>
            Cancel this order?
          </h3>
        </div>

        <p style={{ fontSize: 13, color: '#555', margin: '0 0 6px' }}>
          Order <b>#{order.id}</b> · {order.items.length} item{order.items.length > 1 ? 's' : ''} · ₹{order.total.toLocaleString('en-IN')}
        </p>
        <p style={{ fontSize: 12, color: '#94969f', margin: '0 0 16px' }}>
          This action cannot be undone. Any payment made will be refunded to the original payment method.
        </p>

        {error && (
          <p style={{ fontSize: 12, color: '#dc2626', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertCircle size={13} /> {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={cancelling}
            style={{
              padding: '9px 18px', borderRadius: 8, cursor: 'pointer',
              border: '1.5px solid #d0d0d0', background: '#fff',
              fontSize: 13, fontWeight: 600, color: '#555',
              opacity: cancelling ? 0.5 : 1,
            }}
          >
            Keep Order
          </button>
          <button
            onClick={handleConfirm}
            disabled={cancelling}
            style={{
              padding: '9px 18px', borderRadius: 8, cursor: 'pointer',
              border: 'none', background: '#dc2626', color: '#fff',
              fontSize: 13, fontWeight: 600,
              opacity: cancelling ? 0.7 : 1,
            }}
          >
            {cancelling ? 'Cancelling…' : 'Yes, Cancel Order'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const meta = ORDER_STATUSES[order.status] || ORDER_STATUSES.PLACED
  const StatusIcon = meta.icon

  const handleCancelled = () => {
    setShowCancelModal(false)
    queryClient.invalidateQueries({ queryKey: ['orders'] })
  }

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #f0f0f0',
      borderRadius: 12,
      marginBottom: 12,
      overflow: 'hidden',
      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      transition: 'box-shadow 0.2s',
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.09)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'}
    >
      {/* Header */}
      <div
        style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
        onClick={() => setExpanded(p => !p)}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#282c3f' }}>
              Order #{order.id}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
              background: meta.bg, color: meta.color,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <StatusIcon size={11} strokeWidth={2.5} />
              {meta.label}
            </span>
          </div>
          <p style={{ fontSize: 12, color: '#94969f', margin: 0 }}>
            {order.items.length} item{order.items.length > 1 ? 's' : ''} · ₹{order.total.toLocaleString('en-IN')} · {order.date}
          </p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setExpanded(p => !p)
          }}
          aria-label={expanded ? 'Collapse order details' : 'Expand order details'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
            border: '1.5px solid #e8e8e8', background: '#fafafa',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = '#ff3f6c'
            e.currentTarget.style.background = '#fff0f3'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#e8e8e8'
            e.currentTarget.style.background = '#fafafa'
          }}
        >
          <ChevronDown
            size={22} color="#555" strokeWidth={2.5}
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          />
        </button>
      </div>

      {/* Items Preview (always visible) */}
      <div style={{ padding: '0 18px 14px', display: 'flex', gap: 10, overflowX: 'auto' }}>
        {order.items.map(item => (
          <div
            key={item.id}
            onClick={() => item.product_id && window.open(`/product/${item.product_id}`, '_blank')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#fafafa', borderRadius: 8, padding: '8px 10px',
              border: '1px solid #f0f0f0', minWidth: 0, flex: '0 0 auto', maxWidth: 260,
              cursor: item.product_id ? 'pointer' : 'default',
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              style={{ width: 56, height: 68, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
            />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#282c3f', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
                {item.brand}
              </p>
              <p style={{ fontSize: 11, color: '#94969f', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
                {item.name}
              </p>
              <p style={{ fontSize: 11, color: '#282c3f', margin: 0 }}>
                Size: <b>{item.size}</b> · ₹{item.price.toLocaleString('en-IN')}
              </p>
              {item.item_status === 'QC_FAILED' && (
                <div style={{ marginTop: 4 }}>
                  <span style={{
                    display: 'inline-block', fontSize: 10, fontWeight: 700,
                    color: '#dc2626', background: '#fee2e2', border: '1px solid #fecaca',
                    borderRadius: 10, padding: '1px 8px',
                  }}>
                    QC Failed
                  </span>
                  {item.qc_reason && (
                    <p style={{ fontSize: 10, color: '#dc2626', margin: '3px 0 0', maxWidth: 150 }}>
                      {item.qc_reason}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Section */}
      {expanded && (
        <div style={{ borderTop: '1px solid #f5f5f5', padding: '14px 18px' }}>
          {/* Timeline */}
          <OrderTimeline status={order.status} />

          {/* Estimated delivery */}
          {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.status !== 'RETURNED' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#fff8f8', border: '1px solid #ffdce5',
              borderRadius: 8, padding: '8px 12px', marginTop: 4, marginBottom: 12,
            }}>
              <Clock size={13} color="#ff3f6c" />
              <span style={{ fontSize: 12, color: '#282c3f' }}>
                Expected by <b>{order.expectedBy}</b>
              </span>
            </div>
          )}

          {/* Delivery address */}
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 11, color: '#94969f', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
              Delivery Address
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <MapPin size={13} color="#ff3f6c" style={{ marginTop: 2, flexShrink: 0 }} />
              <p style={{ fontSize: 12, color: '#282c3f', margin: 0, lineHeight: 1.6 }}>
                {order.address.name} · {order.address.line1}, {order.address.city} – {order.address.pin}
              </p>
            </div>
          </div>

          {/* Price breakdown */}
          <div style={{
            background: '#fafafa', borderRadius: 8, padding: '10px 14px',
            border: '1px solid #f0f0f0', marginBottom: 14,
          }}>
            <p style={{ fontSize: 11, color: '#94969f', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Price Details
            </p>
            {[
              { label: 'MRP Total', value: `₹${order.mrp.toLocaleString('en-IN')}` },
              { label: 'Discount', value: `-₹${order.discount.toLocaleString('en-IN')}`, color: '#16a34a' },
              { label: 'Delivery', value: order.delivery === 0 ? 'FREE' : `₹${order.delivery}`, color: order.delivery === 0 ? '#16a34a' : undefined },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: '#555' }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: row.color || '#282c3f' }}>{row.value}</span>
              </div>
            ))}
            <div style={{ borderTop: '1px dashed #e0e0e0', paddingTop: 6, marginTop: 4, display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#282c3f' }}>Total Paid</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#282c3f' }}>₹{order.total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {order.status !== 'CANCELLED' && order.status !== 'RETURNED' && (
              <ActionBtn
                icon={<Star size={13} />}
                label="Rate & Review"
                primary={order.status === 'DELIVERED'}
                disabled={order.status !== 'DELIVERED'}
                title={order.status !== 'DELIVERED' ? 'Available after delivery' : undefined}
                onClick={() =>
                  navigate('/review', {
                    state: {
                      orderId: order.id,
                      items: order.items.filter(i => i.item_status !== 'QC_FAILED'),
                    },
                  })
                }
              />
            )}
            {order.status === 'DELIVERED' && (
              <ActionBtn icon={<RotateCcw size={13} />} label="Return / Exchange" />
            )}
            {(order.status === 'PLACED' || order.status === 'CONFIRMED') && (
              <ActionBtn
                icon={<XCircle size={13} />}
                label="Cancel Order"
                danger
                onClick={() => setShowCancelModal(true)}
              />
            )}
            {(order.status === 'SHIPPED' || order.status === 'OUT') && (
              <ActionBtn
                icon={<Truck size={13} />}
                label="Track Order"
                primary
                onClick={() =>
                  order.tracking?.url
                    ? window.open(order.tracking.url, '_blank')
                    : alert('Tracking details will be available soon')
                }
              />
            )}
            <ActionBtn
              icon={<MessageCircle size={13} />}
              label="Need Help?"
              onClick={() => openWhatsAppSupport(order.id)}
            />
            <ActionBtn
              icon={<Download size={13} />}
              label="Invoice"
              onClick={() => generateInvoice(order)}
            />
          </div>
        </div>
      )}

      {showCancelModal && (
        <CancelOrderModal
          order={order}
          onClose={() => setShowCancelModal(false)}
          onCancelled={handleCancelled}
        />
      )}
    </div>
  )
}

function ActionBtn({ icon, label, primary, danger, disabled, title, onClick }) {
  const [hover, setHover] = useState(false)

  if (disabled) {
    return (
      <button
        disabled
        title={title}
        style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '7px 14px', borderRadius: 20, cursor: 'not-allowed',
          fontSize: 12, fontWeight: 600,
          border: '1.5px solid #e8e8e8', background: '#fafafa', color: '#b5b5bd',
        }}
      >
        {icon}{label}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '7px 14px', borderRadius: 20, cursor: 'pointer',
        fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
        border: primary ? 'none' : danger ? '1.5px solid #dc2626' : '1.5px solid #d0d0d0',
        background: primary
          ? hover ? '#e0315a' : '#ff3f6c'
          : hover
          ? danger ? '#fee2e2' : '#f5f5f5'
          : '#fff',
        color: primary ? '#fff' : danger ? '#dc2626' : '#555',
        transform: hover ? 'translateY(-1px)' : 'none',
        boxShadow: hover && primary ? '0 4px 12px rgba(255,63,108,0.3)' : 'none',
      }}
    >
      {icon}{label}
    </button>
  )
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyOrders({ filter }) {
  const navigate = useNavigate()
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: '#fff0f3', display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 20px',
      }}>
        <ShoppingBag size={36} color="#ff3f6c" strokeWidth={1.5} />
      </div>
      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#282c3f', marginBottom: 8 }}>
        No {filter !== 'ALL' ? ORDER_STATUSES[filter]?.label : ''} Orders
      </h3>
      <p style={{ fontSize: 13, color: '#94969f', marginBottom: 24 }}>
        Looks like you haven't placed any orders yet. Start shopping!
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          background: '#ff3f6c', color: '#fff', border: 'none',
          borderRadius: 4, padding: '12px 32px', fontSize: 14, fontWeight: 700,
          cursor: 'pointer', letterSpacing: 0.5,
        }}
      >
        EXPLORE PRODUCTS
      </button>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [search, setSearch] = useState('')
  const [searchFocus, setSearchFocus] = useState(false)

  const { data: orders = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    staleTime: 1000 * 60 * 5,
  })

  const filtered = useMemo(() => {
    let list = activeFilter === 'ALL' ? orders : orders.filter(o => o.status === activeFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(o =>
        o.id.toLowerCase().includes(q) ||
        o.items.some(i => i.name.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q))
      )
    }
    return list
  }, [orders, activeFilter, search])

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f5', fontFamily: '"Sora", "Segoe UI", sans-serif' }}>

      {/* Top Nav */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #f0f0f0',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 64 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#555', padding: 4 }}
          >
            <ArrowLeft size={18} />
          </button>
          <img
            src={logo}
            alt="Aarria"
            onClick={() => navigate('/products')}
            style={{ height: 40, objectFit: 'contain', cursor: 'pointer' }}
          />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#94969f' }}>My Orders</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 32px' }}>

        {/* Page Title */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#282c3f', margin: '0 0 4px', letterSpacing: -0.5 }}>
            My Orders
          </h1>
          {!isLoading && (
            <p style={{ fontSize: 13, color: '#94969f', margin: 0 }}>
              {orders.length} order{orders.length !== 1 ? 's' : ''} placed
            </p>
          )}
        </div>

        {/* Search Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#fff', border: `1.5px solid ${searchFocus ? '#ff3f6c' : '#e8e8e8'}`,
          borderRadius: 8, padding: '0 14px', marginBottom: 16,
          transition: 'border-color 0.2s',
        }}>
          <Search size={16} color={searchFocus ? '#ff3f6c' : '#aaa'} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            placeholder="Search by order ID or product name…"
            style={{
              flex: 1, border: 'none', outline: 'none', padding: '12px 0',
              fontSize: 13, color: '#282c3f', background: 'transparent',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', padding: 0 }}>
              <XCircle size={16} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 20 }}>
          {FILTER_OPTIONS.map(f => {
            const meta = ORDER_STATUSES[f.value]
            const accent = meta?.color || '#ff3f6c'
            const accentBg = meta?.bg || '#fff0f3'
            const active = activeFilter === f.value
            return (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                style={{
                  flexShrink: 0, padding: '7px 16px', borderRadius: 20,
                  border: active ? `1.5px solid ${accent}` : '1.5px solid #e0e0e0',
                  background: active ? accentBg : '#fff',
                  color: active ? accent : '#666',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {/* States */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: 120, background: '#fff', borderRadius: 12,
                border: '1px solid #f0f0f0', animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
          </div>
        )}

        {isError && (
          <div style={{
            background: '#fff', borderRadius: 12, border: '1px solid #fee2e2',
            padding: '24px', textAlign: 'center',
          }}>
            <AlertCircle size={32} color="#dc2626" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 14, color: '#282c3f', marginBottom: 12 }}>Couldn't load your orders.</p>
            <button
              onClick={refetch}
              style={{
                background: '#ff3f6c', color: '#fff', border: 'none',
                borderRadius: 4, padding: '10px 24px', fontSize: 13,
                fontWeight: 600, cursor: 'pointer', display: 'inline-flex',
                alignItems: 'center', gap: 6,
              }}
            >
              <RefreshCw size={14} /> Try Again
            </button>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <EmptyOrders filter={activeFilter} />
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div>
            {filtered.map(order => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
