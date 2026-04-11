import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Shield, ArrowRight } from 'lucide-react'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Card from '../../components/common/Card'
import Loader from '../../components/common/Loader'
import { supabase } from '../../lib/supabase'

const RESPONSIBILITIES = ['finance', 'delivery', 'orders']

const PinLoginPage = () => {
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('access_codes')
        .select('responsibility, is_active')
        .eq('code', pin)
        .single()
        .then(result => ({ data: result.data, error: result.error }))

      if (error || !data) {
        setError('Invalid PIN code')
        setLoading(false)
        return
      }

      // Store PIN role in localStorage/session (will be used by AuthContext)
      localStorage.setItem('pinRole', data.responsibility)
      sessionStorage.setItem('pinRole', data.responsibility)
      
      // Redirect based on responsibility
      switch (data.responsibility) {
        case 'finance':
          navigate('/admin/finance')
          break
        case 'delivery':
          navigate('/admin/delivery')
          break
        case 'orders':
          navigate('/admin/orders')
          break
        default:
          navigate('/admin')
      }
    } catch (err) {
      setError('Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
            Admin Portal
          </h1>
          <p className="text-gray-600">Enter your access code</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Access Code (4 digits)
            </label>
            <Input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              maxLength={4}
              placeholder="1234"
              className="text-center text-2xl tracking-wider py-6 font-mono"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Available: Finance (1234) | Delivery (5678) | Orders (9012)
            </p>
          </div>

          <Button type="submit" className="w-full h-14 text-lg font-semibold" disabled={loading || pin.length < 4}>
            {loading ? (
              <>
                <Loader className="w-5 h-5" />
                <span>Accessing Portal...</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-5 h-5" />
                <span>Enter Portal</span>
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1 mx-auto"
          >
            <Lock className="w-4 h-4" />
            Use Email Login
          </button>
        </div>
      </Card>
    </div>
  )
}

export default PinLoginPage

