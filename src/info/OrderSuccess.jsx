import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState(false);

  const order = location.state;

  useEffect(() => {
    if (!order) { navigate("/"); return; }
    const t1 = setTimeout(() => setVisible(true), 80);
    const t2 = setTimeout(() => setChecked(true), 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [order, navigate]);

  if (!order) return null;

  return (
    <div style={s.page}>
      <div style={{
        ...s.card,
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}>

        {/* ── Thank You Card ── */}
        <div style={s.thankCard}>
          <img src="/vlogo__1_-removebg-preview.png" alt="Vaarria" style={{ height: 64, objectFit: 'contain', marginBottom: 4 }} />
          <div style={s.thankTitle}>THANK YOU</div>
          <div style={s.thankSub}>FOR CHOOSING VAARRIA</div>
          <p style={s.thankBody}>
            Your support means the world to us. Every piece you choose is crafted with
            passion, precision and a promise of elegance.
          </p>
          <div style={s.thankDivider}>✦</div>
          <div style={s.thankBrand}>VAARRIA</div>
          <div style={s.thankTagline}>WHERE ELEGANCE FINDS FORM</div>
        </div>

        {/* ── Animated tick ── */}
        <div style={s.tickOuter}>
          <svg width="90" height="90" viewBox="0 0 90 90" style={{ overflow: 'visible' }}>
            <defs>
              {/* bangle metallic gradient — light top-left, dark bottom-right, bright specular */}
              <linearGradient id="bangleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%"   stopColor="#fffbe8" />
                <stop offset="18%"  stopColor="#f5d060" />
                <stop offset="38%"  stopColor="#C9A84C" />
                <stop offset="55%"  stopColor="#8a6820" />
                <stop offset="72%"  stopColor="#C9A84C" />
                <stop offset="88%"  stopColor="#f0c040" />
                <stop offset="100%" stopColor="#fffbe8" />
              </linearGradient>
              {/* soft drop shadow for depth */}
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#8a6820" floodOpacity="0.45" />
              </filter>
            </defs>
            {/* bangle ring — thick stroke with metallic gradient */}
            <circle
              cx="45" cy="45" r="38"
              fill="none"
              stroke="url(#bangleGrad)"
              strokeWidth="9"
              strokeDasharray="239"
              strokeDashoffset={checked ? 0 : 239}
              strokeLinecap="round"
              filter="url(#shadow)"
              style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(.4,0,.2,1)", transformOrigin: "center", transform: "rotate(-90deg)" }}
            />
            {/* specular highlight arc — thin bright streak at top */}
            <circle
              cx="45" cy="45" r="38"
              fill="none"
              stroke="#fffde0"
              strokeWidth="2"
              strokeDasharray="40 199"
              strokeDashoffset={checked ? -20 : 239}
              strokeLinecap="round"
              opacity="0.7"
              style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(.4,0,.2,1) 0.1s", transformOrigin: "center", transform: "rotate(-120deg)" }}
            />
            {/* tick */}
            <polyline
              points="27,46 39,58 63,32"
              fill="none"
              stroke="url(#bangleGrad)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="50"
              strokeDashoffset={checked ? 0 : 50}
              filter="url(#shadow)"
              style={{ transition: "stroke-dashoffset 0.4s ease 0.6s" }}
            />
          </svg>
        </div>

        {/* ── Heading ── */}
        <h1 style={s.title}>Thank you for your order</h1>
        <p style={s.subtitle}>
          Your order has been confirmed and is being prepared with care.
        </p>

        {/* ── Order summary card ── */}
        <div style={s.summaryCard}>
          <div style={s.summaryHeader}>Order Summary</div>
          <InfoRow label="Order ID"    value={order.order_id} mono />
          <InfoRow label="Payment ID"  value={order.payment_id} mono />
          <InfoRow label="Amount Paid" value={`₹${order.amount}`} gold />
          <InfoRow label="Estimated Delivery" value={order.estimated_delivery} last />
        </div>

        {/* ── Dispatch notice ── */}
        <div style={s.notice}>
          <span style={s.noticeDot} />
          <p style={s.noticeText}>
            You'll receive tracking details at{" "}
            <a href="mailto:chatoyantvortex@outlook.com" style={s.noticeEmail}>
              chatoyantvortex@outlook.com
            </a>{" "}
            once your order ships.
          </p>
        </div>

        {/* ── Actions ── */}
        <div style={s.actions}>
          <button style={s.btnPrimary} onClick={() => navigate("/orders")}>
            View My Orders
          </button>
          <button style={s.btnSecondary} onClick={() => navigate("/")}>
            Continue Shopping
          </button>
        </div>

        <p style={s.support}>
          Need help?{" "}
          <a href="mailto:chatoyantvortex@outlook.com" style={s.supportLink}>
            chatoyantvortex@outlook.com
          </a>
        </p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, gold, mono, last }) {
  return (
    <div style={{ ...s.row, ...(last ? { borderBottom: "none" } : {}) }}>
      <span style={s.rowLabel}>{label}</span>
      <span style={{
        ...s.rowValue,
        ...(gold ? { color: "#C9A84C", fontWeight: 700, fontSize: 15 } : {}),
        ...(mono ? { fontFamily: "monospace", fontSize: 12, color: "#555" } : {}),
      }}>
        {value}
      </span>
    </div>
  );
}

const GOLD = "#C9A84C";
const NAVY = "#050C1C";

const s = {
  page: {
    minHeight: "100vh",
    background: "#f5f4f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: 480,
    background: "#ffffff",
    borderRadius: 16,
    border: "1px solid #e8e0d0",
    boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
    padding: "36px 32px 28px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },

  thankCard: {
    width: "100%",
    background: NAVY,
    borderRadius: 12,
    border: `1px solid ${GOLD}44`,
    padding: "28px 24px 22px",
    marginBottom: 28,
    textAlign: "center",
    boxShadow: `0 4px 24px rgba(5,12,28,0.18), inset 0 0 0 1px ${GOLD}22`,
  },
  vaMonogram: {
    fontSize: 36,
    fontWeight: 800,
    color: GOLD,
    fontFamily: "'Playfair Display', Georgia, serif",
    letterSpacing: "0.08em",
    marginBottom: 10,
  },
  thankTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: GOLD,
    fontFamily: "'Playfair Display', Georgia, serif",
    letterSpacing: "0.18em",
    marginBottom: 4,
  },
  thankSub: {
    fontSize: 10,
    fontWeight: 600,
    color: `${GOLD}99`,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    marginBottom: 14,
  },
  thankBody: {
    fontSize: 12.5,
    color: "#c8c8d4",
    lineHeight: 1.75,
    margin: "0 0 14px",
    maxWidth: 300,
    marginLeft: "auto",
    marginRight: "auto",
  },
  thankDivider: {
    color: GOLD,
    fontSize: 14,
    marginBottom: 10,
  },
  thankBrand: {
    fontSize: 15,
    fontWeight: 700,
    color: GOLD,
    fontFamily: "'Playfair Display', Georgia, serif",
    letterSpacing: "0.22em",
    marginBottom: 3,
  },
  thankTagline: {
    fontSize: 9,
    color: `${GOLD}88`,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
  },

  tickOuter: {
    marginBottom: 24,
  },

  title: {
    fontSize: 22,
    fontWeight: 700,
    color: NAVY,
    margin: "0 0 10px",
    fontFamily: "'Playfair Display', Georgia, serif",
    letterSpacing: 0.2,
  },

  subtitle: {
    fontSize: 13.5,
    color: "#6b7280",
    lineHeight: 1.7,
    margin: "0 0 28px",
    maxWidth: 340,
  },

  summaryCard: {
    width: "100%",
    border: "1px solid #e8e0d0",
    borderRadius: 10,
    overflow: "hidden",
    marginBottom: 16,
    background: "#fdfcf9",
  },

  summaryHeader: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#aaa",
    padding: "10px 16px",
    borderBottom: "1px solid #e8e0d0",
    textAlign: "left",
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #f0ece4",
  },

  rowLabel: {
    fontSize: 13,
    color: "#888",
    fontWeight: 400,
  },

  rowValue: {
    fontSize: 13.5,
    fontWeight: 600,
    color: NAVY,
    maxWidth: "58%",
    textAlign: "right",
    wordBreak: "break-all",
  },

  notice: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    width: "100%",
    background: "#fffdf5",
    border: `1px solid ${GOLD}33`,
    borderRadius: 8,
    padding: "12px 14px",
    marginBottom: 24,
    textAlign: "left",
  },

  noticeDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: GOLD,
    flexShrink: 0,
    marginTop: 5,
  },

  noticeText: {
    fontSize: 12.5,
    color: "#555",
    lineHeight: 1.65,
    margin: 0,
  },

  noticeEmail: {
    color: GOLD,
    textDecoration: "none",
    fontWeight: 600,
  },

  actions: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    width: "100%",
    marginBottom: 20,
  },

  btnPrimary: {
    width: "100%",
    padding: "13px",
    background: NAVY,
    color: GOLD,
    border: `1px solid ${GOLD}`,
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: "0.06em",
    cursor: "pointer",
    fontFamily: "'Playfair Display', Georgia, serif",
  },

  btnSecondary: {
    width: "100%",
    padding: "13px",
    background: "#fff",
    color: "#555",
    border: "1px solid #ddd",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: "0.04em",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  support: {
    fontSize: 12,
    color: "#aaa",
  },

  supportLink: {
    color: GOLD,
    textDecoration: "none",
    fontWeight: 500,
  },
};
