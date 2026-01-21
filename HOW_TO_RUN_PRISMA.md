# How to Run Prisma Commands

## Where to Run

Run Prisma commands in your **terminal/command line**, in your project directory.

---

## Step 1: Open Terminal

### On Mac:
1. Open **Terminal** app (found in Applications → Utilities)
2. Or press `Cmd + Space`, type "Terminal", press Enter

### On Windows:
1. Open **Command Prompt** or **PowerShell**
2. Or press `Win + R`, type `cmd`, press Enter

---

## Step 2: Navigate to Project Directory

Type this command (or copy-paste):

```bash
cd /Users/ilyasmoktary/Desktop/Hanouti
```

Press Enter.

**Verify you're in the right place:**
```bash
pwd
```

Should show: `/Users/ilyasmoktary/Desktop/Hanouti`

---

## Step 3: Run Prisma Commands

### Option A: Push Schema (Quick - Recommended)
```bash
npx prisma db push
```

### Option B: Using npm script (Alternative)
```bash
npm run db:push
```

Both do the same thing!

---

## What Happens When You Run It

When you run `npx prisma db push`:

1. **Prisma reads your schema:** `prisma/schema.prisma`
2. **Connects to database:** Uses `DATABASE_URL` from environment
3. **Creates tables:** Creates all tables (Category, Product, User, etc.)
4. **Shows results:** Tells you what was created

**Example output:**
```
✔ Generated Prisma Client
The database is now in sync with your Prisma schema.
```

---

## Setting Up DATABASE_URL Locally (If Needed)

If you want to run Prisma locally (not just on Vercel):

### Step 1: Get Neon Connection String
1. Go to **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Click **"View"** or **"Show"** to reveal the value
4. Copy it

### Step 2: Create .env.local File
```bash
# In your project directory
cd /Users/ilyasmoktary/Desktop/Hanouti

# Create .env.local file
touch .env.local

# Open it in a text editor (or use command below)
nano .env.local
```

### Step 3: Add DATABASE_URL
Add this line to `.env.local`:
```
DATABASE_URL="paste-your-neon-connection-string-here"
```

**Save and close** (in nano: `Ctrl+X`, then `Y`, then Enter)

---

## Alternative: Run Prisma in Vercel Build

You don't actually need to run Prisma locally! 

**Vercel can run it during deployment:**

1. **Add to package.json scripts:**
   ```json
   {
     "scripts": {
       "postinstall": "prisma generate",
       "build": "prisma generate && prisma db push && next build"
     }
   }
   ```

2. **Or run migrations in Vercel:**
   - Go to Vercel → Settings → Build & Development Settings
   - Add build command: `prisma generate && prisma db push && next build`

3. **Then redeploy** - Vercel will run Prisma automatically!

---

## Common Commands

```bash
# Push schema to database (creates/updates tables)
npx prisma db push

# Generate Prisma Client (after schema changes)
npx prisma generate

# Open Prisma Studio (visual database browser)
npx prisma studio

# Run migrations (if using migrations)
npx prisma migrate deploy

# Reset database (WARNING: deletes all data!)
npx prisma migrate reset
```

---

## Troubleshooting

### Issue: "Command not found: npx"
**Solution:**
```bash
# Make sure Node.js is installed
node --version

# If not installed, install Node.js from nodejs.org
# Or use npm instead:
npm exec prisma db push
```

### Issue: "Can't reach database server"
**Solution:**
- Make sure `DATABASE_URL` is set in `.env.local`
- Verify connection string is correct
- Check internet connection

### Issue: "Environment variable not found: DATABASE_URL"
**Solution:**
- Create `.env.local` file in project root
- Add `DATABASE_URL="your-connection-string"`
- Make sure file is named exactly `.env.local` (with the dot at start)

### Issue: "Schema validation error"
**Solution:**
- Check `prisma/schema.prisma` for syntax errors
- Make sure schema file is valid

---

## Quick Reference

**Current working directory:**
```
/Users/ilyasmoktary/Desktop/Hanouti
```

**Command to run:**
```bash
cd /Users/ilyasmoktary/Desktop/Hanouti
npx prisma db push
```

**Or use npm script:**
```bash
cd /Users/ilyasmoktary/Desktop/Hanouti
npm run db:push
```

---

## Still Need Help?

If you're having trouble:
1. Make sure you're in the project directory (`cd /Users/ilyasmoktary/Desktop/Hanouti`)
2. Make sure Node.js is installed (`node --version`)
3. Try running `npm install` first
4. Then run `npx prisma db push`

