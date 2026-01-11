#!/bin/bash
echo "🔍 PostgreSQL Setup Helper"
echo ""

# Check if PostgreSQL is running
if lsof -i :5432 > /dev/null 2>&1; then
    echo "✅ PostgreSQL is running on port 5432"
    echo ""
    echo "Let's try to connect and create the database..."
    
    # Try different connection methods
    if command -v psql &> /dev/null; then
        echo "Creating database 'hanouti'..."
        createdb hanouti 2>/dev/null && echo "✅ Database created!" || echo "⚠️  Database might already exist"
    else
        echo "⚠️  psql command not found in PATH"
        echo ""
        echo "If you're using Postgres.app:"
        echo "1. Open Postgres.app"
        echo "2. Click 'Initialize' if needed"
        echo "3. The connection string should be:"
        echo "   postgresql://$(whoami)@localhost:5432/postgres"
        echo ""
        echo "To add psql to PATH (if using Postgres.app):"
        echo "  sudo mkdir -p /usr/local/bin"
        echo "  sudo ln -s /Applications/Postgres.app/Contents/Versions/latest/bin/psql /usr/local/bin/psql"
    fi
else
    echo "❌ PostgreSQL is not running on port 5432"
    echo ""
    echo "Options:"
    echo "1. If you have Postgres.app: Open it and click 'Start'"
    echo "2. If you installed via installer: Start PostgreSQL service"
    echo "3. Check if PostgreSQL is installed in a different location"
fi
