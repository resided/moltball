#!/usr/bin/env python3
"""
Moltball Match Simulation Engine

Simulates soccer matches based on player stats, tactics, and form.
Similar to Database Ball's baseball simulation but for soccer.
"""

import random
import json
from dataclasses import dataclass, field
from typing import List, Dict, Tuple, Optional
from enum import Enum
import math


class PlayStyle(Enum):
    BALANCED = 0
    POSSESSION = 1
    COUNTER = 2
    HIGH_PRESS = 3
    LONG_BALL = 4


@dataclass
class PlayerStats:
    player_name: str
    season: str
    club: str
    position: str
    overall: int
    pace: int
    shooting: int
    passing: int
    dribbling: int
    defense: int
    physical: int
    goals: int = 0
    assists: int = 0
    minutes: int = 0


@dataclass
class Tactics:
    formation: str = "4-4-2"
    attacking_intensity: int = 5  # 1-10
    defensive_line: int = 5  # 1-10 (high = push up)
    pressing_intensity: int = 5  # 1-10
    play_style: PlayStyle = PlayStyle.BALANCED


@dataclass
class TeamState:
    name: str
    players: List[PlayerStats]
    tactics: Tactics
    formation_positions: List[str] = field(default_factory=list)
    
    # Derived ratings
    attack_rating: float = 0.0
    defense_rating: float = 0.0
    midfield_rating: float = 0.0
    
    def __post_init__(self):
        if not self.formation_positions:
            self.formation_positions = self._get_formation_positions()
        self._calculate_ratings()
    
    def _get_formation_positions(self) -> List[str]:
        formations = {
            "4-4-2": ["GK", "LB", "CB", "CB", "RB", "LM", "CM", "CM", "RM", "ST", "ST"],
            "4-3-3": ["GK", "LB", "CB", "CB", "RB", "CDM", "CM", "CM", "LW", "ST", "RW"],
            "3-5-2": ["GK", "CB", "CB", "CB", "LWB", "CDM", "CM", "CM", "RWB", "ST", "ST"],
            "5-3-2": ["GK", "LWB", "CB", "CB", "CB", "RWB", "CM", "CM", "CM", "ST", "ST"],
            "4-2-3-1": ["GK", "LB", "CB", "CB", "RB", "CDM", "CDM", "CAM", "LW", "RW", "ST"],
            "4-5-1": ["GK", "LB", "CB", "CB", "RB", "LM", "CM", "CM", "CM", "RM", "ST"]
        }
        return formations.get(self.tactics.formation, formations["4-4-2"])
    
    def _calculate_ratings(self):
        # Map players to positions (best fit)
        lineup = self._select_lineup()
        
        # Calculate ratings based on lineup
        attackers = [p for p in lineup if p.position in ["ST", "LW", "RW", "CAM"]]
        defenders = [p for p in lineup if p.position in ["CB", "LB", "RB", "GK"]]
        midfielders = [p for p in lineup if p.position in ["CM", "CDM", "LM", "RM"]]
        
        self.attack_rating = self._calculate_position_rating(attackers, ["shooting", "pace", "dribbling"])
        self.defense_rating = self._calculate_position_rating(defenders, ["defense", "physical"])
        self.midfield_rating = self._calculate_position_rating(midfielders, ["passing", "physical", "defense"])
        
        # Apply tactical modifiers
        self._apply_tactical_modifiers()
    
    def _select_lineup(self) -> List[PlayerStats]:
        """Select best player for each position"""
        selected = []
        available = self.players.copy()
        
        for position in self.formation_positions:
            # Find best player for this position
            best = None
            best_score = -1
            
            for player in available:
                score = self._position_fit_score(player, position)
                if score > best_score:
                    best_score = score
                    best = player
            
            if best:
                selected.append(best)
                available.remove(best)
        
        return selected
    
    def _position_fit_score(self, player: PlayerStats, position: str) -> float:
        """Calculate how well a player fits a position"""
        position_bonus = 20 if player.position == position else 0
        nearby_positions = {
            "GK": ["GK"],
            "LB": ["LB", "LWB", "LM"],
            "CB": ["CB"],
            "RB": ["RB", "RWB", "RM"],
            "CDM": ["CDM", "CM"],
            "CM": ["CM", "CDM", "CAM"],
            "CAM": ["CAM", "CM"],
            "LM": ["LM", "LW", "LB"],
            "RM": ["RM", "RW", "RB"],
            "LW": ["LW", "LM"],
            "RW": ["RW", "RM"],
            "ST": ["ST", "CAM"]
        }
        
        if position in nearby_positions.get(player.position, []):
            position_bonus = 10
        
        return player.overall + position_bonus
    
    def _calculate_position_rating(self, players: List[PlayerStats], key_stats: List[str]) -> float:
        if not players:
            return 50.0
        
        total = 0
        for player in players:
            avg = sum(getattr(player, stat) for stat in key_stats) / len(key_stats)
            total += avg
        
        return total / len(players)
    
    def _apply_tactical_modifiers(self):
        """Apply tactical adjustments to ratings"""
        style_modifiers = {
            PlayStyle.BALANCED: (1.0, 1.0, 1.0),
            PlayStyle.POSSESSION: (0.9, 1.0, 1.15),  # Boost midfield
            PlayStyle.COUNTER: (1.15, 0.9, 0.9),  # Boost attack
            PlayStyle.HIGH_PRESS: (1.0, 1.1, 1.05),  # Boost defense/midfield
            PlayStyle.LONG_BALL: (1.1, 1.0, 0.9)  # Boost attack
        }
        
        atk_mod, def_mod, mid_mod = style_modifiers.get(self.tactics.play_style, (1.0, 1.0, 1.0))
        
        # Pressing affects defense and midfield
        press_factor = self.tactics.pressing_intensity / 5
        def_mod *= 0.9 + (press_factor * 0.2)
        mid_mod *= 0.95 + (press_factor * 0.1)
        
        # Attacking intensity affects attack and defense (risk/reward)
        atk_factor = self.tactics.attacking_intensity / 5
        atk_mod *= 0.9 + (atk_factor * 0.2)
        def_mod *= 1.1 - (atk_factor * 0.2)
        
        self.attack_rating *= atk_mod
        self.defense_rating *= def_mod
        self.midfield_rating *= mid_mod


