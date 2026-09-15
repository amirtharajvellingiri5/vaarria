import React, { useState, useEffect } from 'react'
import {
  Search,
  Trash2,
  Archive,
  X,
  Check,
  AlertTriangle,
  Package,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react'

import AdminNav from './AdminNav'
import { CATALOG_URL, INVENTORY_URL } from '../config'
import { useAuthStore } from '../store/authStore'
import { authHeaders } from '../utils/authHeaders'

const CDN = 'https://cdn.vaarria.com/app/images/'
const API = `${CATALOG_URL}/listings`
const PRODUCTS_API = `${INVENTORY_URL}/products`

const imgSrc = (filename) => `${CDN}${filename}`

const Thumb = ({ filename, title }) => {
  const [err, setErr] = useState(false)
  if (!filename || err) {
    return (
      <div className='w-10 h-10 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center flex-shrink-0'>
        <ImageIcon size={14} className='text-stone-600' />
      </div>
    )
  }
  return (
    <img
      src={imgSrc(filename)}
      alt={title}
      onError={() => setErr(true)}
      className='w-10 h-10 rounded-lg object-cover border border-stone-700 flex-shrink-0'
    />
  )
}

const Toast = ({ message, onDone }) => {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [onDone])
  return (
    <div className='fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 bg-stone-800 border border-stone-700 rounded-xl text-sm text-stone-100 shadow-2xl'>
      <Check size={14} className='text-emerald-400' /> {message}
    </div>
  )
}

