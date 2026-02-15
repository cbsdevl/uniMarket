import { useState } from 'react'
import { ChevronDown, ChevronUp, MapPin, Phone, Clock } from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { ORDER_STATUS_CONFIG } from '../../utils/constants'

const OrderCard = ({ order, onStatusUpdate, showActions = false }) => {
  const [expanded, setExpanded] = useState(false)
  
  const statusConfig = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.PENDING_PAYMENT

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

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h3>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" />
              {formatDate(order.created_at)}
            </p>
          </div>
          <Badge variant={getStatusVariant(order.status)}>
            {statusConfig.label}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-500">{order.order_items?.length || 0} items</span>
            <span className="mx-2 text-gray-300">•</span>
            <span className="font-bold text-blue-600">{formatCurrency(order.total_amount)}</span>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {/* Items */}
          <div className="py-3 space-y-2">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden">
                  <img 
                    src={item.product?.image_url || 'https://via.placeholder.com/40'} 
                    alt={item.product?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.product?.name || 'Product'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} × {formatCurrency(item.unit_price)}
                  </p>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}
          </div>

          {/* Delivery info */}
          <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{order.delivery_address}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{order.phone}</span>
            </div>
          </div>

          {/* Payment info */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-500">Payment Method</span>
              <span className="font-medium">{order.payment_method}</span>
            </div>
            {order.deposit_amount > 0 && (
              <>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-500">Deposit Paid</span>
                  <span className="font-medium text-green-600">{formatCurrency(order.deposit_amount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Balance Due</span>
                  <span className="font-medium text-amber-600">{formatCurrency(order.balance_due)}</span>
                </div>
              </>
            )}
          </div>

          {/* Actions */}
          {showActions && onStatusUpdate && (
            <div className="mt-4 pt-3 border-t border-gray-100 flex gap-2">
              {order.status === 'PENDING_PAYMENT' && (
                <button
                  onClick={() => onStatusUpdate(order.id, 'PENDING_CONFIRMATION')}
                  className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg text-sm font-medium"
                >
                  Confirm Payment
                </button>
              )}
              {order.status === 'PENDING_CONFIRMATION' && (
                <button
                  onClick={() => onStatusUpdate(order.id, 'CONFIRMED')}
                  className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg text-sm font-medium"
                >
                  Confirm Order
                </button>
              )}
              {order.status === 'CONFIRMED' && (
                <button
                  onClick={() => onStatusUpdate(order.id, 'SOURCED')}
                  className="flex-1 py-2 px-3 bg-purple-600 text-white rounded-lg text-sm font-medium"
                >
                  Mark Sourced
                </button>
              )}
              {order.status === 'SOURCED' && (
                <button
                  onClick={() => onStatusUpdate(order.id, 'OUT_FOR_DELIVERY')}
                  className="flex-1 py-2 px-3 bg-indigo-600 text-white rounded-lg text-sm font-medium"
                >
                  Out for Delivery
                </button>
              )}
              {order.status === 'OUT_FOR_DELIVERY' && (
                <button
                  onClick={() => onStatusUpdate(order.id, 'DELIVERED')}
                  className="flex-1 py-2 px-3 bg-green-600 text-white rounded-lg text-sm font-medium"
                >
                  Confirm Delivery
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export default OrderCard
