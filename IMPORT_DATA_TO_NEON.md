# Import Data to Neon - Complete Guide

## Quick Overview

Once you export data from Supabase, you can import it to Neon using:
1. **Prisma Studio** (Easiest - Visual UI)
2. **Import Script** (Automated)
3. **Neon SQL Editor** (If exported as SQL)
4. **CSV Import Script** (If exported as CSV)

---

## Step 1: Export Data from Supabase

### From Supabase Dashboard:
1. Go to **Table Editor**
2. For each table (`Category`, `Product`, `User`, etc.):
   - Click on the table
   - Click **"..."** (three dots) → **"Export"**
   - Choose format: **CSV** or **JSON**
   - Download the file

**Important:** Export in this order:
1. **Categories** (parent categories first, then children)
2. **Products**
3. **Users**
4. **Orders** (then OrderItems)
5. **Contact Messages**
6. **Homepage Content**

---

## Method 1: Import Using Prisma Studio (Easiest!)

This is the easiest way - just use a visual interface!

### Step 1: Open Prisma Studio
```bash
cd /Users/ilyasmoktary/Desktop/Hanouti
npx prisma studio
```

This opens a web interface at `http://localhost:5555`

### Step 2: Import Data Manually
1. **For Categories:**
   - Click **"Category"** in the left sidebar
   - Click **"Add record"** button
   - Fill in the fields from your CSV/exported data
   - Click **"Save 1 change"**
   - Repeat for each category

2. **For Products:**
   - Click **"Product"** in the left sidebar
   - Click **"Add record"** button
   - Fill in the fields from your CSV/exported data
   - Make sure `categoryId` matches an existing category
   - Click **"Save 1 change"**
   - Repeat for each product

3. **For Users, Orders, etc.:**
   - Same process - just add records one by one

**Note:** This works great if you have a small number of records (< 50). For more, use the import script below.

---

## Method 2: Import Using Script (Automated)

I'll create a script that can import CSV or JSON data automatically.

### Step 1: Export from Supabase as CSV

1. Go to **Table Editor** → Select table → **"..."** → **"Export"** → **CSV**
2. Save files:
   - `categories.csv`
   - `products.csv`
   - `users.csv`
   - etc.

### Step 2: Place CSV Files in Scripts Folder

Put your CSV files in: `/scripts/data/`

```bash
mkdir -p /Users/ilyasmoktary/Desktop/Hanouti/scripts/data
# Move your CSV files there
```

### Step 3: Run Import Script

```bash
cd /Users/ilyasmoktary/Desktop/Hanouti
npx tsx scripts/import-from-csv.ts
```

The script will automatically:
- Read CSV files
- Parse data
- Import to Neon
- Handle relationships (categoryId, etc.)

---

## Method 3: Import Using Neon SQL Editor

If you exported as SQL or have SQL statements:

### Step 1: Get Your Data as SQL

From Supabase:
1. Go to **Table Editor**
2. Select table
3. Click **"..."** → **"Export"** → **SQL** (if available)
4. Or use pg_dump (see below)

### Step 2: Import to Neon

1. Go to **Neon Dashboard**: https://console.neon.tech
2. Select your database
3. Click **"SQL Editor"** or **"Query"**
4. Paste your SQL INSERT statements
5. Click **"Run"** or **"Execute"**

**Example SQL:**
```sql
INSERT INTO "Category" (id, nameFr, nameAr, slug, imageUrl, sortOrder, isActive, createdAt, updatedAt)
VALUES 
  ('clx123...', 'Fruits & Légumes', 'فواكه وخضروات', 'fruits-legumes', 'https://...', 1, true, NOW(), NOW()),
  ('clx456...', 'Viandes', 'لحوم', 'viandes', 'https://...', 2, true, NOW(), NOW());
```

---

## Method 4: Using pg_dump (If You Have Access)

If Supabase is accessible via command line:

### Step 1: Export from Supabase
```bash
pg_dump "postgresql://postgres:Hanouti%40%40data@db.itvdpoxxlrltuozxqfkd.supabase.co:5432/postgres" \
  --data-only \
  --table=Category \
  --table=Product \
  --table=User \
  --table=Order \
  > supabase_data.sql
```

### Step 2: Import to Neon
```bash
psql "postgresql://neondb_owner:npg_3IrGMsofBd5v@ep-purple-king-ag756035-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require" < supabase_data.sql
```

---

## Create Import Script (Recommended)

I'll create a script that can import CSV data. First, let me know:

1. **What format did you export from Supabase?** (CSV, JSON, SQL)
2. **How many records do you have?** (Approximate)

Once I know, I'll create the perfect import script for you!

---

## Quick Start: Manual Import via Prisma Studio

**For now, the easiest way:**

1. **Open Prisma Studio:**
   ```bash
   cd /Users/ilyasmoktary/Desktop/Hanouti
   npx prisma studio
   ```

2. **It opens at:** `http://localhost:5555`

3. **Manually add data:**
   - Open your exported CSV/JSON files
   - Copy data from Supabase
   - Paste into Prisma Studio forms
   - Save each record

**This works great if you have 10-50 records!**

---

## Summary

**Best options:**
1. ✅ **Prisma Studio** - Easiest for small datasets
2. ✅ **Import Script** - Best for large datasets (I'll create it)
3. ✅ **Neon SQL Editor** - Good if you have SQL exports
4. ✅ **pg_dump** - Best if Supabase is accessible

**Tell me what format you exported, and I'll create the perfect import script for you!** 🚀

