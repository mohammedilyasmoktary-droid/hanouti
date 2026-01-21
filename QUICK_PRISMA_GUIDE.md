# Quick Guide: Run Prisma for Neon Database

## You Have Two Options

### Option 1: Run Prisma Locally (Recommended for Testing)

**Step 1: Update .env.local with Neon Connection String**

1. **Get Neon connection string:**
   - Go to **Vercel Dashboard** → **Settings** → **Environment Variables**
   - Find `DATABASE_URL`
   - Click **"View"** or **"Show"** to see the value
   - Copy it

2. **Update .env.local:**
   ```bash
   # Open .env.local in a text editor
   nano /Users/ilyasmoktary/Desktop/Hanouti/.env.local
   ```
   
   Or use any text editor (VS Code, TextEdit, etc.)

3. **Replace the old Supabase connection string with Neon connection string:**
   ```
   DATABASE_URL="paste-neon-connection-string-here"
   ```
   
   **Important:** Make sure it includes `?sslmode=require` at the end

4. **Save the file**

**Step 2: Run Prisma in Terminal**

1. **Open Terminal** (Cmd+Space, type "Terminal")

2. **Navigate to project:**
   ```bash
   cd /Users/ilyasmoktary/Desktop/Hanouti
   ```

3. **Run Prisma:**
   ```bash
   npx prisma db push
   ```

4. **Wait for it to complete** - you'll see something like:
   ```
   ✔ Generated Prisma Client
   The database is now in sync with your Prisma schema.
   ```

**Done!** Your database schema is now created in Neon.

---

### Option 2: Run Prisma During Vercel Deployment (Easier)

You don't need to run Prisma locally! Vercel can do it automatically.

**Step 1: Update package.json build script**

Edit `package.json` and update the build script:

```json
{
  "scripts": {
    "build": "prisma generate && prisma db push && next build"
  }
}
```

**Step 2: Redeploy**

1. Go to **Vercel Dashboard** → **Deployments**
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. Wait for deployment

Vercel will automatically:
- Generate Prisma Client
- Push schema to Neon database
- Build your app

**Done!** No need to run commands locally.

---

## Which Option Should I Choose?

**Choose Option 1 if:**
- You want to test locally
- You want immediate feedback
- You prefer running commands yourself

**Choose Option 2 if:**
- You want everything automated
- You don't want to deal with local setup
- You're comfortable waiting for deployment

**Both work!** Option 2 is easier, Option 1 gives you more control.

---

## Quick Commands Reference

```bash
# Navigate to project
cd /Users/ilyasmoktary/Desktop/Hanouti

# Push schema to database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Open visual database browser
npx prisma studio

# Check Prisma version
npx prisma --version
```

---

## After Running Prisma

1. **Check your database:**
   - Go to Neon Dashboard (if you have access)
   - Or use `npx prisma studio` to see tables

2. **Redeploy your app:**
   - Go to Vercel → Deployments
   - Click Redeploy

3. **Test your app:**
   - Visit your homepage
   - Check categories page
   - Test admin panel

---

**I recommend Option 2 (automatic during deployment) - it's easier!** 🚀

