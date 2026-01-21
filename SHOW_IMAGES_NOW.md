# How to See Images on Homepage Now

## ✅ Images Are Uploaded!

**26 category images** and **5 product images** have been successfully uploaded to your database.

---

## Why You Don't See Them Yet

The homepage is **cached for 1 hour** (`revalidate = 3600`). The images were just uploaded, so the cached version doesn't have them yet.

---

## Solutions (Choose One)

### Option 1: Wait (Easiest)
- Wait up to **1 hour** for the cache to expire
- Images will appear automatically

### Option 2: Hard Refresh (Quick)
- **On Mac:** Press `Cmd + Shift + R`
- **On Windows:** Press `Ctrl + Shift + R`
- This forces your browser to bypass cache

### Option 3: Trigger Revalidation (Best)
After the code is deployed, visit this URL:
```
https://hanouti.vercel.app/api/revalidate?path=/&secret=revalidate-2024
```

This will immediately clear the homepage cache and show the images!

### Option 4: Redeploy (Automatic)
- The code is already pushed to GitHub
- Vercel will automatically redeploy
- After deployment, images will be visible

---

## Verify Images Are in Database

The images are definitely in your database:
- ✅ 26 category images uploaded
- ✅ 5 product images uploaded
- ✅ All parent categories have images

---

## After Revalidation

Once the cache is cleared, you should see:
- ✅ Category images on homepage
- ✅ Product images on product pages
- ✅ All images loading properly

---

**Quick Fix:** Visit the revalidation URL above after deployment, or just wait 1 hour!

