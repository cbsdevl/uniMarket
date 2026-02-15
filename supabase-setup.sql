-- UniMarket Database Schema for Supabase
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  campus TEXT,
  role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'admin', 'delivery')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10, 2) NOT NULL,
  deposit_amount DECIMAL(10, 2),
  supplier_price DECIMAL(10, 2),
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'PENDING_PAYMENT' CHECK (
    status IN (
      'PENDING_PAYMENT', 
      'PENDING_CONFIRMATION', 
      'CONFIRMED', 
      'SOURCED', 
      'OUT_FOR_DELIVERY', 
      'DELIVERED', 
      'CANCELLED'
    )
  ),
  payment_method TEXT CHECK (payment_method IN ('DEPOSIT', 'COD', 'FULL')),
  total_amount DECIMAL(10, 2) NOT NULL,
  deposit_amount DECIMAL(10, 2) DEFAULT 0,
  balance_due DECIMAL(10, 2) DEFAULT 0,
  delivery_address TEXT,
  phone TEXT,
  profit DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  method TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED', 'FAILED')),
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Products: Everyone can read active products, only admins can modify
CREATE POLICY "Anyone can read active products" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Suppliers: Only admins can manage
CREATE POLICY "Admins can manage suppliers" ON suppliers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Orders: Users can read their own orders, admins can read all
CREATE POLICY "Users can read own orders" ON orders
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Order Items: Same as orders
CREATE POLICY "Users can read own order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all order items" ON order_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Payments: Users can read their own payments, admins can manage
CREATE POLICY "Users can read own payments" ON payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE id = order_id AND user_id = auth.uid())
  );

CREATE POLICY "Admins can manage payments" ON payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- SEED DATA (for testing)
-- Insert sample products
INSERT INTO products (name, description, image_url, price, deposit_amount, supplier_price, category) VALUES
('USB Flash Drive 32GB', 'High-speed USB 3.0 flash drive, 32GB storage', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400', 2500, 1000, 1500, 'Flash Disks'),
('USB Flash Drive 64GB', 'High-speed USB 3.0 flash drive, 64GB storage', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400', 4000, 1500, 2500, 'Flash Disks'),
('USB Flash Drive 128GB', 'Premium USB 3.0 flash drive, 128GB storage', 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400', 7000, 2500, 4500, 'Flash Disks'),
('Fast Charger 20W', 'Universal fast charger with USB-C cable', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400', 3500, 1500, 2000, 'Chargers'),
('Wireless Charger Pad', '15W wireless charging pad for Qi devices', 'https://images.unsplash.com/photo-1591290619762-c588e3b59910?w=400', 5000, 2000, 3000, 'Chargers'),
('Car Charger Dual USB', 'Dual port car charger, 3.1A total output', 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400', 2500, 1000, 1500, 'Chargers'),
('Notebook A5 200 Pages', 'Spiral bound notebook, 200 ruled pages', 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400', 1500, 500, 800, 'Notes'),
('Notebook A4 400 Pages', 'Premium hardcover notebook, 400 pages', 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=400', 2500, 1000, 1500, 'Notes'),
('Exam Pad A4', 'Exam pad/answer sheet, 50 sheets pack', 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400', 1000, 400, 500, 'Notes'),
('Power Bank 10000mAh', 'Compact power bank with dual USB output', 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400', 6500, 2500, 4000, 'Power Banks'),
('Power Bank 20000mAh', 'High capacity power bank, fast charging', 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400', 10000, 4000, 6500, 'Power Banks'),
('Wireless Earbuds', 'Bluetooth 5.0 wireless earbuds with case', 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400', 8000, 3000, 5000, 'Others')
ON CONFLICT DO NOTHING;

-- Insert sample suppliers
INSERT INTO suppliers (name, contact_person, phone, email, address) VALUES
('TechWholesale Rwanda', 'Jean Mukamana', '+250788123456', 'jean@techwholesale.rw', 'Kigali, Rwanda'),
('Campus Supplies Ltd', 'Marie Uwimana', '+250788234567', 'marie@campusupplies.rw', 'Kigali, Rwanda'),
('Digital Gadgets Store', 'Claude Niyonkuru', '+250788345678', 'claude@digitalgadgets.rw', 'Kigali, Rwanda')
ON CONFLICT DO NOTHING;

-- Insert sample admin user (you need to create this user through Supabase Auth UI)
-- The profile will be created automatically when user signs up with role 'admin'
-- Then you can update their role manually in Supabase Dashboard
