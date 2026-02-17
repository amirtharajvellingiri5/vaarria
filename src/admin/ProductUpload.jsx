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
  Star,
  Trash2,
  GripVertical,
  Eye,
  ArrowLeft,
} from 'lucide-react'

// ── helpers ──────────────────────────────────────────────────────────────────
const uid = () => Math.random().toString(36).slice(2)

// ── tiny Select ──────────────────────────────────────────────────────────────
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
        <div className='absolute z-30 mt-1 w-full bg-stone-900 border border-stone-700 rounded-xl shadow-2xl overflow-hidden'>
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

// ── Field wrapper ─────────────────────────────────────────────────────────────
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

// ── Input ─────────────────────────────────────────────────────────────────────
const Input = ({ placeholder, value, onChange, type = 'text', prefix, className = '' }) => (
  <div className='relative flex items-center'>
    {prefix && (
      <span className='absolute left-4 text-stone-400 text-sm font-medium pointer-events-none'>{prefix}</span>
    )}
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-3 bg-stone-900 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-colors ${prefix ? 'pl-8' : ''} ${className}`}
    />
  </div>
)

// ── Textarea ──────────────────────────────────────────────────────────────────
const Textarea = ({ placeholder, value, onChange, rows = 4 }) => (
  <textarea
    rows={rows}
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className='w-full px-4 py-3 bg-stone-900 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-colors resize-none'
  />
)

// ── Section card ──────────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, subtitle, children }) => (
  <div className='bg-stone-950 border border-stone-800 rounded-2xl overflow-hidden'>
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

// ── Main Component ────────────────────────────────────────────────────────────
const ProductUpload = () => {
  // images
  const [mainImage, setMainImage] = useState(null)
  const [thumbnails, setThumbnails] = useState([])
  const mainRef = useRef()
  const thumbRef = useRef()

  // basic info
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [description, setDescription] = useState('')
  const [shortDesc, setShortDesc] = useState('')

  // pricing
  const [price, setPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [taxable, setTaxable] = useState(true)

  // category
  const [category, setCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [occasion, setOccasion] = useState('')
  const [fabric, setFabric] = useState('')
  const [color, setColor] = useState('')

  // variants
  const [sizes, setSizes] = useState([])
  const [customTag, setCustomTag] = useState('')
  const [tags, setTags] = useState([])

  // inventory
  const [stock, setStock] = useState('')
  const [lowStockAlert, setLowStockAlert] = useState('5')

  // status
  const [status, setStatus] = useState('Draft')
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState('edit') // edit | preview

  // ── image helpers ────────────────────────────────────────────────────────
  const readImage = (file) =>
    new Promise((res) => {
      const r = new FileReader()
      r.onload = (e) => res(e.target.result)
      r.readAsDataURL(file)
    })

  const handleMainImage = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const src = await readImage(file)
    setMainImage({ id: uid(), src, name: file.name, size: file.size })
  }

  const handleThumbs = async (e) => {
    const files = Array.from(e.target.files)
    const imgs = await Promise.all(
      files.map(async (f) => ({ id: uid(), src: await readImage(f), name: f.name, size: f.size }))
    )
    setThumbnails((prev) => [...prev, ...imgs].slice(0, 8))
  }

  const removeThumb = (id) => setThumbnails((p) => p.filter((t) => t.id !== id))

  // ── size toggle ───────────────────────────────────────────────────────────
  const allSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']
  const toggleSize = (s) =>
    setSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))

  // ── tags ──────────────────────────────────────────────────────────────────
  const addTag = () => {
    const t = customTag.trim()
    if (t && !tags.includes(t)) setTags((p) => [...p, t])
    setCustomTag('')
  }

  // ── save ──────────────────────────────────────────────────────────────────
  const handleSave = (publishStatus) => {
    setStatus(publishStatus)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const discount =
    price && comparePrice
      ? Math.round(((parseFloat(comparePrice) - parseFloat(price)) / parseFloat(comparePrice)) * 100)
      : null

  // ── Preview Panel ─────────────────────────────────────────────────────────
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
          {/* Product image area */}
          <div className='aspect-[3/4] bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center relative'>
            {mainImage ? (
              <img src={mainImage.src} alt='preview' className='w-full h-full object-cover' />
            ) : (
              <div className='text-center text-stone-400'>
                <Image size={48} className='mx-auto mb-2 opacity-30' />
                <p className='text-xs'>No image</p>
              </div>
            )}
            {discount && (
              <div className='absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full'>
                -{discount}%
              </div>
            )}
          </div>
          {/* Info */}
          <div className='p-4'>
            {category && (
              <span className='text-xs text-rose-500 font-semibold uppercase tracking-wider'>{category}</span>
            )}
            <h4 className='font-bold text-gray-800 mt-1 text-base leading-tight'>
              {name || 'Product Name'}
            </h4>
            {shortDesc && <p className='text-xs text-gray-500 mt-1 line-clamp-2'>{shortDesc}</p>}
            <div className='flex items-center gap-2 mt-3'>
              {price && (
                <span className='text-xl font-bold text-rose-600'>
                  ₹{parseFloat(price).toLocaleString()}
                </span>
              )}
              {comparePrice && (
                <span className='text-sm text-gray-400 line-through'>
                  ₹{parseFloat(comparePrice).toLocaleString()}
                </span>
              )}
            </div>
            {sizes.length > 0 && (
              <div className='flex gap-1 mt-3 flex-wrap'>
                {sizes.map((s) => (
                  <span key={s} className='text-xs border border-pink-200 text-pink-600 px-2 py-0.5 rounded-full'>
                    {s}
                  </span>
                ))}
              </div>
            )}
            {fabric && color && (
              <p className='text-xs text-gray-400 mt-2'>{fabric} · {color}</p>
            )}
            <button className='w-full mt-4 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg text-sm font-semibold'>
              Add to Bag
            </button>
          </div>
        </div>

        {/* Thumbnails preview */}
        {thumbnails.length > 0 && (
          <div className='mt-4'>
            <p className='text-xs text-stone-500 mb-2 uppercase tracking-widest'>Gallery</p>
            <div className='flex gap-2 flex-wrap'>
              {thumbnails.map((t) => (
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

          {/* Tab toggle */}
          <div className='hidden md:flex items-center bg-stone-900 rounded-xl p-1 border border-stone-800'>
            {['edit', 'preview'].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  activeTab === t
                    ? 'bg-rose-500 text-white shadow'
                    : 'text-stone-400 hover:text-stone-200'
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
            <div className='flex items-center gap-2'>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                status === 'Published'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : status === 'Draft'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-stone-700 text-stone-400 border border-stone-600'
              }`}>
                {status}
              </span>
            </div>
            <button
              onClick={() => handleSave('Draft')}
              className='px-4 py-2 rounded-xl text-sm font-semibold border border-stone-700 text-stone-300 hover:border-stone-500 hover:text-stone-100 transition-colors'
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSave('Published')}
              className='px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg shadow-rose-500/20'
            >
              Publish
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className='max-w-7xl mx-auto px-6 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>

          {/* ── LEFT COLUMN (edit form) ── */}
          {(activeTab === 'edit') && (
            <div className='lg:col-span-2 space-y-6'>

              {/* IMAGES */}
              <Section icon={Image} title='Product Images' subtitle='Main photo + gallery thumbnails'>
                {/* Main photo */}
                <div>
                  <label className='block text-xs font-semibold uppercase tracking-widest text-rose-400 mb-2'>
                    Main Photo <span className='text-rose-500'>*</span>
                  </label>
                  {mainImage ? (
                    <div className='relative group rounded-2xl overflow-hidden border-2 border-rose-500/40 aspect-[4/3] bg-stone-900'>
                      <img src={mainImage.src} alt='main' className='w-full h-full object-contain' />
                      <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3'>
                        <button
                          onClick={() => mainRef.current.click()}
                          className='px-4 py-2 bg-white/20 backdrop-blur rounded-lg text-white text-sm font-medium hover:bg-white/30 transition'
                        >
                          Change
                        </button>
                        <button
                          onClick={() => setMainImage(null)}
                          className='px-4 py-2 bg-rose-500/80 backdrop-blur rounded-lg text-white text-sm font-medium hover:bg-rose-500 transition'
                        >
                          Remove
                        </button>
                      </div>
                      <div className='absolute bottom-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full'>
                        Main
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => mainRef.current.click()}
                      className='w-full border-2 border-dashed border-stone-700 hover:border-rose-500 rounded-2xl aspect-[4/3] flex flex-col items-center justify-center gap-3 transition-colors group bg-stone-900/50 hover:bg-rose-500/5'
                    >
                      <div className='w-16 h-16 rounded-2xl bg-stone-800 group-hover:bg-rose-500/10 flex items-center justify-center transition-colors'>
                        <Upload size={28} className='text-stone-500 group-hover:text-rose-400 transition-colors' />
                      </div>
                      <div className='text-center'>
                        <p className='text-sm font-semibold text-stone-300 group-hover:text-rose-400 transition-colors'>
                          Upload Main Photo
                        </p>
                        <p className='text-xs text-stone-600 mt-0.5'>PNG, JPG up to 10MB · Min 800×800px</p>
                      </div>
                    </button>
                  )}
                  <input ref={mainRef} type='file' accept='image/*' className='hidden' onChange={handleMainImage} />
                </div>

                {/* Thumbnails */}
                <div>
                  <label className='block text-xs font-semibold uppercase tracking-widest text-rose-400 mb-2'>
                    Gallery Images <span className='text-stone-600 font-normal normal-case tracking-normal ml-1'>({thumbnails.length}/8)</span>
                  </label>
                  <div className='grid grid-cols-4 gap-3'>
                    {thumbnails.map((t) => (
                      <div key={t.id} className='relative group aspect-square rounded-xl overflow-hidden border border-stone-700 bg-stone-900'>
                        <img src={t.src} alt='' className='w-full h-full object-cover' />
                        <div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                          <button
                            onClick={() => removeThumb(t.id)}
                            className='p-1.5 bg-rose-500 rounded-full text-white hover:bg-rose-600 transition'
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <div className='absolute top-1.5 left-1.5 cursor-grab'>
                          <GripVertical size={14} className='text-white/60' />
                        </div>
                      </div>
                    ))}
                    {thumbnails.length < 8 && (
                      <button
                        onClick={() => thumbRef.current.click()}
                        className='aspect-square rounded-xl border-2 border-dashed border-stone-700 hover:border-rose-500 flex flex-col items-center justify-center gap-1 transition-colors group hover:bg-rose-500/5'
                      >
                        <Plus size={20} className='text-stone-600 group-hover:text-rose-400 transition-colors' />
                        <span className='text-xs text-stone-600 group-hover:text-rose-400 transition-colors'>Add</span>
                      </button>
                    )}
                  </div>
                  <input ref={thumbRef} type='file' accept='image/*' multiple className='hidden' onChange={handleThumbs} />
                  <p className='text-xs text-stone-600 mt-2'>Drag to reorder · Recommended ratio 3:4</p>
                </div>
              </Section>

              {/* BASIC INFO */}
              <Section icon={Package} title='Basic Information' subtitle='Product name, SKU, and descriptions'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                  <div className='sm:col-span-2'>
                    <Field label='Product Name' required>
                      <Input
                        value={name}
                        onChange={setName}
                        placeholder='e.g. Silk Saree with Golden Border'
                      />
                    </Field>
                  </div>
                  <Field label='SKU / Product Code' hint='Auto-generated if left blank'>
                    <Input value={sku} onChange={setSku} placeholder='e.g. SAR-GLD-001' />
                  </Field>
                  <Field label='Stock Quantity' required>
                    <Input value={stock} onChange={setStock} type='number' placeholder='0' />
                  </Field>
                  <div className='sm:col-span-2'>
                    <Field label='Short Description' hint='Shown on product cards (~150 chars)'>
                      <Textarea
                        rows={2}
                        value={shortDesc}
                        onChange={setShortDesc}
                        placeholder='One-line elevator pitch for the product…'
                      />
                    </Field>
                  </div>
                  <div className='sm:col-span-2'>
                    <Field label='Full Description'>
                      <Textarea
                        rows={5}
                        value={description}
                        onChange={setDescription}
                        placeholder='Tell customers everything about fabric, finish, styling tips…'
                      />
                    </Field>
                  </div>
                </div>
              </Section>

              {/* PRICING */}
              <Section icon={DollarSign} title='Pricing' subtitle='Set price, compare-at price, and cost'>
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-5'>
                  <Field label='Selling Price' required>
                    <Input value={price} onChange={setPrice} type='number' placeholder='0.00' prefix='₹' />
                  </Field>
                  <Field label='Compare-at Price' hint='Shown as strikethrough'>
                    <Input value={comparePrice} onChange={setComparePrice} type='number' placeholder='0.00' prefix='₹' />
                  </Field>
                  <Field label='Cost Price' hint='Not shown to customers'>
                    <Input value={costPrice} onChange={setCostPrice} type='number' placeholder='0.00' prefix='₹' />
                  </Field>
                </div>

                {/* margin display */}
                {price && costPrice && (
                  <div className='flex items-center gap-4 p-4 bg-stone-900 rounded-xl border border-stone-800 text-sm'>
                    <div>
                      <p className='text-stone-500 text-xs'>Margin</p>
                      <p className='font-bold text-emerald-400'>
                        ₹{(parseFloat(price) - parseFloat(costPrice)).toLocaleString()}
                      </p>
                    </div>
                    <div className='w-px h-8 bg-stone-700' />
                    <div>
                      <p className='text-stone-500 text-xs'>Margin %</p>
                      <p className='font-bold text-emerald-400'>
                        {Math.round(((parseFloat(price) - parseFloat(costPrice)) / parseFloat(price)) * 100)}%
                      </p>
                    </div>
                    {discount && (
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

                {/* taxable toggle */}
                <div className='flex items-center gap-3'>
                  <button
                    type='button'
                    onClick={() => setTaxable(!taxable)}
                    className={`w-10 h-6 rounded-full transition-colors ${taxable ? 'bg-rose-500' : 'bg-stone-700'} relative`}
                  >
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${taxable ? 'left-4.5 translate-x-0' : 'left-0.5'}`}
                      style={{ left: taxable ? '18px' : '2px' }} />
                  </button>
                  <span className='text-sm text-stone-300'>Charge GST on this product</span>
                </div>
              </Section>

              {/* CATEGORY & ATTRIBUTES */}
              <Section icon={Layers} title='Category & Attributes' subtitle='Help customers find your product'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                  <Select
                    label='Category'
                    required
                    value={category}
                    onChange={setCategory}
                    options={['Sarees', 'Lehengas', 'Suits', 'Kurtis', 'Dupattas', 'Accessories']}
                  />
                  <Select
                    label='Sub-category'
                    value={subCategory}
                    onChange={setSubCategory}
                    options={['Bridal', 'Party Wear', 'Casual', 'Festive', 'Designer']}
                  />
                  <Select
                    label='Fabric'
                    required
                    value={fabric}
                    onChange={setFabric}
                    options={['Silk', 'Cotton', 'Georgette', 'Velvet', 'Net', 'Banarasi Silk', 'Chanderi', 'Rayon', 'Chiffon']}
                  />
                  <Select
                    label='Primary Color'
                    required
                    value={color}
                    onChange={setColor}
                    options={['Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Gold', 'Black', 'White', 'Orange', 'Maroon']}
                  />
                  <Select
                    label='Occasion'
                    value={occasion}
                    onChange={setOccasion}
                    options={['Wedding', 'Party', 'Casual', 'Festive', 'Office', 'Beach']}
                  />
                  <Select
                    label='Visibility'
                    value={status}
                    onChange={setStatus}
                    options={['Draft', 'Published', 'Archived']}
                  />
                </div>
              </Section>

              {/* SIZES */}
              <Section icon={Tag} title='Sizes Available' subtitle='Select all sizes in stock'>
                <div className='flex flex-wrap gap-2'>
                  {allSizes.map((s) => (
                    <button
                      key={s}
                      type='button'
                      onClick={() => toggleSize(s)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        sizes.includes(s)
                          ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20'
                          : 'border-stone-700 text-stone-400 hover:border-rose-500 hover:text-rose-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {sizes.length > 0 && (
                  <div className='flex items-center gap-2 p-3 bg-rose-500/5 border border-rose-500/20 rounded-xl'>
                    <Check size={14} className='text-rose-400' />
                    <p className='text-xs text-rose-300'>
                      Available in: <span className='font-semibold'>{sizes.join(', ')}</span>
                    </p>
                  </div>
                )}
                <p className='text-xs text-stone-500'>
                  Low stock alert when quantity falls below{' '}
                  <input
                    type='number'
                    value={lowStockAlert}
                    onChange={e => setLowStockAlert(e.target.value)}
                    className='inline-block w-12 text-center bg-stone-800 border border-stone-700 rounded px-1 py-0.5 text-xs text-stone-200 focus:outline-none focus:border-rose-500'
                  />{' '}
                  units
                </p>
              </Section>

              {/* TAGS */}
              <Section icon={Tag} title='Tags' subtitle='Keywords to help with search & discoverability'>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={customTag}
                    onChange={e => setCustomTag(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder='Type a tag and press Enter…'
                    className='flex-1 px-4 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-sm text-stone-100 placeholder-stone-600 focus:outline-none focus:border-rose-500 transition-colors'
                  />
                  <button
                    type='button'
                    onClick={addTag}
                    className='px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold transition-colors'
                  >
                    Add
                  </button>
                </div>

                {/* Suggested tags */}
                <div>
                  <p className='text-xs text-stone-600 mb-2'>Suggestions</p>
                  <div className='flex flex-wrap gap-1.5'>
                    {['ethnic wear', 'traditional', 'festive', 'handloom', 'zari work', 'embroidered', 'bestseller', 'new arrival']
                      .filter(t => !tags.includes(t))
                      .map(t => (
                        <button
                          key={t}
                          type='button'
                          onClick={() => setTags(p => [...p, t])}
                          className='px-3 py-1 border border-stone-700 text-stone-500 rounded-full text-xs hover:border-rose-500 hover:text-rose-400 transition-colors'
                        >
                          + {t}
                        </button>
                      ))}
                  </div>
                </div>

                {tags.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {tags.map(t => (
                      <span key={t} className='inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-full text-xs font-medium'>
                        {t}
                        <button onClick={() => setTags(p => p.filter(x => x !== t))} className='hover:text-white transition-colors'>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </Section>

              {/* Bottom action bar (mobile) */}
              <div className='flex gap-3 md:hidden pb-4'>
                <button
                  onClick={() => handleSave('Draft')}
                  className='flex-1 py-3 rounded-xl text-sm font-semibold border border-stone-700 text-stone-300 hover:border-stone-500'
                >
                  Save Draft
                </button>
                <button
                  onClick={() => handleSave('Published')}
                  className='flex-1 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/20'
                >
                  Publish Now
                </button>
              </div>
            </div>
          )}

          {/* ── RIGHT COLUMN (preview, always visible on desktop) ── */}
          <div className={`space-y-6 ${activeTab === 'preview' ? 'lg:col-span-2' : ''}`}>
            <Preview />

            {/* Quick stats panel */}
            <div className='bg-stone-950 border border-stone-800 rounded-2xl p-5'>
              <h4 className='text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4'>Checklist</h4>
              <div className='space-y-3'>
                {[
                  { label: 'Main photo uploaded', done: !!mainImage },
                  { label: 'Product name filled', done: name.length > 3 },
                  { label: 'Price set', done: !!price },
                  { label: 'Category selected', done: !!category },
                  { label: 'Sizes selected', done: sizes.length > 0 },
                  { label: 'Gallery images added', done: thumbnails.length > 0 },
                  { label: 'Description added', done: description.length > 10 },
                ].map(({ label, done }) => (
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

              {/* completeness bar */}
              <div className='mt-4'>
                <div className='flex justify-between items-center mb-1.5'>
                  <span className='text-xs text-stone-600'>Listing completeness</span>
                  <span className='text-xs font-bold text-rose-400'>
                    {Math.round(
                      ([!!mainImage, name.length > 3, !!price, !!category, sizes.length > 0, thumbnails.length > 0, description.length > 10]
                        .filter(Boolean).length / 7) * 100
                    )}%
                  </span>
                </div>
                <div className='h-1.5 bg-stone-800 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-500'
                    style={{
                      width: `${Math.round(
                        ([!!mainImage, name.length > 3, !!price, !!category, sizes.length > 0, thumbnails.length > 0, description.length > 10]
                          .filter(Boolean).length / 7) * 100
                      )}%`
                    }}
                  />
                </div>
              </div>
            </div>

            {/* SEO snippet preview */}
            <div className='bg-stone-950 border border-stone-800 rounded-2xl p-5'>
              <h4 className='text-xs font-semibold uppercase tracking-widest text-stone-500 mb-3'>SEO Preview</h4>
              <div className='p-3 bg-white rounded-xl'>
                <p className='text-blue-700 text-sm font-medium truncate'>
                  {name || 'Product Name'} — YourStore.com
                </p>
                <p className='text-green-700 text-xs mt-0.5 truncate'>yourstore.com/products/{name ? name.toLowerCase().replace(/\s+/g, '-') : 'product-name'}</p>
                <p className='text-gray-500 text-xs mt-1 line-clamp-2'>
                  {shortDesc || description || 'Add a description to improve search visibility…'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductUpload