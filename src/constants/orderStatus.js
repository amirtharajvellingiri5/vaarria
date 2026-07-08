// Single source of truth for order statuses the backend can set
// (must stay in sync with ADMIN_STATUSES in orders_handler/orders.py).
export const ORDER_STATUS_KEYS = [
  'CREATED',
  'PLACED',
  'CONFIRMED',
  'SHIPPED',
  'OUT',
  'DELIVERED',
  'CANCELLED',
  'RETURN_INITIATED',
  'RETURNED',
  'REFUND_INITIATED',
  'REFUND_CREDITED',
]

// Statuses where the delivery timeline is done/stopped rather than progressing.
export const CLOSED_ORDER_STATUSES = [
  'DELIVERED',
  'CANCELLED',
  'RETURN_INITIATED',
  'RETURNED',
  'REFUND_INITIATED',
  'REFUND_CREDITED',
]
