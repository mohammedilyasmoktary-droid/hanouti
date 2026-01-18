# Fix "Invalid port number in database URL" Error

## Problem

You're getting this error in Vercel:
```
Error parsing connection string: invalid port number in database URL
```

This means your `DATABASE_URL` in Vercel has a formatting issue.

## Common Causes

1. **Double `@` symbols in password** - Password contains `@` which breaks the URL format
2. **Missing URL encoding** - Special characters in password need to be encoded
3. **Malformed connection string** - Extra spaces or characters

## Solution

### Step 1: Get the Connection String from Supabase

1. Go to **Supabase Dashboard** → Your Project → **Settings** → **Database**
2. Click **Connection Pooling**
3. Select **Transaction Mode** (port 6543)
4. Copy the connection string

It should look like:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Step 2: URL Encode the Password (IMPORTANT!)

If your password contains special characters like `@`, `#`, `%`, etc., you MUST URL-encode them:

- `@` becomes `%40`
- `#` becomes `%23`
- `%` becomes `%25`
- `&` becomes `%26`
- Space becomes `%20`

**Example:**
If your password is `Hanouti@@data`, it should be:
```
Hanouti%40%40data
```

### Step 3: Update Vercel Environment Variable

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Click **Edit**
4. Paste the connection string with URL-encoded password
5. **VERIFY the format:**
   - Starts with `postgresql://`
   - Has `postgres.[PROJECT-REF]` or `postgres` followed by colon and password
   - Password is URL-encoded (no raw `@` symbols)
   - Has `@aws-0-[REGION].pooler.supabase.com:6543` (port 6543!)
   - Ends with `/postgres?pgbouncer=true`
6. Click **Save**
7. **Redeploy** your application

### Step 4: Verify Connection String Format

The connection string should follow this pattern:
```
postgresql://postgres.[PROJECT-REF]:[URL-ENCODED-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Example (with fake values):**
```
postgresql://postgres.abcdefghijklmnopqrst:MyPassword%40123@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Quick Test

You can test if your connection string is valid by checking:
- Does it start with `postgresql://`? ✅
- Does it contain only ONE `@` symbol (between password and hostname)? ✅
- Does it use port `6543`? ✅
- Are special characters in password URL-encoded? ✅

## Still Having Issues?

If you're still getting errors, try:
1. Double-check the connection string in Supabase
2. Make sure you copied the **entire** string (no truncation)
3. Verify no extra spaces before/after the string
4. Try removing and re-adding the environment variable in Vercel


