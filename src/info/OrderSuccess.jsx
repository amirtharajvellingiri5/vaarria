import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import logo from "../assets/logo.png";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const order = location.state;

  if (!order) {
    navigate("/");
    return null;
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <a href="/" style={styles.logoLink}>
          <img src={logo} alt="Logo" style={styles.logo} />
        </a>

        <div style={styles.tickWrapper}>
  <CheckCircle size={90} color="#22c55e" />
</div>

        <h1 style={styles.title}>Order Confirmed</h1>

        <p style={styles.subtitle}>
          Thank you for shopping with Aarria.
        </p>

        <div style={styles.infoBox}>
          <Row label="Order ID" value={order.order_id} />
          <Row label="Payment ID" value={order.payment_id} />
          <Row label="Amount Paid" value={`₹${order.amount}`} />
          <Row label="Delivery By" value={order.estimated_delivery} />
        </div>

        <div style={styles.actions}>
          <button
            style={styles.primaryBtn}
            onClick={() => navigate("/orders")}
          >
            VIEW ORDERS
          </button>

          <button
            style={styles.secondaryBtn}
            onClick={() => navigate("/")}
          >
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={styles.row}>
      <span style={styles.label}>{label}</span>
      <span style={styles.value}>{value}</span>
    </div>
  );
}

const styles = {
  tickWrapper: {
  display: "flex",
  justifyContent: "center",
  width: "100%",
},
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },

  card: {
    width: "100%",
    maxWidth: 600,
    background: "#fff",
    borderRadius: 20,
    padding: 40,
    boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
    textAlign: "center"
  },

  logoLink: {
    display: "inline-block",
    marginBottom: 0
  },

  logo: {
    height: 140,
    width: "auto",
    objectFit: "contain"
  },

  title: {
    fontSize: 32,
    marginTop: 20,
    marginBottom: 10,
    color: "#111827"
  },

  subtitle: {
    color: "#6b7280",
    marginBottom: 30
  },

  infoBox: {
    background: "#f9fafb",
    borderRadius: 16,
    padding: 20,
    marginBottom: 30
  },

  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb"
  },

  label: {
    color: "#6b7280",
    fontWeight: 500
  },

  value: {
    color: "#111827",
    fontWeight: 700
  },

  actions: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap"
  },

  primaryBtn: {
    background: "#ff3f6c",
    color: "#fff",
    border: "none",
    padding: "14px 24px",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer"
  },

  secondaryBtn: {
    background: "#fff",
    color: "#111827",
    border: "1px solid #d1d5db",
    padding: "14px 24px",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer"
  }
};

export default OrderSuccess;