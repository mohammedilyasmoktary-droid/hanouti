# How to Seed Your Database on Supabase

Your database is empty! You need to seed it with categories and create an admin user.

## Option 1: Seed from Local Machine (Easiest)

1. **Update your local `.env` file** with your Supabase connection string:
   ```env
   DATABASE_URL="postgresql://postgres:Hanouti@@data@db.itvdpoxxlrltuozxqfkd.supabase.co:5432/postgres"
   ```

2. **Run the seed script**:
   ```bash
   cd /Users/ilyasmoktary/Desktop/Hanouti
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

   This will:
   - Push the database schema to Supabase
   - Create all categories and subcategories
   - Create an admin user (admin@hanouti.ma / admin123)

## Option 2: Use Prisma Studio (Visual)

1. **Update your local `.env` file** with your Supabase connection string (same as above)

2. **Open Prisma Studio**:
   ```bash
   npx prisma studio
   ```

3. **Manually add categories** through the UI (not recommended - tedious)

## Option 3: Create a Seed API Route (For Future)

We could create a one-time seed route that you can call, but this is less secure.

---

## Quick Steps (Recommended):

```bash
# 1. Make sure you're in the project directory
cd /Users/ilyasmoktary/Desktop/Hanouti

# 2. Update .env with your Supabase DATABASE_URL
# (Edit .env file and add/paste the connection string)

# 3. Push schema
npx prisma db push

# 4. Seed database
npx tsx prisma/seed.ts
```

After seeding, refresh your Vercel app and categories should appear!

---

## Admin Login Credentials (After Seeding):

- **Email**: `admin@hanouti.ma`
- **Password**: `admin123`

**⚠️ Change the admin password in production!**

