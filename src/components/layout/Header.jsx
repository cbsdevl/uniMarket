import { Menu, ShoppingCart, Search, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const Header = ({ title, showBack = false, showMenu = true, showCart = true, children }) => {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
          ) : showMenu ? (
            <button className="p-2 -ml-2 hover:bg-gray-100 rounded-xl transition-colors">
              <Menu className="w-5 h-5 text-gray-700" />
            </button>
          ) : (
            <div className="w-9" />
          )}
          
          <h1 className="text-lg font-semibold text-gray-900">
            {title || 'UniMarket'}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {children}
          {showCart && (
            <button 
              onClick={() => navigate('/cart')}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative"
            >
              <ShoppingCart className="w-5 h-5 text-gray-700" />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
