import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, CreditCard, Phone, User, Hash, MessageSquare, ToggleLeft, ToggleRight } from 'lucide-react'
import AdminSidebar from '../../components/layout/AdminSidebar'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import Badge from '../../components/common/Badge'
import { supabase } from '../../lib/supabase'

const AdminPaymentAccounts = () => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [formData, setFormData] = useState({
    provider: 'MTN',
    account_name: '',
    account_phone: '',
    account_code: '',
    instructions: '',
    is_active: true
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('payment_accounts')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      setAccounts(data || [])
    } catch (err) {
      console.error('Error fetching payment accounts:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (account = null) => {
    if (account) {
      setEditingAccount(account)
      setFormData({
        provider: account.provider,
        account_name: account.account_name,
        account_phone: account.account_phone,
        account_code: account.account_code || '',
        instructions: account.instructions || '',
        is_active: account.is_active
      })
    } else {
      setEditingAccount(null)
      setFormData({
        provider: 'MTN',
        account_name: '',
        account_phone: '',
        account_code: '',
        instructions: '',
        is_active: true
      })
    }
    setError(null)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingAccount(null)
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (editingAccount) {
        // Update existing account
        const { error } = await supabase
          .from('payment_accounts')
          .update({
            provider: formData.provider,
            account_name: formData.account_name,
            account_phone: formData.account_phone,
            account_code: formData.account_code,
            instructions: formData.instructions,
            is_active: formData.is_active,
            updated_at: new Date()
          })
          .eq('id', editingAccount.id)

        if (error) throw error
      } else {
        // Create new account
        const { error } = await supabase
          .from('payment_accounts')
          .insert([{
            provider: formData.provider,
            account_name: formData.account_name,
            account_phone: formData.account_phone,
            account_code: formData.account_code,
            instructions: formData.instructions,
            is_active: formData.is_active,
            display_order: accounts.length + 1
          }])

        if (error) throw error
      }

      fetchAccounts()
      handleCloseModal()
    } catch (err) {
      console.error('Error saving payment account:', err)
      setError('Failed to save payment account. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment account?')) return

    try {
      const { error } = await supabase
        .from('payment_accounts')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchAccounts()
    } catch (err) {
      console.error('Error deleting payment account:', err)
      alert('Failed to delete payment account')
    }
  }

  const handleToggleActive = async (account) => {
    try {
      const { error } = await supabase
        .from('payment_accounts')
        .update({ is_active: !account.is_active, updated_at: new Date() })
        .eq('id', account.id)

      if (error) throw error
      fetchAccounts()
    } catch (err) {
      console.error('Error toggling payment account:', err)
    }
  }

  const getProviderBadge = (provider) => {
    const configs = {
      MTN: { color: 'bg-yellow-500 text-white', label: 'MTN' },
      AIRTEL: { color: 'bg-red-500 text-white', label: 'Airtel' }
    }
    const config = configs[provider] || configs.MTN
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.label}</span>
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Payment Accounts</h1>
              <p className="text-slate-500 mt-1">Manage mobile money payment accounts for customers</p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={fetchAccounts} variant="secondary">
                Refresh
              </Button>
              <Button onClick={() => handleOpenModal()}>
                <Plus className="w-5 h-5 mr-2" />
                Add Account
              </Button>
            </div>
          </div>

          {/* Accounts List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : accounts.length === 0 ? (
            <Card className="p-12 text-center">
              <CreditCard className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No Payment Accounts</h3>
              <p className="text-slate-500 mb-4">Add payment accounts so customers can pay via mobile money</p>
              <Button onClick={() => handleOpenModal()}>
                <Plus className="w-5 h-5 mr-2" />
                Add First Account
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account) => (
                <Card key={account.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      {getProviderBadge(account.provider)}
                      {account.is_active ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleActive(account)}
                      className="text-slate-400 hover:text-slate-600"
                      title={account.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {account.is_active ? (
                        <ToggleRight className="w-6 h-6 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Account Name</p>
                        <p className="font-medium text-slate-900">{account.account_name}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Phone Number</p>
                        <p className="font-medium text-slate-900">{account.account_phone}</p>
                      </div>
                    </div>

                    {account.account_code && (
                      <div className="flex items-center gap-3">
                        <Hash className="w-5 h-5 text-slate-400" />
                        <div>
                          <p className="text-xs text-slate-500">USSD Code</p>
                          <p className="font-medium text-slate-900">{account.account_code}</p>
                        </div>
                      </div>
                    )}

                    {account.instructions && (
                      <div className="flex items-start gap-3">
                        <MessageSquare className="w-5 h-5 text-slate-400 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500">Instructions</p>
                          <p className="text-sm text-slate-700">{account.instructions}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleOpenModal(account)}
                      className="flex-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleDelete(account.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title={editingAccount ? 'Edit Payment Account' : 'Add Payment Account'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Payment Provider
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, provider: 'MTN' })}
                className={`p-3 rounded-lg border-2 text-center transition-colors ${
                  formData.provider === 'MTN'
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="font-medium">MTN</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, provider: 'AIRTEL' })}
                className={`p-3 rounded-lg border-2 text-center transition-colors ${
                  formData.provider === 'AIRTEL'
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <span className="font-medium">Airtel</span>
              </button>
            </div>
          </div>

          <Input
            label="Account Name"
            value={formData.account_name}
            onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
            placeholder="e.g., UniMarket Business"
            required
          />

          <Input
            label="Account Phone Number"
            value={formData.account_phone}
            onChange={(e) => setFormData({ ...formData, account_phone: e.target.value })}
            placeholder="e.g., 0788 000 000"
            required
          />

          <Input
            label="USSD Code (Optional)"
            value={formData.account_code}
            onChange={(e) => setFormData({ ...formData, account_code: e.target.value })}
            placeholder="e.g., *182*7*1#"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Instructions (Optional)
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={3}
              placeholder="How to make payment..."
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">Active (visible to customers)</span>
          </label>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseModal}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1"
            >
              {saving ? 'Saving...' : editingAccount ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminPaymentAccounts
