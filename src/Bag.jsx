import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { create } from "zustand";
import {
  ShoppingBag,
  Search,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  Star,
  SlidersHorizontal,
  XCircle,
  Tag,
  ShieldCheck,
  RotateCcw,
  Truck,
  Minus,
  Plus,
} from "lucide-react";

import logo from './assets/logo.png'
import "./constants/global.css"

import CouponModal from "./modals/CouponModal";

// ─── Zustand Store ────────────────────────────────────────────────────────────
const useBagStore = create((set, get) => ({
  items: [
    {
      id: 1,
      brand: "ARAVALII",
      name: "Women Floral Printed Shirt Style Top",
      seller: "ARAVALII ECOMMERCE INDIA PRIVATE LTD.",
      size: "L",
      qty: 1,
      price: 899,
      mrp: 1999,
      couponDiscount: 93,
      returnDays: 14,
      color: "#fce4ec",
      accent: "#e91e8c",
      selected: true,
    },
    {
      id: 2,
      brand: "Keitra",
      name: "Women Floral Printed Regular Pure Cotton Kurta with Dupatta",
      seller: "SHREE RAM CREATION",
      size: "XL",
      qty: 1,
      price: 585,
      mrp: 2999,
      couponDiscount: 124,
      returnDays: 14,
      color: "#e8f5e9",
      accent: "#2e7d32",
      selected: true,
    },
    {
      id: 3,
      brand: "FLOWERVELLY",
      name: "Women Printed Pure Cotton Kurta with Pyjamas",
      seller: "KRUPA TRADING",
      size: "M",
      qty: 1,
      price: 908,
      mrp: 3199,
      couponDiscount: 184,
      returnDays: 7,
      color: "#fce4ec",
      accent: "#ad1457",
      selected: true,
    },
  ],
  couponsApplied: 2,
  couponSavings: 401,
  platformFee: 23,
  donationAmount: 0,
  mobileMenuOpen: false,

  toggleSelected: (id) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.id === id ? { ...i, selected: !i.selected } : i
      ),
    })),
  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
  updateQty: (id, delta) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i
      ),
    })),
  setDonation: (amt) =>
    set((s) => ({ donationAmount: s.donationAmount === amt ? 0 : amt })),
  toggleMobileMenu: () =>
    set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
}));

// ─── Mock fetch (TanStack Query) ──────────────────────────────────────────────
const fetchPinDetails = async (pin) => {
  await new Promise((r) => setTimeout(r, 600));
  if (!pin || pin.length < 6) throw new Error("Invalid PIN");
  return { city: "Bengaluru", deliveryDate: "Thu, 1 May", express: true };
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function Navbar() {
  const { mobileMenuOpen, toggleMobileMenu } = useBagStore();
  return (
    <nav style={styles.navbar}>
      <div style={styles.navLogo}>
  <img src={logo} alt="logo" style={styles.logoImg} />
</div>
      <div style={styles.navSteps}>
        <span style={{ ...styles.step, ...styles.stepActive }}>
          <ShoppingBag size={13} style={{ marginRight: 4 }} />
          BAG
        </span>
        <span style={styles.stepDivider}>············</span>
        <span style={styles.step}>ADDRESS</span>
        <span style={styles.stepDivider}>············</span>
        <span style={styles.step}>PAYMENT</span>
      </div>
      <div style={styles.navRight}>
        <div style={styles.navSecure}>
          <ShieldCheck size={15} color="#4caf50" />
          <span>100% SECURE</span>
        </div>
        <button
          onClick={toggleMobileMenu}
          style={styles.mobileMenuBtn}
          aria-label="menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </nav>
  );
}

function PinBar() {
  const [pin, setPin] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["pin", pin],
    queryFn: () => fetchPinDetails(pin),
    enabled: submitted && pin.length === 6,
    retry: false,
  });

  const handleCheck = () => {
    if (pin.length === 6) setSubmitted(true);
  };

  return (
    <div style={styles.pinBar}>
      <Truck size={16} style={{ color: "#e91e8c", flexShrink: 0 }} />
      <input
        style={styles.pinInput}
        placeholder="Enter PIN code"
        value={pin}
        maxLength={6}
        onChange={(e) => {
          setPin(e.target.value.replace(/\D/, ""));
          setSubmitted(false);
        }}
        onKeyDown={(e) => e.key === "Enter" && handleCheck()}
      />
      {isLoading && <span style={styles.pinStatus}>Checking…</span>}
      {data && (
        <span style={{ ...styles.pinStatus, color: "#2e7d32" }}>
          ✓ Delivery by {data.deliveryDate}, {data.city}
        </span>
      )}
      {isError && (
        <span style={{ ...styles.pinStatus, color: "#c62828" }}>
          Invalid PIN
        </span>
      )}
      <button style={styles.pinBtn} onClick={handleCheck}>
        CHECK
      </button>
    </div>
  );
}

function ItemCard({ item }) {
  const { toggleSelected, removeItem, updateQty } = useBagStore();

  return (
    <div
      style={{
        ...styles.itemCard,
        opacity: item.selected ? 1 : 0.55,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={() => toggleSelected(item.id)}
        style={{
          ...styles.checkbox,
          background: item.selected ? "#e91e8c" : "transparent",
          borderColor: item.selected ? "#e91e8c" : "#bbb",
        }}
        aria-label="toggle item"
      >
        {item.selected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4l3 3 5-6"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Image placeholder */}
      <div
        style={{ ...styles.itemThumb, background: item.color }}
        aria-hidden
      >
        <svg width="48" height="64" viewBox="0 0 48 64">
          <rect x="10" y="4" width="28" height="42" rx="5" fill={item.accent} opacity="0.25" />
          <rect x="14" y="44" width="20" height="16" rx="3" fill={item.accent} opacity="0.15" />
          <circle cx="24" cy="20" r="6" fill={item.accent} opacity="0.3" />
        </svg>
      </div>

      {/* Details */}
      <div style={styles.itemBody}>
        <div style={styles.itemBrand}>{item.brand}</div>
        <div style={styles.itemName}>{item.name}</div>
        <div style={styles.itemSeller}>Sold by: {item.seller}</div>

        <div style={styles.itemAttrs}>
          <span style={styles.attrPill}>
            Size: {item.size} <ChevronDown size={11} />
          </span>
          <div style={styles.qtyControl}>
            <button
              style={styles.qtyBtn}
              onClick={() => updateQty(item.id, -1)}
            >
              <Minus size={11} />
            </button>
            <span style={styles.qtyNum}>{item.qty}</span>
            <button
              style={styles.qtyBtn}
              onClick={() => updateQty(item.id, 1)}
            >
              <Plus size={11} />
            </button>
          </div>
        </div>

        <div style={styles.pricingRow}>
          <span style={styles.priceFinal}>₹{item.price * item.qty}</span>
          <span style={styles.priceMrp}>₹{item.mrp}</span>
          <span style={styles.priceOff}>
            ₹{item.mrp - item.price} OFF
          </span>
        </div>

        {item.couponDiscount > 0 && (
          <div style={styles.couponLine}>
            <Tag size={11} style={{ marginRight: 4 }} />
            Coupon Discount: ₹{item.couponDiscount}
          </div>
        )}

        <div style={styles.returnLine}>
          <RotateCcw size={11} style={{ marginRight: 4 }} />
          {item.returnDays} days return available
        </div>
      </div>

      {/* Remove */}
      <button
        style={styles.removeBtn}
        onClick={() => removeItem(item.id)}
        aria-label="remove item"
      >
        <XCircle size={18} />
      </button>
    </div>
  );
}

function CouponPanel() {
  const { couponsApplied, couponSavings } = useBagStore();
    const [showCoupon, setShowCoupon] = useState(false)

  return (
    <div style={styles.panelCard}>
      <div style={styles.panelLabel}>COUPONS</div>
      <div style={styles.couponRow}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <Tag size={18} color="#e91e8c" style={{ marginTop: 2 }} />
          <div>
            <div style={styles.couponApplied}>
              {couponsApplied} Coupons applied
            </div>
            <div style={styles.couponSaved}>
              You saved additional ₹{couponSavings}
            </div>
          </div>
        </div>
        <button style={styles.editBtn} onClick={() => setShowCoupon(true)}>APPLY</button>
        <CouponModal
        isOpen={showCoupon}
        onClose={() => setShowCoupon(false)}
        onApply={(selectedIds) => console.log('Applied coupon IDs:', selectedIds)}
      />
      </div>
    </div>
  );
}

function PricePanel() {
  const navigate = useNavigate();
  const { items, couponSavings, platformFee, donationAmount } = useBagStore();

  const selected = items.filter((i) => i.selected);
  const totalMrp = useMemo(
    () => selected.reduce((s, i) => s + i.mrp * i.qty, 0),
    [selected]
  );
  const totalPrice = useMemo(
    () => selected.reduce((s, i) => s + i.price * i.qty, 0),
    [selected]
  );
  const discountOnMrp = totalMrp - totalPrice;
  const total = totalPrice - couponSavings + platformFee + donationAmount;

  return (
    <div style={styles.panelCard}>
      <div style={styles.panelLabel}>
        PRICE DETAILS ({selected.length} Item{selected.length !== 1 ? "s" : ""})
      </div>
      <div style={styles.priceRows}>
        <PriceRow label="Total MRP" value={`₹${totalMrp.toLocaleString()}`} />
        <PriceRow
          label="Discount on MRP"
          value={`- ₹${discountOnMrp.toLocaleString()}`}
          green
        />
        <PriceRow
          label="Coupon Discount"
          value={`- ₹${couponSavings}`}
          green
        />
        <div style={styles.priceRow}>
          <span style={styles.priceLabel}>
            Platform Fee{" "}
            <span style={styles.knowMoreInline}>Know More</span>
          </span>
          <span style={styles.priceValue}>₹{platformFee}</span>
        </div>
        {donationAmount > 0 && (
          <PriceRow label="Donation" value={`₹${donationAmount}`} />
        )}
      </div>

      <div style={styles.priceDivider} />

      <div style={styles.totalRow}>
        <span>Total Amount</span>
        <span>₹{Math.max(0, total).toLocaleString()}</span>
      </div>

      <p style={styles.terms}>
        By placing the order, you agree to Myntra's{" "}
        <a href="#" style={styles.termsLink}>Terms of Use</a> and{" "}
        <a href="#" style={styles.termsLink}>Privacy Policy</a>
      </p>

      <button
        style={styles.placeBtn}
        onClick={() => navigate("/checkout/address")}
        disabled={selected.length === 0}
      >
        PLACE ORDER
      </button>

      {selected.length === 0 && (
        <p style={{ fontSize: 11, color: "#e91e8c", textAlign: "center", marginTop: 8 }}>
          Select at least one item to proceed
        </p>
      )}
    </div>
  );
}

function PriceRow({ label, value, green }) {
  return (
    <div style={styles.priceRow}>
      <span style={styles.priceLabel}>{label}</span>
      <span style={{ ...styles.priceValue, ...(green ? styles.priceGreen : {}) }}>
        {value}
      </span>
    </div>
  );
}

// ─── Main BagPage ─────────────────────────────────────────────────────────────
function BagPage() {
  const { items, toggleSelected } = useBagStore();
  const selectedCount = items.filter((i) => i.selected).length;
  const allSelected = selectedCount === items.length;

  return (
    <div style={styles.root}>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.leftCol}>
          <PinBar />

          {/* Items header */}
          <div style={styles.itemsHeader}>
            <button
              onClick={() =>
                items.forEach((i) => {
                  if (i.selected !== allSelected) toggleSelected(i.id);
                })
              }
              style={{
                ...styles.checkbox,
                background: allSelected ? "#e91e8c" : "transparent",
                borderColor: allSelected ? "#e91e8c" : "#bbb",
              }}
            >
              {allSelected && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            <span style={styles.itemsCount}>
              {selectedCount}/{items.length} ITEMS SELECTED
            </span>
            <div style={styles.itemsActions}>
              <span style={styles.actionBtn}>REMOVE</span>
              <span style={{ color: "#ddd" }}>|</span>
              <span style={styles.actionBtn}>
                <Heart size={12} style={{ marginRight: 4 }} />
                WISHLIST
              </span>
            </div>
          </div>

          {/* Item cards */}
          {items.length === 0 ? (
            <div style={styles.emptyState}>
              <ShoppingBag size={48} style={{ color: "#ddd", marginBottom: 12 }} />
              <p style={{ color: "#aaa", fontSize: 15 }}>Your bag is empty</p>
            </div>
          ) : (
            items.map((item) => <ItemCard key={item.id} item={item} />)
          )}
        </div>

        <div style={styles.rightCol}>
          <CouponPanel />
          <PricePanel />
        </div>
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const PINK = "#e91e8c";

const styles = {
  root: {
  minHeight: "100vh",
  background: "#f7f7f7",
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
  color: "#222",
  WebkitFontSmoothing: "antialiased", // Better font rendering
  MozOsxFontSmoothing: "grayscale",
},
  logoImg: {
  height: "auto",
  width: 100, // Force a specific width
  maxWidth: 100,
  minWidth: 100,
  objectFit: "contain",
  display: "block", // Ensures proper rendering

},
  navbar: {
    background: "#fff",
    borderBottom: "0.5px solid #eee",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    height: 56,
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  navLogo: {
  display: "flex",
  alignItems: "center",
  height: "100%",
  minWidth: 100,
  paddingLeft: 40

},
  logoM: {
    fontSize: 28,
    fontWeight: 700,
    background: "linear-gradient(135deg, #ff6b6b, #e91e8c, #f5a623)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    lineHeight: 1,
  },
  logoyntra: { fontSize: 20, fontWeight: 600, color: "#222", letterSpacing: -0.5 },
  navSteps: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#aaa",
    letterSpacing: 0.5,
  },
  step: { display: "flex", alignItems: "center" },
  stepActive: {
    color: PINK,
    fontWeight: 600,
    borderBottom: `2px solid ${PINK}`,
    paddingBottom: 2,
  },
  stepDivider: { color: "#ddd", fontSize: 10 },
  navRight: { display: "flex", alignItems: "center", gap: 16 },
  navSecure: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    color: "#555",
    fontWeight: 500,
  },
  mobileMenuBtn: {
    display: "none",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 4,
  },
  container: {
    maxWidth: 1080,
    margin: "0 auto",
    padding: "20px 16px",
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: 20,
    alignItems: "start",
  },
  leftCol: {},
  rightCol: { display: "flex", flexDirection: "column", gap: 12 },

  pinBar: {
    background: "#fff",
    border: "0.5px solid #eee",
    borderRadius: 10,
    padding: "10px 14px",
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 14,
  },
  pinInput: {
    flex: 1,
    border: "none",
    outline: "none",
    fontSize: 13,
    color: "#333",
    background: "transparent",
    minWidth: 0,
  },
  pinStatus: { fontSize: 12, color: "#888", whiteSpace: "nowrap" },
  pinBtn: {
    fontSize: 12,
    fontWeight: 600,
    color: PINK,
    background: "none",
    border: `1.5px solid ${PINK}`,
    borderRadius: 6,
    padding: "5px 14px",
    cursor: "pointer",
    letterSpacing: 0.5,
    flexShrink: 0,
  },

  itemsHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 0 12px",
    borderBottom: "0.5px solid #eee",
    marginBottom: 12,
  },
  itemsCount: { fontSize: 13, fontWeight: 600, flex: 1 },
  itemsActions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 11,
    fontWeight: 600,
    color: "#888",
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    letterSpacing: 0.3,
  },

  itemCard: {
    background: "#fff",
    border: "0.5px solid #eee",
    borderRadius: 12,
    padding: "14px 12px",
    marginBottom: 10,
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    position: "relative",
    transition: "opacity 0.2s",
  },
  checkbox: {
    width: 18,
    height: 18,
    border: "1.5px solid #bbb",
    borderRadius: 4,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    marginTop: 2,
    transition: "all 0.15s",
    background: "transparent",
  },
  itemThumb: {
    width: 88,
    height: 110,
    borderRadius: 8,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  itemBody: { flex: 1, minWidth: 0 },
  itemBrand: { fontSize: 13, fontWeight: 700, letterSpacing: 0.3, color: "#111" },
  itemName: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
    lineHeight: 1.4,
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  itemSeller: { fontSize: 11, color: "#aaa", marginTop: 2 },
  itemAttrs: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    flexWrap: "wrap",
  },
  attrPill: {
    fontSize: 11,
    border: "0.5px solid #ddd",
    borderRadius: 6,
    padding: "4px 10px",
    color: "#555",
    display: "flex",
    alignItems: "center",
    gap: 3,
    cursor: "pointer",
  },
  qtyControl: {
    display: "flex",
    alignItems: "center",
    border: "0.5px solid #ddd",
    borderRadius: 6,
    overflow: "hidden",
  },
  qtyBtn: {
    border: "none",
    background: "#f7f7f7",
    padding: "4px 8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    color: "#555",
  },
  qtyNum: { padding: "2px 10px", fontSize: 12, fontWeight: 600 },
  pricingRow: {
    display: "flex",
    alignItems: "baseline",
    gap: 6,
    marginTop: 8,
    flexWrap: "wrap",
  },
  priceFinal: { fontSize: 15, fontWeight: 700, color: "#111" },
  priceMrp: { fontSize: 12, color: "#bbb", textDecoration: "line-through" },
  priceOff: { fontSize: 11, color: "#2e7d32", fontWeight: 600 },
  couponLine: {
    fontSize: 11,
    color: PINK,
    marginTop: 4,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
  },
  returnLine: {
    fontSize: 11,
    color: "#888",
    marginTop: 5,
    display: "flex",
    alignItems: "center",
  },
  removeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#ccc",
    padding: 0,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    transition: "color 0.15s",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "60px 0",
  },

  panelCard: {
    background: "#fff",
    border: "0.5px solid #eee",
    borderRadius: 12,
    padding: "16px",
  },
  panelLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1,
    color: "#888",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  couponRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  couponApplied: { fontSize: 13, fontWeight: 600, color: "#111" },
  couponSaved: { fontSize: 12, color: "#2e7d32", marginTop: 3 },
  editBtn: {
    fontSize: 11,
    fontWeight: 700,
    color: PINK,
    border: `1.5px solid ${PINK}`,
    borderRadius: 6,
    padding: "4px 12px",
    background: "none",
    cursor: "pointer",
    letterSpacing: 0.5,
    flexShrink: 0,
  },

  donateRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 12 },
  donateCheck: {
    width: 18,
    height: 18,
    border: "1.5px solid #bbb",
    borderRadius: 3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    transition: "all 0.15s",
  },
  donateLabel: { fontSize: 13, color: "#333" },
  donateAmounts: { display: "flex", gap: 8, flexWrap: "wrap" },
  amtPill: {
    fontSize: 12,
    border: "1px solid #ddd",
    borderRadius: 999,
    padding: "5px 14px",
    cursor: "pointer",
    background: "none",
    transition: "all 0.15s",
    fontWeight: 500,
  },
  knowMore: {
    fontSize: 12,
    color: PINK,
    background: "none",
    border: "none",
    cursor: "pointer",
    marginTop: 10,
    padding: 0,
    fontWeight: 500,
    display: "block",
  },

  priceRows: { display: "flex", flexDirection: "column", gap: 10 },
  priceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 13,
  },
  priceLabel: { color: "#666" },
  priceValue: { color: "#111", fontWeight: 500 },
  priceGreen: { color: "#2e7d32" },
  knowMoreInline: { fontSize: 11, color: PINK, cursor: "pointer" },
  priceDivider: {
    border: "none",
    borderTop: "0.5px solid #eee",
    margin: "12px 0",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 15,
    fontWeight: 700,
    color: "#111",
  },
  terms: { fontSize: 11, color: "#aaa", marginTop: 12, lineHeight: 1.5 },
  termsLink: { color: PINK, textDecoration: "none" },
  placeBtn: {
    width: "100%",
    background: PINK,
    color: "#fff",
    border: "none",
    padding: "14px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 1.5,
    cursor: "pointer",
    marginTop: 14,
    transition: "background 0.15s",
  },
};

// Use this component inside your existing <QueryClientProvider> + <BrowserRouter> tree.
export default BagPage;
export { BagPage };