@dataclass
class MatchEvent:
    minute: int
    type: str  # "goal", "card", "sub"
    team: str
    player: Optional[str] = None
    description: str = ""


@dataclass
class MatchResult:
    home_team: str
    away_team: str
    home_score: int
    away_score: int
    home_xg: float
    away_xg: float
    events: List[MatchEvent]
    possession: Tuple[float, float]  # Home %, Away %
    shots: Tuple[int, int]
    shots_on_target: Tuple[int, int]


class MatchSimulator:
    """
    Simulates a soccer match between two teams.
    
    Uses a probabilistic approach similar to Football Manager or
    Database Ball's baseball simulation.
    """
    
    BASE_GOAL_PROBABILITY = 0.03  # ~2.7 goals per game average
    
    def __init__(self, home_team: TeamState, away_team: TeamState):
        self.home = home_team
        self.away = away_team
        self.events: List[MatchEvent] = []
        self.home_score = 0
        self.away_score = 0
        self.home_xg = 0.0
        self.away_xg = 0.0
        self.home_shots = 0
        self.away_shots = 0
        self.home_sot = 0
        self.away_sot = 0
    
    def simulate(self, use_randomness: bool = True) -> MatchResult:
        """Run the full 90-minute simulation"""
        random.seed() if use_randomness else random.seed(42)
        
        # Calculate base chance creation rates
        home_attack_strength = self.home.attack_rating + self.home.midfield_rating * 0.3
        away_defense_strength = self.away.defense_rating + self.away.midfield_rating * 0.3
        
        away_attack_strength = self.away.attack_rating + self.away.midfield_rating * 0.3
        home_defense_strength = self.home.defense_rating + self.home.midfield_rating * 0.3
        
        # Home advantage
        home_attack_strength *= 1.1
        home_defense_strength *= 1.05
        
        # Simulate in 5-minute chunks for efficiency
        for minute in range(5, 95, 5):
            self._simulate_period(minute, home_attack_strength, away_defense_strength,
                                 away_attack_strength, home_defense_strength)
        
        # Calculate possession based on midfield
        total_midfield = self.home.midfield_rating + self.away.midfield_rating
        home_possession = (self.home.midfield_rating / total_midfield) * 100
        
        return MatchResult(
            home_team=self.home.name,
            away_team=self.away.name,
            home_score=self.home_score,
            away_score=self.away_score,
            home_xg=round(self.home_xg, 2),
            away_xg=round(self.away_xg, 2),
            events=sorted(self.events, key=lambda e: e.minute),
            possession=(round(home_possession, 1), round(100 - home_possession, 1)),
            shots=(self.home_shots, self.away_shots),
            shots_on_target=(self.home_sot, self.away_sot)
        )
    
    def _simulate_period(self, minute: int, home_atk: float, away_def: float,
                        away_atk: float, home_def: float):
        """Simulate a 5-minute period"""
        
        # Calculate chance creation probabilities
        home_chance_prob = (home_atk / 100) * (1 - away_def / 200) * self.BASE_GOAL_PROBABILITY
        away_chance_prob = (away_atk / 100) * (1 - home_def / 200) * self.BASE_GOAL_PROBABILITY
        
        # Multiple attempts per 5-minute chunk
        for _ in range(3):
            # Home team chance
            if random.random() < home_chance_prob:
                self._process_chance("home", minute)
            
            # Away team chance
            if random.random() < away_chance_prob:
                self._process_chance("away", minute)
    
    def _process_chance(self, team: str, minute: int):
        """Process a goal-scoring chance"""
        is_home = team == "home"
        attacking_team = self.home if is_home else self.away
        defending_team = self.away if is_home else self.home
        
        # Select attacker
        attackers = [p for p in attacking_team.players if p.position in ["ST", "LW", "RW", "CAM", "CM"]]
        if not attackers:
            attackers = attacking_team.players
        
        # Weight by shooting and goals/minutes ratio (form)
        weights = [p.shooting * (1 + p.goals / max(p.minutes / 90, 1)) for p in attackers]
        attacker = random.choices(attackers, weights=weights)[0]
        
        # Calculate xG for this chance
        base_xg = attacker.shooting / 100
        
        # Adjust for defender quality
        defenders = [p for p in defending_team.players if p.position in ["CB", "GK", "LB", "RB"]]
        avg_defense = sum(p.defense for p in defenders) / len(defenders) if defenders else 50
        base_xg *= (1 - avg_defense / 300)
        
        # Adjust for goalkeeper
        gk = next((p for p in defending_team.players if p.position == "GK"), None)
        if gk:
            base_xg *= (1 - gk.overall / 300)
        
        xg = max(0.05, min(0.95, base_xg))  # Clamp between 5% and 95%
        
        if is_home:
            self.home_xg += xg
            self.home_shots += 1
        else:
            self.away_xg += xg
            self.away_shots += 1
        
        # Determine if goal scored
        if random.random() < xg:
            if is_home:
                self.home_score += 1
                self.home_sot += 1
            else:
                self.away_score += 1
                self.away_sot += 1
            
            self.events.append(MatchEvent(
                minute=minute + random.randint(-2, 2),
                type="goal",
                team=team,
                player=attacker.player_name,
                description=f"Goal! {attacker.player_name} scores for {attacking_team.name}"
            ))
        else:
            # Miss
            if random.random() < 0.3:  # 30% of misses are on target
                if is_home:
                    self.home_sot += 1
                else:
                    self.away_sot += 1


