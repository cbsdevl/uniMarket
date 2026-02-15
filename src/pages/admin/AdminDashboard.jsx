import { useEffect, useState } from 'react'
import { ShoppingCart, Package, DollarSign, TrendingUp, Users, Clock } from 'lucide-react'
import AdminSidebar from '../../components/layout/AdminSidebar'
import StatsCard from '../../components/admin/StatsCard'
import Card from '../../components/common/Card'
import OrderCard from '../../components/orders/OrderCard'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    totalProfit: 0
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      // Fetch orders
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error

      // Calculate stats
      const totalOrders = orders?.length || 0
      const pendingOrders = orders?.filter(o => 
        ['PENDING_PAYMENT', 'PENDING_CONFIRMATION'].includes(o.status)
      ).length || 0
      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
      const totalProfit = orders?.reduce((sum, o) => sum + (o.profit || 0), 0) || 0

      setStats({
        totalOrders,
        pendingOrders,
        totalRevenue,
        totalProfit
      })

      setRecentOrders(orders || [])
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error
      fetchDashboardData()
    } catch (err) {
      console.error('Error updating order:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={ShoppingCart}
            color="blue"
          />
          <StatsCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={Clock}
            color="amber"
          />
          <StatsCard
            title="Total Revenue"
            value={formatCurrency(stats.totalRevenue)}
            icon={DollarSign}
            color="green"
          />
          <StatsCard
            title="Total Profit"
            value={formatCurrency(stats.totalProfit)}
            icon={TrendingUp}
            color="purple"
          />
        </div>

        {/* Recent Orders */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
            <a href="/admin/orders" className="text-sm text-blue-600 hover:underline">
              View All
            </a>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No orders yet
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.slice(0, 5).map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  showActions={true}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}

export default AdminDashboard
