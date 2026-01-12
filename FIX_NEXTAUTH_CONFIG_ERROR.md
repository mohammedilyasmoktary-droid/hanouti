# Fix: NextAuth Configuration Error

## The Error

You're seeing: `/api/auth/error?error=Configuration`

This means NextAuth is misconfigured - something is missing or incorrect.

## Most Common Causes

1. **Missing or incorrect `NEXTAUTH_URL`**
   - Should be: `https://hanouti-omega.vercel.app`
   - Check Vercel environment variables

2. **Missing or incorrect `NEXTAUTH_SECRET` or `AUTH_SECRET`**
   - Should be a random string
   - Check Vercel environment variables

3. **NextAuth v5 requires specific configuration**
   - Check if `authOptions` is correctly exported
   - Check if handlers are correctly set up

## Solution: Verify Environment Variables

1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

2. Verify these are set correctly:
   - `NEXTAUTH_URL` = `https://hanouti-omega.vercel.app` (exact match, no trailing slash)
   - `NEXTAUTH_SECRET` = Your secret string
   - `AUTH_SECRET` = Your secret string (should match NEXTAUTH_SECRET or be same value)

3. **After verifying, redeploy:**
   - Go to Deployments → Latest deployment → ⋮ → Redeploy

## Alternative: Check if Secret is Set

In NextAuth v5, the secret must be provided. Let me check the code...

