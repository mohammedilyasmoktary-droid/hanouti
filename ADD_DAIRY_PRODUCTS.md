# Add Dairy Products to Database

## Option 1: Use Admin UI (Easiest - Recommended)

1. **Deploy the changes** (if not already deployed):
   ```bash
   git add .
   git commit -m "Add quick-add products feature"
   git push origin main
   ```

2. **Wait for Vercel deployment** to complete

3. **Go to admin panel**: https://hanouti-omega.vercel.app/admin/quick-add

4. **For each subcategory** (Lait, Lben & Raib, Yaourts, Fromages, Beurre & Crème, Œufs):
   - Select the subcategory from dropdown
   - Click "Ajouter 4 produits de démarrage"
   - Wait for success message
   - Repeat for next subcategory

## Option 2: Use Script with Production Database

1. **Get your production DATABASE_URL**:
   - Go to: https://vercel.com/dashboard
   - Select your "hanouti" project
   - Go to: **Settings** → **Environment Variables**
   - Find `DATABASE_URL` and click to reveal the value
   - Copy the entire URL

2. **Run the script**:
   ```bash
   DATABASE_URL="your-production-database-url-here" npm run add:dairy-products
   ```

   Or:
   ```bash
   DATABASE_URL="your-production-database-url-here" npx tsx scripts/add-dairy-products.ts
   ```

3. **Verify**: Check your admin panel or category pages to see the products

## What Gets Added

- **Lait**: 4 products (Centrale Danone, Jaouda, Candia)
- **Lben & Raib**: 4 products (Jaouda, Centrale Danone)
- **Yaourts**: 4 products (Centrale Danone, Jaouda, Danone)
- **Fromages**: 4 products (La Vache qui rit, Président, Kiri)
- **Beurre & Crème**: 4 products (Président, Centrale Danone, Elle & Vire)
- **Œufs**: 4 products (Local brand)

**Total: 24 products** across 6 subcategories

Each product includes:
- Name, brand, size, price (MAD)
- Stock: 50
- Active: true
- Placeholder image

