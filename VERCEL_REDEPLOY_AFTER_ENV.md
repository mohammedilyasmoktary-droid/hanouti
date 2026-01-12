# Redeploy After Adding NEXTAUTH_URL

## Important: Redeploy Required

After adding `NEXTAUTH_URL` to Vercel environment variables, you **must redeploy** for the changes to take effect.

## How to Redeploy

### Option 1: Trigger Redeploy from Dashboard (Recommended)

1. Go to: Vercel Dashboard → Your Project → Deployments
2. Find the latest deployment
3. Click the three dots (⋮) menu
4. Click "Redeploy"
5. Wait for deployment to complete (usually 1-2 minutes)

### Option 2: Push a Small Change to GitHub

If you can't redeploy from the dashboard:
1. Make a small change to any file (e.g., add a comment)
2. Commit and push:
   ```bash
   git commit --allow-empty -m "Trigger redeploy after adding NEXTAUTH_URL"
   git push
   ```
3. Vercel will automatically redeploy

### Option 3: Use Vercel CLI

```bash
vercel --prod
```

## Verify Deployment

1. Wait for the deployment to finish (check Vercel dashboard)
2. Try logging in again
3. Check browser console (F12) for any errors

## If Login Still Fails

After redeploying, if login still doesn't work:

1. **Check if admin user exists** in production database (see `CHECK_ADMIN_USER.md`)
2. **Check Vercel function logs**:
   - Go to: Vercel Dashboard → Your Project → Logs
   - Look for errors in `/api/auth/[...nextauth]` route
3. **Check browser console** (F12 → Console) for JavaScript errors

