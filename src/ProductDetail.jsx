import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Heart, Share2, Star, ShoppingBag, Truck, RefreshCw, Shield, X, ZoomIn, ChevronDown, ChevronUp } from "lucide-react";

// ─── Hardcoded API Response ───────────────────────────────────────────────────
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
  // Fallback placeholder images (shown when real images fail)
  placeholderImages: [
    "https://placehold.co/1080x1440/1a237e/ffffff?text=Kurta+1",
    "https://placehold.co/1080x1440/283593/ffffff?text=Kurta+2",
    "https://placehold.co/1080x1440/1565c0/ffffff?text=Kurta+3",
    "https://placehold.co/1080x1440/0d47a1/ffffff?text=Kurta+4",
    "https://placehold.co/1080x1440/1a237e/ffffff?text=Kurta+5",
    "https://placehold.co/1080x1440/283593/ffffff?text=Kurta+6",
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
  deliveryInfo: {
    pincode: "560001",
    days: "2-3 Business Days",
    cod: true,
  },
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

// ─── Simulated API Fetch ──────────────────────────────────────────────────────
async function fetchProduct(productId) {
  // Simulate network delay
  await new Promise((r) => setTimeout(r, 600));
  // In production, replace with: const res = await fetch(`/api/products/${productId}`);
  return HARDCODED_PRODUCT;
}

// ─── Image Slider Component ───────────────────────────────────────────────────
function ImageSlider({ images, initialIndex, onClose }) {
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

  const getImageSrc = (index) => {
    if (imgErrors[index]) return HARDCODED_PRODUCT.placeholderImages[index] || `https://placehold.co/1080x1440/1a237e/ffffff?text=Image+${index + 1}`;
    return images[index];
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "rgba(0,0,0,0.95)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <span style={{ color: "#aaa", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
          {current + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="flex items-center justify-center rounded-full transition-all"
          style={{ width: 40, height: 40, background: "rgba(255,255,255,0.1)", color: "#fff" }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Main image */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {/* Prev */}
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
            style={{
              maxHeight: "100%",
              maxWidth: "min(500px, 90vw)",
              animation: "sliderFadeIn 0.25s ease",
            }}
          />
        </div>

        {/* Next */}
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
          const thumbSrc = imgErrors[i] ? (HARDCODED_PRODUCT.placeholderImages[i] || `https://placehold.co/100x140/1a237e/ffffff?text=${i + 1}`) : img;
          return (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="flex-shrink-0 rounded overflow-hidden transition-all"
              style={{
                width: 56,
                height: 76,
                border: i === current ? "2px solid #ff3f6c" : "2px solid transparent",
                opacity: i === current ? 1 : 0.55,
              }}
            >
              <img
                src={thumbSrc}
                alt=""
                onError={() => setImgErrors((e) => ({ ...e, [i]: true }))}
                className="w-full h-full object-cover"
              />
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
      <span style={{ minWidth: 30, fontSize: 12, color: "#666" }}>{label}</span>
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: "#f0f0f0" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: pct > 50 ? "#14958f" : pct > 25 ? "#ff9f00" : "#ff6161",
            transition: "width 0.8s ease",
          }}
        />
      </div>
      <span style={{ minWidth: 28, fontSize: 12, color: "#666", textAlign: "right" }}>{pct}%</span>
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
  const [activeTab, setActiveTab] = useState("details");
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

  const openSlider = (index) => {
    setSliderIndex(index);
    setSliderOpen(true);
  };

  const handleAddToBag = () => {
    if (!selectedSize) return;
    setAddedToBag(true);
    setTimeout(() => setAddedToBag(false), 2000);
  };

  const getImageSrc = (index) => {
    if (!product) return "";
    if (imgErrors[index]) return product.placeholderImages[index] || `https://placehold.co/1080x1440/1a237e/ffffff?text=Image+${index + 1}`;
    return product.images[index];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#f9f9f9" }}>
        <div className="text-center">
          <div
            className="mx-auto mb-4 rounded-full"
            style={{
              width: 48, height: 48,
              border: "3px solid #ff3f6c",
              borderTopColor: "transparent",
              animation: "spin 0.7s linear infinite",
            }}
          />
          <p style={{ color: "#999", fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>Loading product…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const images = product.images;
  const imageRows = [];
  for (let i = 0; i < images.length; i += 2) {
    imageRows.push(images.slice(i, i + 2).map((_, j) => i + j));
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; font-family: 'DM Sans', sans-serif; background: #f4f4f4; }
        .pdp-root { max-width: 1280px; margin: 0 auto; background: #fff; }

        /* Nav */
        .pdp-nav {
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 24px; height: 56px; border-bottom: 1px solid #f0f0f0;
          position: sticky; top: 0; z-index: 20; background: #fff;
        }
        .pdp-logo { font-family: 'Playfair Display', serif; font-size: 26px; color: #ff3f6c; letter-spacing: -1px; }
        .pdp-nav-links { display: flex; gap: 24px; }
        .pdp-nav-link { font-size: 13px; color: #333; cursor: pointer; font-weight: 500; text-decoration: none; }
        .pdp-nav-link:hover { color: #ff3f6c; }

        /* Breadcrumb */
        .breadcrumb { padding: 12px 24px; font-size: 12px; color: #999; display: flex; gap: 6px; align-items: center; }
        .breadcrumb a { color: #999; text-decoration: none; }
        .breadcrumb a:hover { color: #ff3f6c; }
        .breadcrumb-sep { color: #ccc; }

        /* Layout */
        .pdp-layout { display: flex; gap: 0; }

        /* Images column */
        .pdp-images { width: 55%; position: relative; }
        .image-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 0; }
        .image-cell {
          position: relative; overflow: hidden; cursor: zoom-in;
          aspect-ratio: 3/4; background: #f8f8f8;
        }
        .image-cell img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease; }
        .image-cell:hover img { transform: scale(1.04); }
        .image-zoom-icon {
          position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.85);
          border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center;
          justify-content: center; opacity: 0; transition: opacity 0.2s; pointer-events: none;
        }
        .image-cell:hover .image-zoom-icon { opacity: 1; }

        /* Info column */
        .pdp-info { width: 45%; padding: 24px 32px; position: sticky; top: 56px; align-self: flex-start; height: calc(100vh - 56px); overflow-y: auto; }
        .pdp-info::-webkit-scrollbar { width: 4px; }
        .pdp-info::-webkit-scrollbar-thumb { background: #eee; border-radius: 2px; }

        .brand-name { font-size: 22px; font-weight: 700; color: #333; font-family: 'Playfair Display', serif; }
        .product-name { font-size: 15px; color: #777; margin: 4px 0 12px; line-height: 1.4; }

        .rating-pill {
          display: inline-flex; align-items: center; gap: 4px;
          background: #14958f; color: #fff; border-radius: 12px;
          padding: 3px 10px; font-size: 12px; font-weight: 600;
        }
        .rating-count { font-size: 13px; color: #999; margin-left: 8px; }

        .price-row { display: flex; align-items: baseline; gap: 12px; margin: 16px 0 8px; }
        .price-current { font-size: 26px; font-weight: 700; color: #333; }
        .price-mrp { font-size: 16px; color: #aaa; text-decoration: line-through; }
        .price-discount { font-size: 15px; color: #ff905a; font-weight: 600; }
        .tax-note { font-size: 11px; color: #aaa; }

        .section-title { font-size: 13px; font-weight: 600; color: #333; margin: 20px 0 10px; text-transform: uppercase; letter-spacing: 0.5px; }

        /* Size selector */
        .size-grid { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }
        .size-btn {
          width: 52px; height: 52px; border-radius: 50%; border: 1.5px solid #d4d4d4;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 500; color: #333; cursor: pointer;
          transition: all 0.15s; background: #fff;
        }
        .size-btn:hover:not(.disabled) { border-color: #ff3f6c; color: #ff3f6c; }
        .size-btn.selected { border-color: #ff3f6c; color: #ff3f6c; background: #fff5f7; font-weight: 700; }
        .size-btn.disabled { opacity: 0.35; cursor: not-allowed; border-style: dashed; }

        /* CTA buttons */
        .cta-row { display: flex; gap: 12px; margin: 20px 0; }
        .btn-bag {
          flex: 1; height: 52px; border: none; border-radius: 8px;
          font-size: 15px; font-weight: 700; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: #ff3f6c; color: #fff; transition: all 0.2s;
          text-transform: uppercase; letter-spacing: 0.5px;
        }
        .btn-bag:hover { background: #e6305c; transform: translateY(-1px); box-shadow: 0 4px 16px rgba(255,63,108,0.3); }
        .btn-bag:disabled { background: #f0f0f0; color: #aaa; cursor: not-allowed; transform: none; box-shadow: none; }
        .btn-wishlist {
          width: 52px; height: 52px; border-radius: 8px; border: 1.5px solid #d4d4d4;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; background: #fff; transition: all 0.2s;
        }
        .btn-wishlist:hover { border-color: #ff3f6c; }
        .btn-wishlist.active { border-color: #ff3f6c; background: #fff5f7; }

        /* Delivery */
        .delivery-box { border: 1px solid #f0f0f0; border-radius: 8px; padding: 14px 16px; margin: 16px 0; }
        .pincode-row { display: flex; gap: 8px; align-items: center; }
        .pincode-input {
          flex: 1; border: 1px solid #d4d4d4; border-radius: 6px;
          padding: 8px 12px; font-size: 13px; outline: none;
          font-family: 'DM Sans', sans-serif;
        }
        .pincode-input:focus { border-color: #ff3f6c; }
        .pincode-btn {
          background: none; border: none; color: #ff3f6c; font-size: 13px;
          font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif;
        }

        /* Offers */
        .offer-item { display: flex; gap: 10px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #f8f8f8; }
        .offer-icon { font-size: 18px; }
        .offer-title { font-size: 13px; font-weight: 600; color: #333; }
        .offer-desc { font-size: 12px; color: #666; }

        /* Accordion */
        .accordion-item { border-top: 1px solid #f0f0f0; }
        .accordion-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 14px 0; cursor: pointer; user-select: none;
        }
        .accordion-label { font-size: 14px; font-weight: 600; color: #333; }
        .accordion-body { padding-bottom: 14px; }

        /* Details table */
        .details-table { width: 100%; border-collapse: collapse; }
        .details-table tr td { padding: 6px 0; font-size: 13px; vertical-align: top; }
        .details-table tr td:first-child { color: #999; width: 45%; }
        .details-table tr td:last-child { color: #333; font-weight: 500; }

        /* Reviews */
        .review-card { padding: 16px 0; border-bottom: 1px solid #f4f4f4; }
        .review-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
        .review-rating { display: flex; align-items: center; gap: 3px; background: #14958f; color: #fff; border-radius: 10px; padding: 2px 8px; font-size: 12px; font-weight: 600; }
        .review-title { font-size: 14px; font-weight: 600; color: #333; }
        .review-body { font-size: 13px; color: #666; line-height: 1.6; }
        .review-meta { font-size: 11px; color: #aaa; margin-top: 6px; }

        /* Trust badges */
        .trust-row { display: flex; gap: 0; border: 1px solid #f0f0f0; border-radius: 8px; overflow: hidden; margin: 16px 0; }
        .trust-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 12px 8px; border-right: 1px solid #f0f0f0; text-align: center; }
        .trust-item:last-child { border-right: none; }
        .trust-label { font-size: 11px; color: #666; font-weight: 500; }

        /* Toast */
        .toast {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          background: #333; color: #fff; padding: 12px 24px; border-radius: 8px;
          font-size: 14px; z-index: 100; animation: toastIn 0.3s ease;
        }
        @keyframes toastIn { from { opacity: 0; transform: translateX(-50%) translateY(20px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }

        /* Responsive */
        @media (max-width: 768px) {
          .pdp-layout { flex-direction: column; }
          .pdp-images, .pdp-info { width: 100%; }
          .pdp-info { position: static; height: auto; padding: 16px; }
        }
      `}</style>

      <div className="pdp-root">
        {/* Navbar */}
        <nav className="pdp-nav">
          <div className="pdp-logo">myntra</div>
          <div className="pdp-nav-links">
            {["Men", "Women", "Kids", "Home & Living", "Beauty", "Studio"].map((l) => (
              <a key={l} className="pdp-nav-link">{l}</a>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <ShoppingBag size={20} color="#333" style={{ cursor: "pointer" }} />
            <Heart size={20} color="#333" style={{ cursor: "pointer" }} />
          </div>
        </nav>

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <a href="#">Home</a><span className="breadcrumb-sep">›</span>
          <a href="#">Women</a><span className="breadcrumb-sep">›</span>
          <a href="#">Kurtas</a><span className="breadcrumb-sep">›</span>
          <span style={{ color: "#333" }}>{product.brand}</span>
        </div>

        {/* Main layout */}
        <div className="pdp-layout">
          {/* ── Images ── */}
          <div className="pdp-images">
            <div className="image-grid">
              {imageRows.map((row, ri) =>
                row.map((imgIdx) => (
                  <div
                    key={imgIdx}
                    className="image-cell"
                    onClick={() => openSlider(imgIdx)}
                  >
                    <img
                      src={getImageSrc(imgIdx)}
                      alt={`${product.name} - view ${imgIdx + 1}`}
                      onError={() => setImgErrors((e) => ({ ...e, [imgIdx]: true }))}
                    />
                    <div className="image-zoom-icon">
                      <ZoomIn size={16} color="#333" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Info panel ── */}
          <div className="pdp-info">
            {/* Brand & name */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="brand-name">{product.brand}</div>
                <div className="product-name">{product.name}</div>
              </div>
              <button style={{ background: "none", border: "none", cursor: "pointer" }}>
                <Share2 size={18} color="#777" />
              </button>
            </div>

            {/* Rating */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="rating-pill">
                <Star size={11} fill="#fff" /> {product.rating}
              </span>
              <span className="rating-count">
                {product.ratingCount.toLocaleString()} Ratings & {product.reviewCount} Reviews
              </span>
            </div>

            {/* Price */}
            <div className="price-row">
              <span className="price-current">₹{product.price.toLocaleString()}</span>
              <span className="price-mrp">₹{product.mrp.toLocaleString()}</span>
              <span className="price-discount">{product.discount}% OFF</span>
            </div>
            <div className="tax-note">inclusive of all taxes</div>

            {/* Offers */}
            <div style={{ margin: "16px 0" }}>
              {product.offers.map((o, i) => (
                <div key={i} className="offer-item">
                  <span className="offer-icon">{o.icon}</span>
                  <div>
                    <div className="offer-title">{o.title}</div>
                    <div className="offer-desc">{o.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Size selector */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div className="section-title" style={{ margin: "0 0 10px" }}>Select Size</div>
                <span style={{ fontSize: 12, color: "#ff3f6c", fontWeight: 600, cursor: "pointer" }}>Size Guide</span>
              </div>
              <div className="size-grid">
                {product.sizes.map((s) => {
                  const available = product.availableSizes.includes(s);
                  return (
                    <button
                      key={s}
                      className={`size-btn ${!available ? "disabled" : ""} ${selectedSize === s ? "selected" : ""}`}
                      onClick={() => available && setSelectedSize(s)}
                      disabled={!available}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
              {!selectedSize && (
                <p style={{ fontSize: 12, color: "#ff905a", marginTop: 4 }}>Please select a size</p>
              )}
            </div>

            {/* CTA */}
            <div className="cta-row">
              <button
                className="btn-bag"
                onClick={handleAddToBag}
                disabled={!selectedSize}
              >
                <ShoppingBag size={18} />
                {addedToBag ? "Added!" : "Add to Bag"}
              </button>
              <button
                className={`btn-wishlist ${wishlist ? "active" : ""}`}
                onClick={() => setWishlist((w) => !w)}
              >
                <Heart
                  size={20}
                  color={wishlist ? "#ff3f6c" : "#555"}
                  fill={wishlist ? "#ff3f6c" : "none"}
                />
              </button>
            </div>

            {/* Trust badges */}
            <div className="trust-row">
              <div className="trust-item">
                <Truck size={18} color="#14958f" />
                <span className="trust-label">Free Delivery</span>
              </div>
              <div className="trust-item">
                <RefreshCw size={18} color="#ff905a" />
                <span className="trust-label">30-Day Returns</span>
              </div>
              <div className="trust-item">
                <Shield size={18} color="#7c4dff" />
                <span className="trust-label">100% Genuine</span>
              </div>
            </div>

            {/* Delivery check */}
            <div className="delivery-box">
              <div style={{ fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 10 }}>
                <Truck size={14} style={{ verticalAlign: "middle", marginRight: 6 }} />
                Delivery Options
              </div>
              <div className="pincode-row">
                <input
                  className="pincode-input"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter pincode"
                  maxLength={6}
                />
                <button className="pincode-btn">Check</button>
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: "#14958f", fontWeight: 500 }}>
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
                    <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7, marginBottom: 12 }}>{product.description}</p>
                    <div className="section-title" style={{ margin: "12px 0 8px" }}>Product Highlights</div>
                    <ul style={{ paddingLeft: 18, margin: 0 }}>
                      {product.highlights.map((h, i) => (
                        <li key={i} style={{ fontSize: 13, color: "#555", marginBottom: 4, lineHeight: 1.5 }}>{h}</li>
                      ))}
                    </ul>
                  </>
                ),
              },
              {
                key: "details",
                label: "Product Details",
                content: (
                  <table className="details-table">
                    <tbody>
                      {Object.entries(product.details).map(([k, v]) => (
                        <tr key={k}>
                          <td>{k}</td>
                          <td>{v}</td>
                        </tr>
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
                        <div style={{ fontSize: 42, fontWeight: 800, color: "#333", lineHeight: 1 }}>{product.ratings.overall}</div>
                        <div style={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} size={12} fill={s <= Math.round(product.ratings.overall) ? "#ffb800" : "none"} color="#ffb800" />
                          ))}
                        </div>
                        <div style={{ fontSize: 11, color: "#999", marginTop: 2 }}>{product.ratingCount.toLocaleString()} ratings</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        {product.ratings.breakdown.map((b) => (
                          <RatingBar key={b.label} label={b.label} pct={b.pct} />
                        ))}
                      </div>
                    </div>
                    {product.reviews.map((r) => (
                      <div key={r.id} className="review-card">
                        <div className="review-header">
                          <span className="review-rating"><Star size={10} fill="#fff" /> {r.rating}</span>
                          <span className="review-title">{r.title}</span>
                        </div>
                        <div className="review-body">{r.body}</div>
                        <div className="review-meta">
                          {r.user} · {r.date} &nbsp;|&nbsp; {r.helpful} people found this helpful
                        </div>
                      </div>
                    ))}
                  </>
                ),
              },
            ].map((section) => (
              <div key={section.key} className="accordion-item">
                <div
                  className="accordion-header"
                  onClick={() => setExpandedSection(expandedSection === section.key ? null : section.key)}
                >
                  <span className="accordion-label">{section.label}</span>
                  {expandedSection === section.key ? <ChevronUp size={16} color="#777" /> : <ChevronDown size={16} color="#777" />}
                </div>
                {expandedSection === section.key && (
                  <div className="accordion-body">{section.content}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Image Slider Modal */}
      {sliderOpen && (
        <ImageSlider
          images={images}
          initialIndex={sliderIndex}
          onClose={() => setSliderOpen(false)}
        />
      )}

      {/* Toast */}
      {addedToBag && (
        <div className="toast">
          ✓ Added to your bag!
        </div>
      )}
    </>
  );
}
