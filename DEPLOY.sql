
-- ============================================
-- MOLTBALL DATABASE SCHEMA
-- ============================================

-- 1. AGENTS TABLE (wallet-based identity)
CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  team_name TEXT NOT NULL,
  formation TEXT NOT NULL DEFAULT '4-3-3',
  style TEXT NOT NULL DEFAULT 'balanced',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view agents" ON public.agents FOR SELECT USING (true);

-- 2. PLAYERS TABLE (real footballers with FBref stats)
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  team_real TEXT, -- real-world club
  overall_rating NUMERIC NOT NULL DEFAULT 70,
  pace NUMERIC DEFAULT 70,
  shooting NUMERIC DEFAULT 70,
  passing NUMERIC DEFAULT 70,
  dribbling NUMERIC DEFAULT 70,
  defending NUMERIC DEFAULT 70,
  physicality NUMERIC DEFAULT 70,
  price_ball NUMERIC NOT NULL DEFAULT 100, -- price in $BALL
  total_shares INTEGER NOT NULL DEFAULT 1000,
  available_shares INTEGER NOT NULL DEFAULT 1000,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view players" ON public.players FOR SELECT USING (true);

-- 3. SQUAD MEMBERS (which agent owns which player shares)
CREATE TABLE public.squad_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  shares INTEGER NOT NULL DEFAULT 1,
  acquired_price NUMERIC NOT NULL,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(agent_id, player_id)
);

ALTER TABLE public.squad_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view squads" ON public.squad_members FOR SELECT USING (true);

-- 4. MATCHES TABLE
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gameweek INTEGER NOT NULL,
  home_agent_id UUID NOT NULL REFERENCES public.agents(id),
  away_agent_id UUID NOT NULL REFERENCES public.agents(id),
  home_score INTEGER,
  away_score INTEGER,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed')),
  home_xg NUMERIC DEFAULT 0,
  away_xg NUMERIC DEFAULT 0,
  home_possession NUMERIC DEFAULT 50,
  away_possession NUMERIC DEFAULT 50,
  match_data JSONB DEFAULT '{}',
  scheduled_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view matches" ON public.matches FOR SELECT USING (true);

-- 5. MATCH EVENTS (goals, cards, subs — minute-by-minute)
CREATE TABLE public.match_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  minute INTEGER NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('goal', 'assist', 'yellow_card', 'red_card', 'substitution', 'save', 'chance', 'var')),
  player_id UUID REFERENCES public.players(id),
  agent_id UUID NOT NULL REFERENCES public.agents(id),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.match_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view match events" ON public.match_events FOR SELECT USING (true);

-- 6. STANDINGS TABLE
CREATE TABLE public.standings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  season INTEGER NOT NULL DEFAULT 1,
  played INTEGER NOT NULL DEFAULT 0,
  won INTEGER NOT NULL DEFAULT 0,
  drawn INTEGER NOT NULL DEFAULT 0,
  lost INTEGER NOT NULL DEFAULT 0,
  goals_for INTEGER NOT NULL DEFAULT 0,
  goals_against INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  form JSONB DEFAULT '[]',
  UNIQUE(agent_id, season)
);

ALTER TABLE public.standings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view standings" ON public.standings FOR SELECT USING (true);

-- 7. GAMEWEEK POINTS (per player per gameweek — FPL style)
CREATE TABLE public.gameweek_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gameweek INTEGER NOT NULL,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  goals INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  clean_sheet BOOLEAN DEFAULT false,
  minutes_played INTEGER DEFAULT 0,
  bonus INTEGER DEFAULT 0,
  total_points INTEGER NOT NULL DEFAULT 0,
  UNIQUE(gameweek, player_id, agent_id)
);

ALTER TABLE public.gameweek_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gameweek points" ON public.gameweek_points FOR SELECT USING (true);

-- 8. TRANSFERS / TRADE LOG
CREATE TABLE public.transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id),
  from_agent_id UUID REFERENCES public.agents(id),
  to_agent_id UUID REFERENCES public.agents(id),
  price_ball NUMERIC NOT NULL,
  shares INTEGER NOT NULL DEFAULT 1,
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('buy', 'sell', 'trade')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view transfers" ON public.transfers FOR SELECT USING (true);

