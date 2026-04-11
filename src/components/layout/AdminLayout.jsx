import { useState } from 'react'
import { Menu, Shield, Bell } from 'lucide-react'
import AdminSidebar from './AdminSidebar'
import { useAuth } from '../../context/AuthContext'

/**
 * AdminLayout — wraps every admin page.
 * On desktop (lg+): persistent sidebar + full-width content.
 * On mobile: hidden sidebar + top hamburger bar that slides the drawer in.
 */
const AdminLayout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { profile } = useAuth()

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar (receives open state on mobile) */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Mobile top bar ── only visible on < lg ── */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center gap-3 h-16 px-4 bg-slate-900 shadow-md">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/5 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-2 flex-1">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-bold text-base tracking-tight">
              {title || 'UniMarket Admin'}
            </span>
          </div>

          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-md">
            {profile?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
