# Image Upload Issue - Vercel Limitation

## Problem

**Vercel's file system is read-only**. You cannot save files to `/public/uploads/` on Vercel. The upload route will fail on Vercel because it tries to write to the file system.

## Solution: Use Image URLs (Immediate Fix)

Instead of uploading files, **use image URLs**:

1. **Find images**:
   - Unsplash: https://unsplash.com
   - Imgur: https://imgur.com
   - Any image hosting service

2. **Copy the image URL**:
   - Right-click image → "Copy image address"
   - Or copy the direct URL

3. **Paste in the form**:
   - When creating/editing products or categories
   - Paste the full URL in the "Image URL" field
   - Save

This works immediately and requires no code changes!

## Example URLs:

```
https://images.unsplash.com/photo-1542838132-92c53300491e?w=800
https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800
```

## For Real File Uploads (Future)

To enable actual file uploads, you need cloud storage:

1. **Supabase Storage** (Recommended - you already use Supabase)
2. **Vercel Blob Storage**
3. **Cloudinary**
4. **AWS S3**

I can help implement one of these if you want real file uploads later.

