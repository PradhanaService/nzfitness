-- NOIZE Fitness Database Schema
-- Run this entire script in Supabase SQL Editor

-- ============================================
-- TABLE: offers
-- Description: Store special offers and promotions
-- ============================================

CREATE TABLE IF NOT EXISTS public.offers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price_text TEXT NOT NULL,
    valid_till DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for offers table

-- Allow anyone to read active offers
CREATE POLICY "Enable read access for all users" ON public.offers
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert offers
CREATE POLICY "Enable insert for authenticated users" ON public.offers
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update offers
CREATE POLICY "Enable update for authenticated users" ON public.offers
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete offers
CREATE POLICY "Enable delete for authenticated users" ON public.offers
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- ============================================
-- TABLE: membership_plans
-- Description: Store gym membership plans
-- ============================================

CREATE TABLE IF NOT EXISTS public.membership_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    duration TEXT NOT NULL,
    tagline TEXT NOT NULL,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for membership_plans table

-- Allow anyone to read active plans
CREATE POLICY "Enable read access for all users" ON public.membership_plans
    FOR SELECT
    USING (true);

-- Allow authenticated users to insert plans
CREATE POLICY "Enable insert for authenticated users" ON public.membership_plans
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update plans
CREATE POLICY "Enable update for authenticated users" ON public.membership_plans
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete plans
CREATE POLICY "Enable delete for authenticated users" ON public.membership_plans
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- ============================================
-- FUNCTION: Limit offers to 5 per year
-- Description: Prevents creating more than 5 offers per calendar year
-- ============================================

CREATE OR REPLACE FUNCTION limit_offers_per_year()
RETURNS TRIGGER AS $$
DECLARE
    offer_count INTEGER;
BEGIN
    -- Count offers created in current year
    SELECT COUNT(*) INTO offer_count
    FROM public.offers
    WHERE created_at >= date_trunc('year', CURRENT_DATE);
    
    -- If already 5 or more, prevent insert
    IF offer_count >= 5 THEN
        RAISE EXCEPTION 'Maximum 5 offers allowed per year. You have reached the limit for %.', date_part('year', CURRENT_DATE);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce limit
DROP TRIGGER IF EXISTS check_offer_limit ON public.offers;
CREATE TRIGGER check_offer_limit
    BEFORE INSERT ON public.offers
    FOR EACH ROW
    EXECUTE FUNCTION limit_offers_per_year();

-- ============================================
-- INDEXES: Improve query performance
-- ============================================

-- Index for offers by active status and date
CREATE INDEX IF NOT EXISTS idx_offers_active_valid 
ON public.offers(is_active, valid_till) 
WHERE is_active = true;

-- Index for offers by creation date (for yearly limit check)
CREATE INDEX IF NOT EXISTS idx_offers_created_at 
ON public.offers(created_at);

-- Index for membership plans by active status and display order
CREATE INDEX IF NOT EXISTS idx_plans_active_order 
ON public.membership_plans(is_active, display_order) 
WHERE is_active = true;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- Description: Uncomment below to insert sample data
-- ============================================

-- Sample Membership Plans
/*
INSERT INTO public.membership_plans (name, price, duration, tagline, features, is_popular, is_active, display_order) VALUES
('Basic', 2460, '1 Month', 'Perfect for beginners', '["All Equipment Access", "Personal Training Session", "Locker Facility", "Free Assessment"]', false, true, 1),
('Standard', 4990, 'Pay 3M Train 6M', 'Best value for money', '["6 Months Training", "All Equipment Access", "Personal Training", "Diet Plan Included", "Weekend Activities"]', false, true, 2),
('Pro Choice', 7499, 'Pay 6M Train 9M', 'Most popular plan', '["9 Months Training", "All Equipment Access", "Personal Training", "Custom Diet Plan", "Weekend Activities", "Priority Support"]', true, true, 3),
('Elite Annual', 12260, 'Pay 1Y Train 1.5Y', 'Ultimate transformation', '["1.5 Years Training", "All Equipment Access", "Dedicated Trainer", "Custom Diet Plan", "Weekend Activities", "Priority Support", "Free Supplements"]', false, true, 4);
*/

-- Sample Offers
/*
INSERT INTO public.offers (title, description, price_text, valid_till, is_active) VALUES
('2 Members 1 Payment', 'Bring your workout partner and save big! Get 2 full year memberships for the price of one special offer.', '₹10,000 for 2 Members', '2026-12-31', true),
('New Year Special', 'Start your fitness journey with our exclusive new year offer. Limited time only!', '20% Off All Plans', '2026-03-31', true);
*/

-- ============================================
-- VERIFICATION QUERIES
-- Description: Run these to verify setup
-- ============================================

-- Check if tables were created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('offers', 'membership_plans');

-- Check RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('offers', 'membership_plans');

-- View all policies
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE tablename IN ('offers', 'membership_plans');

-- ============================================
-- SUCCESS!
-- ============================================
-- If you see no errors above, your database is ready!
-- Next steps:
-- 1. Create an admin user in Supabase Authentication
-- 2. Configure your .env.local file
-- 3. Start building!
-- ============================================
-- ============================================
-- TABLE: section_images
-- Description: Store uploaded base64 images for dynamic UI sections
-- ============================================

CREATE TABLE IF NOT EXISTS public.section_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_key TEXT UNIQUE NOT NULL,
    image_data TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.section_images ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active images
CREATE POLICY "Enable read access for all users" ON public.section_images
    FOR SELECT USING (true);

-- Allow authenticated users to manage images
CREATE POLICY "Enable all actions for authenticated admins" ON public.section_images
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');
