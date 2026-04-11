import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'react-qr-code'
import {
  ChevronDown, ChevronUp, MapPin, Phone, Clock, CreditCard,
  CheckCircle, XCircle, RotateCcw, DollarSign, ShieldCheck, Truck, ExternalLink
} from 'lucide-react'
import Card from '../common/Card'
import Badge from '../common/Badge'
import { formatCurrency, formatDate } from '../../utils/helpers'
import { ORDER_STATUS_CONFIG } from '../../utils/constants'

/* Statuses for which we show the QR to the customer */
const QR_VISIBLE_STATUSES = [
  'PENDING_PAYMENT',
  'PENDING_CONFIRMATION',
  'CONFIRMED',
  'SOURCED',
  'OUT_FOR_DELIVERY',
]

const OrderCard = ({
  order,
  onStatusUpdate,
  showActions = false,
  onPaymentVerify,
  onCancelOrder,
  onProcessRefund,
}) => {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState(false)

  const statusConfig = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.PENDING_PAYMENT
  const isOutForDelivery = order.status === 'OUT_FOR_DELIVERY'
  const showQR = !showActions && order.qr_token && QR_VISIBLE_STATUSES.includes(order.status)

  const getStatusVariant = (status) => {
    const variants = {
      PENDING_PAYMENT: 'warning',
      PENDING_CONFIRMATION: 'warning',
      CONFIRMED: 'info',
      SOURCED: 'info',
      OUT_FOR_DELIVERY: 'primary',
      DELIVERED: 'secondary',
      CANCELLED: 'danger',
      WAIT_FOR_REFUND: 'warning',
      REFUNDED: 'secondary',
    }
    return variants[status] || 'default'
  }

  const needsPaymentVerification =
    showActions &&
    order.status === 'PENDING_PAYMENT' &&
    order.payment_provider &&
    order.payment_provider !== 'CASH' &&
    (!order.payment_status || order.payment_status === 'PENDING')

  const canCancel =
    showActions &&
    ['PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'CONFIRMED'].includes(order.status)

  const canProcessRefund = showActions && order.status === 'WAIT_FOR_REFUND'

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this order? The customer will need to be refunded.')) {
      onCancelOrder(order.id)
    }
  }

  const handleProcessRefund = () => {
    if (window.confirm('Confirm that you have processed the refund to the customer?')) {
      onProcessRefund(order.id)
    }
  }

  const qrPayload = order.qr_token
    ? JSON.stringify({ orderId: order.id, token: order.qr_token })
    : null

  return (
    <Card className="overflow-hidden">

      {/* ── OUT_FOR_DELIVERY banner ── customer only */}
      {isOutForDelivery && !showActions && (
        <div
          className="flex items-center gap-3 px-4 py-2.5"
          style={{ background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)' }}
        >
          <Truck className="w-4 h-4 text-white shrink-0" />
          <p className="text-white text-xs font-semibold flex-1">
            Your order is on the way! Have your QR ready.
          </p>
          <span className="w-2 h-2 rounded-full bg-white animate-ping inline-block" />
        </div>
      )}

      {/* ── Card header ── */}
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
          <div className="flex flex-col items-end gap-1">
            <Badge variant={getStatusVariant(order.status)}>
              {statusConfig.label}
            </Badge>
            {needsPaymentVerification && (
              <span className="text-xs text-amber-600 font-medium">⚠️ Payment Pending</span>
            )}
            {order.status === 'WAIT_FOR_REFUND' && (
              <span className="text-xs text-orange-600 font-medium">⏳ Awaiting Refund</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-500">{order.order_items?.length || 0} items</span>
            <span className="mx-2 text-gray-300">•</span>
            <span className="font-bold text-blue-600">{formatCurrency(order.total_amount)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {/* QR pill hint — customer only, non-delivered */}
            {showQR && !expanded && (
              <span className="flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-medium px-2 py-1 rounded-full border border-blue-100">
                <ShieldCheck className="w-3 h-3" />
                QR Code
              </span>
            )}
            {expanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* ── Expanded content ── */}
      {expanded && (
        <div className="border-t border-gray-100">

          {/* ── Inline QR Code (customer view only) ── */}
          {showQR && qrPayload && (
            <div
              className="mx-4 mt-4 rounded-2xl overflow-hidden"
              style={{ background: 'linear-gradient(150deg, #1e3a8a 0%, #1d4ed8 55%, #3b82f6 100%)' }}
            >
              <div className="flex items-center gap-3 px-4 pt-4 pb-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">Delivery QR Code</p>
                  <p className="text-blue-200 text-xs">Show to delivery person</p>
                </div>
                {isOutForDelivery && (
                  <span className="ml-auto text-xs bg-amber-400 text-amber-900 font-bold px-2 py-0.5 rounded-full animate-pulse">
                    Active
                  </span>
                )}
              </div>

              {/* QR */}
              <div className="flex flex-col items-center px-4 pb-4">
                <div className="bg-white rounded-xl p-3 mt-2 shadow-xl">
                  <QRCode
                    value={qrPayload}
                    size={180}
                    level="M"
                    style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                  />
                </div>

                <p className="text-blue-200 text-xs text-center mt-2.5 max-w-[220px] leading-relaxed">
                  Unique &amp; secure. Only valid for this order.
                </p>

                {/* View full detail */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    navigate(`/order/${order.id}`)
                  }}
                  className="mt-3 flex items-center gap-1.5 bg-white/15 hover:bg-white/25 active:bg-white/10 text-white text-xs font-medium px-4 py-2 rounded-xl transition-colors w-full justify-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Full Details &amp; Save QR
                </button>
              </div>
            </div>
          )}

          <div className="px-4 pb-4">
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
              <div className="flex items-center gap-2 text-sm mb-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <span className="text-gray-500">Payment Method:</span>
                <span className="font-medium">{order.payment_method}</span>
              </div>

              {/* Mobile Money Payment Details — admin only */}
              {showActions && order.payment_provider && order.payment_provider !== 'CASH' && (
                <div className="bg-blue-50 rounded-lg p-3 mt-2">
                  <p className="text-xs font-semibold text-blue-700 mb-2">💳 Payment Details</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Provider:</span>
                      <span className="font-medium">{order.payment_provider}</span>
                    </div>
                    {order.payment_name && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-medium">{order.payment_name}</span>
                      </div>
                    )}
                    {order.payment_phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone:</span>
                        <span className="font-medium">{order.payment_phone}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1 border-t border-blue-100">
                      <span className="text-gray-500">Amount Paid:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(order.deposit_amount || order.total_amount)}
                      </span>
                    </div>
                    {order.payment_status && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <span
                          className={`font-medium ${
                            order.payment_status === 'VERIFIED'
                              ? 'text-green-600'
                              : order.payment_status === 'REJECTED'
                              ? 'text-red-600'
                              : 'text-amber-600'
                          }`}
                        >
                          {order.payment_status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {order.deposit_amount > 0 && (
                <>
                  <div className="flex justify-between text-sm mb-1 mt-2">
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

            {/* Admin Actions */}
            {showActions && onStatusUpdate && (
              <div className="mt-4 pt-3 border-t border-gray-100">
                {/* Payment Verification Buttons */}
                {needsPaymentVerification && onPaymentVerify && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-2">Verify Payment:</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onPaymentVerify(order.id, true)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-green-600 text-white rounded-lg text-sm font-medium"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Verify
                      </button>
                      <button
                        onClick={() => onPaymentVerify(order.id, false)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-red-600 text-white rounded-lg text-sm font-medium"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                )}

                {/* Status Buttons */}
                <div className="flex gap-2">
                  {order.status === 'PENDING_PAYMENT' && !needsPaymentVerification && (
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

                {/* Cancel */}
                {canCancel && onCancelOrder && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={handleCancel}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Cancel Order (Start Refund)
                    </button>
                  </div>
                )}

                {/* Refund */}
                {canProcessRefund && onProcessRefund && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <button
                      onClick={handleProcessRefund}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      <DollarSign className="w-4 h-4" />
                      Process Refund Complete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

export default OrderCard
