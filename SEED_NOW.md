# Seed Your Database - Correct Connection String

Your connection string has a password with special characters (`@@`). Here's what to do:

## Step 1: Update Your .env File

Create or update your `.env` file with the correctly URL-encoded connection string:

```bash
DATABASE_URL="postgresql://postgres.itvdpoxxlrltuozxqfkd:Hanouti%40%40data@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"
```

**Important**: The `@` symbols in the password are URL-encoded as `%40`.

## Step 2: Seed the Database

Run these commands:

```bash
cd /Users/ilyasmoktary/Desktop/Hanouti

# Push schema to database
npx prisma db push

# Seed categories and admin user
npx tsx prisma/seed.ts
```

## Step 3: Update Vercel Environment Variables

After seeding works locally, update Vercel:

1. Go to: https://vercel.com/dashboard → Your project → Settings → Environment Variables
2. Update `DATABASE_URL` to:
   ```
   postgresql://postgres.itvdpoxxlrltuozxqfkd:Hanouti%40%40data@aws-1-eu-central-1.pooler.supabase.com:5432/postgres
   ```
3. Click "Save"
4. Redeploy your app

## After Seeding

Refresh your Vercel app - categories should now appear!

**Admin Login** (after seeding):
- Email: `admin@hanouti.ma`
- Password: `admin123`

