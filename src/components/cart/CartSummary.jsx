import { formatCurrency } from '../../utils/helpers'
import Button from '../common/Button'

const CartSummary = ({ subtotal, discount, total, onCheckout, loading, children }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
      <h3 className="font-semibold text-gray-900">Order Summary</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount (5%)</span>
            <span>-{formatCurrency(discount)}</span>
          </div>
        )}
        
        <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      {children}

      {onCheckout && (
        <Button
          onClick={onCheckout}
          loading={loading}
          className="w-full"
          size="lg"
        >
          Proceed to Checkout
        </Button>
      )}
    </div>
  )
}

export default CartSummary
