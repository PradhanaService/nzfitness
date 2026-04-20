# NOIZE Fitness - Admin System Setup Guide

This guide will walk you through setting up the complete admin system with Supabase authentication and database.

## 🎯 Overview

- **Database & Auth**: Supabase (Free Tier)
- **Hosting**: Vercel (Free)
- **Admin Features**: 
  - Secure login for gym owner
  - Add/edit/delete offers (max 5 per year)
  - Add/edit/delete membership plans
  - Toggle active/inactive status
  - Real-time updates on website

## 📋 Prerequisites

1. GitHub account
2. Supabase account (free): https://supabase.com
3. Vercel account (free): https://vercel.com

## 🚀 Step-by-Step Setup

### Step 1: Create Supabase Project

1. Go to https://app.supabase.com/
2. Click "New Project"
3. Fill in:
   - Project name: `noize-fitness`
   - Database password: (create a strong password and save it)
   - Region: Choose closest to your location
4. Click "Create new project" and wait 2-3 minutes

### Step 2: Set Up Database Tables

1. In your Supabase project, go to **SQL Editor**
2. Click "New Query"
3. Copy and paste the entire contents from `SUPABASE_SCHEMA.sql`
4. Click **Run** (bottom right)
5. You should see "Success. No rows returned"

### Step 3: Create Admin User

1. In Supabase, go to **Authentication** > **Users**
2. Click "Add user" > "Create new user"
3. Fill in:
   - Email: your_email@example.com (use your real email)
   - Password: (create a strong password - this is your admin login)
   - Auto Confirm User: ✅ Check this box
4. Click "Create user"

### Step 4: Configure Environment Variables

1. In Supabase, go to **Project Settings** > **API**
2. Find these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

3. In your project folder:
   - Rename `.env.example` to `.env.local`
   - Replace the values:
     ```env
     VITE_SUPABASE_URL=your_project_url_here
     VITE_SUPABASE_ANON_KEY=your_anon_key_here
     ```

### Step 5: Test Locally

```bash
# Install dependencies (if not done already)
npm install

# Start development server
npm run dev
```

1. Open http://localhost:3000 - main website should load
2. Open http://localhost:3000/admin - you should see login page
3. Login with the email and password you created in Step 3
4. Try adding a test offer or membership plan

### Step 6: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. In "Environment Variables" section, add:
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
6. Click "Deploy"
7. Wait 1-2 minutes for deployment

