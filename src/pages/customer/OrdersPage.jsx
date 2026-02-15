import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
          action={
            <Button onClick={() => navigate('/login')}>
              Sign In
            </Button>
          }
        />
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="My Orders" showCart={false} />
      
      <main className="p-4">
        {orders.length === 0 ? (
          <EmptyState
            type="order"
            title="No orders yet"
            message="You haven't placed any orders yet. Start shopping to see your orders here!"
            action={
              <Button onClick={() => navigate('/')}>
                Start Shopping
              </Button>
            }
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
    </div>
  )
}

export default OrdersPage
