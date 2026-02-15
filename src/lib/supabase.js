import { createClient } from '@supabase/supabase-js'

// These will be replaced with actual Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database table names
export const TABLES = {
  USERS: 'users',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  SUPPLIERS: 'suppliers',
  PAYMENTS: 'payments'
}

// Order statuses
export const ORDER_STATUS = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PENDING_CONFIRMATION: 'PENDING_CONFIRMATION',
  CONFIRMED: 'CONFIRMED',
  SOURCED: 'SOURCED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
}

// Payment methods
export const PAYMENT_METHOD = {
  DEPOSIT: 'DEPOSIT',
  COD: 'COD',
  FULL: 'FULL'
}

// User roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  DELIVERY: 'delivery'
}
