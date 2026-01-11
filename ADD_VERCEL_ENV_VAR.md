# Add DATABASE_URL to Vercel - Step by Step

Your deployment is failing because `DATABASE_URL` is missing in Vercel.

## Quick Fix:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard

2. **Click on your "hanouti" project**

3. **Go to Settings** → **Environment Variables**

4. **Click "Add New"** button

5. **Fill in the form**:
   - **Key**: `DATABASE_URL`
   - **Value**: `postgresql://postgres.itvdpoxxlrltuozxqfkd:Hanouti%40%40data@aws-1-eu-central-1.pooler.supabase.com:5432/postgres`
   - **Environments**: Select ALL (Production, Preview, Development)
   - **Click "Save"**

6. **Redeploy**:
   - Go to **Deployments** tab
   - Click **"..."** (three dots) on the latest deployment
   - Click **"Redeploy"**
   - Or wait for automatic redeploy

## Important Notes:

- ✅ **URL-encoded password**: Use `%40%40` instead of `@@` in the password
- ✅ **Session Pooler URL**: Using the pooler URL (more reliable)
- ✅ **Select all environments**: Make sure to check Production, Preview, and Development

## After Adding:

Once you add the environment variable and redeploy, refresh your app - categories should appear!

