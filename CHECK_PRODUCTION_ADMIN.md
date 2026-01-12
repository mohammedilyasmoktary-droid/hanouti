# Check if Admin User Exists in Production Database

## Quick Check - Run This Command

1. **Get your production DATABASE_URL from Vercel:**
   - Go to: Vercel Dashboard → Settings → Environment Variables
   - Click on `DATABASE_URL` to reveal the value
   - Copy the entire URL (it should start with `postgresql://`)

2. **Check if admin user exists:**

```bash
DATABASE_URL="your-production-database-url-here" npx prisma studio
```

This will:
- Open Prisma Studio in your browser at http://localhost:5555
- Show all your database tables
- Click on "User" table to see all users
- Look for `admin@hanouti.ma`

**If you see `admin@hanouti.ma`:** The user exists, so the problem is elsewhere.

**If you DON'T see `admin@hanouti.ma`:** You need to seed the database.

## If Admin User Doesn't Exist - Seed the Database

Run this command (replace with your production DATABASE_URL):

```bash
DATABASE_URL="your-production-database-url-here" npx tsx prisma/seed.ts
```

This will:
- Create all categories and subcategories
- Create the admin user:
  - Email: `admin@hanouti.ma`
  - Password: `admin123`
  - Role: `ADMIN`

After seeding, try logging in again.

## Alternative: Quick SQL Check

If you prefer SQL, you can run:

```bash
DATABASE_URL="your-production-database-url-here" npx prisma db execute --stdin
```

Then paste:
```sql
SELECT email, role FROM "User" WHERE email = 'admin@hanouti.ma';
```

If it returns a row, the admin exists. If it returns nothing, you need to seed.

