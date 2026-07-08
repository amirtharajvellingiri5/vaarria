import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle, RefreshCw, Wallet, Factory, Eye, ShieldCheck } from 'lucide-react'
import Navbar from './Navbar'
import Footer from './Footer'
import { useAuthStore } from './store/authStore'
import { CATALOG_URL, ORDERS_URL } from './config'

const GOLD = '#C9A84C'
const NAVY = '#050C1C'
const LISTING = CATALOG_URL
const CDN = 'https://cdn.vaarria.com/app/images/'

const CATEGORIES = [
  { label: 'Kurtas & Suits', slug: 'kurtas-suits', bg: '#EDE8E0' },
  { label: 'Kurtis & Tops', slug: 'kurtis-tops', bg: '#E4DDD4' },
  { label: 'Sarees', slug: 'sarees', bg: '#D8D0C5' },
  { label: 'Dresses', slug: 'dresses', bg: '#CCC4B8' },
  { label: 'Dress Materials', slug: 'dress-materials', bg: '#C0B9AE' },
  { label: 'Dupattas & Shawls', slug: 'dupattas-shawls', bg: '#B4AEA4' },
]

const PROMISES = [
  { icon: <Eye size={18} color={GOLD} />, title: 'Handpicked, always', body: 'Every piece is vetted by our team. If it doesn\'t meet our fabric standard, it doesn\'t go live.' },
  { icon: <ShieldCheck size={18} color={GOLD} />, title: 'Wash guarantee', body: 'Colour holds. Fit holds. We stand behind every wash — or we replace it.' },
  { icon: <Factory size={18} color={GOLD} />, title: 'Factory direct', body: 'We source straight from the mill and pass every rupee of that saving to you.' },
  { icon: <RefreshCw size={18} color={GOLD} />, title: 'Free size swap', body: 'Wrong size? We swap it. No questions, no hassle.' },
  { icon: <Wallet size={18} color={GOLD} />, title: 'Pay on delivery', body: 'Try before you commit. Cash or card when it arrives at your door.' },
  { icon: <CheckCircle size={18} color={GOLD} />, title: 'No low-grade cuts', body: 'We reject anything that wouldn\'t pass as premium. Zero compromise on the fabric.' },
]

function useNewArrivals() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch(`${LISTING}/listings?page_size=8`)
      .then(r => r.json())
      .then(d => { setProducts(d.data ?? []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])
  return { products, loading }
}

function useRecentlyViewed(customerId) {
  const [products, setProducts] = useState([])
  useEffect(() => {
    if (!customerId) return
    const ORDERS = ORDERS_URL
    fetch(`${ORDERS}/history/${customerId}`, { credentials: 'include' })
      .then(r => r.json())
      .then(async ({ product_ids = [] }) => {
        const ids = product_ids.slice(0, 10)
        const results = await Promise.all(
          ids.map(id =>
            fetch(`https://products-api.chatoyantvortex.workers.dev/product?id=${id}`)
              .then(r => r.json())
              .then(raw => ({
                id,
                title: raw.title,
                price: raw.pricing?.selling_price ?? raw.pricing?.mrp,
                image: raw.inventory?.variants?.[0]?.main_image
                  ? `${CDN}${raw.inventory.variants[0].main_image}`
                  : '',
              }))
              .catch(() => null)
          )
        )
        setProducts(results.filter(Boolean))
      })
      .catch(() => {})
  }, [customerId])
  return products
}

function usePriceImages() {
  const [images, setImages] = useState([])
  useEffect(() => {
    fetch(`${LISTING}/listings?page_size=4`)
      .then(r => r.json())
      .then(d => setImages((d.data ?? []).filter(p => p.main_image).slice(0, 4)))
      .catch(() => {})
  }, [])
  return images
}

