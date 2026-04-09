-- Add a highly secure QR token column to the orders table.
-- We use uuid_generate_v4() so every order automatically receives a token on creation.
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS qr_token UUID DEFAULT uuid_generate_v4();

-- Once applied, existing orders will automatically receive a generated token,
-- and all new orders will have one transparently.
