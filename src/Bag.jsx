import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { useBagStore } from './store/bagStore'
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
const logo = '/vlogo.png'
import './constants/global.css'

import CouponModal from './modals/CouponModal'
import AddressModal from './modals/AddressModal'
import { useAuthStore } from './store/authStore'

// Orders handler (DynamoDB-backed) — all bag APIs go here
const ORDERS_API_BASE =
  'https://zq0dbjycx6.execute-api.ap-south-1.amazonaws.com/prod'

const MSG91_WIDGET_ID = '366568623534393236303030'
const MSG91_TOKEN_AUTH = '147259Txua8xfclqV69fd54e9P1'
let bagMsg91Loaded = false

function useBagMsg91() {
  const [ready, setReady] = useState(() => typeof window.sendOtp === 'function')
  useEffect(() => {
    if (typeof window.sendOtp === 'function') { setReady(true); return }
    if (bagMsg91Loaded) return
    if (document.querySelector('script[src*="otp-provider.js"]')) return
    bagMsg91Loaded = true
    const s = document.createElement('script')
    s.src = 'https://verify.msg91.com/otp-provider.js'
    s.async = true
    s.onload = () => {
      window.initSendOTP({
        widgetId: MSG91_WIDGET_ID,
        tokenAuth: MSG91_TOKEN_AUTH,
        exposeMethods: true,
        success: () => {},
        failure: () => {},
      })
      setReady(true)
    }
    document.body.appendChild(s)
  }, [])
  return ready
}

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

const getCustomerId = () => {
  try { return JSON.parse(localStorage.getItem('customer'))?.customer_id || 1 } catch { return 1 }
}

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

  const { token, customer } = useAuthStore()
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
          `${ORDERS_API_BASE}/addresses?customer_id=${customerId}`,
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
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Truck size={14} color='#C9A84C' style={{ flexShrink: 0 }} />

          {loadingAddress ? (
            <SkeletonPulse style={{ flex: 1, height: 16, borderRadius: 4 }} />
          ) : defaultAddress ? (
            <span style={{ flex: 1, fontSize: 13, color: '#535766', lineHeight: 1.4 }}>
              <span style={{ fontWeight: 700, color: '#3A332A' }}>{defaultAddress.full_name}</span>
              {defaultAddress.address_type && (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: '#C9A84C',
                  border: '1px solid #C9A84C', borderRadius: 2,
                  padding: '1px 5px', marginLeft: 6, letterSpacing: 0.4,
                }}>
                  {defaultAddress.address_type.toUpperCase()}
                </span>
              )}
              <span style={{ marginLeft: 6 }}>
                {defaultAddress.address_line_1}, {defaultAddress.city}, {defaultAddress.state} —{' '}
                <span style={{ fontWeight: 700, color: '#3A332A' }}>{defaultAddress.pincode}</span>
              </span>
            </span>
          ) : (
            <span style={{ flex: 1, fontSize: 13, color: '#94969f' }}>
              No address saved. Add one to continue.
            </span>
          )}

          <button
            onClick={() => setOpenAddress(true)}
            style={{
              fontSize: 12, fontWeight: 700, color: '#C9A84C',
              background: 'none', border: 'none', cursor: 'pointer',
              letterSpacing: 0.5, padding: 0, flexShrink: 0,
            }}
          >
            {defaultAddress ? 'CHANGE' : 'ADD ADDRESS'}
          </button>
        </div>
        <AddressModal
          open={openAddress}
          onClose={handleCloseAddress}
          addresses={addresses}
          selectedAddress={defaultAddress}
          onSelectAddress={handleSelectAddress}
          onDeleteSuccess={handleDeleteSuccess}
          onAddressAdded={(newAddress) => {
            setDefaultAddress(newAddress)
            localStorage.setItem('selected_address', JSON.stringify(newAddress))
            setShouldRefetch((c) => c + 1)
          }}
          customerId={customerId}
        />
      </>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* PIN check */}
      <div
        style={{
          ...styles.pinBar,
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Truck size={16} style={{ color: '#C9A84C' }} />
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
        `${ORDERS_API_BASE}/bags/update-bag-item/${item.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            customer_id: getCustomerId(),
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
        `${ORDERS_API_BASE}/bags/delete-bag-item/${item.id}?customer_id=${getCustomerId()}`,
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
            background: item.selected ? '#050C1C' : 'transparent',
            borderColor: item.selected ? '#C9A84C' : '#bbb',
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
              src={`https://cdn.vaarria.com/app/images/${item.image}`}
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
            href={`https://vaarria.com/product/${item.productId}`}
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
    Coupon Discount:{' '}
    {item.discountType === 'PERCENTAGE'
      ? `${item.couponDiscount}%`
      : `₹${item.couponDiscount}`}
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
            color: '#C9A84C',
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
                  border: '1px solid #C9A84C',
                  background: '#fffbf0',
                  color: '#C9A84C',
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
          <Tag size={18} color='#C9A84C' style={{ marginTop: 2 }} />
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

        <button
          style={{ ...styles.editBtn, opacity: items.filter(i => i.selected).length === 0 ? 0.4 : 1, cursor: items.filter(i => i.selected).length === 0 ? 'not-allowed' : 'pointer' }}
          onClick={() => setShowCoupon(true)}
          disabled={items.filter(i => i.selected).length === 0}
        >
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
function PaymentMethodSelector({ value, onChange, total, disabled }) {
  const prepaidFinal = Math.round(total * 0.95)
  const saved = total - prepaidFinal
  const codFinal = Math.round(total * 0.98)
  const codRemaining = codFinal - 49

  return (
    <div style={{ margin: '16px 0', opacity: disabled ? 0.45 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>

      {/* PRIMARY — Pay Online */}
      <button
        type='button'
        onClick={() => onChange('prepaid')}
        style={{
          width: '100%', textAlign: 'left', cursor: 'pointer',
          border: 'none', borderRadius: 10, padding: '14px 16px',
          background: value === 'prepaid' ? '#050C1C' : '#f7f4ef',
          transition: 'all 0.18s', marginBottom: 8,
          boxShadow: value === 'prepaid' ? '0 4px 16px rgba(5,12,28,0.18)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
              border: value === 'prepaid' ? '5px solid #C9A84C' : '1.5px solid #999',
              transition: 'all 0.15s',
            }} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: value === 'prepaid' ? '#C9A84C' : '#111' }}>
                  Pay Online Now
                </span>
                <span style={{
                  fontSize: 9, fontWeight: 800, letterSpacing: 0.4,
                  color: '#fff', background: '#2e7d32',
                  borderRadius: 3, padding: '2px 6px',
                }}>SAVE 5%</span>
              </div>
              <div style={{ fontSize: 11, color: value === 'prepaid' ? 'rgba(201,168,76,0.7)' : '#888', marginTop: 2 }}>
                UPI · Card · Net Banking
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 15, fontWeight: 800, color: value === 'prepaid' ? '#C9A84C' : '#111' }}>
              ₹{prepaidFinal.toLocaleString()}
            </div>
            <div style={{ fontSize: 10, color: value === 'prepaid' ? 'rgba(201,168,76,0.65)' : '#2e7d32', marginTop: 1 }}>
              you save ₹{saved.toLocaleString()}
            </div>
          </div>
        </div>
      </button>

      {/* SECONDARY — ₹49 + COD */}
      <button
        type='button'
        onClick={() => onChange('cod')}
        style={{
          width: '100%', textAlign: 'left', cursor: 'pointer',
          border: value === 'cod' ? '1.5px solid #C9A84C' : '1px solid #e5e7eb',
          borderRadius: 10, padding: '11px 14px',
          background: value === 'cod' ? '#fffbf0' : '#fff',
          transition: 'all 0.15s', marginBottom: 6, display: 'flex',
          alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 15, height: 15, borderRadius: '50%', flexShrink: 0,
            border: value === 'cod' ? '5px solid #C9A84C' : '1.5px solid #bbb',
            transition: 'all 0.15s',
          }} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>Pay ₹49 Now + COD</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#2e7d32', background: '#e8f5e9', borderRadius: 3, padding: '1px 5px' }}>2% OFF</span>
            </div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>
              ₹49 online · ₹{codRemaining.toLocaleString()} on delivery
            </div>
          </div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#2e7d32', whiteSpace: 'nowrap' }}>
          ₹{codFinal.toLocaleString()}
        </div>
      </button>

      {/* TERTIARY — Full COD as a quiet link */}
      <button
        type='button'
        onClick={() => onChange('full_cod')}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '6px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 14, height: 14, borderRadius: '50%', flexShrink: 0,
            border: value === 'full_cod' ? '4px solid #C9A84C' : '1.5px solid #ccc',
            transition: 'all 0.15s',
          }} />
          <span style={{ fontSize: 12, color: value === 'full_cod' ? '#C9A84C' : '#aaa', fontWeight: value === 'full_cod' ? 600 : 400 }}>
            Full Cash on Delivery
          </span>
        </div>
        <span style={{ fontSize: 12, color: '#aaa' }}>₹{total.toLocaleString()}</span>
      </button>

    </div>
  )
}

