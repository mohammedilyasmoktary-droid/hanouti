# Check if Admin User Exists in Production Database

## Quick Check

Since your environment variables are all set, the most likely issue is that the **admin user doesn't exist in your production Supabase database**.

## Verify Admin User Exists

### Option 1: Using Prisma Studio (Easiest)

1. **Get your production DATABASE_URL from Vercel**:
   - Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
   - Click on `DATABASE_URL` to reveal the value
   - Copy it

2. **Run Prisma Studio with production database**:
   ```bash
   DATABASE_URL="your-production-database-url-here" npx prisma studio
   ```

3. **Check the User table**:
   - Open http://localhost:5555 in your browser
   - Click on "User" table
   - Look for `admin@hanouti.ma`
   - If it doesn't exist, you need to seed the database

### Option 2: Using Command Line

Run this command (replace with your production DATABASE_URL):
```bash
DATABASE_URL="your-production-database-url" npx prisma db execute --stdin <<EOF
SELECT email, role FROM "User" WHERE email = 'admin@hanouti.ma';
EOF
```

If no results, the admin user doesn't exist.

## Seed Production Database

If the admin user doesn't exist, run:

```bash
DATABASE_URL="your-production-database-url" npx tsx prisma/seed.ts
```

This will:
- Create all categories and subcategories
- Create the admin user (email: `admin@hanouti.ma`, password: `admin123`)

## After Seeding

1. **Try logging in again** with:
   - Email: `admin@hanouti.ma`
   - Password: `admin123`

2. **Important**: Change the admin password in production!

