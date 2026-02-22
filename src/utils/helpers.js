// Format currency (RWF)
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Format date
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

// Format relative time (alias for formatDistanceToNow)
export const formatDistanceToNow = (date) => {
  return formatRelativeTime(date)
}

// Format relative time
export const formatRelativeTime = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'Just now'
}

// Calculate profit
export const calculateProfit = (orderItems, orders) => {
  return orderItems.reduce((total, item) => {
    const order = orders.find(o => o.id === item.order_id)
    if (order) {
      const profit = (item.unit_price - (item.supplier_price || 0)) * item.quantity
      return total + profit
    }
    return total
  }, 0)
}

// Calculate order totals
export const calculateOrderTotals = (items, paymentMethod) => {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const discount = paymentMethod === 'FULL' ? subtotal * 0.05 : 0
  const total = subtotal - discount
  
  return {
    subtotal,
    discount,
    total
  }
}

// Generate order ID
export const generateOrderId = () => {
  const prefix = 'ORD'
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// Validate phone number (Rwanda)
export const validatePhone = (phone) => {
  const rwandaPhoneRegex = /^(\+250|0)(7[2389]\d{7})$/
  return rwandaPhoneRegex.test(phone)
}

// Debounce function
export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}
