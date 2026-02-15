import { useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import Header from '../../components/layout/Header'
import BottomNav from '../../components/layout/BottomNav'
import ProductGrid from '../../components/products/ProductGrid'
import { supabase } from '../../lib/supabase'
import { CATEGORIES } from '../../utils/constants'

const HomePage = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory])

  const fetchProducts = async () => {
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_active', true)

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data, error } = await query

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="UniMarket">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 bg-gray-100 rounded-xl text-sm w-40 focus:w-56 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </Header>

      {/* Categories */}
      <div className="sticky top-[57px] z-30 bg-white border-b border-gray-100">
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <main className="p-4">
        <ProductGrid 
          products={filteredProducts} 
          loading={loading} 
          error={error}
          onRetry={fetchProducts}
        />
      </main>

      <BottomNav />
    </div>
  )
}

export default HomePage
