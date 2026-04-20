# Quick Start Guide - NOIZE Fitness Admin System

## ⚡ Fast Setup (10 minutes)

### 1. Create Supabase Project
- Visit: https://app.supabase.com/
- Create new project
- Save your database password!

### 2. Run Database Setup
- Open Supabase SQL Editor
- Copy all content from `SUPABASE_SCHEMA.sql`
- Run it!

### 3. Create Admin Account
- Supabase Dashboard → Authentication → Users
- Add user with your email & password
- ✅ Check "Auto Confirm User"

### 4. Configure Environment
- Get URL & Key from Supabase → Settings → API
- Copy `.env.example` to `.env.local`
- Update with your values

### 5. Test Locally
```bash
npm install
npm run dev
```
- Visit: http://localhost:3000
- Admin: http://localhost:3000/admin

### 6. Deploy to Vercel
- Push to GitHub
- Import in Vercel
- Add environment variables
- Deploy!

## 📁 Files Created

| File | Purpose |
|------|---------|
| `supabaseClient.ts` | Database connection & types |
| `Admin.tsx` | Complete admin dashboard |
| `SUPABASE_SCHEMA.sql` | Database tables & security |
| `SETUP.md` | Detailed instructions |
| `.env.example` | Environment template |

## 🎯 Key Features

✅ **For Owner:**
- Secure login at `/admin`
- Add/edit/delete offers (max 5/year)
- Manage membership plans
- Toggle active/inactive
- No coding required!

✅ **For Visitors:**
- See only active offers
- Dynamic membership plans
- Real-time updates
- Beautiful mobile UI

✅ **Built-in Security:**
- Row Level Security (RLS)
- Authentication required
- Password hashing
- HTTPS encryption

## 💻 Daily Usage

### Managing Offers
1. Login at `yoursite.com/admin`
2. Click "Offers" tab
3. Add/Edit offers
4. Toggle active/inactive
5. Changes appear instantly!

### Managing Plans
1. Click "Membership Plans" tab
2. Add/Edit plans
3. Set display order
4. Mark as popular
5. Activate/Deactivate

## 🚨 Important Notes

- ⚠️ Never commit `.env.local` to git
- 🔒 Use strong admin password
- 📅 Check offer expiry dates regularly
- 💾 Free tier = 500MB database (plenty!)
- 🎉 Zero monthly costs!

## 🐛 Quick Fixes

**Can't login?**
- Check email/password
- Verify user in Supabase

**No offers showing?**
- Is it marked Active?
- Valid till date in future?

**Deployment failed?**
- Environment variables added in Vercel?
- Correct Supabase URL & key?

## 📞 Files to Reference

- **Full Setup**: See `SETUP.md`
- **Database**: See `SUPABASE_SCHEMA.sql`
- **Environment**: See `.env.example`

---

**Need help?** Read SETUP.md for detailed troubleshooting!
