#!/usr/bin/env python3
"""
Fetch EA FC 25 player data from SoFIFA and generate SQL seed file
Usage: python fetch-eafc25-players.py
"""

import csv
from pathlib import Path

def map_position(pos: str) -> str:
    """Map SoFIFA position to our position format"""
    pos = pos.upper()
    if pos == 'GK':
        return 'GK'
    elif pos in ['LB', 'RB', 'CB', 'LWB', 'RWB']:
        return 'DEF'
    elif pos in ['CDM', 'CM', 'CAM', 'LM', 'RM']:
        return 'MID'
    elif pos in ['LW', 'RW', 'LF', 'RF']:
        return 'FWD'
    elif pos == 'ST':
        return 'FWD'
    else:
        return 'MID'

def calculate_price(overall: int) -> int:
    """Calculate $BALL price based on overall rating"""
    if overall >= 90:
        return 12000
    elif overall >= 87:
        return 8000 + (overall - 87) * 1000
    elif overall >= 83:
        return 5000 + (overall - 83) * 750
    elif overall >= 78:
        return 2500 + (overall - 78) * 500
    elif overall >= 72:
        return 1000 + (overall - 72) * 250
    else:
        return 500 + overall * 10

def calculate_rarity(overall: int) -> str:
    """Calculate card rarity based on overall rating"""
    if overall >= 90:
        return 'icon'
    elif overall >= 86:
        return 'premium'
    elif overall >= 82:
        return 'gold'
    elif overall >= 77:
        return 'silver'
    else:
        return 'bronze'

def escape_sql(s: str) -> str:
    """Escape SQL string"""
    return s.replace("'", "''")

def process_csv_to_sql(csv_path: str, output_path: str):
    """Convert EA FC 25 CSV to PostgreSQL INSERT statements"""
    
    players = []
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Only Premier League players
            if 'Premier League' not in row.get('club_league_name', ''):
                continue
                
            player = {
                'name': row['name'].strip(),
                'team_real': row.get('club_name', 'Unknown').strip(),
                'position': map_position(row.get('club_position', 'CM')),
                'overall_rating': int(row.get('overall_rating', 70)),
                'pace': int(row.get('pace', 70)),
                'shooting': int(row.get('shooting', 70)),
                'passing': int(row.get('passing', 70)),
                'dribbling': int(row.get('dribbling', 70)),
                'defending': int(row.get('defending', 50)),
                'physicality': int(row.get('physicality', 70)),
            }
            
            # Calculate price based on overall rating
            player['price_ball'] = calculate_price(player['overall_rating'])
            player['rarity'] = calculate_rarity(player['overall_rating'])
            
            players.append(player)
    
    # Sort by overall rating
    players.sort(key=lambda x: x['overall_rating'], reverse=True)
    
    # Generate SQL
    sql_lines = [
        "-- ============================================",
        "-- EA FC 25 PREMIER LEAGUE PLAYERS",
        "-- Generated from SoFIFA data",
        "-- ============================================",
        "",
        "TRUNCATE TABLE players CASCADE;",
        "",
        "INSERT INTO players (name, position, team_real, overall_rating, pace, shooting, passing, dribbling, defending, physicality, price_ball, total_shares, available_shares, rarity) VALUES",
    ]
    
    for i, p in enumerate(players):
        values = f"    ('{escape_sql(p['name'])}', '{p['position']}', '{escape_sql(p['team_real'])}', {p['overall_rating']}, {p['pace']}, {p['shooting']}, {p['passing']}, {p['dribbling']}, {p['defending']}, {p['physicality']}, {p['price_ball']}, 1000, 1000, '{p['rarity']}')"
        if i < len(players) - 1:
            values += ","
        else:
            values += ";"
        sql_lines.append(values)
    
    sql_lines.append("")
    sql_lines.append(f"-- Total players: {len(players)}")
    
    Path(output_path).write_text('\n'.join(sql_lines))
    print(f"✅ Generated SQL with {len(players)} Premier League players")
    print(f"📄 Saved to: {output_path}")

