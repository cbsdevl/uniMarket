import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, DollarSign, ShoppingCart, Package } from 'lucide-react'
import AdminSidebar from '../../components/layout/AdminSidebar'
import StatsCard from '../../components/admin/StatsCard'
import Card from '../../components/common/Card'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

const AdminReports = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalProfit: 0,
    totalOrders: 0,
    avgOrderValue: 0
  })
  const [categoryData, setCategoryData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (category)
          )
        `)
        .eq('status', 'DELIVERED')

      if (error) throw error

      // Calculate stats
      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0
      const totalProfit = orders?.reduce((sum, o) => sum + (o.profit || 0), 0) || 0
      const totalOrders = orders?.length || 0
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

      setStats({
        totalRevenue,
        totalProfit,
        totalOrders,
        avgOrderValue
      })

      // Category distribution
      const categoryMap = {}
      orders?.forEach(order => {
        order.order_items?.forEach(item => {
          const category = item.product?.category || 'Unknown'
          categoryMap[category] = (categoryMap[category] || 0) + item.subtotal
        })
      })

      const categoryChartData = Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value
      }))
      setCategoryData(categoryChartData)

      // Monthly trend (mock data for demo)
      const monthlyChartData = [
        { month: 'Jan', revenue: 45000, profit: 8000 },
        { month: 'Feb', revenue: 52000, profit: 9500 },
        { month: 'Mar', revenue: 48000, profit: 8500 },
        { month: 'Apr', revenue: 61000, profit: 12000 },
        { month: 'May', revenue: 55000, profit: 10000 },
        { month: 'Jun', revenue: 67000, profit: 13500 }
      ]
      setMonthlyData(monthlyChartData)

    } catch (err) {
      console.error('Error fetching report data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 mt-1">Business performance insights</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          <StatsCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={ShoppingCart}
            color="blue"
          />
          <StatsCard
            title="Avg Order Value"
            value={formatCurrency(stats.avgOrderValue)}
            icon={Package}
            color="amber"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Category Distribution */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Sales by Category</h3>
            <div className="h-64">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  No data available
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-4 justify-center">
              {categoryData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm text-gray-600">{entry.name}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Top Products Table */}
        <Card className="p-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Performance Summary</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Metric</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-900">Profit Margin</td>
                  <td className="py-3 px-4 text-sm font-medium text-green-600 text-right">
                    {stats.totalRevenue > 0 ? ((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 text-sm text-gray-900">Revenue per Order</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(stats.avgOrderValue)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-sm text-gray-900">Profit per Order</td>
                  <td className="py-3 px-4 text-sm font-medium text-green-600 text-right">
                    {formatCurrency(stats.totalOrders > 0 ? stats.totalProfit / stats.totalOrders : 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  )
}

export default AdminReports