export default function Home() {
  const navigate = useNavigate()
  const { customer } = useAuthStore()
  const { products, loading } = useNewArrivals()
  const priceImages = usePriceImages()
  const recentlyViewed = useRecentlyViewed(customer?.customer_id)

  return (
    <div style={{ minHeight: '100vh', background: '#FAF8F4', fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />

      {/* ── Hero ── */}
      <section style={{ background: NAVY, backgroundImage: 'url(/hero-banner.png)', backgroundSize: 'cover', backgroundPosition: 'center top', position: 'relative', padding: 'clamp(40px,6vw,80px) clamp(20px,5vw,80px)' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(5,12,28,.92) 0%, rgba(5,12,28,.75) 50%, rgba(5,12,28,.2) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1.2fr) minmax(0,1fr)', gap: 'clamp(24px,4vw,64px)', alignItems: 'center' }}>

          <div>
            <p style={{ fontSize: 11, letterSpacing: '.2em', textTransform: 'uppercase', color: GOLD, marginBottom: 14 }}>
              A different kind of brand
            </p>
            <h1 style={{ fontSize: 'clamp(26px,4vw,44px)', fontWeight: 700, color: '#fff', lineHeight: 1.2, fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 16 }}>
              We removed <span style={{ color: GOLD }}>3 steps</span> from your wardrobe's supply chain.
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,.55)', lineHeight: 1.75, marginBottom: 28, maxWidth: 440 }}>
              Most brands mark up 4× before the fabric reaches you — mill, distributor, brand, retailer. We go direct. Same handpicked fabric, same premium finish. Our price is 50% less. Always.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/products')}
                style={{ background: GOLD, color: NAVY, border: 'none', padding: '12px 24px', fontSize: 13, fontWeight: 700, borderRadius: 4, cursor: 'pointer', letterSpacing: '.08em', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                SHOP NOW <ArrowRight size={14} />
              </button>
              <button
                onClick={() => document.getElementById('how-we-price').scrollIntoView({ behavior: 'smooth' })}
                style={{ background: 'transparent', color: GOLD, border: `1px solid ${GOLD}44`, padding: '12px 24px', fontSize: 13, borderRadius: 4, cursor: 'pointer' }}
              >
                See how we price →
              </button>
            </div>
          </div>

          {/* Supply chain diagram */}
          <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 12, padding: 'clamp(16px,3vw,28px)' }}>
            <p style={{ fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,.35)', marginBottom: 20, textAlign: 'center' }}>
              How your fabric gets to you
            </p>

            {/* Others */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,.3)', marginBottom: 8, letterSpacing: '.06em' }}>OTHERS</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {['Mill', 'Distributor', 'Brand', 'Retailer', 'You'].map((s, i) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i === 4 ? 'none' : 1 }}>
                    <div style={{ flex: 1, background: i < 4 ? 'rgba(255,255,255,.12)' : `${GOLD}22`, border: i < 4 ? '1px solid rgba(255,255,255,.1)' : `1px solid ${GOLD}44`, borderRadius: 4, padding: '6px 4px', textAlign: 'center' }}>
                      <p style={{ fontSize: 10, color: i < 4 ? 'rgba(255,255,255,.4)' : GOLD, fontWeight: i === 4 ? 700 : 400 }}>{s}</p>
                    </div>
                    {i < 4 && <ArrowRight size={10} color='rgba(255,255,255,.2)' style={{ flexShrink: 0 }} />}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,.25)', marginTop: 6, textAlign: 'right' }}>
                ends at <span style={{ textDecoration: 'line-through', color: 'rgba(255,80,80,.5)' }}>up to 4× markup</span>
              </p>
            </div>

            <div style={{ height: 1, background: 'rgba(255,255,255,.06)', margin: '0 0 16px' }} />

            {/* Vaarria */}
            <div>
              <p style={{ fontSize: 10, color: GOLD, marginBottom: 8, letterSpacing: '.06em' }}>VAARRIA</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {['Mill', 'Vaarria', 'You'].map((s, i) => (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i === 2 ? 'none' : 1 }}>
                    <div style={{ flex: 1, background: i === 2 ? GOLD : `${GOLD}18`, border: `1px solid ${GOLD}${i === 2 ? 'ff' : '44'}`, borderRadius: 4, padding: '6px 4px', textAlign: 'center' }}>
                      <p style={{ fontSize: 10, color: i === 2 ? NAVY : GOLD, fontWeight: 700 }}>{s}</p>
                    </div>
                    {i < 2 && <ArrowRight size={10} color={`${GOLD}88`} style={{ flexShrink: 0 }} />}
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 10, color: GOLD, marginTop: 6, textAlign: 'right', fontWeight: 600 }}>
                you pay <span style={{ fontSize: 14 }}>~50% less</span> — same fabric
              </p>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ position: 'relative', maxWidth: 1200, margin: '32px auto 0', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: 'rgba(255,255,255,.06)', borderRadius: 8, overflow: 'hidden' }}>
          {[
            { value: '50%', label: 'less than retail, every time' },
            { value: 'Zero', label: 'middlemen in the chain' },
            { value: '∞', label: 'wash guarantee on every piece' },
          ].map((s, i) => (
            <div key={i} style={{ background: NAVY, padding: '16px 20px', textAlign: 'center', borderLeft: i > 0 ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: GOLD, fontFamily: "'Playfair Display', Georgia, serif" }}>{s.value}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 3 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Price breakdown ── */}
      <section id='how-we-price' style={{ background: '#fff', padding: 'clamp(32px,5vw,60px) clamp(20px,5vw,80px)', borderBottom: '1px solid #e8e0d0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)', gap: 'clamp(24px,4vw,56px)', alignItems: 'center' }}>

          {/* Left — product image collage */}
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8, aspectRatio: '1/1' }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{
                  background: ['#EDE8E0','#E0D8CC','#D4CCBE','#C8C0B2'][i],
                  borderRadius: 10,
                  overflow: 'hidden',
                  gridColumn: i === 0 ? 'span 1' : undefined,
                }}>
                  {priceImages[i]?.main_image && (
                    <img
                      src={`${CDN}${priceImages[i].main_image}`}
                      alt=''
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  )}
                </div>
              ))}
            </div>
            {/* Floating badge */}
            <div style={{
              position: 'absolute', bottom: -14, right: -14,
              background: NAVY, borderRadius: 10, padding: '12px 16px',
              border: `1px solid ${GOLD}44`, textAlign: 'center', minWidth: 100,
            }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: GOLD, fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1 }}>50%</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,.5)', marginTop: 3 }}>less than retail</p>
            </div>
          </div>

          {/* Right — price cards */}
          <div>
            <p style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 8 }}>The price difference, explained</p>
            <h2 style={{ fontSize: 'clamp(20px,2.5vw,28px)', fontWeight: 700, color: NAVY, fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 24 }}>
              Same fabric. Less than half the price. Here's why.
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ border: '1px solid #f3f0eb', borderRadius: 10, padding: '16px 18px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginBottom: 4 }}>What you pay elsewhere</p>
                  <p style={{ fontSize: 24, fontWeight: 700, color: '#d1d5db', textDecoration: 'line-through', textDecorationColor: '#f87171', fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 10 }}>Up to 4× markup</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {['Mill → Distributor → Brand → Retailer → You', '4 hands. 4 margins. You pay for all of them.'].map((l, i) => (
                      <p key={i} style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5 }}>{l}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ border: `2px solid ${GOLD}66`, borderRadius: 10, padding: '16px 18px', background: '#fffdf7' }}>
                <p style={{ fontSize: 11, color: GOLD, marginBottom: 4 }}>What you pay at Vaarria</p>
                <p style={{ fontSize: 28, fontWeight: 700, color: NAVY, fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 10 }}>~50% less</p>
                <p style={{ fontSize: 12, color: '#6b7280', marginBottom: 10 }}>Mill → Vaarria → You</p>
                <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>2 steps. That's it. Every rupee we save goes back to you.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section style={{ padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,80px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 'clamp(18px,2.5vw,24px)', fontWeight: 700, color: NAVY, fontFamily: "'Playfair Display', Georgia, serif" }}>Shop by category</h2>
            <button onClick={() => navigate('/products')} style={{ background: 'none', border: 'none', color: GOLD, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>View all →</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 12 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.slug}
                onClick={() => navigate(`/${cat.slug}`)}
                style={{ background: cat.bg, border: 'none', borderRadius: 10, padding: '20px 12px', cursor: 'pointer', textAlign: 'center', transition: 'transform .18s', fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: NAVY, lineHeight: 1.3 }}>{cat.label}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── New Arrivals ── */}
      <section style={{ background: '#fff', padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,80px)', borderTop: '1px solid #e8e0d0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <p style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>Handpicked</p>
              <h2 style={{ fontSize: 'clamp(18px,2.5vw,24px)', fontWeight: 700, color: NAVY, fontFamily: "'Playfair Display', Georgia, serif" }}>New arrivals</h2>
            </div>
            <button onClick={() => navigate('/products')} style={{ background: 'none', border: 'none', color: GOLD, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}>View all →</button>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ background: '#e8e0d0', aspectRatio: '3/4', animation: 'homePulse 1.4s ease-in-out infinite' }} />
                  <div style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ background: '#e8e0d0', height: 12, borderRadius: 4, width: '70%', animation: 'homePulse 1.4s ease-in-out infinite' }} />
                    <div style={{ background: '#e8e0d0', height: 12, borderRadius: 4, width: '40%', animation: 'homePulse 1.4s ease-in-out infinite' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16 }}>
              {products.map(p => (
                <div
                  key={p.id}
                  style={{ cursor: 'pointer', transition: 'transform .18s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  <div style={{ background: '#F1E0C8', borderRadius: 10, overflow: 'hidden', aspectRatio: '3/4', marginBottom: 10, border: '1px solid #e8e0d0' }}>
                    {p.main_image && (
                      <img
                        src={`${CDN}${p.main_image}`}
                        alt={p.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    )}
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 4 }}>{p.title}</p>
                  <p style={{ fontSize: 14, fontWeight: 700, color: GOLD }}>₹{p.price?.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Our Promises ── */}
      <section style={{ padding: 'clamp(32px,5vw,60px) clamp(20px,5vw,80px)', borderTop: '1px solid #e8e0d0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <p style={{ fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 8, textAlign: 'center' }}>Why Vaarria</p>
          <h2 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 700, color: NAVY, fontFamily: "'Playfair Display', Georgia, serif", marginBottom: 32, textAlign: 'center' }}>
            We started this company to make luxury affordable.<br />
            <span style={{ color: GOLD, fontStyle: 'italic' }}>Here's how we keep that promise.</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 20 }}>
            {PROMISES.map(p => (
              <div key={p.title} style={{ background: '#fff', border: '1px solid #e8e0d0', borderRadius: 10, padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  {p.icon}
                  <p style={{ fontSize: 14, fontWeight: 600, color: NAVY }}>{p.title}</p>
                </div>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recently Viewed ── */}
      {recentlyViewed.length > 0 && (
        <section style={{ background: '#fff', padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,80px)', borderTop: '1px solid #e8e0d0' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: 4 }}>Your picks</p>
                <h2 style={{ fontSize: 'clamp(18px,2.5vw,24px)', fontWeight: 700, color: NAVY, fontFamily: "'Playfair Display', Georgia, serif" }}>Recently viewed</h2>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'thin' }}>
              {recentlyViewed.map(p => (
                <div
                  key={p.id}
                  style={{ cursor: 'pointer', transition: 'transform .18s', flexShrink: 0, width: 160 }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                  onClick={() => navigate(`/product/${p.id}`)}
                >
                  <div style={{ background: '#F1E0C8', borderRadius: 10, overflow: 'hidden', aspectRatio: '3/4', marginBottom: 10, border: '1px solid #e8e0d0' }}>
                    {p.image && (
                      <img src={p.image} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} onError={e => { e.target.style.display = 'none' }} />
                    )}
                  </div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#1f2937', lineHeight: 1.35, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 4 }}>{p.title}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: GOLD }}>₹{p.price?.toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Founder quote ── */}
      <section style={{ background: NAVY, padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,80px)', textAlign: 'center' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <p style={{ fontSize: 'clamp(16px,2.5vw,22px)', fontWeight: 700, color: '#fff', fontFamily: "'Playfair Display', Georgia, serif", lineHeight: 1.6, marginBottom: 20 }}>
            "We built Vaarria because we were tired of paying ₹4,999 for a fabric that costs ₹2000 to make. Luxury shouldn't be a privilege — it should be a standard."
          </p>
          <p style={{ fontSize: 12, color: GOLD, letterSpacing: '.1em' }}>— The Vaarria Founders</p>
          <button
            onClick={() => navigate('/products')}
            style={{ marginTop: 28, background: GOLD, color: NAVY, border: 'none', padding: '14px 32px', fontSize: 13, fontWeight: 700, borderRadius: 4, cursor: 'pointer', letterSpacing: '.08em' }}
          >
            SHOP THE COLLECTION
          </button>
        </div>
      </section>

      <style>{`
        @keyframes homePulse { 0%,100%{opacity:1} 50%{opacity:.5} }
        @media(max-width:640px){
          section > div[style*="grid-template-columns: minmax(0,1.2fr)"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <Footer />
    </div>
  )
}
