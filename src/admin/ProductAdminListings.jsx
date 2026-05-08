import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  AlertTriangle,
  Package,
  Image as ImageIcon,
  Loader2,
  RefreshCw,
} from 'lucide-react'

const CDN = 'https://cdn.aarria.com/app/images/'
const API = 'https://api.aarria.com/listings'
const PRODUCTS_API =
  'https://8184radc92.execute-api.ap-south-1.amazonaws.com/prod/products'
const PAGE_SIZE = 10

// ── Helpers ───────────────────────────────────────────────────────────────────
const imgSrc = (filename) => `${CDN}${filename}`

const StockBadge = ({ stock }) => {
  if (stock === 0)
    return (
      <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20'>
        Out of stock
      </span>
    )
  if (stock < 5)
    return (
      <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20'>
        Low · {stock}
      </span>
    )
  return (
    <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'>
      {stock} in stock
    </span>
  )
}

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

const SortIcon = ({ col, sortCol, sortDir }) => {
  if (sortCol !== col)
    return <ChevronUp size={12} className='text-stone-600 opacity-40' />
  return sortDir === 'asc' ? (
    <ChevronUp size={12} className='text-rose-400' />
  ) : (
    <ChevronDown size={12} className='text-rose-400' />
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

// ── Edit Modal ────────────────────────────────────────────────────────────────
const EditModal = ({ product, onSave, onClose }) => {
  const [title, setTitle] = useState(product.title)
  const [price, setPrice] = useState(String(product.price))
  const [stock, setStock] = useState(String(product.stock))

  const handleSave = () => {
    if (!title.trim()) return
    onSave({
      ...product,
      title: title.trim(),
      price: parseFloat(price) || 0,
      stock: parseInt(stock) || 0,
    })
  }

  return (
    <div
      className='fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4'
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className='w-full max-w-md bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden shadow-2xl'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-900/50'>
          <div className='flex items-center gap-3'>
            <div className='w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center'>
              <Edit2 size={14} className='text-rose-400' />
            </div>
            <div>
              <h3 className='text-sm font-bold text-stone-100'>Edit Product</h3>
              <p className='text-xs text-stone-500'>#{product.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='p-1.5 rounded-lg text-stone-500 hover:text-stone-200 hover:bg-stone-800 transition-colors'
          >
            <X size={16} />
          </button>
        </div>

        <div className='p-6 space-y-4'>
          {product.main_image && (
            <div className='flex gap-2 flex-wrap mb-2'>
              {(product.images || [product.main_image]).map((img, i) => (
                <img
                  key={i}
                  src={imgSrc(img)}
                  alt=''
                  className='w-14 h-14 rounded-xl object-cover border border-stone-700'
                  onError={(e) => (e.target.style.display = 'none')}
                />
              ))}
            </div>
          )}

          <div>
            <label className='block text-xs font-semibold uppercase tracking-widest text-rose-400 mb-1.5'>
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className='w-full px-4 py-3 bg-stone-900 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-colors'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='block text-xs font-semibold uppercase tracking-widest text-rose-400 mb-1.5'>
                Price (₹)
              </label>
              <input
                type='number'
                step='0.01'
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className='w-full px-4 py-3 bg-stone-900 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-colors'
              />
            </div>
            <div>
              <label className='block text-xs font-semibold uppercase tracking-widest text-rose-400 mb-1.5'>
                Stock
              </label>
              <input
                type='number'
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className='w-full px-4 py-3 bg-stone-900 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-colors'
              />
            </div>
          </div>
        </div>

        <div className='flex items-center justify-end gap-3 px-6 py-4 border-t border-stone-800 bg-stone-900/30'>
          <button
            onClick={onClose}
            className='px-4 py-2 rounded-xl text-sm font-semibold border border-stone-700 text-stone-300 hover:border-stone-500 hover:text-stone-100 transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className='px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg shadow-rose-500/20'
          >
            Save Changes
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

  const handleDelete = async () => {
    setDeleting(true)
    setError('')
    try {
      const res = await fetch(`${PRODUCTS_API}/${product.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      onConfirm()
    } catch (e) {
      setError('Delete failed. Please try again.')
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
              <p className='text-sm font-semibold text-stone-100'>
                {product.title}
              </p>
              <p className='text-xs text-stone-500 font-mono'>#{product.id}</p>
            </div>
          </div>
          <p className='text-sm text-stone-400'>
            Are you sure you want to delete this product? This action cannot be
            undone.
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
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
const ProductListings = () => {
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [search, setSearch] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [sortCol, setSortCol] = useState('id')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)

  const [editProduct, setEditProduct] = useState(null)
  const [deleteProduct, setDeleteProduct] = useState(null)
  const [toast, setToast] = useState('')
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}?page=1&page_size=100`)
      const json = await res.json()
      setAllProducts(json.data || [])
    } catch {
      setError('Failed to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch(
        'https://8184radc92.execute-api.ap-south-1.amazonaws.com/prod//sync/products',
        { method: 'POST' },
      )
      if (!res.ok) throw new Error(`Error ${res.status}`)
      setToast('Products synced successfully')
      await fetchListings()
    } catch {
      setToast('Sync failed. Please try again.')
    } finally {
      setSyncing(false)
    }
  }

  const filtered = (() => {
    let arr = allProducts.filter((p) => {
      const q = search.toLowerCase()
      const matchQ =
        !q || p.title.toLowerCase().includes(q) || String(p.id).includes(q)
      const matchStock =
        stockFilter === 'all' ||
        (stockFilter === 'instock' && p.stock > 0) ||
        (stockFilter === 'low' && p.stock > 0 && p.stock < 5) ||
        (stockFilter === 'out' && p.stock === 0)
      return matchQ && matchStock
    })
    arr = [...arr].sort((a, b) => {
      let av = a[sortCol],
        bv = b[sortCol]
      if (typeof av === 'string') {
        av = av.toLowerCase()
        bv = bv.toLowerCase()
      }
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : av < bv ? 1 : -1
    })
    return arr
  })()

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageSlice = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  )

  const handleSort = (col) => {
    if (sortCol === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortCol(col)
      setSortDir('asc')
    }
    setPage(1)
  }

  const handleSearch = (v) => {
    setSearch(v)
    setPage(1)
  }
  const handleStockFilter = (v) => {
    setStockFilter(v)
    setPage(1)
  }

  const handleSaveEdit = useCallback((updated) => {
    setAllProducts((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p)),
    )
    setEditProduct(null)
    setToast('Product updated successfully')
  }, [])

  const handleConfirmDelete = useCallback(() => {
    setAllProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id))
    setDeleteProduct(null)
    setToast('Product deleted')
  }, [deleteProduct])

  const stats = {
    total: allProducts.length,
    instock: allProducts.filter((p) => p.stock > 0).length,
    low: allProducts.filter((p) => p.stock > 0 && p.stock < 5).length,
    out: allProducts.filter((p) => p.stock === 0).length,
  }

