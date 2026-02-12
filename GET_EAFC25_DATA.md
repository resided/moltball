# Get Real EA FC 25 Player Data

## Option 1: Kaggle Dataset (Recommended - 500+ Players)

### Step 1: Download the Dataset
Go to: **https://www.kaggle.com/datasets/aniss7/fifa-player-data-from-sofifa-2025-06-03**

Or alternative: **https://www.kaggle.com/datasets/mexwell/ea-fc25-player-database**

Download: `player-data-full-2025-june.csv` (or latest)

### Step 2: Generate SQL
```bash
cd scripts
# Place the downloaded CSV as player-data.csv
cp ~/Downloads/player-data-full-2025-june.csv player-data.csv

# Generate SQL
python3 fetch-eafc25-players.py --csv
```

### Step 3: Deploy to Supabase
```bash
# Copy the generated SQL to supabase migrations
cp seed-eafc25-premier-league.sql ../arena/supabase/migrations/

# Deploy
cd ../arena
supabase db push
```

## Option 2: SoFIFA Direct Scrape

Use the GitHub scraper: **https://github.com/prashantghimire/sofifa-web-scraper**

```bash
git clone https://github.com/prashantghimire/sofifa-web-scraper.git
cd sofifa-web-scraper
pip3 install -r requirements.txt
playwright install chromium

# Scrape all players
python3 src/scrape_player_urls.py
python3 src/sofifa_scraper.py --max-players 500

# Then use our converter
python3 ../scripts/fetch-eafc25-players.py --csv
```

## Option 3: Use Sample Data (20 Top Players)

Already generated: `scripts/seed-eafc25-premier-league.sql`

Players included:
- **Icons**: Haaland (91), De Bruyne (91)
- **Premium**: Salah (89), Van Dijk (88), Rodri (89), etc.
- **Gold**: 14 more top players

Deploy now:
```bash
cd arena
supabase db push
```

## Data Structure

Each player has:
| Field | Source |
|-------|--------|
| `name` | EA FC 25 |
| `team_real` | Current club |
| `position` | Mapped from EA FC position |
| `overall_rating` | EA overall |
| `pace` | EA pace stat |
| `shooting` | EA shooting stat |
| `passing` | EA passing stat |
| `dribbling` | EA dribbling stat |
| `defending` | EA defending stat |
| `physicality` | EA physical stat |
| `price_ball` | Calculated from overall |
| `rarity` | Icon/Premium/Gold/Silver/Bronze |

## Price Formula

```python
if overall >= 90: price = 12000      # Icon
elif overall >= 87: price = 8000+    # Premium
elif overall >= 83: price = 5000+    # Gold
elif overall >= 78: price = 2500+    # Silver
else: price = 500+                   # Bronze
```

This mirrors real FIFA Ultimate Team economics!
