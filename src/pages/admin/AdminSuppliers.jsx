import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Search, Phone, Mail, MapPin } from 'lucide-react'
import AdminSidebar from '../../components/layout/AdminSidebar'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Modal from '../../components/common/Modal'
import { supabase } from '../../lib/supabase'

const AdminSuppliers = () => {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: ''
  })

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchSuppliers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSuppliers(data || [])
    } catch (err) {
      console.error('Error fetching suppliers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingSupplier) {
        const { error } = await supabase
          .from('suppliers')
          .update(formData)
          .eq('id', editingSupplier.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('suppliers')
          .insert([formData])
        
        if (error) throw error
      }

      setShowModal(false)
      setEditingSupplier(null)
      resetForm()
      fetchSuppliers()
    } catch (err) {
      console.error('Error saving supplier:', err)
      alert(err.message)
    }
  }

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (supplierId) => {
    if (!confirm('Are you sure you want to delete this supplier?')) return

    try {
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', supplierId)

      if (error) throw error
      fetchSuppliers()
    } catch (err) {
      console.error('Error deleting supplier:', err)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      contact_person: '',
      phone: '',
      email: '',
      address: ''
    })
  }

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.contact_person?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
            <p className="text-gray-500 mt-1">Manage your supplier contacts</p>
          </div>
          <Button onClick={() => {
            setEditingSupplier(null)
            resetForm()
            setShowModal(true)
          }}>
            <Plus className="w-5 h-5 mr-2" />
            Add Supplier
          </Button>
        </div>

        <Card className="p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No suppliers found</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{supplier.name}</h3>
                    <p className="text-sm text-gray-500">{supplier.contact_person}</p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(supplier)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(supplier.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{supplier.email}</span>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{supplier.address}</span>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingSupplier(null)
        }}
        title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Company Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          
          <Input
            label="Contact Person"
            value={formData.contact_person}
            onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
          />

          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {editingSupplier ? 'Update' : 'Add'} Supplier
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default AdminSuppliers
