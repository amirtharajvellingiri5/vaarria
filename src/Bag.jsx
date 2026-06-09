import React, { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { create } from 'zustand'
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
  Trash2,
  MapPin,
  Home,
  Edit3,
} from 'lucide-react'

import axios from 'axios'
import logo from './assets/logo.jpg'
import './constants/global.css'

import CouponModal from './modals/CouponModal'
import AddressModal from './modals/AddressModal'

function SkeletonPulse({ style = {} }) {
  return (
    <div
      style={{
        background:
          'linear-gradient(90deg, #f1f2f4 25%, #e7e8eb 37%, #f1f2f4 63%)',
        backgroundSize: '400% 100%',
        animation: 'skeleton-loading 1.4s ease infinite',
        borderRadius: 6,
        ...style,
      }}
    />
  )
}

function BagItemSkeleton() {
  return (
    <div style={styles.itemCard}>
      <div
        style={{
          ...styles.checkbox,
          background: '#f1f2f4',
          borderColor: '#f1f2f4',
        }}
      />
      <div style={styles.itemThumb}>
        <SkeletonPulse
          style={{ width: '100%', height: '100%', borderRadius: 8 }}
        />
      </div>
      <div style={styles.itemBody}>
        <SkeletonPulse style={{ width: '82%', height: 14 }} />
        <SkeletonPulse style={{ width: '65%', height: 12, marginTop: 8 }} />
        <div style={styles.itemAttrs}>
          <SkeletonPulse style={{ width: 72, height: 28, borderRadius: 6 }} />
          <SkeletonPulse style={{ width: 94, height: 28, borderRadius: 6 }} />
        </div>
        <div style={styles.pricingRow}>
          <SkeletonPulse style={{ width: 72, height: 18 }} />
          <SkeletonPulse style={{ width: 52, height: 12 }} />
          <SkeletonPulse style={{ width: 62, height: 12 }} />
        </div>
        <SkeletonPulse style={{ width: 120, height: 12, marginTop: 8 }} />
        <SkeletonPulse style={{ width: 150, height: 12, marginTop: 8 }} />
      </div>
      <SkeletonPulse style={{ width: 20, height: 20, borderRadius: 4 }} />
    </div>
  )
}

function PricePanelSkeleton() {
  return (
    <div style={styles.panelCard}>
      <SkeletonPulse style={{ width: 100, height: 10, marginBottom: 16 }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SkeletonPulse style={{ width: '100%', height: 14 }} />
        <SkeletonPulse style={{ width: '100%', height: 14 }} />
        <SkeletonPulse style={{ width: '100%', height: 14 }} />
        <SkeletonPulse style={{ width: '100%', height: 14 }} />
      </div>
      <div style={styles.priceDivider} />
      <SkeletonPulse style={{ width: '100%', height: 18 }} />
      <SkeletonPulse
        style={{ width: '100%', height: 48, borderRadius: 8, marginTop: 18 }}
      />
    </div>
  )
}

// ─── Zustand Store ────────────────────────────────────────────────────────────
const useBagStore = create((set, get) => ({
  items: [],

  // ── coupon state ──────────────────────────────────────────────────────────
  // Set of bag_ids whose coupon is currently toggled ON
  appliedCouponIds: new Set(),

  toggleCoupon: (bagId) =>
    set((s) => {
      const next = new Set(s.appliedCouponIds)
      next.has(bagId) ? next.delete(bagId) : next.add(bagId)
      return { appliedCouponIds: next }
    }),

  // Derived: total coupon savings across SELECTED items with coupon toggled ON.
  // Call as a selector: useBagStore(s => s.getCouponSavings())
  // Or just read inside components via get().
  getCouponSavings: () => {
    const { items, appliedCouponIds } = get()
    return items
      .filter(
        (i) => i.selected && appliedCouponIds.has(i.id) && i.couponDiscount > 0,
      )
      .reduce((sum, i) => {
        if (i.discountType === 'PERCENTAGE') {
          return sum + Math.round((i.price * i.qty * i.couponDiscount) / 100)
        }
        // FLAT
        return sum + i.couponDiscount * i.qty
      }, 0)
  },

  // ── other existing state ──────────────────────────────────────────────────
  platformFee: 23,
  donationAmount: 0,
  mobileMenuOpen: false,

  setItems: (items) => set({ items }),

  toggleSelected: (id) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.id === id ? { ...i, selected: !i.selected } : i,
      ),
    })),

  removeItem: (id) =>
    set((s) => ({ items: s.items.filter((i) => i.id !== id) })),

  updateQty: (id, delta) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i,
      ),
    })),

  setDonation: (amt) =>
    set((s) => ({ donationAmount: s.donationAmount === amt ? 0 : amt })),

  toggleMobileMenu: () => set((s) => ({ mobileMenuOpen: !s.mobileMenuOpen })),
}))

