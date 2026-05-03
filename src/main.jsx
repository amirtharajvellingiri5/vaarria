// main.jsx or index.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'  // ← add

import './index.css'
import Home from './Home.jsx'
import Products from './ProductsListing.jsx'
import ProductUpload from './admin/ProductUpload.jsx'
import ProductDetail from './ProductDetail.jsx'
import ProductListings from './admin/ProductAdminListings.jsx'
import { BagPage } from './Bag.jsx'
import ProductEdit from './admin/ProductEdit.jsx'

const queryClient = new QueryClient()  // ← add

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/product/:id', element: <ProductDetail /> },
  { path: '/products', element: <Products /> },
  { path: '/bag', element: <BagPage /> },
  { path: '/admin/products/new', element: <ProductUpload /> },
  { path: '/admin/products', element: <ProductListings /> },
  { path: '/admin/products/edit/:id', element: <ProductEdit /> },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>  {/* ← wrap */}
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
)