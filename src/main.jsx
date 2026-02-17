// main.jsx or index.jsx

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './index.css'
import Home from './Home.jsx'
import Products from './ProductsListing.jsx'
import ProductUpload from './admin/ProductUpload.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/products',
    element: <Products />,
  },
  {
    path: '/admin/products/new',
    element: <ProductUpload />,
  },
  // {
  //   path: '/products/:id',
  //   element: <Product />,
  // },
  // {
  //   path: '/cart',
  //   element: <Cart />,
  // },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)
