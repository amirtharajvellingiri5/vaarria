import { useState, useEffect, useCallback, useRef } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  Star,
  ShoppingBag,
  Truck,
  RefreshCw,
  Shield,
  X,
  ZoomIn,
  ChevronDown,
  ChevronUp,
  Play,
  Gift,
  CreditCard,
  ArrowLeftRight,
  RotateCcw,
  Wallet,
} from 'lucide-react'
import Navbar from './Navbar'
import Footer from './Footer'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { useBagStore } from './store/bagStore'
import { useWishlistStore } from './store/wishlistStore'
import WishlistLoginModal from './modals/WishlistLoginModal'
import { ORDERS_URL, CATALOG_URL } from './config'
import { authFetch } from './utils/authFetch'

// ─── Mock API Response ────────────────────────────────────────────────────────
const MOCK_PRODUCT_API_RESPONSE = {
  id: 3,
  title: 'Kurta Set Classic',
  brand: { name: 'Sangria', catalogue_id: 'BRAND-SANGRIA-1' },
  category: { category_id: 2, category_name: 'Kurtas' },
  description: {
    Material: 'Viscose Rayon',
    'Sleeve Length': 'Three-Quarter Sleeves',
    Neck: 'V-Neck',
    'Design Styling': 'Straight',
    Occasion: 'Ethnic, Casual',
    'Fabric Care': 'Gentle Machine Wash / Hand Wash',
    Pattern: 'Embroidered',
    'Length Type': 'Regular',
    'Fit Type': 'Straight',
    Color: 'Navy Blue',
    'Country of Origin': 'India',
    product_blurb:
      'Crafted from premium viscose rayon, this Sangria kurta features intricate ethnic motif embroidery with detailed thread work at the yoke and hem.',
    highlights: [
      'Premium Viscose Rayon fabric',
      'Intricate ethnic motif embroidery',
      'Thread work detailing at yoke & hem',
      'Straight fit silhouette',
      'Three-quarter sleeves',
      'V-neck with button detail',
    ],
  },
  pricing: { mrp: 2999.0, sale_price: 1199.0, buy_price: 800.0, gst: 5.0 },
  inventory: {
    variants: [
      {
        color: 'Navy Blue',
        color_hex: '#1a237e',
        sizes: [
          { size: 'XS', quantity: 0 },
          { size: 'S', quantity: 10 },
          { size: 'M', quantity: 8 },
          { size: 'L', quantity: 6 },
          { size: 'XL', quantity: 4 },
          { size: 'XXL', quantity: 0 },
        ],
        main_image: 'IMG-20220416-WA0000.jpg',
        other_images: [
          'IMG-20220416-WA0001.jpg',
          'IMG-20220416-WA0002.jpg',
          'IMG-20220416-WA0005.jpg',
          'IMG-20220416-WA0006.jpg',
        ],
      },
    ],
  },
  style_code: 'SNG-KRT-24386',
  delivery: { days: '2-3 Business Days', cod: true },
  ratings: { average_rating: 4.3, review_count: 312 },
}

const MOCK_RATINGS_API_RESPONSE = {
  product_id: 3,
  overall: 4.3,
  rating_count: 2847,
  review_count: 312,
  breakdown: [
    { label: '5 ★', pct: 55 },
    { label: '4 ★', pct: 22 },
    { label: '3 ★', pct: 12 },
    { label: '2 ★', pct: 6 },
    { label: '1 ★', pct: 5 },
  ],
  reviews: [
    {
      id: 1,
      user: 'Priya M.',
      rating: 5,
      date: 'Nov 2024',
      title: 'Absolutely stunning!',
      body: 'The embroidery work is exquisite and the fabric is super soft. Fits perfectly as a straight kurta. Highly recommend!',
      helpful: 42,
    },
    {
      id: 2,
      user: 'Ananya S.',
      rating: 4,
      date: 'Oct 2024',
      title: 'Good quality, great colour',
      body: 'The navy blue is rich and deep, exactly as shown. Stitching quality is excellent. Slightly long but wearable.',
      helpful: 28,
    },
    {
      id: 3,
      user: 'Deepa R.',
      rating: 5,
      date: 'Oct 2024',
      title: 'Worth every rupee!',
      body: "Got compliments from everyone at the function. The thread work looks premium and doesn't feel cheap at all.",
      helpful: 19,
    },
  ],
}

// ─── Media items: images + YouTube videos ─────────────────────────────────────
// Each item is { type: 'image'|'video', src, thumb, youtubeId? }
const PRODUCT_YOUTUBE_VIDEOS = [
  {
    youtubeId: 'KR0g-1hnQPA', // replace with real product video IDs
    title: 'Styling the Kurta Set',
  },
  {
    youtubeId: 'tgbNymZ7vqY',
    title: 'Fabric & Embroidery Close-up',
  },
]

// ─── API Functions ────────────────────────────────────────────────────────────
async function fetchProduct(productId) {
  // Always revalidate with the worker (which serves an ETag) instead of reusing
  // the browser disk copy. When nothing changed this is a cheap 304; the moment
  // KV is refreshed (e.g. after an order) the worker returns the latest JSON, so
  // the PDP never shows stale sold-out / quantity data.
  const res = await fetch(
    `https://products-api.chatoyantvortex.workers.dev/product?id=${productId}`,
    { cache: 'no-cache' },
  )
  if (!res.ok) {
    throw new Error(res.status === 404 ? 'Product not found' : 'Failed to load product')
  }
  const raw = await res.json()

  const discountMeta = raw.pricing?.discounts
  const variant = raw.inventory.variants[0]

  const allImageFilenames = [variant.main_image, ...variant.other_images]
  const images = allImageFilenames.map(
    (img) => `https://cdn.vaarria.com/app/images/${img}`,
  )

  // Build combined media list: images first, then videos
  const mediaItems = [
    ...images.map((src, i) => ({
      type: 'image',
      src,
      thumb: src,
      placeholder: `https://placehold.co/1080x1440/ec4899/ffffff?text=Image+${i + 1}`,
    })),
    ...PRODUCT_YOUTUBE_VIDEOS.map((v) => ({
      type: 'video',
      youtubeId: v.youtubeId,
      title: v.title,
      src: `https://www.youtube.com/embed/${v.youtubeId}`,
      thumb: `https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`,
      placeholder: `https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`,
    })),
  ]

  const sizes = variant.sizes.map((s) => s.size)
  const availableSizes = variant.sizes
    .filter((s) => s.quantity > 0)
    .map((s) => s.size)

  const { product_blurb, highlights: highlightsRaw, ...desc } = raw.description ?? {}
  const details = { 'Style Code': raw.style_code ?? '—', ...desc }
  Object.keys(details).forEach((k) => {
    if (details[k] === '' || details[k] == null) delete details[k]
  })
  const discount = Math.round(
    ((raw.pricing.mrp - raw.pricing.sale_price) / raw.pricing.mrp) * 100,
  )

  let bankOffer = {
    icon: <Gift size={16} />,
    title: 'Special Price',
    desc: 'No bank offers available',
  }
  if (discountMeta) {
    const { discount_type, value } = discountMeta
    if (discount_type === 'FLAT') {
      bankOffer = {
        icon: <Gift size={16} />,
        title: 'Special Price',
        desc: (
          <>
            Flat{' '}
            <span style={{ color: '#10b981', fontWeight: 700 }}>
              ₹{value} OFF
            </span>{' '}
            - Use code TRENDY{value}
          </>
        ),
      }
    }
    if (discount_type === 'PERCENTAGE') {
      bankOffer = {
        icon: <Gift size={16} />,
        title: 'Special Price',
        desc: (
          <>
            <span style={{ color: '#10b981', fontWeight: 700 }}>
              {value}% OFF{' '}
            </span>{' '}
            Use Code TRENDY{value}
          </>
        ),
      }
    }
  }

  // Coupon preview — effective price after the advertised TRENDY code
  let coupon = null
  if (discountMeta) {
    const { discount_type, value } = discountMeta
    const off =
      discount_type === 'FLAT'
        ? value
        : discount_type === 'PERCENTAGE'
        ? Math.round((raw.pricing.sale_price * value) / 100)
        : 0
    if (off > 0 && off < raw.pricing.sale_price) {
      coupon = {
        code: `TRENDY${value}`,
        effectivePrice: raw.pricing.sale_price - off,
      }
    }
  }

  return {
    id: raw.product_id,
    coupon,
    brand: raw.brand.name,
    brandId: raw.brand.catalogue_id,
    category: raw.category.category_name,
    categoryId: raw.category.category_id,
    name: raw.title,
    mediaItems,
    price: raw.pricing.sale_price,
    mrp: raw.pricing.mrp,
    discount,
    rating: raw.ratings.average_rating,
    ratingCount: raw.ratings.rating_count ?? raw.ratings.review_count ?? 0,
    reviewCount: raw.ratings.review_count ?? 0,
    sizes,
    availableSizes,
    sizeQuantities: Object.fromEntries(variant.sizes.map((s) => [s.size, s.quantity])),
    colors: raw.inventory.variants.map((v) => ({
      name: v.color,
      hex: v.color_hex ?? '#cccccc',
      active: v.color === variant.color,
    })),
    description: product_blurb ?? raw.title,
    highlights: highlightsRaw
      ? highlightsRaw.split('\n').map((s) => s.trim()).filter(Boolean)
      : Object.entries(desc).map(([k, v]) => `${k}: ${v}`),
    details,
    deliveryInfo: raw.delivery ?? { days: '3-5 Business Days', cod: true },
    offers: [
      bankOffer,
      {
        icon: <CreditCard size={16} />,
        title: 'Max spends offer',
        desc: 'Get 15% off on spends more than Rs.10000 (price inclusive of discount)',
      },
      {
        icon: <RefreshCw size={16} />,
        title: 'Easy Returns',
        desc: '7-day return policy. No questions asked. Your money is safe.',
      },
    ],
  }
}

