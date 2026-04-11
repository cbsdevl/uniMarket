import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Truck, ShieldCheck } from 'lucide-react'
import Header from '../../components/layout/Header'
import BottomNav from '../../components/layout/BottomNav'
import OrderCard from '../../components/orders/OrderCard'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/common/Button'
import { useAuth } from '../../context/AuthContext'
import { useOrders } from '../../context/OrderContext'

const OrdersPage = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const { orders, loading, fetchOrders } = useOrders()

  useEffect(() => {
    if (user) {
      fetchOrders(user.id)
    }
  }, [user])

  /* Find any order currently out for delivery */
  const activeDelivery = orders.find(o => o.status === 'OUT_FOR_DELIVERY')
  const hasActiveOrder = orders.some(o =>
    ['PENDING_PAYMENT', 'PENDING_CONFIRMATION', 'CONFIRMED', 'SOURCED', 'OUT_FOR_DELIVERY'].includes(o.status)
  )

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="My Orders" />
        <div className="p-4 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
        <BottomNav />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="My Orders" />
        <EmptyState
          type="order"
          title="Please sign in"
          message="You need to be signed in to view your orders."
          action={<Button onClick={() => navigate('/login')}>Sign In</Button>}
        />
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="My Orders" showCart={false} />

      <main className="p-4">

        {/* ── Active delivery banner ── */}
        {activeDelivery && (
          <div
            className="rounded-2xl overflow-hidden mb-4 cursor-pointer active:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}
            onClick={() => navigate(`/order/${activeDelivery.id}`)}
          >
            <div className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm leading-tight">Order on the way!</p>
                <p className="text-blue-200 text-xs mt-0.5">
                  Have your QR code ready for the delivery person.
                </p>
              </div>
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <span className="text-white text-xs font-medium">View QR</span>
              </div>
            </div>

            {/* Animated progress bar */}
            <div className="h-1 bg-white/10">
              <div
                className="h-full bg-white/50 rounded-full"
                style={{ width: '75%', animation: 'progressPulse 2s ease-in-out infinite' }}
              />
            </div>
          </div>
        )}

        {/* ── QR info tip (no active delivery, but has active orders) ── */}
        {!activeDelivery && hasActiveOrder && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-2xl p-3 mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-blue-700 text-xs leading-relaxed flex-1">
              Each order has a unique <strong>QR code</strong>. Tap any order below, expand it to see your QR — ready to show the delivery person.
            </p>
          </div>
        )}

        {/* ── Orders list ── */}
        {orders.length === 0 ? (
          <EmptyState
            type="order"
            title="No orders yet"
            message="You haven't placed any orders yet. Start shopping to see your orders here!"
            action={<Button onClick={() => navigate('/')}>Start Shopping</Button>}
          />
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </main>

      <BottomNav />

      <style>{`
        @keyframes progressPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default OrdersPage
