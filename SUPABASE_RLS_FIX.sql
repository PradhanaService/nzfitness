-- NOIZE Fitness RLS Fix
-- Run this in Supabase SQL Editor if the admin portal says:
-- "new row violates row-level security policy"

ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.offers TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.offers TO authenticated;
GRANT SELECT ON public.membership_plans TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.membership_plans TO authenticated;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.offers;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.offers;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.offers;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.offers;
DROP POLICY IF EXISTS "Public can view active offers" ON public.offers;
DROP POLICY IF EXISTS "Authenticated users can manage offers" ON public.offers;
DROP POLICY IF EXISTS "Public can read offers" ON public.offers;
DROP POLICY IF EXISTS "Authenticated users can insert offers" ON public.offers;
DROP POLICY IF EXISTS "Authenticated users can update offers" ON public.offers;
DROP POLICY IF EXISTS "Authenticated users can delete offers" ON public.offers;

CREATE POLICY "Public can read offers"
  ON public.offers
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert offers"
  ON public.offers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update offers"
  ON public.offers
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete offers"
  ON public.offers
  FOR DELETE
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.membership_plans;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.membership_plans;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.membership_plans;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.membership_plans;
DROP POLICY IF EXISTS "Public can view active plans" ON public.membership_plans;
DROP POLICY IF EXISTS "Authenticated users can manage plans" ON public.membership_plans;
DROP POLICY IF EXISTS "Public can read membership plans" ON public.membership_plans;
DROP POLICY IF EXISTS "Authenticated users can insert membership plans" ON public.membership_plans;
DROP POLICY IF EXISTS "Authenticated users can update membership plans" ON public.membership_plans;
DROP POLICY IF EXISTS "Authenticated users can delete membership plans" ON public.membership_plans;

CREATE POLICY "Public can read membership plans"
  ON public.membership_plans
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert membership plans"
  ON public.membership_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update membership plans"
  ON public.membership_plans
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete membership plans"
  ON public.membership_plans
  FOR DELETE
  TO authenticated
  USING (true);

SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('offers', 'membership_plans')
ORDER BY tablename, policyname;
