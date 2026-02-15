import { NavLink } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Truck, 
  Users, 
  BarChart3,
  LogOut,
  X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const AdminSidebar = ({ isOpen, onClose }) => {
  const { signOut } = useAuth()

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/suppliers', icon: Users, label: 'Suppliers' },
    { path: '/admin/delivery', icon: Truck, label: 'Delivery' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports' }
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:z-auto
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">UniMarket</h1>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-colors
                ${isActive 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={signOut}
            className="flex items-center gap-3 w-full px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

export default AdminSidebar
