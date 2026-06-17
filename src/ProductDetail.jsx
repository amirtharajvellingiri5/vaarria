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
} from 'lucide-react'
import Navbar from './Navbar'
import Footer from './Footer'
import { useParams, useNavigate } from 'react-router-dom'

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
  const res = await fetch(
    `https://products-api.chatoyantvortex.workers.dev/product?id=${productId}`,
  )
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

  const desc = raw.description?.description ?? {}
  const details = { 'Style Code': raw.style_code ?? '—', ...desc }
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

  return {
    id: raw.product_id,
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
    colors: raw.inventory.variants.map((v) => ({
      name: v.color,
      hex: v.color_hex ?? '#cccccc',
      active: v.color === variant.color,
    })),
    description: raw.description?.product_blurb ?? raw.title,
    highlights:
      raw.description?.highlights ??
      Object.entries(desc).map(([k, v]) => `${k}: ${v}`),
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
        desc: '7-day return policy. No questions asked.',
      },
    ],
  }
}

async function fetchRatings(productId) {
  const response = await fetch(
    `https://zq0dbjycx6.execute-api.ap-south-1.amazonaws.com/prod/products/${productId}/ratings`,
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
          width: 76,
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
              width: 64,
              height: 84,
              flexShrink: 0,
              border:
                i === activeIndex ? '2px solid #ec4899' : '2px solid #e5e7eb',
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
        .pdp-breadcrumb { padding: 11px clamp(16px, 3%, 32px); font-size: 12px; color: #9ca3af; display: flex; gap: 6px; align-items: center; border-bottom: 1px solid #fff; background: #fff; max-width: 1536px; margin: 0 auto; box-sizing: border-box; width: 100%; }
        .pdp-outer { display: flex; align-items: flex-start; max-width: 1536px; margin: 0 auto; padding: 0 clamp(16px, 3%, 32px); }
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

// ─── Main Product Detail Page ─────────────────────────────────────────────────
export default function ProductDetail() {
  const { id: productId } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [ratingsData, setRatingsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sliderOpen, setSliderOpen] = useState(false)
  const [sliderIndex, setSliderIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [wishlist, setWishlist] = useState(false)
  const [expandedSection, setExpandedSection] = useState('ratings')
  const [pincode, setPincode] = useState('560001')
  const [addedToBag, setAddedToBag] = useState(false)
  const [sizeError, setSizeError] = useState(false)
  const [bagError, setBagError] = useState('')
  const [addingToBag, setAddingToBag] = useState(false)
  const ratingsRef = useRef(null)
  const [reviewSliderOpen, setReviewSliderOpen] = useState(false)
  const [reviewImages, setReviewImages] = useState([])
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [deliveryMessage, setDeliveryMessage] = useState('')
  const [checkingDelivery, setCheckingDelivery] = useState(false)
  const hasRatings =
    ratingsData &&
    ratingsData.rating_count > 0 &&
    ratingsData.reviews?.length > 0
  const isOutOfStock =
    !product?.sizes?.length || !product?.availableSizes?.length

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchProduct(productId), fetchRatings(productId)]).then(
      ([prod, ratings]) => {
        setProduct(prod)
        setRatingsData(ratings)
        setLoading(false)
      },
    )
  }, [productId])

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

      const response = await fetch(
        'https://zq0dbjycx6.execute-api.ap-south-1.amazonaws.com/prod/bags/add-bag-item',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer_id: 1,
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

      setTimeout(() => {
        setAddedToBag(false)
      }, 2000)
    } catch (error) {
      setBagError(error.message || 'Unable to add item to bag')
    } finally {
      setAddingToBag(false)
    }
  }

  if (loading) return <SkeletonLoader />

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
        .pdp-breadcrumb { padding: 11px clamp(16px, 3%, 32px); font-size: 12px; color: #9ca3af; display: flex; gap: 6px; align-items: center; border-bottom: 1px solid #fff; background: #fff; max-width: 1536px; margin: 0 auto; box-sizing: border-box; width: 100%; }
        .pdp-breadcrumb a {
  color: #9ca3af;
  text-decoration: none;
}

.pdp-breadcrumb a:hover {
  color: #ec4899;
}

.pdp-breadcrumb-clickable {
  cursor: pointer;
  transition: color 0.15s ease;
}

.pdp-breadcrumb-clickable:hover {
  color: #ec4899;
}
        .pdp-breadcrumb-sep { color: #d1d5db; font-size: 10px; }
        .pdp-breadcrumb-current { color: #374151; font-weight: 500; }
        .pdp-outer { display: flex; align-items: flex-start; max-width: 1536px; margin: 0 auto; padding: 0 clamp(16px, 3%, 32px); }
        .pdp-images-col { width: 52%; min-width: 0; padding-top: 12px; }
        .pdp-info-col {
  width: 48%;
  min-width: 0;
  padding: 0px 48px 48px 40px;
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
        .pdp-discount { font-size: 15px; color: #ff6b35; font-weight: 700; }
        .pdp-tax { font-size: 11px; color: #9ca3af; margin-top: 3px; }
        .pdp-hr { height: 1px; background: #f3f4f6; margin: 20px 0; }
        .pdp-offers-title { font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        .pdp-offer-row { display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 8px; background: #fffbf5; border: 1px solid #fef3c7; margin-bottom: 7px; }
        .pdp-offer-icon { font-size: 15px; margin-top: 1px; flex-shrink: 0; }
        .pdp-offer-title-text { font-size: 13px; font-weight: 600; color: #374151; }
        .pdp-offer-desc { font-size: 12px; color: #6b7280; }
        .pdp-size-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .pdp-section-label { font-size: 13px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px; }
        .pdp-size-guide { font-size: 13px; color: #ec4899; font-weight: 600; cursor: pointer; }
        .pdp-sizes { display: flex; flex-wrap: wrap; gap: 10px; }
        .pdp-size-btn { width: 56px; height: 56px; border-radius: 50%; border: 1.5px solid #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; transition: all 0.15s; background: #fff; font-family: 'DM Sans', sans-serif; }
        .pdp-size-btn:hover:not([disabled]) { border-color: #ec4899; color: #ec4899; }
        .pdp-size-btn.selected { border-color: #ec4899; color: #ec4899; background: #fff1f5; font-weight: 700; box-shadow: 0 0 0 3px rgba(236,72,153,0.12); }
        .pdp-size-btn[disabled] { opacity: 0.28; cursor: not-allowed; border-style: dashed; }
        .pdp-size-warn { font-size: 12px; color: #f59e0b; margin-top: 8px; font-weight: 500; }
        .pdp-cta { display: flex; gap: 10px; margin: 22px 0 18px; }
        .pdp-btn-bag { flex: 1; height: 54px; border: none; border-radius: 4px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; letter-spacing: 0.8px; text-transform: uppercase; background: linear-gradient(135deg, #ec4899, #f43f5e); color: #fff; transition: all 0.2s; box-shadow: 0 4px 16px rgba(236,72,153,0.3); font-family: 'DM Sans', sans-serif; }
        .pdp-btn-bag:hover:not([disabled]) { background: linear-gradient(135deg, #db2777, #e11d48); transform: translateY(-1px); box-shadow: 0 6px 22px rgba(236,72,153,0.42); }
        .pdp-btn-bag[disabled] { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; box-shadow: none; }
        .pdp-btn-bag.added { background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 4px 16px rgba(16,185,129,0.3); }
        .pdp-btn-wishlist { width: 54px; height: 54px; border-radius: 4px; border: 1.5px solid #e5e7eb; display: flex; align-items: center; justify-content: center; cursor: pointer; background: #fff; transition: all 0.2s; }
        .pdp-btn-wishlist:hover { border-color: #ec4899; background: #fff1f5; }
        .pdp-btn-wishlist.active { border-color: #ec4899; background: #fff1f5; }
        .pdp-trust { display: flex; border: 1px solid #f3f4f6; border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
        .pdp-trust-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 14px 8px; border-right: 1px solid #f3f4f6; text-align: center; background: #fafafa; }
        .pdp-trust-item:last-child { border-right: none; }
        .pdp-trust-label { font-size: 11px; color: #6b7280; font-weight: 500; }
        .pdp-delivery { border: 1px solid #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 20px; background: #fafafa; }
        .pdp-delivery-title { font-size: 13px; font-weight: 700; color: #374151; display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
        .pdp-pincode-row { display: flex; gap: 8px; align-items: center; }
        .pdp-pincode-input { flex: 1; border: 1.5px solid #e5e7eb; border-radius: 6px; padding: 9px 12px; font-size: 13px; outline: none; font-family: 'DM Sans', sans-serif; background: #fff; transition: border-color 0.15s; color: #374151; }
        .pdp-pincode-input:focus { border-color: #ec4899; }
        .pdp-pincode-btn { background: none; border: none; color: #ec4899; font-size: 13px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; padding: 0 4px; }
        .pdp-delivery-ok { font-size: 12px; color: #10b981; font-weight: 500; margin-top: 9px; }
        .pdp-accordion { margin-top: 8px; }
        .pdp-accordion-item { border-top: 1px solid #f3f4f6; }
        .pdp-accordion-trigger { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; cursor: pointer; user-select: none; background: none; border: none; width: 100%; font-family: 'DM Sans', sans-serif; text-align: left; }
        .pdp-accordion-label { font-size: 14px; font-weight: 600; color: #374151; }
        .pdp-accordion-body { padding-bottom: 20px; }
        .pdp-toast { position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #ec4899, #f43f5e); color: #fff; padding: 13px 32px; border-radius: 24px; font-size: 14px; font-weight: 600; z-index: 100; box-shadow: 0 8px 28px rgba(236,72,153,0.4); animation: toastIn 0.3s ease; font-family: 'DM Sans', sans-serif; }
        @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(16px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @media (max-width: 900px) { .pdp-outer {
  display: flex;
  align-items: flex-start;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 clamp(16px, 6%, 86px);
} .pdp-images-col { width: 100%; } .pdp-info-col {
  width: 48%;
  min-width: 0;
  padding: 0px 48px 48px 40px;
  border-left: 1px solid #f3f4f6;
  background: #fff;
} .pdp-breadcrumb { padding: 10px 16px; } }
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
            onClick={() => navigate(`/category/${product.categoryId}`)}
          >
            {product.category}
          </span>

          <span className='pdp-breadcrumb-sep'>›</span>

          <span
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/brand/${product.brandId}`)}
          >
            {product.brand}
          </span>

          <span className='pdp-breadcrumb-sep'>›</span>

          <span className='pdp-breadcrumb-current'>{product.name}</span>
        </div>

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
                    onClick={() => avail && setSelectedSize(s)}
                  >
                    {s}
                  </button>
                )
              })}
            </div>
            {isOutOfStock && (
              <div
                style={{
                  fontSize: 12,
                  color: '#ef4444',
                  marginTop: 8,
                  fontWeight: 600,
                }}
              >
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

            <div className='pdp-cta'>
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
                className={`pdp-btn-wishlist ${wishlist ? 'active' : ''}`}
                onClick={() => setWishlist((w) => !w)}
              >
                <Heart
                  size={20}
                  color={wishlist ? '#ec4899' : '#6b7280'}
                  fill={wishlist ? '#ec4899' : 'none'}
                />
              </button>
            </div>

            <div className='pdp-trust'>
              <div className='pdp-trust-item'>
                <Truck size={18} color='#10b981' />
                <span className='pdp-trust-label'>Free Delivery</span>
              </div>
              <div className='pdp-trust-item'>
                <RefreshCw size={18} color='#f59e0b' />
                <span className='pdp-trust-label'>7-Day Returns</span>
              </div>
              <div className='pdp-trust-item'>
                <Shield size={18} color='#8b5cf6' />
                <span className='pdp-trust-label'>100% Genuine</span>
              </div>
            </div>

            <div className='pdp-delivery'>
              <div className='pdp-delivery-title'>
                <Truck size={14} color='#ec4899' />
                Delivery Options
              </div>
              <div className='pdp-pincode-row'>
                <input
                  className='pdp-pincode-input'
                  value={pincode}
                  onChange={(e) =>
                    setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))
                  }
                  placeholder='Enter pincode'
                  maxLength={6}
                />
                <button className='pdp-pincode-btn' onClick={checkPincode}>
                  {checkingDelivery ? 'Checking...' : 'Check'}
                </button>
              </div>
              <div
                style={{
                  marginTop: 10,
                  fontSize: 12,
                  fontWeight: 500,
                  color: deliveryMessage.startsWith('✓')
                    ? '#10b981'
                    : deliveryMessage
                      ? '#ef4444'
                      : '#10b981',
                }}
              >
                {deliveryMessage || (
                  <>
                    ✓ Estimated delivery in {product.deliveryInfo.days}
                    {product.deliveryInfo.cod && ' · COD available'}
                  </>
                )}
              </div>
            </div>

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
                      <ChevronUp size={16} color='#ec4899' />
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
        </div>
      </div>

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
              background: '#fff',
              borderRadius: 12,
              padding: 24,
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: '#111827',
                }}
              >
                Size Chart
              </h2>

              <button
                onClick={() => setShowSizeChart(false)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                <X size={22} />
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
                  <th
                    style={{
                      border: '1px solid #e5e7eb',
                      padding: 12,
                      background: '#f9fafb',
                      textAlign: 'left',
                    }}
                  >
                    Size
                  </th>
                  <th
                    style={{
                      border: '1px solid #e5e7eb',
                      padding: 12,
                      background: '#f9fafb',
                      textAlign: 'left',
                    }}
                  >
                    Bust
                  </th>
                  <th
                    style={{
                      border: '1px solid #e5e7eb',
                      padding: 12,
                      background: '#f9fafb',
                      textAlign: 'left',
                    }}
                  >
                    Waist
                  </th>
                  <th
                    style={{
                      border: '1px solid #e5e7eb',
                      padding: 12,
                      background: '#f9fafb',
                      textAlign: 'left',
                    }}
                  >
                    Hip
                  </th>
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
                ].map(([size, bust, waist, hip]) => (
                  <tr key={size}>
                    <td
                      style={{
                        border: '1px solid #e5e7eb',
                        padding: 12,
                      }}
                    >
                      {size}
                    </td>
                    <td
                      style={{
                        border: '1px solid #e5e7eb',
                        padding: 12,
                      }}
                    >
                      {bust}
                    </td>
                    <td
                      style={{
                        border: '1px solid #e5e7eb',
                        padding: 12,
                      }}
                    >
                      {waist}
                    </td>
                    <td
                      style={{
                        border: '1px solid #e5e7eb',
                        padding: 12,
                      }}
                    >
                      {hip}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div
              style={{
                marginTop: 16,
                fontSize: 13,
                color: '#6b7280',
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