def generate_sample_data():
    """Generate sample data if no CSV available"""
    print("Generating sample EA FC 25 style data...")
    
    # Top Premier League players with EA FC 25 stats
    players = [
        # Icons (90+)
        ("Erling Haaland", "ST", "Manchester City", 91, 89, 94, 65, 80, 45, 88),
        ("Kevin De Bruyne", "CAM", "Manchester City", 91, 76, 86, 93, 87, 64, 78),
        
        # Premium (86-89)
        ("Mohamed Salah", "RW", "Liverpool", 89, 88, 88, 82, 90, 45, 75),
        ("Virgil van Dijk", "CB", "Liverpool", 88, 72, 60, 78, 72, 90, 86),
        ("Alisson Becker", "GK", "Liverpool", 88, 58, 50, 78, 75, 50, 84),
        ("Rodri", "CDM", "Manchester City", 89, 72, 76, 86, 82, 88, 86),
        ("Bernardo Silva", "CM", "Manchester City", 88, 82, 78, 88, 94, 76, 72),
        ("Phil Foden", "RW", "Manchester City", 87, 84, 84, 86, 90, 58, 72),
        ("Bukayo Saka", "RW", "Arsenal", 87, 85, 82, 83, 88, 64, 75),
        ("Martin Ødegaard", "CAM", "Arsenal", 87, 76, 80, 90, 88, 62, 68),
        ("Declan Rice", "CDM", "Arsenal", 86, 78, 70, 82, 78, 85, 84),
        ("William Saliba", "CB", "Arsenal", 85, 78, 45, 68, 72, 87, 84),
        ("Cole Palmer", "RW", "Chelsea", 86, 82, 84, 85, 88, 48, 72),
        ("Enzo Fernández", "CM", "Chelsea", 85, 76, 76, 88, 86, 78, 78),
        ("Son Heung-min", "LW", "Tottenham", 87, 88, 86, 82, 88, 52, 74),
        ("James Maddison", "CAM", "Tottenham", 85, 74, 82, 88, 88, 60, 72),
        ("Cristian Romero", "CB", "Tottenham", 86, 76, 55, 72, 74, 88, 86),
        ("Bruno Fernandes", "CAM", "Manchester United", 86, 76, 82, 88, 86, 72, 78),
        ("Marcus Rashford", "LW", "Manchester United", 85, 90, 82, 80, 88, 45, 78),
        ("Casemiro", "CDM", "Manchester United", 85, 68, 72, 78, 74, 86, 86),
    ]
    
    sql_lines = [
        "-- ============================================",
        "-- EA FC 25 PREMIER LEAGUE PLAYERS (SAMPLE)",
        "-- For full dataset, download from Kaggle:",
        "-- https://www.kaggle.com/datasets/aniss7/fifa-player-data-from-sofifa-2025-06-03",
        "-- ============================================",
        "",
        "INSERT INTO players (name, position, team_real, overall_rating, pace, shooting, passing, dribbling, defending, physicality, price_ball, total_shares, available_shares, rarity) VALUES",
    ]
    
    for i, (name, pos, team, ovr, pac, sho, pas, dri, defe, phy) in enumerate(players):
        position = map_position(pos)
        price = calculate_price(ovr)
        rarity = calculate_rarity(ovr)
        
        values = f"    ('{name}', '{position}', '{team}', {ovr}, {pac}, {sho}, {pas}, {dri}, {defe}, {phy}, {price}, 1000, 1000, '{rarity}')"
        if i < len(players) - 1:
            values += ","
        else:
            values += ";"
        sql_lines.append(values)
    
    output_path = Path(__file__).parent / "seed-eafc25-premier-league.sql"
    output_path.write_text('\n'.join(sql_lines))
    print(f"✅ Generated sample SQL with {len(players)} players")
    print(f"📄 Saved to: {output_path}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--csv":
        csv_path = Path(__file__).parent / "player-data.csv"
        if csv_path.exists():
            output_path = Path(__file__).parent / "seed-eafc25-premier-league.sql"
            process_csv_to_sql(str(csv_path), str(output_path))
        else:
            print("❌ player-data.csv not found")
            print("\nTo get full EA FC 25 data:")
            print("1. Go to: https://www.kaggle.com/datasets/aniss7/fifa-player-data-from-sofifa-2025-06-03")
            print("2. Download: player-data-full-2025-june.csv")
            print("3. Place it in: scripts/player-data.csv")
            print("4. Run: python fetch-eafc25-players.py --csv")
    else:
        generate_sample_data()
        print("\nTo get FULL dataset (~500 Premier League players):")
        print("1. Go to: https://www.kaggle.com/datasets/aniss7/fifa-player-data-from-sofifa-2025-06-03")
        print("2. Download: player-data-full-2025-june.csv")
        print("3. Place it in: scripts/player-data.csv")
        print("4. Run: python fetch-eafc25-players.py --csv")
