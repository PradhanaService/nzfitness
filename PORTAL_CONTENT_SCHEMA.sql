-- Dynamic portal content sections for homepage + admin realtime updates

CREATE TABLE IF NOT EXISTS public.portal_content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_key TEXT UNIQUE NOT NULL CHECK (
        section_key IN ('offline_workout', 'special_offers', 'online_workout', 'home_workout')
    ),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    features JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.portal_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.portal_content;
CREATE POLICY "Enable read access for all users" ON public.portal_content
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable all actions for authenticated admins" ON public.portal_content;
CREATE POLICY "Enable all actions for authenticated admins" ON public.portal_content
    FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

INSERT INTO public.portal_content (section_key, title, description, features)
VALUES
    ('offline_workout', 'Offline/Gym Workouts', 'Experience premium gym facilities with expert trainers', '["Premium Equipment", "Expert Trainers", "Group Classes"]'::jsonb),
    ('special_offers', 'Special Offers', 'Unlock limited-time gym deals curated for members who are ready to start now.', '["Limited-Time Pricing", "Referral Perks", "Flexible Validity"]'::jsonb),
    ('online_workout', 'Online Training', 'Train from anywhere with live sessions and personalized guidance', '["Live Video Sessions", "Flexible Scheduling", "One-on-One Coaching"]'::jsonb),
    ('home_workout', 'Home Training', 'Customized workout plans for your home setup', '["No Equipment Needed", "Custom Plans", "Video Demonstrations"]'::jsonb)
ON CONFLICT (section_key) DO UPDATE
SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    features = EXCLUDED.features,
    updated_at = timezone('utc'::text, now());
