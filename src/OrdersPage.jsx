import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
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
import logo from './assets/logo.png'
import './constants/global.css'

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://api.aarria.com'

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

// ─── Mock Fetcher (swap for real API) ─────────────────────────────────────────

const fetchOrders = async () => {
  // Replace with: const res = await axios.get(`${API_BASE}/orders`); return res.data
  return MOCK_ORDERS
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
        return (
          <React.Fragment key={step}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 64 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: done ? '#ff3f6c' : '#f0f0f0',
                border: active ? '2px solid #ff3f6c' : done ? 'none' : '2px solid #e0e0e0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: active ? '0 0 0 4px rgba(255,63,108,0.12)' : 'none',
              }}>
                {done
                  ? <CheckCircle2 size={14} color="#fff" strokeWidth={2.5} />
                  : <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ccc' }} />
                }
              </div>
              <span style={{
                fontSize: 10, marginTop: 5, color: done ? '#ff3f6c' : '#999',
                fontWeight: active ? 600 : 400, textAlign: 'center', lineHeight: 1.3,
                whiteSpace: 'nowrap',
              }}>{meta.label}</span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: 2, minWidth: 16,
                background: i < idx ? '#ff3f6c' : '#e8e8e8',
                marginBottom: 20, transition: 'background 0.3s',
              }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const meta = ORDER_STATUSES[order.status] || ORDER_STATUSES.PLACED
  const StatusIcon = meta.icon

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
        <ChevronDown
          size={18} color="#888"
          style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', marginTop: 2 }}
        />
      </div>

      {/* Items Preview (always visible) */}
      <div style={{ padding: '0 18px 14px', display: 'flex', gap: 10, overflowX: 'auto' }}>
        {order.items.map(item => (
          <div key={item.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: '#fafafa', borderRadius: 8, padding: '8px 10px',
            border: '1px solid #f0f0f0', minWidth: 0, flex: '0 0 auto', maxWidth: 260,
          }}>
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
            {order.status === 'DELIVERED' && (
              <>
                <ActionBtn icon={<Star size={13} />} label="Rate & Review" primary />
                <ActionBtn icon={<RotateCcw size={13} />} label="Return / Exchange" />
              </>
            )}
            {(order.status === 'PLACED' || order.status === 'CONFIRMED') && (
              <ActionBtn icon={<XCircle size={13} />} label="Cancel Order" danger />
            )}
            {(order.status === 'SHIPPED' || order.status === 'OUT') && (
              <ActionBtn icon={<Truck size={13} />} label="Track Order" primary />
            )}
            <ActionBtn icon={<MessageCircle size={13} />} label="Need Help?" />
            <ActionBtn icon={<Download size={13} />} label="Invoice" />
          </div>
        </div>
      )}
    </div>
  )
}

function ActionBtn({ icon, label, primary, danger }) {
  const [hover, setHover] = useState(false)
  return (
    <button
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
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 64 }}>
          <button
            onClick={() => navigate(-1)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: '#555', padding: 4 }}
          >
            <ArrowLeft size={18} />
          </button>
          <img src={logo} alt="Aarria" style={{ height: 80, objectFit: 'contain' }} />
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#94969f' }}>My Orders</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>

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
          {FILTER_OPTIONS.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              style={{
                flexShrink: 0, padding: '7px 16px', borderRadius: 20,
                border: activeFilter === f.value ? '1.5px solid #ff3f6c' : '1.5px solid #e0e0e0',
                background: activeFilter === f.value ? '#fff0f3' : '#fff',
                color: activeFilter === f.value ? '#ff3f6c' : '#666',
                fontSize: 12, fontWeight: 600, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          ))}
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

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ORDERS = [
  {
    id: 'ARR-20240521-001',
    date: '21 May 2024',
    status: 'DELIVERED',
    expectedBy: '23 May 2024',
    total: 2498,
    mrp: 3499,
    discount: 1051,
    delivery: 0,
    address: { name: 'Priya S.', line1: '12, Rose Nagar, Koramangala', city: 'Bengaluru', pin: '560034' },
    items: [
      { id: 1, brand: 'Aarria', name: 'Floral Wrap Midi Dress', size: 'S', price: 1299, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&q=80' },
      { id: 2, brand: 'Aarria', name: 'Cotton Striped Kurti', size: 'M', price: 1199, image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=200&q=80' },
    ],
  },
  {
    id: 'ARR-20240528-002',
    date: '28 May 2024',
    status: 'SHIPPED',
    expectedBy: '2 Jun 2024',
    total: 1799,
    mrp: 2200,
    discount: 451,
    delivery: 50,
    address: { name: 'Priya S.', line1: '12, Rose Nagar, Koramangala', city: 'Bengaluru', pin: '560034' },
    items: [
      { id: 3, brand: 'Aarria', name: 'Pastel Palazzo Set', size: 'M', price: 1799, image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=200&q=80' },
    ],
  },
  {
    id: 'ARR-20240601-003',
    date: '1 Jun 2024',
    status: 'PLACED',
    expectedBy: '6 Jun 2024',
    total: 3198,
    mrp: 4000,
    discount: 852,
    delivery: 0,
    address: { name: 'Priya S.', line1: '12, Rose Nagar, Koramangala', city: 'Bengaluru', pin: '560034' },
    items: [
      { id: 4, brand: 'Aarria', name: 'Embroidered Anarkali Suit', size: 'L', price: 2199, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200&q=80' },
      { id: 5, brand: 'Aarria', name: 'Linen Crop Top', size: 'S', price: 999, image: 'https://images.unsplash.com/photo-1571513722275-4b41940f54b8?w=200&q=80' },
    ],
  },
  {
    id: 'ARR-20240415-004',
    date: '15 Apr 2024',
    status: 'CANCELLED',
    expectedBy: null,
    total: 1499,
    mrp: 1499,
    discount: 0,
    delivery: 0,
    address: { name: 'Priya S.', line1: '12, Rose Nagar, Koramangala', city: 'Bengaluru', pin: '560034' },
    items: [
      { id: 6, brand: 'Aarria', name: 'Denim Jacket – Navy', size: 'M', price: 1499, image: 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=200&q=80' },
    ],
  },
]
