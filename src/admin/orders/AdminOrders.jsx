import React, {
  useMemo,
  useState,
  useEffect,
} from 'react'
import {
  Search,
  RefreshCw,
  SlidersHorizontal,
  MoreHorizontal,
} from 'lucide-react'

import './customer-orders.css'

import OrderDetailsModal from './OrderDetailsModal'
import {
  ORDERS,
  STATUS_COUNTS,
  STATUS_LABELS,
  TABS,
  formatAmount,
} from './ordersData'

const PER_PAGE = 8

function AdminOrders() {
  const [activeTab, setActiveTab] =
    useState('all')
  const [searchQuery, setSearchQuery] =
    useState('')
  const [paymentFilter, setPaymentFilter] =
    useState('')
  const [selectedOrders, setSelectedOrders] =
    useState([])
  const [selectedOrder, setSelectedOrder] =
    useState(null)
  const [showDetailModal, setShowDetailModal] =
    useState(false)
  const [currentPage, setCurrentPage] =
    useState(1)
  const [sortKey, setSortKey] = useState('')
  const [openMenu, setOpenMenu] =
    useState(null)

  useEffect(() => {
    const closeMenu = () => setOpenMenu(null)
    window.addEventListener('click', closeMenu)

    return () =>
      window.removeEventListener(
        'click',
        closeMenu
      )
  }, [])

  const filteredOrders = useMemo(() => {
    let data = [...ORDERS]

    if (activeTab !== 'all') {
      data = data.filter(
        (order) => order.status === activeTab
      )
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()

      data = data.filter(
        (order) =>
          order.id.toLowerCase().includes(q) ||
          order.customer.toLowerCase().includes(q)
      )
    }

    if (paymentFilter) {
      data = data.filter(
        (order) =>
          order.payment === paymentFilter
      )
    }

    if (sortKey === 'amount') {
      data.sort((a, b) => b.amount - a.amount)
    }

    if (sortKey === 'id') {
      data.sort((a, b) =>
        b.id.localeCompare(a.id)
      )
    }

    return data
  }, [
    activeTab,
    searchQuery,
    paymentFilter,
    sortKey,
  ])

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PER_PAGE
    return filteredOrders.slice(
      start,
      start + PER_PAGE
    )
  }, [filteredOrders, currentPage])

  useEffect(() => {
    setCurrentPage(1)
    setSelectedOrders([])
  }, [
    activeTab,
    searchQuery,
    paymentFilter,
  ])

  const toggleSelectAll = () => {
    if (
      selectedOrders.length ===
      paginatedOrders.length
    ) {
      setSelectedOrders([])
      return
    }

    setSelectedOrders(
      paginatedOrders.map((o) => o.id)
    )
  }

  const toggleSelection = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    )
  }

  const openDetails = (order) => {
    setSelectedOrder(order)
    setShowDetailModal(true)
    setOpenMenu(null)
  }

  return (
    <>
      <div className="page">
        <div className="page-header">
          <div>
            <div className="page-title">
              Orders
            </div>
            <div className="page-sub">
              Manage and track all customer
              orders
            </div>
          </div>
        </div>

        <div className="stats-row">
          <StatCard
            label="Total orders"
            value="1,284"
            delta="↑ 12% this month"
          />
          <StatCard
            label="Revenue"
            value="₹4.2L"
            delta="↑ 8.3% this month"
          />
          <StatCard
            label="Pending"
            value="38"
            delta="Needs attention"
          />
          <StatCard
            label="Cancelled"
            value="14"
            delta="↑ 2 from last week"
            negative
          />
          <StatCard
            label="Avg order value"
            value="₹3,270"
            delta="↑ 4.1%"
          />
        </div>

        <div className="tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`tab ${
                activeTab === tab.key
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                setActiveTab(tab.key)
              }
            >
              {tab.label}
              <span className="tab-count">
                {STATUS_COUNTS[tab.key]}
              </span>
            </button>
          ))}
        </div>

        <div className="toolbar">
          <div className="search-wrap">
            <Search
              size={16}
              className="search-icon"
            />

            <input
              className="search-input"
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(
                  e.target.value
                )
              }
              placeholder="Search by order ID, customer…"
            />
          </div>

          <select
            className="filter"
            value={paymentFilter}
            onChange={(e) =>
              setPaymentFilter(
                e.target.value
              )
            }
          >
            <option value="">
              All payments
            </option>
            <option>UPI</option>
            <option>Card</option>
            <option>COD</option>
            <option>Netbanking</option>
          </select>

          <button className="btn-icon">
            <RefreshCw size={16} />
          </button>

          <button className="btn-icon">
            <SlidersHorizontal size={16} />
          </button>
        </div>

        {selectedOrders.length > 0 && (
          <div className="bulk-bar">
            {selectedOrders.length} orders
            selected
          </div>
        )}

        <div className="table-wrap">
          <table className="orders-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    onChange={
                      toggleSelectAll
                    }
                  />
                </th>

                <th
                  onClick={() =>
                    setSortKey('id')
                  }
                >
                  Order ID
                </th>

                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>

                <th
                  onClick={() =>
                    setSortKey(
                      'amount'
                    )
                  }
                >
                  Amount
                </th>

                <th>Payment</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {paginatedOrders.map(
                (order) => (
                  <tr key={order.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(
                          order.id
                        )}
                        onChange={() =>
                          toggleSelection(
                            order.id
                          )
                        }
                      />
                    </td>

                    <td>
                      <strong>
                        {order.id}
                      </strong>
                    </td>

                    <td>
                      <div className="customer-cell">
                        <div
                          className={`avatar ${order.avatarClass}`}
                        >
                          {
                            order.initials
                          }
                        </div>

                        <span>
                          {
                            order.customer
                          }
                        </span>
                      </div>
                    </td>

                    <td>{order.date}</td>

                    <td>
                      {order.items} item
                      {order.items > 1
                        ? 's'
                        : ''}
                    </td>

                    <td>
                      {formatAmount(
                        order.amount
                      )}
                    </td>

                    <td>
                      {order.payment}
                    </td>

                    <td>
                      <span
                        className={`badge badge-${order.status}`}
                      >
                        {
                          STATUS_LABELS[
                            order
                              .status
                          ]
                        }
                      </span>
                    </td>

                    <td>
                      <div
                        className="action-menu"
                        onClick={(e) =>
                          e.stopPropagation()
                        }
                      >
                        <button
                          className="btn-icon"
                          onClick={() =>
                            setOpenMenu(
                              openMenu ===
                                order.id
                                ? null
                                : order.id
                            )
                          }
                        >
                          <MoreHorizontal
                            size={16}
                          />
                        </button>

                        {openMenu ===
                          order.id && (
                          <div className="dropdown">
                            <div
                              className="dropdown-item"
                              onClick={() =>
                                openDetails(
                                  order
                                )
                              }
                            >
                              View
                              details
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span>
            Showing{' '}
            {
              paginatedOrders.length
            }{' '}
            of{' '}
            {
              filteredOrders.length
            }{' '}
            orders
          </span>

          <div
            style={{
              display: 'flex',
              gap: '8px',
            }}
          >
            <button
              className="btn-icon"
              disabled={
                currentPage === 1
              }
              onClick={() =>
                setCurrentPage(
                  (p) => p - 1
                )
              }
            >
              Prev
            </button>

            <button
              className="btn-icon"
              disabled={
                currentPage *
                  PER_PAGE >=
                filteredOrders.length
              }
              onClick={() =>
                setCurrentPage(
                  (p) => p + 1
                )
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <OrderDetailsModal
        order={selectedOrder}
        isOpen={showDetailModal}
        onClose={() =>
          setShowDetailModal(false)
        }
      />
    </>
  )
}

function StatCard({
  label,
  value,
  delta,
  negative,
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">
        {label}
      </div>
      <div className="stat-val">
        {value}
      </div>
      <div
        className={`stat-delta ${
          negative ? 'neg' : ''
        }`}
      >
        {delta}
      </div>
    </div>
  )
}

export default AdminOrders