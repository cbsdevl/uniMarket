-- =====================================================
-- PAYMENT ACCOUNTS TABLE - Run this in Supabase SQL Editor
-- =====================================================

-- 1. Create the payment_accounts table
CREATE TABLE IF NOT EXISTS payment_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT NOT NULL CHECK (provider IN ('MTN', 'AIRTEL')),
  account_name TEXT NOT NULL,
  account_phone TEXT NOT NULL,
  account_code TEXT,
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_accounts_provider ON payment_accounts(provider);
CREATE INDEX IF NOT EXISTS idx_payment_accounts_active ON payment_accounts(is_active);

-- 3. Enable RLS
ALTER TABLE payment_accounts ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
-- Allow anyone to read active payment accounts (customers need this at checkout)
CREATE POLICY "Anyone can read active payment accounts" ON payment_accounts
  FOR SELECT USING (is_active = true);

-- Allow only admins to manage payment accounts
CREATE POLICY "Admins can manage payment accounts" ON payment_accounts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. Insert seed data (sample payment accounts)
INSERT INTO payment_accounts (provider, account_name, account_phone, account_code, instructions, is_active, display_order) VALUES
('MTN', 'UniMarket Business', '0788 000 000', '*182*7*1#', 'Dial *182*7*1# to pay', true, 1),
('AIRTEL', 'UniMarket Business', '0780 000 000', '*185*7*1#', 'Dial *185*7*1# to pay', true, 2)
ON CONFLICT DO NOTHING;
