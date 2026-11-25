// main.jsx or index.jsx

import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'  // ← add

import './index.css'
import Home from './Home.jsx'
import { useAuthStore } from './store/authStore'
import AdminGate from './admin/AdminGate.jsx'
import RequireAuth from './RequireAuth.jsx'
import { seedE2eAuth } from './utils/e2e'
import { GridSkeleton, DetailSkeleton, ListSkeleton, FormSkeleton, TextSkeleton } from './RouteSkeletons.jsx'

// ponytail: Home stays eager — it's the landing route, so lazying it would only
// buy a second round-trip before first paint. Everything else ships as its own
// chunk; a customer never downloads the admin bundle.
const Products = lazy(() => import('./ProductsListing.jsx'))
const NotFound = lazy(() => import('./NotFound.jsx'))
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
      <div className='sk-line sk-line-sm' />
      <div className='sk-line sk-btn' />
    </div>
    <div className='sk-row'>
      {[0, 1, 2, 3].map(i => <div key={i} className='sk-line sk-card' />)}
    </div>
  </div>
)

// per-route fallback so a downloading chunk shows that page's shape, not the generic shell
const page = (el, fb) => <Suspense fallback={fb}>{el}</Suspense>

const queryClient = new QueryClient()  // ← add

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/product/:id', element: page(<ProductDetail />, <DetailSkeleton />) },
  { path: '/products', element: page(<Products />, <GridSkeleton />) },
  { path: '/:slug', element: page(<Products />, <GridSkeleton />) },
  { path: '/login', element: page(<LoginPage />, <FormSkeleton />) },
  { path: '/bag', element: page(<BagPage />, <ListSkeleton />) },
  { path: '/contact-us', element: page(<ContactUsPage />, <TextSkeleton />) },
  { path: '/terms', element: page(<TermsAndConditionsPage/>, <TextSkeleton />) },
  { path: '/orders', element: page(<RequireAuth><OrdersPage /></RequireAuth>, <ListSkeleton nav={false} />) },
  { path: '/review', element: page(<ReviewPage />, <FormSkeleton nav={false} />) },
  { path: '/wishlist', element: page(<WishlistPage />, <GridSkeleton />) },
  { path: '/profile', element: page(<ProfilePage />, <FormSkeleton />) },
  { path: '/refund-policy', element: page(<RefundPolicyPage/>, <TextSkeleton />) },
  { path: '/privacy-policy', element: page(<PrivacyPolicy/>, <TextSkeleton />) },
  { path: '/admin/products/new', element: page(<AdminGate><ProductUpload /></AdminGate>, <FormSkeleton nav={false} />) },
  { path: '/admin/', element: page(<AdminGate><ProductListings /></AdminGate>, <ListSkeleton nav={false} />) },
  { path: '/admin/products/edit/:id', element: page(<AdminGate><ProductEdit /></AdminGate>, <FormSkeleton nav={false} />) },
  { path: '/admin/orders', element: page(<AdminGate><AdminOrders/></AdminGate>, <ListSkeleton nav={false} />) },
  { path: '/admin/products/no-stock', element: page(<AdminGate><NoStockProducts /></AdminGate>, <ListSkeleton nav={false} />) },
  { path: '/admin/products/orphans', element: page(<AdminGate><OrphanReport /></AdminGate>, <ListSkeleton nav={false} />) },
  { path: '/admin/products/sync', element: page(<AdminGate><CategorySync /></AdminGate>, <ListSkeleton nav={false} />) },
  { path: '/test/reports', element: page(<AdminGate><TestReports /></AdminGate>, <ListSkeleton nav={false} />) },
  { path: '/test/cases', element: page(<AdminGate><TestCases /></AdminGate>, <ListSkeleton nav={false} />) },
  { path: '/order-success', element: page(<OrderSuccess />, <TextSkeleton />) },
  { path: '/payment-failed', element: page(<PaymentFailed />, <TextSkeleton />) },
  { path: '*', element: page(<NotFound />, <TextSkeleton nav />) },

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
