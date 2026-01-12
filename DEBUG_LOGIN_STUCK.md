# Debug: Login Stuck in Loading

Since login is still stuck after redeploy, let's debug step by step:

## Step 1: Check Browser Console (MOST IMPORTANT)

1. Open the login page: https://hanouti-omega.vercel.app/admin/login
2. Press **F12** (or right-click → Inspect) to open DevTools
3. Click the **Console** tab
4. **Clear the console** (click the 🚫 icon or press Ctrl+L)
5. Try to log in
6. **Look for any red error messages**
7. **Copy and share any errors you see**

Common errors you might see:
- `Failed to fetch` → API route not responding
- `500 Internal Server Error` → Server error (check Vercel logs)
- `401 Unauthorized` → Authentication failed
- `Network error` → Connection issue
- `CORS error` → Cross-origin issue

## Step 2: Check Network Tab

1. In DevTools, click the **Network** tab
2. Try logging in
3. Look for a request to `/api/auth/callback/credentials` or `/api/auth/[...nextauth]`
4. **Click on that request**
5. Check:
   - **Status**: Should be 200 (if 500, that's the problem)
   - **Response**: Click "Response" tab to see error message
   - **Headers**: Check if cookies are being set

## Step 3: Check if Admin User Exists

Run this command (get DATABASE_URL from Vercel):

```bash
DATABASE_URL="your-production-database-url" npx prisma studio
```

Open http://localhost:5555 and check the "User" table for `admin@hanouti.ma`.

**If admin doesn't exist, seed:**
```bash
DATABASE_URL="your-production-database-url" npx tsx prisma/seed.ts
```

## Step 4: Check Vercel Logs

1. Go to: Vercel Dashboard → Your Project → **Logs**
2. Try logging in again (to generate new logs)
3. Look for errors in the `/api/auth/[...nextauth]` route
4. **Copy any error messages you see**

Common log errors:
- `PrismaClientInitializationError` → Database connection issue
- `Invalid credentials` → Password mismatch
- `User not found` → Admin user doesn't exist
- `Environment variable not found` → Missing env var

## Step 5: Verify Environment Variables Are Active

Even though you added them, let's double-check:

1. Go to: Vercel Dashboard → Settings → Environment Variables
2. Make sure all are set:
   - `NEXTAUTH_URL` = `https://hanouti-omega.vercel.app`
   - `DATABASE_URL` = Your Supabase URL
   - `NEXTAUTH_SECRET` = Set
   - `AUTH_SECRET` = Set
3. **Make sure you redeployed AFTER adding NEXTAUTH_URL**

## What to Share

Please share:
1. **Browser console errors** (F12 → Console)
2. **Network tab response** (if request fails)
3. **Vercel logs errors** (if any)
4. **Does admin user exist?** (from Prisma Studio check)

This will help us identify the exact issue!

