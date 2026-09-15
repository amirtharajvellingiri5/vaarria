// main.jsx or index.jsx

import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'  // ← add

import './index.css'
import Home from './Home.jsx'
import { useAuthStore } from './store/authStore'
import AdminGate from './admin/AdminGate.jsx'
import { seedE2eAuth } from './utils/e2e'

// ponytail: Home stays eager — it's the landing route, so lazying it would only
// buy a second round-trip before first paint. Everything else ships as its own
// chunk; a customer never downloads the admin bundle.
const Products = lazy(() => import('./ProductsListing.jsx'))
const ProductDetail = lazy(() => import('./ProductDetail.jsx'))
const BagPage = lazy(() => import('./Bag.jsx'))
const LoginPage = lazy(() => import('./LoginPage.jsx'))
const OrdersPage = lazy(() => import('./OrdersPage.jsx'))
const ReviewPage = lazy(() => import('./ReviewPage.jsx'))
const WishlistPage = lazy(() => import('./WishlistPage.jsx'))
const ProfilePage = lazy(() => import('./ProfilePage.jsx'))
const ContactUsPage = lazy(() => import('./info/ContactUs.jsx'))
const TermsAndConditionsPage = lazy(() => import('./info/Terms.jsx'))
const RefundPolicyPage = lazy(() => import('./info/RefundPolicy.jsx'))
const PrivacyPolicy = lazy(() => import('./info/PrivacyPolicy.jsx'))
const OrderSuccess = lazy(() => import('./info/OrderSuccess.jsx'))
const PaymentFailed = lazy(() => import('./info/PaymentFailed.jsx'))
const ProductUpload = lazy(() => import('./admin/ProductUpload.jsx'))
const ProductListings = lazy(() => import('./admin/ProductAdminListings.jsx'))
const ProductEdit = lazy(() => import('./admin/ProductEdit.jsx'))
const AdminOrders = lazy(() => import('./admin/orders/AdminOrders.jsx'))
const NoStockProducts = lazy(() => import('./admin/NoStockProducts.jsx'))
const OrphanReport = lazy(() => import('./admin/OrphanReport.jsx'))
const CategorySync = lazy(() => import('./admin/CategorySync.jsx'))
const TestReports = lazy(() => import('./admin/TestReports.jsx'))
const TestCases = lazy(() => import('./admin/TestCases.jsx'))

// ponytail: same markup + classes as the pre-JS shell in index.html, so a route
// chunk downloading looks identical to a cold boot instead of flashing blank
const pageSkeleton = (
  <div id='app-skeleton' aria-hidden='true'>
    <div className='sk-nav' />
    <div className='sk-hero'>
      <div className='sk-line sk-line-lg' />
      <div className='sk-line sk-line-sm' />
    </div>
  </div>
)

const queryClient = new QueryClient()  // ← add

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
  { path: '/admin/products/new', element: <AdminGate><ProductUpload /></AdminGate> },
  { path: '/admin/', element: <AdminGate><ProductListings /></AdminGate> },
  { path: '/admin/products/edit/:id', element: <AdminGate><ProductEdit /></AdminGate> },
  { path: '/admin/orders', element: <AdminGate><AdminOrders/></AdminGate> },
  { path: '/admin/products/no-stock', element: <AdminGate><NoStockProducts /></AdminGate> },
  { path: '/admin/products/orphans', element: <AdminGate><OrphanReport /></AdminGate> },
  { path: '/admin/products/sync', element: <AdminGate><CategorySync /></AdminGate> },
  { path: '/test/reports', element: <AdminGate><TestReports /></AdminGate> },
  { path: '/test/cases', element: <AdminGate><TestCases /></AdminGate> },
  { path: '/order-success', element: <OrderSuccess /> },
  { path: '/payment-failed', element: <PaymentFailed /> },

])

// ponytail: /admin/* and /orders build their Authorization header from the
// in-memory token synchronously on mount, so those routes still have to wait on
// the refresh. Every other route (home included) doesn't — it used to block
// first render on an auth round-trip for nothing.
const NEEDS_TOKEN_ON_MOUNT = /^\/(admin|orders)\b/

async function bootstrap() {
  seedE2eAuth() // ponytail: stash ?e2e=<code> before any API call fires
  const { customer, refreshToken, startAutoRefresh } = useAuthStore.getState()
  if (customer) {
    const refreshing = refreshToken()
    if (NEEDS_TOKEN_ON_MOUNT.test(window.location.pathname)) await refreshing
  }
  startAutoRefresh()

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>  {/* ← wrap */}
        <Suspense fallback={pageSkeleton}>
          <RouterProvider router={router} />
        </Suspense>
      </QueryClientProvider>
    </StrictMode>
  )
}

bootstrap()
