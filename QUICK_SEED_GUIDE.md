# Quick Guide: Check and Seed Production Database

## Step 1: Get Your Production DATABASE_URL

1. Go to: https://vercel.com/dashboard
2. Click on your "hanouti" project
3. Go to: **Settings** → **Environment Variables**
4. Find `DATABASE_URL`
5. **Click on the value** to reveal it (it's hidden/masked)
6. **Copy the entire URL** (starts with `postgresql://`)

## Step 2: Check if Admin User Exists

Run this command (paste your DATABASE_URL):

```bash
DATABASE_URL="paste-your-database-url-here" npx prisma studio
```

Then:
- Open http://localhost:5555 in your browser
- Click on **"User"** table
- Look for `admin@hanouti.ma`

**If you see `admin@hanouti.ma`**: User exists, so the problem is elsewhere.

**If you DON'T see `admin@hanouti.ma`**: Continue to Step 3.

## Step 3: Seed the Database

If admin user doesn't exist, run:

```bash
DATABASE_URL="paste-your-database-url-here" npx tsx prisma/seed.ts
```

Wait for it to finish. You should see:
- `✅ Admin user created: admin@hanouti.ma`
- Categories being created

## Step 4: Try Logging In

After seeding:
- Go to: https://hanouti-omega.vercel.app/admin/login
- Email: `admin@hanouti.ma`
- Password: `admin123`

---

## Or Use the Helper Scripts

I've created helper scripts for you:

**To check if admin exists:**
```bash
./check-admin.sh "your-database-url-here"
```

**To seed the database:**
```bash
./seed-production.sh "your-database-url-here"
```

---

**Important**: Make sure to replace `"your-database-url-here"` with your actual DATABASE_URL from Vercel!

