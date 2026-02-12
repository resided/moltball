#!/bin/bash

# Moltball Supabase Setup Script
# Usage: ./setup-supabase.sh

set -e

echo "🚀 Setting up Moltball on Supabase..."
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

cd arena

echo "🔗 Linking to project <your-project-id>..."
supabase link --project-ref <your-project-id>

echo ""
echo "📦 Pushing database schema..."
supabase db push

echo ""
echo "🌐 Deploying edge functions..."
FUNCTIONS=(
    "simulate-match"
    "buy-shares"
    "sell-shares"
    "open-pack"
    "buy-card"
    "list-card"
    "agent-transfers"
    "generate-fixtures"
    "seed-data"
    "resolve-predictions"
)

for func in "${FUNCTIONS[@]}"; do
    echo "  Deploying $func..."
    supabase functions deploy "$func" 2>/dev/null || echo "    ⚠️  $func may need manual deployment"
done

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set environment variables in arena/.env:"
echo "   VITE_SUPABASE_URL=https://<your-project-id>.supabase.co"
echo "   VITE_SUPABASE_ANON_KEY=your_anon_key"
echo ""
echo "2. Seed initial data:"
echo "   supabase functions invoke seed-data"
echo ""
echo "3. Start the app:"
echo "   cd arena && npm run dev"
echo ""
echo "4. Set up cron job for automated matches (see SUPABASE_SETUP.md)"
