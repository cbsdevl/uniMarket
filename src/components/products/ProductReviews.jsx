import { useState, useEffect } from 'react'
import { Star, MessageSquare, User } from 'lucide-react'
import Card from '../common/Card'
import { supabase } from '../../lib/supabase'
import { formatDistanceToNow } from '../../utils/helpers'

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, average: 0, distribution: {} })

  useEffect(() => {
    if (productId) {
      fetchReviews()
    }
  }, [productId])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      // Fetch product feedback - works for both logged in and anonymous users
      const { data, error } = await supabase
        .from('feedback')
        .select(`
          *,
          profiles:user_id (name)
        `)
        .eq('product_id', productId)
        .eq('feedback_type', 'product')
        .in('status', ['reviewed', 'resolved'])
        .order('created_at', { ascending: false })

      if (error) throw error

      setReviews(data || [])
      
      // Calculate stats
      const total = data?.length || 0
      const sum = data?.reduce((acc, r) => acc + (r.rating || 0), 0) || 0
      const average = total > 0 ? (sum / total).toFixed(1) : 0
      
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      data?.forEach(r => {
        if (r.rating) distribution[r.rating]++
      })

      setStats({ total, average, distribution })
    } catch (err) {
      console.error('Error fetching reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      </Card>
    )
  }

  if (reviews.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-6">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 mb-1">No Reviews Yet</h3>
          <p className="text-slate-500 text-sm">Be the first to review this product!</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Rating Summary */}
      <Card className="p-6">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-4xl font-bold text-slate-900">{stats.average}</p>
            <div className="flex justify-center my-1">
              {renderStars(Math.round(stats.average))}
            </div>
            <p className="text-sm text-slate-500">{stats.total} reviews</p>
          </div>
          
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.distribution[star] || 0
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="w-3 text-slate-600">{star}</span>
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-500 text-xs">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900">Customer Reviews</h3>
        {reviews.map((review) => (
          <Card key={review.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                {review.profiles?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-slate-900">
                    {review.profiles?.name || 'Anonymous User'}
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(review.created_at)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(review.rating)}
                  <span className="text-sm font-medium text-slate-700">
                    {review.rating}/5
                  </span>
                </div>
                
                <p className="text-slate-700 text-sm leading-relaxed">
                  {review.comment}
                </p>

                {review.admin_response && (
                  <div className="mt-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
                    <p className="text-xs font-medium text-blue-900 mb-1">Store Response:</p>
                    <p className="text-sm text-blue-800">{review.admin_response}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default ProductReviews
