import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import Navbar from './Navbar'
import Footer from './Footer'
import { useAuthStore } from './store/authStore'
import { useWishlistStore } from './store/wishlistStore'
import './constants/global.css'

const GOLD = '#C9A84C'
const NAVY = '#050C1C'
const PRODUCTS_API = 'https://products-api.chatoyantvortex.workers.dev/product?id='
const ORDERS = 'https://zq0dbjycx6.execute-api.ap-south-1.amazonaws.com/prod'

async function fetchProductCard(id) {
  const res = await fetch(`${PRODUCTS_API}${id}`)
  const raw = await res.json()
  const variant = raw.inventory?.variants?.[0]
  return {
    id,
    title: raw.title,
    brand: raw.brand?.name ?? '',
    price: raw.pricing?.selling_price ?? raw.pricing?.mrp ?? 0,
    mrp: raw.pricing?.mrp ?? 0,
    discount: raw.pricing?.discounts?.discount_percent ?? 0,
    image: variant?.main_image ? `https://cdn.vaarria.com/app/images/${variant.main_image}` : '',
    sizes: variant?.sizes?.map(s => s.size) ?? [],
  }
}

export default function WishlistPage() {
  const navigate = useNavigate()
  const { customer } = useAuthStore()
  const { productIds, load, toggle } = useWishlistStore()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!customer) { setLoading(false); return }
    load(customer.customer_id).then(() => setLoading(false))
  }, [customer])

  useEffect(() => {
    if (!customer || productIds.size === 0) { setProducts([]); return }
    Promise.all([...productIds].map(id => fetchProductCard(id).catch(() => null)))
      .then(results => setProducts(results.filter(Boolean)))
  }, [productIds, customer])

  const handleRemove = async (productId) => {
    if (!customer) return
    await toggle(customer.customer_id, productId)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f4f0', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px clamp(16px, 4%, 48px) 80px' }}>

        {/* Page title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
          <Heart size={24} color={GOLD} fill={GOLD} />
          <h1 style={{ fontSize: 26, fontWeight: 700, color: NAVY, fontFamily: "'Playfair Display', Georgia, serif", margin: 0, letterSpacing: 0.3 }}>
            My Wishlist
          </h1>
          {products.length > 0 && (
            <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 500 }}>
              ({products.length} {products.length === 1 ? 'item' : 'items'})
            </span>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ background: '#e8e0d0', borderRadius: 12, aspectRatio: '3/4', animation: 'wlPulse 1.4s ease-in-out infinite' }} />
            ))}
          </div>
        )}

        {/* Not logged in */}
        {!loading && !customer && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Heart size={56} color='#e8e0d0' style={{ marginBottom: 20 }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: NAVY, margin: '0 0 8px', fontFamily: "'Playfair Display', Georgia, serif" }}>Login to view your wishlist</h2>
            <p style={{ fontSize: 14, color: '#9ca3af', margin: '0 0 24px' }}>Save your favourite pieces and come back to them anytime.</p>
            <button
              onClick={() => navigate('/login')}
              style={{ padding: '12px 32px', background: NAVY, color: GOLD, border: `1px solid ${GOLD}`, borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '0.06em' }}
            >
              LOGIN / SIGNUP
            </button>
          </div>
        )}

        {/* Empty */}
        {!loading && customer && products.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <Heart size={56} color='#e8e0d0' style={{ marginBottom: 20 }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, color: NAVY, margin: '0 0 8px', fontFamily: "'Playfair Display', Georgia, serif" }}>Your wishlist is empty</h2>
            <p style={{ fontSize: 14, color: '#9ca3af', margin: '0 0 24px' }}>Tap the heart icon on any product to save it here.</p>
            <button
              onClick={() => navigate('/')}
              style={{ padding: '12px 32px', background: NAVY, color: GOLD, border: `1px solid ${GOLD}`, borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '0.06em' }}
            >
              EXPLORE PRODUCTS
            </button>
          </div>
        )}

        {/* Product grid */}
        {!loading && products.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {products.map(p => (
              <div
                key={p.id}
                style={{
                  background: '#fff', borderRadius: 12, overflow: 'hidden',
                  border: '1px solid #e8e0d0',
                  boxShadow: '0 2px 12px rgba(58,51,42,0.06)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  position: 'relative',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(201,168,76,0.18)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(58,51,42,0.06)' }}
                onClick={() => window.open(`/product/${p.id}`, '_blank')}
              >
                {/* Image */}
                <div style={{ aspectRatio: '3/4', background: '#F1E0C8', overflow: 'hidden' }}>
                  <img
                    src={p.image}
                    alt={p.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                    onError={e => { e.target.style.display = 'none' }}
                  />
                </div>

                {/* Remove button */}
                <button
                  onClick={e => { e.stopPropagation(); handleRemove(p.id) }}
                  title='Remove from wishlist'
                  style={{
                    position: 'absolute', top: 10, right: 10,
                    background: '#fff', border: 'none', borderRadius: '50%',
                    width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.12)', cursor: 'pointer',
                  }}
                >
                  <Heart size={16} color={GOLD} fill={GOLD} />
                </button>

                {/* Discount badge */}
                {p.discount > 0 && (
                  <div style={{
                    position: 'absolute', top: 10, left: 10,
                    background: NAVY, color: GOLD, fontSize: 10, fontWeight: 700,
                    padding: '3px 8px', borderRadius: 4, letterSpacing: '0.06em',
                  }}>
                    {p.discount}% OFF
                  </div>
                )}

                {/* Info */}
                <div style={{ padding: '12px 14px 16px' }}>
                  <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.brand}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a1a', margin: '0 0 8px', lineHeight: 1.35, fontFamily: "'Playfair Display', Georgia, serif", display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {p.title}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#0a0a0a', fontFamily: "'Playfair Display', Georgia, serif" }}>₹{p.price.toLocaleString('en-IN')}</span>
                    {p.mrp > p.price && <span style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'line-through' }}>₹{p.mrp.toLocaleString('en-IN')}</span>}
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); window.open(`/product/${p.id}`, '_blank') }}
                    style={{
                      width: '100%', padding: '10px', background: NAVY, color: GOLD,
                      border: `1px solid ${GOLD}44`, borderRadius: 7,
                      fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      letterSpacing: '0.06em', fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    <ShoppingBag size={14} />
                    VIEW PRODUCT
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes wlPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <Footer />
    </div>
  )
}
