# NOIZE Fitness - Admin System Setup Guide

This guide will help you set up the complete admin system for managing offers and membership plans.

## 📋 Overview

- **Backend**: Supabase (Free Tier)
- **Authentication**: Supabase Auth (Owner Login Only)
- **Database**: PostgreSQL (Supabase)
- **Deployment**: Vercel (Free Tier)
- **Cost**: $0/month (completely free)

## 🚀 Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Fill in project details:
   - Name: `noize-fitness`
   - Database Password: (save this securely)
   - Region: Choose closest to your location
4. Wait 2-3 minutes for project creation

## 🔑 Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)
3. Open your `.env` file in the project and paste:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
```

## 🗄️ Step 3: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste and run this SQL (creates offers table):

```sql
-- Create offers table
CREATE TABLE offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_text TEXT NOT NULL,
  valid_till DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_year INTEGER DEFAULT EXTRACT(YEAR FROM NOW())
);

-- Enable Row Level Security
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active offers
CREATE POLICY "Public can view active offers"
  ON offers FOR SELECT
  USING (is_active = true);

-- Policy: Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can manage offers"
  ON offers FOR ALL
  USING (auth.role() = 'authenticated');

-- Create index for performance
CREATE INDEX idx_offers_active ON offers(is_active);
CREATE INDEX idx_offers_created_year ON offers(created_year);
```

4. Click **New Query** again and run this (creates membership plans table):

```sql
-- Create membership_plans table
CREATE TABLE membership_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  duration TEXT NOT NULL,
  tagline TEXT NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active plans
CREATE POLICY "Public can view active plans"
  ON membership_plans FOR SELECT
  USING (is_active = true);

-- Policy: Only authenticated users can manage plans
CREATE POLICY "Authenticated users can manage plans"
  ON membership_plans FOR ALL
  USING (auth.role() = 'authenticated');

-- Create index
CREATE INDEX idx_plans_active ON membership_plans(is_active);
CREATE INDEX idx_plans_display_order ON membership_plans(display_order);
```

5. Click **New Query** and create the offer limit function:

```sql
-- Function to check offer limit (max 5 per year)
CREATE OR REPLACE FUNCTION check_offer_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM offers 
      WHERE created_year = EXTRACT(YEAR FROM NOW())) >= 5 THEN
    RAISE EXCEPTION 'Maximum 5 offers per year limit reached';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce limit
CREATE TRIGGER enforce_offer_limit
  BEFORE INSERT ON offers
  FOR EACH ROW
  EXECUTE FUNCTION check_offer_limit();
```

## 👤 Step 4: Create Owner Account

1. Go to **Authentication** → **Users** in Supabase dashboard
2. Click **Add user** → **Create new user**
3. Fill in:
   - Email: `owner@noizegym.com` (or your email)
   - Password: (create a strong password)
   - Auto Confirm User: ✅ (check this box)
4. Click **Create user**
5. **Save your login credentials securely!**

## 📊 Step 5: Add Sample Data (Optional)

Run this in SQL Editor to add sample membership plans:

```sql
INSERT INTO membership_plans (name, price, duration, tagline, features, is_popular, display_order) VALUES
('Basic', 2460, '1 Month', 'Perfect for beginners', '["Full Gym Access", "Basic Equipment", "Locker Facility"]', false, 1),
('Standard', 4990, 'Pay 3M Train 6M', 'Best for consistent trainers', '["Full Gym Access", "Group Classes", "Diet Consultation", "Locker Facility"]', false, 2),
('Pro Choice', 7499, 'Pay 6M Train 9M', 'Most popular choice', '["Full Gym Access", "All Group Classes", "Personal Training Sessions", "Diet Plan", "Locker Facility"]', true, 3),
('Elite Annual', 12260, 'Pay 1Y Train 1.5Y', 'Maximum savings', '["Full Gym Access", "All Classes", "Personal Training", "Nutrition Coaching", "Priority Support", "Locker Facility"]', false, 4);
```

## 🔐 Step 6: Configure Authentication Settings

1. Go to **Authentication** → **Providers** in Supabase
2. Make sure **Email** provider is enabled
3. Go to **Authentication** → **URL Configuration**
4. Set Site URL to: `http://localhost:5173` (for development)
5. After deploying to Vercel, update to: `https://your-domain.vercel.app`

## 🚀 Step 7: Deploy to Vercel

1. Push your code to GitHub
2. Go to [https://vercel.com](https://vercel.com) and sign in
3. Click **New Project** → Import your GitHub repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`: Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: Your anon key
5. Click **Deploy**
6. After deployment, update Supabase Site URL (Step 6) with your Vercel URL

## 🎯 Step 8: Access Admin Panel

1. Open your website
2. Go to `/admin` route (e.g., `http://localhost:5173/admin`)
3. Login with your owner credentials
4. Start managing offers and membership plans!

## 📝 Usage Guide

### Managing Offers
- Add new offers (max 5 per year)
- Edit existing offers
- Toggle active/inactive status
- Delete unwanted offers

### Managing Membership Plans
- Add/edit unlimited plans
- Set one plan as "popular" (featured)
- Reorder plans by display order
- Toggle active/inactive status

## 🔒 Security Features

- Row Level Security (RLS) enabled
- Only authenticated owner can manage data
- Public can only view active items
- Environment variables protected
- Secure authentication flow

## 💰 Cost Breakdown

- **Supabase Free Tier**: 
  - 500MB database storage
  - 50,000 monthly active users
  - 2GB bandwidth
  - COMPLETELY FREE

- **Vercel Free Tier**:
  - 100GB bandwidth per month
  - Unlimited deployments
  - COMPLETELY FREE

**Total Cost: $0/month** ✅

## 🆘 Troubleshooting

### Can't login?
- Check email and password are correct
- Verify user is created in Supabase Auth
- Check Site URL is configured correctly

### No data showing?
- Verify .env file has correct values
- Check RLS policies are created
- Ensure data exists in database

### Changes not reflecting?
- Clear browser cache
- Restart development server
- Check is_active status in database

## 📞 Support

For issues, contact the developer at vzhnu.me
