# Fix Admin Login Issue

## Problem
Admin login fails with "Email ou mot de passe incorrect" even though credentials are correct.

## Common Causes

1. **Admin user doesn't exist in production database**
2. **Password hash mismatch** (password was changed or hash is incorrect)
3. **Email case sensitivity** (fixed in latest code)
4. **Database connection issues**
5. **Missing environment variables**

## Quick Fix

### Option 1: Run Diagnostic Script (Recommended)

This script will check and fix all issues automatically:

```bash
# For production database (use your production DATABASE_URL)
DATABASE_URL="your-production-database-url" npm run diagnose:admin

# Or if you have it in .env
npm run diagnose:admin
```

### Option 2: Fix Admin Password Directly

```bash
# For production database
DATABASE_URL="your-production-database-url" npm run fix:admin

# Or if you have it in .env
npm run fix:admin
```

### Option 3: Seed Database (Creates Admin User)

```bash
# For production database
DATABASE_URL="your-production-database-url" npm run db:seed

# Or if you have it in .env
npm run db:seed
```

## Verify Admin User Exists

### Using Prisma Studio

```bash
# For production database
DATABASE_URL="your-production-database-url" npm run db:studio
```

Then check:
- Go to `User` table
- Find `admin@hanouti.ma`
- Verify:
  - ✅ Email: `admin@hanouti.ma`
  - ✅ Role: `ADMIN`
  - ✅ Password: Should be a long hash string (starts with `$2a$`)

### Using SQL Query

```sql
SELECT email, role, 
       CASE WHEN password IS NOT NULL THEN 'Password set' ELSE 'No password' END as password_status,
       "createdAt", "updatedAt"
FROM "User" 
WHERE email = 'admin@hanouti.ma';
```

## Default Admin Credentials

- **Email**: `admin@hanouti.ma`
- **Password**: `admin123`

## Check Vercel Logs

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Logs** tab
4. Look for `/api/auth/callback/credentials` requests
5. Check for error messages like:
   - `[Auth] User not found`
   - `[Auth] Invalid password`
   - `[Auth] Database query failed`

## Environment Variables Check

Make sure these are set in Vercel:

1. **DATABASE_URL** - Your production database connection string
2. **NEXTAUTH_SECRET** or **AUTH_SECRET** - Secret for JWT signing
3. **NEXTAUTH_URL** - Your Vercel URL (e.g., `https://hanouti-omega.vercel.app`)

### To check/update in Vercel:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify all three variables are set
3. **Important**: Redeploy after adding/updating variables

## Recent Fixes Applied

1. ✅ **Email normalization**: Email is now converted to lowercase to avoid case sensitivity issues
2. ✅ **Enhanced logging**: More detailed logs to help diagnose issues
3. ✅ **Diagnostic script**: New script to automatically check and fix admin user

## Still Not Working?

1. **Check browser console** (F12 → Console tab) for client-side errors
2. **Check Vercel function logs** for server-side errors
3. **Verify database connection** is working
4. **Try clearing browser cookies** and logging in again
5. **Run the diagnostic script** to see detailed information

## Manual SQL Fix (Last Resort)

If scripts don't work, you can manually fix via SQL:

```sql
-- First, check if user exists
SELECT * FROM "User" WHERE email = 'admin@hanouti.ma';

-- If user doesn't exist, create it (you'll need to hash the password first)
-- To hash password: node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 12).then(h => console.log(h))"
-- Then use the hash in the INSERT below

-- If user exists but password is wrong, update it
UPDATE "User" 
SET password = '$2a$12$YOUR_HASHED_PASSWORD_HERE',
    role = 'ADMIN'
WHERE email = 'admin@hanouti.ma';

-- Verify
SELECT email, role FROM "User" WHERE email = 'admin@hanouti.ma';
```

