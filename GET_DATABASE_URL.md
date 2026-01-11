# How to Get Your Database URL

## Quick Steps to Get a Free Cloud Database

### Option 1: Supabase (Recommended - 500MB free)

1. **Go to**: https://supabase.com
2. **Click**: "Start your project" (top right)
3. **Sign up** with GitHub (easiest)
4. **Click**: "New Project" (green button)
5. **Fill in**:
   - Name: `hanouti`
   - Database Password: **Create and remember this password!**
   - Region: Choose closest to you
   - Plan: Free
6. **Click**: "Create new project"
7. **Wait** 1-2 minutes for setup
8. **Get connection string**:
   - Click **Settings** (gear icon, bottom left)
   - Click **Database** in sidebar
   - Scroll to **"Connection string"** section
   - Select **"URI"** tab
   - **Copy** the connection string
   - Replace `[YOUR-PASSWORD]` with your actual password

**Example format**:
```
postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

---

### Option 2: Neon (Free, Serverless)

1. **Go to**: https://neon.tech
2. **Click**: "Sign up" (top right)
3. **Sign up** with GitHub
4. **Click**: "Create a project"
5. **Fill in**:
   - Name: `hanouti`
   - Region: Choose closest
6. **Click**: "Create project"
7. **Copy** the connection string shown on screen

---

## After Getting Your Connection String

1. **Copy** the entire connection string
2. **Add** to Vercel as `DATABASE_URL`
3. **Make sure** it starts with `postgresql://`
4. **Format should be**: `postgresql://user:password@host:port/database`

---

## Quick Links

- **Supabase**: https://supabase.com
- **Neon**: https://neon.tech

---

## Notes

- ⚠️ **Remember your database password** - You'll need it in the connection string
- ✅ Both services are **free** to start
- 🌐 Use a **cloud database** (not localhost) for Vercel
- 🔒 Connection strings include passwords - keep them secret!

