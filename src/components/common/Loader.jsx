import { Loader2 } from 'lucide-react'

const Loader = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className={`${sizes[size]} animate-spin text-blue-600`} />
    </div>
  )
}

export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Loader size="lg" />
  </div>
)

export const InlineLoader = ({ text = 'Loading...' }) => (
  <div className="flex items-center justify-center gap-2 py-4">
    <Loader size="sm" />
    <span className="text-sm text-gray-500">{text}</span>
  </div>
)

export default Loader
