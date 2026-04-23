import React, { useState, useRef } from 'react'
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
} from 'lucide-react'

const uid = () => Math.random().toString(36).slice(2)

// ── Mock Image Upload API ─────────────────────────────────────────────────────
// Replace this with your real endpoint. It receives a FormData with `file`,
// and returns { filename: "server-assigned-name.jpg" }
const mockUploadImage = async (file) => {
  await new Promise(r => setTimeout(r, 600 + Math.random() * 600)) // fake latency
  const ext = file.name.split('.').pop()
  const serverName = `${uid()}_${Date.now()}.${ext}`
  return { filename: serverName }
}

// ── Sub-components ────────────────────────────────────────────────────────────
const Select = ({ label, options, value, onChange, required }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className='relative'>
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
          {options.map((o) => (
            <button
              key={o}
              type='button'
              onClick={() => { onChange(o); setOpen(false) }}
              className='w-full text-left px-4 py-2.5 text-sm text-stone-300 hover:bg-rose-500/10 hover:text-rose-400 transition-colors flex items-center gap-2'
            >
              {value === o && <Check size={12} className='text-rose-400' />}
              {value !== o && <span className='w-3' />}
              {o}
            </button>
          ))}
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

const Input = ({ placeholder, value, onChange, type = 'text', prefix }) => (
  <div className='relative flex items-center'>
    {prefix && (
      <span className='absolute left-4 text-stone-400 text-sm font-medium pointer-events-none'>{prefix}</span>
    )}
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 bg-stone-900 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-colors ${prefix ? 'pl-8' : ''}`}
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

const emptyVariant = () => ({
  id: uid(),
  color: '',
  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'].map(s => ({ size: s, quantity: '' })),
  // preview src (base64) for display only — never sent to API
  main_image_preview: null,
  other_image_previews: [], // [{ id, src, name }] — display only
  // server-returned filenames — these go into the payload
  main_image_filename: '',        // string
  other_image_filenames: [],      // [{ id, filename }]
  // upload states
  main_image_uploading: false,
  other_images_uploading: [],     // [id] currently uploading
})

// ── Main Component ────────────────────────────────────────────────────────────
const ProductUpload = () => {
  // Basic Info
  const [title, setTitle] = useState('')
  const [brandName, setBrandName] = useState('')
  const [catalogueId, setCatalogueId] = useState('')

  // Category
  const [categoryName, setCategoryName] = useState('')

  // Description attributes
  const [material, setMaterial] = useState('')
  const [sleeveLength, setSleeveLength] = useState('')
  const [neck, setNeck] = useState('')
  const [designStyling, setDesignStyling] = useState('')

  // Pricing
  const [mrp, setMrp] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [gst, setGst] = useState('')

  // Variants
  const [variants, setVariants] = useState([emptyVariant()])

  // UI state
  const [status, setStatus] = useState('Draft')
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('edit')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // ── Variant field helpers ─────────────────────────────────────────────────
  const setVariantField = (variantId, field, val) =>
    setVariants(prev => prev.map(v => v.id === variantId ? { ...v, [field]: val } : v))

  const setVariantSize = (variantId, size, qty) =>
    setVariants(prev => prev.map(v =>
      v.id === variantId
        ? { ...v, sizes: v.sizes.map(s => s.size === size ? { ...s, quantity: qty } : s) }
        : v
    ))

  // ── Image upload helpers ──────────────────────────────────────────────────
  const readImage = (file) =>
    new Promise((res) => {
      const r = new FileReader()
      r.onload = (e) => res(e.target.result)
      r.readAsDataURL(file)
    })

  /**
   * Called when user picks a main image.
   * 1. Read for preview
   * 2. Upload immediately → get server filename
   * 3. Store filename for payload
   */
  const handleMainImage = async (variantId, e) => {
    const file = e.target.files[0]
    if (!file) return

    // Show preview instantly
    const src = await readImage(file)
    setVariants(prev => prev.map(v =>
      v.id === variantId
        ? { ...v, main_image_preview: { id: uid(), src, name: file.name }, main_image_uploading: true, main_image_filename: '' }
        : v
    ))

    try {
      const { filename } = await mockUploadImage(file)
      setVariants(prev => prev.map(v =>
        v.id === variantId
          ? { ...v, main_image_filename: filename, main_image_uploading: false }
          : v
      ))
    } catch {
      setVariants(prev => prev.map(v =>
        v.id === variantId
          ? { ...v, main_image_uploading: false }
          : v
      ))
    }
  }

  const removeMainImage = (variantId) =>
    setVariants(prev => prev.map(v =>
      v.id === variantId
        ? { ...v, main_image_preview: null, main_image_filename: '', main_image_uploading: false }
        : v
    ))

  /**
   * Called when user picks other images.
   * Each file is uploaded immediately; placeholders track upload state.
   */
  const handleOtherImages = async (variantId, e) => {
    const files = Array.from(e.target.files)
    if (!files.length) return

    // Read previews and create placeholder entries
    const newEntries = await Promise.all(files.map(async (f) => {
      const src = await readImage(f)
      return { id: uid(), src, name: f.name, file: f }
    }))

    // Add placeholders to variant
    setVariants(prev => prev.map(v => {
      if (v.id !== variantId) return v
      const slots = 8 - v.other_image_previews.length
      const toAdd = newEntries.slice(0, slots)
      return {
        ...v,
        other_image_previews: [...v.other_image_previews, ...toAdd.map(({ id, src, name }) => ({ id, src, name }))],
        other_image_filenames: [...v.other_image_filenames, ...toAdd.map(({ id }) => ({ id, filename: '', uploading: true }))],
      }
    }))

    // Upload each and fill in filename
    for (const entry of newEntries) {
      try {
        const { filename } = await mockUploadImage(entry.file)
        setVariants(prev => prev.map(v => {
          if (v.id !== variantId) return v
          return {
            ...v,
            other_image_filenames: v.other_image_filenames.map(f =>
              f.id === entry.id ? { ...f, filename, uploading: false } : f
            ),
          }
        }))
      } catch {
        setVariants(prev => prev.map(v => {
          if (v.id !== variantId) return v
          return {
            ...v,
            other_image_filenames: v.other_image_filenames.map(f =>
              f.id === entry.id ? { ...f, uploading: false } : f
            ),
          }
        }))
      }
    }
  }

  const removeOtherImage = (variantId, imgId) =>
    setVariants(prev => prev.map(v =>
      v.id === variantId
        ? {
            ...v,
            other_image_previews: v.other_image_previews.filter(i => i.id !== imgId),
            other_image_filenames: v.other_image_filenames.filter(i => i.id !== imgId),
          }
        : v
    ))

  const addVariant = () => setVariants(prev => [...prev, emptyVariant()])
  const removeVariant = (id) => setVariants(prev => prev.filter(v => v.id !== id))

  // ── Build payload ──────────────────────────────────────────────────────────
  // FIX: title is now included; reviewed_on is included in ratings
  const buildPayload = () => ({
    title,                                          // ✅ was missing in failing payload
    brand: { name: brandName, catalogue_id: catalogueId },
    category: { category_id: 2, category_name: categoryName },
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
    },
    inventory: {
      variants: variants.map(v => ({
        color: v.color,
        sizes: v.sizes
          .filter(s => s.quantity !== '')
          .map(s => ({ size: s.size, quantity: parseInt(s.quantity) || 0 })),
        main_image: v.main_image_filename,           // ✅ server filename from upload API
        other_images: v.other_image_filenames        // ✅ server filenames from upload API
          .filter(f => f.filename)
          .map(f => f.filename),
      })),
    },
    ratings: {
      average_rating: 0.0,
      review_count: 0,
      reviewed_user: '',
      reviewed_on: '',                               // ✅ was missing in failing payload
    },
  })

  // ── Publish ────────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      const payload = buildPayload()
      console.log('Publishing payload:', JSON.stringify(payload, null, 2))
      const res = await fetch('https://8184radc92.execute-api.ap-south-1.amazonaws.com/prod/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Server responded with ${res.status}`)
      setStatus('Published')
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSubmitError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDraft = () => {
    setStatus('Draft')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const discount =
    mrp && salePrice
      ? Math.round(((parseFloat(mrp) - parseFloat(salePrice)) / parseFloat(mrp)) * 100)
      : null

  // ── Checklist ──────────────────────────────────────────────────────────────
  const checks = [
    { label: 'Title filled', done: title.length > 2 },
    { label: 'Brand name set', done: brandName.length > 0 },
    { label: 'Category selected', done: categoryName.length > 0 },
    { label: 'MRP set', done: !!mrp },
    { label: 'Sale price set', done: !!salePrice },
    { label: 'At least one variant', done: variants.length > 0 && variants[0].color !== '' },
    { label: 'Main image uploaded', done: variants.some(v => v.main_image_filename !== '') },
  ]
  const completeness = Math.round((checks.filter(c => c.done).length / checks.length) * 100)

  // ── Preview ────────────────────────────────────────────────────────────────
  const firstVariant = variants[0]
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
            {discount > 0 && (
              <div className='absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full'>
                -{discount}%
              </div>
            )}
          </div>
          <div className='p-4'>
            {categoryName && <span className='text-xs text-rose-500 font-semibold uppercase tracking-wider'>{categoryName}</span>}
            <h4 className='font-bold text-gray-800 mt-1 text-base leading-tight'>{title || 'Product Title'}</h4>
            {brandName && <p className='text-xs text-gray-400 mt-0.5'>by {brandName}</p>}
            <div className='flex items-center gap-2 mt-3'>
              {salePrice && <span className='text-xl font-bold text-rose-600'>₹{parseFloat(salePrice).toLocaleString()}</span>}
              {mrp && salePrice && parseFloat(mrp) !== parseFloat(salePrice) && (
                <span className='text-sm text-gray-400 line-through'>₹{parseFloat(mrp).toLocaleString()}</span>
              )}
            </div>
            {firstVariant?.color && <p className='text-xs text-gray-400 mt-2'>Color: {firstVariant.color}</p>}
            {firstVariant?.sizes?.some(s => s.quantity !== '') && (
              <div className='flex gap-1 mt-3 flex-wrap'>
                {firstVariant.sizes.filter(s => s.quantity !== '').map(s => (
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
              {firstVariant.other_image_previews.map(t => (
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

  return (
    <div className='min-h-screen bg-stone-950 text-stone-100' style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href='https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap' rel='stylesheet' />

      {/* Top bar */}
      <div className='sticky top-0 z-50 bg-stone-950/95 backdrop-blur border-b border-stone-800'>
        <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <button className='p-2 rounded-lg hover:bg-stone-800 transition-colors text-stone-400 hover:text-stone-100'>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className='font-bold text-stone-100' style={{ fontFamily: "'Playfair Display', serif", fontSize: 18 }}>
                Add New Product
              </h1>
              <p className='text-xs text-stone-500'>Women's Ethnic Wear Store</p>
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
              <div className='flex items-center gap-1.5 text-emerald-400 text-sm font-medium animate-pulse'>
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
              onClick={handleDraft}
              className='px-4 py-2 rounded-xl text-sm font-semibold border border-stone-700 text-stone-300 hover:border-stone-500 hover:text-stone-100 transition-colors'
            >
              Save Draft
            </button>
            <button
              onClick={handlePublish}
              disabled={submitting}
              className='px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg shadow-rose-500/20 disabled:opacity-60'
            >
              {submitting ? 'Publishing…' : 'Publish'}
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
                  value={categoryName}
                  onChange={setCategoryName}
                  options={['Kurtas & Suits', 'Sarees', 'Lehengas', 'Dupattas', 'Accessories']}
                />
              </Section>

              <Section icon={Tag} title='Description Attributes' subtitle='Fabric, sleeve, neck, styling'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                  <Field label='Material'>
                    <Input value={material} onChange={setMaterial} placeholder='e.g. Cotton Silk' />
                  </Field>
                  <Select label='Sleeve Length' value={sleeveLength} onChange={setSleeveLength}
                    options={['Short Sleeves', 'Long Sleeves', '3/4 Sleeves', 'Sleeveless']} />
                  <Select label='Neck' value={neck} onChange={setNeck}
                    options={['Mandarin Collar', 'Round Neck', 'V-Neck', 'Boat Neck', 'Sweetheart']} />
                  <Select label='Design Styling' value={designStyling} onChange={setDesignStyling}
                    options={['Regular', 'A-Line', 'Straight', 'Flared', 'Asymmetric']} />
                </div>
              </Section>

              <Section icon={DollarSign} title='Pricing' subtitle='MRP, sale price, buy price & GST'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                  <Field label='MRP' required>
                    <Input value={mrp} onChange={setMrp} type='number' placeholder='0.00' prefix='₹' />
                  </Field>
                  <Field label='Sale Price' required>
                    <Input value={salePrice} onChange={setSalePrice} type='number' placeholder='0.00' prefix='₹' />
                  </Field>
                  <Field label='Buy Price' hint='Not shown to customers'>
                    <Input value={buyPrice} onChange={setBuyPrice} type='number' placeholder='0.00' prefix='₹' />
                  </Field>
                  <Field label='GST (%)'>
                    <Input value={gst} onChange={setGst} type='number' placeholder='e.g. 5.2' />
                  </Field>
                </div>

                {mrp && salePrice && buyPrice && (
                  <div className='flex items-center gap-4 p-4 bg-stone-900 rounded-xl border border-stone-800 text-sm flex-wrap'>
                    <div>
                      <p className='text-stone-500 text-xs'>Margin</p>
                      <p className='font-bold text-emerald-400'>
                        ₹{(parseFloat(salePrice) - parseFloat(buyPrice)).toLocaleString()}
                      </p>
                    </div>
                    <div className='w-px h-8 bg-stone-700' />
                    <div>
                      <p className='text-stone-500 text-xs'>Margin %</p>
                      <p className='font-bold text-emerald-400'>
                        {parseFloat(salePrice) > 0
                          ? Math.round(((parseFloat(salePrice) - parseFloat(buyPrice)) / parseFloat(salePrice)) * 100)
                          : 0}%
                      </p>
                    </div>
                    {discount > 0 && (
                      <>
                        <div className='w-px h-8 bg-stone-700' />
                        <div>
                          <p className='text-stone-500 text-xs'>Discount shown</p>
                          <p className='font-bold text-rose-400'>{discount}% off</p>
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

              <div className='flex gap-3 md:hidden pb-4'>
                <button onClick={handleDraft} className='flex-1 py-3 rounded-xl text-sm font-semibold border border-stone-700 text-stone-300'>
                  Save Draft
                </button>
                <button onClick={handlePublish} disabled={submitting} className='flex-1 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-rose-500 to-pink-600 text-white disabled:opacity-60'>
                  {submitting ? 'Publishing…' : 'Publish Now'}
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
                    <span className={`text-xs ${done ? 'text-stone-300 line-through decoration-stone-600' : 'text-stone-500'}`}>
                      {label}
                    </span>
                  </div>
                ))}
              </div>
              <div className='mt-4'>
                <div className='flex justify-between items-center mb-1.5'>
                  <span className='text-xs text-stone-600'>Listing completeness</span>
                  <span className='text-xs font-bold text-rose-400'>{completeness}%</span>
                </div>
                <div className='h-1.5 bg-stone-800 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500'
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>
            </div>

            <div className='bg-stone-950 border border-stone-800 rounded-2xl p-5'>
              <h4 className='text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3'>SEO Preview</h4>
              <div className='p-3 bg-white rounded-xl'>
                <p className='text-blue-700 text-sm font-medium truncate'>
                  {title || 'Product Title'} — YourStore.com
                </p>
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

  // Is any other image still uploading?
  const anyOtherUploading = variant.other_image_filenames.some(f => f.uploading)

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
        {/* Color */}
        <Select
          label='Color'
          required
          value={variant.color}
          onChange={onColorChange}
          options={['Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Gold', 'Black', 'White', 'Orange', 'Maroon']}
        />

        {/* Sizes */}
        <div>
          <label className='block text-xs font-semibold uppercase tracking-widest text-rose-400 mb-3'>
            Sizes & Quantities
          </label>
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
                  onChange={e => onSizeQtyChange(size, e.target.value)}
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

              {/* Upload spinner overlay */}
              {variant.main_image_uploading && (
                <div className='absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2'>
                  <Loader2 size={24} className='text-rose-400 animate-spin' />
                  <span className='text-xs text-stone-300'>Uploading…</span>
                </div>
              )}

              {/* Hover actions (only when not uploading) */}
              {!variant.main_image_uploading && (
                <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3'>
                  <button
                    onClick={() => mainRef.current.click()}
                    className='px-3 py-1.5 bg-white/20 backdrop-blur rounded-lg text-white text-xs font-medium hover:bg-white/30 transition'
                  >
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

              {/* Status badge */}
              <div className={`absolute bottom-2 right-2 text-white text-xs font-bold px-2 py-0.5 rounded-full ${
                variant.main_image_filename ? 'bg-emerald-500' : 'bg-amber-500'
              }`}>
                {variant.main_image_filename ? 'Uploaded ✓' : 'Uploading…'}
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
              const uploadState = variant.other_image_filenames.find(f => f.id === img.id)
              const isUploading = uploadState?.uploading
              return (
                <div key={img.id} className='relative group aspect-square rounded-xl overflow-hidden border border-stone-700 bg-stone-900'>
                  <img src={img.src} alt='' className='w-full h-full object-cover' />

                  {/* Spinner */}
                  {isUploading && (
                    <div className='absolute inset-0 bg-black/60 flex items-center justify-center'>
                      <Loader2 size={16} className='text-rose-400 animate-spin' />
                    </div>
                  )}

                  {/* Uploaded tick */}
                  {!isUploading && uploadState?.filename && (
                    <div className='absolute top-1 right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center'>
                      <Check size={9} className='text-white' />
                    </div>
                  )}

                  {/* Remove on hover */}
                  {!isUploading && (
                    <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                      <button
                        onClick={() => onRemoveOtherImage(img.id)}
                        className='p-1.5 bg-rose-500 rounded-full text-white hover:bg-rose-600 transition'
                      >
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

export default ProductUpload
