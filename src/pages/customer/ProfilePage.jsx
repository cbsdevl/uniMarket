import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Phone, Mail, LogOut, Settings, ShoppingBag } from 'lucide-react'
import Header from '../../components/layout/Header'
import BottomNav from '../../components/layout/BottomNav'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, profile, signOut } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    await signOut()
    navigate('/login')
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Profile" showCart={false} />
        <div className="p-4 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Please sign in to view your profile.</p>
            <Button onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="My Profile" showCart={false} />
      
      <main className="p-4 space-y-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {profile?.name || user.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-sm text-gray-500 capitalize">
                {profile?.role || 'Customer'}
              </p>
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-900">Account Information</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-gray-600">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-sm">{user.email}</span>
            </div>
            
            {profile?.phone && (
              <div className="flex items-center gap-3 text-gray-600">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-sm">{profile.phone}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
          <h3 className="font-semibold text-gray-900">Quick Actions</h3>
          
          <button
            onClick={() => navigate('/orders')}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ShoppingBag className="w-5 h-5 text-blue-600" />
            <span className="text-gray-700">My Orders</span>
          </button>
          
          <button
            onClick={() => navigate('/cart')}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Settings className="w-5 h-5 text-blue-600" />
            <span className="text-gray-700">Cart</span>
          </button>
        </div>

        {/* Sign Out */}
        <div className="pt-4">
          <Button
            onClick={handleSignOut}
            loading={loading}
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export default ProfilePage
