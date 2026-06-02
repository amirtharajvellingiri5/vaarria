import React, { useState, useRef, useEffect } from 'react'
import {
  Upload,
  X,
  Plus,
  ChevronDown,
  Image,
  Tag,
  Package,
  Layers,
  DollarSign,
  Check,
  AlertCircle,
  Trash2,
  Eye,
  ArrowLeft,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { useParams } from 'react-router-dom'
import { ADMIN_CATEGORIES as categories } from '../utils/categories'

// ── Constants ─────────────────────────────────────────────────────────────────
// Replace with your actual import: import { COLOR_MAP, formatColorLabel } from '../constants/colors'
const COLOR_MAP = {
  red: '#ef4444', blue: '#3b82f6', green: '#22c55e', black: '#000000',
  white: '#ffffff', yellow: '#eab308', pink: '#ec4899', purple: '#a855f7',
  orange: '#f97316', brown: '#92400e', grey: '#6b7280', navy: '#1e3a5f',
  maroon: '#7f1d1d', teal: '#14b8a6', beige: '#d4b896', cream: '#fffdd0',
  coral: '#ff6b6b', mint: '#98ff98', lavender: '#e6e6fa', gold: '#ffd700',
}
const formatColorLabel = (key) => key.charAt(0).toUpperCase() + key.slice(1)
const COLOR_OPTIONS = Object.keys(COLOR_MAP).map(formatColorLabel)

const uid = () => Math.random().toString(36).slice(2)

const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', 'Free Size']

// ── Sub-components ────────────────────────────────────────────────────────────
const Select = ({ label, options, value, onChange, required }) => {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const searchRef = useRef(null)

  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 0)
  }, [open])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (!e.target.closest('[data-select-root]')) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const filteredOptions = options.filter(
    (o) => typeof o === 'string' && o.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className='relative' data-select-root>
      {label && (
        <label className='block text-xs font-semibold uppercase tracking-widest text-rose-400 mb-1'>
          {label} {required && <span className='text-rose-500'>*</span>}
        </label>
      )}
      <button
        type='button'
        onClick={() => setOpen(!open)}
        className='w-full flex items-center justify-between px-4 py-3 bg-stone-900 border border-stone-700 rounded-xl text-sm text-stone-200 hover:border-rose-500 transition-colors'
      >
        <span className={value ? 'text-stone-100' : 'text-stone-500'}>
          {value || `Select ${label}`}
        </span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className='absolute z-[9999] mt-1 w-full bg-stone-900 border border-stone-700 rounded-xl shadow-2xl overflow-hidden'>
          <div className='p-2 border-b border-stone-800'>
            <input
              ref={searchRef}
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Search...'
              className='w-full px-3 py-2 bg-stone-800 border border-stone-700 rounded-lg text-sm text-stone-100 placeholder-stone-500 focus:outline-none focus:border-rose-500'
            />
          </div>
          <div className='max-h-60 overflow-y-auto'>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((o) => (
                <button
                  key={o}
                  type='button'
                  onClick={() => { onChange(o); setOpen(false); setSearch('') }}
                  className='w-full text-left px-4 py-2.5 text-sm text-stone-300 hover:bg-rose-500/10 hover:text-rose-400 transition-colors flex items-center gap-2'
                >
                  {value === o ? <Check size={12} className='text-rose-400' /> : <span className='w-3' />}
                  {o}
                </button>
              ))
            ) : (
              <div className='px-4 py-3 text-sm text-stone-500'>No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

const Field = ({ label, required, hint, children }) => (
  <div>
    {label && (
      <label className='block text-xs font-semibold uppercase tracking-widest text-rose-400 mb-1'>
        {label} {required && <span className='text-rose-500'>*</span>}
      </label>
    )}
    {children}
    {hint && <p className='mt-1 text-xs text-stone-500'>{hint}</p>}
  </div>
)

const Input = ({ placeholder, value, onChange, type = 'text', prefix, disabled }) => (
  <div className='relative flex items-center'>
    {prefix && (
      <span className='absolute left-4 text-stone-400 text-sm font-medium pointer-events-none'>{prefix}</span>
    )}
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-4 py-3 bg-stone-900 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${prefix ? 'pl-8' : ''}`}
    />
  </div>
)

const Section = ({ icon: Icon, title, subtitle, children }) => (
  <div className='bg-stone-950 border border-stone-800 rounded-2xl overflow-visible'>
    <div className='flex items-center gap-3 px-6 py-4 border-b border-stone-800 bg-stone-900/50'>
      <div className='w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center'>
        <Icon size={16} className='text-rose-400' />
      </div>
      <div>
        <h3 className='text-sm font-bold text-stone-100'>{title}</h3>
        {subtitle && <p className='text-xs text-stone-500'>{subtitle}</p>}
      </div>
    </div>
    <div className='p-6 space-y-5'>{children}</div>
  </div>
)

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Map an API product response back to local component state.
 * Adjust field paths to match your actual API shape.
 */
const mapApiToState = (product) => {
  const variants = (product.inventory?.variants || []).map((v) => ({
    id: uid(),
    color: v.color || 'Red',
    sizes: ALL_SIZES.map((s) => {
      const found = (v.sizes || []).find((sz) => sz.size === s)
      return { size: s, quantity: found ? String(found.quantity) : '' }
    }),
    // Existing server images shown as preview URLs
    main_image_preview: v.main_image
      ? { id: uid(), src: `https://cdn.aarria.com/app/images/${v.main_image}`, name: v.main_image }
      : null,
    other_image_previews: (v.other_images || []).map((key) => ({
      id: uid(),
      src: `https://cdn.aarria.com/app/images/${key}`,
      name: key,
    })),
    // Keep server filenames so unchanged images don't get re-uploaded
    main_image_filename: v.main_image || '',
    other_image_filenames: (v.other_images || []).map((key) => ({ id: uid(), filename: key })),
    // Files are null — only set when the user picks a NEW file
    main_image_file: null,
    other_image_files: [],
    product_id: product.id,
  }))

  return {
    title: product.title || '',
    brandName: product.brand?.name || '',
    catalogueId: product.brand?.catalogue_id || '',
    categoryId: product.category?.category_id || 4,
    material: product.description?.description?.Material || '',
    sleeveLength: product.description?.description?.['Sleeve Length'] || '',
    neck: product.description?.description?.Neck || '',
    designStyling: product.description?.description?.['Design Styling'] || '',
    mrp: String(product.pricing?.mrp || ''),
    salePrice: String(product.pricing?.sale_price || ''),
    buyPrice: String(product.pricing?.buy_price || ''),
    gst: String(product.pricing?.gst || ''),
    discountType: product.pricing?.discounts?.discount_type || 'FLAT',
    discountValue: String(product.pricing?.discounts?.value || ''),
    variants: variants.length > 0 ? variants : [emptyVariant()],
    product_id: product.id,
  }
}