// ── Archive Modal ─────────────────────────────────────────────────────────────
const ArchiveModal = ({ product, onConfirm, onClose }) => {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleArchive = async () => {
    setBusy(true)
    setError('')
    try {
      const res = await fetch(`${PRODUCTS_API}/${product.id}/archive`, {
        method: 'PATCH',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      onConfirm()
    } catch {
      setError('Archive failed. Please try again.')
      setBusy(false)
    }
  }

  return (
    <div
      className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4'
      onClick={(e) => e.target === e.currentTarget && !busy && onClose()}
    >
      <div className='w-full max-w-sm bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/50'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center'>
              <Archive size={14} className='text-amber-400' />
            </div>
            <h3 className='text-sm font-bold text-stone-100'>Archive Product</h3>
          </div>
          <button
            onClick={onClose}
            disabled={busy}
            className='p-1.5 rounded-lg text-stone-500 hover:text-stone-200 hover:bg-stone-800 transition-colors disabled:opacity-40'
          >
            <X size={16} />
          </button>
        </div>

        <div className='p-6'>
          <div className='flex items-center gap-4 mb-4'>
            <Thumb filename={product.main_image} title={product.title} />
            <div>
              <p className='text-sm font-semibold text-stone-100'>{product.title}</p>
              <p className='text-xs text-stone-500 font-mono'>#{product.id}</p>
            </div>
          </div>
          <p className='text-sm text-stone-400'>
            This will hide the product from all listings but keep its data. You can
            still delete it later.
          </p>
          {error && (
            <p className='mt-3 text-xs text-rose-400 flex items-center gap-1.5'>
              <AlertTriangle size={12} /> {error}
            </p>
          )}
        </div>

        <div className='flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-800 bg-stone-900/30'>
          <button
            onClick={onClose}
            disabled={busy}
            className='px-4 py-2 rounded-xl text-sm font-semibold border border-stone-700 text-stone-300 hover:border-stone-500 hover:text-stone-100 transition-colors disabled:opacity-40'
          >
            Cancel
          </button>
          <button
            onClick={handleArchive}
            disabled={busy}
            className='flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors disabled:opacity-60'
          >
            {busy ? (
              <>
                <Loader2 size={13} className='animate-spin' /> Archiving…
              </>
            ) : (
              'Archive'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Delete Modal ──────────────────────────────────────────────────────────────
const DeleteModal = ({ product, onConfirm, onClose }) => {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    try {
      const res = await fetch(`${PRODUCTS_API}/${product.id}`, {
        method: 'DELETE',
        headers: authHeaders(),
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const json = await res.json()
      setResult(json.images || null)
    } catch {
      setError('Delete failed. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4'
      onClick={(e) => e.target === e.currentTarget && !deleting && onClose()}
    >
      <div className='w-full max-w-sm bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/50'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center'>
              <AlertTriangle size={14} className='text-rose-400' />
            </div>
            <h3 className='text-sm font-bold text-stone-100'>Delete Product</h3>
          </div>
          <button
            onClick={onClose}
            disabled={deleting}
            className='p-1.5 rounded-lg text-stone-500 hover:text-stone-200 hover:bg-stone-800 transition-colors disabled:opacity-40'
          >
            <X size={16} />
          </button>
        </div>

        <div className='p-6'>
          <div className='flex items-center gap-4 mb-4'>
            <Thumb filename={product.main_image} title={product.title} />
            <div>
              <p className='text-sm font-semibold text-stone-100'>{product.title}</p>
              <p className='text-xs text-stone-500 font-mono'>#{product.id}</p>
            </div>
          </div>

          {!result && (
            <p className='text-sm text-stone-400'>
              This permanently deletes the product from the database and all its
              images from storage. This action cannot be undone.
            </p>
          )}

          {error && (
            <p className='mt-3 text-xs text-rose-400 flex items-center gap-1.5'>
              <AlertTriangle size={12} /> {error}
            </p>
          )}

          {result && (
            <div
              className={`rounded-xl border p-3 text-xs space-y-1 ${
                result.verified
                  ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                  : 'border-amber-500/20 bg-amber-500/5 text-amber-400'
              }`}
            >
              <p className='flex items-center gap-1.5 font-semibold'>
                {result.verified ? <Check size={12} /> : <AlertTriangle size={12} />}
                {result.verified
                  ? `All ${result.requested} image(s) confirmed deleted from storage`
                  : `${result.deleted?.length || 0}/${result.requested} image(s) deleted — ${result.failed?.length || 0} could not be verified`}
              </p>
              {!result.verified && result.failed?.length > 0 && (
                <p className='text-stone-400 truncate'>Failed: {result.failed.join(', ')}</p>
              )}
            </div>
          )}
        </div>

        <div className='flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-800 bg-stone-900/30'>
          {result ? (
            <button
              onClick={onConfirm}
              className='px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors'
            >
              Done
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                disabled={deleting}
                className='px-4 py-2 rounded-xl text-sm font-semibold border border-stone-700 text-stone-300 hover:border-stone-500 hover:text-stone-100 transition-colors disabled:opacity-40'
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className='flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-60'
              >
                {deleting ? (
                  <>
                    <Loader2 size={13} className='animate-spin' /> Deleting…
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
const NoStockProducts = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  const [archiveProduct, setArchiveProduct] = useState(null)
  const [deleteProduct, setDeleteProductState] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}?page=1&page_size=100&include_inactive=true`)
      const json = await res.json()
      setProducts((json.data || []).filter((p) => p.stock === 0))
    } catch {
      setError('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = products.filter((p) => {
    const q = search.toLowerCase()
    return !q || p.title.toLowerCase().includes(q) || String(p.id).includes(q)
  })

  const handleConfirmArchive = () => {
    setProducts((prev) =>
      prev.map((p) => (p.id === archiveProduct.id ? { ...p, is_active: false } : p)),
    )
    setArchiveProduct(null)
    setToast('Product archived')
  }

  const handleConfirmDelete = () => {
    setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id))
    setDeleteProductState(null)
    setToast('Product deleted')
  }

  return (
    <div
      className='min-h-screen bg-stone-950 text-stone-100'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <link
        href='https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap'
        rel='stylesheet'
      />

      <AdminNav />

      <div className='max-w-7xl mx-auto px-6 py-8 space-y-6'>
        <div className='bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden'>
          <div className='flex flex-wrap items-center gap-3 px-5 py-4 border-b border-stone-800 bg-stone-900/40'>
            <div className='relative flex-1 min-w-[180px]'>
              <Search
                size={14}
                className='absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none'
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Search by name or ID…'
                className='w-full pl-9 pr-4 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-colors'
              />
            </div>
            <span className='text-xs text-stone-500 ml-auto'>
              {filtered.length} out-of-stock products
            </span>
          </div>

          <div className='overflow-x-auto'>
            {loading ? (
              <div className='flex items-center justify-center gap-3 py-20 text-stone-500'>
                <Loader2 size={18} className='animate-spin' /> Loading products…
              </div>
            ) : error ? (
              <div className='flex flex-col items-center justify-center gap-3 py-20 text-stone-500'>
                <AlertTriangle size={24} className='text-rose-400' />
                <p className='text-sm'>{error}</p>
                <button
                  onClick={fetchListings}
                  className='px-4 py-2 rounded-xl text-sm border border-stone-700 text-stone-300 hover:border-stone-500 transition-colors'
                >
                  Retry
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className='flex flex-col items-center justify-center gap-3 py-20 text-stone-500'>
                <Package size={28} className='opacity-40' />
                <p className='text-sm'>No out-of-stock products</p>
              </div>
            ) : (
              <table className='w-full'>
                <thead>
                  <tr className='bg-stone-900/60'>
                    <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-500'>
                      Product
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-500'>
                      Price
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-500'>
                      Status
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-500'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr
                      key={p.id}
                      className={`border-t border-stone-800/60 hover:bg-stone-900/40 transition-colors ${i % 2 === 0 ? '' : 'bg-stone-900/10'}`}
                    >
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-3'>
                          <Thumb filename={p.main_image} title={p.title} />
                          <div className='min-w-0'>
                            <p className='text-sm font-semibold text-stone-100 truncate max-w-[240px]'>
                              {p.title}
                            </p>
                            <p className='text-xs text-stone-500 font-mono'>#{p.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-3 text-sm font-semibold text-stone-200'>
                        ₹{Number(p.price).toFixed(2)}
                      </td>
                      <td className='px-4 py-3'>
                        {p.is_active === false ? (
                          <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-700/30 text-stone-400 border border-stone-600/40'>
                            Archived
                          </span>
                        ) : (
                          <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20'>
                            Out of stock
                          </span>
                        )}
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2'>
                          {p.is_active !== false && (
                            <button
                              onClick={() => setArchiveProduct(p)}
                              className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-700 text-stone-300 hover:border-amber-500/50 hover:text-amber-400 hover:bg-amber-500/5 transition-all'
                            >
                              <Archive size={12} /> Archive
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteProductState(p)}
                            className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-700 text-stone-400 hover:border-rose-500/50 hover:text-rose-400 hover:bg-rose-500/5 transition-all'
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {archiveProduct && (
        <ArchiveModal
          product={archiveProduct}
          onConfirm={handleConfirmArchive}
          onClose={() => setArchiveProduct(null)}
        />
      )}
      {deleteProduct && (
        <DeleteModal
          product={deleteProduct}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteProductState(null)}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  )
}

export default NoStockProducts
