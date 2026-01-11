# Quick Setup Guide

## 1. Environment Setup

Create a `.env` file in the root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/hanouti?schema=public"
NEXTAUTH_SECRET="your-random-secret-here"
AUTH_SECRET="your-random-secret-here"
```

Generate a secure secret:
```bash
openssl rand -base64 32
```

## 2. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed categories (creates admin user + all categories)
npm run db:seed
```

## 3. Run Development Server

```bash
npm run dev
```

## 4. Access the App

- **Storefront**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Admin Login**: 
  - Email: `admin@hanouti.ma`
  - Password: `admin123`

## ✅ Verification Checklist

- [ ] Homepage loads with categories
- [ ] Category pages show subcategories
- [ ] Search page works (even when empty)
- [ ] Admin login redirects to `/admin`
- [ ] Admin can manage categories
- [ ] Categories can be nested (parent/child)
- [ ] Empty states display correctly

## 🎯 What's Included

✅ Complete grocery category taxonomy (15 top-level, 80+ subcategories)
✅ Beautiful storefront with empty states
✅ Professional admin panel
✅ Category CRUD with nesting
✅ Search functionality
✅ Responsive design
✅ Production-ready code

## 📝 Notes

- **No products seeded** - Only categories are created
- **Idempotent seed** - Safe to run multiple times
- **Change admin password** in production!

