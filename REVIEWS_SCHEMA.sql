-- Dynamic Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    text TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active reviews
CREATE POLICY "Enable read access for all users" ON public.reviews
    FOR SELECT USING (true);

-- Allow authenticated users to insert reviews
CREATE POLICY "Enable insert for authenticated users" ON public.reviews
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update reviews
CREATE POLICY "Enable update for authenticated users" ON public.reviews
    FOR UPDATE USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to delete reviews
CREATE POLICY "Enable delete for authenticated users" ON public.reviews
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert existing reviews from static constants
INSERT INTO public.reviews (name, text, rating, display_order)
VALUES 
('Divya (Renu)', 'I had an excellent workout experience with the Noize Fitness team. The trainer, Raj, is highly professional and polite. He provides clear guidance on every workout posture and encourages us to give our best. His consistent motivation and follow-ups truly help in improving our fitness and confidence.', 5, 1),
('Swaminathan B', 'Noize Gym is a great place to work out with good facilities and a positive vibe. Trainer Raj is very friendly and maintains a really good relationship with clients. He motivates and guides well, making the workouts enjoyable and effective.', 5, 2),
('Karpakam K', 'Raj is such a friendly trainer. His diet plans are simple & easy to follow, nothing too fancy. Strength training sessions are really good and I can already see the difference in my stamina and inch loss. He motivates me every session. Totally recommend him if you want someone who actually cares about your progress!', 5, 3);
