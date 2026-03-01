import { useState, useEffect } from 'react'
import { Search, MessageSquare, Star, CheckCircle, XCircle, AlertCircle, Clock, Send } from 'lucide-react'
import AdminSidebar from '../../components/layout/AdminSidebar'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import Badge from '../../components/common/Badge'
import { supabase } from '../../lib/supabase'
import { formatDistanceToNow } from '../../utils/helpers'

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedFeedback, setSelectedFeedback] = useState(null)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchFeedback()
  }, [])

  const fetchFeedback = async () => {
    setLoading(true)
    try {
      // First, fetch all feedback
      const { data: feedbackData, error: feedbackError } = await supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false })

      if (feedbackError) throw feedbackError

      // Get unique user IDs from feedback
      const userIds = [...new Set(feedbackData?.map(f => f.user_id).filter(Boolean))]

      let profilesMap = {}
      
      // If there are user IDs, fetch profiles
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', userIds)

        if (!profilesError && profilesData) {
          // Create a map of user_id to profile
          profilesData.forEach(profile => {
            profilesMap[profile.id] = profile
          })
        }
      }

      // Fetch products for feedback with product_id
      const productIds = [...new Set(feedbackData?.map(f => f.product_id).filter(Boolean))]
      let productsMap = {}

      if (productIds.length > 0) {
        const { data: productsData } = await supabase
          .from('products')
          .select('id, name')
          .in('id', productIds)

        if (productsData) {
          productsData.forEach(product => {
            productsMap[product.id] = product
          })
        }
      }

      // Merge feedback with profiles and products data
      const mergedData = feedbackData?.map(item => ({
        ...item,
        profiles: profilesMap[item.user_id] || null,
        products: productsMap[item.product_id] || null
      })) || []

      setFeedback(mergedData)
    } catch (err) {
      console.error('Error fetching feedback:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ status: newStatus, updated_at: new Date() })
        .eq('id', id)

      if (error) throw error
      fetchFeedback()
    } catch (err) {
      console.error('Error updating feedback status:', err)
    }
  }

  const handleSubmitResponse = async () => {
    if (!responseText.trim() || !selectedFeedback) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('feedback')
        .update({ 
          admin_response: responseText.trim(),
          status: 'resolved',
          updated_at: new Date()
        })
        .eq('id', selectedFeedback.id)

      if (error) throw error

      setShowResponseModal(false)
      setResponseText('')
      setSelectedFeedback(null)
      fetchFeedback()
    } catch (err) {
      console.error('Error submitting response:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const filteredFeedback = feedback.filter(item => {
    const matchesSearch = 
      item.comment?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.products?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    const matchesType = typeFilter === 'all' || item.feedback_type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusBadge = (status) => {
    const configs = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      reviewed: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Reviewed' },
      resolved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Resolved' }
    }
    const config = configs[status] || configs.pending
    return <Badge className={config.color} icon={config.icon}>{config.label}</Badge>
  }

  const getTypeBadge = (type) => {
    const configs = {
      general: { color: 'bg-gray-100 text-gray-800', label: 'General' },
      product: { color: 'bg-purple-100 text-purple-800', label: 'Product' },
      service: { color: 'bg-blue-100 text-blue-800', label: 'Service' },
      bug: { color: 'bg-red-100 text-red-800', label: 'Bug' },
      feature: { color: 'bg-green-100 text-green-800', label: 'Feature' }
    }
    const config = configs[type] || configs.general
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Customer Feedback</h1>
              <p className="text-slate-500 mt-1">Manage and respond to customer feedback</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={fetchFeedback} variant="secondary">
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{feedback.length}</p>
                  <p className="text-sm text-slate-500">Total Feedback</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {feedback.filter(f => f.status === 'pending').length}
                  </p>
                  <p className="text-sm text-slate-500">Pending</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {feedback.filter(f => f.status === 'reviewed').length}
                  </p>
                  <p className="text-sm text-slate-500">Reviewed</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {feedback.filter(f => f.status === 'resolved').length}
                  </p>
                  <p className="text-sm text-slate-500">Resolved</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Search feedback..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="resolved">Resolved</option>
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="general">General</option>
                <option value="product">Product</option>
                <option value="service">Service</option>
                <option value="bug">Bug</option>
                <option value="feature">Feature</option>
              </select>
            </div>
          </Card>

          {/* Feedback List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : filteredFeedback.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No feedback found</h3>
              <p className="text-slate-500">No feedback matches your search criteria</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredFeedback.map((item) => (
                <Card key={item.id} className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-3 lg:w-56 flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                        {item.profiles?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 text-base truncate" title={item.profiles?.name || 'Unknown User'}>
                          {item.profiles?.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-slate-500 truncate">{item.profiles?.email || 'No email'}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatDistanceToNow(item.created_at)}</p>
                      </div>
                    </div>


                    {/* Feedback Content */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {getTypeBadge(item.feedback_type)}
                        {getStatusBadge(item.status)}
                        {item.rating > 0 && renderStars(item.rating)}
                      </div>

                      {item.products?.name && (
                        <p className="text-sm text-slate-500 mb-2">
                          Product: <span className="font-medium text-slate-700">{item.products.name}</span>
                        </p>
                      )}

                      <p className="text-slate-700 mb-3">{item.comment}</p>

                      {item.admin_response && (
                        <div className="bg-blue-50 rounded-lg p-3 mt-3 border border-blue-100">
                          <p className="text-sm font-medium text-blue-900 mb-1">Admin Response:</p>
                          <p className="text-sm text-blue-800">{item.admin_response}</p>
                        </div>
                      )}

                    </div>

                    {/* Actions */}
                    <div className="flex flex-row lg:flex-col gap-2">
                      {item.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleStatusUpdate(item.id, 'reviewed')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Reviewed
                        </Button>
                      )}
                      
                      {(item.status === 'pending' || item.status === 'reviewed') && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedFeedback(item)
                            setResponseText(item.admin_response || '')
                            setShowResponseModal(true)
                          }}
                        >
                          <Send className="w-4 h-4 mr-1" />
                          Respond
                        </Button>
                      )}

                      {item.status !== 'resolved' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-green-600 hover:bg-green-50"
                          onClick={() => handleStatusUpdate(item.id, 'resolved')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Response Modal */}
      <Modal
        isOpen={showResponseModal}
        onClose={() => {
          setShowResponseModal(false)
          setSelectedFeedback(null)
          setResponseText('')
        }}
        title="Respond to Feedback"
      >
        <div className="space-y-4">
          {selectedFeedback && (
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-2">Original feedback:</p>
              <p className="text-slate-800">{selectedFeedback.comment}</p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Your Response
            </label>
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={4}
              placeholder="Type your response to the customer..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowResponseModal(false)
                setSelectedFeedback(null)
                setResponseText('')
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitResponse}
              disabled={!responseText.trim() || submitting}
              className="flex-1"
            >
              {submitting ? 'Sending...' : 'Send Response'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminFeedback
