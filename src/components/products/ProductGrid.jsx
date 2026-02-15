import ProductCard from './ProductCard'
import { PageLoader, InlineLoader } from '../common/Loader'
import EmptyState from '../common/EmptyState'

const ProductGrid = ({ products, loading, error, onRetry }) => {
  if (loading) {
    return <PageLoader />
  }

  if (error) {
    return (
      <EmptyState
        type="product"
        title="Something went wrong"
        message={error}
        action={
          onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-xl"
            >
              Try Again
            </button>
          )
        }
      />
    )
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        type="product"
        title="No products found"
        message="There are no products available at the moment. Check back later!"
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}

export default ProductGrid
