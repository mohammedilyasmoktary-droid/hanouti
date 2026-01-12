#!/bin/bash

# Script to seed production database
# Usage: ./seed-production.sh "your-database-url-here"

if [ -z "$1" ]; then
  echo "❌ Error: Please provide DATABASE_URL"
  echo "Usage: ./seed-production.sh \"postgresql://...\""
  echo ""
  echo "To get your DATABASE_URL:"
  echo "1. Go to: Vercel Dashboard → Settings → Environment Variables"
  echo "2. Click on DATABASE_URL to reveal the value"
  echo "3. Copy the entire URL"
  exit 1
fi

echo "🌱 Seeding production database..."
echo "This will create:"
echo "  - Admin user (admin@hanouti.ma / admin123)"
echo "  - All categories and subcategories"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Cancelled"
  exit 1
fi

echo ""
echo "🚀 Starting seed..."
echo ""

DATABASE_URL="$1" npx tsx prisma/seed.ts

echo ""
echo "✅ Done! Try logging in now:"
echo "   Email: admin@hanouti.ma"
echo "   Password: admin123"

