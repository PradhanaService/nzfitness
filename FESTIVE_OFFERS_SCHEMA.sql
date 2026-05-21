CREATE TABLE IF NOT EXISTS public.festive_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  tagline TEXT DEFAULT '',
  description TEXT DEFAULT '',
  price_text TEXT NOT NULL,
  valid_till DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

ALTER TABLE public.festive_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON public.festive_offers
  FOR SELECT USING (true);

CREATE POLICY "service_all" ON public.festive_offers
  FOR ALL USING (true);
