import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Star, ArrowLeft, Camera, X, CheckCircle2, Loader2, ShoppingBag } from 'lucide-react'
import axios from 'axios'
import logo from './assets/logo.jpg'
import './constants/global.css'

const ORDERS_API_BASE =
  'https://zq0dbjycx6.execute-api.ap-south-1.amazonaws.com/prod'
const CDN = 'https://cdn.aarria.com/app/images/'
const MAX_PHOTOS = 3

const getCustomer = () => JSON.parse(localStorage.getItem('customer') || 'null')

const RATING_LABELS = {
  1: 'Very Bad',
  2: 'Bad',
  3: 'Okay',
  4: 'Good',
  5: 'Excellent',
}

export default function ReviewPage() {
  const navigate = useNavigate()
  const { state } = useLocation()

  const items = state?.items || []
  const orderId = state?.orderId

  const [selectedId, setSelectedId] = useState(items[0]?.id ?? null)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')
  const [photos, setPhotos] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [wasUpdate, setWasUpdate] = useState(false)

  const selected = items.find((i) => i.id === selectedId)

  const addPhotos = (files) => {
    const next = [...photos]
    for (const file of files) {
      if (next.length >= MAX_PHOTOS) break
      if (!file.type.startsWith('image/')) continue
      next.push({ file, url: URL.createObjectURL(file) })
    }
    setPhotos(next)
  }

  const removePhoto = (url) => {
    setPhotos((prev) => prev.filter((p) => p.url !== url))
    URL.revokeObjectURL(url)
  }

  const submit = async () => {
    if (!selected || !rating) return
    setSubmitting(true)
    setError('')

    const customer = getCustomer()
    const customerId = customer?.customer_id ?? 1
    const customerName = customer?.full_name || customer?.name || 'Customer'

    try {
      const fd = new FormData()
      fd.append('product_id', selected.product_id)
      fd.append('customer_id', customerId)
      fd.append('rating', rating)
      fd.append('review', review.trim())
      fd.append('customer_name', customerName)
      photos.forEach((p) => fd.append('images', p.file))

      await axios.post(`${ORDERS_API_BASE}/ratings`, fd)
      setDone(true)
    } catch (err) {
      const detail = err.response?.data?.detail || ''

      if (detail === 'Rating already exists') {
        // already reviewed — update rating & text instead
        try {
          await axios.put(
            `${ORDERS_API_BASE}/ratings/${selected.product_id}/${customerId}`,
            { rating, review: review.trim() },
          )
          setWasUpdate(true)
          setDone(true)
        } catch (err2) {
          setError(err2.response?.data?.detail || 'Unable to update review')
        }
      } else {
        setError(detail || 'Unable to submit review')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f4f4f5', fontFamily: '"Sora", "Segoe UI", sans-serif' }}>
      {/* Top Nav */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #f0f0f0',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 50,
        boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 64 }}>
          <button
            onClick={() => navigate('/orders')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#555', padding: 4 }}
          >
            <ArrowLeft size={18} />
          </button>
          <img
            src={logo}
            alt="Aarria"
            onClick={() => navigate('/products')}
            style={{ height: 40, objectFit: 'contain', cursor: 'pointer' }}
          />
          <span style={{ marginLeft: 'auto', fontSize: 13, color: '#94969f' }}>Rate &amp; Review</span>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 16px' }}>
        {items.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, padding: '60px 20px', textAlign: 'center', border: '1px solid #f0f0f0' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: '#fff0f3',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <ShoppingBag size={32} color="#A65A66" strokeWidth={1.5} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#3A332A', marginBottom: 8 }}>
              Nothing to review here
            </h3>
            <p style={{ fontSize: 13, color: '#94969f', marginBottom: 20 }}>
              Open this page from a delivered order in My Orders.
            </p>
            <button
              onClick={() => navigate('/orders')}
              style={{
                background: '#A65A66', color: '#fff', border: 'none', borderRadius: 6,
                padding: '12px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              GO TO MY ORDERS
            </button>
          </div>
        ) : done ? (
          <div style={{ background: '#fff', borderRadius: 12, padding: '60px 20px', textAlign: 'center', border: '1px solid #f0f0f0' }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', background: '#dcfce7',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <CheckCircle2 size={36} color="#16a34a" strokeWidth={1.8} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#3A332A', marginBottom: 8 }}>
              {wasUpdate ? 'Review updated!' : 'Thank you for your review!'}
            </h3>
            <p style={{ fontSize: 13, color: '#94969f', marginBottom: 24 }}>
              Your feedback helps other shoppers choose better.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate('/orders')}
                style={{
                  background: '#A65A66', color: '#fff', border: 'none', borderRadius: 6,
                  padding: '12px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >
                BACK TO MY ORDERS
              </button>
              <button
                onClick={() => window.open(`/product/${selected?.product_id}`, '_blank')}
                style={{
                  background: '#fff', color: '#555', border: '1.5px solid #d0d0d0', borderRadius: 6,
                  padding: '12px 28px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}
              >
                VIEW PRODUCT
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: 24 }}>
            <h1 style={{ fontSize: 19, fontWeight: 800, color: '#3A332A', margin: '0 0 4px', letterSpacing: -0.4 }}>
              Rate &amp; Review
            </h1>
            {orderId && (
              <p style={{ fontSize: 12, color: '#94969f', margin: '0 0 20px' }}>Order #{orderId}</p>
            )}

            {/* Item selector (when the order has multiple products) */}
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', marginBottom: 24 }}>
              {items.map((item) => {
                const active = item.id === selectedId
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                      background: active ? '#fff0f3' : '#fafafa',
                      border: active ? '1.5px solid #A65A66' : '1.5px solid #f0f0f0',
                      borderRadius: 8, padding: '8px 12px', flex: '0 0 auto', maxWidth: 280,
                    }}
                  >
                    {item.image && (
                      <img
                        src={item.image}
                        alt=''
                        style={{ width: 44, height: 54, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }}
                      />
                    )}
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#3A332A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 170 }}>
                        {item.name}
                      </p>
                      {item.size && (
                        <p style={{ fontSize: 11, color: '#94969f', margin: '2px 0 0' }}>Size: {item.size}</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Stars */}
            <p style={{ fontSize: 12, color: '#94969f', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Your Rating
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
              {[1, 2, 3, 4, 5].map((n) => {
                const filled = n <= (hoverRating || rating)
                return (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                  >
                    <Star
                      size={34}
                      color={filled ? '#f59e0b' : '#d8d8dc'}
                      fill={filled ? '#f59e0b' : 'none'}
                      strokeWidth={1.6}
                    />
                  </button>
                )
              })}
              {(hoverRating || rating) > 0 && (
                <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b', marginLeft: 6 }}>
                  {RATING_LABELS[hoverRating || rating]}
                </span>
              )}
            </div>

            {/* Review text */}
            <p style={{ fontSize: 12, color: '#94969f', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Your Review <span style={{ fontWeight: 400, textTransform: 'none' }}>(optional)</span>
            </p>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder='How was the fabric, fit and colour? Would you recommend it?'
              style={{
                width: '100%', boxSizing: 'border-box', padding: '12px 14px',
                border: '1.5px solid #e8e8e8', borderRadius: 8, fontSize: 13,
                color: '#3A332A', fontFamily: 'inherit', resize: 'vertical', outline: 'none',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#A65A66')}
              onBlur={(e) => (e.target.style.borderColor = '#e8e8e8')}
            />

            {/* Photos */}
            <p style={{ fontSize: 12, color: '#94969f', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, margin: '18px 0 8px' }}>
              Add Photos <span style={{ fontWeight: 400, textTransform: 'none' }}>(up to {MAX_PHOTOS})</span>
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {photos.map((p) => (
                <div key={p.url} style={{ position: 'relative' }}>
                  <img
                    src={p.url}
                    alt=''
                    style={{ width: 72, height: 88, objectFit: 'cover', borderRadius: 8, border: '1px solid #e8e8e8' }}
                  />
                  <button
                    onClick={() => removePhoto(p.url)}
                    style={{
                      position: 'absolute', top: -6, right: -6, width: 20, height: 20,
                      borderRadius: '50%', background: '#3A332A', color: '#fff', border: 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                    }}
                  >
                    <X size={11} />
                  </button>
                </div>
              ))}
              {photos.length < MAX_PHOTOS && (
                <label style={{
                  width: 72, height: 88, borderRadius: 8, border: '1.5px dashed #d0d0d0',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 4, cursor: 'pointer', color: '#94969f', background: '#fafafa',
                }}>
                  <Camera size={18} />
                  <span style={{ fontSize: 10, fontWeight: 600 }}>Add</span>
                  <input
                    type='file'
                    accept='image/*'
                    multiple
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      addPhotos(Array.from(e.target.files || []))
                      e.target.value = ''
                    }}
                  />
                </label>
              )}
            </div>

            {error && (
              <p style={{ fontSize: 12, color: '#dc2626', margin: '16px 0 0' }}>{error}</p>
            )}

            <button
              onClick={submit}
              disabled={submitting || !rating}
              style={{
                width: '100%', marginTop: 24, padding: '14px 0', borderRadius: 8,
                background: rating ? '#A65A66' : '#f0f0f0',
                color: rating ? '#fff' : '#aaa',
                border: 'none', fontSize: 14, fontWeight: 700, letterSpacing: 0.5,
                cursor: rating && !submitting ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
            >
              {submitting ? (
                <>
                  <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> SUBMITTING…
                </>
              ) : (
                'SUBMIT REVIEW'
              )}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}
      </div>
    </div>
  )
}
