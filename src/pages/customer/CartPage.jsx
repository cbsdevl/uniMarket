import { useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import BottomNav from '../../components/layout/BottomNav'
import CartItem from '../../components/cart/CartItem'
import CartSummary from '../../components/cart/CartSummary'
import EmptyState from '../../components/common/EmptyState'
import Button from '../../components/common/Button'
import { useCart } from '../../context/CartContext'

const CartPage = () => {
  const navigate = useNavigate()
  const { items, updateQuantity, removeFromCart, getCartTotal, getCartCount } = useCart()
  const cartCount = getCartCount()
  const cartTotal = getCartTotal()

  const handleCheckout = () => {
    navigate('/checkout')
  }

  if (cartCount === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Cart" />
        <EmptyState
          type="cart"
          title="Your cart is empty"
          message="Looks like you haven't added anything to your cart yet."
          action={
            <Button onClick={() => navigate('/')}>
              Start Shopping
            </Button>
          }
        />
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title={`Cart (${cartCount})`} showCart={false} />
      
      <main className="p-4 space-y-4">
        {/* Cart Items */}
        <div className="space-y-3">
          {items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </div>

        {/* Summary */}
        <CartSummary
          subtotal={cartTotal}
          discount={0}
          total={cartTotal}
          onCheckout={handleCheckout}
        />
      </main>

      <BottomNav />
    </div>
  )
}

export default CartPage
