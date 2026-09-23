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
import { CLOSED_ORDER_STATUSES, NO_COD_DUE_STATUSES } from './constants/orderStatus'
const logo = '/vlogo.png'
import './constants/global.css'

// ─── Brand ────────────────────────────────────────────────────────────────────

const GOLD = '#C9A84C'
const NAVY = '#050C1C'

// ─── Constants ────────────────────────────────────────────────────────────────

import { ORDERS_URL } from './config'
import { authHeaders } from './utils/authHeaders'
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

const itemCount = (order) => (order.items || []).reduce((s, i) => s + (i.quantity || 1), 0)

const splitDiscounts = (order) => {
  const itemTotal = (order.items || []).reduce((s, i) => s + (i.price || 0) * (i.quantity || 1), 0)
  const specialDiscount = order.special_discount || 0
  const catalogDiscount = Math.max(0, (order.mrp || 0) - itemTotal)
  const paymentDiscount = Math.max(0, itemTotal - specialDiscount - (order.total || 0))
  return { catalogDiscount, specialDiscount, paymentDiscount }
}

// ponytail: seller state hardcoded to match the registered office shown
// elsewhere (OrderDetailsModal, ContactUs) — promote to a shared constant
// if a GSTIN/second warehouse state ever gets added.
const SELLER_STATE = 'Karnataka'

// prices are GST-inclusive, so tax is extracted out of lineTotal rather than added on top
const gstSplit = (lineTotal, gstRate, isIntraState) => {
  const taxable = gstRate > 0 ? lineTotal / (1 + gstRate / 100) : lineTotal
  const gstAmount = lineTotal - taxable
  return {
    taxable,
    cgst: isIntraState ? gstAmount / 2 : 0,
    sgst: isIntraState ? gstAmount / 2 : 0,
    igst: isIntraState ? 0 : gstAmount,
  }
}

const PAYMENT_MODE_LABEL = {
  PREPAID: 'Prepaid (Online)',
  COD: 'Cash on Delivery (₹49 paid online)',
  FULL_COD: 'Cash on Delivery',
}

// No goods shipped, no tax invoice — a cancelled order never gets one.
const hasInvoice = (order) =>
  Boolean(order.tracking?.shipped_date || order.tracking?.delivered_date)

