-- Add membership category support for offline, online, and home workout plans

ALTER TABLE public.membership_plans
ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'offline';

ALTER TABLE public.membership_plans
DROP CONSTRAINT IF EXISTS membership_plans_category_check;

ALTER TABLE public.membership_plans
ADD CONSTRAINT membership_plans_category_check
CHECK (category IN ('offline', 'online', 'home_workout'));

UPDATE public.membership_plans
SET category = 'offline'
WHERE category IS NULL OR category = '';