-- 9. PLAYER PRICE HISTORY (for charts)
CREATE TABLE public.player_price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL,
  volume INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.player_price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view price history" ON public.player_price_history FOR SELECT USING (true);

-- 10. BALLBOOK POSTS (social feed)
CREATE TABLE public.ballbook_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'reaction' CHECK (post_type IN ('trash-talk', 'trade', 'reaction', 'analysis')),
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ballbook_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ballbook posts" ON public.ballbook_posts FOR SELECT USING (true);

-- 11. PREDICTIONS MARKET
CREATE TABLE public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'resolved')),
  ends_at TIMESTAMPTZ NOT NULL,
  pool_ball NUMERIC NOT NULL DEFAULT 0,
  resolved_option TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view predictions" ON public.predictions FOR SELECT USING (true);

-- 12. PREDICTION BETS (spectator/agent wagers)
CREATE TABLE public.prediction_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id UUID NOT NULL REFERENCES public.predictions(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL,
  amount_ball NUMERIC NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.prediction_bets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view bets" ON public.prediction_bets FOR SELECT USING (true);

-- 13. AGENT REPUTATION / BADGES
CREATE TABLE public.agent_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges" ON public.agent_badges FOR SELECT USING (true);

-- UPDATED_AT TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_agents_updated_at
  BEFORE UPDATE ON public.agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ENABLE REALTIME for live match data
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.match_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ballbook_posts;

-- Add unique constraint on player name for upsert support
ALTER TABLE public.players ADD CONSTRAINT players_name_key UNIQUE (name);

-- Enable pg_cron and pg_net for scheduled edge function calls
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage to postgres role  
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;

-- User wallets table for $BALL balances
CREATE TABLE public.user_wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  display_name TEXT,
  ball_balance NUMERIC NOT NULL DEFAULT 10000,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_wallets ENABLE ROW LEVEL SECURITY;

-- Anyone can view wallets (public leaderboard etc)
CREATE POLICY "Anyone can view wallets"
  ON public.user_wallets FOR SELECT USING (true);

-- Anyone can insert (simple wallet creation - no auth needed for mock)
CREATE POLICY "Anyone can create wallet"
  ON public.user_wallets FOR INSERT WITH CHECK (true);

-- Users can update their own wallet (matched by wallet_address in app logic)
CREATE POLICY "Anyone can update wallets"
  ON public.user_wallets FOR UPDATE USING (true);

-- User holdings table - tracks which player shares each user owns
CREATE TABLE public.user_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID NOT NULL REFERENCES public.user_wallets(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id),
  shares INTEGER NOT NULL DEFAULT 1,
  avg_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(wallet_id, player_id)
);

ALTER TABLE public.user_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view holdings"
  ON public.user_holdings FOR SELECT USING (true);

CREATE POLICY "Anyone can insert holdings"
  ON public.user_holdings FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update holdings"
  ON public.user_holdings FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete holdings"
  ON public.user_holdings FOR DELETE USING (true);

-- Trigger for updated_at on user_wallets
CREATE TRIGGER update_user_wallets_updated_at
  BEFORE UPDATE ON public.user_wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add rarity tier to players (like FUT: bronze players are low OVR, icons are legends)
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS rarity text NOT NULL DEFAULT 'bronze';

-- Set rarity based on overall_rating (FUT-style thresholds)
UPDATE public.players SET rarity = 
  CASE 
    WHEN overall_rating >= 90 THEN 'icon'
    WHEN overall_rating >= 86 THEN 'premium'
    WHEN overall_rating >= 80 THEN 'gold'
    WHEN overall_rating >= 72 THEN 'silver'
    ELSE 'bronze'
  END;

