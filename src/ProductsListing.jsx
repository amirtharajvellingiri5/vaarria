import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useCartStore } from './store/cartStore'
import {
  ShoppingBag,
  Search,
  Heart,
  User,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Star,
  SlidersHorizontal,
  XCircle,
} from 'lucide-react'
import Navbar from './Navbar'
import Footer from './Footer'

import logo from './assets/logo.png'

import { COLOR_MAP, formatColorLabel } from './constants/colors'
import { PRODUCT_CATEGORY_NAMES, ADMIN_CATEGORIES } from './utils/categories'

// ── Swatch helper ─────────────────────────────────────────────────────────────
const ColorSwatch = ({ name, size = 14 }) => {
  const hex = COLOR_MAP[name?.trim().toLowerCase()]

  if (!hex) {
    return (
      <span
        style={{
          display: 'inline-block',
          width: size,
          height: size,
          borderRadius: '50%',
          background:
            'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
          border: '0.5px solid rgba(255,255,255,0.2)',
          flexShrink: 0,
        }}
      />
    )
  }

  const isLight = [
    '#ffffff',
    '#f5f0e8',
    '#f8bbd0',
    '#bbdefb',
    '#ffcba4',
    '#fdd835',
    '#a5d6a7',
    '#81d4fa',
    '#ce93d8',
  ].includes(hex)

  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: hex,
        border: isLight
          ? '1px solid rgba(0,0,0,0.2)'
          : '1px solid rgba(255,255,255,0.15)',
        flexShrink: 0,
      }}
    />
  )
}

const BASE_URL = 'https://cdn.aarria.com/app/images/'

const fetchSiblingCategories = async (categoryId) => {
  if (!categoryId) return []
  const res = await fetch(
    `https://8184radc92.execute-api.ap-south-1.amazonaws.com/prod/categories/${categoryId}/siblings`,
  )
  if (!res.ok) return []
  return res.json()
}

/** Fetches listings with optional filter params */
const fetchProductsByCategory = async (categoryId, activeFilters = {}, sortBy = 'price-low') => {
  if (!categoryId) {
    const response = await fetch(
      'https://products-api.chatoyantvortex.workers.dev/products?page=1',
    )
    const data = await response.json()
    return data.data.map((item) => ({
      id: item.id,
      name: item.title,
      price: item.price,
      image: item.main_image
        ? BASE_URL + item.main_image
        : item.images?.length
          ? BASE_URL + item.images[0]
          : '',
      stock: item.stock,
      category: 'Ethnic',
      rating: 4.2,
      fabric: 'Cotton',
      color: 'Red',
      occasion: 'Casual',
      bgColor: 'bg-gradient-to-br from-pink-200 to-red-300',
      description: item.title,
    }))
  }

  // Build query string from active filters
  const params = new URLSearchParams({ category_id: categoryId })

  if (activeFilters.fabric?.length)
  params.set('fabric', activeFilters.fabric[0])

if (activeFilters.color?.length)
  params.set('color', activeFilters.color[0])

if (activeFilters.size?.length)
  params.set('size', activeFilters.size[0])

if (activeFilters.neckType?.length)
  params.set('neck_type', activeFilters.neckType[0])

if (activeFilters.sleeveLength?.length)
  params.set('sleeve_length', activeFilters.sleeveLength[0])

if (activeFilters.priceRange?.length) {
  const range = filters?.priceRanges?.find(
    (r) => r.label === activeFilters.priceRange[0],
  )

  if (range) {
    params.set('min_price', range.min)

    if (Number.isFinite(range.max)) {
      params.set('max_price', range.max)
    }
  }
}
  // Map sort option to API param
  const sortMap = {
    'price-low': 'price_asc',
    'price-high': 'price_desc',
    rating: 'rating_desc',
    featured: 'featured',
  }
  if (sortBy && sortMap[sortBy]) params.set('sort', sortMap[sortBy])

  const res = await fetch(`https://api.aarria.com/listings?${params.toString()}`)
  if (!res.ok) return []

  const json = await res.json()
  const items = Array.isArray(json) ? json : json.data || []

  return items.map((item) => ({
    id: item.id,
    name: item.title || item.name,
    price: item.price || item.sale_price || 0,
    image: item.image || (item.images?.length ? BASE_URL + item.images[0] : ''),
    stock: item.stock ?? 0,
    category: item.category || 'Ethnic',
    rating: item.rating ?? 4.0,
    fabric: item.fabric || 'Cotton',
    color: item.color || 'Red',
    size: item.size,
neckType: item.neckType,
sleeveLength: item.sleeveLength,
    bgColor: item.bgColor || 'bg-gradient-to-br from-pink-200 to-red-300',
    description: item.description || item.title || item.name || '',
  }))
}

