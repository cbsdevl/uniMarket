import { Package, ShoppingCart, FileQuestion } from 'lucide-react'

const EmptyState = ({ type = 'default', title, message, action }) => {
  const icons = {
    cart: ShoppingCart,
    product: Package,
    order: FileQuestion,
    default: Package
  }

  const Icon = icons[type] || icons.default

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title || 'Nothing here yet'}
      </h3>
      <p className="text-gray-500 mb-6 max-w-sm">
        {message || 'There\'s nothing to display at the moment.'}
      </p>
      {action && (
        <div>{action}</div>
      )}
    </div>
  )
}

export default EmptyState
