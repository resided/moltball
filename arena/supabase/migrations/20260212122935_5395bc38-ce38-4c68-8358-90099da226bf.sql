
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
