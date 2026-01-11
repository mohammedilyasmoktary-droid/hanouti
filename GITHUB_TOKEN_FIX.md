# Fix GitHub 403 Error

You're getting a 403 Permission Denied error. This usually means your token doesn't have the right permissions.

## Solution: Create a New Token with Proper Permissions

1. **Go to**: https://github.com/settings/tokens/new
   - Make sure to select **"Generate new token (classic)"**

2. **Settings:**
   - **Note**: `hanouti-deploy` (or any name)
   - **Expiration**: Choose how long (90 days recommended)
   - **Select scopes**: 
     - ✅ **`repo`** - This is CRITICAL - check this entire section
       - This gives full control of private repositories

3. **Click**: "Generate token" at the bottom

4. **Copy the new token** immediately (you won't see it again!)

5. **In your terminal**, run:
   ```bash
   git push -u origin main
   ```

6. **When prompted:**
   - Username: `mohammedilyasmoktary-droid`
   - Password: **Paste your NEW token** (use Cmd+V even though nothing shows)
   - Press Enter

## Alternative: Use GitHub Desktop

If tokens keep causing issues, you can use GitHub Desktop:

1. Download: https://desktop.github.com
2. Sign in with GitHub
3. Clone your repository
4. Push through the GUI (no tokens needed)

## Alternative: Upload Files via Web

If all else fails, you can upload files directly through GitHub's web interface (not ideal for large projects, but works).

