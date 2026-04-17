-- Admin Access Codes SQL for Supabase
-- Run this in Supabase SQL Editor to setup/fix PIN access

-- Enable UUID if needed (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create table if not exists
CREATE TABLE IF NOT EXISTS access_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  responsibility TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS: Enable anonymous SELECT for PIN lookup
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anonymous PIN lookup" ON access_codes;
CREATE POLICY "Allow anonymous PIN lookup" ON access_codes 
  FOR SELECT USING (true);

-- Insert codes (ON CONFLICT ignores duplicates)
INSERT INTO access_codes (responsibility, code, description, is_active) VALUES
  ('super-admin', '0000', 'Full Admin Access - All Pages', true),
  ('finance', '1234', 'Finance Manager - Finance/Reports/Payments', true),
  ('delivery', '5678', 'Delivery Team - Delivery/Scanner', true),
  ('orders', '9012', 'Orders Manager - Orders', true)
ON CONFLICT (code) DO NOTHING;

-- Verify (run to check)
-- SELECT * FROM access_codes WHERE is_active = true;

