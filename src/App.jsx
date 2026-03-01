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
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminCategories from './pages/admin/AdminCategories'
import AdminOrders from './pages/admin/AdminOrders'
import AdminSuppliers from './pages/admin/AdminSuppliers'
import AdminDelivery from './pages/admin/AdminDelivery'
import AdminReports from './pages/admin/AdminReports'
import AdminFeedback from './pages/admin/AdminFeedback'

// Auth
import LoginPage from './pages/auth/LoginPage'
import AuthCallback from './pages/auth/AuthCallback'

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && profile?.role !== USER_ROLES.ADMIN) {
    return <Navigate to="/" replace />
  }

  return children
}

// Admin Route Wrapper
const AdminLayout = ({ children }) => {
  return <>{children}</>
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
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/products" element={
        <ProtectedRoute adminOnly>
          <AdminLayout>
            <AdminProducts />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/categories" element={
        <ProtectedRoute adminOnly>
          <AdminLayout>
            <AdminCategories />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/orders" element={
        <ProtectedRoute adminOnly>
          <AdminLayout>
            <AdminOrders />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/suppliers" element={
        <ProtectedRoute adminOnly>
          <AdminLayout>
            <AdminSuppliers />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/delivery" element={
        <ProtectedRoute adminOnly>
          <AdminLayout>
            <AdminDelivery />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/reports" element={
        <ProtectedRoute adminOnly>
          <AdminLayout>
            <AdminReports />
          </AdminLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/admin/feedback" element={
        <ProtectedRoute adminOnly>
          <AdminLayout>
            <AdminFeedback />
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