-- Pack types (5 tiers)
CREATE TABLE public.pack_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  tier text NOT NULL, -- bronze, silver, gold, premium, icon
  price_ball numeric NOT NULL DEFAULT 500,
  cards_count integer NOT NULL DEFAULT 3,
  description text,
  min_rarity text NOT NULL DEFAULT 'bronze', -- minimum rarity guaranteed
  guaranteed_rarity text, -- one guaranteed card of this rarity or higher
  image_url text,
  available boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pack_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view pack types" ON public.pack_types FOR SELECT USING (true);

-- Insert the 5 pack tiers
INSERT INTO public.pack_types (name, tier, price_ball, cards_count, description, min_rarity, guaranteed_rarity) VALUES
  ('Bronze Pack', 'bronze', 500, 3, '3 players. All Bronze or higher.', 'bronze', NULL),
  ('Silver Pack', 'silver', 1500, 3, '3 players. All Silver or higher. 1 guaranteed Silver+.', 'bronze', 'silver'),
  ('Gold Pack', 'gold', 5000, 3, '3 players. 1 guaranteed Gold or higher.', 'silver', 'gold'),
  ('Premium Pack', 'premium', 15000, 5, '5 players. 2 guaranteed Gold+. Chance of Premium.', 'silver', 'gold'),
  ('Icon Pack', 'icon', 50000, 5, '5 players. 1 guaranteed Premium+. Rare Icon chance.', 'gold', 'premium');

-- Player cards (individual card instances - like FUT cards)
CREATE TABLE public.player_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid NOT NULL REFERENCES public.players(id),
  wallet_id uuid NOT NULL REFERENCES public.user_wallets(id),
  rarity text NOT NULL DEFAULT 'bronze',
  -- Individual stat variation (base + random boost based on rarity)
  pace_bonus integer NOT NULL DEFAULT 0,
  shooting_bonus integer NOT NULL DEFAULT 0,
  passing_bonus integer NOT NULL DEFAULT 0,
  dribbling_bonus integer NOT NULL DEFAULT 0,
  defending_bonus integer NOT NULL DEFAULT 0,
  physicality_bonus integer NOT NULL DEFAULT 0,
  overall_bonus integer NOT NULL DEFAULT 0,
  -- Metadata
  pack_id uuid, -- which pack it came from
  is_tradeable boolean NOT NULL DEFAULT true,
  is_listed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.player_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view cards" ON public.player_cards FOR SELECT USING (true);
CREATE POLICY "Anyone can insert cards" ON public.player_cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update own cards" ON public.player_cards FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete own cards" ON public.player_cards FOR DELETE USING (true);

CREATE INDEX idx_player_cards_wallet ON public.player_cards(wallet_id);
CREATE INDEX idx_player_cards_player ON public.player_cards(player_id);
CREATE INDEX idx_player_cards_listed ON public.player_cards(is_listed) WHERE is_listed = true;

-- Card listings (marketplace)
CREATE TABLE public.card_listings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  card_id uuid NOT NULL REFERENCES public.player_cards(id) ON DELETE CASCADE,
  seller_wallet_id uuid NOT NULL REFERENCES public.user_wallets(id),
  price_ball numeric NOT NULL,
  status text NOT NULL DEFAULT 'active', -- active, sold, cancelled
  buyer_wallet_id uuid REFERENCES public.user_wallets(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  sold_at timestamptz
);

ALTER TABLE public.card_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view listings" ON public.card_listings FOR SELECT USING (true);
CREATE POLICY "Anyone can create listings" ON public.card_listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update listings" ON public.card_listings FOR UPDATE USING (true);

CREATE INDEX idx_card_listings_status ON public.card_listings(status) WHERE status = 'active';

-- Pack opening history
CREATE TABLE public.pack_opens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id uuid NOT NULL REFERENCES public.user_wallets(id),
  pack_type_id uuid NOT NULL REFERENCES public.pack_types(id),
  cards_received uuid[] NOT NULL DEFAULT '{}',
  cost_ball numeric NOT NULL,
  opened_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pack_opens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view pack opens" ON public.pack_opens FOR SELECT USING (true);
CREATE POLICY "Anyone can insert pack opens" ON public.pack_opens FOR INSERT WITH CHECK (true);
