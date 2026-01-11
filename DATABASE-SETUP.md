# Database Setup Guide

PostgreSQL is not currently installed on your system. Here are the easiest options:

## 🚀 Option 1: Cloud Database (RECOMMENDED - Easiest)

### Supabase (Free, 500MB database)
1. Go to https://supabase.com
2. Sign up for free
3. Create a new project
4. Go to Settings → Database
5. Copy the "Connection string" (URI format)
6. Paste it into your `.env` file as `DATABASE_URL`

### Neon (Free, Serverless PostgreSQL)
1. Go to https://neon.tech
2. Sign up for free
3. Create a new project
4. Copy the connection string
5. Paste it into your `.env` file as `DATABASE_URL`

**Advantages:**
- ✅ No installation needed
- ✅ Free tier available
- ✅ Works immediately
- ✅ Can access from anywhere

---

## 🐳 Option 2: Docker (If you have Docker installed)

```bash
docker run --name postgres-hanouti \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=hanouti \
  -p 5432:5432 \
  -d postgres

# Then update .env:
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hanouti?schema=public"
```

---

## 💻 Option 3: Install PostgreSQL Locally

### Using Homebrew:
```bash
# Install PostgreSQL
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Create database
createdb hanouti

# Update .env with:
# DATABASE_URL="postgresql://$(whoami)@localhost:5432/hanouti?schema=public"
```

### Using Postgres.app (macOS GUI):
1. Download from https://postgresapp.com
2. Install and start the app
3. Click "Initialize" to create a server
4. Use the connection string shown in the app

---

## ✅ After Database is Set Up

Once you have a working `DATABASE_URL` in your `.env` file, run:

```bash
# Push schema to database
npx prisma db push

# Seed categories
npx tsx prisma/seed.ts

# Start dev server
npm run dev
```

---

## 🎯 Quick Start (Cloud Database)

1. Sign up at https://supabase.com (takes 2 minutes)
2. Create project → Copy connection string
3. Paste into `.env` as `DATABASE_URL`
4. Run: `npx prisma db push && npx tsx prisma/seed.ts`
5. Run: `npm run dev`

Done! 🎉

