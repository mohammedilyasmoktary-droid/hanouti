# Deploy Hanouti to Vercel

Your code is now on GitHub! Here's how to deploy it to Vercel (recommended for Next.js apps).

## Step 1: Go to Vercel

1. Visit: https://vercel.com
2. Sign in with your **GitHub account** (click "Continue with GitHub")

## Step 2: Import Your Repository

1. Click **"Add New..."** → **"Project"**
2. You'll see your GitHub repositories listed
3. Find **"hanouti"** and click **"Import"**

## Step 3: Configure Project

Vercel will automatically detect it's a Next.js app. You may see:
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)

**Leave these as default** and click **"Continue"**

## Step 4: Add Environment Variables

This is **CRITICAL** - add these environment variables:

1. Click **"Environment Variables"** section
2. Add each variable:

   ### Required Variables:
   
   **`DATABASE_URL`**
   - Value: Your PostgreSQL connection string
   - Example: `postgresql://user:password@host:5432/hanouti?schema=public`
   - ⚠️ Use a cloud database (Supabase, Neon, etc.) for production

   **`NEXTAUTH_SECRET`**
   - Generate with: `openssl rand -base64 32`
   - Or use: https://generate-secret.vercel.app/32
   - Example: `your-random-secret-string-here`

   **`AUTH_SECRET`**
   - Same value as `NEXTAUTH_SECRET`

   **`NEXTAUTH_URL`**
   - Value: `https://your-app-name.vercel.app` (Vercel will show you the URL after first deploy)
   - Or use: Your custom domain if you have one

3. After adding all variables, click **"Deploy"**

## Step 5: Deployment

Vercel will:
- Install dependencies (`npm install`)
- Build your app (`npm run build`)
- Deploy to production
- Give you a URL like: `https://hanouti-xxx.vercel.app`

## Step 6: Set Up Database (If Not Done)

### Option A: Supabase (Free, Recommended)
1. Go to https://supabase.com
2. Sign up for free
3. Create a new project
4. Go to Settings → Database
5. Copy the connection string (URI format)
6. Use this in your `DATABASE_URL` environment variable

### Option B: Neon (Free, Serverless)
1. Go to https://neon.tech
2. Sign up for free
3. Create a new project
4. Copy the connection string
5. Use this in your `DATABASE_URL` environment variable

## Step 7: Run Database Setup

After deployment, you need to:
1. Push your Prisma schema to the database
2. Seed your database with categories

You can do this via Vercel's CLI or by connecting to your database directly:

```bash
# Install Vercel CLI
npm i -g vercel

# Link to your project
vercel link

# Set environment variables locally (optional)
vercel env pull .env.local

# Push schema and seed
npx prisma db push
npx tsx prisma/seed.ts
```

Or use your database provider's console to run Prisma commands.

## Step 8: Update NEXTAUTH_URL

After first deployment:
1. Get your Vercel URL (e.g., `https://hanouti-xxx.vercel.app`)
2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
3. Update `NEXTAUTH_URL` to your actual Vercel URL
4. Redeploy (or it will auto-deploy on next push)

## 🎉 Done!

Your app is now live! Every time you push to GitHub, Vercel will automatically redeploy.

## Important Notes

- ✅ Your `.env` file is gitignored (good!)
- ⚠️ Never commit secrets to GitHub
- 🔒 Always use environment variables for sensitive data
- 🌐 Use a production database (not localhost)
- 🔄 Automatic deployments on every `git push`

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Check if database is accessible

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check if database allows connections from Vercel's IPs
- Some databases need to whitelist IP addresses

### Authentication Issues
- Ensure `NEXTAUTH_SECRET` and `AUTH_SECRET` match
- Verify `NEXTAUTH_URL` matches your Vercel URL
- Check that secrets are strong enough (32+ characters)