// ─── Mock fetch (TanStack Query) ──────────────────────────────────────────────
const fetchPinDetails = async (pin) => {
  if (!/^\d{6}$/.test(pin)) {
    throw new Error('Please enter a valid 6-digit PIN code')
  }

  const response = await fetch(`https://api.postalpincode.in/pincode/${pin}`)

  if (!response.ok) {
    throw new Error('Unable to check delivery')
  }

  const data = await response.json()

  if (
    !Array.isArray(data) ||
    !data[0] ||
    data[0].Status !== 'Success' ||
    !data[0].PostOffice ||
    data[0].PostOffice.length === 0
  ) {
    throw new Error('Sorry, this PIN code is not serviceable')
  }

  const office = data[0].PostOffice[0]

  const deliveryDate = new Date()
  deliveryDate.setDate(deliveryDate.getDate() + 4)

  return {
    city: office.District,
    state: office.State,
    deliveryDate: deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }),
  }
}
// ─── Sub-components ──────────────────────────────────────────────────────────

function Navbar() {
  const { mobileMenuOpen, toggleMobileMenu } = useBagStore()
  return (
    <nav style={styles.navbar}>
      <div style={styles.navLogo}>
        <a href='/'>
          <img src={logo} alt='logo' style={styles.logoImg} />
        </a>
      </div>
      <div style={styles.navSteps}>
        <span style={{ ...styles.step, ...styles.stepActive }}>
          <ShoppingBag size={13} style={{ marginRight: 4 }} />
          BAG
        </span>
        <span style={styles.stepDivider}>············</span>
        <span style={styles.step}>PAYMENT</span>
      </div>
      <div style={styles.navRight}>
        <div style={styles.navSecure}>
          <ShieldCheck size={15} color='#4caf50' />
          <span>100% SECURE</span>
        </div>
        <button
          onClick={toggleMobileMenu}
          style={styles.mobileMenuBtn}
          aria-label='menu'
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </nav>
  )
}
function PinBar() {
  const [pin, setPin] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [openAddress, setOpenAddress] = useState(false)
  const [shouldRefetch, setShouldRefetch] = useState(0)

  const [defaultAddress, setDefaultAddress] = useState(null)
  const [addresses, setAddresses] = useState([])
  const [loadingAddress, setLoadingAddress] = useState(false)
  const [validationError, setValidationError] = useState('')

  const token = localStorage.getItem('jwt_token')
  const customer = JSON.parse(localStorage.getItem('customer') || 'null')

  const isLoggedIn = !!token && !!customer
  const customerId = customer?.customer_id

  const handleDeleteSuccess = () => {
    setShouldRefetch((c) => c + 1)
  }

  const handleSelectAddress = (address) => {
    localStorage.setItem('selected_address', JSON.stringify(address))
    setDefaultAddress(address)
    setOpenAddress(false)
  }

  const handleCloseAddress = () => {
    setOpenAddress(false)
    setShouldRefetch((c) => c + 1) // only increments on close, not open
  }
  useEffect(() => {
    const fetchDefaultAddress = async () => {
      if (!isLoggedIn || !customerId) return

      try {
        if (!defaultAddress) {
          setLoadingAddress(true)
        }

        const response = await fetch(
          `https://api.aarria.com/api/addresses?customer_id=${customerId}`,
        )

        if (!response.ok) {
          throw new Error('Failed to fetch address')
        }

        const data = await response.json()

        if (data?.items?.length > 0) {
          setAddresses(data.items)

          const primary = data.items.find((a) => a.is_default)
          setDefaultAddress(primary || data.items[0])
          localStorage.setItem(
            'selected_address',
            JSON.stringify(primary || data.items[0]),
          )
        } else {
          setAddresses([])
          setDefaultAddress(null)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoadingAddress(false)
      }
    }

    fetchDefaultAddress()
  }, [isLoggedIn, customerId, shouldRefetch])

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['pin', pin],
    queryFn: () => fetchPinDetails(pin),
    enabled: submitted && !isLoggedIn,
    retry: false,
  })

  const handleCheck = () => {
    if (!pin.trim()) {
      setValidationError('Enter PIN code')
      return
    }

    if (!/^\d{6}$/.test(pin)) {
      setValidationError('Enter valid 6-digit PIN code')
      return
    }

    setValidationError('')
    setSubmitted(true)
  }
  if (isLoggedIn) {
    return (
      <>
        <div
          style={{
            background: '#fff',
            border: '1px solid #ebecef',
            borderRadius: 4,
            marginBottom: 14,
            overflow: 'hidden',
            minHeight: 110,
          }}
        >
          {/* Header strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 16px',
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Truck size={14} color='#ff3f6c' />
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: '#282c3f',
                  textTransform: 'uppercase',
                }}
              >
                Delivery Address
              </span>
            </div>
            <button
              onClick={() => setOpenAddress(true)}
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#ff3f6c',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                letterSpacing: 0.5,
                padding: 0,
              }}
            >
              {defaultAddress ? 'CHANGE' : 'ADD ADDRESS'}
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '12px 16px' }}>
            {loadingAddress ? (
              <div
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}
              >
                <SkeletonPulse
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    marginTop: 4,
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <SkeletonPulse style={{ width: 140, height: 20 }} />
                    <SkeletonPulse
                      style={{
                        width: 52,
                        height: 24,
                        borderRadius: 4,
                      }}
                    />
                  </div>

                  <SkeletonPulse
                    style={{
                      width: '95%',
                      height: 16,
                      marginBottom: 8,
                    }}
                  />

                  <SkeletonPulse
                    style={{
                      width: '72%',
                      height: 16,
                    }}
                  />
                </div>
              </div>
            ) : defaultAddress ? (
              <div
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}
              >
                <MapPin
                  size={16}
                  color='#ff3f6c'
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      marginBottom: 4,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#282c3f',
                      }}
                    >
                      {defaultAddress.full_name}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#ff3f6c',
                        border: '1px solid #ff3f6c',
                        borderRadius: 2,
                        padding: '1px 6px',
                        letterSpacing: 0.5,
                      }}
                    >
                      {defaultAddress.address_type?.toUpperCase() || 'HOME'}
                    </span>
                  </div>
                  <div
                    style={{ fontSize: 13, color: '#535766', lineHeight: 1.5 }}
                  >
                    {defaultAddress.address_line_1}
                    {defaultAddress.address_line_2
                      ? `, ${defaultAddress.address_line_2}`
                      : ''}
                    ,&nbsp;
                    {defaultAddress.city}, {defaultAddress.state} —{' '}
                    <span style={{ fontWeight: 700, color: '#282c3f' }}>
                      {defaultAddress.pincode}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MapPin size={15} color='#94969f' />
                <span style={{ fontSize: 13, color: '#94969f' }}>
                  No address saved. Add one to continue.
                </span>
              </div>
            )}
          </div>
        </div>
        <AddressModal
          open={openAddress}
          onClose={handleCloseAddress}
          addresses={addresses}
          selectedAddress={defaultAddress}
          onSelectAddress={handleSelectAddress}
          onDeleteSuccess={handleDeleteSuccess}
        />
      </>
    )
  }
  return (
    <div
      style={{
        ...styles.pinBar,
        flexDirection: 'column',
        alignItems: 'stretch',
        gap: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Truck size={16} style={{ color: '#ff3f6c' }} />

        <input
          style={styles.pinInput}
          placeholder='Enter PIN code'
          value={pin}
          maxLength={6}
          inputMode='numeric'
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, ''))
            setSubmitted(false)
            setValidationError('')
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
        />

        <button style={styles.addressCheckBtn} onClick={handleCheck}>
          check
        </button>
      </div>

      {isLoading && (
        <div style={{ paddingLeft: 28, fontSize: 12 }}>Checking...</div>
      )}
      {data && (
        <div style={{ paddingLeft: 28, fontSize: 12, color: '#2e7d32' }}>
          Deliver to {data.city} by {data.deliveryDate}
        </div>
      )}
      {validationError && (
        <div style={{ paddingLeft: 28, fontSize: 12, color: '#d32f2f' }}>
          {validationError}
        </div>
      )}
      {isError && (
        <div style={{ paddingLeft: 28, fontSize: 12, color: '#d32f2f' }}>
          {error.message}
        </div>
      )}
    </div>
  )
}
function ItemCard({ item }) {
  const { items, toggleSelected, setItems } = useBagStore()

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const updateBagQuantity = async (delta) => {
    const newQty = item.qty + delta

    if (newQty < 1) {
      return
    }

    try {
      const response = await fetch(
        `https://api.aarria.com/api/bags/${item.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address_id: item.address_id ?? null,
            size: item.size,
            color: item.colorName,
            quantity: newQty,
            selected: item.selected,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update quantity')
      }

      setItems(
        items.map((x) =>
          x.id === item.id
            ? {
                ...x,
                qty: newQty,
              }
            : x,
        ),
      )
    } catch (error) {
      alert(error.message)
    }
  }

  const deleteBagItem = async () => {
    try {
      setDeleting(true)

      const response = await fetch(
        `https://api.aarria.com/api/bags/${item.id}?customer_id=1`,
        {
          method: 'DELETE',
        },
      )

      if (!response.ok) {
        throw new Error('Failed')
      }

      setItems(items.filter((x) => x.id !== item.id))

      setShowDeleteConfirm(false)
    } catch (error) {
      alert('Unable to delete item')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
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
            background: item.selected ? '#e91e8c' : 'transparent',
            borderColor: item.selected ? '#e91e8c' : '#bbb',
          }}
          aria-label='toggle item'
        >
          {item.selected && (
            <svg width='10' height='8' viewBox='0 0 10 8' fill='none'>
              <path
                d='M1 4l3 3 5-6'
                stroke='white'
                strokeWidth='1.8'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          )}
        </button>

        {/* Image */}
        <a
          href={`/product/${item.productId}`}
          target='_blank'
          rel='noopener noreferrer'
          style={{
            textDecoration: 'none',
            flexShrink: 0,
          }}
        >
          <div style={{ ...styles.itemThumb, background: item.color }}>
            <img
              src={`https://cdn.aarria.com/app/images/${item.image}`}
              alt={item.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        </a>

        {/* Details */}
        <div style={styles.itemBody}>
          <a
            href={`https://aarria.com/product/${item.productId}`}
            target='_blank'
            rel='noopener noreferrer'
            style={{
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div style={styles.itemName}>{item.name}</div>
          </a>

          <div style={styles.itemAttrs}>
            <span style={styles.attrPill}>
              Size: {item.size} <ChevronDown size={11} />
            </span>

            <div style={styles.qtyControl}>
              <button
                style={styles.qtyBtn}
                onClick={() => updateBagQuantity(-1)}
              >
                <Minus size={11} />
              </button>

              <span style={styles.qtyNum}>{item.qty}</span>

              <button
                style={styles.qtyBtn}
                onClick={() => updateBagQuantity(1)}
              >
                <Plus size={11} />
              </button>
            </div>
          </div>

          <div style={styles.pricingRow}>
            <span style={styles.priceFinal}>₹{item.price * item.qty}</span>

            <span style={styles.priceMrp}>₹{item.mrp}</span>

            <span style={styles.priceOff}>₹{item.mrp - item.price} OFF</span>
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

        {/* Delete */}
        <button
          style={{
            ...styles.removeBtn,
            color: '#ff3f6c',
          }}
          onClick={() => setShowDeleteConfirm(true)}
          aria-label='remove item'
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 340,
              background: '#fff',
              borderRadius: 20,
              padding: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                Remove Item
              </h3>

              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p
              style={{
                fontSize: 14,
                color: '#666',
                marginTop: 14,
                lineHeight: 1.5,
              }}
            >
              Are you sure you want to remove this item from your bag?
            </p>

            <div
              style={{
                display: 'flex',
                gap: 10,
                marginTop: 22,
              }}
            >
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 10,
                  border: '1px solid #ddd',
                  background: '#fff',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>

              <button
                onClick={deleteBagItem}
                disabled={deleting}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  border: '1px solid #ff3f6c',
                  background: '#fff0f4',
                  color: '#ff3f6c',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 15,
                  transition: 'all 0.2s ease',
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function CouponPanel() {
  const { items, appliedCouponIds, toggleCoupon, getCouponSavings } = useBagStore()
  const [showCoupon, setShowCoupon] = useState(false)

  const couponSavings = getCouponSavings()

  // Count how many selected items have coupon toggled on
  const appliedCount = items.filter(
    (i) => i.selected && appliedCouponIds.has(i.id) && i.couponDiscount > 0,
  ).length

  // Count how many selected items have a coupon available (but not yet applied)
  const availableCount = items.filter(
    (i) => i.selected && i.couponDiscount > 0,
  ).length

  return (
    <div style={styles.panelCard}>
      <div style={styles.panelLabel}>COUPONS</div>
      <div style={styles.couponRow}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <Tag size={18} color='#e91e8c' style={{ marginTop: 2 }} />
          <div>
            {appliedCount > 0 ? (
              <>
                <div style={styles.couponApplied}>
                  {appliedCount} Coupon{appliedCount !== 1 ? 's' : ''} applied
                </div>
                <div style={styles.couponSaved}>
                  You saved ₹{couponSavings.toLocaleString('en-IN')}
                </div>
              </>
            ) : availableCount > 0 ? (
              <>
                <div style={styles.couponApplied}>
                  {availableCount} coupon{availableCount !== 1 ? 's' : ''} available
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>
                  Apply to save on selected items
                </div>
              </>
            ) : (
              <>
                <div style={styles.couponApplied}>No coupons available</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 3 }}>
                  Select items to see applicable coupons
                </div>
              </>
            )}
          </div>
        </div>

        <button style={styles.editBtn} onClick={() => setShowCoupon(true)}>
          {appliedCount > 0 ? 'EDIT' : 'APPLY'}
        </button>
      </div>

      <CouponModal
        isOpen={showCoupon}
        onClose={() => setShowCoupon(false)}
        items={items}
        appliedCouponIds={appliedCouponIds}
        onToggleCoupon={toggleCoupon}
      />
    </div>
  )
}
function PricePanel() {
  const navigate = useNavigate()
  const { items, donationAmount, getCouponSavings } = useBagStore()  // ← removed couponSavings
  const [paymentError, setPaymentError] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)

  const couponSavings = getCouponSavings()  // ← derived live

  const selectedAddress = JSON.parse(
    localStorage.getItem('selected_address') || 'null',
  )

  const selected = items.filter((i) => i.selected)

  const totalMrp = useMemo(
    () => selected.reduce((s, i) => s + i.mrp * i.qty, 0),
    [selected],
  )

  const totalPrice = useMemo(
    () => selected.reduce((s, i) => s + i.price * i.qty, 0),
    [selected],
  )

  const discountOnMrp = totalMrp - totalPrice
  const total = totalPrice - couponSavings + donationAmount
  
  const API_BASE =
    'https://d8obcfi1ua.execute-api.ap-south-1.amazonaws.com/prod'

  const handlePlaceOrder = async () => {
    if (selected.length === 0) return

    const token = localStorage.getItem('jwt_token')
    const customer = JSON.parse(localStorage.getItem('customer') || 'null')

    if (!token || !customer) {
      navigate('/login?redirect=/bag')
      return
    }

    if (!window.Razorpay) {
      alert('Payment system unavailable')
      return
    }

    try {
      setPaymentLoading(true)

      const totalAmount = Math.max(0, total)

      const customerName = customer.full_name || customer.name || 'Customer'
      const customerEmail = customer.email || ''
      const customerPhone = customer.mobile || customer.phone || ''

      const selectedAddress = JSON.parse(
        localStorage.getItem('selected_address') || 'null',
      )

      if (!selectedAddress) {
        setPaymentError('Please select delivery address')
        return
      }

      const { data } = await axios.post(`${API_BASE}/payments/create-order`, {
        customer_id: String(customer.customer_id),
        address_id: String(selectedAddress.address_id),
        amount: totalAmount,
        receipt: `order_${Date.now()}`,
        items: selected.map((item) => ({
          product_id: String(item.productId),
          product_name: item.name,
          quantity: item.qty,
          unit_price: item.price,
          size: item.size,
          bag_id: item.id,
        })),
      })

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.order_id,

        name: 'Aarria',
        description: 'Order Payment',

        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },

        notes: {
          customer_id: customer.customer_id,
          item_count: selected.length,
        },

        handler: async function (response) {
          setPaymentLoading(true)

          try {
            const verifyResponse = await axios.post(
              `${API_BASE}/payments/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
            )

            setPaymentLoading(false)

            navigate('/order-success', {
              state: verifyResponse.data.order,
            })
          } catch (error) {
            console.error('Verification failed:', error)
            setPaymentLoading(false)
            setPaymentError('Payment verification failed')
          }
        },

        modal: {
          ondismiss: () => {
            setPaymentLoading(false)
            setPaymentError('Payment cancelled by user')
          },
        },
      }

      const rzp = new window.Razorpay(options)

      rzp.on('payment.failed', function (response) {
        setPaymentLoading(false)
        setPaymentError(response.error.description || 'Payment failed')
      })

      rzp.open()

      setPaymentLoading(false)
    } catch (error) {
      setPaymentLoading(false)
      console.error(error)
      alert('Unable to start payment')
    }
  }

  return (
    <div style={styles.panelCard}>
      <div style={styles.panelLabel}>
        PRICE DETAILS ({selected.length} Item{selected.length !== 1 ? 's' : ''})
      </div>

      <div style={styles.priceRows}>
        <PriceRow label='Total MRP' value={`₹${totalMrp.toLocaleString()}`} />

        <PriceRow
          label='Discount on MRP'
          value={`- ₹${discountOnMrp.toLocaleString()}`}
          green
        />

        <PriceRow label='Coupon Discount' value={`- ₹${couponSavings}`} green />

        {donationAmount > 0 && (
          <PriceRow label='Donation' value={`₹${donationAmount}`} />
        )}
      </div>

      <div style={styles.priceDivider} />

      <div style={styles.totalRow}>
        <span>Total Amount</span>
        <span>₹{Math.max(0, total).toLocaleString()}</span>
      </div>

      <p style={styles.terms}>
        By placing the order, you agree to our{' '}
        <a href='#' style={styles.termsLink}>
          Terms of Use
        </a>{' '}
        and{' '}
        <a href='#' style={styles.termsLink}>
          Privacy Policy
        </a>
      </p>

      <button
        style={styles.placeBtn}
        onClick={handlePlaceOrder}
        disabled={selected.length === 0 || paymentLoading}
      >
        {paymentLoading ? 'PLEASE WAIT...' : 'PLACE ORDER'}
      </button>

      {selected.length === 0 && (
        <p
          style={{
            fontSize: 11,
            color: '#e91e8c',
            textAlign: 'center',
            marginTop: 8,
          }}
        >
          Select at least one item to proceed
        </p>
      )}

      {paymentLoading && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(255,255,255,0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 9998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #ff3f6c',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />

          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#282c3f',
            }}
          >
            Preparing secure payment...
          </div>
        </div>
      )}

      {paymentError && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 420,
              background: '#fff',
              borderRadius: 20,
              padding: 28,
              textAlign: 'center',
            }}
          >
            <XCircle size={70} color='#ef4444' />

            <h2
              style={{
                marginTop: 16,
                marginBottom: 10,
                fontSize: 24,
                fontWeight: 700,
              }}
            >
              Payment Failed
            </h2>

            <p
              style={{
                color: '#666',
                fontSize: 14,
                marginBottom: 24,
              }}
            >
              {paymentError}
            </p>

            <div
              style={{
                display: 'flex',
                gap: 12,
                justifyContent: 'center',
              }}
            >
              <button
                onClick={() => setPaymentError('')}
                style={{
                  background: '#ff3f6c',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                TRY AGAIN
              </button>

              <button
                onClick={() => {
                  setPaymentError('')
                  navigate('/bag')
                }}
                style={{
                  background: '#fff',
                  border: '1px solid #ddd',
                  padding: '12px 20px',
                  borderRadius: 10,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                CONTINUE SHOPPING
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PriceRow({ label, value, green }) {
  return (
    <div style={styles.priceRow}>
      <span style={styles.priceLabel}>{label}</span>
      <span
        style={{ ...styles.priceValue, ...(green ? styles.priceGreen : {}) }}
      >
        {value}
      </span>
    </div>
  )
}

// ─── Main BagPage ─────────────────────────────────────────────────────────────
function BagPage() {
  const { items, toggleSelected, setItems } = useBagStore()
  const [loading, setLoading] = useState(true)
  const selectedCount = items.filter((i) => i.selected).length
  const allSelected = selectedCount === items.length

  useEffect(() => {
    const fetchBagItems = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://api.aarria.com/customers/1/bag')

        const data = await response.json()

        const mappedItems = (data.items || []).map((item) => ({
          id: item.bag_id,
          productId: item.product_id,
          brand: '',
          name: item.title,
          seller: '',
          image: item.image_url,
          size: item.size,
          qty: item.quantity,
          price: item.price,
          mrp: item.mrp,
          couponDiscount: item.coupon_discount,
          discountType: item.discount_type, // ← NEW
          returnDays: item.return_days,
          colorName: item.color,
          color:
            item.color?.toLowerCase() === 'red'
              ? '#ffebee'
              : item.color?.toLowerCase() === 'blue'
                ? '#e3f2fd'
                : '#f5f5f5',
          accent:
            item.color?.toLowerCase() === 'red'
              ? '#d32f2f'
              : item.color?.toLowerCase() === 'blue'
                ? '#1976d2'
                : '#e91e8c',
          selected: item.selected,
        }))

        setItems(mappedItems)
      } catch (error) {
        console.error('Failed to fetch bag items', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBagItems()
  }, [setItems])

  return (
    <div style={styles.root}>
      <style>{`
        @keyframes skeleton-loading {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
      `}</style>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.leftCol}>
          <PinBar />

          {/* Items header */}
          <div style={styles.itemsHeader}>
            <button
              onClick={() => {
                const shouldSelectAll = !allSelected

                items.forEach((i) => {
                  if (i.selected !== shouldSelectAll) {
                    toggleSelected(i.id)
                  }
                })
              }}
              style={{
                ...styles.checkbox,
                background: allSelected ? '#e91e8c' : 'transparent',
                borderColor: allSelected ? '#e91e8c' : '#bbb',
              }}
            >
              {allSelected && (
                <svg width='10' height='8' viewBox='0 0 10 8' fill='none'>
                  <path
                    d='M1 4l3 3 5-6'
                    stroke='white'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              )}
            </button>
            <span style={styles.itemsCount}>
              {selectedCount}/{items.length} ITEMS SELECTED
            </span>
            <div style={styles.itemsActions}>
              {/* <span style={styles.actionBtn}>REMOVE</span> */}
              {/* <span style={{ color: '#ddd' }}>|</span>
              <span style={styles.actionBtn}>
                <Heart size={12} style={{ marginRight: 4 }} />
                WISHLIST
              </span> */}
            </div>
          </div>

          {/* Item cards */}
          {loading ? (
            <>
              <BagItemSkeleton />
              <BagItemSkeleton />
              <BagItemSkeleton />
            </>
          ) : items.length === 0 ? (
            <div style={styles.emptyState}>
              <ShoppingBag
                size={48}
                style={{ color: '#ddd', marginBottom: 12 }}
              />
              <p style={{ color: '#aaa', fontSize: 15 }}>Your bag is empty</p>
            </div>
          ) : (
            items.map((item) => <ItemCard key={item.id} item={item} />)
          )}
        </div>

        <div style={styles.rightCol}>
          {loading ? (
            <>
              <PricePanelSkeleton />
              <PricePanelSkeleton />
            </>
          ) : (
            <>
              <CouponPanel />
              <PricePanel />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const PINK = '#e91e8c'

const styles = {
  root: {
    minHeight: '100vh',
    background: '#f7f7f7',
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif",
    color: '#222',
    WebkitFontSmoothing: 'antialiased', // Better font rendering
    MozOsxFontSmoothing: 'grayscale',
    position: 'relative',
  },
  logoImg: {
    height: 'auto',
    width: 100, // Force a specific width
    maxWidth: 100,
    minWidth: 100,
    objectFit: 'contain',
    display: 'block', // Ensures proper rendering
  },
  navbar: {
    background: '#fff',
    borderBottom: '0.5px solid #eee',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: 56,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    height: '100%',
    minWidth: 100,
    paddingLeft: 40,
  },
  logoM: {
    fontSize: 28,
    fontWeight: 700,
    background: 'linear-gradient(135deg, #ff6b6b, #e91e8c, #f5a623)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    lineHeight: 1,
  },
  logoyntra: {
    fontSize: 20,
    fontWeight: 600,
    color: '#222',
    letterSpacing: -0.5,
  },
  navSteps: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: '#aaa',
    letterSpacing: 0.5,
  },
  step: { display: 'flex', alignItems: 'center' },
  stepActive: {
    color: PINK,
    fontWeight: 600,
    borderBottom: `2px solid ${PINK}`,
    paddingBottom: 2,
  },
  stepDivider: { color: '#ddd', fontSize: 10 },
  navRight: { display: 'flex', alignItems: 'center', gap: 16 },
  navSecure: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 12,
    color: '#555',
    fontWeight: 500,
  },
  mobileMenuBtn: {
    display: 'none',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 4,
  },
  container: {
    maxWidth: 1080,
    margin: '0 auto',
    padding: '20px 16px',
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: 20,
    alignItems: 'start',
  },
  leftCol: {},
  rightCol: { display: 'flex', flexDirection: 'column', gap: 12 },

  pinBar: {
    background: '#fff',
    border: '0.5px solid #eee',
    borderRadius: 10,
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  pinInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: 13,
    color: '#333',
    background: 'transparent',
    minWidth: 0,
  },
  pinStatus: { fontSize: 12, color: '#888', whiteSpace: 'nowrap' },
  pinBtn: {
    fontSize: 12,
    fontWeight: 600,
    color: PINK,
    background: 'none',
    border: `1.5px solid ${PINK}`,
    borderRadius: 6,
    padding: '5px 14px',
    cursor: 'pointer',
    letterSpacing: 0.5,
    flexShrink: 0,
  },

  itemsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 0 12px',
    borderBottom: '0.5px solid #eee',
    marginBottom: 12,
  },
  itemsCount: { fontSize: 13, fontWeight: 600, flex: 1 },
  itemsActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    fontSize: 11,
    fontWeight: 600,
    color: '#888',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    letterSpacing: 0.3,
  },

  itemCard: {
    background: '#fff',
    border: '0.5px solid #eee',
    borderRadius: 12,
    padding: '14px 12px',
    marginBottom: 10,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    position: 'relative',
    transition: 'opacity 0.2s',
  },
  checkbox: {
    width: 18,
    height: 18,
    border: '1.5px solid #bbb',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    marginTop: 2,
    transition: 'all 0.15s',
    background: 'transparent',
  },
  itemThumb: {
    width: 88,
    height: 110,
    borderRadius: 8,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemBody: { flex: 1, minWidth: 0 },
  itemBrand: {
    fontSize: 13,
    fontWeight: 700,
    letterSpacing: 0.3,
    color: '#111',
  },
  itemName: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    lineHeight: 1.4,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  itemSeller: { fontSize: 11, color: '#aaa', marginTop: 2 },
  itemAttrs: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  attrPill: {
    fontSize: 11,
    border: '0.5px solid #ddd',
    borderRadius: 6,
    padding: '4px 10px',
    color: '#555',
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    cursor: 'pointer',
  },
  qtyControl: {
    display: 'flex',
    alignItems: 'center',
    border: '0.5px solid #ddd',
    borderRadius: 6,
    overflow: 'hidden',
  },
  qtyBtn: {
    border: 'none',
    background: '#f7f7f7',
    padding: '4px 8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    color: '#555',
  },
  qtyNum: { padding: '2px 10px', fontSize: 12, fontWeight: 600 },
  pricingRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  priceFinal: { fontSize: 15, fontWeight: 700, color: '#111' },
  priceMrp: { fontSize: 12, color: '#bbb', textDecoration: 'line-through' },
  priceOff: { fontSize: 11, color: '#2e7d32', fontWeight: 600 },
  couponLine: {
    fontSize: 11,
    color: PINK,
    marginTop: 4,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
  },
  returnLine: {
    fontSize: 11,
    color: '#888',
    marginTop: 5,
    display: 'flex',
    alignItems: 'center',
  },
  removeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#ccc',
    padding: 0,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.15s',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '60px 0',
  },

  panelCard: {
    background: '#fff',
    border: '0.5px solid #eee',
    borderRadius: 12,
    padding: '16px',
  },
  panelLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1,
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  couponRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  couponApplied: { fontSize: 13, fontWeight: 600, color: '#111' },
  couponSaved: { fontSize: 12, color: '#2e7d32', marginTop: 3 },
  editBtn: {
    fontSize: 11,
    fontWeight: 700,
    color: PINK,
    border: `1.5px solid ${PINK}`,
    borderRadius: 6,
    padding: '4px 12px',
    background: 'none',
    cursor: 'pointer',
    letterSpacing: 0.5,
    flexShrink: 0,
  },

  donateRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  donateCheck: {
    width: 18,
    height: 18,
    border: '1.5px solid #bbb',
    borderRadius: 3,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.15s',
  },
  donateLabel: { fontSize: 13, color: '#333' },
  donateAmounts: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  amtPill: {
    fontSize: 12,
    border: '1px solid #ddd',
    borderRadius: 999,
    padding: '5px 14px',
    cursor: 'pointer',
    background: 'none',
    transition: 'all 0.15s',
    fontWeight: 500,
  },
  knowMore: {
    fontSize: 12,
    color: PINK,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    marginTop: 10,
    padding: 0,
    fontWeight: 500,
    display: 'block',
  },

  priceRows: { display: 'flex', flexDirection: 'column', gap: 10 },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 13,
  },
  priceLabel: { color: '#666' },
  priceValue: { color: '#111', fontWeight: 500 },
  priceGreen: { color: '#2e7d32' },
  knowMoreInline: { fontSize: 11, color: PINK, cursor: 'pointer' },
  priceDivider: {
    border: 'none',
    borderTop: '0.5px solid #eee',
    margin: '12px 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 15,
    fontWeight: 700,
    color: '#111',
  },
  terms: { fontSize: 11, color: '#aaa', marginTop: 12, lineHeight: 1.5 },
  termsLink: { color: PINK, textDecoration: 'none' },
  placeBtn: {
    width: '100%',
    background: PINK,
    color: '#fff',
    border: 'none',
    padding: '14px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 1.5,
    cursor: 'pointer',
    marginTop: 14,
    transition: 'background 0.15s',
  },
  addressCheckBtn: {
    border: 'none',
    background: 'none',
    color: '#ff3f6c',
    fontSize: 16,
    fontWeight: 100,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
}

// Use this component inside your existing <QueryClientProvider> + <BrowserRouter> tree.
export default BagPage
export { BagPage }
