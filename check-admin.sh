#!/bin/bash

# Script to check if admin user exists in production database
# Usage: ./check-admin.sh "your-database-url-here"

if [ -z "$1" ]; then
  echo "❌ Error: Please provide DATABASE_URL"
  echo "Usage: ./check-admin.sh \"postgresql://...\""
  echo ""
  echo "To get your DATABASE_URL:"
  echo "1. Go to: Vercel Dashboard → Settings → Environment Variables"
  echo "2. Click on DATABASE_URL to reveal the value"
  echo "3. Copy the entire URL"
  exit 1
fi

echo "🔍 Checking if admin user exists..."
echo ""

DATABASE_URL="$1" npx prisma studio &
PRISMA_PID=$!

echo "✅ Prisma Studio started!"
echo "👉 Open http://localhost:5555 in your browser"
echo "👉 Click on 'User' table"
echo "👉 Look for 'admin@hanouti.ma'"
echo ""
echo "Press Ctrl+C to stop Prisma Studio when done"
echo ""

wait $PRISMA_PID

