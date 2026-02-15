import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, ORDER_STATUS } from '../lib/supabase'

const OrderContext = createContext(null)

export const useOrders = () => {
  const context = useContext(OrderContext)
  if (!context) {
    throw new Error('useOrders must be used within OrderProvider')
  }
  return context
}

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchOrders = async (userId = null) => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { data, error } = await query

      if (error) throw error

      setOrders(data || [])
    } catch (err) {
      console.error('Error fetching orders:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createOrder = async (orderData) => {
    setLoading(true)
    setError(null)
    try {
      const { items, paymentMethod, deliveryAddress, phone, userId, depositAmount, totalAmount } = orderData

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          status: ORDER_STATUS.PENDING_PAYMENT,
          payment_method: paymentMethod,
          total_amount: totalAmount,
          deposit_amount: depositAmount || 0,
          balance_due: totalAmount - (depositAmount || 0),
          delivery_address: deliveryAddress,
          phone
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        supplier_price: item.supplier_price,
        subtotal: item.price * item.quantity
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Fetch the complete order with items
      const { data: completeOrder } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          )
        `)
        .eq('id', order.id)
        .single()

      setOrders(prev => [completeOrder, ...prev])

      return { success: true, order: completeOrder }
    } catch (err) {
      console.error('Error creating order:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)

      if (error) throw error

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )

      return { success: true }
    } catch (err) {
      console.error('Error updating order:', err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setLoading(false)
    }
  }

  const calculateProfit = (order) => {
    if (!order.order_items) return 0
    return order.order_items.reduce((total, item) => {
      const cost = item.supplier_price || 0
      const profit = (item.unit_price - cost) * item.quantity
      return total + profit
    }, 0)
  }

  const value = {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrderStatus,
    calculateProfit
  }

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  )
}
