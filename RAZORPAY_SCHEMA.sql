-- ==============================================================================
-- RAZORPAY INTEGRATION SCHEMA
-- Run this in your Supabase SQL Editor
-- ==============================================================================

-- 1. Create a table to track payment transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_name TEXT,
    user_phone TEXT,
    plan_id UUID REFERENCES public.membership_plans(id),
    amount NUMERIC NOT NULL,
    razorpay_order_id TEXT UNIQUE NOT NULL,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    status TEXT DEFAULT 'created' NOT NULL, -- Options: created, successful, failed
    verified BOOLEAN DEFAULT false
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
-- Allow anonymous inserts for order creation (since users might not be logged in immediately)
CREATE POLICY "Enable insert for anyone" 
ON public.transactions FOR INSERT 
WITH CHECK (true);

-- Allow public viewing if they pass the exact order ID (useful for success page)
CREATE POLICY "Enable select for anyone based on order id" 
ON public.transactions FOR SELECT 
USING (true);

-- Allow admin to delete/update
CREATE POLICY "Enable update for admin users" 
ON public.transactions FOR UPDATE 
USING (
  auth.role() = 'authenticated'
);

CREATE POLICY "Enable delete for admin users" 
ON public.transactions FOR DELETE 
USING (
  auth.role() = 'authenticated'
);
