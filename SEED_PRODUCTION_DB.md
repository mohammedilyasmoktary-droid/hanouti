# Seed Production Database (Most Likely Fix)

Since there are no console errors but login is stuck, the **admin user probably doesn't exist** in your production Supabase database.

## Step-by-Step:

### 1. Get Your Production DATABASE_URL

1. Go to: https://vercel.com/dashboard
2. Click on your "hanouti" project
3. Go to: **Settings** → **Environment Variables**
4. Find `DATABASE_URL`
5. **Click on the value** to reveal it (it's hidden)
6. **Copy the entire URL** (starts with `postgresql://`)

### 2. Check if Admin User Exists

Run this command (replace with your DATABASE_URL):

```bash
DATABASE_URL="paste-your-production-url-here" npx prisma studio
```

Then:
- Open http://localhost:5555 in your browser
- Click on the **"User"** table
- Look for `admin@hanouti.ma`

**If you don't see `admin@hanouti.ma`**, you need to seed the database.

### 3. Seed the Database

If admin user doesn't exist, run:

```bash
DATABASE_URL="paste-your-production-url-here" npx tsx prisma/seed.ts
```

Wait for it to finish. You should see:
- `✅ Admin user created: admin@hanouti.ma`
- `✅ Seeded X categories`

### 4. Try Logging In Again

After seeding:
- Go back to: https://hanouti-omega.vercel.app/admin/login
- Email: `admin@hanouti.ma`
- Password: `admin123`
- Try logging in again

This should fix it!

