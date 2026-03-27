import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";

// ─── Navbar (from ProductsListing) ───────────────────────────────────────────
const Navbar = ({ cartCount = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const menuItems = [
    {
      name: "Sarees",
      submenu: [
        "Silk Sarees",
        "Cotton Sarees",
        "Designer Sarees",
        "Banarasi Sarees",
        "Kanjivaram Sarees",
      ],
    },
    {
      name: "Lehengas",
      submenu: [
        "Bridal Lehengas",
        "Party Wear",
        "Designer Lehengas",
        "Silk Lehengas",
      ],
    },
    {
      name: "Suits",
      submenu: [
        "Anarkali Suits",
        "Palazzo Suits",
        "Salwar Suits",
        "Churidar Suits",
      ],
    },
    {
      name: "Kurtis",
      submenu: [
        "Cotton Kurtis",
        "Designer Kurtis",
        "Printed Kurtis",
        "Long Kurtis",
      ],
    },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50 border-b border-pink-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: hamburger + logo */}
          <div className="flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden mr-4 text-gray-700 hover:text-pink-600 transition"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <a href="/">
              {/* Inline SVG logo — same pink-brand feel as the listing page */}
              <svg
                width="120"
                height="40"
                viewBox="0 0 120 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Aarria logo"
              >
                <text
                  x="0"
                  y="30"
                  fontFamily="'Playfair Display', Georgia, serif"
                  fontWeight="700"
                  fontSize="26"
                  fill="#ec4899"
                  letterSpacing="-1"
                >
                  aarria
                </text>
                {/* small decorative dot accent */}
                <circle cx="112" cy="10" r="4" fill="#fb7185" />
              </svg>
            </a>
          </div>

          {/* Center: desktop menu */}
          <div className="hidden md:flex space-x-6 relative">
            {menuItems.map((item) => (
              <div
                key={item.name}
                className="relative"
                onMouseEnter={() => setActiveMenu(item.name)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button className="text-gray-700 hover:text-pink-600 transition font-medium flex items-center gap-1 text-sm">
                  {item.name}
                  <ChevronDown size={14} />
                </button>

                {activeMenu === item.name && (
                  <div className="absolute top-full left-0 mt-2 bg-white shadow-xl rounded-xl py-2 min-w-48 border border-pink-100 z-50">
                    {item.submenu.map((sub) => (
                      <a
                        key={sub}
                        href="#"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition"
                      >
                        {sub}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <a
              href="#"
              className="text-pink-600 hover:text-pink-700 transition font-bold text-sm"
            >
              Sale
            </a>
          </div>

          {/* Right: icons */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-700 hover:text-pink-600 transition">
              <Search size={20} />
            </button>
            <button className="text-gray-700 hover:text-pink-600 transition">
              <Heart size={20} />
            </button>
            <button className="text-gray-700 hover:text-pink-600 transition">
              <User size={20} />
            </button>
            <button className="relative text-gray-700 hover:text-pink-600 transition">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-pink-100">
          <div className="px-4 pt-2 pb-3 space-y-1 bg-pink-50/50">
            {menuItems.map((item) => (
              <div key={item.name}>
                <a
                  href="#"
                  className="block px-3 py-2 text-gray-700 hover:bg-pink-100 rounded font-medium text-sm"
                >
                  {item.name}
                </a>
              </div>
            ))}
            <a
              href="#"
              className="block px-3 py-2 text-pink-600 hover:bg-pink-100 rounded font-bold text-sm"
            >
              Sale
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

// ─── Hardcoded Product Data ───────────────────────────────────────────────────
const HARDCODED_PRODUCT = {
  id: "24386974",
  brand: "Sangria",
  name: "Navy Blue Ethnic Motifs Embroidered Thread Work Straight Kurta",
  category: "Kurtas",
  gender: "Women",
  price: 1199,
  mrp: 2999,
  discount: 60,
  rating: 4.3,
  ratingCount: 2847,
  reviewCount: 312,
  images: [
    "https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/24386974/2023/9/27/0e0da4f4-2a8e-4c57-8e4c-0cf5f1e8d2721695820823989-Sangria-Women-Kurtas-5691695820823568-1.jpg",
    "https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/24386974/2023/9/27/2b3e4f9a-1c7d-4e82-9f3a-1ab2c3d4e5f61695820823989-Sangria-Women-Kurtas-5691695820823568-2.jpg",
    "https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/24386974/2023/9/27/3c4f5a6b-2d8e-4f93-0a4b-2bc3d4e5f6a71695820823989-Sangria-Women-Kurtas-5691695820823568-3.jpg",
    "https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/24386974/2023/9/27/4d5e6b7c-3e9f-4a04-1b5c-3cd4e5f6a7b81695820823989-Sangria-Women-Kurtas-5691695820823568-4.jpg",
    "https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/24386974/2023/9/27/5e6f7c8d-4f0a-4b15-2c6d-4de5f6a7b8c91695820823989-Sangria-Women-Kurtas-5691695820823568-5.jpg",
    "https://assets.myntassets.com/h_1440,q_100,w_1080/v1/assets/images/24386974/2023/9/27/6f7a8d9e-5a1b-4c26-3d7e-5ef6a7b8c9d01695820823989-Sangria-Women-Kurtas-5691695820823568-6.jpg",
  ],
  placeholderImages: [
    "https://placehold.co/1080x1440/ec4899/ffffff?text=Kurta+1",
    "https://placehold.co/1080x1440/f43f5e/ffffff?text=Kurta+2",
    "https://placehold.co/1080x1440/db2777/ffffff?text=Kurta+3",
    "https://placehold.co/1080x1440/be185d/ffffff?text=Kurta+4",
    "https://placehold.co/1080x1440/ec4899/ffffff?text=Kurta+5",
    "https://placehold.co/1080x1440/f43f5e/ffffff?text=Kurta+6",
  ],
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  availableSizes: ["S", "M", "L", "XL"],
  colors: [
    { name: "Navy Blue", hex: "#1a237e", active: true },
    { name: "Maroon", hex: "#7b1fa2", active: false },
    { name: "Teal", hex: "#00695c", active: false },
  ],
  details: {
    "Style Code": "SNG-KRT-24386",
    Occasion: "Ethnic, Casual",
    "Fabric Care": "Gentle Machine Wash / Hand Wash",
    Neck: "V-Neck",
    Sleeve: "Three-Quarter Sleeves",
    Pattern: "Embroidered",
    "Length Type": "Regular",
    "Fit Type": "Straight",
    Fabric: "Viscose Rayon",
    Color: "Navy Blue",
    "Country of Origin": "India",
  },
  description:
    "Crafted from premium viscose rayon, this Sangria kurta features intricate ethnic motif embroidery with detailed thread work at the yoke and hem. The straight silhouette drapes elegantly for any ethnic occasion, pairing beautifully with churidar or palazzo bottoms.",
  highlights: [
    "Premium Viscose Rayon fabric",
    "Intricate ethnic motif embroidery",
    "Thread work detailing at yoke & hem",
    "Straight fit silhouette",
    "Three-quarter sleeves",
    "V-neck with button detail",
  ],
  deliveryInfo: { pincode: "560001", days: "2-3 Business Days", cod: true },
  offers: [
    { icon: "💳", title: "Bank Offer", desc: "10% off on HDFC Bank Credit Cards" },
    { icon: "🎁", title: "Special Price", desc: "Get extra 5% off (price inclusive of discount)" },
    { icon: "🔄", title: "Easy Returns", desc: "30-day return policy. No questions asked." },
  ],
  ratings: {
    overall: 4.3,
    breakdown: [
      { label: "5 ★", pct: 55 },
      { label: "4 ★", pct: 22 },
      { label: "3 ★", pct: 12 },
      { label: "2 ★", pct: 6 },
      { label: "1 ★", pct: 5 },
    ],
  },
  reviews: [
    { id: 1, user: "Priya M.", rating: 5, date: "Nov 2024", title: "Absolutely stunning!", body: "The embroidery work is exquisite and the fabric is super soft. Fits perfectly as a straight kurta. Highly recommend!", helpful: 42 },
    { id: 2, user: "Ananya S.", rating: 4, date: "Oct 2024", title: "Good quality, great colour", body: "The navy blue is rich and deep, exactly as shown. Stitching quality is excellent. Slightly long but wearable.", helpful: 28 },
    { id: 3, user: "Deepa R.", rating: 5, date: "Oct 2024", title: "Worth every rupee!", body: "Got compliments from everyone at the function. The thread work looks premium and doesn't feel cheap at all.", helpful: 19 },
  ],
};

async function fetchProduct(productId) {
  await new Promise((r) => setTimeout(r, 600));
  return HARDCODED_PRODUCT;
}

// ─── Image Slider ─────────────────────────────────────────────────────────────
function ImageSlider({ images, placeholderImages, initialIndex, onClose }) {
  const [current, setCurrent] = useState(initialIndex);
  const [imgErrors, setImgErrors] = useState({});

  const prev = useCallback(() => setCurrent((c) => (c - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % images.length), [images.length]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [prev, next, onClose]);

  const getImageSrc = (index) =>
    imgErrors[index]
      ? placeholderImages[index] || `https://placehold.co/1080x1440/ec4899/ffffff?text=Image+${index + 1}`
      : images[index];

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: "rgba(0,0,0,0.96)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <span style={{ color: "#aaa", fontSize: 14 }}>
          {current + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="flex items-center justify-center rounded-full transition-all hover:bg-white/20"
          style={{ width: 40, height: 40, background: "rgba(255,255,255,0.1)", color: "#fff" }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Main image */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        <button
          onClick={prev}
          className="absolute left-4 z-10 flex items-center justify-center rounded-full transition-all hover:scale-110"
          style={{ width: 48, height: 48, background: "rgba(255,255,255,0.15)", color: "#fff", backdropFilter: "blur(4px)" }}
        >
          <ChevronLeft size={24} />
        </button>

        <div className="relative flex items-center justify-center" style={{ height: "calc(100vh - 180px)", width: "100%" }}>
          <img
            key={current}
            src={getImageSrc(current)}
            alt={`Product view ${current + 1}`}
            onError={() => setImgErrors((e) => ({ ...e, [current]: true }))}
            className="object-contain rounded"
            style={{ maxHeight: "100%", maxWidth: "min(500px, 90vw)", animation: "sliderFadeIn 0.25s ease" }}
          />
        </div>

        <button
          onClick={next}
          className="absolute right-4 z-10 flex items-center justify-center rounded-full transition-all hover:scale-110"
          style={{ width: 48, height: 48, background: "rgba(255,255,255,0.15)", color: "#fff", backdropFilter: "blur(4px)" }}
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Thumbnail strip */}
      <div className="flex justify-center gap-2 py-4 overflow-x-auto px-4">
        {images.map((img, i) => {
          const thumbSrc = imgErrors[i] ? (placeholderImages[i] || `https://placehold.co/100x140/ec4899/ffffff?text=${i + 1}`) : img;
          return (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="flex-shrink-0 rounded overflow-hidden transition-all"
              style={{
                width: 56, height: 76,
                border: i === current ? "2px solid #ec4899" : "2px solid transparent",
                opacity: i === current ? 1 : 0.55,
              }}
            >
              <img src={thumbSrc} alt="" onError={() => setImgErrors((e) => ({ ...e, [i]: true }))} className="w-full h-full object-cover" />
            </button>
          );
        })}
      </div>

      <style>{`
        @keyframes sliderFadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// ─── Rating Bar ───────────────────────────────────────────────────────────────
function RatingBar({ label, pct }) {
  return (
    <div className="flex items-center gap-2 mb-1">
      <span style={{ minWidth: 30, fontSize: 12, color: "#888" }}>{label}</span>
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: "#f0f0f0" }}>
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            background: pct > 50 ? "#10b981" : pct > 25 ? "#f59e0b" : "#f43f5e",
          }}
        />
      </div>
      <span style={{ minWidth: 28, fontSize: 12, color: "#888", textAlign: "right" }}>{pct}%</span>
    </div>
  );
}

// ─── Main Product Detail Page ─────────────────────────────────────────────────
export default function ProductDetail({ productId = "24386974" }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [sliderIndex, setSliderIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [wishlist, setWishlist] = useState(false);
  const [expandedSection, setExpandedSection] = useState("description");
  const [pincode, setPincode] = useState("560001");
  const [imgErrors, setImgErrors] = useState({});
  const [addedToBag, setAddedToBag] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchProduct(productId).then((data) => {
      setProduct(data);
      setLoading(false);
    });
  }, [productId]);

  const openSlider = (index) => { setSliderIndex(index); setSliderOpen(true); };

  const handleAddToBag = () => {
    if (!selectedSize) return;
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 2000);
  };

  const getImageSrc = (index) => {
    if (!product) return "";
    return imgErrors[index]
      ? product.placeholderImages[index] || `https://placehold.co/1080x1440/ec4899/ffffff?text=Image+${index + 1}`
      : product.images[index];
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50">
        <Navbar />
        <div className="flex items-center justify-center" style={{ minHeight: "calc(100vh - 64px)" }}>
          <div className="text-center">
            <div
              className="mx-auto mb-4 rounded-full"
              style={{
                width: 48, height: 48,
                border: "3px solid #ec4899",
                borderTopColor: "transparent",
                animation: "spin 0.7s linear infinite",
              }}
            />
            <p className="text-gray-400 text-sm">Loading product…</p>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const images = product.images;
  const imageRows = [];
  for (let i = 0; i < images.length; i += 2) imageRows.push(images.slice(i, i + 2).map((_, j) => i + j));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Playfair+Display:wght@600;700&display=swap');
        * { box-sizing: border-box; }

        .pdp-root { max-width: 1280px; margin: 0 auto; background: #fff; font-family: 'DM Sans', sans-serif; }

        /* Breadcrumb — matches listing page soft-pink palette */
        .pdp-breadcrumb {
          padding: 10px 24px;
          font-size: 12px;
          color: #9ca3af;
          display: flex;
          gap: 6px;
          align-items: center;
          border-bottom: 1px solid #fce7f3;
          background: #fff7f8;
        }
        .pdp-breadcrumb a { color: #9ca3af; text-decoration: none; transition: color 0.15s; }
        .pdp-breadcrumb a:hover { color: #ec4899; }
        .pdp-breadcrumb-sep { color: #f9a8d4; }
        .pdp-breadcrumb-current { color: #374151; font-weight: 500; }

        /* Layout */
        .pdp-layout { display: flex; gap: 0; align-items: flex-start; }

        /* Image column */
        .pdp-images { width: 55%; position: relative; }
        .pdp-image-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; }
        .pdp-image-cell {
          position: relative; overflow: hidden; cursor: zoom-in;
          aspect-ratio: 3/4; background: #fdf2f8;
        }
        .pdp-image-cell img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.5s ease;
        }
        .pdp-image-cell:hover img { transform: scale(1.05); }
        .pdp-zoom-icon {
          position: absolute; top: 10px; right: 10px;
          background: rgba(255,255,255,0.9); border-radius: 50%;
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
          opacity: 0; transition: opacity 0.2s; pointer-events: none;
          box-shadow: 0 2px 8px rgba(236,72,153,0.15);
        }
        .pdp-image-cell:hover .pdp-zoom-icon { opacity: 1; }

        /* Info panel */
        .pdp-info {
          width: 45%; padding: 28px 32px;
          position: sticky; top: 64px;
          align-self: flex-start;
          height: calc(100vh - 64px);
          overflow-y: auto;
        }
        .pdp-info::-webkit-scrollbar { width: 3px; }
        .pdp-info::-webkit-scrollbar-thumb { background: #fce7f3; border-radius: 2px; }

        /* Brand & name */
        .pdp-brand { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #1f2937; }
        .pdp-product-name { font-size: 14px; color: #6b7280; margin: 4px 0 14px; line-height: 1.5; }

        /* Rating — matching listing green badge style */
        .pdp-rating-pill {
          display: inline-flex; align-items: center; gap: 4px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff; border-radius: 20px;
          padding: 3px 10px; font-size: 12px; font-weight: 600;
        }
        .pdp-rating-count { font-size: 12px; color: #9ca3af; margin-left: 8px; }

        /* Price — pink accent matching listing page */
        .pdp-price-row { display: flex; align-items: baseline; gap: 12px; margin: 16px 0 4px; }
        .pdp-price-current { font-size: 28px; font-weight: 700; color: #ec4899; }
        .pdp-price-mrp { font-size: 16px; color: #d1d5db; text-decoration: line-through; }
        .pdp-price-discount { font-size: 14px; color: #f59e0b; font-weight: 700; }
        .pdp-tax-note { font-size: 11px; color: #9ca3af; }

        /* Divider */
        .pdp-divider { height: 1px; background: #fce7f3; margin: 20px 0; }

        /* Offers */
        .pdp-offer-item { display: flex; gap: 10px; align-items: flex-start; padding: 8px 0; border-bottom: 1px solid #fdf2f8; }
        .pdp-offer-icon { font-size: 16px; }
        .pdp-offer-title { font-size: 13px; font-weight: 600; color: #374151; }
        .pdp-offer-desc { font-size: 12px; color: #6b7280; }

        /* Section label */
        .pdp-section-label { font-size: 12px; font-weight: 700; color: #374151; margin: 18px 0 10px; text-transform: uppercase; letter-spacing: 0.6px; }

        /* Sizes — reuse listing button feel */
        .pdp-size-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .pdp-size-btn {
          width: 52px; height: 52px; border-radius: 50%;
          border: 1.5px solid #e5e7eb;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 500; color: #374151;
          cursor: pointer; transition: all 0.15s; background: #fff;
        }
        .pdp-size-btn:hover:not(.pdp-size-disabled) { border-color: #ec4899; color: #ec4899; }
        .pdp-size-btn.pdp-size-selected { border-color: #ec4899; color: #ec4899; background: #fff1f5; font-weight: 700; box-shadow: 0 0 0 3px #fce7f3; }
        .pdp-size-btn.pdp-size-disabled { opacity: 0.3; cursor: not-allowed; border-style: dashed; }
        .pdp-size-warn { font-size: 12px; color: #f59e0b; margin-top: 6px; font-weight: 500; }

        /* CTA — matching listing gradient button */
        .pdp-cta-row { display: flex; gap: 10px; margin: 20px 0; }
        .pdp-btn-bag {
          flex: 1; height: 52px; border: none; border-radius: 12px;
          font-size: 15px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #ec4899, #f43f5e);
          color: #fff; transition: all 0.2s;
          text-transform: uppercase; letter-spacing: 0.5px;
          box-shadow: 0 4px 14px rgba(236, 72, 153, 0.35);
        }
        .pdp-btn-bag:hover:not(:disabled) {
          background: linear-gradient(135deg, #db2777, #e11d48);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(236, 72, 153, 0.45);
        }
        .pdp-btn-bag:disabled { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; box-shadow: none; }
        .pdp-btn-bag.pdp-btn-added { background: linear-gradient(135deg, #10b981, #059669); box-shadow: 0 4px 14px rgba(16,185,129,0.35); }
        .pdp-btn-wishlist {
          width: 52px; height: 52px; border-radius: 12px;
          border: 1.5px solid #e5e7eb;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; background: #fff; transition: all 0.2s;
        }
        .pdp-btn-wishlist:hover { border-color: #ec4899; background: #fff1f5; }
        .pdp-btn-wishlist.pdp-wishlist-active { border-color: #ec4899; background: #fff1f5; }

        /* Trust badges — card row matching listing card style */
        .pdp-trust-row {
          display: flex; gap: 0;
          border: 1px solid #fce7f3; border-radius: 12px; overflow: hidden; margin: 16px 0;
          background: #fff7f8;
        }
        .pdp-trust-item {
          flex: 1; display: flex; flex-direction: column; align-items: center; gap: 5px;
          padding: 12px 8px; border-right: 1px solid #fce7f3; text-align: center;
        }
        .pdp-trust-item:last-child { border-right: none; }
        .pdp-trust-label { font-size: 11px; color: #6b7280; font-weight: 500; }

        /* Delivery box */
        .pdp-delivery-box {
          border: 1px solid #fce7f3; border-radius: 12px;
          padding: 14px 16px; margin: 14px 0; background: #fff7f8;
        }
        .pdp-pincode-row { display: flex; gap: 8px; align-items: center; margin-top: 8px; }
        .pdp-pincode-input {
          flex: 1; border: 1px solid #f9a8d4; border-radius: 8px;
          padding: 8px 12px; font-size: 13px; outline: none;
          font-family: 'DM Sans', sans-serif; background: #fff;
          transition: border-color 0.15s;
        }
        .pdp-pincode-input:focus { border-color: #ec4899; }
        .pdp-pincode-btn {
          background: none; border: none; color: #ec4899;
          font-size: 13px; font-weight: 700; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }
        .pdp-delivery-ok { font-size: 12px; color: #10b981; font-weight: 500; margin-top: 8px; }

        /* Accordion */
        .pdp-accordion-item { border-top: 1px solid #fce7f3; }
        .pdp-accordion-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 0; cursor: pointer; user-select: none;
        }
        .pdp-accordion-label { font-size: 14px; font-weight: 600; color: #374151; }
        .pdp-accordion-body { padding-bottom: 16px; }

        /* Details table */
        .pdp-details-table { width: 100%; border-collapse: collapse; }
        .pdp-details-table tr td { padding: 6px 0; font-size: 13px; vertical-align: top; }
        .pdp-details-table tr td:first-child { color: #9ca3af; width: 45%; }
        .pdp-details-table tr td:last-child { color: #374151; font-weight: 500; }

        /* Review card */
        .pdp-review-card { padding: 14px 0; border-bottom: 1px solid #fdf2f8; }
        .pdp-review-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
        .pdp-review-rating {
          display: flex; align-items: center; gap: 3px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff; border-radius: 10px; padding: 2px 8px;
          font-size: 12px; font-weight: 600;
        }
        .pdp-review-title { font-size: 14px; font-weight: 600; color: #1f2937; }
        .pdp-review-body { font-size: 13px; color: #6b7280; line-height: 1.6; }
        .pdp-review-meta { font-size: 11px; color: #9ca3af; margin-top: 6px; }

        /* Toast */
        .pdp-toast {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          background: linear-gradient(135deg, #ec4899, #f43f5e);
          color: #fff; padding: 12px 28px; border-radius: 24px;
          font-size: 14px; font-weight: 600; z-index: 100;
          box-shadow: 0 8px 24px rgba(236,72,153,0.4);
          animation: toastIn 0.3s ease;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }

        @media (max-width: 768px) {
          .pdp-layout { flex-direction: column; }
          .pdp-images, .pdp-info { width: 100%; }
          .pdp-info { position: static; height: auto; padding: 16px; }
        }
      `}</style>

      {/* ── Background gradient matching listing page ── */}
      <div className="min-h-screen bg-gradient-to-b from-white to-pink-50">
        {/* Navbar from listing page */}
        <Navbar />

        <div className="pdp-root">
          {/* Breadcrumb */}
          <div className="pdp-breadcrumb">
            <a href="#">Home</a>
            <span className="pdp-breadcrumb-sep">›</span>
            <a href="#">Women</a>
            <span className="pdp-breadcrumb-sep">›</span>
            <a href="#">Ethnic Wear</a>
            <span className="pdp-breadcrumb-sep">›</span>
            <a href="#">Kurtas</a>
            <span className="pdp-breadcrumb-sep">›</span>
            <span className="pdp-breadcrumb-current">{product.brand}</span>
          </div>

          {/* Main layout */}
          <div className="pdp-layout">
            {/* ── Images ── */}
            <div className="pdp-images">
              <div className="pdp-image-grid">
                {imageRows.map((row) =>
                  row.map((imgIdx) => (
                    <div key={imgIdx} className="pdp-image-cell" onClick={() => openSlider(imgIdx)}>
                      <img
                        src={getImageSrc(imgIdx)}
                        alt={`${product.name} - view ${imgIdx + 1}`}
                        onError={() => setImgErrors((e) => ({ ...e, [imgIdx]: true }))}
                      />
                      <div className="pdp-zoom-icon">
                        <ZoomIn size={15} color="#ec4899" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* ── Info panel ── */}
            <div className="pdp-info">
              {/* Brand + share */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div className="pdp-brand">{product.brand}</div>
                  <div className="pdp-product-name">{product.name}</div>
                </div>
                <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                  <Share2 size={18} color="#9ca3af" />
                </button>
              </div>

              {/* Rating */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <span className="pdp-rating-pill">
                  <Star size={11} fill="#fff" strokeWidth={0} /> {product.rating}
                </span>
                <span className="pdp-rating-count">
                  {product.ratingCount.toLocaleString()} Ratings & {product.reviewCount} Reviews
                </span>
              </div>

              {/* Price */}
              <div className="pdp-price-row">
                <span className="pdp-price-current">₹{product.price.toLocaleString()}</span>
                <span className="pdp-price-mrp">₹{product.mrp.toLocaleString()}</span>
                <span className="pdp-price-discount">{product.discount}% OFF</span>
              </div>
              <div className="pdp-tax-note">inclusive of all taxes</div>

              <div className="pdp-divider" />

              {/* Offers */}
              <div>
                {product.offers.map((o, i) => (
                  <div key={i} className="pdp-offer-item">
                    <span className="pdp-offer-icon">{o.icon}</span>
                    <div>
                      <div className="pdp-offer-title">{o.title}</div>
                      <div className="pdp-offer-desc">{o.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pdp-divider" />

              {/* Size selector */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="pdp-section-label" style={{ margin: "0 0 10px" }}>Select Size</div>
                  <span style={{ fontSize: 12, color: "#ec4899", fontWeight: 700, cursor: "pointer" }}>Size Guide</span>
                </div>
                <div className="pdp-size-grid">
                  {product.sizes.map((s) => {
                    const available = product.availableSizes.includes(s);
                    return (
                      <button
                        key={s}
                        className={`pdp-size-btn ${!available ? "pdp-size-disabled" : ""} ${selectedSize === s ? "pdp-size-selected" : ""}`}
                        onClick={() => available && setSelectedSize(s)}
                        disabled={!available}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
                {!selectedSize && <p className="pdp-size-warn">Please select a size</p>}
              </div>

              {/* CTA */}
              <div className="pdp-cta-row">
                <button
                  className={`pdp-btn-bag ${addedToBag ? "pdp-btn-added" : ""}`}
                  onClick={handleAddToBag}
                  disabled={!selectedSize}
                >
                  <ShoppingBag size={18} />
                  {addedToBag ? "✓ Added to Bag" : "Add to Bag"}
                </button>
                <button
                  className={`pdp-btn-wishlist ${wishlist ? "pdp-wishlist-active" : ""}`}
                  onClick={() => setWishlist((w) => !w)}
                >
                  <Heart size={20} color={wishlist ? "#ec4899" : "#6b7280"} fill={wishlist ? "#ec4899" : "none"} />
                </button>
              </div>

              {/* Trust badges */}
              <div className="pdp-trust-row">
                <div className="pdp-trust-item">
                  <Truck size={18} color="#10b981" />
                  <span className="pdp-trust-label">Free Delivery</span>
                </div>
                <div className="pdp-trust-item">
                  <RefreshCw size={18} color="#f59e0b" />
                  <span className="pdp-trust-label">30-Day Returns</span>
                </div>
                <div className="pdp-trust-item">
                  <Shield size={18} color="#8b5cf6" />
                  <span className="pdp-trust-label">100% Genuine</span>
                </div>
              </div>

              {/* Delivery */}
              <div className="pdp-delivery-box">
                <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
                  <Truck size={14} color="#ec4899" />
                  Delivery Options
                </div>
                <div className="pdp-pincode-row">
                  <input
                    className="pdp-pincode-input"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Enter pincode"
                    maxLength={6}
                  />
                  <button className="pdp-pincode-btn">Check</button>
                </div>
                <div className="pdp-delivery-ok">
                  ✓ Estimated delivery in {product.deliveryInfo.days}
                  {product.deliveryInfo.cod && " · COD available"}
                </div>
              </div>

              {/* Accordion sections */}
              {[
                {
                  key: "description",
                  label: "Product Description",
                  content: (
                    <>
                      <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, marginBottom: 12 }}>{product.description}</p>
                      <div className="pdp-section-label" style={{ margin: "12px 0 8px" }}>Product Highlights</div>
                      <ul style={{ paddingLeft: 18, margin: 0 }}>
                        {product.highlights.map((h, i) => (
                          <li key={i} style={{ fontSize: 13, color: "#6b7280", marginBottom: 4, lineHeight: 1.6 }}>{h}</li>
                        ))}
                      </ul>
                    </>
                  ),
                },
                {
                  key: "details",
                  label: "Product Details",
                  content: (
                    <table className="pdp-details-table">
                      <tbody>
                        {Object.entries(product.details).map(([k, v]) => (
                          <tr key={k}><td>{k}</td><td>{v}</td></tr>
                        ))}
                      </tbody>
                    </table>
                  ),
                },
                {
                  key: "ratings",
                  label: `Ratings & Reviews (${product.ratingCount.toLocaleString()})`,
                  content: (
                    <>
                      <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 16 }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: 42, fontWeight: 800, color: "#1f2937", lineHeight: 1 }}>{product.ratings.overall}</div>
                          <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star key={s} size={12} fill={s <= Math.round(product.ratings.overall) ? "#fbbf24" : "none"} color="#fbbf24" />
                            ))}
                          </div>
                          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>{product.ratingCount.toLocaleString()} ratings</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          {product.ratings.breakdown.map((b) => (
                            <RatingBar key={b.label} label={b.label} pct={b.pct} />
                          ))}
                        </div>
                      </div>
                      {product.reviews.map((r) => (
                        <div key={r.id} className="pdp-review-card">
                          <div className="pdp-review-header">
                            <span className="pdp-review-rating"><Star size={10} fill="#fff" strokeWidth={0} /> {r.rating}</span>
                            <span className="pdp-review-title">{r.title}</span>
                          </div>
                          <div className="pdp-review-body">{r.body}</div>
                          <div className="pdp-review-meta">{r.user} · {r.date} &nbsp;|&nbsp; {r.helpful} people found this helpful</div>
                        </div>
                      ))}
                    </>
                  ),
                },
              ].map((section) => (
                <div key={section.key} className="pdp-accordion-item">
                  <div
                    className="pdp-accordion-header"
                    onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
                  >
                    <span className="pdp-accordion-label">{section.label}</span>
                    {expandedSection === section.key
                      ? <ChevronUp size={16} color="#ec4899" />
                      : <ChevronDown size={16} color="#9ca3af" />}
                  </div>
                  {expandedSection === section.key && (
                    <div className="pdp-accordion-body">{section.content}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Image Slider Modal */}
      {sliderOpen && (
        <ImageSlider
          images={images}
          placeholderImages={product.placeholderImages}
          initialIndex={sliderIndex}
          onClose={() => setSliderOpen(false)}
        />
      )}

      {/* Toast */}
      {addedToBag && <div className="pdp-toast">✓ Added to your bag!</div>}
    </>
  );
}
