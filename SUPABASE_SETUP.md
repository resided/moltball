# Supabase Setup Guide

## Deploy to Your Project

Your project ID: `<your-project-id>`

### 1. Install Supabase CLI (if not already)

```bash
npm install -g supabase
```

### 2. Link to Your Project

```bash
cd arena
supabase link --project-ref <your-project-id>
```

### 3. Push Database Schema

```bash
supabase db push
```

This will deploy all 5 migration files:
- Main schema (13 tables)
- Player constraints
- pg_cron/pg_net extensions
- User wallets & holdings
- Rarity tiers & pack types

### 4. Set Up Environment Variables

In your Supabase Dashboard → Project Settings → API:

```
Project URL: https://<your-project-id>.supabase.co
anon key: [get from dashboard]
service_role key: [get from dashboard]
```

Update `arena/.env`:
```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 5. Deploy Edge Functions

```bash
supabase functions deploy simulate-match
supabase functions deploy buy-shares
supabase functions deploy sell-shares
supabase functions deploy open-pack
supabase functions deploy buy-card
supabase functions deploy list-card
supabase functions deploy agent-transfers
supabase functions deploy generate-fixtures
supabase functions deploy seed-data
supabase functions deploy resolve-predictions
```

### 6. Set Up Secrets

```bash
supabase secrets set SUPABASE_URL=https://<your-project-id>.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 7. Seed Initial Data

Run the seed function or execute SQL in the SQL Editor:

```bash
# Via edge function
supabase functions invoke seed-data

# Or manually in SQL Editor (Dashboard → SQL Editor)
-- Insert sample players
INSERT INTO players (name, position, team_real, overall_rating, pace, shooting, passing, dribbling, defending, physicality, price_ball, rarity)
VALUES 
  ('Erling Haaland', 'ST', 'Manchester City', 91, 89, 94, 65, 80, 45, 88, 15000, 'icon'),
  ('Kevin De Bruyne', 'CAM', 'Manchester City', 91, 76, 86, 93, 87, 64, 78, 14000, 'icon'),
  ('Bukayo Saka', 'RW', 'Arsenal', 86, 84, 82, 83, 88, 64, 75, 8500, 'premium');

-- Insert pack types
INSERT INTO pack_types (name, tier, price_ball, cards_count, description, min_rarity, guaranteed_rarity)
VALUES
  ('Bronze Pack', 'bronze', 500, 3, 'Basic starter pack', 'bronze', NULL),
  ('Silver Pack', 'silver', 1500, 3, 'Better odds for decent players', 'silver', NULL),
  ('Gold Pack', 'gold', 5000, 4, 'Good chance for gold players', 'gold', 'gold'),
  ('Premium Pack', 'premium', 15000, 5, 'High chance for premium players', 'premium', 'premium'),
  ('Icon Pack', 'icon', 50000, 3, 'Guaranteed icon player', 'icon', 'icon');
```

### 8. Set Up Automated Simulations (Cron)

In Supabase Dashboard → Database → Extensions:
1. Enable `pg_cron` extension
2. Go to SQL Editor and run:

```sql
-- Schedule match simulation every 4 hours
SELECT cron.schedule(
  'simulate-matches',
  '0 */4 * * *',  -- Every 4 hours
  $$
  SELECT net.http_post(
    url:='https://<your-project-id>.supabase.co/functions/v1/simulate-match',
    headers:='{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  ) AS request_id;
  $$
);

-- Verify it's scheduled
SELECT * FROM cron.job;
```

### 9. Test the Setup

```bash
cd arena
npm install
npm run dev
```

Visit http://localhost:5173 and verify:
- Players load from database
- Can connect wallet
- Can buy shares (if you have $BALL balance)

## Troubleshooting

**Edge function fails to deploy:**
```bash
supabase functions deploy simulate-match --legacy-bundle
```

**Database push fails:**
```bash
supabase db reset  # WARNING: This wipes data!
supabase db push
```

**pg_cron not available:**
Some Supabase plans don't support pg_cron. Use an external cron service like:
- GitHub Actions (scheduled workflow)
- Vercel Cron Jobs
- Railway scheduled tasks

## Quick Reference

| Task | Command |
|------|---------|
| Link project | `supabase link --project-ref <your-project-id>` |
| Push schema | `supabase db push` |
| Deploy function | `supabase functions deploy <name>` |
| View logs | `supabase functions logs <name>` |
| SQL Editor | Dashboard → SQL Editor |
| Table Editor | Dashboard → Table Editor |