const generateInvoice = (order) => {
  const win = window.open('', '_blank')
  if (!win) return

  const { catalogDiscount, specialDiscount, paymentDiscount } = splitDiscounts(order)
  const codDue = !NO_COD_DUE_STATUSES.includes(order.status)
  const isIntraState = (order.address?.state || '').trim().toLowerCase() === SELLER_STATE.toLowerCase()

  let totalCgst = 0
  let totalSgst = 0
  let totalIgst = 0

  const rows = order.items
    .map((item) => {
      const qty = item.quantity || 1
      const lineTotal = item.price * qty - (item.coupon_discount || 0)
      const gstRate = item.gst || 0
      const { cgst, sgst, igst } = gstSplit(lineTotal, gstRate, isIntraState)
      totalCgst += cgst
      totalSgst += sgst
      totalIgst += igst
      const gstCols = isIntraState
        ? `<td style="text-align:right">₹${cgst.toFixed(2)}</td><td style="text-align:right">₹${sgst.toFixed(2)}</td>`
        : `<td style="text-align:right">₹${igst.toFixed(2)}</td>`
      return `
        <tr>
          <td>${item.name || ''}${item.size ? ` (Size: ${item.size})` : ''}</td>
          <td style="text-align:center">${qty}</td>
          <td style="text-align:right">₹${Number(item.mrp || item.price).toLocaleString('en-IN')}</td>
          <td style="text-align:right">₹${Number(item.price).toLocaleString('en-IN')}</td>
          <td style="text-align:right">${gstRate}%</td>
          ${gstCols}
          <td style="text-align:right">₹${Number(lineTotal).toLocaleString('en-IN')}</td>
        </tr>`
    })
    .join('')

  const gstHeaderCols = isIntraState ? `<th>CGST</th><th>SGST</th>` : `<th>IGST</th>`

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
    th:not(:first-child):not(:nth-child(2)) { text-align: right; }
    td { border-bottom: 1px solid #eee; padding: 8px 6px; }
    .totals { margin-top: 16px; margin-left: auto; width: 260px; font-size: 13px; }
    .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
    .totals .grand { border-top: 1px solid #C9A84C; font-weight: 700; margin-top: 4px; padding-top: 8px; color: #C9A84C; }
    .pay-mode { font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; text-align: center; margin: 16px 0 0; padding: 10px; border: 2px solid #C9A84C; color: #C9A84C; }
    .footer { margin-top: 40px; font-size: 11px; color: #94969f; text-align: center; }
  </style>
</head>
<body>
  <div style="text-align:center;margin-bottom:12px;">
    <img src="${window.location.origin}/vlogo.png" alt="Vaarria" style="height:60px;object-fit:contain;"/>
  </div>
  <p class="muted">www.vaarria.com</p>

  <p class="pay-mode">${PAYMENT_MODE_LABEL[order.payment_method] || order.payment_method}</p>

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
      <tr><th>Item</th><th>Qty</th><th>MRP</th><th>Unit Price</th><th>GST</th>${gstHeaderCols}<th>Amount</th></tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div><span>MRP Total</span><span>₹${Number(order.mrp).toLocaleString('en-IN')}</span></div>
    ${catalogDiscount ? `<div style="color:#16a34a"><span>MRP Discount</span><span>-₹${Number(catalogDiscount).toLocaleString('en-IN')}</span></div>` : ''}
    ${specialDiscount ? `<div style="color:#16a34a"><span>Special Discount</span><span>-₹${Number(specialDiscount).toLocaleString('en-IN')}</span></div>` : ''}
    ${paymentDiscount ? `<div style="color:#16a34a"><span>${order.payment_method === 'PREPAID' ? 'Prepaid' : 'COD'} Discount</span><span>-₹${Number(paymentDiscount).toLocaleString('en-IN')}</span></div>` : ''}
    <div><span>Delivery</span><span>${order.delivery === 0 ? 'FREE' : `₹${order.delivery}`}</span></div>
    ${isIntraState
      ? `<div><span>CGST</span><span>₹${totalCgst.toFixed(2)}</span></div><div><span>SGST</span><span>₹${totalSgst.toFixed(2)}</span></div>`
      : `<div><span>IGST</span><span>₹${totalIgst.toFixed(2)}</span></div>`}
    <div class="grand"><span>Total Paid</span><span>₹${Number(order.total).toLocaleString('en-IN')}</span></div>
    ${order.payment_method === 'COD' ? `
    <div><span>Paid Online (Advance)</span><span>₹${Number(order.paid_online ?? 49).toLocaleString('en-IN')}</span></div>
    ${codDue ? `<div><span>Payable on Delivery</span><span>₹${Number(order.cod_remaining || 0).toLocaleString('en-IN')}</span></div>` : ''}` : ''}
    ${order.payment_method === 'FULL_COD' && codDue ? `
    <div><span>Payable on Delivery</span><span>₹${Number(order.cod_remaining || order.total).toLocaleString('en-IN')}</span></div>` : ''}
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
  RETURN_INITIATED:  { label: 'Return Initiated',  color: '#b45309', bg: '#fef3c7', icon: RotateCcw },
  REFUND_INITIATED:  { label: 'Refund Initiated',  color: '#b45309', bg: '#fef3c7', icon: Clock },
  REFUND_CREDITED:   { label: 'Refund Credited',   color: '#16a34a', bg: '#dcfce7', icon: CheckCircle2 },
  PARTIAL_RETURN_INITIATED: { label: 'Partial Return Initiated', color: '#b45309', bg: '#fef3c7', icon: RotateCcw },
  PARTIAL_RETURNED:         { label: 'Partially Returned',       color: '#6b7280', bg: '#f3f4f6', icon: RotateCcw },
  PARTIAL_REFUND_INITIATED: { label: 'Partial Refund Initiated', color: '#b45309', bg: '#fef3c7', icon: Clock },
  PARTIAL_REFUND_CREDITED:  { label: 'Partial Refund Credited',  color: '#16a34a', bg: '#dcfce7', icon: CheckCircle2 },
}

// ponytail: item_status RETURN_INITIATED only marks WHICH lines are coming
// back — it never advances. So a returned line takes its stage from the order
// status, or it reads "Return Initiated" under a "Partially Returned" order.
const RETURN_STAGES = ['RETURN_INITIATED', 'RETURNED', 'REFUND_INITIATED', 'REFUND_CREDITED']
const returnStage = (orderStatus) => {
  const base = String(orderStatus || '').replace('PARTIAL_', '')
  return RETURN_STAGES.includes(base) ? base : 'RETURN_INITIATED'
}

// What the customer was actually charged for n units of this line —
// coupon_discount is stored for the whole line, so scale it by n. Same basis
// the backend splits the refund on; showing item.price here read high.
const lineValue = (item, n) => Math.max(0, Math.round(
  ((item.price || 0) * (item.quantity || 1) - (item.coupon_discount || 0)) * n / (item.quantity || 1)
))

// ponytail: backend stores one return_refund per order, not per line — split
// it across returned lines by what each was charged, so the parts add up.
const lineRefund = (order, item, returnedItems) => {
  const rq = (i) => i.return_quantity || i.quantity || 1
  const total = returnedItems.reduce((n, i) => n + lineValue(i, rq(i)), 0)
  return total ? Math.round((order.return_refund || 0) * lineValue(item, rq(item)) / total) : 0
}

const RETURN_COURIER_INFO =
  'Our reverse-pickup partner will contact you within 24-48 hours to collect the item. ' +
  'Please keep it packed with all original tags and invoice.'

const SUPPORT_PHONE_DISPLAY = '+91 97315 80157'

const FILTER_OPTIONS = [
  { label: 'All Orders', value: 'ALL' },
  { label: 'On the way', value: 'SHIPPED' },
  { label: 'Delivered',  value: 'DELIVERED' },
  { label: 'Cancelled',  value: 'CANCELLED' },
  { label: 'Returned',   value: 'RETURNED' },
]

// PARTIAL_* statuses match on their base, so they land under the same chip.
const FILTER_MATCH = {
  SHIPPED: ['SHIPPED', 'OUT'],
  DELIVERED: ['DELIVERED'],
  CANCELLED: ['CANCELLED'],
  RETURNED: RETURN_STAGES,
}

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
  const isCancelled = status !== 'DELIVERED' && CLOSED_ORDER_STATUSES.includes(status)

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
        const active = i === idx && step !== 'DELIVERED'
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

// ─── Return Modal ─────────────────────────────────────────────────────────────

const RETURN_REASONS = [
  'Wrong size received',
  'Product not as described',
  'Damaged / defective product',
  'Wrong item delivered',
  'Changed my mind',
  'Better price available elsewhere',
  'Other',
]

function ReturnModal({ order, onClose, onReturned }) {
  // QC-failed lines were never shipped — not returnable, and the backend
  // leaves them out of the refund split too.
  const items = (order.items || []).filter(i => i.item_status !== 'QC_FAILED')
  // ponytail: opt-in, both here and per-unit. Pre-ticking every line at its
  // full quantity meant a customer who stepped ONE line down to 1 unit still
  // returned everything else at full quantity without ever touching it.
  const [selected, setSelected] = useState(() => new Set())
  const [qty, setQty] = useState({})
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const toggle = (id) => setSelected(prev => {
    const n = new Set(prev)
    n.has(id) ? n.delete(id) : n.add(id)
    return n
  })

  const changeQty = (item, delta) => setQty(prev => ({
    ...prev,
    [item.id]: Math.min(item.quantity || 1, Math.max(1, (prev[item.id] || 1) + delta)),
  }))

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      const ids = [...selected].map(String)
      const res = await axios.put(
        `${ORDERS_API_BASE}/orders/${order.id}/return?customer_id=${getCustomerId()}`,
        {
          reason,
          details: details || null,
          item_ids: ids,
          item_quantities: Object.fromEntries(ids.map(id => [id, qty[id] || 1])),
        },
        { headers: authHeaders() },
      )
      setResult(res.data || {})
      onReturned?.()
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to initiate return')
      setSubmitting(false)
    }
  }

  // ponytail: sums the lines the customer picked. The server prorates the same
  // picks over total_amount, so this matches to the rupee unless total_amount
  // was edited away from the line totals (admin price override / shipping).
  const chosen = items.filter(i => selected.has(i.id))
  const chosenUnits = chosen.reduce((n, i) => n + (qty[i.id] || 1), 0)
  const totalUnits = items.reduce((n, i) => n + (i.quantity || 1), 0)
  const estimate = chosen.reduce((n, i) => n + lineValue(i, qty[i.id] || 1), 0)

  const canSubmit = selected.size > 0 && reason

  if (result) {
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
          width: '100%', maxWidth: 420, background: '#fff', borderRadius: 16,
          boxShadow: '0 24px 64px rgba(5,12,28,0.22)', border: '1px solid #e8e0d0',
          padding: '26px 24px 22px', textAlign: 'center',
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', background: '#ecfdf5',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
          }}>
            <span style={{ color: '#16a34a', fontSize: 26 }}>✓</span>
          </div>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: NAVY, margin: '0 0 8px', fontFamily: "'Playfair Display', Georgia, serif" }}>
            {result.partial ? 'Partial return initiated' : 'Return initiated'}
          </h3>
          {result.refund_amount > 0 && (
            <p style={{ fontSize: 13, color: NAVY, margin: '0 0 10px' }}>
              Refund amount: <b style={{ color: '#16a34a' }}>₹{Number(result.refund_amount).toLocaleString('en-IN')}</b>
            </p>
          )}
          <p style={{ fontSize: 13, color: '#444', margin: '0 0 16px', lineHeight: 1.6 }}>
            {result.courier_info}
          </p>
          <button
            onClick={onClose}
            style={{
              padding: '10px 28px', borderRadius: 8, cursor: 'pointer',
              border: `1px solid ${GOLD}`, background: NAVY,
              fontSize: 13, fontWeight: 700, color: GOLD,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            Done
          </button>
        </div>
      </div>
    )
  }

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
              Return
            </h3>
            <p style={{ fontSize: 11, color: '#94969f', margin: '3px 0 0' }}>Order #{order.id}</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#aaa', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        <div style={{ padding: '18px 22px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Item selection */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Select items</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {items.map(item => (
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
                    <p style={{ fontSize: 11, color: '#888', margin: 0 }}>
                      Size: {item.size} · ₹{lineValue(item, 1).toLocaleString('en-IN')}{(item.quantity || 1) > 1 ? ' each' : ''}
                    </p>
                  </div>
                  {selected.has(item.id) && (item.quantity || 1) > 1 ? (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
                    >
                      <button
                        onClick={() => changeQty(item, -1)}
                        style={{ width: 22, height: 22, borderRadius: 5, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 13, lineHeight: 1, color: NAVY }}
                      >−</button>
                      <span style={{ fontSize: 12, fontWeight: 600, color: NAVY, minWidth: 14, textAlign: 'center' }}>{qty[item.id] || 1}</span>
                      <button
                        onClick={() => changeQty(item, 1)}
                        style={{ width: 22, height: 22, borderRadius: 5, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 13, lineHeight: 1, color: NAVY }}
                      >+</button>
                      <span style={{ fontSize: 10, color: '#aaa' }}>/ {item.quantity}</span>
                    </div>
                  ) : (
                    <span style={{ fontSize: 11, color: '#888', flexShrink: 0 }}>Qty {item.quantity || 1}</span>
                  )}
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
            {chosenUnits > 0 && (
              <p style={{ fontSize: 13, color: NAVY, margin: '0 0 6px', fontWeight: 700 }}>
                Returning {chosenUnits} of {totalUnits} unit{totalUnits > 1 ? 's' : ''} ·{' '}
                Refund <b style={{ color: '#16a34a' }}>₹{estimate.toLocaleString('en-IN')}</b>
              </p>
            )}
            <p style={{ fontSize: 12, color: '#666', margin: 0, lineHeight: 1.6 }}>
              We'll initiate your return right away and share reverse-pickup courier details.
            </p>
          </div>

          {error && (
            <p style={{ fontSize: 12, color: '#dc2626', margin: 0 }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '10px 20px', borderRadius: 8, cursor: submitting ? 'not-allowed' : 'pointer',
                border: `1.5px solid ${GOLD}66`, background: '#fff',
                fontSize: 13, fontWeight: 600, color: NAVY, opacity: submitting ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              style={{
                padding: '10px 24px', borderRadius: 8, cursor: (canSubmit && !submitting) ? 'pointer' : 'not-allowed',
                border: `1px solid ${GOLD}`, background: (canSubmit && !submitting) ? NAVY : '#f0ece4',
                fontSize: 13, fontWeight: 700, color: (canSubmit && !submitting) ? GOLD : '#bbb',
                fontFamily: "'Playfair Display', Georgia, serif",
                transition: 'all 0.15s',
              }}
            >
              {submitting ? 'Submitting…' : 'Submit Return'}
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
        null,
        { headers: authHeaders() },
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
          Order <b>#{order.id}</b> · {itemCount(order)} item{itemCount(order) > 1 ? 's' : ''} · ₹{order.total.toLocaleString('en-IN')}
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
        { headers: authHeaders() },
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
  // QC-failed lines were never shipped, so they are not part of a return.
  const returnableItems = (order.items || []).filter(i => i.item_status !== 'QC_FAILED')
  const returnedItems = returnableItems.filter(i => i.item_status === 'RETURN_INITIATED')
  const wasDelivered = order.status === 'DELIVERED' || RETURN_STAGES.includes(String(order.status).replace('PARTIAL_', ''))

  const handleCancelled = () => {
    setShowCancelModal(false)
    queryClient.invalidateQueries({ queryKey: ['orders'] })
  }

  const handleAddressSaved = () => {
    setShowEditAddress(false)
    queryClient.invalidateQueries({ queryKey: ['orders'] })
  }

  const handleReturned = () => {
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
            {order.payment_method === 'COD' && !NO_COD_DUE_STATUSES.includes(order.status) && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, ...(order.status === 'DELIVERED' ? { background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' } : { background: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b' }) }}>
                {order.status === 'DELIVERED' ? 'Paid on Delivery' : 'To Pay on Delivery'}: ₹{(order.cod_remaining ?? (order.total - (order.paid_online ?? 49))).toLocaleString('en-IN')}
              </span>
            )}
            {order.payment_method === 'FULL_COD' && !NO_COD_DUE_STATUSES.includes(order.status) && (
              <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, ...(order.status === 'DELIVERED' ? { background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' } : { background: '#fef3c7', color: '#92400e', border: '1px solid #f59e0b' }) }}>
                {order.status === 'DELIVERED' ? 'Paid on Delivery' : 'To Pay on Delivery'}: ₹{(order.cod_remaining ?? order.total).toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: '#94969f', margin: 0 }}>
            {itemCount(order)} item{itemCount(order) > 1 ? 's' : ''} ·{' '}
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
        {order.items.map(item => {
          const qty = item.quantity || 1
          const lineMrp = item.price * qty
          const lineTotal = lineMrp - (item.coupon_discount || 0)
          return (
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
                Size: <b>{item.size}</b> · Qty: <b>{qty}</b> ·{' '}
                {item.coupon_discount > 0 ? (
                  <>
                    <span style={{ color: '#94969f', textDecoration: 'line-through', marginRight: 4 }}>₹{lineMrp.toLocaleString('en-IN')}</span>
                    <span style={{ color: GOLD, fontWeight: 600 }}>₹{lineTotal.toLocaleString('en-IN')}</span>
                  </>
                ) : (
                  <span style={{ color: GOLD, fontWeight: 600 }}>₹{lineTotal.toLocaleString('en-IN')}</span>
                )}
              </p>
              {item.coupon_discount > 0 && (
                <span style={{
                  display: 'inline-block', marginTop: 3, fontSize: 10, fontWeight: 700,
                  color: '#16a34a', background: '#dcfce7', border: '1px solid #bbf7d0',
                  borderRadius: 10, padding: '1px 8px',
                }}>
                  Offer Applied
                </span>
              )}
              {item.item_status === 'RETURN_INITIATED' && (() => {
                const stage = ORDER_STATUSES[returnStage(order.status)]
                return (
                  <div style={{ marginTop: 4 }}>
                    <span style={{
                      display: 'inline-block', fontSize: 10, fontWeight: 700,
                      color: stage.color, background: stage.bg, border: `1px solid ${stage.color}44`,
                      borderRadius: 10, padding: '1px 8px',
                    }}>
                      {stage.label}
                    </span>
                    <p style={{ fontSize: 10, color: '#78350f', margin: '3px 0 0', maxWidth: 170 }}>
                      {item.return_quantity || qty} of {qty} returned
                      {order.return_refund > 0 && <> · ₹{lineRefund(order, item, returnedItems).toLocaleString('en-IN')}</>}
                    </p>
                  </div>
                )
              })()}
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
        )})}
      </div>

      {/* Expanded Section */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${GOLD}22`, padding: '14px 18px', background: '#fdfcf9' }}>
          <OrderTimeline status={order.status} />

          {RETURN_STAGES.includes(String(order.status || '').replace('PARTIAL_', '')) && (() => {
            const stage = returnStage(order.status)
            return (
            <div style={{
              background: '#fef3c7', border: '1px solid #b4530944',
              borderRadius: 10, padding: '12px 16px', marginBottom: 14,
            }}>
              <p style={{ fontSize: 12, color: '#78350f', margin: '0 0 8px', fontWeight: 700 }}>
                {order.return_partial ? 'Partial Return' : 'Full Return'}
                {order.return_partial && (
                  <span style={{ fontWeight: 500 }}>
                    {' '}· {returnedItems.reduce((n, i) => n + (i.return_quantity || i.quantity || 1), 0)} of{' '}
                    {returnableItems.reduce((n, i) => n + (i.quantity || 1), 0)} units
                  </span>
                )}
                {order.return_refund > 0 && (
                  <span style={{ fontWeight: 500 }}>
                    {' '}· Refund <b>₹{Number(order.return_refund).toLocaleString('en-IN')}</b>
                  </span>
                )}
              </p>
              {returnedItems.length > 0 && (
                <p style={{ fontSize: 12, color: '#78350f', margin: '0 0 8px', lineHeight: 1.5 }}>
                  {stage === 'RETURN_INITIATED' ? 'Returning' : 'Returned'}: {returnedItems.map(i => {
                    const rq = i.return_quantity || i.quantity || 1
                    return `${i.name || i.brand} (Qty ${rq}${rq !== (i.quantity || 1) ? ` of ${i.quantity}` : ''})`
                  }).join(', ')}
                </p>
              )}
              {order.return_reason && (
                <p style={{ fontSize: 12, color: '#78350f', margin: '0 0 8px', lineHeight: 1.5 }}>
                  Reason: <b>{order.return_reason}</b>{order.return_details ? ` — ${order.return_details}` : ''}
                </p>
              )}
              {stage === 'RETURN_INITIATED' && (
                <p style={{ fontSize: 12, color: '#78350f', margin: 0, lineHeight: 1.5 }}>
                  {RETURN_COURIER_INFO}
                </p>
              )}
              <p style={{ fontSize: 12, color: '#78350f', margin: '8px 0 0', lineHeight: 1.5 }}>
                For further queries, contact customer care at <b>{SUPPORT_PHONE_DISPLAY}</b>.
              </p>
            </div>
            )
          })()}

          {!CLOSED_ORDER_STATUSES.includes(order.status) && (
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
              {order.tracking?.provider && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#666' }}>Courier</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{order.tracking.provider}</span>
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
              {!CLOSED_ORDER_STATUSES.includes(order.status) && (
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
            {(() => {
              const { catalogDiscount, specialDiscount, paymentDiscount } = splitDiscounts(order)
              return [
                { label: 'MRP Total', value: `₹${order.mrp.toLocaleString('en-IN')}` },
                ...(catalogDiscount ? [{ label: 'MRP Discount', value: `-₹${catalogDiscount.toLocaleString('en-IN')}`, color: '#16a34a' }] : []),
                ...(specialDiscount ? [{ label: 'Special Discount', value: `-₹${specialDiscount.toLocaleString('en-IN')}`, color: '#16a34a' }] : []),
                ...(paymentDiscount ? [{ label: `${order.payment_method === 'PREPAID' ? 'Prepaid' : 'COD'} Discount`, value: `-₹${paymentDiscount.toLocaleString('en-IN')}`, color: '#16a34a' }] : []),
                { label: 'Delivery', value: order.delivery === 0 ? 'FREE' : `₹${order.delivery}`, color: order.delivery === 0 ? '#16a34a' : undefined },
              ]
            })().map(row => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: '#666' }}>{row.label}</span>
                <span style={{ fontSize: 12, fontWeight: 500, color: row.color || '#444' }}>{row.value}</span>
              </div>
            ))}
            {(() => {
              const pm = order.payment_method
              const codRemaining = order.cod_remaining || 0
              const codDue = !NO_COD_DUE_STATUSES.includes(order.status)
              if (pm === 'PREPAID') {
                return (
                  <>
                    <div style={{ borderTop: `1px solid ${GOLD}44`, paddingTop: 8, marginTop: 6, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: NAVY }}>Total Paid</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>₹{order.total.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }}>✓ Paid Online</span>
                      <span style={{ fontSize: 11, color: '#16a34a' }}>2% discount applied</span>
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
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#16a34a' }}>Rs.{(order.paid_online ?? 49).toLocaleString('en-IN')}</span>
                      </div>
                      {codDue && (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: '#666' }}>{order.status === 'DELIVERED' ? 'Paid on delivery' : 'To pay on delivery'}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: order.status === 'DELIVERED' ? '#16a34a' : NAVY }}>Rs.{codRemaining.toLocaleString('en-IN')}</span>
                          </div>
                          {order.status !== 'DELIVERED' && <div style={{ fontSize: 10, color: '#888', marginTop: 2 }}>1% discount applied on delivery amount</div>}
                        </>
                      )}
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
                    {codDue && (
                      <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {order.status === 'DELIVERED' ? (
                          <>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0' }}>✓ Paid on Delivery</span>
                            <span style={{ fontSize: 11, color: '#16a34a' }}>Rs.{codRemaining.toLocaleString('en-IN')} collected</span>
                          </>
                        ) : (
                          <>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10, background: '#fef9ec', color: '#b45309', border: '1px solid #fde68a' }}>Cash on Delivery</span>
                            <span style={{ fontSize: 11, color: '#b45309' }}>Pay Rs.{codRemaining.toLocaleString('en-IN')} on delivery</span>
                          </>
                        )}
                      </div>
                    )}
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
            {order.status !== 'CANCELLED' && (
              <ActionBtn
                icon={<Star size={13} />}
                label="Rate & Review"
                primary={order.status === 'DELIVERED'}
                disabled={!wasDelivered}
                title={!wasDelivered ? 'Available after delivery' : undefined}
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
              <ActionBtn icon={<RotateCcw size={13} />} label="Return" onClick={() => setShowReturnModal(true)} />
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
              disabled={!hasInvoice(order)}
              title={!hasInvoice(order) ? 'Invoice available once your order is shipped' : undefined}
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
        <ReturnModal
          order={order}
          onClose={() => setShowReturnModal(false)}
          onReturned={handleReturned}
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
        No {filter !== 'ALL' ? FILTER_OPTIONS.find(f => f.value === filter)?.label : ''} Orders
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
    // A PARTIAL_* status belongs under its base filter chip (Returned etc.).
    let list = activeFilter === 'ALL'
      ? orders
      : orders.filter(o => FILTER_MATCH[activeFilter].includes(String(o.status).replace('PARTIAL_', '')))
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

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px 96px' }}>

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
