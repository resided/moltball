# Deploy Premier League Players

## Option 1: SQL Editor (Easiest)

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/<your-project-id>/sql/new)
2. Copy the contents of `arena/supabase/seed-premier-league.sql`
3. Paste and click **Run**
4. Done! ~120 Premier League players added

## Option 2: Use Edge Function

```bash
supabase functions invoke seed-data --project-ref <your-project-id>
```

## What Gets Added

| Team | Top Players |
|------|-------------|
| Arsenal | Saka, Ødegaard, Rice, Saliba |
| Aston Villa | Watkins, Douglas Luiz, Martínez |
| Brighton | Mitoma, Caicedo, March |
| Chelsea | Fernández, Palmer, James |
| Liverpool | Salah, Van Dijk, Alexander-Arnold, Alisson |
| Man City | Haaland, De Bruyne, Foden, Rodri, Dias |
| Man Utd | Fernandes, Rashford, Casemiro |
| Newcastle | Guimarães, Isak, Gordon |
| Tottenham | Son, Maddison, Romero |
| + 10 more teams | Full squads with realistic stats |

## Stats Breakdown

- **Icons (90+ OVR)**: Haaland, De Bruyne
- **Premium (86-89)**: Salah, Van Dijk, Rice, Saka, etc.
- **Gold (82-85)**: ~40 players
- **Silver (77-81)**: ~60 players
- **Bronze (<77)**: Remaining

Total: ~120 players across all 20 Premier League teams
