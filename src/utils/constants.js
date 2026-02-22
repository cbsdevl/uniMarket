// Categories - Default categories (used as fallback when DB is unavailable)
export const DEFAULT_CATEGORIES = [
  { id: 'flash-disks', name: 'Flash Disks', slug: 'flash-disks', icon: 'HardDrive', display_order: 1 },
  { id: 'chargers', name: 'Chargers', slug: 'chargers', icon: 'Zap', display_order: 2 },
  { id: 'notes', name: 'Notes', slug: 'notes', icon: 'BookOpen', display_order: 3 },
  { id: 'power-banks', name: 'Power Banks', slug: 'power-banks', icon: 'Battery', display_order: 4 },
  { id: 'others', name: 'Others', slug: 'others', icon: 'Package', display_order: 5 }
]

// Legacy export for backward compatibility
export const CATEGORIES = DEFAULT_CATEGORIES


// Order status labels and colors
export const ORDER_STATUS_CONFIG = {
  PENDING_PAYMENT: { label: 'Pending Payment', color: 'bg-yellow-100 text-yellow-800', icon: 'Clock' },
  PENDING_CONFIRMATION: { label: 'Pending Confirmation', color: 'bg-orange-100 text-orange-800', icon: 'Hourglass' },
  CONFIRMED: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: 'CheckCircle' },
  SOURCED: { label: 'Sourced', color: 'bg-purple-100 text-purple-800', icon: 'Truck' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-indigo-100 text-indigo-800', icon: 'MapPin' },
  DELIVERED: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: 'PackageCheck' },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: 'XCircle' }
}

// Payment method labels
export const PAYMENT_METHOD_CONFIG = {
  DEPOSIT: { label: 'Deposit First', description: 'Pay deposit now, balance on delivery', discount: 0 },
  COD: { label: 'Cash on Delivery', description: 'Pay on delivery (campus only)', discount: 0 },
  FULL: { label: 'Full Payment', description: 'Pay full amount now & get discount', discount: 5 }
}

// Campus locations
export const CAMPUS_LOCATIONS = [
  'Main Campus - Kigali',
  'Kigali Campus',
  'Huye Campus',
  'Muhanga Campus',
  'Other'
]

// Default product images
export const DEFAULT_PRODUCT_IMAGE = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'

// Mobile breakpoint
export const MOBILE_BREAKPOINT = 768
