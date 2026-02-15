import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext(null)

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('unimarket_cart')
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (e) {
        console.error('Error parsing cart:', e)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('unimarket_cart', JSON.stringify(items))
  }, [items])

  const addToCart = (product, quantity = 1) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.id === product.id)
      if (existingItem) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { ...product, quantity }]
    })
  }

  const removeFromCart = (productId) => {
    setItems(prev => prev.filter(item => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getCartTotal = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  const getCartCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0)
  }

  const value = {
    items,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}
