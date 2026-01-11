# Fix Image Uploads on Vercel

## Problem

Vercel's file system is **read-only**. You cannot save files directly to the file system on Vercel. The current upload route tries to save files to `/public/uploads/`, which won't work on Vercel.

## Solutions

### Option 1: Use Image URLs (Simplest - Current Approach)

Instead of uploading files, use **image URLs**:
- Use URLs from Unsplash, Imgur, or other image hosting services
- Paste the full URL in the image URL field when creating/editing products/categories
- No code changes needed - just use URLs instead of uploading

### Option 2: Use Supabase Storage (Recommended - Free)

Since you're already using Supabase for the database, use Supabase Storage:

1. **Enable Supabase Storage**:
   - Go to: https://supabase.com/dashboard/project/itvdpoxxlrltuozxqfkd/storage
   - Create a bucket called `uploads` (make it public)
   
2. **Update upload route** to use Supabase Storage API

3. **Benefits**: Free tier, already using Supabase, easy integration

### Option 3: Use Vercel Blob Storage

1. **Install Vercel Blob**:
   ```bash
   npm install @vercel/blob
   ```

2. **Update upload route** to use Vercel Blob

3. **Benefits**: Integrated with Vercel, simple API

### Option 4: Use Cloudinary (Popular Choice)

1. **Sign up**: https://cloudinary.com (free tier available)

2. **Install SDK**: `npm install cloudinary`

3. **Update upload route** to use Cloudinary

4. **Benefits**: Image optimization, transformations, CDN

## For Now (Quick Fix)

**Use image URLs** - it's the simplest solution and works immediately:
- Find images on Unsplash, Imgur, or any image hosting service
- Copy the full URL
- Paste it in the "Image URL" field when creating/editing products/categories

This requires no code changes and works right away!

