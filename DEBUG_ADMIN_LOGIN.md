# Debug Admin Login Issue

## Problem
Admin login page shows "Connexion..." and never completes - it's stuck in a loading state.

## Possible Causes

1. **Missing Environment Variables on Vercel**
   - `DATABASE_URL` - Required to connect to database
   - `NEXTAUTH_SECRET` or `AUTH_SECRET` - Required for JWT signing
   - `NEXTAUTH_URL` - Should be set to your Vercel URL

2. **Admin User Doesn't Exist in Production Database**
   - The seed script might not have run on production
   - The admin user might not exist in the remote Supabase database

3. **API Route Errors**
   - The `/api/auth/[...nextauth]` route might be failing
   - Check Vercel function logs for errors

## Quick Fixes

### 1. Check Vercel Environment Variables
Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

Required:
- `DATABASE_URL`
- `NEXTAUTH_SECRET` or `AUTH_SECRET`
- `NEXTAUTH_URL` (set to `https://hanouti-omega.vercel.app`)

### 2. Check if Admin User Exists
Run this in your local terminal (with DATABASE_URL pointing to production):
```bash
npx prisma studio
```
Then check the User table to see if `admin@hanouti.ma` exists.

Or check via SQL:
```bash
npx prisma db execute --stdin
```
Then type:
```sql
SELECT email, role FROM "User" WHERE email = 'admin@hanouti.ma';
```

### 3. Seed Production Database
If admin user doesn't exist, run:
```bash
DATABASE_URL="your-production-url" npx tsx prisma/seed.ts
```

### 4. Check Browser Console
Open browser DevTools → Console tab and look for errors when clicking login.

### 5. Check Vercel Function Logs
Go to: Vercel Dashboard → Your Project → Logs
Look for errors in the `/api/auth/[...nextauth]` route.

