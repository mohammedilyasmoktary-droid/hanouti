# Fix Database Connection for Seeding

The database connection is failing. Here's how to fix it:

## Issue

The connection string might have:
1. **Double `@` symbols** - `Hanouti@@data` should probably be `Hanouti@data`
2. **Wrong connection method** - Supabase might require connection pooling
3. **Password encoding** - Special characters in password might need URL encoding

## Solution: Get the Correct Connection String from Supabase

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/itvdpoxxlrltuozxqfkd
2. **Click "Connect"** button (top right) or go to **Settings** → **Database**
3. **Get the connection string**:
   - Use **"URI"** format
   - Try **"Session Pooler"** instead of "Direct connection" (more reliable)
   - Copy the complete connection string
   - **Check the password** - make sure there's only ONE `@` symbol in the password part

4. **Update your local `.env` file**:
   ```bash
   cd /Users/ilyasmoktary/Desktop/Hanouti
   # Edit .env file and update DATABASE_URL with the correct string
   ```

5. **Try seeding again**:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

## Alternative: Use Session Pooler URL

Supabase connection strings usually look like:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
```

Instead of:
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

The pooler (port 6543) is more reliable for external connections.

## Quick Check

1. **Verify your password** - Make sure it doesn't have double `@` symbols
2. **Use Session Pooler** - Get the pooler connection string from Supabase
3. **Update `.env`** - Paste the correct connection string
4. **Seed again** - Run the seed command

---

**After seeding, refresh your Vercel app and categories should appear!**

