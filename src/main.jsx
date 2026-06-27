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
import LoginPage from './LoginPage.jsx'
import ProductEdit from './admin/ProductEdit.jsx'
import ContactUsPage from './info/ContactUs.jsx'
import TermsAndConditionsPage from './info/Terms.jsx'
import RefundPolicyPage from './info/RefundPolicy.jsx'
import PrivacyPolicy from './info/PrivacyPolicy.jsx'
import OrderSuccess from './info/OrderSuccess.jsx'
import PaymentFailed from './info/PaymentFailed.jsx'
import AdminOrders from './admin/orders/AdminOrders.jsx'
import OrdersPage from './OrdersPage.jsx'
import ReviewPage from './ReviewPage.jsx'
import WishlistPage from './WishlistPage.jsx'
import ProfilePage from './ProfilePage.jsx'
import { useAuthStore } from './store/authStore'

const queryClient = new QueryClient()  // ← add

// Silently restore access token from refresh cookie on page load, then keep it alive
const { customer, refreshToken, startAutoRefresh } = useAuthStore.getState()
if (customer) refreshToken()
startAutoRefresh()

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/product/:id', element: <ProductDetail /> },
  { path: '/products', element: <Products /> },
  { path: '/:slug', element: <Products /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/bag', element: <BagPage /> },
  { path: '/contact-us', element: <ContactUsPage /> },
  { path: '/terms', element: <TermsAndConditionsPage/> },
  {path: '/orders', element: <OrdersPage /> },
  { path: '/review', element: <ReviewPage /> },
  { path: '/wishlist', element: <WishlistPage /> },
  { path: '/profile', element: <ProfilePage /> },
  { path: '/refund-policy', element: <RefundPolicyPage/> },
  { path: '/privacy-policy', element: <PrivacyPolicy/> },
  { path: '/admin/products/new', element: <ProductUpload /> },
  { path: '/admin/', element: <ProductListings /> },
  { path: '/admin/products/edit/:id', element: <ProductEdit /> },
  { path: '/admin/orders', element: <AdminOrders/> },
  { path: '/order-success', element: <OrderSuccess /> },
  { path: '/payment-failed', element: <PaymentFailed /> },

])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>  {/* ← wrap */}
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
)
