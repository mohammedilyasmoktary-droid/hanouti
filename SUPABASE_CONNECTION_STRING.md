# How to Find Supabase Connection String

## Method 1: Through Settings → Database
1. Go to **Settings** (left sidebar) → **Database**
2. Scroll down to find **"Connection string"** section
3. Select **"URI"** tab (not Connection pooling)
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your database password

## Method 2: Click "Connect" Button
1. Click the **"Connect"** button (top right of dashboard)
2. Look for "Connection string" or "Connection pooling"
3. Select "URI" format
4. Copy the connection string

## Method 3: Project Settings → API
1. Go to **Settings** (left sidebar)
2. Click **"API"** (might be under Project Settings)
3. Look for "Database URL" or "Connection string"
4. Copy the connection string

## Format Should Look Like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

OR (with pooling):
```
postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-xx-x.pooler.supabase.com:6543/postgres
```

## Your Project Details:
- **Project Reference**: `itvdpoxxlrltuozxqfkd` (from your URL)
- **Connection string format**: 
  ```
  postgresql://postgres:[YOUR-PASSWORD]@db.itvdpoxxlrltuozxqfkd.supabase.co:5432/postgres
  ```

Just replace `[YOUR-PASSWORD]` with the password you created when setting up the project!

