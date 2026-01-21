# Quick CSV Import Guide

## Step-by-Step: Import Your CSV Files

You've downloaded CSV files from Supabase. Here's how to import them:

---

## Step 1: Place CSV Files in the Project

1. **Open Finder** (on Mac)

2. **Navigate to:**
   ```
   /Users/ilyasmoktary/Desktop/Hanouti/scripts/data/
   ```

3. **Copy your CSV files** (from Downloads or wherever you saved them) into this folder:
   - `categories.csv`
   - `products.csv`
   - `users.csv` (if you have it)
   - `orders.csv` (if you have it)

**The folder path is:**
```
/Users/ilyasmoktary/Desktop/Hanouti/scripts/data/
```

**Tip:** You can drag and drop the CSV files into this folder!

---

## Step 2: Verify Files Are There

Open Terminal and run:
```bash
cd /Users/ilyasmoktary/Desktop/Hanouti
ls scripts/data/
```

You should see your CSV files listed.

---

## Step 3: Run the Import Script

In Terminal, run:
```bash
cd /Users/ilyasmoktary/Desktop/Hanouti
npx tsx scripts/import-from-csv.ts
```

**What will happen:**
- Script reads all CSV files from `scripts/data/`
- Imports categories (parents first, then children)
- Imports products (with category relationships)
- Imports users (if you have them)
- Shows progress for each record

**Example output:**
```
🚀 Starting CSV import to Neon...
📦 Importing Categories...
   Found 5 parent categories
   ✅ Imported category: Fruits & Légumes
   ✅ Imported category: Viandes
   ...
🛒 Importing Products...
   Found 20 products
   ✅ Imported product: Pommes
   ...
✅ Import completed successfully!
```

---

## Alternative: Quick Drag-and-Drop Method

### Using Finder:

1. **Open Finder**
2. **Press Cmd+Shift+G** (Go to Folder)
3. **Paste this path:**
   ```
   /Users/ilyasmoktary/Desktop/Hanouti/scripts/data
   ```
4. **Press Enter**
5. **Drag your CSV files** from Downloads into this window
6. **Run the import script** (Step 3 above)

---

## Troubleshooting

### Issue: "No categories.csv found"
**Solution:** 
- Make sure file is named exactly `categories.csv` (lowercase)
- Make sure it's in `scripts/data/` folder
- Check file location: `ls scripts/data/`

### Issue: "Error importing category"
**Solution:**
- Check CSV format matches expected columns
- Make sure CSV has headers (first row should have column names)
- Check for special characters that might cause issues

### Issue: "Category not found for product"
**Solution:**
- Make sure categories are imported first
- Check `categoryId` in products.csv matches a category ID in categories.csv

---

## CSV File Format

Your CSV files should have these columns:

### categories.csv:
- `id`, `nameFr`, `nameAr`, `slug`, `imageUrl`, `parentId`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`

### products.csv:
- `id`, `nameFr`, `nameAr`, `slug`, `description`, `price`, `imageUrl`, `categoryId`, `isActive`, `stock`, `createdAt`, `updatedAt`

---

## After Import

Once import is complete:
1. ✅ Your data is in Neon!
2. ✅ Visit your app: `https://hanouti.vercel.app`
3. ✅ Check categories page - should show your categories
4. ✅ Check products - should show your products

---

**Just place your CSV files in `scripts/data/` and run the script!** 🚀