class LeagueSimulator:
    """Simulates an entire league season"""
    
    def __init__(self, teams: List[TeamState]):
        self.teams = {t.name: t for t in teams}
        self.standings = {t.name: {"played": 0, "won": 0, "drawn": 0, "lost": 0, 
                                    "gf": 0, "ga": 0, "gd": 0, "points": 0} for t in teams}
        self.fixtures: List[Tuple[str, str]] = []
        self.results: List[MatchResult] = []
        
        self._generate_fixtures()
    
    def _generate_fixtures(self):
        """Generate round-robin fixtures"""
        team_names = list(self.teams.keys())
        n = len(team_names)
        
        for i in range(n):
            for j in range(i + 1, n):
                self.fixtures.append((team_names[i], team_names[j]))
                self.fixtures.append((team_names[j], team_names[i]))
        
        random.shuffle(self.fixtures)
    
    def simulate_matchday(self, num_matches: int = 5) -> List[MatchResult]:
        """Simulate the next batch of matches"""
        matchday_results = []
        
        for _ in range(min(num_matches, len(self.fixtures))):
            if not self.fixtures:
                break
            
            home_name, away_name = self.fixtures.pop(0)
            home_team = self.teams[home_name]
            away_team = self.teams[away_name]
            
            simulator = MatchSimulator(home_team, away_team)
            result = simulator.simulate()
            
            self._update_standings(result)
            self.results.append(result)
            matchday_results.append(result)
        
        return matchday_results
    
    def _update_standings(self, result: MatchResult):
        """Update league table after a match"""
        home = self.standings[result.home_team]
        away = self.standings[result.away_team]
        
        home["played"] += 1
        away["played"] += 1
        home["gf"] += result.home_score
        home["ga"] += result.away_score
        away["gf"] += result.away_score
        away["ga"] += result.home_score
        home["gd"] = home["gf"] - home["ga"]
        away["gd"] = away["gf"] - away["ga"]
        
        if result.home_score > result.away_score:
            home["won"] += 1
            home["points"] += 3
            away["lost"] += 1
        elif result.away_score > result.home_score:
            away["won"] += 1
            away["points"] += 3
            home["lost"] += 1
        else:
            home["drawn"] += 1
            away["drawn"] += 1
            home["points"] += 1
            away["points"] += 1
    
    def get_standings(self) -> List[Tuple[str, dict]]:
        """Get sorted league table"""
        sorted_standings = sorted(
            self.standings.items(),
            key=lambda x: (x[1]["points"], x[1]["gd"], x[1]["gf"]),
            reverse=True
        )
        return sorted_standings
    
    def print_standings(self):
        """Print formatted league table"""
        print("\n" + "=" * 70)
        print(f"{'Pos':<4} {'Team':<20} {'P':<3} {'W':<3} {'D':<3} {'L':<3} {'GF':<4} {'GA':<4} {'GD':<5} {'Pts':<4}")
        print("=" * 70)
        
        for pos, (team, stats) in enumerate(self.get_standings(), 1):
            print(f"{pos:<4} {team:<20} {stats['played']:<3} {stats['won']:<3} "
                  f"{stats['drawn']:<3} {stats['lost']:<3} {stats['gf']:<4} "
                  f"{stats['ga']:<4} {stats['gd']:+5} {stats['points']:<4}")
        
        print("=" * 70)


