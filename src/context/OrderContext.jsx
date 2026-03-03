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
      const { items, paymentMethod, deliveryAddress, phone, userId, depositAmount, totalAmount, discountAmount = 0, paymentProvider, paymentName, paymentPhone } = orderData

      // Calculate payment amount
      const paymentAmount = paymentMethod === 'DEPOSIT' ? depositAmount : totalAmount
      const isMobileMoney = paymentProvider && paymentProvider !== 'CASH'

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          status: ORDER_STATUS.PENDING_PAYMENT,
          payment_method: paymentMethod,
          payment_provider: paymentProvider || null,
          payment_name: paymentName || null,
          payment_phone: paymentPhone || null,
          payment_status: isMobileMoney ? 'PENDING' : null,
          total_amount: totalAmount,
          discount_amount: discountAmount,
          deposit_amount: depositAmount || 0,
          balance_due: totalAmount - (depositAmount || 0),
          delivery_address: deliveryAddress,
          phone
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Calculate discount per item (proportional to item price)
      const cartTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      
      const orderItems = items.map(item => {
        const itemTotal = item.price * item.quantity
        const itemDiscountRatio = cartTotal > 0 ? itemTotal / cartTotal : 0
        const itemDiscountAmount = discountAmount * itemDiscountRatio
        
        // Calculate the discounted unit price (actual selling price after discount)
        const discountPercent = cartTotal > 0 ? discountAmount / cartTotal : 0
        const discountedUnitPrice = item.price * (1 - discountPercent)
        
        return {
          order_id: order.id,
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price,
          discounted_unit_price: discountedUnitPrice,
          supplier_price: item.supplier_price || 0,
          discount_amount: itemDiscountAmount,
          subtotal: item.price * item.quantity
        }
      })

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // Create payment record if mobile money
      if (isMobileMoney && paymentAmount > 0) {
        const { error: paymentError } = await supabase
          .from('payments')
          .insert({
            order_id: order.id,
            amount: paymentAmount,
            method: paymentProvider,
            status: 'PENDING'
          })

        if (paymentError) {
          console.error('Error creating payment record:', paymentError)
        }
      }

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

  const updateOrderStatus = async (orderId, newStatus, paymentStatus = null) => {
    setLoading(true)
    setError(null)
    try {
      const order = orders.find(o => o.id === orderId)
      let profit = 0
      let updateData = { status: newStatus }

      // Add payment status if provided
      if (paymentStatus) {
        updateData.payment_status = paymentStatus

        // Update payment record in payments table
        await supabase
          .from('payments')
          .update({ 
            status: paymentStatus === 'VERIFIED' ? 'CONFIRMED' : 'FAILED'
          })
          .eq('order_id', orderId)
      }

      if (newStatus === 'DELIVERED' && order?.order_items) {
        // Calculate profit with discount consideration
        profit = order.order_items.reduce((sum, item) => {
          const cost = item.supplier_price || 0
          // Use discounted_unit_price if available (full payment with discount)
          // Otherwise use unit_price (regular price)
          const sellingPrice = item.discounted_unit_price || item.unit_price
          // Profit = (discounted_selling_price - supplier_price) * quantity
          return sum + ((sellingPrice - cost) * item.quantity)
        }, 0)
        updateData.profit = profit
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId)

      if (error) throw error

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, ...updateData } : order
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
      // Use discounted_unit_price if available (full payment with discount)
      // Otherwise use unit_price (regular price)
      const sellingPrice = item.discounted_unit_price || item.unit_price
      // Profit = (discounted_selling_price - supplier_price) * quantity
      const profit = (sellingPrice - cost) * item.quantity
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
