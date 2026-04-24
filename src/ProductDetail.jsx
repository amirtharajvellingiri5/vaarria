import { useState, useEffect, useCallback } from 'react'
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
  Search,
  User,
  Menu,
} from 'lucide-react'

import logo from './assets/logo.png'
import { useParams } from 'react-router-dom'


// ─── Navbar ───────────────────────────────────────────────────────────────────
const Navbar = ({ cartCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState(null)

  const menuItems = [
    { name: 'Sarees', submenu: ['Silk Sarees', 'Cotton Sarees', 'Designer Sarees', 'Banarasi Sarees', 'Kanjivaram Sarees'] },
    { name: 'Lehengas', submenu: ['Bridal Lehengas', 'Party Wear', 'Designer Lehengas', 'Silk Lehengas'] },
    { name: 'Suits', submenu: ['Anarkali Suits', 'Palazzo Suits', 'Salwar Suits', 'Churidar Suits'] },
    { name: 'Kurtis', submenu: ['Cotton Kurtis', 'Designer Kurtis', 'Printed Kurtis', 'Long Kurtis'] },
  ]

  return (
    <nav className='bg-white shadow-sm sticky top-0 z-50 border-b border-pink-100'>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '0 clamp(16px, 6%, 86px)' }}>
        <div className='flex justify-between items-center h-16'>
          <div className='flex items-center'>
            <button onClick={() => setIsOpen(!isOpen)} className='md:hidden mr-4 text-gray-700 hover:text-pink-600 transition'>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <a href='/'><img src={logo} alt='Logo' className='h-20 md:h-24 object-contain' /></a>
          </div>
          <div className='hidden md:flex space-x-6 relative'>
            {menuItems.map((item) => (
              <div key={item.name} className='relative' onMouseEnter={() => setActiveMenu(item.name)} onMouseLeave={() => setActiveMenu(null)}>
                <button className='text-gray-700 hover:text-pink-600 transition font-medium flex items-center gap-1 text-sm'>
                  {item.name}<ChevronDown size={14} />
                </button>
                {activeMenu === item.name && (
                  <div className='absolute top-full left-0 mt-2 bg-white shadow-xl rounded-xl py-2 min-w-48 border border-pink-100 z-50'>
                    {item.submenu.map((sub) => (
                      <a key={sub} href='#' className='block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition'>{sub}</a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <a href='#' className='text-pink-600 hover:text-pink-700 transition font-bold text-sm'>Sale</a>
          </div>
          <div className='flex items-center space-x-4'>
            <button className='text-gray-700 hover:text-pink-600 transition'><Search size={20} /></button>
            <button className='text-gray-700 hover:text-pink-600 transition'><Heart size={20} /></button>
            <button className='text-gray-700 hover:text-pink-600 transition'><User size={20} /></button>
            <button className='relative text-gray-700 hover:text-pink-600 transition'>
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className='absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className='md:hidden border-t border-pink-100'>
          <div className='px-4 pt-2 pb-3 space-y-1 bg-pink-50/50'>
            {menuItems.map((item) => (
              <div key={item.name}>
                <a href='#' className='block px-3 py-2 text-gray-700 hover:bg-pink-100 rounded font-medium text-sm'>{item.name}</a>
              </div>
            ))}
            <a href='#' className='block px-3 py-2 text-pink-600 hover:bg-pink-100 rounded font-bold text-sm'>Sale</a>
          </div>
        </div>
      )}
    </nav>
  )
}

// ─── Mock API Response ────────────────────────────────────────────────────────
// This is the raw JSON that would come from the product API endpoint.
const MOCK_PRODUCT_API_RESPONSE = {
  id: 3,
  title: "Kurta Set Classic",
  brand: {
    name: "Sangria",
    catalogue_id: "BRAND-SANGRIA-1"
  },
  category: {
    category_id: 2,
    category_name: "Kurtas"
  },
  description: {
    Material: "Viscose Rayon",
    "Sleeve Length": "Three-Quarter Sleeves",
    Neck: "V-Neck",
    "Design Styling": "Straight",
    // ADDED NEW: missing fields needed for product details table
    Occasion: "Ethnic, Casual",
    "Fabric Care": "Gentle Machine Wash / Hand Wash",
    Pattern: "Embroidered",
    "Length Type": "Regular",
    "Fit Type": "Straight",
    Color: "Navy Blue",
    "Country of Origin": "India",
    // ADDED NEW: short product blurb shown above the details table
    product_blurb: "Crafted from premium viscose rayon, this Sangria kurta features intricate ethnic motif embroidery with detailed thread work at the yoke and hem.",
    // ADDED NEW: bullet highlights shown in the description accordion
    highlights: [
      "Premium Viscose Rayon fabric",
      "Intricate ethnic motif embroidery",
      "Thread work detailing at yoke & hem",
      "Straight fit silhouette",
      "Three-quarter sleeves",
      "V-neck with button detail"
    ]
  },
  pricing: {
    mrp: 2999.0,
    sale_price: 1199.0,
    buy_price: 800.0,
    gst: 5.0
  },
  inventory: {
    variants: [
      {
        color: "Navy Blue",
        // ADDED NEW: hex code for the colour swatch
        color_hex: "#1a237e",
        sizes: [
          { size: "XS", quantity: 0 },  // quantity 0 => unavailable
          { size: "S",  quantity: 10 },
          { size: "M",  quantity: 8 },
          { size: "L",  quantity: 6 },
          { size: "XL", quantity: 4 },
          { size: "XXL", quantity: 0 }  // ADDED NEW: XXL added as out-of-stock
        ],
        main_image: "https://cdn.aarria.com/app/images/IMG-20220416-WA0000.jpg",
        other_images: [
          "https://cdn.aarria.com/app/images/IMG-20220416-WA0001.jpg",
          "https://cdn.aarria.com/app/images/IMG-20220416-WA0002.jpg",
          "https://cdn.aarria.com/app/images/IMG-20220416-WA0005.jpg",
          "https://cdn.aarria.com/app/images/IMG-20220416-WA0006.jpg"
        ]
      }
    ]
  },
  // ADDED NEW: style code for product details table
  style_code: "SNG-KRT-24386",
  // ADDED NEW: delivery info block
  delivery: {
    days: "2-3 Business Days",
    cod: true
  },
  ratings: {
    average_rating: 4.3,
    review_count: 312,
    
  }
}

// ─── Mock Ratings API Response ────────────────────────────────────────────────
// Separate endpoint: /api/products/:id/ratings
// Returns breakdown bars + user reviews.
const MOCK_RATINGS_API_RESPONSE = {
  product_id: 3,
  overall: 4.3,
  rating_count: 2847,
  review_count: 312,
  // Breakdown percentages per star level
  breakdown: [
    { label: "5 ★", pct: 55 },
    { label: "4 ★", pct: 22 },
    { label: "3 ★", pct: 12 },
    { label: "2 ★", pct: 6 },
    { label: "1 ★", pct: 5 }
  ],
  reviews: [
    {
      id: 1,
      user: "Priya M.",
      rating: 5,
      date: "Nov 2024",
      title: "Absolutely stunning!",
      body: "The embroidery work is exquisite and the fabric is super soft. Fits perfectly as a straight kurta. Highly recommend!",
      helpful: 42
    },
    {
      id: 2,
      user: "Ananya S.",
      rating: 4,
      date: "Oct 2024",
      title: "Good quality, great colour",
      body: "The navy blue is rich and deep, exactly as shown. Stitching quality is excellent. Slightly long but wearable.",
      helpful: 28
    },
    {
      id: 3,
      user: "Deepa R.",
      rating: 5,
      date: "Oct 2024",
      title: "Worth every rupee!",
      body: "Got compliments from everyone at the function. The thread work looks premium and doesn't feel cheap at all.",
      helpful: 19
    }
  ]
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * fetchProduct: Fetches and normalises product data.
 * All shape transformations live here so the component works
 * with a clean, predictable object regardless of API shape changes.
 */
async function fetchProduct(productId) {
  const res = await fetch(
    `https://products-api.chatoyantvortex.workers.dev/product?id=${productId}`
  )
  const raw = await res.json()

  const variant = raw.inventory.variants[0]

  // Images are just filenames — build full CDN URLs
  const allImages = [variant.main_image, ...variant.other_images]
  const images = allImages.map(
    (img) => `https://cdn.aarria.com/app/images/${img}`
  )

  const sizes = variant.sizes.map((s) => s.size)
  const availableSizes = variant.sizes
    .filter((s) => s.quantity > 0)
    .map((s) => s.size)

  // Real API nests description under description.description
  const desc = raw.description?.description ?? {}

  const details = {
    'Style Code': raw.style_code ?? '—',
    ...desc,
  }

  const discount = Math.round(
    ((raw.pricing.mrp - raw.pricing.sale_price) / raw.pricing.mrp) * 100
  )

  return {
    id: raw.product_id,
    brand: raw.brand.name,
    name: raw.title,
    category: raw.category.category_name,

    images,
    placeholderImages: images.map(
      (_, i) => `https://placehold.co/1080x1440/ec4899/ffffff?text=Image+${i + 1}`
    ),

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

    // Real API has no blurb/highlights — fallback gracefully
    description: raw.description?.product_blurb ?? raw.title,
    highlights: raw.description?.highlights ?? Object.entries(desc).map(([k, v]) => `${k}: ${v}`),
    details,

    // Real API has no delivery block — fallback
    deliveryInfo: raw.delivery ?? { days: '3-5 Business Days', cod: true },

    offers: [
      { icon: '💳', title: 'Bank Offer', desc: '10% off on HDFC Bank Credit Cards' },
      { icon: '🎁', title: 'Special Price', desc: 'Get extra 5% off (price inclusive of discount)' },
      { icon: '🔄', title: 'Easy Returns', desc: '30-day return policy. No questions asked.' },
    ],
  }
}

/**
 * fetchRatings: Separate endpoint for ratings breakdown + reviews.
 * Keeps the ratings data decoupled from core product data.
 */
async function fetchRatings(productId) {
  await new Promise((r) => setTimeout(r, 400))

  // In production: const res = await fetch(`/api/products/${productId}/ratings`)
  //                return res.json()
  return MOCK_RATINGS_API_RESPONSE
}

// ─── Full-screen Image Slider ─────────────────────────────────────────────────
function ImageSlider({ images, placeholderImages, initialIndex, onClose }) {
  const [current, setCurrent] = useState(initialIndex)
  const [imgErrors, setImgErrors] = useState({})

  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), [images.length])
  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length])

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [prev, next, onClose])

  const getImg = (i) =>
    imgErrors[i]
      ? placeholderImages[i] || `https://placehold.co/1080x1440/ec4899/ffffff?text=Image+${i + 1}`
      : images[i]

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.97)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', flexShrink: 0 }}>
        <span style={{ color: '#aaa', fontSize: 13 }}>{current + 1} / {images.length}</span>
        <button onClick={onClose} style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={20} />
        </button>
      </div>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ width: 88, flexShrink: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 6, padding: '0 12px 12px', scrollbarWidth: 'none' }}>
          {images.map((_, i) => {
            const src = imgErrors[i]
              ? placeholderImages[i] || `https://placehold.co/100x140/ec4899/ffffff?text=${i + 1}`
              : images[i]
            return (
              <button key={i} onClick={() => setCurrent(i)} style={{ width: 64, height: 86, flexShrink: 0, border: i === current ? '2px solid #ec4899' : '2px solid rgba(255,255,255,0.15)', borderRadius: 4, overflow: 'hidden', cursor: 'pointer', background: 'none', padding: 0, opacity: i === current ? 1 : 0.5, transition: 'all 0.15s' }}>
                <img src={src} alt='' onError={() => setImgErrors((e) => ({ ...e, [i]: true }))} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </button>
            )
          })}
        </div>
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
          <button onClick={prev} style={{ position: 'absolute', left: 12, zIndex: 10, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}><ChevronLeft size={22} /></button>
          <img key={current} src={getImg(current)} alt={`view ${current + 1}`} onError={() => setImgErrors((e) => ({ ...e, [current]: true }))} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain', display: 'block', animation: 'sliderFadeIn 0.2s ease' }} />
          <button onClick={next} style={{ position: 'absolute', right: 12, zIndex: 10, width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}><ChevronRight size={22} /></button>
        </div>
      </div>
      <style>{`@keyframes sliderFadeIn { from { opacity:0; transform:scale(0.98); } to { opacity:1; transform:scale(1); } }::-webkit-scrollbar { display: none; }`}</style>
    </div>
  )
}