#### Option B: Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts and add environment variables when asked
```

### Step 7: Set Up Supabase Row Level Security (RLS)

The schema already includes RLS policies, but verify:

1. In Supabase, go to **Database** > **Tables**
2. Select `offers` table > **Policies** tab
3. You should see:
   - "Enable read access for all users" (SELECT)
   - "Enable insert for authenticated users" (INSERT)
   - "Enable update for authenticated users" (UPDATE)
   - "Enable delete for authenticated users" (DELETE)
4. Repeat for `membership_plans` table

## 🎨 Using the Admin Panel

### Accessing Admin Panel

- Local: http://localhost:3000/admin
- Production: https://your-domain.vercel.app/admin

### Managing Offers

1. Login to admin panel
2. Click "Offers" tab
3. Add New Offer:
   - Title: e.g., "2 Members 1 Payment"
   - Description: Benefits and details
   - Price Text: e.g., "₹10,000 for 2 Members"
   - Valid Till: Select end date
   - Active: Check to make visible on website
4. Click "Create Offer"

**Note**: Maximum 5 new offers per year (enforced by database trigger)

### Managing Membership Plans

1. Click "Membership Plans" tab
2. Add New Plan:
   - Plan Name: e.g., "Basic"
   - Price: e.g., 2460
   - Duration: e.g., "1 Month"
   - Tagline: e.g., "Perfect for beginners"
   - Features: Add multiple features
   - Mark as Popular: Optional
   - Display Order: Controls ordering (lower = appears first)
   - Active: Check to make visible
3. Click "Create Plan"

### Editing & Deleting

- Click "Edit" button to modify
- Click "Activate/Deactivate" to toggle visibility
- Click "Delete" to permanently remove (confirmation required)

## 🔒 Security Notes

### ✅ What's Secure

- Admin authentication via Supabase Auth
- Row Level Security policies on all tables
- Password hashing handled by Supabase
- API keys are public keys (safe for frontend)
- HTTPS encryption on Vercel

### ⚠️ Important Security Practices

1. **Never share your admin password**
2. **Use a strong password** (12+ characters, mixed case, numbers, symbols)
3. **Never commit `.env.local` to git** (already in `.gitignore`)
4. **Regularly review active offers and plans**
5. **Only share admin URL with trusted people**

### Additional Security (Optional)

To restrict admin access to specific email(s):

1. In Supabase SQL Editor, run:
```sql
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.jwt()->>'email' IN (
    'your-admin-email@example.com',
    'another-admin@example.com'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

2. Update RLS policies to use `is_admin()` function

## 🐛 Troubleshooting

### Can't log in to admin panel

- Verify email/password are correct
- Check if user exists in Supabase > Authentication > Users
- Ensure "Auto Confirm User" was checked
- Try resetting password in Supabase dashboard

### Offers/Plans not showing on website

- Check if "Active" is enabled in admin panel
- For offers: verify "Valid Till" date is in the future
- Clear browser cache and refresh
- Check browser console for errors (F12)

### "Failed to create offer" error

- You may have reached the 5 offers per year limit
- Check database: `SELECT COUNT(*) FROM offers WHERE created_at >= date_trunc('year', CURRENT_DATE);`
- Delete old offers if needed

### Environment variables not working on Vercel

- Go to Vercel project > Settings > Environment Variables
- Add variables for all environments (Production, Preview, Development)
- Redeploy the project after adding variables

### Database connection errors

- Verify Supabase URL and key in `.env.local`
- Check Supabase project is not paused (free tier pauses after 7 days inactivity)
- Verify you're using **anon public** key, not service role key

## 📊 Database Schema

### Tables Created

1. **offers**
   - id (UUID, primary key)
   - title (text)
   - description (text)
   - price_text (text)
   - valid_till (date)
   - is_active (boolean)
   - created_at (timestamp)

2. **membership_plans**
   - id (UUID, primary key)
   - name (text)
   - price (integer)
   - duration (text)
   - tagline (text)
   - features (jsonb array)
   - is_popular (boolean)
   - is_active (boolean)
   - display_order (integer)
   - created_at (timestamp)

### Functions & Triggers

- `limit_offers_per_year()`: Prevents creating more than 5 offers per year
- Trigger on INSERT for `offers` table

## 💰 Cost Breakdown

### Free Tier Limits

**Supabase Free Tier:**
- 500 MB database storage
- 1 GB file storage
- 50,000 monthly active users
- 2 GB bandwidth
- Perfect for small gym websites!

**Vercel Free Tier:**
- 100 deployments per day
- 100 GB bandwidth
- Unlimited websites
- More than enough for this use case!

**Total monthly cost: ₹0 🎉**

Both services will send email warnings if you approach limits.

## 🔄 Maintaining the System

### Daily/Weekly Tasks
- Review new member inquiries
- Update expired offers
- Check website performance

### Monthly Tasks
- Review membership plan pricing
- Analyze which plans are most popular
- Update testimonials and images

### Yearly Tasks
- Review offer limit (5 per year)
- Clean up old inactive offers
- Update contact information if changed

## 📞 Support

If you encounter issues:

1. Check this guide first
2. Review Supabase documentation: https://supabase.com/docs
3. Review Vercel documentation: https://vercel.com/docs
4. Check browser console for errors (F12 > Console)
5. Contact your developer

## 🎉 You're All Set!

Your admin system is now ready. You can:
- ✅ Securely manage offers and membership plans
- ✅ Toggle visibility without developer help
- ✅ See changes immediately on the website
- ✅ Run completely free (forever!)

Happy managing! 💪
