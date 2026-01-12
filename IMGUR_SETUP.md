# Imgur Setup (2 minutes - Free Forever)

Imgur uploads need a Client ID. Here's how to get one:

## Quick Setup:

1. **Go to**: https://api.imgur.com/oauth2/addclient
2. **Fill the form**:
   - Application name: `Hanouti` (or anything)
   - Authorization type: Select **"Anonymous usage without user authorization"**
   - Authorization callback URL: Leave empty or use `https://hanouti-omega.vercel.app`
   - Application website: Leave empty or use your site URL
   - Email: Your email
3. **Click "Submit"**
4. **Copy the Client ID** (it will be shown on the next page)

## Add to Vercel:

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add: `IMGUR_CLIENT_ID` = (paste your Client ID)
3. Make sure it's added for **Production**, **Preview**, and **Development**
4. **Redeploy** your application

## That's It!

After redeploying, image uploads will work immediately. No credit card, no payment, completely free.

