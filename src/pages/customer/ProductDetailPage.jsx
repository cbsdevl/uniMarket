import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Plus, Minus, ShoppingCart, ArrowLeft, MessageSquare } from 'lucide-react'
import Header from '../../components/layout/Header'
import BottomNav from '../../components/layout/BottomNav'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import ProductReviews from '../../components/products/ProductReviews'
import { supabase } from '../../lib/supabase'
import { formatCurrency } from '../../utils/helpers'
import { DEFAULT_PRODUCT_IMAGE, PAYMENT_METHOD_CONFIG } from '../../utils/constants'
import { useCart } from '../../context/CartContext'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedPayment, setSelectedPayment] = useState('DEPOSIT')
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    fetchProduct()
  }, [id])

  const fetchProduct = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setProduct(data)
    } catch (err) {
      console.error('Error fetching product:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    addToCart(product, quantity)
    navigate('/cart')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Loading..." showBack />
        <div className="p-4 flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header title="Product Not Found" showBack />
        <div className="p-4 text-center">
          <p className="text-gray-500">This product doesn't exist.</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title={product.name} showBack />
      
      <main className="p-4">
        {/* Image */}
        <div className="aspect-square bg-white rounded-2xl overflow-hidden mb-4">
          <img
            src={product.image_url || DEFAULT_PRODUCT_IMAGE}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = DEFAULT_PRODUCT_IMAGE
            }}
          />
        </div>

        {/* Product Info */}
        <Card className="p-4 mb-4">
          {/* Category Badge */}
          {product.category && (
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full mb-3">
              {product.category}
            </span>
          )}
          <h1 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h1>
          <p className="text-gray-600 text-sm mb-4">{product.description}</p>
          
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(product.price)}
            </span>
          </div>

          {product.deposit_amount > 0 && (
            <div className="bg-amber-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Deposit: </span>
                {formatCurrency(product.deposit_amount)}
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Pay deposit now, balance on delivery
              </p>
            </div>
          )}
        </Card>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-colors ${
              activeTab === 'details'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'reviews'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Reviews
          </button>
        </div>

        {activeTab === 'details' ? (
          <>
            {/* Payment Methods */}
            <Card className="p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Payment Options</h3>
              <div className="space-y-2">
                {Object.entries(PAYMENT_METHOD_CONFIG).map(([key, config]) => (
                  <label
                    key={key}
                    className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedPayment === key
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        value={key}
                        checked={selectedPayment === key}
                        onChange={(e) => setSelectedPayment(e.target.value)}
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

            {/* Quantity */}
            <Card className="p-4 mb-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Minus className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-xl font-bold text-gray-900 w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <Plus className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </Card>

            {/* Add to Cart Button */}
            <div className="sticky bottom-20 bg-white p-4 border-t border-gray-100">
              <Button
                onClick={handleAddToCart}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart - {formatCurrency(product.price * quantity)}
              </Button>
            </div>
          </>
        ) : (
          /* Reviews Tab */
          <ProductReviews productId={id} />
        )}
      </main>

      <BottomNav />
    </div>
  )
}

export default ProductDetailPage