const openProduct = (id) => {
  window.open(`/product/${id}`, '_blank')
}

const openEditProduct = (id) => {
  window.open(
    `http://localhost:5173/admin/products/edit/${id}`,
    '_blank',
  )
}
  const pageNums = (() => {
    const nums = []
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || Math.abs(i - safePage) <= 1)
        nums.push(i)
      else if (nums[nums.length - 1] !== '…') nums.push('…')
    }
    return nums
  })()

  const thClass = (col) =>
    `px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest cursor-pointer select-none whitespace-nowrap transition-colors ${
      sortCol === col ? 'text-rose-400' : 'text-stone-500 hover:text-stone-300'
    }`

  return (
    <div
      className='min-h-screen bg-stone-950 text-stone-100'
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <link
        href='https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap'
        rel='stylesheet'
      />

      {/* Top bar */}
      <div className='sticky top-0 z-30 bg-stone-950/95 backdrop-blur border-b border-stone-800'>
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
          <div>
            <h1
              className='font-bold text-stone-100'
              style={{ fontFamily: "'Playfair Display', serif", fontSize: 18 }}
            >
              Product Listings
            </h1>
            <p className='text-xs text-stone-500'>Women's Ethnic Wear Store</p>
          </div>
          <div>
            <h1
              className='font-bold text-stone-100'
              style={{ fontFamily: "'Playfair Display', serif", fontSize: 18 }}
            >
              <a href="/products">Go to Store</a>
            </h1>
          </div>
          <div className='flex items-center gap-3'>
            <button
              onClick={handleSync}
              disabled={syncing}
              className='flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-stone-700 text-stone-300 hover:border-stone-500 hover:text-stone-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {syncing ? (
                <Loader2 size={14} className='animate-spin' />
              ) : (
                <RefreshCw size={14} />
              )}
              {syncing ? 'Syncing…' : 'Sync'}
            </button>
            <button
              onClick={() => window.open('/admin/products/new', '_blank')}
              className='flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg shadow-rose-500/20'
            >
              <Plus size={15} /> Add Product
            </button>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-8 space-y-6'>
        {/* Stats */}
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
          {[
            {
              label: 'Total Products',
              val: stats.total,
              color: 'text-stone-100',
            },
            {
              label: 'In Stock',
              val: stats.instock,
              color: 'text-emerald-400',
            },
            { label: 'Low Stock', val: stats.low, color: 'text-amber-400' },
            { label: 'Out of Stock', val: stats.out, color: 'text-rose-400' },
          ].map(({ label, val, color }) => (
            <div
              key={label}
              className='bg-stone-900 border border-stone-800 rounded-2xl p-4'
            >
              <p className='text-xs font-semibold uppercase tracking-widest text-stone-500 mb-1'>
                {label}
              </p>
              <p className={`text-2xl font-bold ${color}`}>{val}</p>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className='bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden'>
          {/* Toolbar */}
          <div className='flex flex-wrap items-center gap-3 px-5 py-4 border-b border-stone-800 bg-stone-900/40'>
            <div className='relative flex-1 min-w-[180px]'>
              <Search
                size={14}
                className='absolute left-3 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none'
              />
              <input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder='Search by name or ID…'
                className='w-full pl-9 pr-4 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-colors'
              />
            </div>
            <select
              value={stockFilter}
              onChange={(e) => handleStockFilter(e.target.value)}
              className='px-3 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-sm text-stone-300 focus:outline-none focus:border-rose-500 transition-colors'
            >
              <option value='all'>All stock</option>
              <option value='instock'>In stock</option>
              <option value='low'>Low stock</option>
              <option value='out'>Out of stock</option>
            </select>
            <span className='text-xs text-stone-500 ml-auto'>
              {filtered.length} products
            </span>
          </div>

          {/* Table */}
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
            ) : pageSlice.length === 0 ? (
              <div className='flex flex-col items-center justify-center gap-3 py-20 text-stone-500'>
                <Package size={28} className='opacity-40' />
                <p className='text-sm'>No products found</p>
              </div>
            ) : (
              <table className='w-full'>
                <thead>
                  <tr className='bg-stone-900/60'>
                    <th
                      className={thClass('title')}
                      onClick={() => handleSort('title')}
                    >
                      <span className='flex items-center gap-1.5'>
                        Product{' '}
                        <SortIcon
                          col='title'
                          sortCol={sortCol}
                          sortDir={sortDir}
                        />
                      </span>
                    </th>
                    <th
                      className={thClass('price')}
                      onClick={() => handleSort('price')}
                    >
                      <span className='flex items-center gap-1.5'>
                        Price{' '}
                        <SortIcon
                          col='price'
                          sortCol={sortCol}
                          sortDir={sortDir}
                        />
                      </span>
                    </th>
                    <th
                      className={thClass('stock')}
                      onClick={() => handleSort('stock')}
                    >
                      <span className='flex items-center gap-1.5'>
                        Stock{' '}
                        <SortIcon
                          col='stock'
                          sortCol={sortCol}
                          sortDir={sortDir}
                        />
                      </span>
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-500'>
                      Images
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-semibold uppercase tracking-widest text-stone-500'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {pageSlice.map((p, i) => (
                    <tr
                      key={p.id}
                      className={`border-t border-stone-800/60 hover:bg-stone-900/40 transition-colors ${i % 2 === 0 ? '' : 'bg-stone-900/10'}`}
                    >
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-3'>
                          <div
                            onClick={() => openProduct(p.id)}
                            className='cursor-pointer'
                          >
                            <Thumb filename={p.main_image} title={p.title} />
                          </div>
                          <div className='min-w-0'>
                            <p
                              onClick={() => openProduct(p.id)}
                              className='text-sm font-semibold text-stone-100 truncate max-w-[200px] cursor-pointer hover:text-rose-400'
                            >
                              {p.title}
                            </p>
                            <p className='text-xs text-stone-500 font-mono'>
                              #{p.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className='px-4 py-3 text-sm font-semibold text-stone-200'>
                        ₹{Number(p.price).toFixed(2)}
                      </td>
                      <td className='px-4 py-3'>
                        <StockBadge stock={p.stock} />
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-1.5'>
                          {(p.images || []).slice(0, 3).map((img, j) => (
                            <img
                              key={j}
                              src={imgSrc(img)}
                              alt=''
                              className='w-7 h-7 rounded-md object-cover border border-stone-700'
                              onError={(e) => (e.target.style.display = 'none')}
                            />
                          ))}
                          {(p.images || []).length > 3 && (
                            <span className='text-xs text-stone-500'>
                              +{p.images.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex items-center gap-2'>
                          <button
  onClick={() => openEditProduct(p.id)}
                            className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-700 text-stone-300 hover:border-rose-500/50 hover:text-rose-400 hover:bg-rose-500/5 transition-all'
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteProduct(p)}
                            className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-stone-700 text-stone-400 hover:border-rose-500/50 hover:text-rose-400 hover:bg-rose-500/5 transition-all'
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {!loading && !error && filtered.length > 0 && (
            <div className='flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-stone-800 bg-stone-900/30'>
              <p className='text-xs text-stone-500'>
                Showing{' '}
                {Math.min((safePage - 1) * PAGE_SIZE + 1, filtered.length)}–
                {Math.min(safePage * PAGE_SIZE, filtered.length)} of{' '}
                {filtered.length}
              </p>
              <div className='flex items-center gap-1.5'>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className='p-1.5 rounded-lg border border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                >
                  <ChevronLeft size={14} />
                </button>
                {pageNums.map((n, i) =>
                  n === '…' ? (
                    <span
                      key={`ellipsis-${i}`}
                      className='px-2 text-stone-600 text-xs'
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                        safePage === n
                          ? 'bg-rose-500 text-white border border-rose-500'
                          : 'border border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-200'
                      }`}
                    >
                      {n}
                    </button>
                  ),
                )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className='p-1.5 rounded-lg border border-stone-700 text-stone-400 hover:border-stone-500 hover:text-stone-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors'
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {editProduct && (
        <EditModal
          product={editProduct}
          onSave={handleSaveEdit}
          onClose={() => setEditProduct(null)}
        />
      )}
      {deleteProduct && (
        <DeleteModal
          product={deleteProduct}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeleteProduct(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast('')} />}
    </div>
  )
}

export default ProductListings