function PricePanel({ onNeedAuth, triggerPay, onTriggerConsumed }) {
  const navigate = useNavigate()
  const { items, donationAmount, getCouponSavings } = useBagStore()
  const [paymentError, setPaymentError] = useState('')
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [showEmptyBagPopup, setShowEmptyBagPopup] = useState(false)
  const [paymentMode, setPaymentMode] = useState('prepaid')

  const couponSavings = getCouponSavings()

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

  const API_BASE = ORDERS_API_BASE
  const { token: authToken, customer: authCustomer } = useAuthStore()

  const handlePlaceOrder = useCallback(async () => {
    if (items.length === 0) { setShowEmptyBagPopup(true); return }
    if (selected.length === 0) return

    if (!authToken || !authCustomer) {
      onNeedAuth?.('mobile')
      return
    }

    const token = authToken
    const customer = authCustomer

    const baseTotal = Math.max(0, total)
    const prepaidFinal = Math.round(baseTotal * 0.95)
    const codFinal = Math.round(baseTotal * 0.98)

    const selectedAddress = JSON.parse(localStorage.getItem('selected_address') || 'null')
    if (!selectedAddress) {
      onNeedAuth?.('address')
      return
    }

    const orderItems = selected.map((item) => ({
      product_id: String(item.productId),
      product_name: item.name,
      quantity: item.qty,
      unit_price: item.price,
      size: item.size,
      image: item.image || null,
      bag_id: item.id,
    }))

    const clearBagAndNavigate = async (order) => {
      const { removeItem } = useBagStore.getState()
      await Promise.allSettled(
        selected.map((item) =>
          fetch(`${API_BASE}/bags/delete-bag-item/${item.id}?customer_id=${getCustomerId()}`, { method: 'DELETE' })
            .then(() => removeItem(item.id))
        )
      )
      setPaymentLoading(false)
      navigate('/order-success', { state: order })
    }

    try {
      setPaymentLoading(true)

      if (paymentMode === 'full_cod') {
        const { data } = await axios.post(`${API_BASE}/payments/create-order`, {
          customer_id: String(customer.customer_id),
          address_id: String(selectedAddress.address_id),
          amount: 0,
          payment_method: 'FULL_COD',
          cod_remaining: baseTotal,
          receipt: `order_${Date.now()}`,
          items: orderItems,
        })
        await clearBagAndNavigate(data.order ?? data)
        return
      }

      if (!window.Razorpay) {
        alert('Payment system unavailable')
        setPaymentLoading(false)
        return
      }

      const razorpayAmount = paymentMode === 'cod' ? 49 : prepaidFinal

      const { data } = await axios.post(`${API_BASE}/payments/create-order`, {
        customer_id: String(customer.customer_id),
        address_id: String(selectedAddress.address_id),
        amount: razorpayAmount,
        payment_method: paymentMode === 'cod' ? 'COD' : 'PREPAID',
        cod_remaining: paymentMode === 'cod' ? codFinal - 49 : 0,
        receipt: `order_${Date.now()}`,
        items: orderItems,
      })

      const customerName = customer.full_name || customer.name || 'Customer'
      const customerEmail = customer.email || ''
      const customerPhone = customer.mobile || customer.phone || customer.mobile_no || ''

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.order_id,
        name: 'Aarria',
        description: 'Order Payment',
        prefill: { name: customerName, email: customerEmail, contact: customerPhone },
        notes: { customer_id: customer.customer_id, item_count: selected.length },

        handler: async function (response) {
          setPaymentLoading(true)
          try {
            const verifyResponse = await axios.post(`${API_BASE}/payments/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            await clearBagAndNavigate(verifyResponse.data.order)
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
  }, [selected, total, paymentMode, authToken, authCustomer, onNeedAuth, API_BASE, navigate])

  const handlePlaceOrderRef = useRef(handlePlaceOrder)
  handlePlaceOrderRef.current = handlePlaceOrder

  useEffect(() => {
    if (triggerPay) {
      onTriggerConsumed?.()
      handlePlaceOrderRef.current()
    }
  }, [triggerPay])

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

      <PaymentMethodSelector
        value={paymentMode}
        onChange={setPaymentMode}
        total={Math.max(0, total)}
        disabled={selected.length === 0}
      />

      <div style={{
        display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap',
      }}>
        {[
          { icon: '🔒', text: 'Your money is 100% safe' },
          { icon: '⚡', text: 'Instant refunds, no questions asked' },
        ].map(({ icon, text }) => (
          <div key={text} style={{
            flex: 1, minWidth: 130,
            background: '#f0faf4', border: '1px solid #c8e6c9',
            borderRadius: 8, padding: '8px 10px',
            display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <span style={{ fontSize: 14, lineHeight: 1 }}>{icon}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#2e7d32', lineHeight: 1.3 }}>{text}</span>
          </div>
        ))}
      </div>

      <p style={styles.terms}>
  By placing the order, you agree to our{' '}
  <a
    href='http://localhost:5173/terms'
    target='_blank'
    rel='noopener noreferrer'
    style={styles.termsLink}
  >
    Terms of Use
  </a>{' '}
  and{' '}
  <a
    href='http://localhost:5173/privacy-policy'
    target='_blank'
    rel='noopener noreferrer'
    style={styles.termsLink}
  >
    Privacy Policy
  </a>
</p>

      <button
        style={styles.placeBtn}
        onClick={handlePlaceOrder}
        disabled={selected.length === 0 || paymentLoading}
      >
        {paymentLoading
          ? 'PLEASE WAIT...'
          : paymentMode === 'cod'
          ? 'PAY Rs.49 & PLACE ORDER'
          : paymentMode === 'full_cod'
          ? 'PLACE ORDER (PAY ON DELIVERY)'
          : 'PLACE ORDER'}
      </button>

      {showEmptyBagPopup && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, maxWidth: 340, width: '100%',
            padding: '36px 28px', textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🛍️</div>
            <div style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 20, fontWeight: 700, color: '#050C1C', marginBottom: 10,
            }}>
              Your bag is empty
            </div>
            <p style={{ fontSize: 13, color: '#777', lineHeight: 1.7, margin: '0 0 24px' }}>
              Looks like you haven't added anything yet.<br />
              Explore our collection and find something you'll love.
            </p>
            <button
              onClick={() => setShowEmptyBagPopup(false)}
              style={{
                width: '100%', padding: '11px', borderRadius: 6,
                background: '#050C1C', color: '#C9A84C',
                border: '1px solid #C9A84C',
                fontSize: 13, fontWeight: 700, letterSpacing: 0.5,
                cursor: 'pointer',
                fontFamily: "'Playfair Display', Georgia, serif",
              }}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}

      {selected.length === 0 && (
        <p
          style={{
            fontSize: 11,
            color: '#C9A84C',
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
              borderTop: '4px solid #A65A66',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />

          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: '#3A332A',
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
                  background: '#050C1C',
                  color: '#C9A84C',
                  border: '1px solid #C9A84C',
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

// ─── Checkout Drawer ──────────────────────────────────────────────────────────

const drawerInputStyle = {
  width: '100%', padding: '13px 14px', fontSize: 15,
  border: '1.5px solid #e0d5c0', borderRadius: 10,
  outline: 'none', boxSizing: 'border-box', color: '#3A332A',
  fontFamily: 'inherit',
}

const drawerBtnStyle = {
  width: '100%', padding: '14px 0', fontSize: 15, fontWeight: 700,
  background: '#050C1C', color: '#C9A84C',
  border: '1px solid #C9A84C', borderRadius: 12,
  cursor: 'pointer', letterSpacing: 0.5,
}

function DrawerMobileStep({ msg91Ready, onSent }) {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canSend = phone.length === 10 && msg91Ready

  const handleSend = () => {
    if (!canSend || loading) return
    setLoading(true)
    setError('')
    window.sendOtp(
      `91${phone}`,
      () => { setLoading(false); onSent(phone) },
      (err) => {
        setError(typeof err === 'string' ? err : err?.message || 'Failed to send OTP')
        setLoading(false)
      }
    )
  }

  return (
    <div>
      <p style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: '#3A332A' }}>Enter mobile number</p>
      <p style={{ fontSize: 13, color: '#888', margin: '0 0 22px' }}>We'll send a 4-digit OTP to verify</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        <span style={{
          padding: '13px 12px', background: '#f7f4ef', border: '1.5px solid #e0d5c0',
          borderRadius: 10, fontSize: 15, fontWeight: 600, color: '#3A332A', whiteSpace: 'nowrap',
        }}>+91</span>
        <input
          type='tel' inputMode='numeric' maxLength={10} placeholder='10-digit mobile number'
          value={phone}
          onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          style={drawerInputStyle}
          autoFocus
        />
      </div>
      {error && <p style={{ color: '#e53935', fontSize: 12, marginBottom: 10 }}>{error}</p>}
      <button onClick={handleSend} disabled={!canSend || loading} style={{
        ...drawerBtnStyle,
        opacity: !canSend || loading ? 0.5 : 1,
      }}>
        {loading ? 'Sending OTP…' : !msg91Ready ? 'Loading…' : 'Send OTP →'}
      </button>
    </div>
  )
}

function DrawerOtpStep({ phone, onBack, onVerified }) {
  const [digits, setDigits] = useState(['', '', '', ''])
  const [seconds, setSeconds] = useState(30)
  const [canResend, setCanResend] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const refs = [useRef(), useRef(), useRef(), useRef()]

  useEffect(() => { refs[0].current?.focus() }, [])
  useEffect(() => {
    if (seconds <= 0) { setCanResend(true); return }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const verifyOtp = useCallback(async (otp) => {
    setVerifying(true)
    setError('')
    try {
      const widgetData = await new Promise((resolve, reject) => {
        window.verifyOtp(otp, resolve, (err) => reject(new Error(
          typeof err === 'string' ? err : err?.message || 'Invalid OTP'
        )))
      })
      const res = await fetch('https://b1ubc4krn6.execute-api.ap-south-1.amazonaws.com/prod/api/auth/msg91-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ mobile_no: phone, access_token: widgetData?.message }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Invalid OTP')
      setSuccess(true)
      setTimeout(() => onVerified(data.token, data.customer), 800)
    } catch (err) {
      setError(err.message)
      setDigits(['', '', '', ''])
      setTimeout(() => refs[0].current?.focus(), 100)
      setVerifying(false)
    }
  }, [phone, onVerified])

  const handleChange = (i, val) => {
    const v = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = v
    setDigits(next)
    if (v && i < 3) refs[i + 1].current?.focus()
    if (i === 3 && v) verifyOtp(next.join(''))
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs[i - 1].current?.focus()
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: '#3A332A' }}>Verify OTP</p>
      <p style={{ fontSize: 13, color: '#888', margin: '0 0 24px' }}>Sent to +91 {phone}</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
        {digits.map((d, i) => (
          <input
            key={i} ref={refs[i]} type='tel' inputMode='numeric' maxLength={1} value={d}
            disabled={verifying || success}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            style={{
              width: 52, height: 56, textAlign: 'center', fontSize: 24, fontWeight: 700,
              border: success ? '2px solid #2e7d32' : error ? '2px solid #e53935' : '1.5px solid #e0d5c0',
              borderRadius: 10, outline: 'none',
              background: success ? '#f1f8f1' : error ? '#fff5f5' : '#fff',
              color: '#3A332A', transition: 'border 0.2s',
            }}
          />
        ))}
      </div>
      {error && <p style={{ color: '#e53935', fontSize: 12, marginBottom: 10 }}>{error}</p>}
      {success && <p style={{ color: '#2e7d32', fontSize: 13, marginBottom: 10, fontWeight: 600 }}>✓ Verified! Setting up your account…</p>}
      {!success && (
        <div style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
          {canResend ? (
            <button disabled={resending} onClick={() => {
              setResending(true)
              setError('')
              setDigits(['', '', '', ''])
              window.retryOtp('11', () => {
                setCanResend(false); setSeconds(30); setResending(false)
                refs[0].current?.focus()
              }, (err) => {
                setError(typeof err === 'string' ? err : 'Could not resend')
                setResending(false)
              })
            }} style={{ background: 'none', border: 'none', color: '#C9A84C', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              {resending ? 'Sending…' : 'Resend OTP'}
            </button>
          ) : <>Resend in <strong>{mm}:{ss}</strong></>}
        </div>
      )}
      {!success && (
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#888', fontSize: 12, cursor: 'pointer' }}>
          ← Change number
        </button>
      )}
    </div>
  )
}

function DrawerAddressStep({ onSaved }) {
  const { customer } = useAuthStore()
  const [name, setName] = useState(customer?.name || '')
  const [pincode, setPincode] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [houseNo, setHouseNo] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [pinError, setPinError] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handlePincode = async (val) => {
    const p = val.replace(/\D/g, '').slice(0, 6)
    setPincode(p)
    setCity(''); setState(''); setPinError('')
    if (p.length === 6) {
      setPinLoading(true)
      try {
        const details = await fetchPinDetails(p)
        setCity(details.city); setState(details.state)
      } catch (e) {
        setPinError(e.message)
      } finally {
        setPinLoading(false)
      }
    }
  }

  const handleSave = async () => {
    if (!name.trim()) { setError('Please enter your name'); return }
    if (!pincode || pincode.length < 6) { setError('Please enter a valid pincode'); return }
    if (!city) { setError('Pincode not found — please check and retry'); return }
    if (!houseNo.trim()) { setError('Please enter your house / flat number'); return }
    if (!customer?.customer_id) { setError('Session error — please refresh'); return }
    try {
      setSaving(true)
      const res = await fetch(`${ORDERS_API_BASE}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_id: customer.customer_id,
          full_name: name,
          mobile_no: customer.mobile_no,
          address_line_1: houseNo,
          address_line_2: '',
          landmark: '',
          city,
          state,
          country: 'India',
          pincode,
          address_type: 'HOME',
          is_default: true,
        }),
      })
      if (!res.ok) throw new Error('Failed to save address')
      const data = await res.json()
      localStorage.setItem('selected_address', JSON.stringify(data))
      onSaved()
    } catch (e) {
      setError(e.message)
      setSaving(false)
    }
  }

  return (
    <div>
      <p style={{ fontSize: 22, fontWeight: 700, margin: '0 0 6px', color: '#3A332A' }}>Delivery address</p>
      <p style={{ fontSize: 13, color: '#888', margin: '0 0 20px' }}>Just 3 quick details</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <input placeholder='Your full name' value={name} onChange={e => setName(e.target.value)} style={drawerInputStyle} autoFocus />
        <div>
          <input
            placeholder='PIN code (6 digits)' inputMode='numeric' maxLength={6}
            value={pincode} onChange={e => handlePincode(e.target.value)}
            style={drawerInputStyle}
          />
          {pinLoading && <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>Looking up pincode…</p>}
          {city && !pinLoading && <p style={{ fontSize: 12, color: '#2e7d32', marginTop: 4 }}>✓ {city}, {state}</p>}
          {pinError && <p style={{ fontSize: 12, color: '#e53935', marginTop: 4 }}>{pinError}</p>}
        </div>
        <input placeholder='House / Flat / Street' value={houseNo} onChange={e => setHouseNo(e.target.value)} style={drawerInputStyle} />
      </div>
      {error && <p style={{ color: '#e53935', fontSize: 12, marginTop: 10 }}>{error}</p>}
      <button onClick={handleSave} disabled={saving || !city} style={{ ...drawerBtnStyle, marginTop: 24, opacity: saving || !city ? 0.6 : 1 }}>
        {saving ? 'Saving…' : 'Confirm & Place Order →'}
      </button>
    </div>
  )
}

