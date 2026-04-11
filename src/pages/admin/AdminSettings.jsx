import { useState, useEffect } from 'react'
import { Save, Percent, ToggleLeft, ToggleRight, Info } from 'lucide-react'
import AdminSidebar from '../../components/layout/AdminSidebar'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { supabase } from '../../lib/supabase'

const AdminSettings = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const [discountEnabled, setDiscountEnabled] = useState(true)
  const [discountPercent, setDiscountPercent] = useState(5)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')

      if (error) throw error

      // Set values from database
      const enabledSetting = data?.find(s => s.key === 'full_payment_discount_enabled')
      const percentSetting = data?.find(s => s.key === 'full_payment_discount_percent')

      if (enabledSetting) {
        setDiscountEnabled(enabledSetting.value === 'true')
      }
      if (percentSetting) {
        setDiscountPercent(parseInt(percentSetting.value) || 5)
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })

    try {
      // Update discount enabled setting
      const { error: enabledError } = await supabase
        .from('settings')
        .upsert({
          key: 'full_payment_discount_enabled',
          value: discountEnabled.toString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' })

      if (enabledError) throw enabledError

      // Update discount percent setting
      const { error: percentError } = await supabase
        .from('settings')
        .upsert({
          key: 'full_payment_discount_percent',
          value: discountPercent.toString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' })

      if (percentError) throw percentError

      setMessage({ type: 'success', text: 'Settings saved successfully!' })

      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err) {
      console.error('Error saving settings:', err)
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  // Calculate preview
  const examplePrice = 10000
  const discountAmount = discountEnabled ? (examplePrice * discountPercent / 100) : 0
  const finalPrice = examplePrice - discountAmount

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">


      <main className="flex-1 p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage application settings</p>
        </div>

        {/* Discount Settings */}
        <Card className="p-6 max-w-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Percent className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Full Payment Discount</h2>
              <p className="text-sm text-gray-500">Configure discount for customers who pay full amount upfront</p>
            </div>
          </div>

          {/* Enable/Disable Toggle */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900">Enable Discount</label>
                <p className="text-sm text-gray-500">Allow customers to get discount for full payment</p>
              </div>
              <button
                onClick={() => setDiscountEnabled(!discountEnabled)}
                className="flex items-center"
              >
                {discountEnabled ? (
                  <ToggleRight className="w-12 h-7 text-green-600" />
                ) : (
                  <ToggleLeft className="w-12 h-7 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {/* Discount Percentage */}
          <div className="mb-6">
            <Input
              label="Discount Percentage (%)"
              type="number"
              min="0"
              max="100"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(parseInt(e.target.value) || 0)}
              disabled={!discountEnabled}
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter a value between 0 and 100
            </p>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Preview</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Example Product Price:</span>
                <span className="font-medium">RWF {examplePrice.toLocaleString()}</span>
              </div>
              {discountEnabled ? (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discountPercent}%):</span>
                    <span>- RWF {discountAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold pt-2 border-t border-gray-200">
                    <span>Final Price:</span>
                    <span className="text-green-600">RWF {finalPrice.toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-gray-500">
                  <span>Final Price:</span>
                  <span>RWF {examplePrice.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Message */}
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
              }`}>
              {message.text}
            </div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            loading={saving}
            className="w-full"
          >
            <Save className="w-5 h-5 mr-2" />
            Save Settings
          </Button>
        </Card>
      </main>
    </div>
  )
}

export default AdminSettings