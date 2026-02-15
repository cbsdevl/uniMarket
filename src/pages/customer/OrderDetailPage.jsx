import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import BottomNav from '../../components/layout/BottomNav'
import Card from '../../components/common/Card'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import { supabase } from '../../lib/supabase'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { ORDER_STATUS_CONFIG, DEFAULT_PRODUCT_IMAGE } from '../../utils/constants'

const OrderDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      setOrder(data)
    } catch (err) {
      console.error('Error fetching order:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusVariant = (status) => {
    const variants = {
      PENDING_PAYMENT: 'warning',
      PENDING_CONFIRMATION: 'warning',
      CONFIRMED: 'info',
      SOURCED: 'info',
      OUT_FOR_DELIVERY: 'primary',
      DELIVERED: 'secondary',
      CANCELLED: 'danger'
    }
    return variants[status] || 'default'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Order Details" showBack />
        <div className="p-4 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Order Not Found" showBack />
        <div className="p-4 text-center">
          <p className="text-gray-500">This order doesn't exist.</p>
          <Button onClick={() => navigate('/orders')} className="mt-4">
            View All Orders
          </Button>
        </div>
        <BottomNav />
      </div>
    )
  }

  const statusConfig = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.PENDING_PAYMENT

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title={`Order #${id.slice(0, 8).toUpperCase()}`} showBack />
      
      <main className="p-4 space-y-4">
        {/* Status */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Order Status</h3>
            <Badge variant={getStatusVariant(order.status)}>
              {statusConfig.label}
            </Badge>
          </div>
          
          <div className="space-y-2">
            {Object.entries(ORDER_STATUS_CONFIG).map(([key, config], index) => {
              const isActive = Object.keys(ORDER_STATUS_CONFIG).indexOf(order.status) >= index
              const isCurrent = key === order.status
              
              return (
                <div 
                  key={key}
                  className={`flex items-center gap-3 ${
                    isActive ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${
                    isCurrent ? 'bg-blue-600' : isActive ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span className={`text-sm ${isCurrent ? 'font-medium' : ''}`}>
                    {config.label}
                  </span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Order Items */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
          
          <div className="space-y-3">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={item.product?.image_url || DEFAULT_PRODUCT_IMAGE} 
                    alt={item.product?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {item.product?.name || 'Product'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} × {formatCurrency(item.unit_price)}
                  </p>
                </div>
                <span className="font-medium text-gray-900">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Delivery Info */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Delivery Details</h3>
          
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-gray-500 mb-1">Delivery Address</p>
              <p className="font-medium text-gray-900">{order.delivery_address}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Phone</p>
              <p className="font-medium text-gray-900">{order.phone}</p>
            </div>
            <div>
              <p className="text-gray-500 mb-1">Ordered On</p>
              <p className="font-medium text-gray-900">{formatDate(order.created_at)}</p>
            </div>
          </div>
        </Card>

        {/* Payment Info */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-medium">{order.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total Amount</span>
              <span className="font-medium">{formatCurrency(order.total_amount)}</span>
            </div>
            {order.deposit_amount > 0 && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-500">Deposit Paid</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(order.deposit_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Balance Due</span>
                  <span className="font-medium text-amber-600">
                    {formatCurrency(order.balance_due)}
                  </span>
                </div>
              </>
            )}
            {order.profit > 0 && (
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-500">Your Profit</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(order.profit)}
                </span>
              </div>
            )}
          </div>
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}

export default OrderDetailPage