// ─── Rating Bar ───────────────────────────────────────────────────────────────
function RatingBar({ label, pct }) {
  return (
    <div className='flex items-center gap-3 mb-1.5'>
      <span style={{ minWidth: 32, fontSize: 12, color: '#888' }}>{label}</span>
      <div className='flex-1 rounded-full overflow-hidden' style={{ height: 5, background: '#f0f0f0' }}>
        <div className='h-full rounded-full' style={{ width: `${pct}%`, background: pct > 50 ? '#10b981' : pct > 25 ? '#f59e0b' : '#f43f5e', transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ minWidth: 30, fontSize: 12, color: '#888', textAlign: 'right' }}>{pct}%</span>
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
        .pdp-breadcrumb { padding: 11px clamp(16px, 6%, 86px); font-size: 12px; color: #9ca3af; display: flex; gap: 6px; align-items: center; border-bottom: 1px solid #fff; background: #fff; max-width: 1440px; margin: 0 auto; box-sizing: border-box; width: 100%; }
        .pdp-outer { display: flex; align-items: flex-start; max-width: 1440px; margin: 0 auto; padding: 0 clamp(16px, 6%, 86px); }
        .pdp-images-col { width: 52%; min-width: 0; }
        .pdp-img-item { position: relative; width: 100%; aspect-ratio: 3 / 4; overflow: hidden; cursor: zoom-in; background: #f9f9f9; display: block; }
        .pdp-img-item + .pdp-img-item { margin-top: 2px; }
        .pdp-info-col { width: 48%; min-width: 0; position: sticky; top: 64px; height: calc(100vh - 64px); overflow-y: auto; padding: 0px 48px 48px 40px; border-left: 1px solid #f3f4f6; background: #fff; }
        .pdp-hr { height: 1px; background: #f3f4f6; margin: 20px 0; }
        .pdp-size-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .pdp-sizes { display: flex; flex-wrap: wrap; gap: 10px; }
        .pdp-size-btn { width: 56px; height: 56px; border-radius: 50%; border: 1.5px solid #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; transition: all 0.15s; background: #fff; font-family: 'DM Sans', sans-serif; }
        .pdp-cta { display: flex; gap: 10px; margin: 22px 0 18px; }
        .pdp-trust { display: flex; border: 1px solid #f3f4f6; border-radius: 8px; overflow: hidden; margin-bottom: 20px; }
        .pdp-trust-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px; padding: 14px 8px; border-right: 1px solid #f3f4f6; text-align: center; background: #fafafa; }
        .pdp-delivery { border: 1px solid #f3f4f6; border-radius: 8px; padding: 16px; margin-bottom: 20px; background: #fafafa; }
        .pdp-pincode-row { display: flex; gap: 8px; align-items: center; }
        .pdp-accordion { margin-top: 8px; }
        .pdp-accordion-item { border-top: 1px solid #f3f4f6; }
        .pdp-accordion-trigger { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; cursor: pointer; user-select: none; background: none; border: none; width: 100%; font-family: 'DM Sans', sans-serif; text-align: left; }
      `}</style>
      <div className="pdp-page">
        <Navbar />
        <div className="pdp-breadcrumb">
          {[40, 50, 70, 45, 60].map((w, i) => (
            <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div className="skeleton" style={{ width: w, height: 12 }} />
              {i < 4 && <span style={{ color: '#d1d5db' }}>›</span>}
            </span>
          ))}
        </div>
        <div className="pdp-outer">
          <div className="pdp-images-col">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="pdp-img-item">
                <div className="skeleton" style={{ width: '100%', height: '100%' }} />
              </div>
            ))}
          </div>
          <div className="pdp-info-col">
            <div style={{ marginBottom: 10 }}>
              <div className="skeleton" style={{ width: 160, height: 26, marginBottom: 6 }} />
              <div className="skeleton" style={{ width: '85%', height: 16, marginBottom: 4 }} />
              <div className="skeleton" style={{ width: '60%', height: 16 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
              <div className="skeleton" style={{ width: 42, height: 20, borderRadius: 4 }} />
              <div className="skeleton" style={{ width: 90, height: 14 }} />
              <div className="skeleton" style={{ width: 70, height: 14 }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginTop: 18 }}>
              <div className="skeleton" style={{ width: 100, height: 30 }} />
              <div className="skeleton" style={{ width: 60, height: 16 }} />
              <div className="skeleton" style={{ width: 70, height: 16 }} />
            </div>
            <div className="skeleton" style={{ width: 140, height: 11, marginTop: 4 }} />
            <div className="pdp-hr" />
            <div className="skeleton" style={{ width: 120, height: 14, marginBottom: 10 }} />
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 8, borderRadius: 8, background: '#fffbf5', border: '1px solid #fef3c7', marginBottom: 7 }}>
                <div className="skeleton" style={{ width: 18, height: 18, borderRadius: 4 }} />
                <div style={{ flex: 1 }}>
                  <div className="skeleton" style={{ width: 110, height: 13, marginBottom: 4 }} />
                  <div className="skeleton" style={{ width: '75%', height: 12 }} />
                </div>
              </div>
            ))}
            <div className="pdp-hr" />
            <div className="pdp-size-header">
              <div className="skeleton" style={{ width: 90, height: 14 }} />
              <div className="skeleton" style={{ width: 70, height: 14 }} />
            </div>
            <div className="pdp-sizes">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="pdp-size-btn">
                  <div className="skeleton" style={{ width: 20, height: 12 }} />
                </div>
              ))}
            </div>
            <div className="pdp-cta">
              <div className="skeleton" style={{ flex: 1, height: 54 }} />
              <div className="skeleton" style={{ width: 54, height: 54 }} />
            </div>
            <div className="pdp-trust">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="pdp-trust-item">
                  <div className="skeleton" style={{ width: 24, height: 24 }} />
                  <div className="skeleton" style={{ width: 70, height: 10 }} />
                </div>
              ))}
            </div>
            <div className="pdp-delivery">
              <div className="skeleton" style={{ width: 140, height: 14, marginBottom: 10 }} />
              <div className="pdp-pincode-row">
                <div className="skeleton" style={{ flex: 1, height: 36 }} />
                <div className="skeleton" style={{ width: 60, height: 36 }} />
              </div>
              <div className="skeleton" style={{ width: 220, height: 12, marginTop: 10 }} />
            </div>
            <div className="pdp-accordion">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="pdp-accordion-item">
                  <div className="pdp-accordion-trigger">
                    <div className="skeleton" style={{ width: 160, height: 14 }} />
                    <div className="skeleton" style={{ width: 16, height: 16 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Main Product Detail Page ─────────────────────────────────────────────────
export default function ProductDetail() {
  const { id:productId } = useParams()
  const [product, setProduct]             = useState(null)
  const [ratingsData, setRatingsData]     = useState(null)
  const [loading, setLoading]             = useState(true)
  const [sliderOpen, setSliderOpen]       = useState(false)
  const [sliderIndex, setSliderIndex]     = useState(0)
  const [selectedSize, setSelectedSize]   = useState(null)
  const [wishlist, setWishlist]           = useState(false)
  const [expandedSection, setExpandedSection] = useState('description')
  const [pincode, setPincode]             = useState('560001')
  const [imgErrors, setImgErrors]         = useState({})
  const [addedToBag, setAddedToBag]       = useState(false)

  useEffect(() => {
    setLoading(true)
    // Fire both API calls in parallel
    Promise.all([fetchProduct(productId), fetchRatings(productId)]).then(([prod, ratings]) => {
      setProduct(prod)
      setRatingsData(ratings)
      setLoading(false)
    })
  }, [productId])

  const openSlider = (index) => { setSliderIndex(index); setSliderOpen(true) }

  const handleAddToBag = () => {
    if (!selectedSize) return
    setAddedToBag(true)
    setTimeout(() => setAddedToBag(false), 2000)
  }

  const getImg = (index) => {
    if (!product) return ''
    return imgErrors[index]
      ? product.placeholderImages[index] || `https://placehold.co/1080x1440/ec4899/ffffff?text=Image+${index + 1}`
      : product.images[index]
  }

  if (loading) return <SkeletonLoader />

  // ── Accordion sections ──────────────────────────────────────────────────────
  // Product Description — driven by product.description (blurb) + product.highlights
  // Product Details     — driven by product.details (normalised from API description object)
  // Ratings & Reviews   — driven by ratingsData (separate API)
  const accordionSections = [
    {
      key: 'description',
      label: 'Product Description',
      content: (
        <>
          <p style={{ fontSize: 13.5, color: '#555', lineHeight: 1.75, marginBottom: 14 }}>
            {product.description}
          </p>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 8 }}>
            Product Highlights
          </p>
          <ul style={{ paddingLeft: 18, margin: 0 }}>
            {product.highlights.map((h, i) => (
              <li key={i} style={{ fontSize: 13.5, color: '#555', marginBottom: 5, lineHeight: 1.65 }}>{h}</li>
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
                <td style={{ padding: '7px 0', fontSize: 13, color: '#9ca3af', width: '42%', verticalAlign: 'top' }}>{k}</td>
                <td style={{ padding: '7px 0', fontSize: 13, color: '#374151', fontWeight: 500 }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    },
    {
      key: 'ratings',
      // Uses ratingsData.review_count from the separate ratings API
      label: `Ratings & Reviews (${ratingsData ? ratingsData.rating_count.toLocaleString() : '—'})`,
      content: ratingsData ? (
        <>
          <div style={{ display: 'flex', gap: 32, alignItems: 'center', marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid #fdf2f8' }}>
            <div style={{ textAlign: 'center', minWidth: 80 }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: '#1f2937', lineHeight: 1 }}>{ratingsData.overall}</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 6 }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={13} fill={s <= Math.round(ratingsData.overall) ? '#fbbf24' : 'none'} color='#fbbf24' />
                ))}
              </div>
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{ratingsData.rating_count.toLocaleString()} ratings</div>
            </div>
            <div style={{ flex: 1 }}>
              {ratingsData.breakdown.map((b) => (
                <RatingBar key={b.label} label={b.label} pct={b.pct} />
              ))}
            </div>
          </div>
          {ratingsData.reviews.map((r) => (
            <div key={r.id} style={{ paddingBottom: 16, marginBottom: 16, borderBottom: '1px solid #fdf2f8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', borderRadius: 10, padding: '2px 9px', fontSize: 12, fontWeight: 600 }}>
                  <Star size={10} fill='#fff' strokeWidth={0} /> {r.rating}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1f2937' }}>{r.title}</span>
              </div>
              <p style={{ fontSize: 13.5, color: '#6b7280', lineHeight: 1.65, margin: 0 }}>{r.body}</p>
              <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>
                {r.user} · {r.date} &nbsp;|&nbsp; {r.helpful} people found this helpful
              </p>
            </div>
          ))}
        </>
      ) : (
        <p style={{ fontSize: 13, color: '#9ca3af' }}>Loading ratings…</p>
      ),
    },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .pdp-page { min-height: 100vh; background: #fff; font-family: 'DM Sans', sans-serif; color: #1f2937; }
        .pdp-breadcrumb { padding: 11px clamp(16px, 6%, 86px); font-size: 12px; color: #9ca3af; display: flex; gap: 6px; align-items: center; border-bottom: 1px solid #fff; background: #fff; max-width: 1440px; margin: 0 auto; box-sizing: border-box; width: 100%; }
        .pdp-breadcrumb a { color: #9ca3af; text-decoration: none; }
        .pdp-breadcrumb a:hover { color: #ec4899; }
        .pdp-breadcrumb-sep { color: #d1d5db; font-size: 10px; }
        .pdp-breadcrumb-current { color: #374151; font-weight: 500; }
        .pdp-outer { display: flex; align-items: flex-start; max-width: 1440px; margin: 0 auto; padding: 0 clamp(16px, 6%, 86px); }
        .pdp-images-col { width: 52%; min-width: 0; }
        .pdp-img-item { position: relative; width: 100%; aspect-ratio: 3 / 4; overflow: hidden; cursor: zoom-in; background: #f9f9f9; display: block; }
        .pdp-img-item + .pdp-img-item { margin-top: 2px; }
        .pdp-img-item img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
        .pdp-img-item:hover img { transform: scale(1.04); }
        .pdp-img-zoom-badge { position: absolute; bottom: 14px; right: 14px; background: rgba(255,255,255,0.92); border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; box-shadow: 0 2px 10px rgba(0,0,0,0.12); }
        .pdp-img-item:hover .pdp-img-zoom-badge { opacity: 1; }
        .pdp-img-counter { position: absolute; top: 14px; right: 14px; background: rgba(255,255,255,0.88); backdrop-filter: blur(4px); border-radius: 20px; padding: 3px 10px; font-size: 11px; font-weight: 600; color: #374151; }
        .pdp-info-col { width: 48%; min-width: 0; position: sticky; top: 64px; height: calc(100vh - 64px); overflow-y: auto; padding: 0px 48px 48px 40px; border-left: 1px solid #f3f4f6; background: #fff; scrollbar-width: thin; scrollbar-color: #fce7f3 transparent; }
        .pdp-info-col::-webkit-scrollbar { width: 4px; }
        .pdp-info-col::-webkit-scrollbar-thumb { background: #fce7f3; border-radius: 4px; }
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
        .pdp-offer-row { display: flex; align-items: flex-start; gap: 10px; padding: 8px 12px; border-radius: 8px; background: #fffbf5; border: 1px solid #fef3c7; margin-bottom: 7px; }
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
        @media (max-width: 900px) { .pdp-outer { flex-direction: column; padding: 0; } .pdp-images-col { width: 100%; } .pdp-info-col { width: 100%; position: static; height: auto; padding: 20px 16px 40px; border-left: none; border-top: 1px solid #f3f4f6; } .pdp-breadcrumb { padding: 10px 16px; } }
      `}</style>

      <div className='pdp-page'>
        <Navbar />

        {/* Breadcrumb — category comes from API */}
        <div className='pdp-breadcrumb'>
          <a href='#'>Home</a>
          <span className='pdp-breadcrumb-sep'>›</span>
          <a href='#'>Women</a>
          <span className='pdp-breadcrumb-sep'>›</span>
          <a href='#'>Ethnic Wear</a>
          <span className='pdp-breadcrumb-sep'>›</span>
          <a href='#'>{product.category}</a>
          <span className='pdp-breadcrumb-sep'>›</span>
          <span className='pdp-breadcrumb-current'>{product.brand}</span>
        </div>

        <div className='pdp-outer'>

          {/* ─ LEFT: vertical image stack — images from API variant ─ */}
          <div className='pdp-images-col'>
            {product.images.map((img, i) => (
              <div key={i} className='pdp-img-item' onClick={() => openSlider(i)}>
                <img
                  src={getImg(i)}
                  alt={`${product.name} — view ${i + 1}`}
                  onError={() => setImgErrors((e) => ({ ...e, [i]: true }))}
                />
                {i === 0 && <div className='pdp-img-counter'>1 / {product.images.length}</div>}
                <div className='pdp-img-zoom-badge'><ZoomIn size={16} color='#ec4899' /></div>
              </div>
            ))}
          </div>

          {/* ─ RIGHT: sticky info panel ─ */}
          <div className='pdp-info-col'>

            {/* Brand (from API brand.name) + product title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, paddingRight: 16 }}>
                <div className='pdp-brand-name'>{product.brand}</div>
                <div className='pdp-product-subtitle'>{product.name}</div>
              </div>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0 }}>
                <Share2 size={18} color='#9ca3af' />
              </button>
            </div>

            {/* Rating — from fetchProduct (which reads ratings from product API) */}
            <div className='pdp-rating-row'>
              <span className='pdp-rating-pill'><Star size={11} fill='#fff' strokeWidth={0} /> {product.rating}</span>
              <span className='pdp-rating-sep'>|</span>
              <span className='pdp-rating-meta'>{product.ratingCount.toLocaleString()} Ratings</span>
              <span className='pdp-rating-sep'>|</span>
              <span className='pdp-rating-meta'>{product.reviewCount} Reviews</span>
            </div>

            {/* Price — from API pricing block */}
            <div className='pdp-price-row'>
              <span className='pdp-price'>₹{product.price.toLocaleString()}</span>
              <span className='pdp-mrp'>₹{product.mrp.toLocaleString()}</span>
              <span className='pdp-discount'>({product.discount}% OFF)</span>
            </div>
            <div className='pdp-tax'>inclusive of all taxes</div>

            <div className='pdp-hr' />

            {/* Offers — static, intentionally not API-driven */}
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

            {/* Size selector — sizes & availability from API inventory.variants[].sizes */}
            <div className='pdp-size-header'>
              <span className='pdp-section-label'>Select Size</span>
              <span className='pdp-size-guide'>Size Guide</span>
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
            {!selectedSize && <div className='pdp-size-warn'>Please select a size to continue</div>}

            {/* CTA */}
            <div className='pdp-cta'>
              <button
                className={`pdp-btn-bag ${addedToBag ? 'added' : ''}`}
                onClick={handleAddToBag}
                disabled={!selectedSize}
              >
                <ShoppingBag size={18} />
                {addedToBag ? '✓ Added to Bag' : 'Add to Bag'}
              </button>
              <button
                className={`pdp-btn-wishlist ${wishlist ? 'active' : ''}`}
                onClick={() => setWishlist((w) => !w)}
              >
                <Heart size={20} color={wishlist ? '#ec4899' : '#6b7280'} fill={wishlist ? '#ec4899' : 'none'} />
              </button>
            </div>

            {/* Trust badges — static */}
            <div className='pdp-trust'>
              <div className='pdp-trust-item'><Truck size={18} color='#10b981' /><span className='pdp-trust-label'>Free Delivery</span></div>
              <div className='pdp-trust-item'><RefreshCw size={18} color='#f59e0b' /><span className='pdp-trust-label'>30-Day Returns</span></div>
              <div className='pdp-trust-item'><Shield size={18} color='#8b5cf6' /><span className='pdp-trust-label'>100% Genuine</span></div>
            </div>

            {/* Delivery — days & COD from API delivery block */}
            <div className='pdp-delivery'>
              <div className='pdp-delivery-title'><Truck size={14} color='#ec4899' />Delivery Options</div>
              <div className='pdp-pincode-row'>
                <input
                  className='pdp-pincode-input'
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder='Enter pincode'
                  maxLength={6}
                />
                <button className='pdp-pincode-btn'>Check</button>
              </div>
              <div className='pdp-delivery-ok'>
                ✓ Estimated delivery in {product.deliveryInfo.days}
                {product.deliveryInfo.cod && ' · COD available'}
              </div>
            </div>

            {/* Accordion — description & details from product API; ratings from ratings API */}
            <div className='pdp-accordion'>
              {accordionSections.map((sec) => (
                <div key={sec.key} className='pdp-accordion-item'>
                  <button
                    className='pdp-accordion-trigger'
                    onClick={() => setExpandedSection(expandedSection === sec.key ? null : sec.key)}
                  >
                    <span className='pdp-accordion-label'>{sec.label}</span>
                    {expandedSection === sec.key
                      ? <ChevronUp size={16} color='#ec4899' />
                      : <ChevronDown size={16} color='#9ca3af' />
                    }
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

      {/* Image slider modal */}
      {sliderOpen && (
        <ImageSlider
          images={product.images}
          placeholderImages={product.placeholderImages}
          initialIndex={sliderIndex}
          onClose={() => setSliderOpen(false)}
        />
      )}

      {/* Toast */}
      {addedToBag && <div className='pdp-toast'>✓ Added to your bag!</div>}
    </>
  )
}
