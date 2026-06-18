import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";

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

        {/* ── Logo ── */}
        <img src={logo} alt="Aarria" style={s.logo} />

        {/* ── Animated tick ── */}
        <div style={s.tickOuter}>
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="34" fill="none" stroke="#e8f5e9" strokeWidth="4" />
            <circle
              cx="36" cy="36" r="34"
              fill="none"
              stroke="#2e7d32"
              strokeWidth="3"
              strokeDasharray="213"
              strokeDashoffset={checked ? 0 : 213}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.6s ease", transformOrigin: "center", transform: "rotate(-90deg)" }}
            />
            <polyline
              points="22,37 32,47 50,28"
              fill="none"
              stroke="#2e7d32"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="40"
              strokeDashoffset={checked ? 0 : 40}
              style={{ transition: "stroke-dashoffset 0.4s ease 0.5s" }}
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

  logo: {
    height: 48,
    width: "auto",
    objectFit: "contain",
    marginBottom: 28,
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
