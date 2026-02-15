import { Home, ShoppingBag, ShoppingCart, User } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useCart } from '../../context/CartContext'

const BottomNav = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { getCartCount } = useCart()
  const cartCount = getCartCount()

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/products', icon: ShoppingBag, label: 'Products' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartCount },
    { path: '/profile', icon: User, label: 'Profile' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-bottom z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          const Icon = item.icon

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors relative ${
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNav
