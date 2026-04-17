import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { USER_ROLES } from './lib/supabase'
import { CartProvider } from './context/CartContext'
import { OrderProvider } from './context/OrderContext'

// Customer Pages
import HomePage from './pages/customer/HomePage'
import ProductDetailPage from './pages/customer/ProductDetailPage'
import CartPage from './pages/customer/CartPage'
import CheckoutPage from './pages/customer/CheckoutPage'
import OrdersPage from './pages/customer/OrdersPage'
import OrderDetailPage from './pages/customer/OrderDetailPage'
import ProfilePage from './pages/customer/ProfilePage'
import FeedbackPage from './pages/customer/FeedbackPage'

// Admin Pages
import AdminLayout from './components/layout/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCategories from './pages/admin/AdminCategories'
import AdminOrders from './pages/admin/AdminOrders'
import AdminSuppliers from './pages/admin/AdminSuppliers'
import AdminDelivery from './pages/admin/AdminDelivery'
import DeliveryScannerPage from './pages/admin/DeliveryScannerPage'
import AdminReports from './pages/admin/AdminReports'
import AdminFinance from './pages/admin/AdminFinance'
import AdminFeedback from './pages/admin/AdminFeedback'
import AdminPaymentAccounts from './pages/admin/AdminPaymentAccounts'
import AdminSettings from './pages/admin/AdminSettings'

// Auth
import LoginPage from './pages/auth/LoginPage'
import AuthCallback from './pages/auth/AuthCallback'
import PinLoginPage from './pages/auth/PinLoginPage'

// Protected Route Component
import { hasPageAccess } from './context/AuthContext'

const ProtectedRoute = ({ children, adminOnly = false, pageName = null }) => {
  const { user, profile, pinRole, loading, responsibilities } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user && !pinRole) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && profile?.role !== USER_ROLES.ADMIN) {
    return <Navigate to="/" replace />
  }

  if (pageName && !hasPageAccess(pageName, responsibilities, pinRole)) {
    return <Navigate to="/admin/pin" replace />
  }

  return children
}



function AppRoutes() {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={
        user ? <Navigate to={profile?.role === USER_ROLES.ADMIN ? '/admin' : '/'} replace /> 
             : <LoginPage />
      } />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/admin/pin" element={<PinLoginPage />} />

      {/* Customer Routes */}
      <Route path="/" element={
        <CartProvider>
          <HomePage />
        </CartProvider>
      } />
      
      <Route path="/product/:id" element={
        <CartProvider>
          <ProductDetailPage />
        </CartProvider>
      } />
      
      <Route path="/cart" element={
        <CartProvider>
          <CartPage />
        </CartProvider>
      } />
      
      <Route path="/checkout" element={
        <CartProvider>
          <CheckoutPage />
        </CartProvider>
      } />
      
      <Route path="/orders" element={
        <CartProvider>
          <OrdersPage />
        </CartProvider>
      } />
      
      <Route path="/order/:id" element={
        <CartProvider>
          <OrderDetailPage />
        </CartProvider>
      } />
      
      <Route path="/profile" element={
        <CartProvider>
          <ProfilePage />
        </CartProvider>
      } />
      
      <Route path="/feedback" element={
        <CartProvider>
          <FeedbackPage />
        </CartProvider>
      } />

      {/* Admin Routes */}
<Route path="/admin" element={
        <ProtectedRoute adminOnly>
          <AdminLayout title="Dashboard">
            <AdminDashboard />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
<Route path="/admin/products" element={
        <ProtectedRoute adminOnly pageName="AdminProducts">
          <AdminLayout title="Products">
            <AdminProducts />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
<Route path="/admin/categories" element={
        <ProtectedRoute adminOnly>
          <AdminLayout title="Categories">
            <AdminCategories />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
<Route path="/admin/orders" element={
        <ProtectedRoute adminOnly>
          <AdminLayout title="Orders">
            <AdminOrders />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
<Route path="/admin/suppliers" element={
        <ProtectedRoute adminOnly>
          <AdminLayout title="Suppliers">
            <AdminSuppliers />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
<Route path="/admin/delivery" element={
        <ProtectedRoute adminOnly>
            <AdminDelivery />
        </ProtectedRoute>
      } />

      <Route path="/admin/scanner" element={
        <ProtectedRoute adminOnly>
          <DeliveryScannerPage />
        </ProtectedRoute>
      } />
      
<Route path="/admin/reports" element={
        <ProtectedRoute adminOnly>
          <AdminLayout title="Reports & Analytics">
            <AdminReports />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
<Route path="/admin/feedback" element={
        <ProtectedRoute adminOnly>
          <AdminLayout title="Feedback">
            <AdminFeedback />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
<Route path="/admin/payment-accounts" element={
        <ProtectedRoute adminOnly>
          <AdminLayout title="Payment Accounts">
            <AdminPaymentAccounts />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
<Route path="/admin/finance" element={
        <ProtectedRoute adminOnly>
            <AdminFinance />
        </ProtectedRoute>
      } />
<Route path="/admin/settings" element={
        <ProtectedRoute adminOnly>
          <AdminLayout title="Settings">
            <AdminSettings />
          </AdminLayout>
        </ProtectedRoute>
      } />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <OrderProvider>
          <AppRoutes />
        </OrderProvider>
      </AuthProvider>
    </Router>
  )
}

export default App