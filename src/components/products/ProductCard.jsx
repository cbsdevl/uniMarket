import { useNavigate } from 'react-router-dom'
import { Plus, Zap, HardDrive, Battery, BookOpen, Package } from 'lucide-react'
import Card from '../common/Card'
import { formatCurrency } from '../../utils/helpers'
import { DEFAULT_PRODUCT_IMAGE } from '../../utils/constants'
import { useCart } from '../../context/CartContext'

const categoryIcons = {
  'flash-disks': HardDrive,
  'chargers': Zap,
  'notes': BookOpen,
  'power-banks': Battery,
  'others': Package
}

const ProductCard = ({ product }) => {
  const navigate = useNavigate()
  const { addToCart } = useCart()

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart(product, 1)
  }

  const handleClick = () => {
    navigate(`/product/${product.id}`)
  }

  const CategoryIcon = categoryIcons[product.category] || Package

  return (
    <Card hover onClick={handleClick} className="overflow-hidden">
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        <img
          src={product.image_url || DEFAULT_PRODUCT_IMAGE}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = DEFAULT_PRODUCT_IMAGE
          }}
        />
        {/* Category badge */}
        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg">
          <CategoryIcon className="w-4 h-4 text-blue-600" />
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
          {product.name}
        </h3>
        
        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold text-blue-600">
            {formatCurrency(product.price)}
          </span>
        </div>

        {/* Deposit info */}
        {product.deposit_amount > 0 && (
          <div className="text-xs text-gray-500 mb-2">
            Deposit: {formatCurrency(product.deposit_amount)}
          </div>
        )}

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add to Cart
        </button>
      </div>
    </Card>
  )
}

export default ProductCard
