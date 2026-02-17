import { useState, useEffect } from 'react'
import { Filter, Search, X } from 'lucide-react'
import AdminSidebar from '../../components/layout/AdminSidebar'
import Card from '../../components/common/Card'
import OrderCard from '../../components/orders/OrderCard'
import { supabase } from '../../lib/supabase'
import { ORDER_STATUS_CONFIG } from '../../utils/constants'

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          ),
          user:profiles (name, email)

        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      // Get the order to calculate profit
      const order = orders.find(o => o.id === orderId)
      let profit = 0

      if (newStatus === 'DELIVERED' && order?.order_items) {
        // Calculate profit
        profit = order.order_items.reduce((sum, item) => {
          const cost = item.product?.supplier_price || 0
          return sum + ((item.unit_price - cost) * item.quantity)
        }, 0)
      }

      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          ...(profit > 0 && { profit })
        })
        .eq('id', orderId)

      if (error) throw error
      fetchOrders()
    } catch (err) {
      console.error('Error updating order:', err)
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchQuery || 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone?.includes(searchQuery)
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    all: orders.length,
    PENDING_PAYMENT: orders.filter(o => o.status === 'PENDING_PAYMENT').length,
    PENDING_CONFIRMATION: orders.filter(o => o.status === 'PENDING_CONFIRMATION').length,
    CONFIRMED: orders.filter(o => o.status === 'CONFIRMED').length,
    SOURCED: orders.filter(o => o.status === 'SOURCED').length,
    OUT_FOR_DELIVERY: orders.filter(o => o.status === 'OUT_FOR_DELIVERY').length,
    DELIVERED: orders.filter(o => o.status === 'DELIVERED').length
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">Manage and track all orders</p>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['all', 'PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'CONFIRMED', 'SOURCED', 'OUT_FOR_DELIVERY', 'DELIVERED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {status === 'all' ? 'All' : ORDER_STATUS_CONFIG[status]?.label || status}
              <span className="ml-2 opacity-75">({statusCounts[status] || 0})</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer name, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </Card>

        {/* Orders List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No orders found</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                showActions={true}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminOrders
