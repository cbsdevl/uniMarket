-- =====================================================
-- DISCOUNT SETTINGS - Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create settings table
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
-- Allow anyone to read settings (needed for checkout)
CREATE POLICY "Anyone can read settings" ON settings
  FOR SELECT USING (true);

-- Allow only admins to manage settings
CREATE POLICY "Admins can manage settings" ON settings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. Insert default discount settings
INSERT INTO settings (key, value, description) VALUES
('full_payment_discount_enabled', 'true', 'Enable discount for full payment'),
('full_payment_discount_percent', '5', 'Discount percentage for full payment')
ON CONFLICT (key) DO NOTHING;

-- 5. Create function to get setting value
CREATE OR REPLACE FUNCTION get_setting(p_key TEXT)
RETURNS TEXT AS $$
DECLARE
  v_value TEXT;
BEGIN
  SELECT value INTO v_value FROM settings WHERE key = p_key;
  RETURN v_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
