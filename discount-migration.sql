-- Migration: Add discount_amount and discounted_unit_price columns to orders and order_items tables
-- Run this in Supabase SQL Editor

-- Add discount_amount column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;

-- Add discount_amount column to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;

-- Add discounted_unit_price column to order_items table
ALTER TABLE order_items 
ADD COLUMN IF NOT EXISTS discounted_unit_price DECIMAL(10, 2);
