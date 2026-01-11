# IMPORTANT: Add Environment Variables to Vercel

The build is failing because **environment variables are missing in Vercel**.

## You MUST add these environment variables in Vercel:

1. Go to: https://vercel.com/dashboard
2. Click on your **"hanouti"** project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

### Required Variables:

1. **`DATABASE_URL`**
   - Value: `postgresql://postgres:Hanouti@@data@db.itvdpoxxlrltuozxqfkd.supabase.co:5432/postgres`
   - Environments: Production, Preview, Development (select all)

2. **`NEXTAUTH_SECRET`**
   - Value: `7THuzESkgXNjK64ChCYaLIzkP8BrX1F1ivHWXjF5v9M=`
   - Environments: Production, Preview, Development (select all)

3. **`AUTH_SECRET`**
   - Value: `7THuzESkgXNjK64ChCYaLIzkP8BrX1F1ivHWXjF5v9M=`
   - Environments: Production, Preview, Development (select all)

4. **`NEXTAUTH_URL`**
   - Value: Leave empty for now, or use: `https://hanouti.vercel.app`
   - Environments: Production, Preview, Development (select all)
   - **Update this** after first successful deployment with your actual Vercel URL

## After Adding Variables:

1. Click **"Save"** for each variable
2. Go to **Deployments** tab
3. Click **"..."** on the latest deployment
4. Click **"Redeploy"**
5. Or wait for the next automatic deployment

## Why This Happened:

The build failed because:
- Next.js tried to generate pages during build time
- These pages need database access
- `DATABASE_URL` wasn't set in Vercel environment variables

I've fixed the code to mark these pages as dynamic (so they don't fail during build), but you still need to add the environment variables for the app to work properly!

