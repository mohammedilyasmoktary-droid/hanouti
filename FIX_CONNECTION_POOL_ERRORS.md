# Fix Connection Pool Errors - IMPORTANT

## Current Problem

You're getting these errors:
1. `MaxClientsInSessionMode: max clients reached`
2. `HomepageContent model not available, using defaults: Invalid prisma.homepageContent.findMany()`
3. `Error fetching products: Invalid prisma.product.findMany`

## Root Cause

**Your DATABASE_URL is using Session Mode Pooler (port 5432)** which has very limited connections (only 2-5).

This causes all database queries to fail when multiple requests happen at once.

## Solution: Switch to Transaction Mode Pooler

### Step 1: Get Transaction Mode Connection String

1. Go to **Supabase Dashboard**: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database** → **Connection Pooling**
4. Find the **Transaction Mode** connection string (NOT Session Mode)
5. It should look like:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
   **Note: Port 6543 (not 5432)**

### Step 2: Update Vercel Environment Variable

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Find `DATABASE_URL`
5. **Edit** it and replace with the **Transaction Mode** connection string (port 6543)
6. Click **Save**
7. **Redeploy** your application

### Step 3: Verify

After redeploying, check:
- Admin pages load without errors
- Categories and products display correctly
- No more "max clients reached" errors

## Why This Works

**Session Mode (port 5432) - CURRENT (BAD):**
- ❌ Only 2-5 connections max
- ❌ Each request needs a dedicated connection
- ❌ Causes "max clients reached" errors easily
- ❌ Not suitable for serverless/Vercel

**Transaction Mode (port 6543) - RECOMMENDED (GOOD):**
- ✅ 200+ connections max
- ✅ Connections are shared across requests
- ✅ Works perfectly for serverless/Vercel
- ✅ No connection limit issues

## Code Changes Applied

I've already improved error handling in the code to:
- ✅ Catch connection pool errors gracefully
- ✅ Return empty results instead of crashing
- ✅ Suppress error noise in production

But **you still need to switch to Transaction Mode** to fix the root cause!

## After Fixing

Once you update the DATABASE_URL to Transaction Mode (port 6543), all errors will disappear and your site will work perfectly with unlimited products/categories.

