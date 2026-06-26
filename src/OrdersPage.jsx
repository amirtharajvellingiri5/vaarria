import React, { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  Search,
  ChevronDown,
  Star,
  RotateCcw,
  Truck,
  MapPin,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Download,
  MessageCircle,
  RefreshCw,
  AlertCircle,
  Pencil,
} from 'lucide-react'
import axios from 'axios'
const logo = '/vlogo.png'
import './constants/global.css'

// ─── Brand ────────────────────────────────────────────────────────────────────

const GOLD = '#C9A84C'
const NAVY = '#050C1C'

// ─── Constants ────────────────────────────────────────────────────────────────

import { ORDERS_URL } from './config'
const ORDERS_API_BASE = ORDERS_URL
const CDN = 'https://cdn.vaarria.com/app/images/'

const getCustomerId = () => {
  const customer = JSON.parse(localStorage.getItem('customer') || 'null')
  return customer?.customer_id ?? 1
}

const SUPPORT_WHATSAPP = '919731580157'

const openWhatsAppSupport = (orderId) => {
  const text = encodeURIComponent(`Hi, I need help with my order #${orderId}`)
  window.open(`https://wa.me/${SUPPORT_WHATSAPP}?text=${text}`, '_blank')
}

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
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #050C1C; padding: 40px; }
    .brand { color: #C9A84C; font-size: 28px; font-weight: 800; margin: 0; font-family: 'Playfair Display', Georgia, serif; }
    .muted { color: #94969f; font-size: 12px; }
    h2 { font-size: 16px; margin: 24px 0 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th { text-align: left; border-bottom: 2px solid #050C1C; padding: 8px 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    th:nth-child(2) { text-align: center; }
    th:nth-child(3), th:nth-child(4) { text-align: right; }
    td { border-bottom: 1px solid #eee; padding: 8px 6px; }
    .totals { margin-top: 16px; margin-left: auto; width: 260px; font-size: 13px; }
    .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
    .totals .grand { border-top: 1px solid #C9A84C; font-weight: 700; margin-top: 4px; padding-top: 8px; color: #C9A84C; }
    .footer { margin-top: 40px; font-size: 11px; color: #94969f; text-align: center; }
  </style>
</head>
<body>
  <div style="background:#050C1C;border-radius:10px;padding:20px 24px 16px;margin-bottom:12px;text-align:center;border:1px solid #C9A84C44;">
    <img src="${window.location.origin}/vlogo__1_-removebg-preview.png" alt="Vaarria" style="height:56px;object-fit:contain;margin-bottom:6px;" onerror="this.style.display='none';this.nextElementSibling.style.display='block'"/>
    <div style="display:none;font-size:22px;font-weight:800;color:#C9A84C;font-family:'Playfair Display',Georgia,serif;letter-spacing:0.2em;">VAARRIA</div>
    <div style="font-size:8px;color:#C9A84C88;letter-spacing:0.18em;text-transform:uppercase;">WHERE ELEGANCE FINDS FORM</div>
  </div>
  <p class="muted">www.vaarria.com</p>

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
    <div style="color:#16a34a"><span>Discount</span><span>-₹${Number(order.discount).toLocaleString('en-IN')}</span></div>
    <div><span>Delivery</span><span>${order.delivery === 0 ? 'FREE' : `₹${order.delivery}`}</span></div>
    <div class="grand"><span>Total Paid</span><span>₹${Number(order.total).toLocaleString('en-IN')}</span></div>
  </div>

  <div style="background:#050C1C;border-radius:8px;padding:16px 20px;margin-top:32px;text-align:center;border:1px solid #C9A84C33;">
    <div style="font-size:13px;color:#C9A84C;font-family:'Playfair Display',Georgia,serif;font-style:italic;margin-bottom:4px;">We truly appreciate your trust in us.</div>
    <div style="font-size:10px;color:#c8c8d4;">♥ With love, The Vaarria Team</div>
  </div>
</body>
</html>`)
  win.document.close()
  win.focus()
  win.print()
}

const ORDER_STATUSES = {
  PLACED:    { label: 'Order Placed',     color: '#7c5cbf', bg: '#f3eeff', icon: Package },
  CONFIRMED: { label: 'Confirmed',        color: '#0a7ea4', bg: '#e6f4fb', icon: CheckCircle2 },
  SHIPPED:   { label: 'Shipped',          color: GOLD,      bg: '#fdf8ec', icon: Truck },
  OUT:       { label: 'Out for Delivery', color: '#0891b2', bg: '#e0f7fa', icon: MapPin },
  DELIVERED: { label: 'Delivered',        color: '#16a34a', bg: '#dcfce7', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled',        color: '#dc2626', bg: '#fee2e2', icon: XCircle },
  RETURNED:  { label: 'Returned',         color: '#6b7280', bg: '#f3f4f6', icon: RotateCcw },
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

// ─── Timeline ─────────────────────────────────────────────────────────────────

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
        <span style={{ fontSize: 13, color: meta.color, fontWeight: 600 }}>{meta.label}</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, padding: '16px 0 8px', overflowX: 'auto' }}>
      {steps.map((step, i) => {
        const meta = ORDER_STATUSES[step]
        const done = i <= idx
        const active = i === idx
        const circleBg = active ? NAVY : done ? '#16a34a' : '#f0f0f0'
        return (
          <React.Fragment key={step}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 64 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: circleBg,
                border: active ? `2px solid ${GOLD}` : done ? 'none' : '2px solid #e0e0e0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: active ? `0 0 0 4px ${GOLD}22` : 'none',
              }}>
                {done
                  ? <CheckCircle2 size={14} color={active ? GOLD : '#fff'} strokeWidth={2.5} />
                  : <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ccc' }} />
                }
              </div>
              <span style={{
                fontSize: 10, marginTop: 5,
                color: active ? NAVY : done ? '#16a34a' : '#999',
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

// ─── Return / Exchange Modal ──────────────────────────────────────────────────

const RETURN_REASONS = [
  'Wrong size received',
  'Product not as described',
  'Damaged / defective product',
  'Wrong item delivered',
  'Changed my mind',
  'Better price available elsewhere',
  'Other',
]

function ReturnExchangeModal({ order, onClose }) {
  const [mode, setMode] = useState('RETURN')
  const [selected, setSelected] = useState(() => new Set(order.items.map(i => i.id)))
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')

  const toggle = (id) => setSelected(prev => {
    const n = new Set(prev)
    n.has(id) ? n.delete(id) : n.add(id)
    return n
  })

  const handleSubmit = () => {
    const items = order.items.filter(i => selected.has(i.id)).map(i => `${i.name} (${i.size})`).join(', ')
    const msg = `Hi, I'd like to request a ${mode === 'RETURN' ? 'return' : 'exchange'} for Order #${order.id}.\n\nItems: ${items}\nReason: ${reason}${details ? `\nDetails: ${details}` : ''}`
    window.open(`https://wa.me/919731580157?text=${encodeURIComponent(msg)}`, '_blank')
    onClose()
  }

  const canSubmit = selected.size > 0 && reason

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(5,12,28,0.6)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div style={{
        width: '100%', maxWidth: 440, background: '#fff', borderRadius: 16,
        boxShadow: '0 24px 64px rgba(5,12,28,0.22)', border: '1px solid #e8e0d0',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 22px 14px', borderBottom: `1px solid ${GOLD}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
        }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>
              Return / Exchange
            </h3>
            <p style={{ fontSize: 11, color: '#94969f', margin: '3px 0 0' }}>Order #{order.id}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        <div style={{ padding: '18px 22px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Mode toggle */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Request type</p>
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ v: 'RETURN', label: 'Return' }, { v: 'EXCHANGE', label: 'Exchange' }].map(({ v, label }) => (
                <button
                  key={v}
                  onClick={() => setMode(v)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
                    border: mode === v ? `2px solid ${GOLD}` : '1.5px solid #e8e0d0',
                    background: mode === v ? '#fffdf5' : '#fff',
                    fontSize: 13, fontWeight: 600, color: mode === v ? NAVY : '#888',
                    transition: 'all 0.15s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Item selection */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Select items</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {order.items.map(item => (
                <div
                  key={item.id}
                  onClick={() => toggle(item.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                    border: selected.has(item.id) ? `1.5px solid ${GOLD}` : '1.5px solid #e8e0d0',
                    background: selected.has(item.id) ? '#fffdf5' : '#fff',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{
                    width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                    border: selected.has(item.id) ? `2px solid ${GOLD}` : '2px solid #ddd',
                    background: selected.has(item.id) ? GOLD : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {selected.has(item.id) && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
                  </div>
                  {item.image && (
                    <img src={item.image} alt={item.name} style={{ width: 40, height: 50, objectFit: 'cover', borderRadius: 4, border: '1px solid #e8e0d0' }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: NAVY, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                    <p style={{ fontSize: 11, color: '#888', margin: 0 }}>Size: {item.size} · ₹{item.price?.toLocaleString('en-IN')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Reason <span style={{ color: GOLD }}>*</span></p>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8,
                border: `1.5px solid ${reason ? GOLD : '#e8e0d0'}`, fontSize: 13, color: NAVY,
                background: '#fff', outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="">Select a reason…</option>
              {RETURN_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Additional details */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Additional details (optional)</p>
            <textarea
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Describe the issue in detail…"
              rows={3}
              style={{
                width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 8,
                border: '1.5px solid #e8e0d0', fontSize: 13, color: NAVY,
                background: '#fff', outline: 'none', resize: 'vertical', fontFamily: 'inherit',
              }}
              onFocus={e => { e.target.style.borderColor = GOLD }}
              onBlur={e => { e.target.style.borderColor = '#e8e0d0' }}
            />
          </div>

          <div style={{ background: '#fffdf5', border: `1px solid ${GOLD}44`, borderRadius: 8, padding: '10px 12px' }}>
            <p style={{ fontSize: 12, color: '#666', margin: 0, lineHeight: 1.6 }}>
              Clicking submit will open WhatsApp with your request pre-filled. Our team will respond within 24 hours.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
                border: `1.5px solid ${GOLD}66`, background: '#fff',
                fontSize: 13, fontWeight: 600, color: NAVY,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              style={{
                padding: '10px 24px', borderRadius: 8, cursor: canSubmit ? 'pointer' : 'not-allowed',
                border: `1px solid ${GOLD}`, background: canSubmit ? NAVY : '#f0ece4',
                fontSize: 13, fontWeight: 700, color: canSubmit ? GOLD : '#bbb',
                fontFamily: "'Playfair Display', Georgia, serif",
                transition: 'all 0.15s',
              }}
            >
              Submit via WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Cancel Modal ─────────────────────────────────────────────────────────────

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
        background: 'rgba(5,12,28,0.6)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div style={{
        width: '100%', maxWidth: 380, background: '#fff', borderRadius: 14,
        padding: '24px 24px 20px', boxShadow: '0 20px 60px rgba(5,12,28,0.2)',
        border: '1px solid #e8e0d0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: '50%', background: '#fee2e2',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <XCircle size={18} color="#dc2626" />
          </div>
          <h3 style={{
            fontSize: 16, fontWeight: 700, color: NAVY, margin: 0,
            fontFamily: "'Playfair Display', Georgia, serif",
          }}>
            Cancel this order?
          </h3>
        </div>

        <p style={{ fontSize: 13, color: '#444', margin: '0 0 6px' }}>
          Order <b>#{order.id}</b> · {order.items.length} item{order.items.length > 1 ? 's' : ''} · ₹{order.total.toLocaleString('en-IN')}
        </p>
        <p style={{ fontSize: 12, color: '#94969f', margin: '0 0 18px' }}>
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
              padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
              border: `1.5px solid ${GOLD}66`, background: '#fff',
              fontSize: 13, fontWeight: 600, color: NAVY,
              opacity: cancelling ? 0.5 : 1,
            }}
          >
            Keep Order
          </button>
          <button
            onClick={handleConfirm}
            disabled={cancelling}
            style={{
              padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
              border: 'none', background: '#dc2626', color: '#fff',
              fontSize: 13, fontWeight: 600,
              opacity: cancelling ? 0.7 : 1,
            }}
          >
            {cancelling ? 'Cancelling…' : 'Yes, Cancel'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Edit Address Modal ───────────────────────────────────────────────────────

const ADDR_FIELDS_META = [
  { key: 'full_name',      label: 'Full Name',       required: true },
  { key: 'mobile_no',      label: 'Mobile Number',   required: true },
  { key: 'address_line_1', label: 'Address Line 1',  required: true },
  { key: 'address_line_2', label: 'Address Line 2',  required: false },
  { key: 'landmark',       label: 'Landmark',        required: false },
  { key: 'city',           label: 'City',            required: true },
  { key: 'state',          label: 'State',           required: true },
  { key: 'pincode',        label: 'Pincode',         required: true },
]

function EditAddressModal({ order, onClose, onSaved }) {
  const addr = order.address || {}
  const [form, setForm] = useState({
    full_name:      addr.name   || '',
    mobile_no:      addr.phone  || '',
    address_line_1: addr.line1  || '',
    address_line_2: addr.line2  || '',
    landmark:       addr.landmark || '',
    city:           addr.city   || '',
    state:          addr.state  || '',
    pincode:        addr.pin    || '',
    address_type:   addr.address_type || '',
    country:        'India',
    is_default:     false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSave = async () => {
    const missing = ADDR_FIELDS_META.filter(f => f.required && !form[f.key]?.trim())
    if (missing.length) {
      setError(`Please fill: ${missing.map(f => f.label).join(', ')}`)
      return
    }
    if (!order.address_id) {
      setError('Address ID not available — please redeploy orders_handler and refresh.')
      return
    }
    try {
      setSaving(true)
      setError('')
      const customerId = getCustomerId()
      await axios.put(
        `${ORDERS_API_BASE}/addresses/${order.address_id}`,
        { ...form, customer_id: customerId },
      )
      onSaved()
    } catch (err) {
      const detail = err.response?.data?.detail
      const errorMsg = Array.isArray(detail)
        ? detail.map(e => e.msg || String(e)).join(', ')
        : typeof detail === 'string' ? detail : 'Failed to update address'
      setError(errorMsg)
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    border: `1.5px solid #e8e0d0`, borderRadius: 8,
    padding: '10px 12px', fontSize: 13, color: NAVY,
    outline: 'none', background: '#fff', fontFamily: 'inherit',
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && !saving && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(5,12,28,0.55)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div style={{
        width: '100%', maxWidth: 480, background: '#fff', borderRadius: 16,
        boxShadow: '0 24px 64px rgba(5,12,28,0.22)', border: '1px solid #e8e0d0',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Header */}
        <div style={{
          padding: '18px 22px 14px',
          borderBottom: `1px solid ${GOLD}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, background: '#fff', zIndex: 1,
        }}>
          <div>
            <h3 style={{
              fontSize: 17, fontWeight: 700, color: NAVY, margin: 0,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}>
              Edit Delivery Address
            </h3>
            <p style={{ fontSize: 11, color: '#94969f', margin: '3px 0 0' }}>
              Order #{order.id}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#aaa', fontSize: 20, lineHeight: 1, padding: 4,
            }}
          >
            ×
          </button>
        </div>

        {/* Form */}
        <div style={{ padding: '18px 22px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* 2-col grid for name + mobile */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {['full_name', 'mobile_no'].map(key => {
              const meta = ADDR_FIELDS_META.find(f => f.key === key)
              return (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>
                    {meta.label}{meta.required && <span style={{ color: GOLD }}> *</span>}
                  </label>
                  <input
                    value={form[key]}
                    onChange={set(key)}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = `0 0 0 3px ${GOLD}18` }}
                    onBlur={e => { e.target.style.borderColor = '#e8e0d0'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              )
            })}
          </div>

          {/* Remaining fields */}
          {['address_line_1', 'address_line_2', 'landmark'].map(key => {
            const meta = ADDR_FIELDS_META.find(f => f.key === key)
            return (
              <div key={key}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>
                  {meta.label}{meta.required && <span style={{ color: GOLD }}> *</span>}
                </label>
                <input
                  value={form[key]}
                  onChange={set(key)}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = `0 0 0 3px ${GOLD}18` }}
                  onBlur={e => { e.target.style.borderColor = '#e8e0d0'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            )
          })}

          {/* 3-col grid for city / state / pincode */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {['city', 'state', 'pincode'].map(key => {
              const meta = ADDR_FIELDS_META.find(f => f.key === key)
              return (
                <div key={key}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 5 }}>
                    {meta.label}{meta.required && <span style={{ color: GOLD }}> *</span>}
                  </label>
                  <input
                    value={form[key]}
                    onChange={set(key)}
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = GOLD; e.target.style.boxShadow = `0 0 0 3px ${GOLD}18` }}
                    onBlur={e => { e.target.style.borderColor = '#e8e0d0'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              )
            })}
          </div>

          {error && (
            <p style={{ fontSize: 12, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6, margin: 0 }}>
              <AlertCircle size={13} /> {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              onClick={onClose}
              disabled={saving}
              style={{
                padding: '10px 22px', borderRadius: 8, cursor: 'pointer',
                border: `1.5px solid ${GOLD}66`, background: '#fff',
                fontSize: 13, fontWeight: 600, color: NAVY,
                opacity: saving ? 0.5 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '10px 28px', borderRadius: 8, cursor: 'pointer',
                border: `1px solid ${GOLD}`, background: saving ? '#e8e0d0' : NAVY,
                fontSize: 13, fontWeight: 700, color: GOLD,
                fontFamily: "'Playfair Display', Georgia, serif",
                opacity: saving ? 0.8 : 1,
                transition: 'all 0.15s',
              }}
            >
              {saving ? 'Saving…' : 'Save Address'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [showEditAddress, setShowEditAddress] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const meta = ORDER_STATUSES[order.status] || ORDER_STATUSES.PLACED
  const StatusIcon = meta.icon

  const handleCancelled = () => {
    setShowCancelModal(false)
    queryClient.invalidateQueries({ queryKey: ['orders'] })
  }

  const handleAddressSaved = () => {
    setShowEditAddress(false)
    queryClient.invalidateQueries({ queryKey: ['orders'] })
  }

  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #e8e0d0',
        borderRadius: 14,
        marginBottom: 14,
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(5,12,28,0.05)',
        transition: 'box-shadow 0.2s, transform 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 6px 24px rgba(5,12,28,0.1)'
        e.currentTarget.style.transform = 'translateY(-1px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(5,12,28,0.05)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Gold-navy gradient accent strip */}
      <div style={{ height: 3, background: `linear-gradient(90deg, ${NAVY}, ${GOLD})` }} />

      {/* Header */}
      <div
        style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}
        onClick={() => setExpanded(p => !p)}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
            <span style={{
              fontSize: 13, fontWeight: 700, color: NAVY,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}>
              Order #{order.id}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 20,
              background: meta.bg, color: meta.color,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <StatusIcon size={11} strokeWidth={2.5} />
              {meta.label}
            </span>
            {order.payment_method === 'PREPAID' && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                Paid Online
              </span>
            )}
            {order.payment_method === 'COD' && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: '#fffdf5', color: '#b45309', border: '1px solid #fde68a' }}>
                Rs.49 + COD
              </span>
            )}
            {order.payment_method === 'FULL_COD' && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: '#fef9ec', color: '#b45309', border: '1px solid #fde68a' }}>
                Full COD
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: '#94969f', margin: 0 }}>
            {order.items.length} item{order.items.length > 1 ? 's' : ''} ·{' '}
            <span style={{ color: GOLD, fontWeight: 600 }}>₹{order.total.toLocaleString('en-IN')}</span>
            {' '}· {order.date}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(p => !p) }}
          aria-label={expanded ? 'Collapse order details' : 'Expand order details'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
            border: `1.5px solid ${GOLD}44`, background: '#fdfcf9',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = GOLD
            e.currentTarget.style.background = '#fdf8ec'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = `${GOLD}44`
            e.currentTarget.style.background = '#fdfcf9'
          }}
        >
          <ChevronDown
            size={20} color={NAVY} strokeWidth={2.5}
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          />
        </button>
      </div>

      {/* Items Preview */}
      <div style={{ padding: '0 18px 14px', display: 'flex', gap: 10, overflowX: 'auto' }}>
        {order.items.map(item => (
          <div
            key={item.id}
            onClick={() => item.product_id && window.open(`/product/${item.product_id}`, '_blank')}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#fdfcf9', borderRadius: 10, padding: '8px 12px',
              border: '1px solid #e8e0d0', minWidth: 0, flex: '0 0 auto', maxWidth: 260,
              cursor: item.product_id ? 'pointer' : 'default',
            }}
          >
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: 52, height: 64, objectFit: 'cover', borderRadius: 6,
                flexShrink: 0, border: '1px solid #f0ece4',
              }}
            />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: NAVY, margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
                {item.brand}
              </p>
              <p style={{ fontSize: 11, color: '#94969f', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>
                {item.name}
              </p>
              <p style={{ fontSize: 11, color: '#444', margin: 0 }}>
                Size: <b>{item.size}</b> · <span style={{ color: GOLD, fontWeight: 600 }}>₹{item.price.toLocaleString('en-IN')}</span>
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
        <div style={{ borderTop: `1px solid ${GOLD}22`, padding: '14px 18px', background: '#fdfcf9' }}>
          <OrderTimeline status={order.status} />

          {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.status !== 'RETURNED' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#fffdf5', border: `1px solid ${GOLD}44`,
              borderRadius: 8, padding: '8px 12px', marginTop: 4, marginBottom: 12,
            }}>
              <Clock size={13} color={GOLD} />
              <span style={{ fontSize: 12, color: NAVY }}>
                Expected by <b>{order.expectedBy}</b>
              </span>
            </div>
          )}

          {/* Tracking info */}
          {(order.status === 'SHIPPED' || order.status === 'OUT') && (
            <div style={{
              background: '#fff', borderRadius: 10, padding: '12px 16px',
              border: '1px solid #e8e0d0', marginBottom: 14,
            }}>
              <p style={{ fontSize: 10, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                Shipment Tracking
              </p>
              {order.tracking?.courier && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#666' }}>Courier</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{order.tracking.courier}</span>
                </div>
              )}
              {order.tracking?.id && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: '#666' }}>Tracking ID</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: NAVY, fontFamily: 'monospace' }}>{order.tracking.id}</span>
                </div>
              )}
              {order.tracking?.url ? (
                <a
                  href={order.tracking.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    width: '100%', padding: '9px', borderRadius: 8, boxSizing: 'border-box',
                    background: NAVY, border: `1px solid ${GOLD}`, color: GOLD,
                    fontSize: 12, fontWeight: 700, textDecoration: 'none',
                    fontFamily: "'Playfair Display', Georgia, serif",
                  }}
                >
                  <Truck size={13} /> Track Live
                </a>
              ) : (
                <p style={{ fontSize: 12, color: '#94969f', margin: 0 }}>
                  Tracking details will be updated once the courier scans your package.
                </p>
              )}
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <p style={{ fontSize: 10, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                Delivery Address
              </p>
              {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && order.status !== 'RETURNED' && (
                <button
                  onClick={() => setShowEditAddress(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    background: 'none', border: `1px solid ${GOLD}66`,
                    borderRadius: 6, padding: '3px 10px', cursor: 'pointer',
                    fontSize: 11, fontWeight: 600, color: NAVY,
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fdf8ec'; e.currentTarget.style.borderColor = GOLD }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = `${GOLD}66` }}
                >
                  <Pencil size={11} color={GOLD} /> Edit
                </button>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <MapPin size={13} color={GOLD} style={{ marginTop: 2, flexShrink: 0 }} />
              {order.address ? (
                <div style={{ fontSize: 12, color: '#444', lineHeight: 1.7 }}>
                  <div style={{ fontWeight: 600, color: NAVY }}>
                    {order.address.name}
                    {order.address.address_type && (
                      <span style={{
                        marginLeft: 6, fontSize: 10, fontWeight: 700,
                        background: `${GOLD}22`, color: GOLD,
                        borderRadius: 4, padding: '1px 6px',
                        textTransform: 'uppercase', letterSpacing: '0.06em',
                      }}>
                        {order.address.address_type}
                      </span>
                    )}
                  </div>
                  <div>{order.address.line1}</div>
                  {order.address.line2 && <div>{order.address.line2}</div>}
                  {order.address.landmark && <div style={{ color: '#888' }}>Near: {order.address.landmark}</div>}
                  <div>
                    {order.address.city}{order.address.state ? `, ${order.address.state}` : ''} – {order.address.pin}
                  </div>
                  {order.address.phone && (
                    <div style={{ color: '#888', marginTop: 2 }}>
                      📞 {order.address.phone}
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: 12, color: '#94969f', margin: 0 }}>Address not available</p>
              )}
            </div>
          </div>

          <div style={{
            background: '#fff', borderRadius: 10, padding: '12px 16px',
            border: '1px solid #e8e0d0', marginBottom: 14,
          }}>
            <p style={{ fontSize: 10, color: '#aaa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              Price Details
            </p>
            {[
              { label: 'MRP Total', value: `₹${order.mrp.toLocaleString('en-IN')}` },
              { label: 'Discount', value: `-₹${order.discount.toLocaleString('en-IN')}`, color: '#16a34a' },
              { label: 'Delivery', value: order.delivery === 0 ? 'FREE' : `₹${order.delivery}`, color: order.delivery === 0 ? '#16a34a' : undefined },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#666' }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: row.color || '#444' }}>{row.value}</span>
              </div>
            ))}
            {(() => {
              const pm = order.payment_method
              const codRemaining = order.cod_remaining || 0
              if (pm === 'PREPAID') {
                return (
                  <>
                    <div style={{ borderTop: `1px solid ${GOLD}44`, paddingTop: 8, marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Total Paid</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }}>✓ Paid Online</span>
                      <span style={{ fontSize: 11, color: '#16a34a' }}>5% discount applied</span>
                    </div>
                  </>
                )
              } else if (pm === 'COD') {
                return (
                  <>
                    <div style={{ borderTop: `1px solid ${GOLD}44`, paddingTop: 8, marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Order Total</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ marginTop: 8, background: '#fffdf5', border: `1px solid ${GOLD}44`, borderRadius: 8, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: '#666' }}>Paid online</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>Rs.49</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12, color: '#666' }}>To pay on delivery</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>Rs.{codRemaining.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>2% discount applied on delivery amount</div>
                    </div>
                  </>
                )
              } else if (pm === 'FULL_COD') {
                return (
                  <>
                    <div style={{ borderTop: `1px solid ${GOLD}44`, paddingTop: 8, marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Order Total</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: '#fef9ec', color: '#b45309', border: '1px solid #fde68a' }}>Cash on Delivery</span>
                      <span style={{ fontSize: 11, color: '#b45309' }}>Pay Rs.{codRemaining.toLocaleString('en-IN')} on delivery</span>
                    </div>
                  </>
                )
              } else {
                return (
                  <div style={{ borderTop: `1px solid ${GOLD}44`, paddingTop: 8, marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Total Paid</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>₹{order.total.toLocaleString('en-IN')}</span>
                  </div>
                )
              }
            })()}
          </div>

          {/* Thank you card — shown after delivery */}
          {order.status === 'DELIVERED' && (
            <div style={{
              background: NAVY, borderRadius: 10,
              border: `1px solid ${GOLD}44`,
              padding: '18px 20px', marginBottom: 14, textAlign: 'center',
              boxShadow: `inset 0 0 0 1px ${GOLD}18`,
            }}>
              <img src="/vlogo__1_-removebg-preview.png" alt="Vaarria" style={{ height: 48, objectFit: 'contain', marginBottom: 8 }} />
              <div style={{ fontSize: 13, color: GOLD, fontFamily: "'Playfair Display', Georgia, serif", fontStyle: 'italic', marginBottom: 6 }}>
                We truly appreciate your trust in us.
              </div>
              <div style={{ fontSize: 11.5, color: '#c8c8d4', lineHeight: 1.6, marginBottom: 10 }}>
                If there's anything we can do to make your experience even better, we're always here for you.
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 8 }}>
                {[
                  { icon: '✦', label: 'Premium Quality' },
                  { icon: '✿', label: 'Crafted with Care' },
                  { icon: '♡', label: 'Made for You' },
                ].map(({ icon, label }) => (
                  <div key={label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 14, color: GOLD, marginBottom: 2 }}>{icon}</div>
                    <div style={{ fontSize: 9, color: `${GOLD}99`, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 9, color: `${GOLD}77`, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                ♥ With love, The Vaarria Team
              </div>
            </div>
          )}

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
              <ActionBtn icon={<RotateCcw size={13} />} label="Return / Exchange" onClick={() => setShowReturnModal(true)} />
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

      {showEditAddress && (
        <EditAddressModal
          order={order}
          onClose={() => setShowEditAddress(false)}
          onSaved={handleAddressSaved}
        />
      )}

      {showReturnModal && (
        <ReturnExchangeModal
          order={order}
          onClose={() => setShowReturnModal(false)}
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
        border: primary
          ? `1px solid ${GOLD}`
          : danger
          ? '1.5px solid #dc2626'
          : `1.5px solid ${GOLD}44`,
        background: primary
          ? hover ? GOLD : NAVY
          : hover
          ? danger ? '#fee2e2' : '#fdf8ec'
          : '#fff',
        color: primary ? (hover ? NAVY : GOLD) : danger ? '#dc2626' : NAVY,
        transform: hover ? 'translateY(-1px)' : 'none',
        boxShadow: hover && primary ? `0 4px 14px ${GOLD}44` : 'none',
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
    <div style={{ textAlign: 'center', padding: '70px 20px' }}>
      <div style={{
        width: 80, height: 80, borderRadius: '50%',
        background: `${GOLD}18`, border: `2px solid ${GOLD}33`,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', margin: '0 auto 22px',
      }}>
        <ShoppingBag size={34} color={GOLD} strokeWidth={1.5} />
      </div>
      <h3 style={{
        fontSize: 20, fontWeight: 700, color: NAVY, marginBottom: 8,
        fontFamily: "'Playfair Display', Georgia, serif",
      }}>
        No {filter !== 'ALL' ? ORDER_STATUSES[filter]?.label : ''} Orders
      </h3>
      <p style={{ fontSize: 13, color: '#94969f', marginBottom: 28 }}>
        Looks like you haven't placed any orders yet. Start shopping!
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          background: NAVY, color: GOLD,
          border: `1px solid ${GOLD}`, borderRadius: 8,
          padding: '13px 36px', fontSize: 13, fontWeight: 700,
          cursor: 'pointer', letterSpacing: '0.06em',
          fontFamily: "'Playfair Display', Georgia, serif",
        }}
      >
        Explore Products
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
    <div style={{ minHeight: '100vh', background: '#f5f4f0', fontFamily: '"Sora", "Segoe UI", sans-serif' }}>

      {/* Top Nav — navy bar with logo */}
      <div style={{
        background: NAVY,
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 2px 16px rgba(5,12,28,0.3)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 64 }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none', border: `1px solid ${GOLD}44`,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              color: GOLD, padding: '6px 10px', borderRadius: 8,
              fontSize: 12, fontWeight: 600, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = `${GOLD}18` }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
          >
            <ArrowLeft size={16} />
          </button>

          <img
            src={logo}
            alt="Aarria"
            onClick={() => navigate('/products')}
            style={{
              height: 38, objectFit: 'contain', cursor: 'pointer',
            }}
          />

          <div style={{ marginLeft: 'auto' }}>
            <span style={{
              fontSize: 11, color: `${GOLD}cc`, fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              My Orders
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>

        {/* Page Title */}
        <div style={{ marginBottom: 22 }}>
          <h1 style={{
            fontSize: 26, fontWeight: 700, color: NAVY, margin: '0 0 4px',
            fontFamily: "'Playfair Display', Georgia, serif",
          }}>
            My Orders
          </h1>
          {!isLoading && (
            <p style={{ fontSize: 12.5, color: '#94969f', margin: 0 }}>
              {orders.length} order{orders.length !== 1 ? 's' : ''} placed
            </p>
          )}
        </div>

        {/* Search Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#fff', border: `1.5px solid ${searchFocus ? GOLD : '#e8e0d0'}`,
          borderRadius: 10, padding: '0 14px', marginBottom: 16,
          transition: 'border-color 0.2s',
          boxShadow: searchFocus ? `0 0 0 3px ${GOLD}18` : 'none',
        }}>
          <Search size={16} color={searchFocus ? GOLD : '#bbb'} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            placeholder="Search by order ID or product name…"
            style={{
              flex: 1, border: 'none', outline: 'none', padding: '13px 0',
              fontSize: 13, color: NAVY, background: 'transparent',
            }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#bbb', padding: 0 }}>
              <XCircle size={16} />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 22 }}>
          {FILTER_OPTIONS.map(f => {
            const active = activeFilter === f.value
            return (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                style={{
                  flexShrink: 0, padding: '7px 18px', borderRadius: 20,
                  border: active ? `1.5px solid ${GOLD}` : '1.5px solid #e8e0d0',
                  background: active ? NAVY : '#fff',
                  color: active ? GOLD : '#666',
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: active ? `0 2px 10px ${NAVY}22` : 'none',
                }}
              >
                {f.label}
              </button>
            )
          })}
        </div>

        {/* Loading skeletons */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: 130, background: '#fff', borderRadius: 14,
                border: '1px solid #e8e0d0', animation: 'pulse 1.5s ease-in-out infinite',
              }} />
            ))}
            <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.45} }`}</style>
          </div>
        )}

        {isError && (
          <div style={{
            background: '#fff', borderRadius: 14, border: '1px solid #fee2e2',
            padding: '32px', textAlign: 'center',
          }}>
            <AlertCircle size={32} color="#dc2626" style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 14, color: NAVY, marginBottom: 16 }}>Couldn't load your orders.</p>
            <button
              onClick={refetch}
              style={{
                background: NAVY, color: GOLD, border: `1px solid ${GOLD}`,
                borderRadius: 8, padding: '10px 28px', fontSize: 13,
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
