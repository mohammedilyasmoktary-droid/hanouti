# Deploy to GitHub

Your code is committed and ready to push to GitHub!

## Option 1: Create Repository via GitHub Website (Recommended)

1. **Go to GitHub**: https://github.com/new
2. **Create a new repository**:
   - Repository name: `hanouti` (or your preferred name)
   - Description: "Premium Moroccan grocery web app"
   - Choose **Private** or **Public**
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

3. **Push your code** (run these commands in your terminal):
   ```bash
   cd /Users/ilyasmoktary/Desktop/Hanouti
   
   # Add the remote (replace YOUR_USERNAME with your GitHub username)
   git remote add origin https://github.com/YOUR_USERNAME/hanouti.git
   
   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

## Option 2: Use GitHub CLI (if installed)

If you have GitHub CLI installed and authenticated:

```bash
cd /Users/ilyasmoktary/Desktop/Hanouti
gh repo create hanouti --private --source=. --remote=origin --push
```

## After Pushing

Once your code is on GitHub, you can:
- Deploy to Vercel (recommended for Next.js)
- Deploy to other platforms (Netlify, Railway, etc.)
- Share your repository with others
- Set up CI/CD

## Next Steps for Deployment

### Deploy to Vercel (Easiest for Next.js)

1. Go to https://vercel.com
2. Sign in with your GitHub account
3. Click "New Project"
4. Import your `hanouti` repository
5. Add environment variables:
   - `DATABASE_URL` (your PostgreSQL connection string)
   - `NEXTAUTH_SECRET` (generate with: `openssl rand -base64 32`)
   - `AUTH_SECRET` (same as NEXTAUTH_SECRET)
   - `NEXTAUTH_URL` (your Vercel deployment URL)
6. Click "Deploy"

Vercel will automatically:
- Build your Next.js app
- Deploy it
- Set up automatic deployments on every push to main

## Important Notes

- Your `.env` file is gitignored (good!)
- Make sure to set environment variables on your hosting platform
- For production, use a cloud database (Supabase, Neon, etc.)
- Update `NEXTAUTH_URL` in production to match your deployment URL

