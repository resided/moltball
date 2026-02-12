
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
