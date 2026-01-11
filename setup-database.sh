#!/bin/bash
echo "🔍 Checking PostgreSQL installation..."

# Check if PostgreSQL is installed
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL found"
    psql --version
    echo ""
    echo "Creating database 'hanouti'..."
    createdb hanouti 2>/dev/null && echo "✅ Database 'hanouti' created" || echo "⚠️  Database might already exist or need permissions"
else
    echo "❌ PostgreSQL not found"
    echo ""
    echo "Quick setup options:"
    echo "1. Install via Homebrew: brew install postgresql@16 && brew services start postgresql@16"
    echo "2. Use cloud database (Supabase/Neon) - easier and free"
    echo "3. Use Docker: docker run --name postgres-hanouti -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=hanouti -p 5432:5432 -d postgres"
fi
