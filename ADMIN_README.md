# 🏋️ NOIZE Fitness - Admin System

A complete, production-ready admin system for managing gym offers and membership plans.

## ✨ Features

### For Gym Owner (Admin)
- 🔐 **Secure Authentication** - Login required to access admin panel
- 🎯 **Manage Offers** - Add, edit, delete special offers (max 5 per year)
- 📋 **Manage Plans** - Full control over membership plans
- 👁️ **Toggle Visibility** - Activate/deactivate without deleting
- 📱 **Mobile Friendly** - Manage from any device
- 🔄 **Real-time Updates** - Changes appear immediately on website

### For Website Visitors
- 👀 **View Active Offers** - Only see current, valid offers
- 💳 **Browse Plans** - Dynamic membership plan display
- 📅 **Auto Filtering** - Expired offers hidden automatically
- ⚡ **Fast Loading** - Optimized with Supabase

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Database**: Supabase (PostgresSQL)
- **Authentication**: Supabase Auth
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS (via CDN)
- **Hosting**: Vercel (recommended)

## 📁 Project Structure

```
noizegym/
├── src/
│   ├── App.tsx                 # Main website
│   ├── Admin.tsx               # Admin dashboard
│   ├── supabaseClient.ts       # Database connection
│   ├── index.tsx               # Router setup
│   ├── constants.tsx           # Programs & transformations
│   └── types.ts                # TypeScript types
├── public/
│   └── images/                 # Website images
├── SETUP.md                    # Detailed setup guide
├── QUICK_START.md              # Fast setup instructions
├── SUPABASE_SCHEMA.sql         # Database schema
├── .env.example                # Environment template
├── .env.local                  # Your secrets (git-ignored)
└── package.json                # Dependencies
```

## 🚀 Quick Start

```bash
# 1. Clone and install
git clone <your-repo>
cd noizegym
npm install

# 2. Set up Supabase (see SETUP.md)
# - Create project
# - Run SUPABASE_SCHEMA.sql
# - Create admin user
# - Copy .env.example to .env.local
# - Add your Supabase URL & key

# 3. Run locally
npm run dev

# 4. Access
# Website: http://localhost:3000
# Admin: http://localhost:3000/admin
```

## 📖 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup guide (10-15 min)
- **[QUICK_START.md](./QUICK_START.md)** - Fast reference guide
- **[SUPABASE_SCHEMA.sql](./SUPABASE_SCHEMA.sql)** - Database schema with comments

## 🔐 Security

### ✅ Built-in Security Features
- Row Level Security (RLS) on all tables
- Authentication required for admin actions
- Password hashing by Supabase
- HTTPS encryption on Vercel
- Environment variables for secrets
- Public API keys (safe for frontend)

### 🔒 Best Practices
- Never commit `.env.local` to git
- Use strong admin passwords
- Regularly review active offers
- Keep Supabase project updated

## 💰 Pricing

**Total Cost: ₹0 (Free Forever!)**

- ✅ Supabase Free Tier: 500MB DB, 50K users, 2GB bandwidth
- ✅ Vercel Free Tier: 100GB bandwidth, unlimited sites
- ✅ Perfect for gym websites!

## 📱 Admin Panel Features

### Dashboard
- Login page with email/password
- Tabs for Offers and Plans
- Logout button
- User email display

### Offers Management
- ➕ Add new offer
- ✏️ Edit offer details
- 🗑️ Delete offers
- 👁️ Activate/Deactivate
- 📊 View all offers with status
- ⚠️ Max 5 offers per year (enforced)

### Plans Management
- ➕ Add new membership plan
- ✏️ Edit plan details
- 🗑️ Delete plans
- 👁️ Activate/Deactivate
- ⭐ Mark as "Popular"
- 🔢 Set display order
- 📝 Add multiple features
- 💵 Set price and duration

## 🎨 User Interface

### Admin Panel
- Dark theme matching website
- Gold accent colors
- Glass morphism effects
- Responsive mobile design
- Clear action buttons
- Form validation

### Website Integration
- Dynamic offers section (only shows when active offers exist)
- Dynamic membership plans
- Auto-filters expired offers
- Real-time updates
- Loading states
- Fallback for empty data

## 🔄 Data Flow

```
1. Admin logs in → Supabase Auth
2. Admin creates/edits → Supabase DB (with RLS)
3. Website loads → Public data only
4. Filters applied → Active + valid offers only
5. Visitor sees → Updated content immediately
```

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
```bash
# Missing dependencies
npm install @supabase/supabase-js react-router-dom

# Type errors
# Check supabaseClient.ts exports match usage
```

**Auth Issues**
```bash
# Can't login
# 1. Check user exists in Supabase > Authentication
# 2. Verify email/password
# 3. Ensure "Auto Confirm User" was checked
```

**Data Not Showing**
```bash
# 1. Check RLS policies in Supabase
# 2. Verify is_active = true
# 3. For offers: check valid_till date
# 4. Clear browser cache
```

**Environment Variables**
```bash
# Local: Create .env.local (not .env)
# Vercel: Add in dashboard > Settings > Environment Variables
# Format: VITE_SUPABASE_URL=https://...
```

## 📊 Database Schema

### offers Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| title | TEXT | Offer title |
| description | TEXT | Full description |
| price_text | TEXT | Display price/discount |
| valid_till | DATE | Expiry date |
| is_active | BOOLEAN | Visibility toggle |
| created_at | TIMESTAMP | Creation time |

### membership_plans Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Plan name |
| price | INTEGER | Price in rupees |
| duration | TEXT | Duration text |
| tagline | TEXT | Marketing tagline |
| features | JSONB | Array of features |
| is_popular | BOOLEAN | Popular badge |
| is_active | BOOLEAN | Visibility toggle |
| display_order | INTEGER | Sort order |
| created_at | TIMESTAMP | Creation time |

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Option 1: GitHub Integration
1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

# Option 2: CLI
vercel login
vercel
# Follow prompts
```

### Environment Variables on Vercel
```
VITE_SUPABASE_URL = your_supabase_url
VITE_SUPABASE_ANON_KEY = your_anon_key
```

## 📞 Support

### Getting Help
1. Check [SETUP.md](./SETUP.md) for detailed guides
2. Review [QUICK_START.md](./QUICK_START.md) for common tasks
3. Check Supabase docs: https://supabase.com/docs
4. Check Vercel docs: https://vercel.com/docs

### Common Resources
- Supabase Dashboard: https://app.supabase.com
- Vercel Dashboard: https://vercel.com/dashboard
- React Router: https://reactrouter.com

## 🎯 Roadmap

### Current Features (v1.0)
- ✅ Secure admin authentication
- ✅ Offers management (max 5/year)
- ✅ Membership plans management
- ✅ Real-time updates
- ✅ Mobile responsive
- ✅ Row level security

### Future Enhancements (Optional)
- [ ] Email notifications for expiring offers
- [ ] Analytics dashboard
- [ ] Member inquiries management
- [ ] Image upload for offers
- [ ] Offer templates
- [ ] Bulk operations

## 📄 License

This is a custom project for NOIZE Fitness & Lifestyle.

## 🙏 Credits

Built with:
- React + TypeScript
- Supabase
- Tailwind CSS
- Vite
- React Router

---

**Made with 💪 for NOIZE Fitness & Lifestyle**

Need help? Read [SETUP.md](./SETUP.md) for complete instructions!
