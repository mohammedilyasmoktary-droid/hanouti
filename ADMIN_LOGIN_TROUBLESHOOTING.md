# Admin Login Troubleshooting - Login Stuck on "Connexion..."

## Problem
Login button shows "Connexion..." and never completes - stuck in loading state.

## Most Likely Causes

### 1. Missing `NEXTAUTH_URL` Environment Variable (VERY COMMON)

**On Vercel**, you MUST set `NEXTAUTH_URL` to your production URL:
- Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
- Add: `NEXTAUTH_URL` = `https://hanouti-omega.vercel.app`
- **Important**: Redeploy after adding this variable

Without `NEXTAUTH_URL`, NextAuth cannot determine the correct callback URL and the login will hang.

### 2. Admin User Doesn't Exist in Production Database

The admin user must be created in your production Supabase database:

**Check if admin exists:**
```bash
# Using your production DATABASE_URL
DATABASE_URL="your-production-url" npx prisma studio
```

**Create admin user if missing:**
```bash
DATABASE_URL="your-production-url" npx tsx prisma/seed.ts
```

**Or create manually:**
```bash
DATABASE_URL="your-production-url" npx prisma db execute --stdin
```

Then run:
```sql
INSERT INTO "User" (id, email, password, role, "createdAt", "updatedAt")
VALUES (
  'admin-user-id',
  'admin@hanouti.ma',
  '$2a$12$YourHashedPasswordHere',
  'ADMIN',
  NOW(),
  NOW()
);
```

**To hash the password:**
```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('admin123', 12).then(h => console.log(h))"
```

### 3. Missing Environment Variables

Required on Vercel:
- ✅ `DATABASE_URL` - Your Supabase connection string
- ✅ `NEXTAUTH_SECRET` or `AUTH_SECRET` - Secret key for JWT signing
- ✅ `NEXTAUTH_URL` - Your Vercel URL (e.g., `https://hanouti-omega.vercel.app`)

### 4. Database Connection Issues

Check Vercel function logs:
- Go to: Vercel Dashboard → Your Project → Logs
- Look for database connection errors in `/api/auth/[...nextauth]` route

### 5. CORS or Network Issues

Open browser DevTools → Network tab:
- Look for `/api/auth/callback/credentials` request
- Check if it's pending, failed, or returns an error
- Check the response status and body

## Quick Fix Checklist

1. ✅ **Add `NEXTAUTH_URL` to Vercel** (Most important!)
   - Value: `https://hanouti-omega.vercel.app`
   - Redeploy after adding

2. ✅ **Seed production database**
   - Run: `DATABASE_URL="your-prod-url" npx tsx prisma/seed.ts`

3. ✅ **Check Vercel logs**
   - Look for errors in function logs

4. ✅ **Check browser console**
   - Open DevTools → Console
   - Look for JavaScript errors

5. ✅ **Clear browser cookies**
   - Clear all cookies for `hanouti-omega.vercel.app`
   - Try logging in again

## Testing Locally

To test if login works locally:
1. Make sure your `.env` has:
   ```env
   DATABASE_URL="your-database-url"
   NEXTAUTH_SECRET="your-secret"
   NEXTAUTH_URL="http://localhost:3000"
   ```
2. Make sure admin user exists in your database
3. Run `npm run dev`
4. Try logging in

If it works locally but not on Vercel, it's almost certainly a missing environment variable (especially `NEXTAUTH_URL`).

