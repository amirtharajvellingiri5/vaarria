import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import logo from "../assets/logo.png";

function OrderSuccess() {
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
    <div style={styles.page}>
      <div style={{ ...styles.card, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(18px)", transition: "opacity 0.45s ease, transform 0.45s ease" }}>

        {/* Dark header */}
        <div style={styles.headerBand}>
          <img src={logo} alt="Aarria" style={styles.logo} />
          <p style={styles.brandTagline}>curated for the modern woman</p>

          {/* Green tick ring */}
          <div style={styles.tickRing}>
            <div style={styles.tickInner}>
              <Check size={30} color="#fff" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={styles.body}>
          <h1 style={styles.title}>Order Confirmed</h1>
          <p style={styles.subtitle}>
            Your order is on its way to becoming your new favourite.
            <br />
            We'll send a confirmation to your email shortly.
          </p>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <div style={styles.dividerDot} />
            <div style={styles.dividerLine} />
          </div>

          {/* Info grid */}
          <div style={styles.infoGrid}>
            <InfoCell label="Order ID" value={order.order_id} fullWidth />
            <InfoCell label="Payment ID" value={order.payment_id} />
            <InfoCell label="Amount Paid" value={`₹${order.amount}`} accent />
          </div>

          {/* Delivery notice */}
          <div style={styles.deliveryBox}>
            <div style={styles.deliveryIconWrap}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
                <rect x="9" y="11" width="14" height="10" rx="2" />
                <circle cx="12" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              </svg>
            </div>
            <div>
              <p style={styles.deliveryStrong}>Estimated Delivery: {order.estimated_delivery}</p>
              <p style={styles.deliveryText}>
                Thoughtfully packed and on its way to you. Tracking details will be sent once dispatched.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button style={styles.btnPrimary} onClick={() => navigate("/orders")}>
              View Orders
            </button>
            <button style={styles.btnSecondary} onClick={() => navigate("/")}>
              Keep Shopping
            </button>
          </div>

          <p style={styles.footerNote}>Need help? Contact us at support@aarria.in</p>
        </div>
      </div>
    </div>
  );
}

function InfoCell({ label, value, fullWidth, accent }) {
  return (
    <div style={{ ...styles.infoCell, ...(fullWidth ? styles.infoCellFull : {}) }}>
      <p style={styles.infoLabel}>{label}</p>
      <p style={{ ...styles.infoValue, ...(accent ? styles.infoValueAccent : {}) }}>{value}</p>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f4f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    fontFamily: "'Jost', 'Segoe UI', sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: 560,
    background: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    boxShadow: "0 8px 48px rgba(0,0,0,0.10)",
  },

  /* ── Header band ── */
  headerBand: {
    background: "#1a1a1a",
    padding: "2rem 2.5rem 0",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  logo: {
    height: 56,
    width: "auto",
    objectFit: "contain",
    filter: "brightness(0) invert(1)",   // makes any coloured logo white
  },

  brandTagline: {
    fontSize: 10,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    color: "#888",
    marginTop: 6,
    marginBottom: 0,
  },

  /* Green tick ring sits half-in / half-out the header */
  tickRing: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: -36,          // pulls it over the body section
    zIndex: 2,
    position: "relative",
    boxShadow: "0 0 0 6px #1a1a1a",  // matches header so ring looks inset
  },

  tickInner: {
    width: 56,
    height: 56,
    borderRadius: "50%",
    background: "#22c55e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── Body ── */
  body: {
    padding: "3.25rem 2.5rem 2.5rem",   // extra top padding for the overlapping ring
  },

  title: {
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 32,
    fontWeight: 400,
    color: "#111",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 13.5,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 1.65,
    fontWeight: 300,
    marginBottom: 28,
  },

  divider: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 24,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    background: "#e5e7eb",
  },

  dividerDot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "#22c55e",
  },

  /* ── Info cells ── */
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 20,
  },

  infoCell: {
    background: "#f9fafb",
    border: "1px solid #f0f0f0",
    borderRadius: 12,
    padding: "14px 16px",
  },

  infoCellFull: {
    gridColumn: "1 / -1",
  },

  infoLabel: {
    fontSize: 10,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#9ca3af",
    marginBottom: 5,
  },

  infoValue: {
    fontSize: 14,
    fontWeight: 600,
    color: "#111827",
    wordBreak: "break-all",
  },

  infoValueAccent: {
    color: "#22c55e",
  },

  /* ── Delivery notice ── */
  deliveryBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    padding: "14px 16px",
    borderRadius: 12,
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    marginBottom: 24,
  },

  deliveryIconWrap: {
    marginTop: 2,
    flexShrink: 0,
  },

  deliveryStrong: {
    fontSize: 13,
    fontWeight: 600,
    color: "#15803d",
    marginBottom: 3,
  },

  deliveryText: {
    fontSize: 12.5,
    color: "#4b5563",
    lineHeight: 1.55,
  },

  /* ── Buttons ── */
  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 20,
  },

  btnPrimary: {
    padding: "13px 16px",
    background: "#1a1a1a",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 11,
    fontFamily: "'Jost', 'Segoe UI', sans-serif",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    fontWeight: 600,
    cursor: "pointer",
  },

  btnSecondary: {
    padding: "13px 16px",
    background: "#fff",
    color: "#1a1a1a",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    fontSize: 11,
    fontFamily: "'Jost', 'Segoe UI', sans-serif",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    fontWeight: 600,
    cursor: "pointer",
  },

  footerNote: {
    textAlign: "center",
    fontSize: 11.5,
    color: "#9ca3af",
    letterSpacing: "0.02em",
  },
};

export default OrderSuccess;
