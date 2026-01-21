# Recover Images Guide

## Problem

Your images are stored as base64 data in the CSV files, but they're too large to store directly in PostgreSQL. The import script skipped them.

## Solution Options

### Option 1: Manual Upload via Admin Panel (Easiest)

**If you have access to your images in Supabase or locally:**

1. **Go to your admin panel:** `https://hanouti.vercel.app/admin`
2. **Edit each category/product:**
   - Click "Edit" on the category/product
   - Upload the image using the file upload
   - Save

**This works if you have the original image files.**

---

### Option 2: Extract Images from CSV and Upload

**If the base64 images are in your CSV:**

1. **Extract images from CSV** (I can create a script for this)
2. **Save them as image files**
3. **Upload them to a free image hosting service:**
   - Imgur (free, no account needed)
   - ImgBB (free, simple API)
   - Cloudinary (free tier available)

4. **Update database with image URLs**

---

### Option 3: Use Supabase Storage (If Available)

**If your images were stored in Supabase Storage:**

1. **Check Supabase Dashboard** → **Storage**
2. **Download images from Supabase Storage**
3. **Upload to Neon/Neon Storage** or another service
4. **Update database with new URLs**

---

### Option 4: Use Cloudinary (Recommended for Production)

**Best long-term solution:**

1. **Sign up for Cloudinary** (free tier available): https://cloudinary.com
2. **Get API credentials**
3. **Upload images programmatically**
4. **Update database with Cloudinary URLs**

**Benefits:**
- ✅ Image optimization
- ✅ CDN delivery
- ✅ Automatic transformations
- ✅ Free tier (25GB storage, 25GB bandwidth)

---

## Quick Fix: Manual Image Upload

**Right now, the easiest way is:**

1. **Open your admin panel:**
   - Go to: `https://hanouti.vercel.app/admin`
   - Log in

2. **For each category/product without image:**
   - Click "Edit"
   - Use the image upload button
   - Select image file
   - Save

**Or use image URLs:**
- Find images on Unsplash, Imgur, or other services
- Copy image URL
- Paste in "Image URL" field
- Save

---

## Automated Solution (Coming)

I'm working on a script that will:
1. Extract base64 images from CSV
2. Upload them to Imgur (free, no API key needed for small images)
3. Update database with image URLs

**Status:** Script created, but image hosting API is having issues. Working on alternative solution.

---

## Recommendation

**For now:**
- Use image URLs from free image services (Unsplash, Imgur, etc.)
- Or manually upload images through admin panel

**Long-term:**
- Set up Cloudinary for image hosting
- Or use Vercel Blob Storage
- Or use Neon's storage if available

---

**Want me to help set up automated image recovery, or would you prefer to add images manually through the admin panel?**

