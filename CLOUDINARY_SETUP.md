# Cloudinary Setup Guide

Cloudinary is now integrated for image uploads. Follow these steps to set it up:

## 1. Create a Cloudinary Account

1. Go to https://cloudinary.com
2. Sign up for a free account (25GB storage, 25GB bandwidth/month)
3. After signing up, you'll be taken to your dashboard

## 2. Get Your Cloudinary Credentials

From your Cloudinary dashboard:

1. Copy your **Cloud Name** (visible at the top of the dashboard)
2. Copy your **API Key** (under "Account Details")
3. Copy your **API Secret** (under "Account Details" - click "Reveal")

## 3. Add Environment Variables

### Local Development (.env file)

Add these to your `.env` file:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add these three variables:
   - `CLOUDINARY_CLOUD_NAME` = your cloud name
   - `CLOUDINARY_API_KEY` = your API key
   - `CLOUDINARY_API_SECRET` = your API secret
4. **Important**: Make sure to add them for **Production**, **Preview**, and **Development** environments
5. **Redeploy** your application after adding the variables

## 4. Test Image Upload

1. Go to your admin panel
2. Try uploading an image when creating/editing a category or product
3. The image should upload to Cloudinary and the URL will be saved automatically

## ✅ That's It!

Once configured, image uploads will work on both local development and Vercel production.

## 📝 Notes

- Images are uploaded to a folder called `hanouti` in your Cloudinary account
- Free tier includes 25GB storage and 25GB bandwidth per month
- Images are automatically optimized by Cloudinary
- You can manage uploaded images in your Cloudinary dashboard

