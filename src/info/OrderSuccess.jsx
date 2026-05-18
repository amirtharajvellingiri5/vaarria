import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, Package } from "lucide-react";
import logo from "../assets/logo.png";

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  const order = location.state;

  useEffect(() => {
    if (!order) { navigate("/"); return; }
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, [order, navigate]);

  if (!order) return null;

  return (
    <div style={s.page}>
      <div
        style={{
          ...s.card,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.4s ease, transform 0.4s ease",
        }}
      >
        {/* ── Logo ── */}
        <div style={s.logoArea}>
          <img src={logo} alt="Aarria" style={s.logo} />
        </div>

        {/* ── Green tick ── */}
        <div style={s.tickWrap}>
          <div style={s.tickCircle}>
            <Check size={36} color="#fff" strokeWidth={2.8} />
          </div>
        </div>

        {/* ── Heading ── */}
        <h1 style={s.title}>Order Confirmed!</h1>
        <p style={s.subtitle}>
          Thank you for shopping with Aarria.{"\n"}
          A confirmation has been sent to your email.
        </p>

        {/* ── Divider ── */}
        <div style={s.dividerRow}>
          <div style={s.dividerLine} />
          <span style={s.dividerLabel}>Order Summary</span>
          <div style={s.dividerLine} />
        </div>

        {/* ── Info rows ── */}
        <div style={s.infoBox}>
          <InfoRow label="Order ID"    value={order.order_id} />
          <InfoRow label="Payment ID"  value={order.payment_id} />
          <InfoRow label="Amount Paid" value={`₹${order.amount}`} highlight />
          <InfoRow label="Delivery By" value={order.estimated_delivery} last />
        </div>

        {/* ── Delivery notice ── */}
        <div style={s.deliveryBanner}>
          <Package size={18} color="#16a34a" strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={s.deliveryText}>
            Your order is being prepared and will be dispatched soon.
            You'll receive tracking info via email once it ships.
          </p>
        </div>

        {/* ── Actions ── */}
        <div style={s.actions}>
          <button style={s.btnPrimary}   onClick={() => navigate("/orders")}>
            View My Orders
          </button>
          <button style={s.btnSecondary} onClick={() => navigate("/")}>
            Continue Shopping
          </button>
        </div>

        <p style={s.supportNote}>
          Questions?&nbsp;
          <a href="mailto:support@aarria.in" style={s.supportLink}>
            support@aarria.in
          </a>
        </p>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight, last }) {
  return (
    <div style={{ ...s.infoRow, ...(last ? { borderBottom: "none" } : {}) }}>
      <span style={s.infoLabel}>{label}</span>
      <span style={{ ...s.infoValue, ...(highlight ? s.infoHighlight : {}) }}>
        {value}
      </span>
    </div>
  );
}

/* ─────────────────────────── Styles ─────────────────────────── */
const PINK  = "#ff3f6c";
const GREEN = "#16a34a";
const BORDER = "#ede8e3";

const s = {
  page: {
    minHeight: "100vh",
    background: "#faf8f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: 520,
    background: "#ffffff",
    borderRadius: 16,
    border: `1px solid ${BORDER}`,
    boxShadow: "0 4px 32px rgba(0,0,0,0.07)",
    padding: "36px 36px 28px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },

  logoArea: { marginBottom: 2 },

  logo: {
    height: 120,
    width: "auto",
    objectFit: "contain",
  },

  tickWrap: { marginBottom: 0 },

  tickCircle: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: GREEN,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 0 10px #dcfce7",
  },

  title: {
    fontSize: 26,
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 8px",
    letterSpacing: "-0.3px",
  },

  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 1.65,
    whiteSpace: "pre-line",
    margin: "0 0 28px",
  },

  dividerRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    marginBottom: 16,
  },
  dividerLine: { flex: 1, height: 1, background: BORDER },
  dividerLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#9ca3af",
    whiteSpace: "nowrap",
  },

  infoBox: {
    width: "100%",
    border: `1px solid ${BORDER}`,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 14,
    background: "#fdfcfb",
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "13px 18px",
    borderBottom: `1px solid ${BORDER}`,
  },

  infoLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: 400,
  },

  infoValue: {
    fontSize: 13.5,
    fontWeight: 600,
    color: "#111827",
    maxWidth: "55%",
    textAlign: "right",
    wordBreak: "break-all",
  },

  infoHighlight: {
    color: GREEN,
    fontSize: 15,
  },

  deliveryBanner: {
    display: "flex",
    alignItems: "flex-start",
    gap: 10,
    width: "100%",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: 10,
    padding: "12px 16px",
    marginBottom: 24,
    textAlign: "left",
  },

  deliveryText: {
    fontSize: 12.5,
    color: "#374151",
    lineHeight: 1.6,
    margin: 0,
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
    background: PINK,
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 13.5,
    fontWeight: 700,
    letterSpacing: "0.04em",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  btnSecondary: {
    width: "100%",
    padding: "13px",
    background: "#fff",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 13.5,
    fontWeight: 600,
    letterSpacing: "0.04em",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  supportNote: {
    fontSize: 12,
    color: "#9ca3af",
  },

  supportLink: {
    color: PINK,
    textDecoration: "none",
    fontWeight: 500,
  },
};
