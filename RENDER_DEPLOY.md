# Deploy Hanouti to Render

This guide will help you deploy your Next.js application to Render.

## Prerequisites

- A Render account (sign up at https://render.com)
- Your GitHub repository connected to Render
- Environment variables ready (from Vercel or your `.env` file)

## Step 1: Connect GitHub Repository

1. Go to https://dashboard.render.com
2. Click **"+ New"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select the `hanouti` repository
5. Click **"Connect"**

## Step 2: Configure the Service

### Basic Settings:
- **Name**: `hanouti` (or any name you prefer)
- **Environment**: `Node`
- **Region**: Choose closest to your users (e.g., `Oregon`, `Frankfurt`)
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty (root of repo)

### Build & Deploy:
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm start`

### Plan:
- Start with **Free** plan (can upgrade later)

## Step 3: Environment Variables

Add these environment variables in Render dashboard:

### Required Variables:

1. **`DATABASE_URL`**
   - Value: Your Supabase PostgreSQL connection string
   - Example: `postgresql://postgres.itvdpoxxlrltuozxqfkd:password@aws-1-eu-central-1.pooler.supabase.com:5432/postgres`

2. **`NEXTAUTH_SECRET`**
   - Value: Your secret key (same as Vercel)
   - Example: `7THuzESkgXNjK64ChCYaLIzkP8BrX1F1ivHWXjF5v9M=`

3. **`AUTH_SECRET`**
   - Value: Same as `NEXTAUTH_SECRET`
   - Example: `7THuzESkgXNjK64ChCYaLIzkP8BrX1F1ivHWXjF5v9M=`

4. **`NEXTAUTH_URL`**
   - Value: Your Render URL (will be provided after first deploy)
   - Format: `https://hanouti.onrender.com` (or your custom domain)
   - **Important**: Update this after first deployment with your actual Render URL

5. **`NODE_ENV`**
   - Value: `production`

### How to Add Environment Variables:

1. In Render dashboard, go to your service
2. Click on **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Add each variable one by one
5. Click **"Save Changes"**

## Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will start building your application
3. Wait for build to complete (usually 5-10 minutes for first build)
4. Once deployed, you'll get a URL like: `https://hanouti-xxxx.onrender.com`

## Step 5: Update NEXTAUTH_URL

After first deployment:

1. Copy your Render URL (e.g., `https://hanouti-xxxx.onrender.com`)
2. Go to **Environment** tab in Render dashboard
3. Update `NEXTAUTH_URL` to your actual Render URL
4. Click **"Save Changes"**
5. Render will automatically redeploy

## Step 6: Seed the Database

After deployment, you need to seed your production database:

### Option 1: Using Render Shell (Recommended)

1. In Render dashboard, go to your service
2. Click on **"Shell"** tab
3. Run these commands:

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### Option 2: Using Local Terminal

1. Set your local `.env` to use production `DATABASE_URL`
2. Run:

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

## Step 7: Verify Deployment

1. Visit your Render URL
2. Test the homepage
3. Test admin login:
   - URL: `https://your-app.onrender.com/admin/login`
   - Email: `admin@hanouti.ma`
   - Password: `admin123`

## Troubleshooting

### Build Fails

- Check build logs in Render dashboard
- Ensure all environment variables are set
- Verify `DATABASE_URL` is correct and accessible

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check if Supabase allows connections from Render IPs
- Ensure database is not paused (Supabase free tier pauses after inactivity)

### Login Not Working

- Verify `NEXTAUTH_URL` matches your Render URL exactly
- Ensure `NEXTAUTH_SECRET` and `AUTH_SECRET` are set and match
- Check Render logs for authentication errors

### Prisma Errors

- Ensure `prisma generate` runs in build command
- Check that `DATABASE_URL` is accessible during build
- Verify Prisma schema is correct

## Render vs Vercel

### Render Advantages:
- ✅ Better for backend-heavy applications
- ✅ More control over build process
- ✅ Can run database migrations easily
- ✅ Better for long-running processes

### Vercel Advantages:
- ✅ Faster deployments
- ✅ Better Next.js integration
- ✅ Edge functions support
- ✅ Automatic HTTPS

## Next Steps

- [ ] Set up custom domain (optional)
- [ ] Configure auto-deploy from GitHub
- [ ] Set up monitoring/alerts
- [ ] Configure database backups

## Support

If you encounter issues:
1. Check Render logs: Dashboard → Your Service → Logs
2. Check build logs for errors
3. Verify all environment variables are set correctly
4. Ensure database is accessible

