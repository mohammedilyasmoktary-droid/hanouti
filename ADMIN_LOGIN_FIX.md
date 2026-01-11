# Fix Admin Login Issue

## Check Environment Variables in Vercel

Admin login won't work if environment variables are missing:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click on "hanouti" project**
3. **Go to Settings** → **Environment Variables**
4. **Verify these are set**:

   - ✅ `DATABASE_URL` = `postgresql://postgres.itvdpoxxlrltuozxqfkd:Hanouti%40%40data@aws-1-eu-central-1.pooler.supabase.com:5432/postgres`
   - ✅ `NEXTAUTH_SECRET` = `7THuzESkgXNjK64ChCYaLIzkP8BrX1F1ivHWXjF5v9M=`
   - ✅ `AUTH_SECRET` = `7THuzESkgXNjK64ChCYaLIzkP8BrX1F1ivHWXjF5v9M=`
   - ✅ `NEXTAUTH_URL` = Your Vercel URL (e.g., `https://hanouti-omega.vercel.app`)

5. **If missing, add them**
6. **Redeploy** after adding/updating variables

## Verify Admin User Exists

The admin user should have been created when we seeded the database. 

**Admin credentials**:
- Email: `admin@hanouti.ma`
- Password: `admin123`

## If Login Still Fails

1. Check browser console for errors
2. Check Vercel logs for errors
3. Verify database connection is working
4. Try clearing browser cookies and logging in again

