# Fix for "MaxClientsInSessionMode" Connection Pool Error

## Problem

You're getting this error:
```
FATAL: MaxClientsInSessionMode: max clients reached - in Session mode max clients are limited to pool_size
```

This happens when:
1. Using Supabase **Session mode pooler** (very limited connections - typically 2-5)
2. Too many concurrent requests opening database connections
3. Connections not being properly reused

## Solution 1: Use Transaction Mode Pooler (Recommended)

**Change your DATABASE_URL in Vercel to use Transaction mode instead of Session mode:**

1. Go to **Supabase Dashboard** → Your Project → **Settings** → **Database**
2. Click **Connection Pooling** section
3. Get the **Transaction mode** connection string (NOT Session mode)
4. Transaction mode pooler typically looks like:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
5. Update your **Vercel Environment Variable** `DATABASE_URL` with the Transaction mode URL

**Transaction mode benefits:**
- Much higher connection limit (typically 200+ connections)
- Better for serverless/server-side applications
- Connections can be shared across requests

**Session mode limitations:**
- Very limited connections (2-5 max)
- Each request needs a dedicated connection
- Causes "max clients reached" errors easily

## Solution 2: Use Direct Connection (Alternative)

If pooler isn't working, use direct connection:
1. Get direct connection string from Supabase (port 5432)
2. Update `DATABASE_URL` in Vercel
3. Note: Direct connections have a max of ~100 connections

## Solution 3: Code Optimization (Already Applied)

I've optimized the Prisma client to:
- Ensure singleton instance (prevents multiple connection pools)
- Better connection cleanup
- Proper connection reuse

## How to Update Vercel Environment Variables

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Edit it and paste the **Transaction mode** connection string from Supabase
4. Click **Save**
5. **Redeploy** your application (Vercel will automatically redeploy or you can trigger manually)

## Verify Connection String Format

**Session mode (LIMITED - causes errors):**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1
```

**Transaction mode (RECOMMENDED - works great):**
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

The key difference:
- Port **5432** = Session mode (limited connections)
- Port **6543** = Transaction mode (many connections)
- Both use pooler, but Transaction mode is better for serverless

## After Updating

1. Wait for Vercel to redeploy (1-2 minutes)
2. Test your admin pages
3. The error should be gone!

