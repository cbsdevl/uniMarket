import { useState, useEffect } from 'react'
import { Truck, CheckCircle, MapPin, Phone, Package } from 'lucide-react'
import AdminSidebar from '../../components/layout/AdminSidebar'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'

const AdminDelivery = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeliveryOrders()
  }, [])

  const fetchDeliveryOrders = async () => {
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
          user:users (name, email)
        `)
        .in('status', ['SOURCED', 'OUT_FOR_DELIVERY'])
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err) {
      console.error('Error fetching delivery orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      let updateData = { status: newStatus }
      
      if (newStatus === 'DELIVERED') {
        const order = orders.find(o => o.id === orderId)
        if (order?.order_items) {
          const profit = order.order_items.reduce((sum, item) => {
            const cost = item.product?.supplier_price || 0
            return sum + ((item.unit_price - cost) * item.quantity)
          }, 0)
          updateData.profit = profit
        }
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

      if (error) throw error
      fetchDeliveryOrders()
    } catch (err) {
      console.error('Error updating order:', err)
    }
  }

  const outForDelivery = orders.filter(o => o.status === 'OUT_FOR_DELIVERY')
  const readyForDelivery = orders.filter(o => o.status === 'SOURCED')

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Delivery Management</h1>
          <p className="text-gray-500 mt-1">Track and manage deliveries</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Package className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{readyForDelivery.length}</p>
                <p className="text-sm text-gray-500">Ready for Delivery</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{outForDelivery.length}</p>
                <p className="text-sm text-gray-500">Out for Delivery</p>
              </div>
            </div>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : orders.length === 0 ? (
          <Card className="p-8 text-center">
            <Truck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No deliveries pending</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-500">{order.user?.name}</p>
                  </div>
                  <Badge variant={order.status === 'OUT_FOR_DELIVERY' ? 'primary' : 'warning'}>
                    {order.status === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' : 'Ready'}
                  </Badge>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm mb-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{order.delivery_address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{order.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{order.order_items?.length || 0} items</p>
                    <p className="font-bold text-blue-600">{formatCurrency(order.total_amount)}</p>
                    {order.balance_due > 0 && (
                      <p className="text-xs text-amber-600">Balance: {formatCurrency(order.balance_due)}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {order.status === 'SOURCED' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'OUT_FOR_DELIVERY')}
                      >
                        <Truck className="w-4 h-4 mr-1" />
                        Start Delivery
                      </Button>
                    )}
                    {order.status === 'OUT_FOR_DELIVERY' && (
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Confirm Delivery
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminDelivery
