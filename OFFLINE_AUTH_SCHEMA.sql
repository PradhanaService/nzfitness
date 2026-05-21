-- Offline login and repeat-offer tracking
-- Run this in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS public.offline_members (
    phone_number TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    age INTEGER NOT NULL CHECK (age >= 10 AND age <= 100),
    dob DATE NOT NULL,
    email TEXT,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    login_count INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.offline_members
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE public.offline_members
ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMP WITH TIME ZONE;

CREATE TABLE IF NOT EXISTS public.user_offer_stats (
    phone_number TEXT PRIMARY KEY,
    offer_view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.offline_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_offer_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can manage offline members" ON public.offline_members;
CREATE POLICY "Authenticated users can manage offline members"
ON public.offline_members
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage offer stats" ON public.user_offer_stats;
CREATE POLICY "Authenticated users can manage offer stats"
ON public.user_offer_stats
FOR ALL
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE INDEX IF NOT EXISTS idx_offline_members_last_login
ON public.offline_members(last_login_at DESC);

CREATE INDEX IF NOT EXISTS idx_user_offer_stats_last_viewed
ON public.user_offer_stats(last_viewed_at DESC);