const emptyVariant = () => ({
  id: uid(),
  color: 'Red',
  sizes: ALL_SIZES.map((s) => ({ size: s, quantity: '' })),
  main_image_preview: null,
  other_image_previews: [],
  main_image_filename: '',
  other_image_filenames: [],
  main_image_file: null,
  other_image_files: [],
})

// ── Main Component ────────────────────────────────────────────────────────────
/**
 * Props:
 *   productId  – string/number, the ID of the product to edit
 *   onBack     – optional callback for the ← button
 */
const ProductEdit = ({ onBack }) => {
  // ── Fetch state
  const { id: productId } = useParams()   // get from URL
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [originalRatings, setOriginalRatings] = useState({ average_rating: 0, review_count: 0 })

  // ── Form state
  const [title, setTitle] = useState('')
  const [brandName, setBrandName] = useState('')
  const [catalogueId, setCatalogueId] = useState('')
  const [categoryId, setCategoryId] = useState(4)
  const [material, setMaterial] = useState('')
  const [sleeveLength, setSleeveLength] = useState('')
  const [neck, setNeck] = useState('')
  const [designStyling, setDesignStyling] = useState('')
  const [mrp, setMrp] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [gst, setGst] = useState('')
  const [discountType, setDiscountType] = useState('FLAT')
  const [discountValue, setDiscountValue] = useState('')
  const [variants, setVariants] = useState([emptyVariant()])

  // ── UI state
  const [status, setStatus] = useState('Draft')
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('edit')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // ── Load product on mount ──────────────────────────────────────────────────
  const fetchProduct = async () => {
    setLoading(true)
    setFetchError('')
    try {
      const res = await fetch(
        `https://api.aarria.com/product/${productId}`,
      )
      if (!res.ok) throw new Error(`Failed to fetch product (${res.status})`)
      const data = await res.json()

      const mapped = mapApiToState(data)
      setTitle(mapped.title)
      setBrandName(mapped.brandName)
      setCatalogueId(mapped.catalogueId)
      setCategoryId(mapped.categoryId)
      setMaterial(mapped.material)
      setSleeveLength(mapped.sleeveLength)
      setNeck(mapped.neck)
      setDesignStyling(mapped.designStyling)
      setMrp(mapped.mrp)
      setSalePrice(mapped.salePrice)
      setBuyPrice(mapped.buyPrice)
      setGst(mapped.gst)
      setDiscountType(mapped.discountType)
      setDiscountValue(mapped.discountValue)
      setVariants(mapped.variants)

      // Preserve ratings from API so we don't overwrite them
      setOriginalRatings({
        average_rating: data.ratings?.average_rating ?? 0,
        review_count: data.ratings?.review_count ?? 0,
      })

      setStatus(data.status || 'Draft')
    } catch (err) {
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (productId) fetchProduct()
    else setLoading(false) // no productId: start empty (shouldn't happen in edit mode)
  }, [productId])

  // ── Discount calc ──────────────────────────────────────────────────────────
  const calculateFinalPrice = () => {
    const base = parseFloat(salePrice) || 0
    const d = parseFloat(discountValue) || 0
    if (!base) return { finalPrice: 0, discountAmount: 0, percent: 0 }
    let discountAmount = 0, percent = 0
    if (discountType === 'PERCENTAGE') {
      percent = Math.round(d)
      discountAmount = parseFloat(((base * d) / 100).toFixed(2))
    } else {
      discountAmount = Math.min(d, base)
      percent = base > 0 ? Math.round((discountAmount / base) * 100) : 0
    }
    return { finalPrice: parseFloat((base - discountAmount).toFixed(2)), discountAmount, percent }
  }
  const discountData = calculateFinalPrice()

  // ── Variant helpers ────────────────────────────────────────────────────────
  const setVariantField = (variantId, field, val) =>
    setVariants((prev) => prev.map((v) => v.id === variantId ? { ...v, [field]: val } : v))

  const setVariantSize = (variantId, size, qty) =>
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? { ...v, sizes: v.sizes.map((s) => s.size === size ? { ...s, quantity: qty } : s) }
          : v,
      ),
    )

  // ── Image helpers ──────────────────────────────────────────────────────────
  const readImage = (file) =>
    new Promise((res) => { const r = new FileReader(); r.onload = (e) => res(e.target.result); r.readAsDataURL(file) })

  const handleMainImage = async (variantId, e) => {
    const file = e.target.files[0]
    if (!file) return
    const src = await readImage(file)
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? { ...v, main_image_preview: { id: uid(), src, name: file.name }, main_image_file: file, main_image_filename: '' }
          : v,
      ),
    )
  }

  const removeMainImage = (variantId) =>
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? { ...v, main_image_preview: null, main_image_filename: '', main_image_file: null }
          : v,
      ),
    )

  const handleOtherImages = async (variantId, e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return
    const newEntries = await Promise.all(
      files.map(async (f) => { const src = await readImage(f); return { id: uid(), src, name: f.name, file: f } }),
    )
    setVariants((prev) =>
      prev.map((v) => {
        if (v.id !== variantId) return v
        return {
          ...v,
          other_image_previews: [...v.other_image_previews, ...newEntries.map(({ id, src, name }) => ({ id, src, name }))],
          other_image_files: [...(v.other_image_files || []), ...newEntries.map(({ id, file }) => ({ id, file }))],
          other_image_filenames: [...v.other_image_filenames, ...newEntries.map(({ id }) => ({ id, filename: '' }))],
        }
      }),
    )
  }

  const removeOtherImage = (variantId, imgId) =>
    setVariants((prev) =>
      prev.map((v) =>
        v.id === variantId
          ? {
              ...v,
              other_image_previews: v.other_image_previews.filter((i) => i.id !== imgId),
              other_image_filenames: v.other_image_filenames.filter((i) => i.id !== imgId),
              other_image_files: (v.other_image_files || []).filter((i) => i.id !== imgId),
            }
          : v,
      ),
    )

  // ── Upload only NEW images (existing ones already have filenames) ──────────
  const uploadNewImages = async () => {
    const formData = new FormData()
    let hasFiles = false

    variants.forEach((v) => {
      if (v.main_image_file) { formData.append('images', v.main_image_file); hasFiles = true }
      v.other_image_files?.forEach((f) => { formData.append('images', f.file); hasFiles = true })
    })

    if (!hasFiles) return [] // nothing to upload

    const res = await fetch('https://aarria-image-upload.chatoyantvortex.workers.dev/upload', {
      method: 'POST',
      body: formData,
    })
    const data = await res.json()
    if (!res.ok || !data.success) throw new Error(JSON.stringify(data))
    return data.uploaded
  }

  // ── Build payload ──────────────────────────────────────────────────────────
  const buildPayload = (updatedVariants) => ({
    product_id: productId,
    title,
    brand: { name: brandName, catalogue_id: catalogueId },
    category_id: categoryId,
    description: {
      Material: material,
      'Sleeve Length': sleeveLength,
      Neck: neck,
      'Design Styling': designStyling,
    },
    pricing: {
      mrp: parseFloat(mrp) || 0,
      sale_price: parseFloat(salePrice) || 0,
      buy_price: parseFloat(buyPrice) || 0,
      gst: parseFloat(gst) || 0,
      discounts: { discount_type: discountType, value: parseFloat(discountValue) || 0 },
    },
    inventory: {
      variants: updatedVariants.map((v) => ({
        color: v.color,
        sizes: v.sizes.filter((s) => s.quantity !== '').map((s) => ({ size: s.size, quantity: parseInt(s.quantity) || 0 })),
        main_image: v.main_image_filename,
        other_images: v.other_image_filenames.filter((f) => f.filename).map((f) => f.filename),
      })),
    },
    ratings: originalRatings, // preserve existing ratings
  })

  // ── Update (PUT) ───────────────────────────────────────────────────────────
  const handleUpdate = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      // 1. Upload only new images
      const uploaded = await uploadNewImages()
      let uploadIndex = 0

      const updatedVariants = variants.map((v) => {
        let mainKey = v.main_image_filename // default: keep existing
        let otherFilenames = [...v.other_image_filenames]

        // If user picked a new main image, consume next upload slot
        if (v.main_image_file) {
          mainKey = uploaded[uploadIndex++]?.key || ''
        }

        // For new other images (those with empty filename), consume upload slots
        const resolvedOtherFilenames = otherFilenames.map((f) => {
          if (f.filename === '') {
            // This is a newly added image — find its upload result
            const key = uploaded[uploadIndex++]?.key || ''
            return { ...f, filename: key }
          }
          return f
        })

        return { ...v, main_image_filename: mainKey, other_image_filenames: resolvedOtherFilenames }
      })

      setVariants(updatedVariants)

      // 2. PUT to update API
      const res = await fetch(
        `https://8184radc92.execute-api.ap-south-1.amazonaws.com/prod/products/${productId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(buildPayload(updatedVariants)),
        },
      )
      if (!res.ok) throw new Error(await res.text())

      setStatus('Published')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSubmitError(err.message)
      alert(`Update failed:\n${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveDraft = () => {
    setStatus('Draft')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const addVariant = () => setVariants((prev) => [...prev, emptyVariant()])
  const removeVariant = (id) => setVariants((prev) => prev.filter((v) => v.id !== id))

  // ── Checklist ──────────────────────────────────────────────────────────────
  const checks = [
    { label: 'Title filled', done: title.length > 2 },
    { label: 'Brand name set', done: brandName.length > 0 },
    { label: 'Category selected', done: !!categoryId },
    { label: 'MRP set', done: !!mrp },
    { label: 'Sale price set', done: !!salePrice },
    { label: 'At least one variant', done: variants.length > 0 && variants[0].color !== '' },
    { label: 'Main image present', done: variants.some((v) => v.main_image_filename !== '' || v.main_image_file !== null) },
  ]
  const completeness = Math.round((checks.filter((c) => c.done).length / checks.length) * 100)

  const firstVariant = variants[0]

  // ── Preview ────────────────────────────────────────────────────────────────
  const Preview = () => (
    <div className='bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden'>
      <div className='flex items-center gap-3 px-6 py-4 border-b border-stone-800 bg-stone-900/50'>
        <div className='w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center'>
          <Eye size={16} className='text-rose-400' />
        </div>
        <div>
          <h3 className='text-sm font-bold text-stone-100'>Live Preview</h3>
          <p className='text-xs text-stone-500'>How it'll appear on the store</p>
        </div>
      </div>
      <div className='p-6'>
        <div className='bg-white rounded-xl overflow-hidden shadow-2xl max-w-sm mx-auto'>
          <div className='aspect-[3/4] bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center relative'>
            {firstVariant?.main_image_preview ? (
              <img src={firstVariant.main_image_preview.src} alt='preview' className='w-full h-full object-cover' />
            ) : (
              <div className='text-center text-stone-400'>
                <Image size={48} className='mx-auto mb-2 opacity-30' />
                <p className='text-xs'>No image</p>
              </div>
            )}
            {discountData.percent > 0 && (
              <div className='absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full'>
                -{discountData.percent}%
              </div>
            )}
          </div>
          <div className='p-4'>
            {categoryId && (
              <span className='text-xs text-rose-500 font-semibold uppercase tracking-wider'>
                {categories.find((c) => c.category_id === categoryId)?.name}
              </span>
            )}
            <h4 className='font-bold text-gray-800 mt-1 text-base leading-tight'>{title || 'Product Title'}</h4>
            {brandName && <p className='text-xs text-gray-400 mt-0.5'>by {brandName}</p>}
            <div className='flex items-center gap-2 mt-3'>
              {salePrice && <span className='text-xl font-bold text-rose-600'>₹{discountData.finalPrice.toLocaleString()}</span>}
              {mrp && salePrice && parseFloat(mrp) !== parseFloat(salePrice) && (
                <span className='text-sm text-gray-400 line-through'>₹{parseFloat(mrp).toLocaleString()}</span>
              )}
            </div>
            {firstVariant?.color && <p className='text-xs text-gray-400 mt-2'>Color: {firstVariant.color}</p>}
            {firstVariant?.sizes?.some((s) => s.quantity !== '') && (
              <div className='flex gap-1 mt-3 flex-wrap'>
                {firstVariant.sizes.filter((s) => s.quantity !== '').map((s) => (
                  <span key={s.size} className='text-xs border border-pink-200 text-pink-600 px-2 py-0.5 rounded-full'>{s.size}</span>
                ))}
              </div>
            )}
            <button className='w-full mt-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg text-sm font-semibold'>
              Add to Bag
            </button>
          </div>
        </div>
        {firstVariant?.other_image_previews?.length > 0 && (
          <div className='mt-4'>
            <p className='text-xs text-stone-500 mb-2 uppercase tracking-widest'>Gallery</p>
            <div className='flex gap-2 flex-wrap'>
              {firstVariant.other_image_previews.map((t) => (
                <div key={t.id} className='w-14 h-14 rounded-lg overflow-hidden border border-stone-700'>
                  <img src={t.src} alt='' className='w-full h-full object-cover' />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // ── Loading / Error states ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className='min-h-screen bg-stone-950 flex items-center justify-center' style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <link href='https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap' rel='stylesheet' />
        <div className='flex flex-col items-center gap-4 text-stone-400'>
          <Loader2 size={32} className='animate-spin text-rose-400' />
          <p className='text-sm'>Loading product…</p>
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className='min-h-screen bg-stone-950 flex items-center justify-center' style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <link href='https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap' rel='stylesheet' />
        <div className='flex flex-col items-center gap-4 text-center px-6'>
          <AlertCircle size={32} className='text-rose-400' />
          <p className='text-stone-300 font-medium'>Failed to load product</p>
          <p className='text-stone-500 text-sm max-w-xs'>{fetchError}</p>
          <button
            onClick={fetchProduct}
            className='flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white text-sm font-semibold hover:bg-rose-600 transition'
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    )
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className='min-h-screen bg-stone-950 text-stone-100' style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href='https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap' rel='stylesheet' />

      {/* Top bar */}
      <div className='sticky top-0 z-50 bg-stone-950/95 backdrop-blur border-b border-stone-800'>
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <button
              onClick={onBack}
              className='p-2 rounded-lg hover:bg-stone-800 transition-colors text-stone-400 hover:text-stone-100'
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className='font-bold text-stone-100' style={{ fontFamily: "'Playfair Display', serif", fontSize: 18 }}>
                Edit Product
              </h1>
              <p className='text-xs text-stone-500'>
                {productId ? `ID: ${productId}` : 'Women\'s Ethnic Wear Store'}
              </p>
            </div>
          </div>

          <div className='hidden md:flex items-center bg-stone-900 rounded-xl p-1 border border-stone-800'>
            {['edit', 'preview'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeTab === t ? 'bg-rose-500 text-white shadow' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {t === 'preview' ? '👁 Preview' : '✏️ Edit'}
              </button>
            ))}
          </div>

          <div className='flex items-center gap-3'>
            {saved && (
              <div className='flex items-center gap-1.5 text-emerald-400 text-sm font-medium'>
                <Check size={14} /> Saved!
              </div>
            )}
            {submitError && (
              <div className='flex items-center gap-1.5 text-rose-400 text-xs max-w-xs truncate'>
                <AlertCircle size={13} /> {submitError}
              </div>
            )}
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              status === 'Published'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
            }`}>
              {status}
            </span>
            <button
              onClick={handleSaveDraft}
              className='px-4 py-2 rounded-xl text-sm font-semibold border border-stone-700 text-stone-300 hover:border-stone-500 hover:text-stone-100 transition-colors'
            >
              Save Draft
            </button>
            <button
              onClick={handleUpdate}
              disabled={submitting}
              className='flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg shadow-rose-500/20 disabled:opacity-60'
            >
              {submitting ? <><Loader2 size={14} className='animate-spin' /> Saving…</> : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className='max-w-7xl mx-auto px-6 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

          {/* LEFT: edit form */}
          {activeTab === 'edit' && (
            <div className='lg:col-span-2 space-y-6'>
              <Section icon={Package} title='Basic Information' subtitle='Title, brand and catalogue'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                  <div className='sm:col-span-2'>
                    <Field label='Product Title' required>
                      <Input value={title} onChange={setTitle} placeholder='e.g. Jansya Kurti' />
                    </Field>
                  </div>
                  <Field label='Brand Name' required>
                    <Input value={brandName} onChange={setBrandName} placeholder='e.g. Esika' />
                  </Field>
                  <Field label='Catalogue ID'>
                    <Input value={catalogueId} onChange={setCatalogueId} placeholder='e.g. BRAND-ESIKA-1' />
                  </Field>
                </div>
              </Section>

              <Section icon={Layers} title='Category' subtitle='Product categorisation'>
                <Select
                  label='Category'
                  required
                  value={categories.find((c) => c.category_id === categoryId)?.name}
                  onChange={(val) => { const selected = categories.find((c) => c.name === val); setCategoryId(selected.category_id) }}
                  options={categories.map((c) => c.name)}
                />
              </Section>

              <Section icon={Tag} title='Description Attributes' subtitle='Fabric, sleeve, neck, styling'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                  <Select label='Material' value={material} onChange={setMaterial} options={['Cotton','Polyester','Cotton Blend','Rayon','Viscose','Poly Cotton','Georgette','Chiffon','Silk','Art Silk','Cotton Silk','Linen','Linen Blend','Khadi','Chanderi','Banarasi Silk','Satin','Organza','Velvet','Denim','Knitted','Spandex','Lycra','Rayon Blend','Silk Blend']} />
                  <Select label='Sleeve Length' value={sleeveLength} onChange={setSleeveLength} options={['Sleeveless','Short Sleeves','Half Sleeves','3/4 Sleeves','Long Sleeves','Cap Sleeves','Bell Sleeves','Puff Sleeves']} />
                  <Select label='Neck' value={neck} onChange={setNeck} options={['Round Neck','V-Neck','Boat Neck','Mandarin Collar','Collared Neck','Square Neck','Sweetheart Neck','Keyhole Neck']} />
                  <Select label='Design Styling' value={designStyling} onChange={setDesignStyling} options={['Regular','Straight','A-Line','Flared','Anarkali','Asymmetric','Layered','Panelled']} />
                </div>
              </Section>

              <Section icon={DollarSign} title='Pricing' subtitle='MRP, sale price, buy price & GST'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                  <Field label='MRP' required><Input value={mrp} onChange={setMrp} type='number' placeholder='0.00' prefix='₹' /></Field>
                  <Field label='Sale Price' required><Input value={salePrice} onChange={setSalePrice} type='number' placeholder='0.00' prefix='₹' /></Field>
                  <Field label='Buy Price' hint='Not shown to customers'><Input value={buyPrice} onChange={setBuyPrice} type='number' placeholder='0.00' prefix='₹' /></Field>
                  <Field label='GST (%)'><Input value={gst} onChange={setGst} type='number' placeholder='e.g. 5.2' /></Field>
                  <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4'>
                    <Select label='Discount Type' value={discountType} onChange={setDiscountType} options={['FLAT', 'PERCENTAGE']} />
                    <Field label='Discount Value'><Input value={discountValue} onChange={setDiscountValue} type='number' placeholder='Enter value' /></Field>
                  </div>
                </div>

                {mrp && salePrice && buyPrice && (
                  <div className='flex items-center gap-4 p-4 bg-stone-900 rounded-xl border border-stone-800 text-sm flex-wrap'>
                    <div>
                      <p className='text-stone-500 text-xs'>Final Price</p>
                      <p className='font-bold text-blue-400'>₹{discountData.finalPrice.toLocaleString()}</p>
                    </div>
                    <div className='w-px h-8 bg-stone-700' />
                    <div>
                      <p className='text-stone-500 text-xs'>Margin</p>
                      <p className='font-bold text-emerald-400'>₹{(discountData.finalPrice - parseFloat(buyPrice)).toLocaleString()}</p>
                    </div>
                    <div className='w-px h-8 bg-stone-700' />
                    <div>
                      <p className='text-stone-500 text-xs'>Margin %</p>
                      <p className='font-bold text-emerald-400'>
                        {discountData.finalPrice > 0 ? Math.round(((discountData.finalPrice - parseFloat(buyPrice)) / discountData.finalPrice) * 100) : 0}%
                      </p>
                    </div>
                    {discountData.percent > 0 && (
                      <>
                        <div className='w-px h-8 bg-stone-700' />
                        <div>
                          <p className='text-stone-500 text-xs'>Discount shown</p>
                          <p className='font-bold text-rose-400'>{discountData.percent}% off</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </Section>

              <Section icon={Image} title='Inventory & Variants' subtitle='Color variants with sizes, quantities and images'>
                <div className='space-y-8'>
                  {variants.map((variant, vi) => (
                    <VariantCard
                      key={variant.id}
                      variant={variant}
                      index={vi}
                      onColorChange={(val) => setVariantField(variant.id, 'color', val)}
                      onSizeQtyChange={(size, qty) => setVariantSize(variant.id, size, qty)}
                      onMainImage={(e) => handleMainImage(variant.id, e)}
                      onRemoveMainImage={() => removeMainImage(variant.id)}
                      onOtherImages={(e) => handleOtherImages(variant.id, e)}
                      onRemoveOtherImage={(imgId) => removeOtherImage(variant.id, imgId)}
                      onRemoveVariant={variants.length > 1 ? () => removeVariant(variant.id) : null}
                    />
                  ))}
                </div>
                <button
                  type='button'
                  onClick={addVariant}
                  className='w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-stone-700 hover:border-rose-500 rounded-xl text-sm text-stone-500 hover:text-rose-400 transition-colors'
                >
                  <Plus size={16} /> Add Another Color Variant
                </button>
              </Section>

              {/* Mobile action buttons */}
              <div className='flex gap-3 md:hidden pb-4'>
                <button onClick={handleSaveDraft} className='flex-1 py-3 rounded-xl text-sm font-semibold border border-stone-700 text-stone-300'>
                  Save Draft
                </button>
                <button onClick={handleUpdate} disabled={submitting} className='flex-1 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-rose-500 to-pink-600 text-white disabled:opacity-60'>
                  {submitting ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          {/* RIGHT: preview + checklist */}
          <div className={`space-y-6 ${activeTab === 'preview' ? 'lg:col-span-2' : ''}`}>
            <Preview />
            <div className='bg-stone-950 border border-stone-800 rounded-2xl p-5'>
              <h4 className='text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4'>Checklist</h4>
              <div className='space-y-3'>
                {checks.map(({ label, done }) => (
                  <div key={label} className='flex items-center gap-3'>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stone-800 text-stone-600'}`}>
                      {done ? <Check size={11} /> : <AlertCircle size={11} />}
                    </div>
                    <span className={`text-xs ${done ? 'text-stone-300 line-through decoration-stone-600' : 'text-stone-500'}`}>{label}</span>
                  </div>
                ))}
              </div>
              <div className='mt-4'>
                <div className='flex justify-between items-center mb-1.5'>
                  <span className='text-xs text-stone-600'>Listing completeness</span>
                  <span className='text-xs font-bold text-rose-400'>{completeness}%</span>
                </div>
                <div className='h-1.5 bg-stone-800 rounded-full overflow-hidden'>
                  <div className='h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500' style={{ width: `${completeness}%` }} />
                </div>
              </div>
            </div>

            <div className='bg-stone-950 border border-stone-800 rounded-2xl p-5'>
              <h4 className='text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3'>SEO Preview</h4>
              <div className='p-3 bg-white rounded-xl'>
                <p className='text-blue-700 text-sm font-medium truncate'>{title || 'Product Title'} — YourStore.com</p>
                <p className='text-green-700 text-xs mt-0.5 truncate'>
                  yourstore.com/products/{title ? title.toLowerCase().replace(/\s+/g, '-') : 'product-name'}
                </p>
                <p className='text-gray-500 text-xs mt-1'>
                  {[material, sleeveLength, neck, designStyling].filter(Boolean).join(' · ') || 'Add description attributes to improve search visibility…'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Variant Card ──────────────────────────────────────────────────────────────
const VariantCard = ({
  variant, index,
  onColorChange, onSizeQtyChange,
  onMainImage, onRemoveMainImage,
  onOtherImages, onRemoveOtherImage,
  onRemoveVariant,
}) => {
  const mainRef = useRef()
  const otherRef = useRef()
  const anyOtherUploading = variant.other_image_filenames.some((f) => f.uploading)

  return (
    <div className='border border-stone-800 rounded-2xl overflow-hidden bg-stone-900/30'>
      <div className='flex items-center justify-between px-5 py-3 border-b border-stone-800 bg-stone-900/60'>
        <span className='text-xs font-semibold uppercase tracking-widest text-rose-400'>
          Variant {index + 1}{variant.color ? ` · ${variant.color}` : ''}
        </span>
        {onRemoveVariant && (
          <button onClick={onRemoveVariant} className='p-1 text-stone-600 hover:text-rose-400 transition-colors'>
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <div className='p-5 space-y-5'>
        <Select label='Color' required value={variant.color} onChange={onColorChange} options={COLOR_OPTIONS} />

        <div>
          <label className='block text-xs font-semibold uppercase tracking-widest text-rose-400 mb-3'>Sizes & Quantities</label>
          <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
            {variant.sizes.map(({ size, quantity }) => (
              <div key={size} className='space-y-1'>
                <div className={`text-center text-xs font-semibold py-1.5 rounded-lg border transition-colors ${
                  quantity !== '' && parseInt(quantity) > 0
                    ? 'border-rose-500 bg-rose-500/10 text-rose-300'
                    : 'border-stone-700 text-stone-500'
                }`}>
                  {size}
                </div>
                <input
                  type='number'
                  min='0'
                  value={quantity}
                  onChange={(e) => onSizeQtyChange(size, e.target.value)}
                  placeholder='Qty'
                  className='w-full text-center px-2 py-2 bg-stone-900 border border-stone-700 rounded-lg text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-rose-500 transition-colors'
                />
              </div>
            ))}
          </div>
        </div>

        {/* Main Image */}
        <div>
          <label className='block text-xs font-semibold uppercase tracking-widest text-rose-400 mb-2'>
            Main Image <span className='text-rose-500'>*</span>
          </label>
          {variant.main_image_preview ? (
            <div className='relative group rounded-xl overflow-hidden border-2 border-rose-500/40 aspect-[4/3] bg-stone-900'>
              <img src={variant.main_image_preview.src} alt='main' className='w-full h-full object-contain' />
              {variant.main_image_uploading && (
                <div className='absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2'>
                  <Loader2 size={24} className='text-rose-400 animate-spin' />
                  <span className='text-xs text-stone-300'>Uploading…</span>
                </div>
              )}
              {!variant.main_image_uploading && (
                <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3'>
                  <button onClick={() => mainRef.current.click()} className='px-3 py-1.5 bg-white/20 backdrop-blur rounded-lg text-white text-xs font-medium hover:bg-white/30 transition'>
                    Change
                  </button>
                  <button
                    onClick={() => { mainRef.current.value = ''; onRemoveMainImage() }}
                    className='px-3 py-1.5 bg-rose-500/80 backdrop-blur rounded-lg text-white text-xs font-medium hover:bg-rose-500 transition'
                  >
                    Remove
                  </button>
                </div>
              )}
              {/* Badge: "Existing" for server images, "New" for just-picked files */}
              <div className={`absolute bottom-2 right-2 text-white text-xs font-bold px-2 py-0.5 rounded-full ${
                variant.main_image_file ? 'bg-amber-500' : 'bg-emerald-500'
              }`}>
                {variant.main_image_file ? 'New (unsaved)' : 'Saved ✓'}
              </div>
            </div>
          ) : (
            <button
              onClick={() => mainRef.current.click()}
              className='w-full border-2 border-dashed border-stone-700 hover:border-rose-500 rounded-xl aspect-[4/3] flex flex-col items-center justify-center gap-2 transition-colors group bg-stone-900/50 hover:bg-rose-500/5'
            >
              <div className='w-12 h-12 rounded-xl bg-stone-800 group-hover:bg-rose-500/10 flex items-center justify-center transition-colors'>
                <Upload size={22} className='text-stone-500 group-hover:text-rose-400 transition-colors' />
              </div>
              <p className='text-sm font-semibold text-stone-400 group-hover:text-rose-400 transition-colors'>Upload Main Photo</p>
              <p className='text-xs text-stone-600'>PNG, JPG up to 10MB</p>
            </button>
          )}
          <input ref={mainRef} type='file' accept='image/*' className='hidden' onChange={onMainImage} />
        </div>

        {/* Other Images */}
        <div>
          <label className='block text-xs font-semibold uppercase tracking-widest text-rose-400 mb-2'>
            Other Images{' '}
            <span className='text-stone-600 font-normal normal-case tracking-normal ml-1'>
              ({variant.other_image_previews.length}/8)
            </span>
          </label>
          <div className='grid grid-cols-4 gap-2'>
            {variant.other_image_previews.map((img) => {
              const uploadState = variant.other_image_filenames.find((f) => f.id === img.id)
              const isUploading = uploadState?.uploading
              const isNewFile = uploadState && uploadState.filename === ''
              return (
                <div key={img.id} className='relative group aspect-square rounded-xl overflow-hidden border border-stone-700 bg-stone-900'>
                  <img src={img.src} alt='' className='w-full h-full object-cover' />
                  {isUploading && (
                    <div className='absolute inset-0 bg-black/60 flex items-center justify-center'>
                      <Loader2 size={16} className='text-rose-400 animate-spin' />
                    </div>
                  )}
                  {/* Saved tick for existing server images */}
                  {!isUploading && !isNewFile && uploadState?.filename && (
                    <div className='absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center'>
                      <Check size={9} className='text-white' />
                    </div>
                  )}
                  {/* "New" badge for newly picked files */}
                  {!isUploading && isNewFile && (
                    <div className='absolute top-1 right-1 bg-amber-500 text-white text-[9px] font-bold px-1 rounded'>NEW</div>
                  )}
                  {!isUploading && (
                    <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                      <button onClick={() => onRemoveOtherImage(img.id)} className='p-1.5 bg-rose-500 rounded-full text-white hover:bg-rose-600 transition'>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
            {variant.other_image_previews.length < 8 && (
              <button
                onClick={() => otherRef.current.click()}
                className='aspect-square rounded-xl border-2 border-dashed border-stone-700 hover:border-rose-500 flex flex-col items-center justify-center gap-1 transition-colors group hover:bg-rose-500/5'
              >
                <Plus size={18} className='text-stone-600 group-hover:text-rose-400 transition-colors' />
                <span className='text-xs text-stone-600 group-hover:text-rose-400 transition-colors'>Add</span>
              </button>
            )}
          </div>
          <input ref={otherRef} type='file' accept='image/*' multiple className='hidden' onChange={onOtherImages} />
          {anyOtherUploading && (
            <p className='mt-2 text-xs text-amber-400 flex items-center gap-1'>
              <Loader2 size={11} className='animate-spin' /> Uploading images…
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductEdit
