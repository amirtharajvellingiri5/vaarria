import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCartStore } from './store/cartStore'


import {
  ShoppingBag,
  Search,
  Heart,
  User,
  ChevronLeft,
  ChevronRight,
  Star,
  Menu,
  X,
} from 'lucide-react'
import Navbar from './Navbar'
import logo from './assets/logo.png'

import Footer from './Footer'
import { HOME_CATEGORIES } from './utils/categories'

// Mock API
const fetchProducts = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return [
    {
      id: 1,
      name: 'Silk Saree',
      price: 4999,
      category: 'Sarees',
      rating: 4.8,
      image: '👗',
      color: 'bg-gradient-to-br from-pink-200 to-rose-300',
    },
    {
      id: 2,
      name: 'Banarasi Saree',
      price: 8999,
      category: 'Sarees',
      rating: 4.9,
      image: '👗',
      color: 'bg-gradient-to-br from-amber-200 to-orange-300',
    },
    {
      id: 3,
      name: 'Anarkali Suit',
      price: 3499,
      category: 'Suits',
      rating: 4.7,
      image: '👗',
      color: 'bg-gradient-to-br from-purple-200 to-pink-300',
    },
    {
      id: 4,
      name: 'Lehenga Choli',
      price: 12999,
      category: 'Lehengas',
      rating: 4.9,
      image: '👗',
      color: 'bg-gradient-to-br from-red-200 to-pink-300',
    },
    {
      id: 5,
      name: 'Palazzo Set',
      price: 2499,
      category: 'Suits',
      rating: 4.6,
      image: '👗',
      color: 'bg-gradient-to-br from-blue-200 to-cyan-300',
    },
    {
      id: 6,
      name: 'Kurti Set',
      price: 1799,
      category: 'Kurtis',
      rating: 4.5,
      image: '👗',
      color: 'bg-gradient-to-br from-green-200 to-emerald-300',
    },
    {
      id: 7,
      name: 'Designer Saree',
      price: 6999,
      category: 'Sarees',
      rating: 4.8,
      image: '👗',
      color: 'bg-gradient-to-br from-indigo-200 to-purple-300',
    },
    {
      id: 8,
      name: 'Cotton Kurti',
      price: 999,
      category: 'Kurtis',
      rating: 4.4,
      image: '👗',
      color: 'bg-gradient-to-br from-yellow-200 to-amber-300',
    },
  ]
}

// Hero Slider Component
const HeroSlider = () => {
  const [current, setCurrent] = useState(0)

  const slides = [
    {
      title: 'Festive Collection 2024',
      subtitle: 'Embrace tradition with our exquisite range',
      bg: 'bg-gradient-to-r from-rose-400 via-pink-400 to-fuchsia-400',
      cta: 'Shop Sarees',
    },
    {
      title: 'Bridal Lehengas',
      subtitle: 'Make your special day unforgettable',
      bg: 'bg-gradient-to-r from-red-400 via-pink-400 to-rose-400',
      cta: 'Explore Collection',
    },
    {
      title: 'Summer Essentials',
      subtitle: 'Comfortable & stylish everyday wear',
      bg: 'bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400',
      cta: 'Shop Kurtis',
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length)
  const prevSlide = () =>
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length)

  return (
    <div className='relative h-96 md:h-[500px] overflow-hidden'>
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === current ? 'opacity-100' : 'opacity-0'
          } ${slide.bg}`}
        >
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center'>
            <div className='text-white'>
              <h2 className='text-4xl md:text-6xl font-bold mb-4 animate-fadeIn'>
                {slide.title}
              </h2>
              <p className='text-xl md:text-2xl mb-8'>{slide.subtitle}</p>
              <button className='bg-white text-pink-600 px-8 py-3 rounded-full font-semibold hover:bg-pink-50 transition transform hover:scale-105'>
                {slide.cta}
              </button>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={prevSlide}
        className='absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition'
      >
        <ChevronLeft size={24} className='text-pink-600' />
      </button>
      <button
        onClick={nextSlide}
        className='absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition'
      >
        <ChevronRight size={24} className='text-pink-600' />
      </button>

      <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2'>
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-2 h-2 rounded-full transition ${
              index === current ? 'bg-white w-8' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}

// Categories
const Categories = () => {
  const categories = HOME_CATEGORIES

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <h3 className='text-3xl font-bold mb-8 text-center text-gray-800'>
        Shop by Category
      </h3>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6'>
        {categories.map((cat) => (
          <div
            key={cat.name}
            className={`${cat.bg} p-6 rounded-2xl text-center cursor-pointer hover:scale-105 transition transform shadow-md hover:shadow-xl`}
          >
            <div className='text-5xl mb-3'>{cat.icon}</div>
            <h4 className='font-bold text-lg text-gray-800'>{cat.name}</h4>
            <p className='text-sm text-gray-600 mt-1'>{cat.count} styles</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Product Card
const ProductCard = ({ product }) => {
  const addToCart = useCartStore((state) => state.addToCart)
  const [added, setAdded] = useState(false)

  const handleAddToCart = () => {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className='bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition group'>
      <div
        className={`${product.color} h-64 flex items-center justify-center text-7xl relative overflow-hidden`}
      >
        <div className='text-8xl transform group-hover:scale-110 transition'>
          {product.image}
        </div>
        <button className='absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:bg-pink-50 transition'>
          <Heart size={18} className='text-pink-500' />
        </button>
      </div>
      <div className='p-4'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-xs text-pink-600 uppercase font-semibold'>
            {product.category}
          </span>
          <div className='flex items-center bg-green-50 px-2 py-1 rounded'>
            <Star size={12} className='text-green-600 fill-current' />
            <span className='text-xs ml-1 font-semibold text-green-600'>
              {product.rating}
            </span>
          </div>
        </div>
        <h4 className='font-semibold text-lg mb-3 text-gray-800'>
          {product.name}
        </h4>
        <div className='flex items-center justify-between'>
          <span className='text-2xl font-bold text-pink-600'>
            ₹{product.price.toLocaleString()}
          </span>
          <button
            onClick={handleAddToCart}
            className={`px-4 py-2 rounded-lg font-semibold transition transform hover:scale-105 ${
              added
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
            }`}
          >
            {added ? '✓ Added' : 'Add to Bag'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Products
const Products = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  if (isLoading) {
    return (
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <div className='text-center'>
          <div className='inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-600'></div>
          <p className='mt-4 text-gray-600'>Loading beautiful collections...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <div className='text-center mb-8'>
        <h3 className='text-3xl font-bold text-gray-800 mb-2'>Trending Now</h3>
        <p className='text-gray-600'>Handpicked styles for you</p>
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

// Promo Banner
const PromoBanner = () => {
  return (
    <div className='bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 py-16'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white'>
        <h3 className='text-3xl md:text-4xl font-bold mb-4'>
          Festive Season Sale
        </h3>
        <p className='text-xl mb-6'>Get up to 50% off on selected items</p>
        <button className='bg-white text-orange-600 px-8 py-3 rounded-full font-bold hover:bg-orange-50 transition transform hover:scale-105'>
          Shop Sale
        </button>
      </div>
    </div>
  )
}

// Main App
const queryClient = new QueryClient()

const Home = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className='min-h-screen bg-gradient-to-b from-white to-pink-50'>
        <Navbar />
        <HeroSlider />
        <Categories />
        <Products />
        <PromoBanner />
        <Footer />
      </div>
    </QueryClientProvider>
  )
}

export default Home