// ── Filter Sidebar ─────────────────────────────────────────────────────────────
const FilterSidebar = ({
  filters,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  siblingCategories,
}) => {
  const [expandedSections, setExpandedSections] = useState({
  category: true,
  fabric: true,
  color: true,
  size: true,
  neckType: true,
  sleeveLength: true,
  price: true,
})

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const FilterSection = ({ title, items, filterKey }) => (
    <div className='border-b border-pink-100 py-4'>
      <button
        onClick={() => toggleSection(filterKey)}
        className='flex items-center justify-between w-full text-left font-semibold text-gray-800 mb-3'
      >
        {title}
        {expandedSections[filterKey] ? (
          <ChevronUp size={18} />
        ) : (
          <ChevronDown size={18} />
        )}
      </button>
      {expandedSections[filterKey] && (
        <div className='space-y-2'>
          {filterKey === 'category' ? (
            items.map((cat) => (
              <Link
                key={cat.slug}
                to={`/${cat.slug}`}
                className='block text-sm text-gray-700 hover:text-pink-600 transition py-1'
              >
                {cat.name}
              </Link>
            ))
          ) : (
            items.map((item) => (
              <label
                key={item}
                className='flex items-center space-x-2 cursor-pointer hover:text-pink-600 transition'
              >
                <input
                  type='checkbox'
                  checked={selectedFilters[filterKey]?.includes(item) || false}
                  onChange={(e) =>
                    onFilterChange(filterKey, item, e.target.checked)
                  }
                  className='w-4 h-4 text-pink-600 rounded focus:ring-pink-500'
                />
                {filterKey === 'color' && <ColorSwatch name={item} />}
                <span className='text-sm text-gray-700'>{item}</span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  )

  const hasFilters = Object.keys(selectedFilters).some(
    (key) => selectedFilters[key]?.length > 0,
  )

  return (
    <div className='bg-white rounded-b-lg p-4 overflow-y-auto' style={{ minHeight: '100%' }}>
      {hasFilters && (
        <div className='mb-2 flex justify-end'>
          <button
            onClick={onClearFilters}
            className='text-sm text-pink-600 hover:text-pink-700 font-semibold'
          >
            Clear All
          </button>
        </div>
      )}

      <FilterSection
        title='Category'
        items={filters.categories}
        filterKey='category'
      />
      <FilterSection title='Fabric' items={filters.fabrics} filterKey='fabric' />
      <FilterSection title='Color' items={filters.colors} filterKey='color' />
      <FilterSection
  title='Size'
  items={filters.sizes}
  filterKey='size'
/>

<FilterSection
  title='Neck Type'
  items={filters.neckTypes}
  filterKey='neckType'
/>

<FilterSection
  title='Sleeve Length'
  items={filters.sleeveLengths}
  filterKey='sleeveLength'
/>

      {/* Price Range */}
      <div className='border-b border-pink-100 py-4'>
        <button
          onClick={() => toggleSection('price')}
          className='flex items-center justify-between w-full text-left font-semibold text-gray-800 mb-3'
        >
          Price Range
          {expandedSections.price ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>
        {expandedSections.price && (
          <div className='space-y-2'>
            {filters.priceRanges.map((range) => (
              <label
                key={range.label}
                className='flex items-center space-x-2 cursor-pointer hover:text-pink-600 transition'
              >
                <input
                  type='checkbox'
                  checked={
                    selectedFilters.priceRange?.includes(range.label) || false
                  }
                  onChange={(e) =>
                    onFilterChange('priceRange', range.label, e.target.checked)
                  }
                  className='w-4 h-4 text-pink-600 rounded focus:ring-pink-500'
                />
                <span className='text-sm text-gray-700'>{range.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Selected Filters Bar ───────────────────────────────────────────────────────
const SelectedFiltersBar = ({ selectedFilters, onRemoveFilter }) => {
  const allFilters = Object.entries(selectedFilters).flatMap(([key, values]) =>
    values.map((value) => ({ key, value })),
  )
  if (allFilters.length === 0) return null

  return (
    <div className='bg-pink-50 rounded-lg p-3 mb-4'>
      <div className='flex flex-wrap gap-2'>
        {allFilters.map(({ key, value }) => (
          <span
            key={`${key}-${value}`}
            className='inline-flex items-center bg-white px-3 py-1 rounded-full text-sm text-gray-700 border border-pink-200'
          >
            {value}
            <button
              onClick={() => onRemoveFilter(key, value)}
              className='ml-2 text-pink-600 hover:text-pink-700'
            >
              <XCircle size={16} />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Product Card ───────────────────────────────────────────────────────────────
const ProductCard = ({ product, onViewDetails }) => {
  const addToCart = useCartStore((state) => state.addToCart)
  const [added, setAdded] = useState(false)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div
      onClick={() => onViewDetails(product)}
      className='bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition cursor-pointer group'
    >
      <div className='relative aspect-[3/4] overflow-hidden bg-gray-100'>
        <img
          src={product.image}
          alt={product.name}
          className='h-full w-full object-cover'
        />
        <button
          onClick={(e) => e.stopPropagation()}
          className='absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-pink-50 transition'
        >
          <Heart
            size={18}
            className='text-pink-500 transition-all duration-200 group-hover:fill-pink-500'
          />
        </button>
      </div>
      <div className='p-3'>
        <p className='text-sm text-gray-600 line-clamp-2'>{product.name}</p>
        <div className='mt-1 flex items-center gap-2'>
          <span className='font-bold text-gray-900'>₹{product.price}</span>
          <span className='text-xs text-gray-400 line-through'>
            ₹{Math.round(product.price * 1.4)}
          </span>
          <span className='text-xs text-orange-500 font-medium'>(30% OFF)</span>
        </div>
      </div>
    </div>
  )
}

// ── Pagination ─────────────────────────────────────────────────────────────────
const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className='flex items-center justify-center gap-2 mt-8'>
    <button
      onClick={() => onPageChange(1)}
      disabled={currentPage === 1}
      className='px-4 py-2 rounded-lg border border-pink-200 text-gray-700 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition'
    >
      First
    </button>
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className='px-4 py-2 rounded-lg border border-pink-200 text-gray-700 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition'
    >
      Back
    </button>
    <span className='px-4 py-2 text-sm text-gray-600'>
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className='px-4 py-2 rounded-lg border border-pink-200 text-gray-700 hover:bg-pink-50 disabled:opacity-50 disabled:cursor-not-allowed transition'
    >
      Next
    </button>
  </div>
)

// ── Skeletons ──────────────────────────────────────────────────────────────────
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-pink-100 rounded ${className}`} />
)

const ProductCardSkeleton = () => (
  <div className='bg-white rounded-2xl shadow-md overflow-hidden'>
    <Skeleton className='aspect-[3/4] w-full rounded-none' />
    <div className='p-3'>
      <Skeleton className='h-4 w-full mb-1' />
      <Skeleton className='h-4 w-2/3 mb-2' />
      <div className='mt-1 flex items-center gap-2'>
        <Skeleton className='h-4 w-16' />
        <Skeleton className='h-3 w-12' />
        <Skeleton className='h-3 w-16' />
      </div>
    </div>
  </div>
)

const FilterSkeleton = () => (
  <div className='bg-white rounded-b-lg p-4 space-y-4'>
    <Skeleton className='h-6 w-24' />
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className='space-y-2'>
        <Skeleton className='h-4 w-32' />
        {[1, 2, 3].map((j) => (
          <Skeleton key={j} className='h-3 w-24' />
        ))}
      </div>
    ))}
  </div>
)

// ── Sort Dropdown ──────────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'featured', label: 'Recommended' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Customer Rating' },
]

const SortDropdown = ({ sortBy, setSortBy }) => {
  const [sortOpen, setSortOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setSortOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Sort'

  return (
    <div ref={dropdownRef} className='relative w-[210px]'>
      <button
        onClick={() => setSortOpen(!sortOpen)}
        className='w-full bg-white border border-gray-300 rounded px-4 h-11 flex items-center justify-between hover:border-pink-400 transition'
      >
        <div className='flex items-center gap-1 text-sm'>
          <span className='text-gray-500'>Sort by:</span>
          <span className='font-semibold text-gray-900'>
            {sortBy === 'price-low' && 'Low to High'}
            {sortBy === 'price-high' && 'High to Low'}
            {sortBy === 'rating' && 'Rating'}
            {sortBy === 'featured' && 'Recommended'}
          </span>
        </div>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 transition-transform ${sortOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {sortOpen && (
        <div className='absolute right-0 mt-1 w-full bg-white border border-gray-200 rounded shadow-lg z-50 overflow-hidden'>
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSortBy(option.value)
                setSortOpen(false)
              }}
              className={`w-full text-left px-3 py-2 text-sm transition ${
                sortBy === option.value
                  ? 'bg-pink-50 text-pink-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Listing Page ──────────────────────────────────────────────────────────
const ListingPage = () => {
  const [selectedFilters, setSelectedFilters] = useState({
  category: [],
  fabric: [],
  color: [],
  size: [],
  neckType: [],
  sleeveLength: [],
  priceRange: [],
})
  const [sortBy, setSortBy] = useState('price-low')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9
  const navigate = useNavigate()

  const { slug } = useParams()
  const category = ADMIN_CATEGORIES.find((c) => c.slug === slug)
  const categoryId = category ? category.category_id : null

  const { data: siblingCategories = [] } = useQuery({
    queryKey: ['siblings', categoryId],
    queryFn: () => fetchSiblingCategories(categoryId),
    enabled: !!categoryId,
  })

  // Products query — refetches whenever filters or sort change
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products', categoryId, selectedFilters, sortBy],
    queryFn: () => fetchProductsByCategory(categoryId, selectedFilters, sortBy),
  })

  const { data: filters, isLoading: filtersLoading } = useQuery({
    queryKey: ['filters', siblingCategories],
    queryFn: async () => ({
  categories: siblingCategories.map((c) => ({
    name: c.category_name,
    slug: c.slug,
  })),

  fabrics: [
    'Cotton',
    'Rayon',
    'Silk',
    'Georgette',
    'Chanderi',
    'Velvet',
  ],

  colors: [
    'Red',
    'Blue',
    'Green',
    'Yellow',
    'Pink',
    'Purple',
    'Black',
    'White',
  ],

  sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],

  neckTypes: [
    'Round Neck',
    'V-Neck',
    'Boat Neck',
    'Mandarin Collar',
  ],

  sleeveLengths: [
    'Sleeveless',
    'Short Sleeves',
    '3/4 Sleeves',
    'Long Sleeves',
  ],

  priceRanges: [
        { label: 'Under ₹2000', min: 0, max: 2000 },
        { label: '₹2000 - ₹5000', min: 2000, max: 5000 },
        { label: '₹5000 - ₹10000', min: 5000, max: 10000 },
        { label: 'Above ₹10000', min: 10000, max: Infinity },
      ],
    }),
  })

  const formatTitleFromSlug = (s) =>
    s
      ? s.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
      : 'Products'

  const handleFilterChange = useCallback((filterKey, value, checked) => {
    if (filterKey === 'category' && checked) {
      const cat = siblingCategories.find((c) => c.category_name === value)
      if (cat) { navigate(`/${cat.slug}`); return }
    }
    setSelectedFilters((prev) => ({
      ...prev,
      [filterKey]: checked
        ? [...(prev[filterKey] || []), value]
        : (prev[filterKey] || []).filter((v) => v !== value),
    }))
    setCurrentPage(1)
  }, [siblingCategories, navigate])

  const handleRemoveFilter = (filterKey, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterKey]: (prev[filterKey] || []).filter((v) => v !== value),
    }))
    setCurrentPage(1)
  }

  const handleClearFilters = () => {
    setSelectedFilters({
  category: [],
  fabric: [],
  color: [],
  size: [],
  neckType: [],
  sleeveLength: [],
  priceRange: [],
})
    setCurrentPage(1)
  }

  // Client-side fallback sort (if API doesn't sort)
  const sortedProducts = useMemo(() => {
    if (!products) return []
    const list = [...products]
    if (sortBy === 'price-low') list.sort((a, b) => a.price - b.price)
    else if (sortBy === 'price-high') list.sort((a, b) => b.price - a.price)
    else if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating)
    return list
  }, [products, sortBy])

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / itemsPerPage))
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const isLoading = productsLoading || filtersLoading

  return (
    <div className='min-h-screen bg-gradient-to-b from-white to-pink-50'>
      <Navbar />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>

        {/* Page title */}
        <h1 className='font-bold text-gray-800 mb-4' style={{ fontSize: '1.2375rem' }}>
          {category ? category.name : slug ? formatTitleFromSlug(slug) : 'Products'}
        </h1>

        {/* ── Top control bar: "Filters" label + Sort dropdown ── */}
        <div
          className='flex items-center justify-between px-4 py-3 bg-white rounded-t-lg mb-0'
          style={{
            
            borderBottom: '1px solid #f3e8ee',
          }}
        >
          {/* Left: Filters label (aligns with sidebar width) */}
          <div className='hidden lg:flex items-center gap-2 w-64 flex-shrink-0'>
            <SlidersHorizontal size={18} className='text-gray-600' />
            <span className='font-semibold text-gray-800 text-sm'>Filters</span>
          </div>

          {/* Right: Sort dropdown */}
          <div className='ml-auto'>
            <SortDropdown
              sortBy={sortBy}
              setSortBy={(val) => { setSortBy(val); setCurrentPage(1) }}
            />
          </div>
        </div>

        {/* ── Main content row (sidebar + products) ── */}
        <div
          className='flex gap-0 bg-white rounded-b-lg'        
        >
          {/* Left Sidebar */}
          <div className='hidden lg:block w-64 flex-shrink-0 border-r border-pink-100'>
            {isLoading ? (
              <FilterSkeleton />
            ) : filters ? (
              <FilterSidebar
                filters={filters}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                siblingCategories={siblingCategories}
              />
            ) : null}
          </div>

          {/* Products area */}
          <div className='flex-1 p-6'>
            <SelectedFiltersBar
              selectedFilters={selectedFilters}
              onRemoveFilter={handleRemoveFilter}
            />

            {isLoading ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                {Array.from({ length: 9 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={(p) => window.open(`/product/${p.id}`, '_blank')}
                    />
                  ))}
                </div>

                {/* Pagination — min-height matches filter sidebar */}
                <div className='mt-6 border-t border-pink-100 bg-white px-4 py-4'>

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              </>
            ) : (
              <div
                className='text-center py-16 flex flex-col items-center justify-center'
                style={{ minHeight: '400px' }}
              >
                <p className='text-gray-600 text-lg'>
                  No products found matching your filters.
                </p>
                <button
                  onClick={handleClearFilters}
                  className='mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-rose-600 transition'
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

// ── App wrapper ────────────────────────────────────────────────────────────────
const queryClient = new QueryClient()

const ProductsListing = () => (
  <QueryClientProvider client={queryClient}>
    <ListingPage />
  </QueryClientProvider>
)

export default ProductsListing
