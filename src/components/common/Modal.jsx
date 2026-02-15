import { X } from 'lucide-react'
import { useEffect } from 'react'

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full mx-4'
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal content */}
        <div className={`relative bg-white rounded-2xl shadow-xl w-full ${sizes[size]} transform transition-all`}>
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          )}
          
          {/* Body */}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Modal
