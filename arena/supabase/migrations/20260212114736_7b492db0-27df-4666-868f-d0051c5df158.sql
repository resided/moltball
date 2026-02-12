
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
