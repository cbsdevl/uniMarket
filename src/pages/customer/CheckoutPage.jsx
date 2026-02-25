import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/layout/Header'
import BottomNav from '../../components/layout/BottomNav'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useOrders } from '../../context/OrderContext'
import { formatCurrency } from '../../utils/helpers'
import { CAMPUS_LOCATIONS, PAYMENT_METHOD_CONFIG, PAYMENT_PROVIDER_CONFIG } from '../../utils/constants'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const { items, getCartTotal, clearCart } = useCart()
  const { user, profile } = useAuth()
  const { createOrder } = useOrders()
  
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('DEPOSIT')
  const [paymentProvider, setPaymentProvider] = useState('')
  const [paymentName, setPaymentName] = useState(profile?.name || '')
  const [paymentPhone, setPaymentPhone] = useState(profile?.phone || '')
  const [deliveryAddress, setDeliveryAddress] = useState(profile?.campus || '')
  const [phone, setPhone] = useState(profile?.phone || '')
  const [errors, setErrors] = useState({})

  const cartTotal = getCartTotal()
  const discount = paymentMethod === 'FULL' ? cartTotal * 0.05 : 0
  const total = cartTotal - discount
  const depositAmount = paymentMethod === 'DEPOSIT' ? items.reduce((sum, item) => sum + (item.deposit_amount || item.price * 0.3) * item.quantity, 0) : 0
  const balanceDue = total - depositAmount

  const showMobileMoneyFields = paymentProvider === 'MTN' || paymentProvider === 'AIRTEL'

  const validateForm = () => {
    const newErrors = {}
    if (!deliveryAddress) newErrors.deliveryAddress = 'Delivery address is required'
    if (!phone) newErrors.phone = 'Phone number is required'
    else if (phone.length < 10) newErrors.phone = 'Please enter a valid phone number'
    
    if (paymentProvider && paymentProvider !== 'CASH') {
      if (!paymentName) newErrors.paymentName = 'Your name is required'
      if (!paymentPhone) newErrors.paymentPhone = 'Mobile money phone is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    if (!user) {
      navigate('/login')
      return
    }

    setLoading(true)
    
    const orderData = {
      items,
      paymentMethod,
      deliveryAddress,
      phone,
      userId: user.id,
      depositAmount,
      totalAmount: total,
      paymentProvider: paymentProvider || 'CASH',
      paymentName: paymentName || null,
      paymentPhone: paymentPhone || null
    }

    const result = await createOrder(orderData)
    
    setLoading(false)
    
    if (result.success) {
      clearCart()
      navigate('/orders')
    } else {
      setErrors({ submit: result.error })
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <Header title="Checkout" showBack />
        <div className="p-4 text-center">
          <p className="text-gray-500">Your cart is empty</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Continue Shopping
          </Button>
        </div>
        <BottomNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Checkout" showBack />
      
      <main className="p-4 space-y-4">
        <form onSubmit={handleSubmit}>
          {/* Delivery Address */}
          <Card className="p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-4">Delivery Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Campus Location
                </label>
                <select
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select campus</option>
                  {CAMPUS_LOCATIONS.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                {errors.deliveryAddress && (
                  <p className="mt-1 text-sm text-red-500">{errors.deliveryAddress}</p>
                )}
              </div>

              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07xxxxxxxx"
                error={errors.phone}
              />
            </div>
          </Card>

          {/* Payment Method */}
          <Card className="p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
            
            <div className="space-y-2">
              {Object.entries(PAYMENT_METHOD_CONFIG).map(([key, config]) => (
                <label
                  key={key}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                    paymentMethod === key
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment"
                      value={key}
                      checked={paymentMethod === key}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{config.label}</p>
                      <p className="text-xs text-gray-500">{config.description}</p>
                    </div>
                  </div>
                  {key === 'FULL' && (
                    <span className="text-xs font-medium text-green-600">5% OFF</span>
                  )}
                </label>
              ))}
            </div>
          </Card>

          {/* Mobile Money Provider */}
          <Card className="p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-4">Select Payment Provider</h3>
            
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(PAYMENT_PROVIDER_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPaymentProvider(key)}
                  className={`p-3 rounded-lg border-2 text-center transition-colors ${
                    paymentProvider === key
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={{ 
                    backgroundColor: paymentProvider === key ? config.color : 'white',
                    color: paymentProvider === key ? config.textColor : '#374151'
                  }}
                >
                  <span className="block font-medium text-sm">{config.label}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* Mobile Money Details */}
          {showMobileMoneyFields && (
            <Card className="p-4 mb-4 border-2 border-blue-500">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Details</h3>
              
              <div className="space-y-4">
                <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  Pay to: <span className="font-bold">{paymentProvider === 'MTN' ? '0788 000 000' : '0780 000 000'}</span>
                </p>

                <Input
                  label="Your Name (as on mobile money)"
                  type="text"
                  value={paymentName}
                  onChange={(e) => setPaymentName(e.target.value)}
                  placeholder="Enter your name"
                  error={errors.paymentName}
                />

                <Input
                  label="Mobile Money Phone Number"
                  type="tel"
                  value={paymentPhone}
                  onChange={(e) => setPaymentPhone(e.target.value)}
                  placeholder="07xxxxxxxx"
                  error={errors.paymentPhone}
                />
              </div>
            </Card>
          )}

          {/* Order Summary */}
          <Card className="p-4 mb-4">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal ({items.length} items)</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>

              {paymentMethod === 'DEPOSIT' && (
                <>
                  <div className="flex justify-between text-amber-600 pt-2 border-t">
                    <span>Deposit to Pay Now</span>
                    <span>{formatCurrency(depositAmount)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Balance on Delivery</span>
                    <span>{formatCurrency(balanceDue)}</span>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Submit Button */}
          {errors.submit && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">
              {errors.submit}
            </div>
          )}

          <Button
            type="submit"
            loading={loading}
            className="w-full"
            size="lg"
          >
            Place Order - {formatCurrency(paymentMethod === 'DEPOSIT' ? depositAmount : total)}
          </Button>
        </form>
      </main>

      <BottomNav />
    </div>
  )
}

export default CheckoutPage
