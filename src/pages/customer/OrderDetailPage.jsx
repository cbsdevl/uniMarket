import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import QRCode from 'react-qr-code'
import { CheckCircle, Download, Share2, ShieldCheck, Package, Truck } from 'lucide-react'
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
  const [searchParams] = useSearchParams()
  const isNewOrder = searchParams.get('new') === '1'

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(isNewOrder)
  const qrRef = useRef(null)

  useEffect(() => {
    fetchOrder()
    if (isNewOrder) {
      const timer = setTimeout(() => setShowSuccess(false), 4000)
      return () => clearTimeout(timer)
    }
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

  const handleDownloadQR = () => {
    if (!qrRef.current) return
    const svg = qrRef.current.querySelector('svg')
    if (!svg) return
    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    img.onload = () => {
      canvas.width = 300
      canvas.height = 300
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 300, 300)
      ctx.drawImage(img, 0, 0, 300, 300)
      URL.revokeObjectURL(url)
      const pngUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `order-${id.slice(0, 8).toUpperCase()}-qr.png`
      link.href = pngUrl
      link.click()
    }
    img.src = url
  }

  const handleShareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Order QR Code',
          text: `Order #${id.slice(0, 8).toUpperCase()} - Show this to the delivery person`,
        })
      } catch (_) {}
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
  const qrPayload = JSON.stringify({ orderId: order.id, token: order.qr_token })

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title={`Order #${id.slice(0, 8).toUpperCase()}`} showBack />

      {/* ── Success celebration banner ── */}
      {showSuccess && (
        <div
          className="mx-4 mt-4 rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            animation: 'slideDown 0.4s ease-out'
          }}
        >
          <div className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">Order Placed! 🎉</p>
              <p className="text-green-100 text-sm mt-0.5">
                Your QR code is ready — show it when your order arrives.
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="p-4 space-y-4">

        {/* ── QR Code ── always shown when token exists ── */}
        {order.qr_token ? (
          <div
            className="rounded-3xl overflow-hidden"
            style={{ background: 'linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 60%, #3b82f6 100%)' }}
          >
            {/* Header strip */}
            <div className="px-5 pt-5 pb-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-base leading-tight">Delivery Verification QR</p>
                <p className="text-blue-200 text-xs mt-0.5">Show to delivery person on arrival</p>
              </div>
              {order.status === 'OUT_FOR_DELIVERY' && (
                <span className="ml-auto inline-flex items-center gap-1.5 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                  <Truck className="w-3 h-3" /> On the way!
                </span>
              )}
            </div>

            {/* QR body */}
            <div className="flex flex-col items-center px-5 pb-5">
              <div
                ref={qrRef}
                className="bg-white rounded-2xl p-4 shadow-2xl mt-2"
                style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}
              >
                <QRCode
                  value={qrPayload}
                  size={220}
                  level="M"
                  style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                />
              </div>

              <p className="text-blue-200 text-xs text-center mt-4 max-w-[260px] leading-relaxed">
                This QR code is unique to your order. The delivery person will scan it to confirm your identity.
              </p>

              {/* Action buttons */}
              <div className="flex gap-3 mt-4 w-full max-w-xs">
                <button
                  onClick={handleDownloadQR}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 active:bg-white/10 text-white text-sm font-medium py-2.5 rounded-xl transition-colors backdrop-blur-sm"
                >
                  <Download className="w-4 h-4" />
                  Save
                </button>
                {typeof navigator !== 'undefined' && navigator.share && (
                  <button
                    onClick={handleShareQR}
                    className="flex-1 flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 active:bg-white/10 text-white text-sm font-medium py-2.5 rounded-xl transition-colors backdrop-blur-sm"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Fallback when qr_token not yet generated */
          <Card className="p-5 flex items-center gap-4 border-dashed border-2 border-blue-200 bg-blue-50">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">QR code being generated…</p>
              <p className="text-xs text-gray-500 mt-0.5">Your delivery QR code will appear here shortly.</p>
            </div>
          </Card>
        )}

        {/* ── Order Status ── */}
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

        {/* ── Order Items ── */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-gray-400" />
            Order Items
          </h3>

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

        {/* ── Delivery Info ── */}
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

        {/* ── Payment Info ── */}
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

        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/orders')}
        >
          View All Orders
        </Button>
      </main>

      <BottomNav />

      {/* Slide-down keyframe */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default OrderDetailPage
