import { Plus, Minus, Trash2 } from 'lucide-react'
import { formatCurrency } from '../../utils/helpers'
import { DEFAULT_PRODUCT_IMAGE } from '../../utils/constants'

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  return (
    <div className="flex gap-3 p-3 bg-white rounded-xl border border-gray-100">
      {/* Image */}
      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        <img
          src={item.image_url || DEFAULT_PRODUCT_IMAGE}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = DEFAULT_PRODUCT_IMAGE
          }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
          {item.name}
        </h4>
        <p className="text-blue-600 font-bold text-sm mb-2">
          {formatCurrency(item.price)}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Minus className="w-4 h-4 text-gray-600" />
            </button>
            <span className="w-8 text-center font-medium text-gray-900">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="w-7 h-7 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <button
            onClick={() => onRemove(item.id)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Item total */}
      <div className="text-right">
        <p className="font-bold text-gray-900">
          {formatCurrency(item.price * item.quantity)}
        </p>
      </div>
    </div>
  )
}

export default CartItem
