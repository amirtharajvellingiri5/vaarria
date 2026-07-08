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
import { useAuthStore } from './store/authStore'
import { useWishlistStore } from './store/wishlistStore'
import WishlistLoginModal from './modals/WishlistLoginModal'

import logo from './assets/logo.jpg'

import { COLOR_MAP, formatColorLabel } from './constants/colors'
import { PRODUCT_CATEGORY_NAMES, ADMIN_CATEGORIES } from './utils/categories'
import { CATALOG_URL, INVENTORY_URL } from './config'

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

const BASE_URL = 'https://cdn.vaarria.com/app/images/'

const fetchSiblingCategories = async (categoryId) => {
  if (!categoryId) return []
  const res = await fetch(
    `${INVENTORY_URL}/categories/${categoryId}/siblings`,
  )
  if (!res.ok) return []
  return res.json()
}

/** Fetches listings with optional filter params */
const fetchProductsByCategory = async (
  categoryId,
  activeFilters = {},
  sortBy = 'price-low',
) => {
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
  // Fabric
  activeFilters.fabric?.forEach((fabric) => {
    params.append('fabric', fabric)
  })

  // Color
  activeFilters.color?.forEach((color) => {
    params.append('color', color)
  })

  // Size
  activeFilters.size?.forEach((size) => {
    params.append('size', size)
  })

  // Neck Type
  activeFilters.neckType?.forEach((neckType) => {
    params.append('neck_type', neckType)
  })

  // Sleeve Length
  activeFilters.sleeveLength?.forEach((sleeveLength) => {
    params.append('sleeve_length', sleeveLength)
  })
  // Price Range
  if (activeFilters.priceRange?.length) {
    const PRICE_RANGES = [
      { label: 'Under ₹2000', min: 0, max: 2000 },
      { label: '₹2000 - ₹5000', min: 2000, max: 5000 },
      { label: '₹5000 - ₹10000', min: 5000, max: 10000 },
      { label: 'Above ₹10000', min: 10000, max: Infinity },
    ]

    const ranges = activeFilters.priceRange
      .map((label) => PRICE_RANGES.find((r) => r.label === label))
      .filter(Boolean)

    if (ranges.length) {
      params.set('min_price', Math.min(...ranges.map((r) => r.min)))

      const maxValues = ranges
        .filter((r) => Number.isFinite(r.max))
        .map((r) => r.max)

      if (maxValues.length) {
        params.set('max_price', Math.max(...maxValues))
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

  const res = await fetch(
    `${CATALOG_URL}/listings?${params.toString()}`,
  )
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

// ── Filter Section (standalone — must be outside FilterSidebar to avoid remount) ─
const FilterSection = ({
  title, items, filterKey,
  expanded, onToggle,
  selectedFilters, onFilterChange,
  currentSlug,
}) => (
  <div className='border-b border-[#C9A84C]/20 py-2'>
    <button
      onClick={() => onToggle(filterKey)}
      className='flex items-center justify-between w-full text-left mb-2'
      style={{ color: '#050C1C', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600, fontSize: '14px', letterSpacing: '0.04em' }}
    >
      {title}
      {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
    </button>
    {expanded && (
      <div className={filterKey === 'color' ? '' : 'space-y-1'}>
        {filterKey === 'category'
          ? items.map((cat) => (
              <Link
                key={cat.slug}
                to={`/${cat.slug}`}
                style={{
                  color: cat.slug === currentSlug ? '#050C1C' : '#555',
                  borderLeft: `3px solid ${cat.slug === currentSlug ? '#C9A84C' : 'transparent'}`,
                  textDecoration: 'none',
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: '14px',
                  fontWeight: cat.slug === currentSlug ? 700 : 400,
                  background: cat.slug === currentSlug ? '#FDF6E3' : 'transparent',
                  display: 'block',
                  padding: '5px 8px 5px 12px',
                  borderRadius: '0 4px 4px 0',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  if (cat.slug !== currentSlug) {
                    e.currentTarget.style.color = '#C9A84C'
                    e.currentTarget.style.borderLeftColor = '#C9A84C'
                    e.currentTarget.style.background = '#fdf9f0'
                  }
                }}
                onMouseLeave={e => {
                  if (cat.slug !== currentSlug) {
                    e.currentTarget.style.color = '#555'
                    e.currentTarget.style.borderLeftColor = 'transparent'
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                {cat.name}
              </Link>
            ))
          : filterKey === 'color'
          ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {items.map((item) => {
                  const hex = COLOR_MAP[item?.trim().toLowerCase()]
                  const isSelected = selectedFilters[filterKey]?.includes(item) || false
                  return (
                    <button
                      key={item}
                      title={item}
                      onClick={() => onFilterChange(filterKey, item, !isSelected)}
                      style={{
                        width: '28px', height: '28px',
                        background: hex || 'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
                        border: 'none', cursor: 'pointer',
                        position: 'relative', transition: 'transform 0.15s',
                        transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                        zIndex: isSelected ? 2 : 1,
                        boxShadow: isSelected ? '0 0 0 2px #fff, 0 0 0 3.5px #C9A84C' : '0 0 0 1px rgba(0,0,0,0.12)',
                        borderRadius: '50%',
                      }}
                    >
                      {isSelected && (
                        <span style={{
                          position: 'absolute', inset: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '13px', fontWeight: 700,
                          textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                        }}>✓</span>
                      )}
                    </button>
                  )
                })}
              </div>
            )
          : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {items.map((item) => {
                  const isSelected = selectedFilters[filterKey]?.includes(item) || false
                  return (
                    <button
                      key={item}
                      onClick={() => onFilterChange(filterKey, item, !isSelected)}
                      style={{
                        minWidth: '42px', height: '32px', padding: '0 10px',
                        borderRadius: '5px',
                        background: isSelected ? '#050C1C' : '#fff',
                        border: isSelected ? '2px solid #C9A84C' : '1.5px solid #ddd',
                        color: isSelected ? '#C9A84C' : '#555',
                        fontSize: '12px', fontWeight: isSelected ? 700 : 500,
                        letterSpacing: '0.03em', cursor: 'pointer',
                        transition: 'all 0.15s',
                        boxShadow: isSelected ? '0 0 0 1px #C9A84C' : 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item}
                    </button>
                  )
                })}
              </div>
            )
        }
      </div>
    )}
  </div>
)

// ── Filter Sidebar ─────────────────────────────────────────────────────────────

const FilterSidebar = ({
  filters,
  selectedFilters,
  onFilterChange,
  onClearFilters,
  siblingCategories,
  currentSlug,
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

  return (
    <div className='bg-white p-4 overflow-y-auto' style={{ minHeight: '100%' }}>
      <FilterSection
        title='Category' items={filters.categories} filterKey='category'
        expanded={expandedSections.category} onToggle={toggleSection}
        selectedFilters={selectedFilters} onFilterChange={onFilterChange}
        currentSlug={currentSlug}
      />
      <FilterSection
        title='Color' items={filters.colors} filterKey='color'
        expanded={expandedSections.color} onToggle={toggleSection}
        selectedFilters={selectedFilters} onFilterChange={onFilterChange}
        currentSlug={currentSlug}
      />
      <FilterSection
        title='Size' items={filters.sizes} filterKey='size'
        expanded={expandedSections.size} onToggle={toggleSection}
        selectedFilters={selectedFilters} onFilterChange={onFilterChange}
        currentSlug={currentSlug}
      />

      {/* Price */}
      <div className='border-b border-[#C9A84C]/20 py-2'>
        <button
          onClick={() => toggleSection('price')}
          className='flex items-center justify-between w-full text-left mb-2'
          style={{ color: '#050C1C', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600, fontSize: '14px', letterSpacing: '0.04em' }}
        >
          Price
          {expandedSections.price ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
        {expandedSections.price && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {filters.priceRanges.map((range) => {
              const isSelected = selectedFilters.priceRange?.includes(range.label) || false
              return (
                <button
                  key={range.label}
                  onClick={() => onFilterChange('priceRange', range.label, !isSelected)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '5px',
                    background: isSelected ? '#050C1C' : '#fff',
                    border: isSelected ? '2px solid #C9A84C' : '1.5px solid #ddd',
                    color: isSelected ? '#C9A84C' : '#555',
                    fontSize: '11px',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: isSelected ? '0 0 0 1px #C9A84C' : 'none',
                    transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {range.label}
                </button>
              )
            })}
          </div>
        )}
      </div>

      <FilterSection
        title='Fabric' items={filters.fabrics} filterKey='fabric'
        expanded={expandedSections.fabric} onToggle={toggleSection}
        selectedFilters={selectedFilters} onFilterChange={onFilterChange}
        currentSlug={currentSlug}
      />
      <FilterSection
        title='Neck Type' items={filters.neckTypes} filterKey='neckType'
        expanded={expandedSections.neckType} onToggle={toggleSection}
        selectedFilters={selectedFilters} onFilterChange={onFilterChange}
        currentSlug={currentSlug}
      />
      <FilterSection
        title='Sleeve Length' items={filters.sleeveLengths} filterKey='sleeveLength'
        expanded={expandedSections.sleeveLength} onToggle={toggleSection}
        selectedFilters={selectedFilters} onFilterChange={onFilterChange}
        currentSlug={currentSlug}
      />
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
    <div className='flex items-center overflow-x-auto mb-4 pb-3' style={{ borderBottom: '1px solid #e8e0d0' }}>
      <div className='flex flex-wrap gap-2'>
        {allFilters.map(({ key, value }) => (
          <span
            key={`${key}-${value}`}
            style={{
              display: 'inline-flex', alignItems: 'center',
              background: '#050C1C', border: '1.5px solid #C9A84C',
              borderRadius: '20px', padding: '3px 10px 3px 12px',
              fontSize: '12px', fontWeight: 600, color: '#C9A84C',
              gap: '6px', whiteSpace: 'nowrap',
            }}
          >
            {value}
            <button
              onClick={() => onRemoveFilter(key, value)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C9A84C', display: 'flex', alignItems: 'center', padding: 0 }}
            >
              <XCircle size={14} />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

// ── Product Card ───────────────────────────────────────────────────────────────
const ProductCard = ({ product, onViewDetails, onWishlistLoginNeeded }) => {
  const addToCart = useCartStore((state) => state.addToCart)
  const [added, setAdded] = useState(false)
  const { customer } = useAuthStore()
  const { toggle: toggleWishlist, isWishlisted } = useWishlistStore()
  const wishlisted = isWishlisted(product.id)
  const soldOut = (product.stock ?? 0) <= 0

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div
      onClick={() => onViewDetails(product)}
      className='cursor-pointer group'
      style={{
        background: '#fff',
        borderRadius: '6px',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(58,51,42,0.08)',
        transition: 'transform 0.2s, box-shadow 0.2s, border-color 0.2s',
        border: '0.5px solid transparent',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-4px)'
        e.currentTarget.style.boxShadow = '0 10px 32px rgba(201,168,76,0.18)'
        e.currentTarget.style.borderColor = '#C9A84C'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(58,51,42,0.08)'
        e.currentTarget.style.borderColor = 'transparent'
      }}
    >
      <div className='relative aspect-[3/4] overflow-hidden' style={{ background: '#F1E0C8' }}>
        <img
          src={product.image}
          alt={product.name}
          className='h-full w-full object-cover object-top'
          style={{ transition: 'transform 0.3s', filter: soldOut ? 'grayscale(0.7)' : 'none', opacity: soldOut ? 0.7 : 1 }}
          onMouseEnter={e => { if (!soldOut) e.currentTarget.style.transform = 'scale(1.04)' }}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        {soldOut && (
          <div
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <span
              style={{
                background: 'rgba(10,10,10,0.82)', color: '#fff',
                fontSize: '12px', fontWeight: 800, letterSpacing: '0.12em',
                padding: '6px 14px', borderRadius: '4px', textTransform: 'uppercase',
              }}
            >
              Sold Out
            </span>
          </div>
        )}
        {/* Wishlist */}
        <button
          onClick={e => {
            e.stopPropagation()
            if (!customer) { onWishlistLoginNeeded?.(product.id); return }
            toggleWishlist(customer.customer_id, product.id)
          }}
          style={{
            position: 'absolute', top: '10px', right: '10px',
            background: '#fff', border: 'none', borderRadius: '50%',
            width: '34px', height: '34px', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)', cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#fdf6e3'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >
          <Heart size={17} color='#C9A84C' fill={wishlisted ? '#C9A84C' : 'none'} style={{ transition: 'fill 0.2s' }} />
        </button>
      </div>
      <div style={{ padding: '12px 14px 16px' }}>
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', lineHeight: 1.35, marginBottom: '5px', letterSpacing: '0.01em', fontFamily: "'Playfair Display', Georgia, serif" }} className='line-clamp-2'>
          {product.name}
        </p>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap', marginBottom: '2px' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#0a0a0a', fontFamily: "'Playfair Display', Georgia, serif", letterSpacing: '-0.01em' }}>
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          <span style={{ fontSize: '11px', color: '#C9A84C', fontWeight: 700, letterSpacing: '0.04em' }}>30% OFF</span>
        </div>
        <span style={{ fontSize: '11px', color: '#c0b8b0', textDecoration: 'line-through' }}>
          ₹{Math.round(product.price * 1.4).toLocaleString('en-IN')}
        </span>
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
      className='px-4 py-2 rounded-lg text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition'
      style={{ border: '1.5px solid #C9A84C' }}
    >
      First
    </button>
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className='px-4 py-2 rounded-lg text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition'
      style={{ border: '1.5px solid #C9A84C' }}
    >
      Back
    </button>
    <span className='px-4 py-2 text-sm text-gray-600'>
      Page {currentPage} of {totalPages}
    </span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className='px-4 py-2 rounded-lg text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition'
      style={{ border: '1.5px solid #C9A84C' }}
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

  const currentLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Sort'

  return (
    <div ref={dropdownRef} className='relative w-[155px]'>
      <button
        onClick={() => setSortOpen(!sortOpen)}
        className='w-full bg-white rounded px-3 h-8 flex items-center justify-between transition'
        style={{ border: '1px solid #e8d9b8' }}
      >
        <div className='flex items-center gap-1 text-xs whitespace-nowrap' style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '13px' }}>
          <span className='text-gray-500'>Sort:</span>
          <span className='font-semibold text-gray-900'>
            {sortBy === 'price-low' && 'Low to High'}
            {sortBy === 'price-high' && 'High to Low'}
            {sortBy === 'featured' && 'Recommended'}
          </span>
        </div>
        <ChevronDown
          size={13}
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
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '13px' }}
              className={`w-full text-left px-3 py-1 text-xs transition ${
                sortBy === option.value
                  ? 'font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
              style={sortBy === option.value ? { background: '#fdf6e3', color: '#C9A84C' } : {}}
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
  const itemsPerPage = 12
  const navigate = useNavigate()
  const [wishlistModal, setWishlistModal] = useState({ open: false, pendingProductId: null })
  const { customer } = useAuthStore()
  const { toggle: toggleWishlist } = useWishlistStore()

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

      fabrics: ['Cotton', 'Rayon', 'Silk', 'Georgette', 'Chanderi', 'Velvet'],

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

      neckTypes: ['Round Neck', 'V-Neck', 'Boat Neck', 'Mandarin Collar'],

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
      ? s
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      : 'Products'

  const handleFilterChange = useCallback(
    (filterKey, value, checked) => {
      if (filterKey === 'category' && checked) {
        const cat = siblingCategories.find((c) => c.category_name === value)
        if (cat) {
          navigate(`/${cat.slug}`)
          return
        }
      }
      setSelectedFilters((prev) => ({
        ...prev,
        [filterKey]: checked
          ? [...(prev[filterKey] || []), value]
          : (prev[filterKey] || []).filter((v) => v !== value),
      }))
      setCurrentPage(1)
    },
    [siblingCategories, navigate],
  )

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

    setSortBy('price-low')
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

  const totalPages = Math.max(
    1,
    Math.ceil(sortedProducts.length / itemsPerPage),
  )
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const isLoading = productsLoading || filtersLoading

  return (
    <div className='min-h-screen' style={{ background: '#F9F6F0' }}>
      <Navbar />

      <div className='max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Breadcrumb + Page title */}
        <div style={{ marginLeft: '1.2%', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: '#aaa', marginBottom: '6px', fontFamily: "'Playfair Display', Georgia, serif" }}>
            <a href='/' style={{ color: '#C9A84C', textDecoration: 'none' }}>Home</a>
            <span style={{ margin: '0 6px' }}>›</span>
            <span style={{ color: '#666' }}>
              {category ? category.name : slug ? formatTitleFromSlug(slug) : 'Products'}
            </span>
          </p>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#1a1a1a', display: 'inline-block', paddingBottom: '6px', borderBottom: '2px solid #C9A84C', fontFamily: "'Playfair Display', Georgia, serif" }}>
            {category ? category.name : slug ? formatTitleFromSlug(slug) : 'Products'}
          </h1>
        </div>

        {/* ── Shared top bar: Filters label + Sort dropdown ── */}
        <div className='flex items-center bg-white h-12' style={{ borderBottom: '1px solid #e8e0d0' }}>
          {/* Filters label — matches sidebar width */}
          <div className='hidden lg:flex items-center gap-3 w-64 flex-shrink-0 px-4'>
            <span style={{ color: '#050C1C', fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 600, fontSize: '14px', letterSpacing: '0.04em' }}>
              Filters
            </span>
            {Object.values(selectedFilters).some((v) => v?.length > 0) && (
              <button
                onClick={handleClearFilters}
                style={{ background: 'none', border: '1.5px solid #C9A84C', borderRadius: '20px', padding: '3px 12px', fontSize: '12px', fontWeight: 600, color: '#C9A84C', cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Clear All
              </button>
            )}
          </div>

          {/* Floating vertical divider — doesn't touch top or bottom */}
          <div className='hidden lg:block flex-shrink-0' style={{ width: '1px', height: '20px', background: '#e8e0d0', alignSelf: 'center' }} />

          {/* Sort dropdown — right-aligned in products zone */}
          <div className='flex-1 flex items-center justify-end px-6'>
            <SortDropdown
              sortBy={sortBy}
              setSortBy={(val) => {
                setSortBy(val)
                setCurrentPage(1)
              }}
            />
          </div>
        </div>

        {/* ── Main content row (sidebar + products) ── */}
        <div className='flex gap-0 bg-white rounded-b-lg'>
          {/* Left Sidebar */}
          <div className='hidden lg:block w-64 flex-shrink-0' style={{ position: 'sticky', top: 0, alignSelf: 'flex-start', maxHeight: '100vh', overflowY: 'auto' }}>
            {isLoading ? (
              <FilterSkeleton />
            ) : filters ? (
              <FilterSidebar
                filters={filters}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                siblingCategories={siblingCategories}
                currentSlug={slug}
              />
            ) : null}
          </div>

          {/* Products area */}
          <div className='flex-1'>
            <div className='px-6 pt-4 pb-6'>
            <SelectedFiltersBar
              selectedFilters={selectedFilters}
              onRemoveFilter={handleRemoveFilter}
            />

            {isLoading ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'>
                {Array.from({ length: 12 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'>
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={(p) =>
                        window.open(`/product/${p.id}`, '_blank')
                      }
                      onWishlistLoginNeeded={(pid) => setWishlistModal({ open: true, pendingProductId: pid })}
                    />
                  ))}
                </div>

                {/* Pagination — min-height matches filter sidebar */}
                <div className='mt-6 border-t border-transparent bg-white px-4 py-4'>
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
                <ShoppingBag size={56} style={{ color: '#e8e0d0', marginBottom: '16px' }} />
                <p style={{ fontSize: '17px', fontWeight: 600, color: '#555', marginBottom: '6px' }}>
                  No products found
                </p>
                <p style={{ fontSize: '13px', color: '#999', marginBottom: '20px' }}>
                  Try adjusting or clearing your filters
                </p>
                <button
                  onClick={handleClearFilters}
                  style={{ padding: '10px 28px', background: '#050C1C', border: '1.5px solid #C9A84C', borderRadius: '8px', color: '#C9A84C', fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.04em' }}
                >
                  Clear Filters
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {wishlistModal.open && (
        <WishlistLoginModal
          onClose={() => setWishlistModal({ open: false, pendingProductId: null })}
          onLoggedIn={(c) => {
            setWishlistModal({ open: false, pendingProductId: null })
            if (wishlistModal.pendingProductId) toggleWishlist(c.customer_id, wishlistModal.pendingProductId)
          }}
        />
      )}
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
