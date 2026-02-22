import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Send, Star, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react'
import Header from '../../components/layout/Header'
import BottomNav from '../../components/layout/BottomNav'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

const FeedbackPage = () => {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  
  const [formData, setFormData] = useState({
    feedback_type: 'general',
    rating: 0,
    comment: '',
    product_id: ''
  })
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error('Error fetching products:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!user) {
      setError('Please login to submit feedback')
      return
    }

    if (formData.rating === 0) {
      setError('Please select a rating')
      return
    }

    if (!formData.comment.trim()) {
      setError('Please enter your feedback')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const feedbackData = {
        user_id: user.id,
        product_id: formData.product_id || null,
        feedback_type: formData.feedback_type,
        rating: formData.rating,
        comment: formData.comment.trim(),
        status: 'pending'
      }

      const { error } = await supabase
        .from('feedback')
        .insert([feedbackData])

      if (error) throw error

      setSuccess(true)
      setFormData({
        feedback_type: 'general',
        rating: 0,
        comment: '',
        product_id: ''
      })

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      console.error('Error submitting feedback:', err)
      setError('Failed to submit feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const feedbackTypes = [
    { value: 'general', label: 'General Feedback', icon: MessageSquare },
    { value: 'product', label: 'Product Review', icon: Star },
    { value: 'service', label: 'Service Experience', icon: CheckCircle },
    { value: 'bug', label: 'Report a Bug', icon: AlertCircle },
    { value: 'feature', label: 'Feature Request', icon: MessageSquare }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header title="Feedback" showBack />
      
      <main className="p-4 max-w-2xl mx-auto">
        {/* Success Message */}
        {success && (
          <Card className="mb-4 bg-green-50 border-green-200">
            <div className="flex items-center gap-3 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">Thank you for your feedback!</p>
                <p className="text-sm">We appreciate your input and will review it shortly.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-4 bg-red-50 border-red-200">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Share Your Feedback</h1>
          <p className="text-gray-500 text-sm mb-6">
            We value your opinion. Help us improve by sharing your thoughts about our products and services.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Feedback Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {feedbackTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, feedback_type: type.value })}
                    className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-colors ${
                      formData.feedback_type === type.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <type.icon className="w-4 h-4" />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Selection (only for product feedback) */}
            {formData.feedback_type === 'product' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Product (Optional)
                </label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">General product feedback</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className={`p-2 rounded-lg transition-colors ${
                      formData.rating >= star
                        ? 'text-yellow-400 hover:text-yellow-500'
                        : 'text-gray-300 hover:text-gray-400'
                    }`}
                  >
                    <Star className={`w-8 h-8 ${formData.rating >= star ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {formData.rating > 0 ? `${formData.rating} out of 5 stars` : 'Click to rate'}
              </p>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Feedback
              </label>
              <textarea
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                rows={5}
                placeholder="Tell us about your experience, suggestions, or any issues you've encountered..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={submitting}
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Submit Feedback
                </div>
              )}
            </Button>
          </form>
        </Card>

        {/* Contact Info */}
        <Card className="mt-4 p-4 bg-blue-50 border-blue-100">
          <h3 className="font-medium text-blue-900 mb-1">Need immediate assistance?</h3>
          <p className="text-sm text-blue-700">
            Contact us at{' '}
            <a href="mailto:support@unimarket.rw" className="font-medium underline">
              support@unimarket.rw
            </a>{' '}
            or call{' '}
            <a href="tel:+250788123456" className="font-medium underline">
              +250 788 123 456
            </a>
          </p>
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}

export default FeedbackPage
