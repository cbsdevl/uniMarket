import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scanner } from '@yudiel/react-qr-scanner'
import { Camera, CheckCircle, XCircle, ArrowLeft, Package } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import Card from '../../components/common/Card'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import { formatCurrency } from '../../utils/helpers'

const DeliveryScannerPage = () => {
  const navigate = useNavigate()
  const [scannedData, setScannedData] = useState(null)
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleScan = async (result) => {
    if (!result || !result[0]) return;
    const rawValue = result[0].rawValue;
    if (scannedData === rawValue || loading || success) return;
    setScannedData(rawValue);
    setError(null);
    setLoading(true);

    try {
      const payload = JSON.parse(rawValue)
      if (!payload.orderId || !payload.token) {
        throw new Error('Invalid QR Code format')
      }

      // Fetch order matching both ID and secure token
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            product:products (*)
          ),
          user:profiles (name)
        `)
        .eq('id', payload.orderId)
        .eq('qr_token', payload.token)
        .single()

      if (fetchError || !data) {
        throw new Error('Invalid or expired verification code')
      }

      if (data.status === 'DELIVERED') {
        throw new Error('This order has already been delivered.')
      }

      setOrder(data)
    } catch (err) {
      console.error(err)
      setError(err.message || 'Failed to verify QR Code')
      setTimeout(() => {
        setScannedData(null)
        setError(null)
      }, 3000)
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteDelivery = async () => {
    if (!order) return
    setLoading(true)
    try {
      let updateData = { status: 'DELIVERED' }
      
      if (order.order_items) {
        const profit = order.order_items.reduce((sum, item) => {
          const cost = item.product?.supplier_price || 0
          return sum + ((item.unit_price - cost) * item.quantity)
        }, 0)
        updateData.profit = profit
      }

      const { error: updateError } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id)

      if (updateError) throw updateError
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/admin/delivery')
      }, 2000)
    } catch (err) {
      console.error(err)
      setError('Failed to complete delivery')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col fixed inset-0 z-[100]">
      <div className="p-4 flex items-center justify-between z-10 bg-gradient-to-b from-black/80 to-transparent">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white/10 hover:bg-white/20 transition-colors rounded-full backdrop-blur-sm cursor-pointer z-50 relative"
          style={{ isolation: 'isolate' }}
        >
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="font-semibold text-lg z-50">Scan Delivery QR</h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 relative">
        {!order && !success && (
          <div className="absolute inset-0 z-0">
            <Scanner 
              onScan={handleScan}
              onError={(e) => console.log('Scanner error:', e)}
              components={{
                audio: false,
                finder: true
              }}
              styles={{
                container: { height: '100%' },
                video: { objectFit: 'cover' }
              }}
            />
            {loading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-10">
                <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full" />
              </div>
            )}
            {error && (
              <div className="absolute bottom-24 left-4 right-4 bg-red-500/90 text-white p-4 rounded-xl backdrop-blur-md text-center shadow-lg z-10 animate-fade-in">
                <XCircle className="w-8 h-8 mx-auto mb-2 opacity-80" />
                <p className="font-medium">{error}</p>
              </div>
            )}
            <div className="absolute bottom-12 left-0 right-0 text-center pointer-events-none z-10">
              <div className="inline-flex items-center gap-2 bg-black/50 text-white/90 px-4 py-2 rounded-full backdrop-blur-md text-sm">
                <Camera className="w-4 h-4" />
                Align QR code within frame
              </div>
            </div>
          </div>
        )}

        {order && !success && (
          <div className="absolute inset-0 bg-gray-50 text-black z-20 overflow-y-auto w-full h-full">
            <div className="p-4 pb-24 max-w-lg mx-auto">
              <div className="flex items-center justify-center mb-6 mt-8">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center shadow-sm">
                  <CheckCircle className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center mb-1 text-gray-900">Valid Code Scanned!</h2>
              <p className="text-center text-gray-500 mb-8">Order #{order.id.slice(0, 8).toUpperCase()} • {order.user?.name}</p>

              <Card className="p-4 mb-4 border shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4 text-gray-500" />
                  Order Contents
                </h3>
                <div className="space-y-3">
                  {order.order_items?.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-3">
                        <Badge variant="default" className="w-6 h-6 flex items-center justify-center p-0 rounded-full text-xs shrink-0">{item.quantity}</Badge>
                        <span className="text-gray-700 font-medium">{item.product?.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-5 mb-8 bg-blue-50 border-blue-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100 rounded-bl-full -z-10 opacity-50" />
                <div className="flex justify-between items-center mb-3">
                  <span className="text-gray-600 font-medium">Total Amount</span>
                  <span className="font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-blue-100">
                  <span className="text-blue-900 font-semibold whitespace-nowrap">Balance to Collect</span>
                  <span className="text-2xl font-black text-amber-600 bg-white px-3 py-1 rounded-xl shadow-sm border border-amber-50">
                    {formatCurrency(order.balance_due)}
                  </span>
                </div>
                {order.balance_due === 0 && (
                  <div className="mt-4 bg-green-100/50 p-2 rounded-lg border border-green-200/50">
                    <p className="text-sm text-green-700 font-semibold flex items-center justify-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Fully Paid - No Balance Due
                    </p>
                  </div>
                )}
              </Card>

              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
                <div className="max-w-lg mx-auto flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12"
                    onClick={() => {
                      setOrder(null);
                      setScannedData(null);
                    }}
                  >
                    Cancel Scan
                  </Button>
                  <Button 
                    variant="primary" 
                    className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
                    onClick={handleCompleteDelivery}
                    loading={loading}
                    disabled={loading}
                  >
                    Complete Delivery
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="absolute inset-0 bg-green-500 text-white z-50 flex flex-col items-center justify-center p-6 text-center w-full h-full">
            <div className="bg-white/20 p-4 rounded-full mb-6 relative">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping" />
              <CheckCircle className="w-20 h-20 relative z-10" />
            </div>
            <h2 className="text-3xl font-bold mb-2 tracking-tight">Delivery Complete!</h2>
            <p className="text-green-50 text-lg font-medium opacity-90">Order has been verified and closed.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default DeliveryScannerPage
