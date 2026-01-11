# Push to GitHub - Quick Guide

## Step 1: Create a Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Name: `hanouti-deploy` (or any name you want)
4. Expiration: Choose how long it should be valid (30 days, 90 days, or no expiration)
5. Select scopes: Check **`repo`** (this gives full control of private repositories)
6. Click **"Generate token"** at the bottom
7. **IMPORTANT**: Copy the token immediately (you won't see it again!)

## Step 2: Push Your Code

Run this command in your terminal:

```bash
cd /Users/ilyasmoktary/Desktop/Hanouti
git push -u origin main
```

When prompted:
- **Username**: `mohammedilyasmoktary-droid`
- **Password**: Paste your personal access token (NOT your GitHub password)

That's it! Your code will be pushed to GitHub.

---

**Note**: The remote is already configured to use HTTPS. Just run the push command and use your token when asked for password.