def create_sample_team(name: str, overall: int) -> TeamState:
    """Create a sample team with random players"""
    positions = ["GK", "LB", "CB", "CB", "RB", "CDM", "CM", "CM", "LW", "ST", "RW"]
    players = []
    
    for pos in positions:
        variation = random.randint(-10, 10)
        player_overall = max(60, min(99, overall + variation))
        
        players.append(PlayerStats(
            player_name=f"{name} {pos}",
            season="2023-24",
            club=name,
            position=pos,
            overall=player_overall,
            pace=random.randint(50, 95),
            shooting=random.randint(40, 90) if pos != "GK" else 20,
            passing=random.randint(50, 90),
            dribbling=random.randint(50, 95),
            defense=random.randint(60, 95) if pos in ["CB", "LB", "RB", "CDM"] else random.randint(30, 60),
            physical=random.randint(60, 90),
            goals=random.randint(0, 30),
            assists=random.randint(0, 20),
            minutes=random.randint(1000, 3000)
        ))
    
    # Add substitutes
    for i in range(7):
        pos = random.choice(positions)
        variation = random.randint(-15, 5)
        player_overall = max(60, min(99, overall + variation))
        
        players.append(PlayerStats(
            player_name=f"{name} Sub {i+1}",
            season="2023-24",
            club=name,
            position=pos,
            overall=player_overall,
            pace=random.randint(45, 90),
            shooting=random.randint(35, 85),
            passing=random.randint(45, 85),
            dribbling=random.randint(45, 90),
            defense=random.randint(40, 85),
            physical=random.randint(55, 85),
            goals=random.randint(0, 15),
            assists=random.randint(0, 10),
            minutes=random.randint(500, 1500)
        ))
    
    return TeamState(name=name, players=players, tactics=Tactics())


def demo():
    """Run a demo simulation"""
    print("⚽ MOLTBALL SIMULATION ENGINE DEMO\n")
    
    # Create sample teams
    teams = [
        create_sample_team("AI United", 78),
        create_sample_team("Bot City", 82),
        create_sample_team("Neural Network FC", 75),
        create_sample_team("Deep Learning", 80),
        create_sample_team("Machine Learning", 77),
        create_sample_team("Reinforcement", 79),
    ]
    
    # Set different tactics
    teams[0].tactics = Tactics("4-3-3", 7, 6, 8, PlayStyle.HIGH_PRESS)
    teams[1].tactics = Tactics("4-4-2", 6, 5, 5, PlayStyle.BALANCED)
    teams[2].tactics = Tactics("5-3-2", 4, 4, 4, PlayStyle.COUNTER)
    teams[3].tactics = Tactics("4-3-3", 6, 7, 6, PlayStyle.POSSESSION)
    teams[4].tactics = Tactics("4-5-1", 5, 5, 7, PlayStyle.LONG_BALL)
    teams[5].tactics = Tactics("4-2-3-1", 8, 5, 7, PlayStyle.HIGH_PRESS)
    
    league = LeagueSimulator(teams)
    
    # Simulate 3 matchdays
    for md in range(1, 4):
        print(f"\n{'='*50}")
        print(f"MATCHDAY {md}")
        print("=" * 50)
        
        results = league.simulate_matchday(3)
        
        for result in results:
            print(f"\n{result.home_team} {result.home_score} - {result.away_score} {result.away_team}")
            print(f"   xG: {result.home_xg} - {result.away_xg}")
            print(f"   Possession: {result.possession[0]}% - {result.possession[1]}%")
            print(f"   Shots: {result.shots[0]} ({result.shots_on_target[0]}) - {result.shots[1]} ({result.shots_on_target[1]})")
            
            for event in result.events:
                if event.type == "goal":
                    print(f"   ⚽ {event.minute}' {event.player}")
        
        league.print_standings()


if __name__ == "__main__":
    demo()
