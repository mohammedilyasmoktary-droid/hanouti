# Hanouti - Premium Moroccan Grocery Web App

A modern, production-ready MVP for a premium Moroccan grocery store with a beautiful storefront and professional admin panel.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI)
- **Database**: Prisma + PostgreSQL
- **Authentication**: NextAuth.js (Credentials)
- **Validation**: Zod
- **Forms**: React Hook Form

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud)

## 🛠️ Setup Instructions

### 1. Clone and Install

```bash
cd hanouti
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/hanouti?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
AUTH_SECRET="your-secret-key-here-change-in-production"
```

**Important**: Generate a secure secret for production:
```bash
openssl rand -base64 32
```

### 3. Database Setup

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database with categories and products (idempotent - safe to run multiple times)
npm run db:seed
```

**Note**: The seed script creates:
- 8 top-level categories with subcategories
- Exactly 10 starter products (Morocco-relevant items)
- Admin user for login

### 4. Run Development Server

```bash
npm run dev
```

Visit:
- **Storefront**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin

## 🔐 Admin Login

After seeding, use these credentials:

- **Email**: `admin@hanouti.ma`
- **Password**: `admin123`

**⚠️ Change the admin password immediately in production!**

## 📁 Project Structure

```
hanouti/
├── app/
│   ├── admin/              # Admin panel pages
│   │   ├── categories/     # Category management
│   │   ├── products/       # Products (placeholder)
│   │   └── login/          # Admin login
│   ├── api/                # API routes
│   ├── categories/         # Public category pages
│   ├── products/           # Public product pages
│   ├── search/             # Search page
│   └── page.tsx            # Homepage
├── components/
│   ├── admin/              # Admin components
│   ├── layout/              # Header, Footer
│   └── ui/                  # shadcn/ui components
├── lib/
│   ├── auth.ts             # NextAuth configuration
│   └── prisma.ts           # Prisma client
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed script
└── types/
    └── next-auth.d.ts      # NextAuth type definitions
```

## 🎯 Features

### Storefront (Public)

- ✅ **Homepage**: Hero section, search bar, featured categories
- ✅ **Category Pages**: Display categories with subcategories and products
- ✅ **Search**: Full-text search across products (works even when empty)
- ✅ **Product Pages**: Individual product detail pages
- ✅ **Empty States**: Graceful handling when no products exist
- ✅ **Responsive Design**: Mobile-first, works on all devices

### Admin Panel

- ✅ **Authentication**: Secure admin login with NextAuth
- ✅ **Route Protection**: Only ADMIN users can access `/admin/*`
- ✅ **Categories Management**: Full CRUD for categories and subcategories
  - Create/edit/delete categories
  - Nest categories (parent/child relationships)
  - Reorder categories (sortOrder)
  - Toggle visibility (isActive)
  - Image URLs
  - French + Arabic names
- ✅ **Products Page**: Placeholder ready for future implementation
- ✅ **Dashboard**: Overview statistics

## 📊 Database Schema

### User
- `id`, `email`, `name`, `password`, `role` (ADMIN/CUSTOMER)

### Category
- `id`, `nameFr`, `nameAr`, `slug`, `imageUrl`
- `parentId` (for nesting), `sortOrder`, `isActive`
- Self-referential relationship for parent/child

### Product
- `id`, `nameFr`, `nameAr`, `slug`, `description`
- `price` (Decimal), `imageUrl`, `stock`
- `categoryId`, `isActive`

## 🌱 Seeded Data

The seed script creates a clean starter catalog:

### Categories (8 top-level + subcategories)

1. **Fruits & Légumes** (2 subcategories: Fruits frais, Légumes frais)
2. **Viandes & Poissons**
3. **Produits laitiers & Œufs** (2 subcategories: Lait, Œufs)
4. **Boulangerie** (1 subcategory: Pain)
5. **Épicerie salée** (2 subcategories: Pâtes & Riz, Huiles & Vinaigres)
6. **Épicerie sucrée**
7. **Boissons** (2 subcategories: Eau, Thé & Café)
8. **Entretien & Ménage** (1 subcategory: Produits lessive)

### Products (Exactly 10 items)

1. Tomates (1 kg) - 8.50 MAD
2. Bananes (1 kg) - 12.00 MAD
3. Lait 1L - 7.50 MAD
4. Œufs (boîte de 12) - 18.00 MAD
5. Pain baguette - 2.50 MAD
6. Couscous moyen 1 kg - 15.00 MAD
7. Huile d'olive 1L - 45.00 MAD
8. Eau minérale 1.5L - 4.50 MAD
9. Thé vert à la menthe (boîte) - 22.00 MAD
10. Lessive (2L) - 35.00 MAD

All products are Morocco-relevant with French names, Arabic translations, and realistic MAD pricing.

## ✅ Verification Checklist

After setup, verify:

- [ ] Homepage loads with featured categories
- [ ] Category pages show subcategories and products
- [ ] Products are visible on category pages
- [ ] Product detail pages work correctly
- [ ] Search page works and finds products
- [ ] Admin login redirects to `/admin` dashboard
- [ ] Admin can access `/admin/categories`
- [ ] Admin can create/edit/delete categories
- [ ] Admin can nest categories (parent/child)
- [ ] Admin can toggle category visibility
- [ ] Admin can add/edit products (when product management is implemented)
- [ ] Logout works and redirects to login

## 🎨 Design Philosophy

- **Premium & Modern**: Clean, spacious design with Moroccan influences
- **Perfect Alignment**: Consistent container widths, spacing, and card sizes
- **Accessibility**: Focus states, keyboard navigation, proper contrast
- **Performance**: Optimized images, minimal JavaScript, fast loading
- **Empty States**: Every page handles empty data gracefully

## 🚧 Future Enhancements

- Product management (CRUD)
- Image upload (currently uses URLs)
- Inventory management
- Order management
- Customer accounts
- Shopping cart & checkout
- Payment integration
- Delivery management

## 📝 Notes

- **Starter catalog**: Seed includes 8 categories and 10 products to get you started.
- **Idempotent seed**: Safe to run `npm run db:seed` multiple times (uses upsert).
- **Add more products**: Use the admin panel to add/edit products and categories.
- **Production ready**: All code follows best practices, but change admin password!

## 🐛 Troubleshooting

### Database connection issues
- Verify `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Check database exists

### Prisma errors
- Run `npm run db:generate` after schema changes
- Run `npm run db:push` to sync schema

### Authentication issues
- Verify `NEXTAUTH_SECRET` is set
- Clear browser cookies
- Check middleware configuration

## 📄 License

Private project - All rights reserved

---

Built with ❤️ for premium Moroccan grocery shopping
