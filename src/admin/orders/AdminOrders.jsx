import React, { useEffect, useMemo, useState } from 'react'
import {
  Search,
  RefreshCw,
  Loader2,
  AlertTriangle,
  ChevronDown,
  Package,
  Printer,
  Copy,
  Check,
  Truck,
  MapPin,
  Phone,
  CreditCard,
  ExternalLink,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
} from 'lucide-react'

import AdminNav from '../AdminNav'

const ORDERS_API_BASE =
  'https://zq0dbjycx6.execute-api.ap-south-1.amazonaws.com/prod'
const CDN = 'https://cdn.aarria.com/app/images/'
const PER_PAGE = 10

const STATUSES = [
  'CREATED',
  'PLACED',
  'CONFIRMED',
  'SHIPPED',
  'OUT',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
]

const STATUS_STYLES = {
  CREATED:   'bg-stone-500/10 text-stone-400 border-stone-500/20',
  PLACED:    'bg-violet-500/10 text-violet-400 border-violet-500/20',
  CONFIRMED: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  SHIPPED:   'bg-amber-500/10 text-amber-400 border-amber-500/20',
  OUT:       'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  DELIVERED: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  CANCELLED: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  RETURNED:  'bg-stone-500/10 text-stone-400 border-stone-500/20',
}

// Indian courier providers — {id} is replaced with the tracking/AWB number
const COURIERS = [
  { name: 'Shiprocket', url: 'https://shiprocket.co/tracking/{id}' },
  { name: 'Delhivery', url: 'https://www.delhivery.com/track/package/{id}' },
  { name: 'Blue Dart', url: 'https://www.bluedart.com/trackdartresultthirdparty?trackFor=0&trackNo={id}' },
  { name: 'DTDC', url: 'https://www.dtdc.in/tracking.asp?strCnno={id}' },
  { name: 'Ekart', url: 'https://ekartlogistics.com/shipmenttrack/{id}' },
  { name: 'XpressBees', url: 'https://www.xpressbees.com/shipment/tracking?awbNo={id}' },
  { name: 'India Post', url: 'https://www.indiapost.gov.in/_layouts/15/DOP.Portal.Tracking/TrackConsignment.aspx' },
  { name: 'Other', url: '' },
]

const courierUrl = (provider, trackingId) => {
  const courier = COURIERS.find((c) => c.name === provider)
  if (!courier?.url) return ''
  return courier.url.replace('{id}', encodeURIComponent(trackingId || ''))
}

const formatINR = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

const addressLines = (a) =>
  [
    a?.line1,
    a?.line2,
    a?.landmark,
    [a?.city, a?.state].filter(Boolean).join(', '),
    a?.pin ? `PIN: ${a.pin}` : '',
  ].filter(Boolean)

const shippableItems = (order) =>
  (order.items || []).filter((i) => i.item_status !== 'QC_FAILED')