function CheckoutDrawer({ open, initialStep, onClose, onSuccess }) {
  const [step, setStep] = useState(initialStep || 'mobile')
  const [phone, setPhone] = useState('')
  const msg91Ready = useBagMsg91()
  const { login: storeLogin } = useAuthStore()

  useEffect(() => {
    if (open) { setStep(initialStep || 'mobile'); setPhone('') }
  }, [open, initialStep])

  if (!open) return null

  const steps = initialStep === 'address' ? ['address'] : ['mobile', 'otp', 'address']
  const currentIdx = steps.indexOf(step)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.52)' }} onClick={onClose} />
      <div style={{
        position: 'relative', zIndex: 1, width: '100%', maxWidth: 480,
        background: '#fff', borderRadius: '20px 20px 0 0',
        padding: '28px 24px 44px', animation: 'drawerUp 0.28s ease',
      }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
          {steps.map((s, i) => (
            <div key={s} style={{ height: 3, flex: 1, borderRadius: 2, background: i <= currentIdx ? '#C9A84C' : '#eee', transition: 'background 0.3s' }} />
          ))}
        </div>
        <button onClick={onClose} style={{ position: 'absolute', top: 18, right: 18, background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
          <X size={20} color='#aaa' />
        </button>
        {step === 'mobile' && (
          <DrawerMobileStep msg91Ready={msg91Ready} onSent={p => { setPhone(p); setStep('otp') }} />
        )}
        {step === 'otp' && (
          <DrawerOtpStep
            phone={phone}
            onBack={() => setStep('mobile')}
            onVerified={(token, cust) => { storeLogin(token, cust); setStep('address') }}
          />
        )}
        {step === 'address' && (
          <DrawerAddressStep onSaved={onSuccess} />
        )}
      </div>
      <style>{`@keyframes drawerUp { from { transform: translateY(100%); } to { transform: translateY(0); } }`}</style>
    </div>
  )
}

// ─── Main BagPage ─────────────────────────────────────────────────────────────
function BagPage() {
  const { items, toggleSelected, setItems } = useBagStore()
  const { token, customer } = useAuthStore()
  const isLoggedIn = !!token && !!customer
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [drawer, setDrawer] = useState({ open: false, step: 'mobile' })
  const [triggerPay, setTriggerPay] = useState(false)
  const selectedCount = items.filter((i) => i.selected).length
  const allSelected = selectedCount === items.length

  const handleNeedAuth = (step) => setDrawer({ open: true, step })
  const handleDrawerSuccess = () => {
    setDrawer({ open: false, step: 'mobile' })
    setTriggerPay(true)
  }

  useEffect(() => {
    const fetchBagItems = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `${ORDERS_API_BASE}/bags/customers/${customer?.customer_id || 1}/bag`,
        )

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
                : '#C9A84C',
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
  }, [setItems, customer?.customer_id])

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
                background: allSelected ? '#050C1C' : 'transparent',
                borderColor: allSelected ? '#C9A84C' : '#bbb',
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
              <ShoppingBag size={48} style={{ color: '#ddd', marginBottom: 12 }} />
              <p style={{ color: '#aaa', fontSize: 15, marginBottom: 20 }}>Your bag is empty</p>
              <button
                onClick={() => navigate('/products')}
                style={{
                  background: '#050C1C', color: '#C9A84C',
                  border: '1px solid #C9A84C', borderRadius: 8,
                  padding: '12px 32px', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer', letterSpacing: '0.06em',
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            items.map((item) => <ItemCard key={item.id} item={item} />)
          )}

          {!isLoggedIn && (
            <div
              onClick={() => handleNeedAuth('mobile')}
              style={{
                background: '#fff', border: '1px solid #ebecef',
                borderRadius: 4, padding: '12px 16px', marginTop: 4,
                display: 'flex', alignItems: 'center', gap: 10,
                cursor: 'pointer',
              }}
            >
              <Truck size={14} color='#C9A84C' style={{ flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, color: '#94969f' }}>
                Where should we deliver?
              </span>
              <span style={{
                fontSize: 12, fontWeight: 600, color: '#C9A84C',
                letterSpacing: 0.3, whiteSpace: 'nowrap',
              }}>
                Enter phone →
              </span>
            </div>
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
              <PricePanel
                onNeedAuth={handleNeedAuth}
                triggerPay={triggerPay}
                onTriggerConsumed={() => setTriggerPay(false)}
              />
            </>
          )}
        </div>
      </div>
      <CheckoutDrawer
        open={drawer.open}
        initialStep={drawer.step}
        onClose={() => setDrawer({ open: false, step: 'mobile' })}
        onSuccess={handleDrawerSuccess}
      />
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const PINK = '#C9A84C'
const NAVY = '#050C1C'

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
    height: '48px',
    width: 'auto',
    objectFit: 'contain',
    display: 'block',
  },
  navbar: {
    background: '#050C1C',
    borderBottom: '1px solid #0d1e3a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    height: 60,
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
    background: 'linear-gradient(135deg, #C9A84C, #E8C060, #a07830)',
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
    color: '#C9A84C',
    letterSpacing: 0.5,
  },
  step: { display: 'flex', alignItems: 'center' },
  stepActive: {
    color: '#E8C060',
    fontWeight: 700,
    borderBottom: '2px solid #C9A84C',
    paddingBottom: 2,
  },
  stepDivider: { color: '#1a2d4a', fontSize: 10 },
  navRight: { display: 'flex', alignItems: 'center', gap: 16 },
  navSecure: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 12,
    color: '#C9A84C',
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
    maxWidth: 1536,
    margin: '0 auto',
    padding: '20px 32px',
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: 24,
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
    background: NAVY,
    color: '#C9A84C',
    border: '1px solid #C9A84C',
    padding: '14px',
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 1.5,
    cursor: 'pointer',
    marginTop: 14,
    transition: 'background 0.15s',
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  addressCheckBtn: {
    border: 'none',
    background: 'none',
    color: '#C9A84C',
    fontSize: 16,
    fontWeight: 100,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
}

// Use this component inside your existing <QueryClientProvider> + <BrowserRouter> tree.
export default BagPage
export { BagPage }
