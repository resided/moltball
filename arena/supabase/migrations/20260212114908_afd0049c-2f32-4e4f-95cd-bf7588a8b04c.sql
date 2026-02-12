
-- Add unique constraint on player name for upsert support
ALTER TABLE public.players ADD CONSTRAINT players_name_key UNIQUE (name);
