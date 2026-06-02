import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
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
import { PRODUCT_CATEGORY_NAMES } from './utils/categories'

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
          border: '1px solid rgba(255,255,255,0.2)',
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

/** this url is from cdn */
const fetchProducts = async () => {
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

    // optional defaults (since KV doesn't have these)
    category: 'Ethnic',
    rating: 4.2,
    fabric: 'Cotton',
    color: 'Red',
    occasion: 'Casual',
    bgColor: 'bg-gradient-to-br from-pink-200 to-red-300',
    description: item.title,
  }))
}

// Mock API for Filters
const fetchFilters = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return {
    categories: PRODUCT_CATEGORY_NAMES,
    fabrics: [
      'Silk',
      'Cotton',
      'Georgette',
      'Velvet',
      'Net',
      'Banarasi Silk',
      'Chanderi',
      'Rayon',
    ],
    colors: ['Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Gold'],
    occasions: ['Wedding', 'Party', 'Casual', 'Festive'],
    priceRanges: [
      { label: 'Under ₹2000', min: 0, max: 2000 },
      { label: '₹2000 - ₹5000', min: 2000, max: 5000 },
      { label: '₹5000 - ₹10000', min: 5000, max: 10000 },
      { label: 'Above ₹10000', min: 10000, max: Infinity },
    ],
  }
}

