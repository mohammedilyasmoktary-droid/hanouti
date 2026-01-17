# Use Session Pooler for Vercel (IPv4 Compatible)

## The Problem

Error: "Can't reach database server at 'db.itvdpoxxlrltuozxqfkd.supabase.co:5432'"

This happens because:
- Direct connection (port 5432) doesn't work from Vercel's IPv4 network
- Supabase recommends Session Pooler for IPv4 networks

## Solution: Use Session Pooler

Session Pooler is simpler than Transaction Mode and works with Vercel.

### Step 1: Get Session Pooler Connection String

1. Go to **Supabase Dashboard** → Settings → Database
2. Click **Connection Pooling**
3. Select **Session pooler** (NOT Transaction pooler)
4. Copy the connection string

It should look like:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres?pgbouncer=true
```

### Step 2: URL Encode the Password

Your password is `Monopoli00###`, so URL-encode it:
- `#` becomes `%23`
- Password: `Monopoli00%23%23%23`

### Step 3: Update Vercel

1. Go to **Vercel Dashboard** → Settings → Environment Variables
2. Find `DATABASE_URL`
3. Edit it with Session Pooler connection string
4. Replace `[PASSWORD]` with `Monopoli00%23%23%23`
5. Final format should be:
   ```
   postgresql://postgres.[PROJECT-REF]:Monopoli00%23%23%23@aws-0-[REGION].pooler.supabase.com:5432/postgres?pgbouncer=true
   ```
6. Save and redeploy

## Why Session Pooler?

✅ Works with IPv4 networks (like Vercel)  
✅ Simpler format than Transaction Mode  
✅ No connection limit issues for moderate traffic  
✅ Recommended by Supabase for IPv4

## Note

Session Pooler has a limit of 2-5 connections, but with our error handling, the app will handle occasional connection limits gracefully. For high traffic, you can upgrade to Transaction Mode later.

