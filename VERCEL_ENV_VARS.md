# Vercel Environment Variables

Add these environment variables in Vercel before deploying:

## Required Environment Variables

### 1. DATABASE_URL
**What it is**: Your PostgreSQL database connection string

**How to get it**:
- If you have Supabase: Go to Settings → Database → Copy "Connection string" (URI format)
- If you have Neon: Go to Dashboard → Copy connection string
- Format: `postgresql://user:password@host:5432/database?schema=public`

**Example**:
```
postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres?schema=public
```

⚠️ **You need a cloud database (not localhost)** for Vercel to work!

---

### 2. NEXTAUTH_SECRET
**What it is**: Secret key for NextAuth.js authentication

**How to generate**: Use this command in terminal:
```bash
openssl rand -base64 32
```

Or generate online: https://generate-secret.vercel.app/32

**Example**: `aB3dE5fG7hI9jK1lM3nO5pQ7rS9tU1vW3xY5zA7bC9dE=`

---

### 3. AUTH_SECRET
**What it is**: Same as NEXTAUTH_SECRET (NextAuth uses both)

**Value**: Use the SAME value as NEXTAUTH_SECRET

---

### 4. NEXTAUTH_URL
**What it is**: Your Vercel deployment URL

**How to set**:
- **First deploy**: Leave empty or use: `https://hanouti.vercel.app`
- **After first deploy**: Update with your actual Vercel URL (Vercel will show it)
- Format: `https://your-app-name.vercel.app`

**Example**: `https://hanouti-xxx.vercel.app`

---

## Quick Setup Guide

1. **Set up a cloud database first** (Supabase or Neon - both free)
   - Supabase: https://supabase.com
   - Neon: https://neon.tech

2. **Generate a secret**:
   ```bash
   openssl rand -base64 32
   ```
   Copy the output

3. **In Vercel, add these variables**:
   - `DATABASE_URL` = Your database connection string
   - `NEXTAUTH_SECRET` = Generated secret (paste it)
   - `AUTH_SECRET` = Same as NEXTAUTH_SECRET (paste the same value)
   - `NEXTAUTH_URL` = Leave empty for now (or use `https://hanouti.vercel.app`)

4. **Click "Deploy"**

5. **After deployment**, update `NEXTAUTH_URL` with your actual Vercel URL

---

## After Deployment

After your first deployment:
1. Note your Vercel URL (e.g., `https://hanouti-abc123.vercel.app`)
2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
3. Update `NEXTAUTH_URL` to your actual URL
4. Redeploy (or wait for automatic redeploy)

## Important Notes

- ⚠️ **Never commit secrets to GitHub** - They should only be in Vercel's environment variables
- ✅ Your `.env` file is gitignored (good!)
- 🔒 Use different secrets for production vs development
- 🌐 Use a cloud database (not localhost) for Vercel

