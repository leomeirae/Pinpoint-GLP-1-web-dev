#!/bin/bash

# Script para aplicar migrations de correção de RLS
# Uso: ./scripts/apply-rls-fix.sh

set -e

echo "🔧 Applying RLS fixes for Clerk integration..."
echo ""

# Verificar se Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

echo "📋 Migrations to apply:"
echo "  - 012_fix_users_rls_for_clerk.sql"
echo "  - 013_fix_all_rls_for_clerk.sql"
echo ""

# Verificar se está linkado ao projeto
if [ ! -f ".git/config" ]; then
    echo "⚠️  Not in a git repository. Make sure you're in the project root."
    exit 1
fi

# Opção 1: Push todas as migrations pendentes
echo "🚀 Option 1: Push all pending migrations"
echo "   Run: npx supabase db push"
echo ""

# Opção 2: Link e push (se não estiver linkado)
echo "🔗 Option 2: Link and push (if not linked)"
echo "   Run: npx supabase link --project-ref iokunvykvndmczfzdbho"
echo "   Then: npx supabase db push"
echo ""

# Opção 3: Executar SQL manualmente
echo "📝 Option 3: Run SQL manually in Supabase Dashboard"
echo "   1. Go to: https://supabase.com/dashboard/project/iokunvykvndmczfzdbho/sql"
echo "   2. Copy and paste the SQL from:"
echo "      - supabase/migrations/012_fix_users_rls_for_clerk.sql"
echo "      - supabase/migrations/013_fix_all_rls_for_clerk.sql"
echo "   3. Execute"
echo ""

# Perguntar qual opção usar
read -p "Which option do you want to use? (1/2/3): " option

case $option in
  1)
    echo "🚀 Running: npx supabase db push"
    npx supabase db push
    echo "✅ Migrations applied successfully!"
    ;;
  2)
    echo "🔗 Linking to project..."
    npx supabase link --project-ref iokunvykvndmczfzdbho
    echo "🚀 Pushing migrations..."
    npx supabase db push
    echo "✅ Migrations applied successfully!"
    ;;
  3)
    echo ""
    echo "📋 SQL for Migration 012:"
    echo "================================"
    cat supabase/migrations/012_fix_users_rls_for_clerk.sql
    echo ""
    echo "================================"
    echo ""
    echo "📋 SQL for Migration 013:"
    echo "================================"
    cat supabase/migrations/013_fix_all_rls_for_clerk.sql
    echo "================================"
    echo ""
    echo "📝 Copy the SQL above and execute in Supabase Dashboard"
    echo "   URL: https://supabase.com/dashboard/project/iokunvykvndmczfzdbho/sql"
    ;;
  *)
    echo "❌ Invalid option. Exiting."
    exit 1
    ;;
esac