// ─── Courier invoice / shipping slip ──────────────────────────────────────────
const printInvoice = (order) => {
  const win = window.open('', '_blank')
  if (!win) return

  // QC-failed items are not shipped, so they're excluded from the slip
  const rows = shippableItems(order)
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

  const a = order.address || {}

  win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Invoice-${order.id}</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1d2433; padding: 32px; font-size: 13px; }
    .top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1d2433; padding-bottom: 12px; }
    .brand { color: #A65A66; font-size: 26px; font-weight: 800; margin: 0; }
    .muted { color: #6b7280; font-size: 12px; }
    .grid { display: flex; gap: 24px; margin-top: 18px; }
    .box { flex: 1; border: 1.5px solid #1d2433; border-radius: 8px; padding: 14px; }
    .box h3 { margin: 0 0 8px; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; }
    .shipto { font-size: 15px; line-height: 1.7; }
    .shipto .name { font-size: 17px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
    th { text-align: left; border-bottom: 2px solid #1d2433; padding: 8px 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    th:nth-child(2) { text-align: center; } th:nth-child(3), th:nth-child(4) { text-align: right; }
    td { border-bottom: 1px solid #e5e7eb; padding: 8px 6px; }
    .totals { margin-top: 14px; margin-left: auto; width: 240px; }
    .totals div { display: flex; justify-content: space-between; padding: 4px 0; }
    .grand { border-top: 1.5px solid #1d2433; font-weight: 700; padding-top: 8px !important; font-size: 15px; }
    .paid { display: inline-block; margin-top: 6px; padding: 3px 10px; border: 1.5px solid #16a34a; color: #16a34a; border-radius: 4px; font-weight: 700; font-size: 12px; }
    .footer { margin-top: 36px; font-size: 11px; color: #6b7280; text-align: center; }
  </style>
</head>
<body>
  <div class="top">
    <div>
      <p class="brand">aarria</p>
      <p class="muted">www.aarria.com · Women's Ethnic Wear</p>
    </div>
    <div style="text-align:right">
      <p style="margin:0;font-weight:700;font-size:15px">Order #${order.id}</p>
      <p class="muted" style="margin:4px 0 0">Date: ${order.date}</p>
      <span class="paid">${order.payment_status === 'PAID' ? 'PREPAID' : order.payment_status}</span>
    </div>
  </div>

  <div class="grid">
    <div class="box">
      <h3>Ship To</h3>
      <div class="shipto">
        <div class="name">${a.name || ''}</div>
        ${addressLines(a).join('<br/>')}
        ${a.phone ? `<br/><b>Phone: ${a.phone}</b>` : ''}
      </div>
    </div>
    <div class="box">
      <h3>Shipment</h3>
      <p style="margin:0;line-height:1.9">
        Courier: <b>${order.tracking?.provider || '—'}</b><br/>
        AWB / Tracking ID: <b>${order.tracking?.id || '—'}</b><br/>
        Items: <b>${shippableItems(order).reduce((s, i) => s + (i.quantity || 1), 0)}</b><br/>
        Payment ID: ${order.payment_id || '—'}
      </p>
    </div>
  </div>

  <table>
    <thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Amount</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="totals">
    <div class="grand"><span>Total ${order.payment_status === 'PAID' ? '(Paid)' : ''}</span><span>₹${Number(order.total).toLocaleString('en-IN')}</span></div>
  </div>

  <p class="footer">This is a computer generated invoice. Thank you for shopping with Aarria.</p>
</body>
</html>`)
  win.document.close()
  win.focus()
  win.print()
}

// ─── Small bits ───────────────────────────────────────────────────────────────

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_STYLES[status] || STATUS_STYLES.CREATED}`}
  >
    {status}
  </span>
)

const CopyBtn = ({ text }) => {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        navigator.clipboard?.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1200)
      }}
      className='p-1 rounded text-stone-500 hover:text-stone-200 hover:bg-stone-800 transition-colors'
      title='Copy'
    >
      {copied ? <Check size={12} className='text-emerald-400' /> : <Copy size={12} />}
    </button>
  )
}

const Field = ({ label, children }) => (
  <div>
    <label className='block text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1'>
      {label}
    </label>
    {children}
  </div>
)

const inputCls =
  'w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-rose-500 transition-colors'

// ─── QC Fail modal ────────────────────────────────────────────────────────────

const QC_REASONS = [
  'Damaged in QC check',
  'Print / colour defect',
  'Stitching issue',
  'Wrong size received from vendor',
  'Out of stock',
]

function QCFailModal({ order, item, onClose, onDone, setToast }) {
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!reason.trim()) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch(
        `${ORDERS_API_BASE}/admin/orders/${order.id}/items/${item.id}/qc-fail`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: reason.trim() }),
        },
      )
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.detail || 'Update failed')
      setToast('Item marked as QC Failed')
      onDone()
    } catch (e) {
      setError(e.message || 'Update failed')
      setSaving(false)
    }
  }

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && !saving && onClose()}
      className='fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4'
    >
      <div className='w-full max-w-md bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl'>
        <div className='flex items-center gap-3 px-6 py-4 border-b border-stone-800 bg-stone-900/50'>
          <div className='w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center'>
            <AlertTriangle size={14} className='text-rose-400' />
          </div>
          <div>
            <h3 className='text-sm font-bold text-stone-100'>Mark Item as QC Failed</h3>
            <p className='text-xs text-stone-500'>
              {item.name}{item.size ? ` · Size ${item.size}` : ''} · Order #{order.id}
            </p>
          </div>
        </div>

        <div className='p-6 space-y-3'>
          <p className='text-xs text-stone-400'>
            The customer will see this item as <b className='text-rose-400'>QC Failed</b> along
            with the reason you enter. It will be excluded from the shipping slip.
          </p>

          <div className='flex flex-wrap gap-1.5'>
            {QC_REASONS.map((r) => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-colors ${
                  reason === r
                    ? 'border-rose-500 text-rose-400 bg-rose-500/10'
                    : 'border-stone-700 text-stone-400 hover:border-stone-500'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder='Reason shown to the customer…'
            className='w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-rose-500 transition-colors resize-none'
          />

          {error && (
            <p className='text-xs text-rose-400 flex items-center gap-1.5'>
              <AlertTriangle size={12} /> {error}
            </p>
          )}
        </div>

        <div className='flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-800 bg-stone-900/30'>
          <button
            onClick={onClose}
            disabled={saving}
            className='px-4 py-2 rounded-xl text-sm font-semibold border border-stone-700 text-stone-300 hover:border-stone-500 transition-colors disabled:opacity-40'
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving || !reason.trim()}
            className='flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-50'
          >
            {saving ? (
              <>
                <Loader2 size={13} className='animate-spin' /> Saving…
              </>
            ) : (
              'Mark QC Failed'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Expanded order panel ─────────────────────────────────────────────────────

function OrderActions({ order, onUpdated, setToast }) {
  const [status, setStatus] = useState(order.status)
  const [price, setPrice] = useState(String(order.total))
  const [provider, setProvider] = useState(order.tracking?.provider || 'Shiprocket')
  const [trackingId, setTrackingId] = useState(order.tracking?.id || '')
  const [trackingUrl, setTrackingUrl] = useState(order.tracking?.url || '')
  const [urlTouched, setUrlTouched] = useState(Boolean(order.tracking?.url))
  const [saving, setSaving] = useState('')

  useEffect(() => {
    if (!urlTouched) {
      setTrackingUrl(courierUrl(provider, trackingId))
    }
  }, [provider, trackingId, urlTouched])

  const call = async (key, url, body) => {
    setSaving(key)
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.detail || 'Update failed')
      setToast(data.message || 'Updated')
      onUpdated()
    } catch (e) {
      setToast(e.message || 'Update failed')
    } finally {
      setSaving('')
    }
  }

  return (
    <div className='space-y-4'>
      {/* Status */}
      <Field label='Order Status'>
        <div className='flex gap-2'>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={inputCls}
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
          <button
            onClick={() =>
              call('status', `${ORDERS_API_BASE}/admin/orders/${order.id}/status`, { status })
            }
            disabled={saving === 'status' || status === order.status}
            className='px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-rose-500 to-pink-600 text-white disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap'
          >
            {saving === 'status' ? <Loader2 size={13} className='animate-spin' /> : 'Update'}
          </button>
        </div>
      </Field>

      {/* Price */}
      <Field label='Total Amount (₹)'>
        <div className='flex gap-2'>
          <input
            type='number'
            min='1'
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={inputCls}
          />
          <button
            onClick={() =>
              call('price', `${ORDERS_API_BASE}/admin/orders/${order.id}/price`, {
                total_amount: parseInt(price) || 0,
              })
            }
            disabled={saving === 'price' || parseInt(price) === order.total || !(parseInt(price) > 0)}
            className='px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-rose-500 to-pink-600 text-white disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap'
          >
            {saving === 'price' ? <Loader2 size={13} className='animate-spin' /> : 'Save'}
          </button>
        </div>
      </Field>

      {/* Tracking */}
      <div className='border border-stone-800 rounded-xl p-3 space-y-3 bg-stone-900/40'>
        <p className='text-[10px] font-semibold uppercase tracking-widest text-stone-500 flex items-center gap-1.5'>
          <Truck size={12} /> Tracking
        </p>
        <div className='grid grid-cols-2 gap-2'>
          <Field label='Courier'>
            <select
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value)
                setUrlTouched(false)
              }}
              className={inputCls}
            >
              {COURIERS.map((c) => (
                <option key={c.name} value={c.name}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label='Tracking / AWB ID'>
            <input
              value={trackingId}
              onChange={(e) => {
                setTrackingId(e.target.value)
                setUrlTouched(false)
              }}
              placeholder='AWB123456789'
              className={inputCls}
            />
          </Field>
        </div>
        <Field label='Tracking URL'>
          <input
            value={trackingUrl}
            onChange={(e) => {
              setTrackingUrl(e.target.value)
              setUrlTouched(true)
            }}
            placeholder='https://…'
            className={inputCls}
          />
        </Field>
        <div className='flex items-center gap-2'>
          <button
            onClick={() =>
              call('tracking', `${ORDERS_API_BASE}/admin/orders/${order.id}/tracking`, {
                provider,
                tracking_id: trackingId,
                tracking_url: trackingUrl || null,
              })
            }
            disabled={saving === 'tracking' || !trackingId.trim()}
            className='px-4 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-rose-500 to-pink-600 text-white disabled:opacity-40 disabled:cursor-not-allowed'
          >
            {saving === 'tracking' ? <Loader2 size={13} className='animate-spin' /> : 'Save Tracking'}
          </button>
          {trackingUrl && (
            <a
              href={trackingUrl}
              target='_blank'
              rel='noreferrer'
              className='flex items-center gap-1 text-xs text-stone-400 hover:text-rose-400'
            >
              <ExternalLink size={12} /> Test link
            </a>
          )}
        </div>
      </div>

      {/* Invoice */}
      <button
        onClick={() => printInvoice(order)}
        className='w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold border border-stone-700 text-stone-300 hover:border-rose-500/50 hover:text-rose-400 transition-all'
      >
        <Printer size={13} /> Print Invoice / Shipping Slip
      </button>
    </div>
  )
}

function OrderRow({ order, onUpdated, setToast }) {
  const [expanded, setExpanded] = useState(false)
  const [qcItem, setQcItem] = useState(null)
  const a = order.address || {}
  const qcFailedCount = (order.items || []).filter(
    (i) => i.item_status === 'QC_FAILED',
  ).length

  return (
    <div className='border-t border-stone-800/60'>
      {/* Summary row */}
      <div
        onClick={() => setExpanded((p) => !p)}
        className='flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-stone-900/40 transition-colors'
      >
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-2 flex-wrap'>
            <span className='text-sm font-semibold text-stone-100 font-mono'>#{order.id}</span>
            <CopyBtn text={order.id} />
            <StatusBadge status={order.status} />
            {order.payment_status !== 'PAID' && (
              <span className='text-[10px] font-bold text-amber-400 border border-amber-500/30 bg-amber-500/10 rounded-full px-2 py-0.5'>
                {order.payment_status}
              </span>
            )}
            {order.tracking?.id && (
              <span className='text-[10px] text-stone-400 border border-stone-700 rounded-full px-2 py-0.5'>
                {order.tracking.provider} · {order.tracking.id}
              </span>
            )}
            {qcFailedCount > 0 && (
              <span className='text-[10px] font-bold text-rose-400 border border-rose-500/30 bg-rose-500/10 rounded-full px-2 py-0.5'>
                QC FAILED × {qcFailedCount}
              </span>
            )}
          </div>
          <p className='text-xs text-stone-500 mt-1 truncate'>
            {order.date} · {a.name || `Customer ${order.customer_id}`} · {(order.items || []).length} item{(order.items || []).length !== 1 ? 's' : ''}
          </p>
        </div>
        <span className='text-sm font-bold text-stone-100 whitespace-nowrap'>{formatINR(order.total)}</span>
        <ChevronDown
          size={16}
          className={`text-stone-500 transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Expanded */}
      {expanded && (
        <div className='px-5 pb-5 grid grid-cols-1 lg:grid-cols-3 gap-4'>
          {/* Items */}
          <div className='bg-stone-900/40 border border-stone-800 rounded-xl p-3'>
            <p className='text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-2 flex items-center gap-1.5'>
              <Package size={12} /> Items
            </p>
            <div className='space-y-2'>
              {(order.items || []).map((item) => {
                const failed = item.item_status === 'QC_FAILED'
                return (
                  <div
                    key={item.id}
                    onClick={() => item.product_id && window.open(`/product/${item.product_id}`, '_blank')}
                    className={`flex items-center gap-3 p-2 rounded-lg border bg-stone-950 ${
                      failed ? 'border-rose-500/40 opacity-80' : 'border-stone-800'
                    } ${item.product_id ? 'cursor-pointer hover:border-rose-500/40' : ''}`}
                  >
                    {item.image ? (
                      <img
                        src={`${CDN}${item.image}`}
                        alt=''
                        className='w-10 h-12 rounded object-cover border border-stone-800 flex-shrink-0'
                        onError={(e) => (e.target.style.visibility = 'hidden')}
                      />
                    ) : (
                      <div className='w-10 h-12 rounded bg-stone-800 flex-shrink-0' />
                    )}
                    <div className='min-w-0 flex-1'>
                      <p className='text-xs font-semibold text-stone-200 truncate'>{item.name}</p>
                      <p className='text-[11px] text-stone-500'>
                        {item.size ? `Size ${item.size} · ` : ''}Qty {item.quantity} · {formatINR(item.price)}
                      </p>
                      {failed && (
                        <p className='text-[10px] text-rose-400 mt-0.5'>
                          <b>QC Failed</b>{item.qc_reason ? ` — ${item.qc_reason}` : ''}
                        </p>
                      )}
                    </div>
                    {!failed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setQcItem(item)
                        }}
                        className='flex-shrink-0 px-2 py-1 rounded-md text-[10px] font-bold border border-stone-700 text-stone-400 hover:border-rose-500/60 hover:text-rose-400 transition-colors'
                        title='Cancel this item with a reason (QC Failed)'
                      >
                        QC FAIL
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Address + payment */}
          <div className='bg-stone-900/40 border border-stone-800 rounded-xl p-3 space-y-4'>
            <div>
              <p className='text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-2 flex items-center gap-1.5'>
                <MapPin size={12} /> Delivery Address
              </p>
              <p className='text-sm font-semibold text-stone-200'>{a.name}</p>
              <p className='text-xs text-stone-400 leading-relaxed'>
                {addressLines(a).map((line) => (
                  <span key={line}>{line}<br /></span>
                ))}
              </p>
              {a.phone && (
                <div className='flex items-center gap-3 mt-2'>
                  <a
                    href={`tel:${a.phone}`}
                    className='flex items-center gap-1 text-xs text-stone-300 hover:text-rose-400'
                  >
                    <Phone size={11} /> {a.phone}
                  </a>
                  <a
                    href={`https://wa.me/91${String(a.phone).replace(/\D/g, '').slice(-10)}`}
                    target='_blank'
                    rel='noreferrer'
                    className='flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300'
                  >
                    <MessageCircle size={11} /> WhatsApp
                  </a>
                </div>
              )}
            </div>
            <div>
              <p className='text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-2 flex items-center gap-1.5'>
                <CreditCard size={12} /> Payment
              </p>
              <p className='text-xs text-stone-400 leading-relaxed font-mono'>
                Razorpay: {order.razorpay_order_id || '—'}<br />
                Payment: {order.payment_id || '—'}
              </p>
              <p className='text-xs text-stone-400 mt-1'>
                Status: <b className={order.payment_status === 'PAID' ? 'text-emerald-400' : 'text-amber-400'}>{order.payment_status}</b>
                {' · '}ETA: {order.estimated_delivery || '—'}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className='bg-stone-900/40 border border-stone-800 rounded-xl p-3'>
            <p className='text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-3 flex items-center gap-1.5'>
              <IndianRupee size={12} /> Manage Order
            </p>
            <OrderActions order={order} onUpdated={onUpdated} setToast={setToast} />
          </div>
        </div>
      )}

      {qcItem && (
        <QCFailModal
          order={order}
          item={qcItem}
          onClose={() => setQcItem(null)}
          onDone={() => {
            setQcItem(null)
            onUpdated()
          }}
          setToast={setToast}
        />
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminOrders() {
  const [allOrders, setAllOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [paymentFilter, setPaymentFilter] = useState('ALL')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)

  const fetchOrders = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${ORDERS_API_BASE}/admin/orders-full`)
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const json = await res.json()
      setAllOrders(json.orders || [])
    } catch {
      setError('Failed to load orders. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2500)
    return () => clearTimeout(t)
  }, [toast])

  const filtered = useMemo(() => {
    let list = [...allOrders]

    if (statusFilter === 'QC_FAILED') {
      list = list.filter((o) =>
        (o.items || []).some((i) => i.item_status === 'QC_FAILED'),
      )
    } else if (statusFilter !== 'ALL') {
      list = list.filter((o) => o.status === statusFilter)
    }
    if (paymentFilter !== 'ALL') {
      list = list.filter((o) => o.payment_status === paymentFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (o) =>
          String(o.id).includes(q) ||
          (o.address?.name || '').toLowerCase().includes(q) ||
          (o.address?.phone || '').includes(q) ||
          (o.tracking?.id || '').toLowerCase().includes(q) ||
          (o.items || []).some((i) => (i.name || '').toLowerCase().includes(q)),
      )
    }

    // created_at is yyyymmddhhmmssmmm — lexically sortable
    list.sort((x, y) =>
      sortDir === 'desc'
        ? (y.created_at || '').localeCompare(x.created_at || '')
        : (x.created_at || '').localeCompare(y.created_at || ''),
    )

    return list
  }, [allOrders, statusFilter, paymentFilter, search, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pageSlice = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, paymentFilter])

  const stats = useMemo(() => {
    const paid = allOrders.filter((o) => o.payment_status === 'PAID')
    return {
      total: allOrders.length,
      revenue: paid.reduce((s, o) => s + (o.total || 0), 0),
      toShip: allOrders.filter((o) => ['PLACED', 'CONFIRMED'].includes(o.status)).length,
      inTransit: allOrders.filter((o) => ['SHIPPED', 'OUT'].includes(o.status)).length,
      delivered: allOrders.filter((o) => o.status === 'DELIVERED').length,
      cancelled: allOrders.filter((o) => ['CANCELLED', 'RETURNED'].includes(o.status)).length,
    }
  }, [allOrders])

  return (
    <div
      className='min-h-screen bg-stone-950 text-stone-100'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <link
        href='https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap'
        rel='stylesheet'
      />

      {/* Top bar */}
      <AdminNav>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className='flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-stone-700 text-stone-300 hover:border-stone-500 hover:text-stone-100 disabled:opacity-50 transition-colors'
        >
          {loading ? <Loader2 size={14} className='animate-spin' /> : <RefreshCw size={14} />}
          Refresh
        </button>
      </AdminNav>

      <div className='max-w-7xl mx-auto px-6 py-8 space-y-6'>
        {/* Stats */}
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4'>
          {[
            { label: 'Total Orders', val: stats.total, color: 'text-stone-100' },
            { label: 'Revenue (Paid)', val: formatINR(stats.revenue), color: 'text-stone-100' },
            { label: 'To Ship', val: stats.toShip, color: 'text-violet-400' },
            { label: 'In Transit', val: stats.inTransit, color: 'text-amber-400' },
            { label: 'Delivered', val: stats.delivered, color: 'text-emerald-400' },
            { label: 'Cancelled', val: stats.cancelled, color: 'text-rose-400' },
          ].map(({ label, val, color }) => (
            <div key={label} className='bg-stone-900 border border-stone-800 rounded-2xl p-4'>
              <p className='text-[10px] font-semibold uppercase tracking-widest text-stone-500 mb-1'>
                {label}
              </p>
              <p className={`text-xl font-bold ${color}`}>{val}</p>
            </div>
          ))}
        </div>

        {/* Orders card */}
        <div className='bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden'>
          {/* Toolbar */}
          <div className='flex flex-wrap items-center gap-3 px-5 py-4 border-b border-stone-800 bg-stone-900/40'>
            <div className='relative flex-1 min-w-[200px]'>
              <Search
                size={14}
                className='absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none'
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search order ID, customer, phone, product, AWB…'
                className='w-full pl-9 pr-4 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-rose-500 transition-colors'
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='px-3 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-sm text-stone-300 focus:outline-none focus:border-rose-500'
            >
              <option value='ALL'>All statuses</option>
              {STATUSES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
              <option value='QC_FAILED'>QC FAILED (items)</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className='px-3 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-sm text-stone-300 focus:outline-none focus:border-rose-500'
            >
              <option value='ALL'>All payments</option>
              <option value='PAID'>Paid</option>
              <option value='PENDING'>Pending</option>
            </select>
            <button
              onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
              className='px-3 py-2.5 rounded-xl text-sm border border-stone-700 text-stone-300 hover:border-stone-500 transition-colors'
              title='Sort by date'
            >
              Date {sortDir === 'desc' ? '↓' : '↑'}
            </button>
            <span className='text-xs text-stone-500 ml-auto'>{filtered.length} orders</span>
          </div>

          {/* List */}
          {loading ? (
            <div className='flex items-center justify-center gap-3 py-20 text-stone-500'>
              <Loader2 size={18} className='animate-spin' /> Loading orders…
            </div>
          ) : error ? (
            <div className='flex flex-col items-center justify-center gap-3 py-20 text-stone-500'>
              <AlertTriangle size={24} className='text-rose-400' />
              <p className='text-sm'>{error}</p>
              <button
                onClick={fetchOrders}
                className='px-4 py-2 rounded-xl text-sm border border-stone-700 text-stone-300 hover:border-stone-500 transition-colors'
              >
                Retry
              </button>
            </div>
          ) : pageSlice.length === 0 ? (
            <div className='flex flex-col items-center justify-center gap-3 py-20 text-stone-500'>
              <Package size={28} className='opacity-40' />
              <p className='text-sm'>No orders found</p>
            </div>
          ) : (
            pageSlice.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onUpdated={fetchOrders}
                setToast={setToast}
              />
            ))
          )}

          {/* Pagination */}
          {!loading && !error && filtered.length > PER_PAGE && (
            <div className='flex items-center justify-between gap-3 px-5 py-4 border-t border-stone-800 bg-stone-900/30'>
              <p className='text-xs text-stone-500'>
                Showing {(safePage - 1) * PER_PAGE + 1}–{Math.min(safePage * PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className='flex items-center gap-1.5'>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className='p-1.5 rounded-lg border border-stone-700 text-stone-400 hover:border-stone-500 disabled:opacity-30 transition-colors'
                >
                  <ChevronLeft size={14} />
                </button>
                <span className='text-xs text-stone-400 px-2'>
                  {safePage} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className='p-1.5 rounded-lg border border-stone-700 text-stone-400 hover:border-stone-500 disabled:opacity-30 transition-colors'
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-sm text-stone-100 shadow-2xl'>
          <Check size={14} className='text-emerald-400' /> {toast}
        </div>
      )}
    </div>
  )
}
