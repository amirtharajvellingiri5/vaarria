import React from 'react'
import {
  X,
  Printer,
  Truck,
  XCircle,
} from 'lucide-react'
import {
  STATUS_LABELS,
  formatAmount,
} from './ordersData'
import './customer-orders.css'

function OrderDetailsModal({
  order,
  isOpen,
  onClose,
}) {
  if (!isOpen || !order) return null

  return (
    <div
      className="order-modal-overlay"
      onClick={onClose}
    >
      <div
        className="order-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="detail-header">
          <div>
            <div className="detail-order-id">
              {order.id}
            </div>

            <div className="detail-meta">
              <span>{order.date}</span>
              <span>•</span>
              <span>{order.payment}</span>

              <span
                className={`badge badge-${order.status}`}
              >
                {STATUS_LABELS[order.status]}
              </span>
            </div>
          </div>

          <button
            className="close-btn"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <div className="detail-grid">
          <div className="detail-section">
            <h4>Customer</h4>

            <DetailRow
              label="Name"
              value={order.customer}
            />

            <DetailRow
              label="Email"
              value={`${order.customer
                .split(' ')[0]
                .toLowerCase()}@email.com`}
            />

            <DetailRow
              label="Phone"
              value="+91 98xxx xxxxx"
            />
          </div>

          <div className="detail-section">
            <h4>Shipping Address</h4>

            <DetailRow
              label="City"
              value="Bengaluru"
            />

            <DetailRow
              label="State"
              value="Karnataka"
            />

            <DetailRow
              label="PIN"
              value="56001x"
            />
          </div>
        </div>

        <div
          className="detail-section"
          style={{ marginTop: '1rem' }}
        >
          <h4>Order Summary</h4>

          <DetailRow
            label="Items ordered"
            value={`${order.items} item${
              order.items > 1 ? 's' : ''
            }`}
          />

          <DetailRow
            label="Subtotal"
            value={formatAmount(order.amount)}
          />

          <DetailRow
            label="Shipping"
            value="Free"
            valueClass="success-text"
          />

          <DetailRow
            label="Total"
            value={formatAmount(order.amount)}
            valueClass="detail-total"
          />
        </div>

        <div className="detail-actions">
          <button className="btn-primary">
            <Printer size={16} />
            Invoice
          </button>

          <button className="btn-secondary">
            <Truck size={16} />
            Track
          </button>

          <button className="btn-danger">
            <XCircle size={16} />
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function DetailRow({
  label,
  value,
  valueClass = '',
}) {
  return (
    <div className="detail-row">
      <span>{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  )
}

export default OrderDetailsModal