async function fetchRatings(productId) {
  const response = await fetch(
    `${ORDERS_URL}/products/${productId}/ratings`,
  )

  if (!response.ok) {
    throw new Error('Failed to load ratings')
  }

  const reviews = await response.json()

  const totalRatings = reviews.length

  const averageRating =
    totalRatings === 0
      ? 0
      : Number(
          (
            reviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings
          ).toFixed(1),
        )

  const breakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length

    return {
      label: `${star} ★`,
      pct: totalRatings === 0 ? 0 : Math.round((count / totalRatings) * 100),
    }
  })

  return {
    product_id: productId,
    overall: averageRating,
    rating_count: totalRatings,
    review_count: totalRatings,
    breakdown,
    reviews: reviews.map((r, index) => ({
      id: index + 1,
      user: r.name || 'Verified Customer',
      rating: r.rating,
      body: r.review,
      images: (r.images || []).map((img) => `https://cdn.vaarria.com${img}`),
    })),
  }
}
// ─── Full-screen Media Slider ─────────────────────────────────────────────────
function MediaSlider({ mediaItems, initialIndex, onClose }) {
  const [current, setCurrent] = useState(initialIndex)
  const [imgErrors, setImgErrors] = useState({})

  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + mediaItems.length) % mediaItems.length),
    [mediaItems.length],
  )
  const next = useCallback(
    () => setCurrent((c) => (c + 1) % mediaItems.length),
    [mediaItems.length],
  )

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [prev, next, onClose])

  const item = mediaItems[current]

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(0,0,0,0.97)',
      }}
    >
      {/* Close button — fixed center-top, always visible */}
      <button
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 999,
          width: 44,
          height: 44,
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
        }}
      >
        <X size={22} />
      </button>

      {/* Counter — top left */}
      <div
        style={{
          position: 'fixed',
          top: 22,
          left: 24,
          zIndex: 999,
          color: '#aaa',
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        {current + 1} / {mediaItems.length}
        {item.type === 'video' && (
          <span style={{ color: '#ec4899', fontWeight: 600, fontSize: 11 }}>
            ▶ VIDEO
          </span>
        )}
      </div>

      <div
        style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}
      >
        {/* Left thumbnail strip */}
        <div
          style={{
            width: 88,
            flexShrink: 0,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            padding: '0 12px 12px',
            scrollbarWidth: 'none',
          }}
        >
          {mediaItems.map((m, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              style={{
                width: 64,
                height: 86,
                flexShrink: 0,
                border:
                  i === current
                    ? '2px solid #ec4899'
                    : '2px solid rgba(255,255,255,0.15)',
                borderRadius: 4,
                overflow: 'hidden',
                cursor: 'pointer',
                background: '#111',
                padding: 0,
                opacity: i === current ? 1 : 0.5,
                transition: 'all 0.15s',
                position: 'relative',
              }}
            >
              <img
                src={imgErrors[i] ? m.placeholder : m.thumb}
                alt=''
                onError={() => setImgErrors((e) => ({ ...e, [i]: true }))}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'top',
                  display: 'block',
                }}
              />
              {m.type === 'video' && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.45)',
                  }}
                >
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: 'rgba(236,72,153,0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Play
                      size={10}
                      fill='#fff'
                      color='#fff'
                      style={{ marginLeft: 1 }}
                    />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Main viewer */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 0,
          }}
        >
          <button
            onClick={prev}
            style={{
              position: 'absolute',
              left: 12,
              zIndex: 10,
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <ChevronLeft size={22} />
          </button>

          {item.type === 'image' ? (
            <img
              key={current}
              src={imgErrors[current] ? item.placeholder : item.src}
              alt={`view ${current + 1}`}
              onError={() => setImgErrors((e) => ({ ...e, [current]: true }))}
              style={{
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'contain',
                display: 'block',
                animation: 'sliderFadeIn 0.2s ease',
              }}
            />
          ) : (
            <div
              key={current}
              style={{
                width: '100%',
                maxWidth: 900,
                aspectRatio: '16/9',
                padding: '0 60px',
                animation: 'sliderFadeIn 0.2s ease',
              }}
            >
              <iframe
                src={`https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={item.title}
                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                allowFullScreen
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: 8,
                  display: 'block',
                }}
              />
            </div>
          )}

          <button
            onClick={next}
            style={{
              position: 'absolute',
              right: 12,
              zIndex: 10,
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(4px)',
            }}
          >
            <ChevronRight size={22} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes sliderFadeIn { from { opacity:0; transform:scale(0.98); } to { opacity:1; transform:scale(1); } }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}

// ─── Product Image Gallery with Thumbnail Strip ───────────────────────────────
function ProductGallery({ mediaItems, onOpenSlider }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [imgErrors, setImgErrors] = useState({})

  const active = mediaItems[activeIndex]

  return (
    <div style={{ display: 'flex', gap: 0, width: '100%' }}>
      {/* Left thumbnail strip */}
      <div
        style={{
          width: 92,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          paddingRight: 8,
          maxHeight: '80vh',
          overflowY: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {mediaItems.map((item, i) => (
          <button
            key={i}
            onMouseEnter={() => setActiveIndex(i)}
            onClick={() => onOpenSlider(i)}
            style={{
              width: 78,
              height: 102,
              flexShrink: 0,
              border:
                i === activeIndex ? '2px solid #C9A84C' : '2px solid #e5e7eb',
              borderRadius: 4,
              overflow: 'hidden',
              cursor: 'pointer',
              background: '#f9f9f9',
              padding: 0,
              position: 'relative',
              transition: 'border-color 0.15s, opacity 0.15s',
              opacity: i === activeIndex ? 1 : 0.75,
            }}
          >
            <img
              src={imgErrors[`thumb-${i}`] ? item.placeholder : item.thumb}
              alt={`thumbnail ${i + 1}`}
              onError={() =>
                setImgErrors((e) => ({ ...e, [`thumb-${i}`]: true }))
              }
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top',
                display: 'block',
              }}
            />
            {item.type === 'video' && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0,0,0,0.35)',
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'rgba(236,72,153,0.92)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                >
                  <Play
                    size={11}
                    fill='#fff'
                    color='#fff'
                    style={{ marginLeft: 1 }}
                  />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Main display area */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          position: 'relative',
          cursor: 'zoom-in',
        }}
        onClick={() => onOpenSlider(activeIndex)}
      >
        {active.type === 'image' ? (
          <div
            style={{
              width: '100%',
              aspectRatio: '3/4',
              overflow: 'hidden',
              background: '#f9f9f9',
              position: 'relative',
            }}
          >
            <img
              key={activeIndex}
              src={
                imgErrors[`main-${activeIndex}`]
                  ? active.placeholder
                  : active.src
              }
              alt='product view'
              onError={() =>
                setImgErrors((e) => ({ ...e, [`main-${activeIndex}`]: true }))
              }
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'top',
                display: 'block',
                transition: 'opacity 0.2s ease',
                animation: 'galleryFadeIn 0.18s ease',
              }}
            />
            {/* Zoom badge */}
            <div
              style={{
                position: 'absolute',
                bottom: 14,
                right: 14,
                background: 'rgba(255,255,255,0.92)',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
              }}
            >
              <ZoomIn size={16} color='#ec4899' />
            </div>
            {/* Counter */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                background: 'rgba(255,255,255,0.88)',
                backdropFilter: 'blur(4px)',
                borderRadius: 20,
                padding: '3px 10px',
                fontSize: 11,
                fontWeight: 600,
                color: '#374151',
              }}
            >
              {activeIndex + 1} / {mediaItems.length}
            </div>
          </div>
        ) : (
          /* Video preview — shows thumbnail with big play button; click opens full slider */
          <div
            style={{
              width: '100%',
              aspectRatio: '3/4',
              background: '#0a0a0a',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {/* Blurred thumbnail bg */}
            <img
              src={active.thumb}
              alt=''
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: 'blur(12px) brightness(0.45)',
                transform: 'scale(1.08)',
              }}
            />
            {/* YouTube thumbnail */}
            <img
              src={active.thumb}
              alt={active.title}
              style={{
                position: 'relative',
                zIndex: 1,
                maxWidth: '90%',
                maxHeight: '65%',
                objectFit: 'contain',
                borderRadius: 6,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}
            />
            {/* Play button */}
            <div
              style={{
                position: 'absolute',
                zIndex: 2,
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'linear-gradient(135deg,#ec4899,#f43f5e)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(236,72,153,0.5)',
              }}
            >
              <Play
                size={26}
                fill='#fff'
                color='#fff'
                style={{ marginLeft: 3 }}
              />
            </div>
            {/* Video label */}
            <div
              style={{
                position: 'absolute',
                bottom: 20,
                left: 0,
                right: 0,
                zIndex: 2,
                textAlign: 'center',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                padding: '0 20px',
                textShadow: '0 1px 4px rgba(0,0,0,0.6)',
              }}
            >
              {active.title}
            </div>
            {/* Counter */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                right: 14,
                zIndex: 2,
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(4px)',
                borderRadius: 20,
                padding: '3px 10px',
                fontSize: 11,
                fontWeight: 600,
                color: '#fff',
              }}
            >
              {activeIndex + 1} / {mediaItems.length}
            </div>
          </div>
        )}
        <style>{`@keyframes galleryFadeIn { from { opacity:0.6; } to { opacity:1; } }`}</style>
      </div>
    </div>
  )
}

// ─── Rating Bar ───────────────────────────────────────────────────────────────
function RatingBar({ label, pct }) {
  return (
    <div className='flex items-center gap-3 mb-1.5'>
      <span style={{ minWidth: 32, fontSize: 12, color: '#888' }}>{label}</span>
      <div
        className='flex-1 rounded-full overflow-hidden'
        style={{ height: 5, background: '#f0f0f0' }}
      >
        <div
          className='h-full rounded-full'
          style={{
            width: `${pct}%`,
            background: pct > 50 ? '#10b981' : pct > 25 ? '#f59e0b' : '#f43f5e',
            transition: 'width 0.6s ease',
          }}
        />
      </div>
      <span
        style={{
          minWidth: 30,
          fontSize: 12,
          color: '#888',
          textAlign: 'right',
        }}
      >
        {pct}%
      </span>
    </div>
  )
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
function SkeletonLoader() {
  return (
    <>
      <style>{`
        @keyframes skeletonShimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .skeleton { background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: skeletonShimmer 1.2s infinite; border-radius: 4px; }
        .pdp-page { min-height: 100vh; background: #fff; font-family: 'DM Sans', sans-serif; color: #1f2937; }
        .pdp-breadcrumb { padding: 11px 2%; font-size: 12px; color: #9ca3af; display: flex; gap: 6px; align-items: center; border-bottom: 1px solid #fff; background: #fff; }
        .pdp-page-layout { display: flex; align-items: flex-start; padding-left: 2%; }
        .pdp-outer { flex: 1; display: flex; align-items: flex-start; min-width: 0; padding-right: 16px; }
        .pdp-images-col { width: 52%; min-width: 0; }
        .pdp-info-col {
  width: 48%;
  min-width: 0;
  padding: 0px 48px 48px 40px;
  border-left: 1px solid #f3f4f6;
  background: #fff;
}
        .pdp-hr { height: 1px; background: #f3f4f6; margin: 20px 0; }
      `}</style>
      <div className='pdp-page'>
        <Navbar />
        <div className='pdp-breadcrumb'>
          {[40, 50, 70, 45, 60].map((w, i) => (
            <span
              key={i}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <div className='skeleton' style={{ width: w, height: 12 }} />
              {i < 4 && <span style={{ color: '#d1d5db' }}>›</span>}
            </span>
          ))}
        </div>
        <div className='pdp-outer'>
          <div className='pdp-images-col'>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className='skeleton'
                    style={{ width: 64, height: 84 }}
                  />
                ))}
              </div>
              <div
                className='skeleton'
                style={{ flex: 1, aspectRatio: '3/4' }}
              />
            </div>
          </div>
          <div
            className='pdp-info-col'
            style={{ padding: '20px 48px 48px 40px' }}
          >
            <div
              className='skeleton'
              style={{ width: 160, height: 26, marginBottom: 6 }}
            />
            <div className='skeleton' style={{ width: '85%', height: 16 }} />
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Featured Products Banner ─────────────────────────────────────────────────
function FeaturedBanner({ productId }) {
  const [products, setProducts] = useState([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    fetch(`${CATALOG_URL}/listings?page_size=30`)
      .then(r => r.json())
      .then(data => {
        const list = data.listings ?? data.products ?? data.data ?? data ?? []
        const items = (Array.isArray(list) ? list : [])
          .filter(p => String(p.id ?? p.product_id) !== String(productId))
          .slice(0, 20)
          .map(p => ({
            id: p.id ?? p.product_id,
            title: p.title ?? p.name,
            price: p.selling_price ?? p.sale_price ?? p.price,
            image: p.main_image
              ? `https://cdn.vaarria.com/app/images/${p.main_image}`
              : p.image_url ?? '',
          }))
        setProducts(items)
      })
      .catch(() => {})
  }, [productId])

  useEffect(() => {
    if (products.length <= 1) return
    const id = setInterval(() => {
      setFading(true)
      setTimeout(() => {
        setActiveIndex(i => (i + 1) % products.length)
        setFading(false)
      }, 300)
    }, 4000)
    return () => clearInterval(id)
  }, [products.length])

  if (!products.length) return null

  const p = products[activeIndex]

  return (
    <div className='pdp-featured-banner' style={{ width: '15%', flexShrink: 0, position: 'sticky', top: 0, marginRight: 12, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', padding: '4px 2px', gap: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#C9A84C', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>You May Also Like</span>
      </div>
      <div
        style={{ height: '80vh', position: 'relative', border: '1px solid #e8e0d0', borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 12px rgba(5,12,28,0.06)', cursor: 'pointer' }}
        onClick={() => window.open(`/product/${p.id}`, '_blank')}
      >
        <div style={{ position: 'absolute', inset: 0, opacity: fading ? 0 : 1, transition: 'opacity 0.3s ease' }}>
          <img
            src={p.image}
            alt={p.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
            onError={e => { e.target.style.display = 'none' }}
          />
        </div>
        <div style={{ position: 'absolute', bottom: 72, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 4, zIndex: 3, flexWrap: 'wrap', padding: '0 8px' }}>
          {products.slice(0, Math.min(products.length, 10)).map((_, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); setActiveIndex(i); setFading(false) }}
              style={{ width: i === activeIndex ? 14 : 5, height: 5, borderRadius: 3, background: i === activeIndex ? '#C9A84C' : '#d1d5db', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.2s', flexShrink: 0 }}
            />
          ))}
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 2, background: 'linear-gradient(to top, rgba(5,12,28,0.88) 0%, rgba(5,12,28,0.5) 70%, transparent 100%)', padding: '28px 12px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#C9A84C', fontFamily: "'DM Sans', sans-serif" }}>₹{p.price?.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Product Detail Page ─────────────────────────────────────────────────
export default function ProductDetail() {
  const { id: productId } = useParams()
  const navigate = useNavigate()
  const { customer } = useAuthStore()
  const setItems = useBagStore((state) => state.setItems)
  const addGuestItem = useBagStore((state) => state.addGuestItem)
  const [product, setProduct] = useState(null)
  const [ratingsData, setRatingsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [sliderOpen, setSliderOpen] = useState(false)
  const [sliderIndex, setSliderIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [showWishlistModal, setShowWishlistModal] = useState(false)
  const { toggle: toggleWishlist, isWishlisted } = useWishlistStore()
  const wishlisted = product ? isWishlisted(product.id ?? productId) : false
  const [expandedSection, setExpandedSection] = useState('ratings')
  const [pincode, setPincode] = useState('560001')
  const [addedToBag, setAddedToBag] = useState(false)
  const [sizeError, setSizeError] = useState(false)
  const [bagError, setBagError] = useState('')
  const [addingToBag, setAddingToBag] = useState(false)
  const ratingsRef = useRef(null)
  const ctaRef = useRef(null)
  const [reviewSliderOpen, setReviewSliderOpen] = useState(false)
  const [reviewImages, setReviewImages] = useState([])
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [deliveryMessage, setDeliveryMessage] = useState('')
  const [checkingDelivery, setCheckingDelivery] = useState(false)
  const [historyProducts, setHistoryProducts] = useState([])
  const [relatedProducts, setRelatedProducts] = useState([])
  const hasRatings =
    ratingsData &&
    ratingsData.rating_count > 0 &&
    ratingsData.reviews?.length > 0
  const isOutOfStock =
    !product?.sizes?.length || !product?.availableSizes?.length

  useEffect(() => {
    setLoading(true)
    setNotFound(false)
    Promise.all([fetchProduct(productId), fetchRatings(productId).catch(() => null)])
      .then(([prod, ratings]) => {
        setProduct(prod)
        setRatingsData(ratings)
        setLoading(false)
      })
      .catch(() => {
        setNotFound(true)
        setLoading(false)
      })
  }, [productId])


  // Record view + load sliders when product is ready
  useEffect(() => {
    if (!product || !productId) return
    const cid = customer?.customer_id
    const ORDERS = ORDERS_URL
    const LISTING = CATALOG_URL

    // Record view (best-effort, only when logged in)
    if (cid) {
      authFetch(`${ORDERS}/history/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ customer_id: cid, product_id: Number(productId) }),
      }).catch(() => {})
    }

    // View history slider
    if (cid) {
      fetch(`${ORDERS}/history/${cid}`, { credentials: 'include' })
        .then(r => r.json())
        .then(async ({ product_ids = [] }) => {
          const ids = product_ids.filter(id => String(id) !== String(productId)).slice(0, 12)
          const products = await Promise.all(
            ids.map(id =>
              fetch(`https://products-api.chatoyantvortex.workers.dev/product?id=${id}`)
                .then(r => r.json())
                .then(raw => ({
                  id,
                  title: raw.title,
                  price: raw.pricing?.selling_price ?? raw.pricing?.mrp,
                  image: `https://cdn.vaarria.com/app/images/${raw.inventory?.variants?.[0]?.main_image}`,
                }))
                .catch(() => null)
            )
          )
          setHistoryProducts(products.filter(Boolean))
        })
        .catch(() => {})
    }

    // Related products slider — no category filter until listing DB has category_id populated
    {
      fetch(`${LISTING}/listings?page_size=13`)
        .then(r => r.json())
        .then(data => {
          const items = (data.listings ?? data.products ?? data.data ?? data ?? [])
            .filter(p => String(p.id ?? p.product_id) !== String(productId))
            .slice(0, 12)
            .map(p => ({
              id: p.id ?? p.product_id,
              title: p.title ?? p.name,
              price: p.selling_price ?? p.price,
              image: p.main_image
                ? `https://cdn.vaarria.com/app/images/${p.main_image}`
                : p.image_url ?? '',
            }))
          setRelatedProducts(items)
        })
        .catch(() => {})
    }
  }, [product, productId, customer])

  const checkPincode = async () => {
    if (pincode.length !== 6) {
      setDeliveryMessage('Please enter a valid 6-digit pincode')
      return
    }

    try {
      setCheckingDelivery(true)

      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`,
      )

      const data = await response.json()

      if (
        data?.[0]?.Status === 'Success' &&
        data?.[0]?.PostOffice?.length > 0
      ) {
        const office = data[0].PostOffice[0]

        setDeliveryMessage(
          `✓ Delivery available to ${office.District}, ${office.State}`,
        )
      } else {
        setDeliveryMessage('Delivery is not available for this pincode')
      }
    } catch {
      setDeliveryMessage('Unable to verify pincode at the moment')
    } finally {
      setCheckingDelivery(false)
    }
  }

  const scrollToRatings = () => {
    setExpandedSection('ratings')

    setTimeout(() => {
      ratingsRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }, 100)
  }

  const openSlider = (index) => {
    setSliderIndex(index)
    setSliderOpen(true)
  }

  const handleAddToBag = async () => {
    if (isOutOfStock) {
      return
    }

    if (!selectedSize) {
      setSizeError(true)
      return
    }

    setSizeError(false)
    setBagError('')
    setAddingToBag(true)

    try {
      const activeColor = product.colors?.find((c) => c.active)?.name || ''

      if (!customer?.customer_id) {
        // Guest: save to localStorage, no API call
        const guestItem = {
          id: `guest_${product.id}_${selectedSize}_${activeColor}_${Date.now()}`,
          productId: product.id || '',
          name: product.name || '',
          image: product.mediaItems?.[0]?.src || '',
          size: selectedSize,
          colorName: activeColor,
          color: '#f5f5f5',
          qty: 1,
          price: product.price || 0,
          mrp: product.mrp || 0,
          couponDiscount: 0,
          discountType: null,
          returnDays: product.return_days || 7,
          selected: true,
        }
        addGuestItem(guestItem)
        setAddedToBag(true)
        setTimeout(() => setAddedToBag(false), 2000)
        return
      }

      const response = await authFetch(
        `${ORDERS_URL}/bags/add-bag-item`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer_id: customer.customer_id,
            product_id: product.id || '',
            address_id: null,
            size: selectedSize || '',
            color: activeColor || '',
            quantity: 1,
            selected: true,
          }),
        },
      )

      if (!response.ok) {
        let errorMessage = 'Unable to add item to bag'

        try {
          const errorData = await response.json()
          errorMessage = errorData?.message || errorData?.detail || errorMessage
        } catch {
          // ignore json parsing error
        }

        throw new Error(errorMessage)
      }

      setAddedToBag(true)
      setTimeout(() => setAddedToBag(false), 2000)

      // refresh bag store so Navbar count updates instantly
      authFetch(`${ORDERS_URL}/bags/customers/${customer.customer_id}/bag`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data?.items)) {
            setItems(data.items.map(item => ({ id: item.bag_id, qty: item.quantity })))
          }
        })
        .catch(() => {})
    } catch (error) {
      setBagError(error.message || 'Unable to add item to bag')
    } finally {
      setAddingToBag(false)
    }
  }

  if (loading) return <SkeletonLoader />

  if (notFound) {
    return (
      <>
        <Navbar />
        <div style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '80px 20px', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22 }}>Product not found</h2>
          <p style={{ color: '#6b7280', fontSize: 14 }}>This product may have been removed or is no longer available.</p>
        </div>
        <Footer />
      </>
    )
  }

  const accordionSections = [
    {
      key: 'description',
      label: 'Product Description',
      content: (
        <>
          <p
            style={{
              fontSize: 13.5,
              color: '#555',
              lineHeight: 1.75,
              marginBottom: 14,
            }}
          >
            {product.description}
          </p>
          <p
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: '#374151',
              textTransform: 'uppercase',
              letterSpacing: '0.6px',
              marginBottom: 8,
            }}
          >
            Product Highlights
          </p>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {product.highlights.map((h, i) => (
              <li
                key={i}
                style={{
                  fontSize: 13.5,
                  color: '#555',
                  marginBottom: 5,
                  lineHeight: 1.65,
                }}
              >
                {h}
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      key: 'details',
      label: 'Product Details',
      content: (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {Object.entries(product.details).map(([k, v]) => (
              <tr key={k} style={{ borderBottom: '1px solid #fdf2f8' }}>
                <td
                  style={{
                    padding: '7px 0',
                    fontSize: 13,
                    color: '#9ca3af',
                    width: '42%',
                    verticalAlign: 'top',
                  }}
                >
                  {k}
                </td>
                <td
                  style={{
                    padding: '7px 0',
                    fontSize: 13,
                    color: '#374151',
                    fontWeight: 500,
                  }}
                >
                  {v}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    },
    {
      key: 'ratings',
      label: `Ratings & Reviews (${ratingsData ? ratingsData.rating_count.toLocaleString() : '—'})`,
      content: ratingsData ? (
        <>
          <div
            style={{
              display: 'flex',
              gap: 32,
              alignItems: 'center',
              marginBottom: 20,
              paddingBottom: 20,
              borderBottom: '1px solid #fdf2f8',
            }}
          >
            <div style={{ textAlign: 'center', minWidth: 80 }}>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 800,
                  color: '#1f2937',
                  lineHeight: 1,
                }}
              >
                {ratingsData.overall}
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 2,
                  marginTop: 6,
                }}
              >
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={13}
                    fill={
                      s <= Math.round(ratingsData.overall) ? '#fbbf24' : 'none'
                    }
                    color='#fbbf24'
                  />
                ))}
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                {ratingsData.rating_count.toLocaleString()} ratings
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {ratingsData.breakdown.map((b) => (
                <RatingBar key={b.label} label={b.label} pct={b.pct} />
              ))}
            </div>
          </div>
          {ratingsData.reviews.map((r) => (
            <div
              key={r.id}
              style={{
                paddingBottom: 16,
                marginBottom: 16,
                borderBottom: '1px solid #fdf2f8',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    background: 'linear-gradient(135deg,#10b981,#059669)',
                    color: '#fff',
                    borderRadius: 10,
                    padding: '2px 9px',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <Star size={10} fill='#fff' strokeWidth={0} /> {r.rating}
                </span>

                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#1f2937',
                  }}
                >
                  {r.user}
                </span>
              </div>
              <p
                style={{
                  fontSize: 13.5,
                  color: '#6b7280',
                  lineHeight: 1.65,
                  margin: 0,
                }}
              >
                {r.body}
              </p>

              {r.images?.length > 0 && (
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    marginTop: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  {r.images.map((image, imageIndex) => (
                    <img
                      key={imageIndex}
                      src={image}
                      alt=''
                      onClick={() => {
                        setReviewImages(
                          r.images.map((img) => ({
                            type: 'image',
                            src: img,
                            thumb: img,
                            placeholder: img,
                          })),
                        )

                        setSliderIndex(imageIndex)
                        setReviewSliderOpen(true)
                      }}
                      style={{
                        width: 72,
                        height: 96,
                        objectFit: 'cover',
                        borderRadius: 6,
                        border: '1px solid #e5e7eb',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </>
      ) : (
        <p style={{ fontSize: 13, color: '#9ca3af' }}>Loading ratings…</p>
      ),
    },
  ].filter((section) => section.key !== 'ratings' || hasRatings)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .pdp-page { min-height: 100vh; background: #fff; font-family: 'DM Sans', sans-serif; color: #1f2937; }
        .pdp-breadcrumb { padding: 11px 2%; font-size: 12px; color: #9ca3af; display: flex; gap: 6px; align-items: center; border-bottom: 1px solid #fff; background: #fff; }
        .pdp-breadcrumb a {
  color: #9ca3af;
  text-decoration: none;
}

.pdp-breadcrumb a:hover {
  color: #C9A84C;
}

.pdp-breadcrumb-clickable {
  cursor: pointer;
  transition: color 0.15s ease;
}

.pdp-breadcrumb-clickable:hover {
  color: #C9A84C;
}
        .pdp-breadcrumb-sep { color: #d1d5db; font-size: 10px; }
        .pdp-breadcrumb-current { color: #374151; font-weight: 500; }
        .pdp-page-layout { display: flex; align-items: flex-start; padding-left: 2%; }
        .pdp-outer { flex: 1; display: flex; align-items: flex-start; min-width: 0; padding-right: 12px; }
        .pdp-images-col { width: 55%; min-width: 0; padding-top: 12px; }
        .pdp-info-col {
  width: 45%;
  min-width: 0;
  padding: 0px 32px 32px 32px;
  border-left: 1px solid #f3f4f6;
  background: #fff;
}
        
        .pdp-brand-name { font-family: 'Playfair Display', serif; font-size: 24px; font-weight: 700; color: #1f2937; line-height: 1.2; }
        .pdp-product-subtitle { font-size: 14px; color: #6b7280; margin-top: 5px; line-height: 1.55; font-weight: 400; }
        .pdp-rating-row { display: flex; align-items: center; gap: 10px; margin-top: 12px; }
        .pdp-rating-pill { display: inline-flex; align-items: center; gap: 4px; background: linear-gradient(135deg, #10b981, #059669); color: #fff; border-radius: 4px; padding: 3px 9px; font-size: 13px; font-weight: 700; }
        .pdp-rating-meta { font-size: 13px; color: #9ca3af; }
        .pdp-rating-sep { color: #e5e7eb; }
        .pdp-price-row { display: flex; align-items: baseline; gap: 14px; margin-top: 18px; }
        .pdp-price { font-size: 30px; font-weight: 700; color: #1f2937; }
        .pdp-mrp { font-size: 16px; color: #d1d5db; text-decoration: line-through; }
        .pdp-discount { font-size: 15px; color: #C9A84C; font-weight: 700; }
        .pdp-tax { font-size: 11px; color: #9ca3af; margin-top: 3px; }
        .pdp-hr { height: 1px; background: #f3f4f6; margin: 14px 0; }
        .pdp-offers-title { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .pdp-offer-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; background: #F0EBE0; border: 1px solid #D4AF37; margin-bottom: 7px; }
        .pdp-offer-icon { font-size: 15px; margin-top: 1px; flex-shrink: 0; }
        .pdp-offer-title-text { font-size: 13px; font-weight: 600; color: #374151; }
        .pdp-offer-desc { font-size: 12px; color: #6b7280; }
        .pdp-size-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .pdp-section-label { font-size: 13px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; }
        .pdp-size-guide { font-size: 13px; color: #050C1C; font-weight: 600; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
        .pdp-sizes { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
        .pdp-size-btn { width: 56px; height: 56px; border-radius: 50%; border: 1.5px solid #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; transition: all 0.15s; background: #fff; font-family: 'DM Sans', sans-serif; }
        .pdp-size-btn:hover:not([disabled]) { border-color: #C9A84C; color: #050C1C; }
        .pdp-size-btn.selected { border-color: #C9A84C; color: #C9A84C; background: #050C1C; font-weight: 700; box-shadow: 0 0 0 3px rgba(201,168,76,0.15); }
        .pdp-size-btn[disabled] { cursor: not-allowed; color: #b8bdc4; background: #f3f4f6; border-color: #e5e7eb; background-image: linear-gradient(to top right, transparent calc(50% - 1px), #c4c9cf calc(50% - 1px), #c4c9cf calc(50% + 1px), transparent calc(50% + 1px)); }
        .pdp-size-btn[disabled]:hover { border-color: #e5e7eb; color: #b8bdc4; }
        .pdp-size-warn { font-size: 12px; color: #f59e0b; margin-top: 8px; font-weight: 500; }
        .pdp-cta { display: flex; gap: 10px; margin: 22px 0 18px; }
        .pdp-btn-bag { flex: 1; height: 54px; border: 1.5px solid #C9A84C; border-radius: 4px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; letter-spacing: 0.8px; text-transform: uppercase; background: #050C1C; color: #C9A84C; transition: all 0.2s; box-shadow: none; font-family: 'DM Sans', sans-serif; }
        .pdp-btn-bag:hover:not([disabled]) { background: #0d1f3c; transform: translateY(-1px); box-shadow: 0 6px 22px rgba(5,12,28,0.25); }
        .pdp-btn-bag[disabled] { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; box-shadow: none; border-color: #e5e7eb; }
        .pdp-btn-bag.added { background: #050C1C; color: #C9A84C; box-shadow: none; }
        .pdp-btn-wishlist { width: 54px; height: 54px; border-radius: 4px; border: 1.5px solid #e5e7eb; display: flex; align-items: center; justify-content: center; cursor: pointer; background: #fff; transition: all 0.2s; }
        .pdp-btn-wishlist:hover { border-color: #C9A84C; background: #FDF6E3; }
        .pdp-btn-wishlist.active { border-color: #C9A84C; background: #FDF6E3; }
        .pdp-trust { display: flex; border: 1px solid #f3f4f6; border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
        .pdp-trust-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 14px 8px; border-right: 1px solid #f3f4f6; text-align: center; background: #fafafa; }
        .pdp-trust-item:last-child { border-right: none; }
        .pdp-trust-label { font-size: 11px; color: #6b7280; font-weight: 500; text-align: center; line-height: 1.4; }
        .pdp-delivery { border: 1px solid #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 20px; background: #fafafa; }
        .pdp-delivery-title { font-size: 13px; font-weight: 700; color: #374151; display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
        .pdp-pincode-row { display: flex; gap: 8px; align-items: center; }
        .pdp-pincode-input { flex: 1; border: 1.5px solid #e5e7eb; border-radius: 6px; padding: 9px 12px; font-size: 13px; outline: none; font-family: 'DM Sans', sans-serif; background: #fff; transition: border-color 0.15s; color: #374151; }
        .pdp-pincode-input:focus { border-color: #C9A84C; }
        .pdp-pincode-btn { background: #050C1C; border: 1px solid #C9A84C; color: #C9A84C; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; padding: 6px 14px; border-radius: 4px; }
        .pdp-delivery-ok { font-size: 12px; color: #10b981; font-weight: 500; margin-top: 9px; }
        .pdp-accordion { margin-top: 8px; }
        .pdp-accordion-item { border-top: 1px solid #f3f4f6; }
        .pdp-accordion-trigger { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; cursor: pointer; user-select: none; background: none; border: none; width: 100%; font-family: 'DM Sans', sans-serif; text-align: left; }
        .pdp-accordion-label { font-size: 14px; font-weight: 600; color: #374151; }
        .pdp-accordion-body { padding-bottom: 20px; }
        .pdp-toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); background: #050C1C; color: #C9A84C; border: 1.5px solid #C9A84C; padding: 13px 32px; border-radius: 24px; font-size: 14px; font-weight: 600; z-index: 100; box-shadow: 0 8px 28px rgba(5,12,28,0.35); animation: toastIn 0.3s ease; font-family: 'DM Sans', sans-serif; }
        @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(16px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
@media (max-width: 900px) { .pdp-page-layout { flex-direction: column; padding-left: 0; } .pdp-outer { flex: none; width: 100%; padding-right: 0; flex-direction: column; } .pdp-images-col { width: 100%; } .pdp-info-col { width: 100%; padding: 16px; border-left: none; } .pdp-breadcrumb { padding: 10px 4%; } .pdp-featured-banner { display: none; } }
      `}</style>

      <div className='pdp-page'>
        <Navbar />
        <div className='pdp-breadcrumb'>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            Home
          </span>

          <span className='pdp-breadcrumb-sep'>›</span>

          <span
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/products')}
          >
            {product.category || 'All Products'}
          </span>

          <span className='pdp-breadcrumb-sep'>›</span>

          <span className='pdp-breadcrumb-current'>{product.name}</span>
        </div>

        <div className='pdp-page-layout'>
        <div className='pdp-outer'>
          {/* ─ LEFT: Gallery with thumbnail strip ─ */}
          <div className='pdp-images-col'>
            <ProductGallery
              mediaItems={product.mediaItems}
              onOpenSlider={openSlider}
            />
          </div>

          {/* ─ RIGHT: sticky info panel ─ */}
          <div className='pdp-info-col'>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ flex: 1, paddingRight: 16 }}>
                <div className='pdp-brand-name'>{product.brand}</div>
                <div className='pdp-product-subtitle'>{product.name}</div>
                {isOutOfStock && (
                  <span
                    style={{
                      display: 'inline-block', marginTop: 10,
                      background: 'rgba(10,10,10,0.9)', color: '#fff',
                      fontSize: 12, fontWeight: 800, letterSpacing: '0.12em',
                      padding: '5px 12px', borderRadius: 4, textTransform: 'uppercase',
                    }}
                  >
                    Sold Out
                  </span>
                )}
              </div>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  flexShrink: 0,
                }}
              ></button>
            </div>
            {hasRatings && (
              <div
                className='pdp-rating-row'
                onClick={scrollToRatings}
                style={{ cursor: 'pointer' }}
              >
                <span className='pdp-rating-pill'>
                  <Star size={11} fill='#fff' strokeWidth={0} />
                  {ratingsData.overall}
                </span>

                <span className='pdp-rating-sep'>|</span>

                <span className='pdp-rating-meta'>
                  {ratingsData.rating_count} Ratings
                </span>

                <span className='pdp-rating-sep'>|</span>

                <span className='pdp-rating-meta'>
                  {ratingsData.review_count} Reviews
                </span>
              </div>
            )}

            <div className='pdp-price-row'>
              <span className='pdp-price'>
                ₹{product.price.toLocaleString()}
              </span>
              <span className='pdp-mrp'>₹{product.mrp.toLocaleString()}</span>
              <span className='pdp-discount'>({product.discount}% OFF)</span>
            </div>
            <div className='pdp-tax'>inclusive of all taxes</div>

            {/* ── Coupon-applied price preview ── */}
            {product.coupon && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, background: '#F0FAF4', border: '1px dashed #10b981', borderRadius: 10, padding: '8px 12px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 18, fontWeight: 800, color: '#065f46' }}>
                  ₹{product.coupon.effectivePrice.toLocaleString()}
                </span>
                <span style={{ fontSize: 12, color: '#047857', fontWeight: 600 }}>
                  with code{' '}
                  <span style={{ background: '#10b981', color: '#fff', borderRadius: 6, padding: '1px 8px', fontWeight: 700, letterSpacing: '0.04em' }}>
                    {product.coupon.code}
                  </span>{' '}
                  at checkout
                </span>
              </div>
            )}

            {/* ── Savings + trust badges ── */}
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {product.mrp > product.price && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FFF7ED', border: '1px solid #fdba74', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#9a3412', fontWeight: 600 }}>
                  💰 You save{' '}
                  <span style={{ fontWeight: 700 }}>
                    ₹{(product.mrp - product.price).toLocaleString()}
                  </span>
                  {' '}on this order
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#F0FAF4', border: '1px solid #6ee7b7', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#065f46', fontWeight: 600 }}>
                🚚 Free Delivery
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#EFF6FF', border: '1px solid #93c5fd', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#1e40af', fontWeight: 600 }}>
                💵 Cash on Delivery
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#FAF5FF', border: '1px solid #d8b4fe', borderRadius: 20, padding: '4px 12px', fontSize: 12, color: '#6b21a8', fontWeight: 600 }}>
                🔁 7-Day Easy Returns
              </div>
            </div>

            <div className='pdp-hr' />

            <div className='pdp-offers-title'>Available Offers</div>
            {product.offers.map((o, i) => (
              <div key={i} className='pdp-offer-row'>
                <span className='pdp-offer-icon'>{o.icon}</span>
                <div>
                  <div className='pdp-offer-title-text'>{o.title}</div>
                  <div className='pdp-offer-desc'>{o.desc}</div>
                </div>
              </div>
            ))}

            <div className='pdp-hr' />

            <div className='pdp-size-header'>
              <span className='pdp-section-label'>Select Size</span>
              <span
                className='pdp-size-guide'
                onClick={() => setShowSizeChart(true)}
              >
                Size Guide
              </span>
            </div>
            <div className='pdp-sizes'>
              {product.sizes.map((s) => {
                const avail = product.availableSizes.includes(s)
                return (
                  <button
                    key={s}
                    className={`pdp-size-btn ${selectedSize === s ? 'selected' : ''}`}
                    disabled={!avail}
                    title={avail ? undefined : 'Sold out'}
                    onClick={() => avail && setSelectedSize(s)}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
            {/* per-size stock counter */}
            {selectedSize && product.sizeQuantities?.[selectedSize] > 0 && product.sizeQuantities[selectedSize] <= 6 && (
              <div style={{ fontSize: 12, color: '#b45309', fontWeight: 600, marginTop: 8, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 14 }}>🔥</span> Only {product.sizeQuantities[selectedSize]} left in size {selectedSize} — grab it fast!
              </div>
            )}
            {isOutOfStock && (
              <div style={{ fontSize: 12, color: '#ef4444', marginTop: 8, fontWeight: 600 }}>
                Out of stock
              </div>
            )}

            {sizeError && !isOutOfStock && (
              <div className='pdp-size-warn'>
                Please select a size to continue
              </div>
            )}

            {bagError && (
              <div
                style={{
                  fontSize: 12,
                  color: '#ef4444',
                  marginTop: 8,
                  fontWeight: 500,
                }}
              >
                {bagError}
              </div>
            )}

            {/* ── Top review quote ── */}
            {hasRatings && ratingsData.reviews[0] && (
              <div style={{ margin: '14px 0 10px', padding: '12px 14px', background: '#FDFAF3', border: '1px solid #E8D9A0', borderRadius: 8, position: 'relative' }}>
                <div style={{ fontSize: 28, color: '#C9A84C', lineHeight: 1, position: 'absolute', top: 6, left: 10, opacity: 0.5, fontFamily: 'Georgia, serif' }}>"</div>
                <p style={{ fontSize: 12.5, color: '#374151', lineHeight: 1.65, margin: '6px 0 8px', paddingLeft: 16 }}>
                  {ratingsData.reviews[0].body}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', borderRadius: 8, padding: '1px 7px', fontSize: 11, fontWeight: 600 }}>
                    <Star size={9} fill='#fff' strokeWidth={0} /> {ratingsData.reviews[0].rating}
                  </span>
                  <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 600 }}>{ratingsData.reviews[0].user}</span>
                  <span style={{ fontSize: 11, color: '#9ca3af' }}>· Verified Buyer</span>
                </div>
                <button
                  onClick={scrollToRatings}
                  style={{ marginTop: 10, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#C9A84C', letterSpacing: '0.04em', padding: 0, textDecoration: 'underline', textUnderlineOffset: 3 }}
                >
                  See all {ratingsData?.review_count} reviews ↓
                </button>
              </div>
            )}

            {/* ── Reassurance strip ── */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 12, border: '1px solid #e8e0d0', borderRadius: 8, overflow: 'hidden', background: '#fafaf8' }}>
              {[
                { icon: <ArrowLeftRight size={15} color='#C9A84C' />, label: "Wrong size? We'll swap it" },
                { icon: <Wallet size={15} color='#C9A84C' />, label: 'Pay when it arrives' },
                { icon: <RotateCcw size={15} color='#C9A84C' />, label: "Don't love it? Return it — no questions asked" },
              ].map((item, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, padding: '10px 8px', borderRight: i < 2 ? '1px solid #e8e0d0' : 'none' }}>
                  {item.icon}
                  <span style={{ fontSize: 10.5, color: '#374151', fontWeight: 600, textAlign: 'center', lineHeight: 1.35 }}>{item.label}</span>
                </div>
              ))}
            </div>

            <div className='pdp-cta' ref={ctaRef}>
              <button
                className={`pdp-btn-bag ${addedToBag ? 'added' : ''}`}
                onClick={handleAddToBag}
                disabled={addingToBag || isOutOfStock}
              >
                <ShoppingBag size={18} />
                {isOutOfStock
                  ? 'OUT OF STOCK'
                  : addingToBag
                    ? 'ADDING...'
                    : addedToBag
                      ? '✓ Added to Bag'
                      : 'Add to Bag'}
              </button>
              <button
                className={`pdp-btn-wishlist ${wishlisted ? 'active' : ''}`}
                onClick={() => {
                  if (!customer) { setShowWishlistModal(true); return }
                  toggleWishlist(customer.customer_id, product.id ?? productId)
                }}
              >
                <Heart
                  size={20}
                  color={wishlisted ? '#C9A84C' : '#6b7280'}
                  fill={wishlisted ? '#C9A84C' : 'none'}
                />
              </button>
            </div>

            <div className='pdp-trust'>
              <div className='pdp-trust-item'>
                <Truck size={18} color='#C9A84C' />
                <span className='pdp-trust-label'>Ships free, always</span>
              </div>
              <div className='pdp-trust-item'>
                <Shield size={18} color='#C9A84C' />
                <span className='pdp-trust-label'>Fine fabric. Fair price. No compromise.</span>
              </div>
              <div className='pdp-trust-item'>
                <CreditCard size={18} color='#C9A84C' />
                <span className='pdp-trust-label'>Your money is safe · Instant refunds</span>
              </div>
            </div>

            <div className='pdp-delivery'>
              <div className='pdp-delivery-title'>
                <Truck size={14} color='#C9A84C' />
                Delivery Options
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8, letterSpacing: '0.03em' }}>Enter your pincode to check delivery</div>
              <div className='pdp-pincode-row'>
                <input
                  className='pdp-pincode-input'
                  value={pincode}
                  onChange={(e) =>
                    setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  placeholder='Enter Pincode'
                  maxLength={6}
                />
                <button className='pdp-pincode-btn' onClick={checkPincode}>
                  {checkingDelivery ? 'Checking...' : 'Check'}
                </button>
              </div>
              {deliveryMessage ? (
                <div style={{ marginTop: 10, fontSize: 12, fontWeight: 500, color: deliveryMessage.startsWith('✓') ? '#059669' : '#ef4444' }}>
                  {deliveryMessage}
                </div>
              ) : (
                <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 5 }}>
                  <div style={{ fontSize: 12, color: '#059669', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontWeight: 700 }}>✓</span> Estimated delivery in {product.deliveryInfo.days}
                  </div>
                  {product.deliveryInfo.cod && (
                    <div style={{ fontSize: 12, color: '#059669', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700 }}>✓</span> Cash on Delivery Available
                    </div>
                  )}
                </div>
              )}
            </div>

            {product.highlights?.length > 0 && (
              <div style={{ margin: '4px 0 12px', padding: '12px 14px', background: '#F9F6F0', borderRadius: 6, border: '1px solid #efe8d8' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#050C1C', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>Product Highlights</div>
                {product.highlights.slice(0, 4).map((h, i) => (
                  <div key={i} style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ color: '#C9A84C', fontWeight: 700, flexShrink: 0 }}>·</span>
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            )}

            {!isOutOfStock && product.availableSizes?.length > 0 && product.availableSizes?.length < 3 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, padding: '7px 10px', background: '#FFF8EC', border: '1px solid #F0D080', borderRadius: 5 }}>
                <span style={{ fontSize: 15 }}>🔥</span>
                <span style={{ fontSize: 12, color: '#92400e', fontWeight: 600 }}>Only a few sizes left — selling fast!</span>
              </div>
            )}

            <div className='pdp-accordion'>
              {accordionSections.map((sec) => (
                <div
                  key={sec.key}
                  className='pdp-accordion-item'
                  ref={sec.key === 'ratings' ? ratingsRef : null}
                >
                  <button
                    className='pdp-accordion-trigger'
                    onClick={() =>
                      setExpandedSection(
                        expandedSection === sec.key ? null : sec.key,
                      )
                    }
                  >
                    <span className='pdp-accordion-label'>{sec.label}</span>
                    {expandedSection === sec.key ? (
                      <ChevronUp size={16} color='#C9A84C' />
                    ) : (
                      <ChevronDown size={16} color='#9ca3af' />
                    )}
                  </button>
                  {expandedSection === sec.key && (
                    <div className='pdp-accordion-body'>{sec.content}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>{/* pdp-outer */}
        <FeaturedBanner productId={productId} />
        </div>{/* pdp-page-layout */}
      </div>

      {/* ── View History Slider ── */}
      {/* ── Related Products Slider ── */}
      {relatedProducts.length > 0 && (
        <div style={{ maxWidth: 1536, margin: '0 auto', padding: '32px clamp(16px,3%,32px) 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ height: 1, flex: 1, background: '#e8e0d0' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#050C1C', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Playfair Display', Georgia, serif", whiteSpace: 'nowrap' }}>You May Also Like</span>
            <div style={{ height: 1, flex: 1, background: '#e8e0d0' }} />
          </div>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 8 }}>
            {relatedProducts.map(item => (
              <div key={item.id} style={{ flexShrink: 0, width: 160, cursor: 'pointer' }} onClick={() => window.open(`/product/${item.id}`, '_blank')}>
                <div style={{ width: 160, height: 213, borderRadius: 8, overflow: 'hidden', background: '#f3f0eb', border: '1px solid #e8e0d0', marginBottom: 8 }}>
                  <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} onError={e => { e.target.style.display = 'none' }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', lineHeight: 1.3, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#C9A84C', marginTop: 4 }}>₹{item.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {historyProducts.length > 0 && (
        <div style={{ maxWidth: 1536, margin: '0 auto', padding: '24px clamp(16px,3%,32px) 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ height: 1, flex: 1, background: '#e8e0d0' }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#050C1C', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Playfair Display', Georgia, serif", whiteSpace: 'nowrap' }}>Recently Viewed</span>
            <div style={{ height: 1, flex: 1, background: '#e8e0d0' }} />
          </div>
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 8 }}>
            {historyProducts.map(item => (
              <div key={item.id} style={{ flexShrink: 0, width: 160, cursor: 'pointer' }} onClick={() => window.open(`/product/${item.id}`, '_blank')}>
                <div style={{ width: 160, height: 213, borderRadius: 8, overflow: 'hidden', background: '#f3f0eb', border: '1px solid #e8e0d0', marginBottom: 8 }}>
                  <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} onError={e => { e.target.style.display = 'none' }} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1f2937', lineHeight: 1.3, WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#C9A84C', marginTop: 4 }}>₹{item.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer />

      {/* Full-screen media slider */}
      {sliderOpen && (
        <MediaSlider
          mediaItems={product.mediaItems}
          initialIndex={sliderIndex}
          onClose={() => setSliderOpen(false)}
        />
      )}

      {reviewSliderOpen && (
        <MediaSlider
          mediaItems={reviewImages}
          initialIndex={sliderIndex}
          onClose={() => setReviewSliderOpen(false)}
        />
      )}

      {addedToBag && <div className='pdp-toast'>✓ Added to your bag!</div>}

      {showWishlistModal && (
        <WishlistLoginModal
          onClose={() => setShowWishlistModal(false)}
          onLoggedIn={(c) => {
            setShowWishlistModal(false)
            toggleWishlist(c.customer_id, product.id ?? productId)
          }}
        />
      )}


      {showSizeChart && (
        <div
          onClick={() => setShowSizeChart(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            zIndex: 1000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 700,
              background: '#050C1C',
              border: '1.5px solid #C9A84C',
              borderRadius: 12,
              padding: '28px 32px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 24,
                borderBottom: '1px solid rgba(201,168,76,0.25)',
                paddingBottom: 16,
              }}
            >
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#C9A84C',
                  fontFamily: "'Playfair Display', Georgia, serif",
                  letterSpacing: '0.04em',
                }}
              >
                Size Chart
              </h2>

              <button
                onClick={() => setShowSizeChart(false)}
                style={{
                  border: '1px solid rgba(201,168,76,0.4)',
                  background: 'none',
                  cursor: 'pointer',
                  color: '#C9A84C',
                  borderRadius: 4,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}
            >
              <thead>
                <tr>
                  {['Size', 'Bust', 'Waist', 'Hip'].map((h) => (
                    <th
                      key={h}
                      style={{
                        border: '1px solid rgba(201,168,76,0.2)',
                        padding: '12px 16px',
                        background: 'rgba(201,168,76,0.08)',
                        textAlign: 'left',
                        color: '#C9A84C',
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {[
                  ['XS', '32"', '26"', '34"'],
                  ['S', '34"', '28"', '36"'],
                  ['M', '36"', '30"', '38"'],
                  ['L', '38"', '32"', '40"'],
                  ['XL', '40"', '34"', '42"'],
                  ['XXL', '42"', '36"', '44"'],
                ].map(([size, bust, waist, hip], i) => (
                  <tr key={size} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(201,168,76,0.04)' }}>
                    {[size, bust, waist, hip].map((val, j) => (
                      <td
                        key={j}
                        style={{
                          border: '1px solid rgba(201,168,76,0.15)',
                          padding: '12px 16px',
                          color: j === 0 ? '#C9A84C' : '#F9F6F0',
                          fontSize: 14,
                          fontWeight: j === 0 ? 600 : 400,
                        }}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <div
              style={{
                marginTop: 16,
                fontSize: 12,
                color: 'rgba(249,246,240,0.5)',
                letterSpacing: '0.02em',
              }}
            >
              All measurements are in inches and may vary slightly by style.
            </div>
          </div>
        </div>
      )}
    </>
  )
}
