# Troubleshooting: Categories Not Showing

## Possible Causes

### 1. **Supabase Quota Exceeded (Most Likely)**

**Symptoms:**
- Categories page shows "Aucune catégorie disponible"
- Vercel logs show connection errors
- Supabase dashboard shows quota exceeded (494% egress)

**Fix:**
- **Upgrade Supabase plan** (recommended for production)
- **OR** reduce egress usage:
  - Increase cache times (`revalidate = 300` or `600`)
  - Optimize database queries
  - Use CDN caching

See `FIX_QUOTA_EXCEEDANCE.md` for detailed steps.

### 2. **All Categories Are Inactive**

**Symptoms:**
- Categories show in admin panel (admin doesn't filter by `isActive`)
- Categories don't show on public page (public page filters for `isActive: true`)

**Fix:**
1. Go to **Admin Panel** → **Categories**
2. Check if categories have the "Active" toggle enabled
3. Enable the toggle for categories you want to display
4. Verify categories have `parentId: null` (top-level categories only)

### 3. **No Categories in Database**

**Symptoms:**
- Categories don't show in admin panel
- Database query returns empty array

**Fix:**
1. Go to **Admin Panel** → **Categories**
2. Click **"Add Category"** or **"Create Category"**
3. Fill in the required fields:
   - Name (French)
   - Slug
   - Make sure "Active" is enabled
   - Leave "Parent Category" empty (for top-level categories)
4. Save the category

### 4. **Database Connection Issue**

**Symptoms:**
- Vercel logs show "Can't reach database server"
- Error: "PrismaClientInitializationError"
- Error: "MaxClientsInSessionMode"

**Fix:**
1. Check `DATABASE_URL` in Vercel environment variables
2. Verify connection string format:
   - Uses Session Pooler (port 5432) OR Transaction Mode (port 6543)
   - Password is URL-encoded: `Monopoli00%23%23%23`
   - Contains `pooler.supabase.com`
3. Redeploy after updating `DATABASE_URL`

See `USE_SESSION_POOLER.md` or `FIX_CONNECTION_POOL_ERRORS.md` for detailed steps.

## Diagnostic Steps

### Step 1: Check Admin Panel

1. Go to `/admin/categories`
2. **Do categories show here?**
   - ✅ **Yes** → Categories exist, check if they're active
   - ❌ **No** → Create categories first

### Step 2: Check Category Status

If categories show in admin:
1. Open a category in the admin panel
2. Check the **"Active"** toggle:
   - ✅ **Enabled** → Categories should show (if not, check connection)
   - ❌ **Disabled** → Enable the toggle and save

### Step 3: Check Vercel Logs

1. Go to **Vercel Dashboard** → **Deployments** → **Latest** → **Logs**
2. Look for errors:
   - `Database connection error` → Connection issue
   - `MaxClientsInSessionMode` → Quota exceeded
   - `Can't reach database server` → Connection string issue

### Step 4: Check Supabase Usage

1. Go to **Supabase Dashboard** → **Usage**
2. Check **Egress** quota:
   - **Over limit** → Upgrade plan or reduce usage
   - **Within limit** → Check other issues

## Quick Fixes

### Fix 1: Activate All Categories (If Inactive)

If categories exist but are inactive:
1. Go to Admin Panel → Categories
2. Enable "Active" toggle for all categories
3. Save

### Fix 2: Test Without Active Filter (Temporary)

To test if inactive categories are the issue, temporarily modify `app/categories/page.tsx`:

```typescript
// Temporarily remove isActive filter
const categories = await prisma.category.findMany({
  where: {
    // isActive: true,  // Comment this out temporarily
    parentId: null,
  },
  // ... rest of query
})
```

**⚠️ Remember to restore the filter after testing!**

### Fix 3: Check Connection String

1. Go to **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Check `DATABASE_URL`:
   - Should use Session Pooler or Transaction Mode
   - Password should be URL-encoded
   - Should contain `pooler.supabase.com`
3. Redeploy after making changes

## Expected Behavior

**When working correctly:**
- Categories show on `/categories` page
- Categories show on homepage (if configured)
- Admin panel shows all categories (active and inactive)
- Public pages show only active categories

**Query Logic:**
- Public pages filter for `isActive: true` AND `parentId: null`
- Admin pages show all categories (no `isActive` filter)
- Top-level categories only (no parent category)

## Still Not Working?

1. **Check Vercel logs** for specific error messages
2. **Check Supabase dashboard** for quota issues
3. **Verify categories exist** in admin panel
4. **Check category status** (Active toggle)
5. **Test database connection** by viewing admin panel

The diagnostic messages added to the categories page (in development) will help identify the specific issue.


