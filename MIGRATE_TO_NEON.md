# Migrate to Neon Database (Free Alternative)

## Why Neon?

**Current problem:**
- ❌ Supabase quota exceeded (494% egress)
- ❌ Grace period is over
- ❌ Database returning 402 errors

**Neon advantages:**
- ✅ **Free tier:** 1 GB storage, **unlimited databases**
- ✅ **No egress limits** (unlike Supabase's 5 GB limit)
- ✅ **PostgreSQL** (same as Supabase - easy migration)
- ✅ **Works with Prisma** (no code changes needed!)
- ✅ **Built-in connection pooling**
- ✅ **Automatic backups**
- ✅ **Serverless** (scales to zero when not in use)

---

## Step 1: Create Neon Account & Database

### 1.1 Sign Up
1. Go to **https://neon.tech**
2. Click **"Sign Up"** (use GitHub for quick signup)
3. Complete registration

### 1.2 Create Project
1. After signup, click **"Create Project"**
2. **Project Name:** `hanouti` (or any name)
3. **Region:** Choose closest to you (e.g., `us-east-2` or `eu-west-1`)
4. **PostgreSQL Version:** `16` (recommended)
5. Click **"Create Project"**

### 1.3 Get Connection String
1. Once project is created, you'll see the dashboard
2. Look for **"Connection Details"** or **"Connection String"** section
3. Click **"Copy"** to copy the connection string

**Format will look like:**
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

**Example:**
```
postgresql://neondb_owner:abc123xyz@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

---

## Step 2: Migrate Your Data

### 2.1 Export Data from Supabase

1. **Install pg_dump** (if not installed):
   ```bash
   # macOS
   brew install postgresql
   
   # Or use Docker
   docker run -it --rm postgres pg_dump --version
   ```

2. **Get Supabase connection string:**
   - Go to Supabase Dashboard → Settings → Database
   - Copy the **Direct Connection** URL (not pooler)
   - It should look like: `postgresql://postgres:[PASSWORD]@db.[project].supabase.co:5432/postgres`

3. **Export your database:**
   ```bash
   # Replace with your Supabase connection string
   pg_dump "postgresql://postgres:[PASSWORD]@db.[project].supabase.co:5432/postgres" > hanouti_backup.sql
   ```

   **If password has special characters, URL-encode them:**
   - `Monopoli00###` → `Monopoli00%23%23%23`
   ```bash
   pg_dump "postgresql://postgres:Monopoli00%23%23%23@db.[project].supabase.co:5432/postgres" > hanouti_backup.sql
   ```

### 2.2 Import Data to Neon

**Option A: Using psql (Recommended)**
```bash
# Import to Neon
psql "postgresql://[neon-user]:[neon-password]@[neon-host]/[neon-database]?sslmode=require" < hanouti_backup.sql
```

**Option B: Using Neon Dashboard**
1. Go to Neon Dashboard → Your Project
2. Click **"SQL Editor"** (or **"Query"**)
3. Open your `hanouti_backup.sql` file
4. Copy all SQL commands
5. Paste into SQL Editor
6. Click **"Run"** or **"Execute"**

**Option C: Using Prisma Migrate (Recommended if you have migrations)**
```bash
# Update DATABASE_URL temporarily
export DATABASE_URL="postgresql://[neon-connection-string]"

# Run migrations
npx prisma migrate deploy

# Or if you want to reset and apply all migrations
npx prisma migrate reset --force
```

---

## Step 3: Update Vercel Environment Variables

### 3.1 Update DATABASE_URL in Vercel

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Select your **"hanouti"** project
3. Go to **Settings** → **Environment Variables**
4. Find `DATABASE_URL`
5. **Edit** it with your Neon connection string:
   ```
   postgresql://[neon-user]:[neon-password]@[neon-host]/[neon-database]?sslmode=require
   ```

6. **Important:** If password has special characters, URL-encode them:
   - `#` → `%23`
   - `@` → `%40`
   - `%` → `%25`

7. Click **Save**

8. **Select environments:** Make sure it's enabled for:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### 3.2 Redeploy

**CRITICAL:** After updating `DATABASE_URL`:
1. Go to **Deployments** tab
2. Click **"..."** on the latest deployment
3. Click **Redeploy**
4. Wait 1-2 minutes for deployment

---

## Step 4: Verify Migration

### 4.1 Check Vercel Logs
1. Go to **Vercel Dashboard** → **Logs**
2. Look for:
   - ✅ No "Database connection error" messages
   - ✅ Successful page loads (200 status)
   - ✅ Categories and products loading

### 4.2 Test Your App
1. Visit your homepage: `https://hanouti.vercel.app`
2. Check categories page: `https://hanouti.vercel.app/categories`
3. Verify admin panel: `https://hanouti.vercel.app/admin`

### 4.3 Test Database Connection Locally (Optional)
```bash
# Update .env.local with Neon connection string
echo 'DATABASE_URL="postgresql://[neon-connection-string]?sslmode=require"' >> .env.local

# Test connection
npx prisma db pull

# Or run a query
npx prisma studio
```

---

## Step 5: Run Prisma Migrations (If Needed)

If you haven't exported data, you can use Prisma migrations:

```bash
# 1. Update .env.local with Neon connection string
echo 'DATABASE_URL="postgresql://[neon-connection-string]?sslmode=require"' >> .env.local

# 2. Push schema to Neon
npx prisma db push

# 3. Or run migrations
npx prisma migrate deploy

# 4. Seed database (if you have seed script)
npx prisma db seed
```

---

## Neon Free Tier Limits

**What you get for free:**
- ✅ **1 GB storage** (enough for thousands of products/categories)
- ✅ **Unlimited databases**
- ✅ **No egress limits** (unlike Supabase)
- ✅ **Automatic backups**
- ✅ **Connection pooling** included
- ✅ **99.9% uptime**

**When to upgrade:**
- Need more than 1 GB storage
- Need faster compute
- Need dedicated resources

**Upgrade cost:** Starts at $19/month (only when you need it)

---

## Alternative: Railway (Also Free)

If Neon doesn't work for you, **Railway** is another great option:

### Railway Setup:
1. Go to **https://railway.app**
2. Sign up with GitHub
3. Click **"New Project"** → **"Provision PostgreSQL"**
4. Copy connection string
5. Update `DATABASE_URL` in Vercel
6. Migrate data using same steps above

**Railway Free Tier:**
- $5 credit/month (free)
- PostgreSQL included
- Easy to use

---

## Troubleshooting

### Issue: Connection fails
**Solution:** 
- Make sure `sslmode=require` is in connection string
- Verify password is URL-encoded if it has special characters
- Check that connection string is copied correctly

### Issue: Data not migrated
**Solution:**
- Re-run pg_dump and psql import
- Or use Prisma migrations to recreate schema
- Manually seed data if needed

### Issue: Prisma errors
**Solution:**
- Run `npx prisma generate` after updating DATABASE_URL
- Run `npx prisma db push` to sync schema
- Check Prisma schema matches Neon database

### Issue: Still seeing Supabase errors
**Solution:**
- Make sure you **redeployed** after updating DATABASE_URL
- Verify DATABASE_URL is set for **all environments** (Production, Preview, Development)
- Check Vercel logs to confirm it's using the new connection string

---

## Next Steps

After successful migration:
1. ✅ **Test your app** thoroughly
2. ✅ **Update documentation** if needed
3. ✅ **Monitor Neon usage** in dashboard
4. ✅ **Keep Supabase** as backup (don't delete yet)

## Summary

**What you need to do:**
1. ✅ Create Neon account & database
2. ✅ Export data from Supabase
3. ✅ Import data to Neon
4. ✅ Update `DATABASE_URL` in Vercel
5. ✅ Redeploy application
6. ✅ Verify everything works

**Time needed:** 15-30 minutes

**Result:** Free database with no egress limits! 🎉