// Filter Sidebar Component
const FilterSidebar = ({
  filters,
  selectedFilters,
  onFilterChange,
  onClearFilters,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    fabric: true,
    color: true,
    occasion: true,
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
          {items.map((item) => (
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
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className='bg-white rounded-lg shadow-md p-4 sticky top-20'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-bold text-gray-800 flex items-center'>
          <SlidersHorizontal size={20} className='mr-2' />
          Filters
        </h3>
        {Object.keys(selectedFilters).some(
          (key) => selectedFilters[key]?.length > 0,
        ) && (
          <button
            onClick={onClearFilters}
            className='text-sm text-pink-600 hover:text-pink-700 font-semibold'
          >
            Clear All
          </button>
        )}
      </div>

      <FilterSection
        title='Category'
        items={filters.categories}
        filterKey='category'
      />
      <FilterSection
        title='Fabric'
        items={filters.fabrics}
        filterKey='fabric'
      />
      <FilterSection title='Color' items={filters.colors} filterKey='color' />
      <FilterSection
        title='Occasion'
        items={filters.occasions}
        filterKey='occasion'
      />

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

// Selected Filters Bar
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

// Product Card
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
        <div className='h-full w-full overflow-hidden'>
          <img
            src={product.image}
            alt={product.name}
            className='h-full w-full object-cover'
          />
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
          }}
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

// Pagination Component — First, Back, Next only
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
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
}

// Skeleton Box
const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-pink-100 rounded ${className}`} />
)

// Product Card Skeleton
const ProductCardSkeleton = () => {
  return (
    <div className='bg-white rounded-2xl shadow-md overflow-hidden'>
      <Skeleton className='h-56 w-full' />

      <div className='p-4 space-y-3'>
        <Skeleton className='h-3 w-20' />
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-3 w-24' />

        <div className='flex justify-between items-center pt-2'>
          <Skeleton className='h-5 w-20' />
          <Skeleton className='h-8 w-24 rounded-lg' />
        </div>
      </div>
    </div>
  )
}

// Filters Skeleton
const FilterSkeleton = () => {
  return (
    <div className='bg-white rounded-lg shadow-md p-4 space-y-4'>
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
}

// Main Listing Page Component
const ListingPage = () => {
  const [selectedFilters, setSelectedFilters] = useState({
    category: [],
    fabric: [],
    color: [],
    occasion: [],
    priceRange: [],
  })
  const [sortBy, setSortBy] = useState('featured')
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const itemsPerPage = 9
  const navigate = useNavigate()

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  const { data: filters, isLoading: filtersLoading } = useQuery({
    queryKey: ['filters'],
    queryFn: fetchFilters,
  })

  const handleFilterChange = (filterKey, value, checked) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterKey]: checked
        ? [...(prev[filterKey] || []), value]
        : (prev[filterKey] || []).filter((v) => v !== value),
    }))
    setCurrentPage(1)
  }

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
      occasion: [],
      priceRange: [],
    })
    setCurrentPage(1)
  }

  const filteredProducts = useMemo(() => {
    if (!products) return []

    let filtered = [...products]

    if (selectedFilters.category.length > 0) {
      filtered = filtered.filter((p) =>
        selectedFilters.category.includes(p.category),
      )
    }
    if (selectedFilters.fabric.length > 0) {
      filtered = filtered.filter((p) =>
        selectedFilters.fabric.includes(p.fabric),
      )
    }
    if (selectedFilters.color.length > 0) {
      filtered = filtered.filter((p) => selectedFilters.color.includes(p.color))
    }
    if (selectedFilters.occasion.length > 0) {
      filtered = filtered.filter((p) =>
        selectedFilters.occasion.includes(p.occasion),
      )
    }
    if (selectedFilters.priceRange.length > 0 && filters) {
      filtered = filtered.filter((p) => {
        return selectedFilters.priceRange.some((rangeLabel) => {
          const range = filters.priceRanges.find((r) => r.label === rangeLabel)
          return p.price >= range.min && p.price <= range.max
        })
      })
    }

    // Sorting
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating)
    }

    return filtered
  }, [products, selectedFilters, sortBy, filters])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  if (productsLoading || filtersLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-b from-white to-pink-50'>
        <Navbar />

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Title Skeleton */}
          <div className='mb-6 space-y-2'>
            <Skeleton className='h-8 w-64' />
            <Skeleton className='h-4 w-40' />
          </div>

          <div className='flex gap-6'>
            {/* Left Filters Skeleton */}
            <div className='hidden lg:block w-64 flex-shrink-0'>
              <FilterSkeleton />
            </div>

            {/* Products Skeleton */}
            <div className='flex-1'>
              <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
                {Array.from({ length: 15 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-b from-white to-pink-50'>
      <Navbar />

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold text-gray-800 mb-2'>
            Women's Ethnic Wear
          </h1>
          <p className='text-gray-600'>
            {filteredProducts.length} products found
          </p>
        </div>

        <div className='flex gap-6'>
          {/* Left Sidebar - Filters */}
          <div className='hidden lg:block w-64 flex-shrink-0'>
            {filters && (
              <FilterSidebar
                filters={filters}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            )}
          </div>

          {/* Main Content */}
          <div className='flex-1'>
            {/* Selected Filters Bar */}
            <SelectedFiltersBar
              selectedFilters={selectedFilters}
              onRemoveFilter={handleRemoveFilter}
            />

            {/* Sorting and View Options */}
            <div className='flex items-center justify-between mb-6 bg-white rounded-lg p-4 shadow-sm'>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-gray-600'>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className='border border-pink-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-pink-400'
                >
                  <option value='featured'>Featured</option>
                  <option value='price-low'>Price: Low to High</option>
                  <option value='price-high'>Price: High to Low</option>
                  <option value='rating'>Highest Rated</option>
                </select>
              </div>

              <div className='text-sm text-gray-600'>
                Page {currentPage} of {totalPages}
              </div>
            </div>

            {/* Products Grid */}
            {paginatedProducts.length > 0 ? (
              <>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onViewDetails={(product) => {
                        setSelectedProduct(product)
                        window.open(`/product/${product.id}`, '_blank')
                      }}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            ) : (
              <div className='text-center py-16 bg-white rounded-lg'>
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

// Main App
const queryClient = new QueryClient()

const ProductsListing = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ListingPage />
    </QueryClientProvider>
  )
}

export default ProductsListing
