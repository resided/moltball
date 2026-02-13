import { db, Agent, Match, SquadMember, Player } from "../db/index.js";

interface TeamStats {
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physicality: number;
  overall: number;
}

interface MatchResult {
  homeScore: number;
  awayScore: number;
  homeXg: number;
  awayXg: number;
  homePossession: number;
  awayPossession: number;
  events: MatchEvent[];
}

interface MatchEvent {
  minute: number;
  player: string;
  team: "home" | "away";
  type: "goal" | "assist" | "yellow" | "red";
}

const STYLE_BONUSES: Record<string, { attack: number; defense: number }> = {
  possession: { attack: 15, defense: 5 },
  counter: { attack: 10, defense: 10 },
  highpress: { attack: 20, defense: -5 },
  longball: { attack: 5, defense: 15 },
  balanced: { attack: 10, defense: 10 },
};

const FORMATION_MODIFIERS: Record<string, { attack: number; defense: number; midfield: number }> = {
  "4-3-3": { attack: 10, defense: 5, midfield: 10 },
  "4-4-2": { attack: 5, defense: 10, midfield: 10 },
  "4-2-3-1": { attack: 10, defense: 5, midfield: 15 },
  "3-5-2": { attack: 15, defense: 0, midfield: 15 },
  "5-3-2": { attack: 5, defense: 15, midfield: 5 },
  "4-1-4-1": { attack: 10, defense: 10, midfield: 10 },
};

function calculateTeamStats(squad: SquadMember[]): TeamStats {
  if (squad.length === 0) {
    return { pace: 60, shooting: 60, passing: 60, dribbling: 60, defending: 60, physicality: 60, overall: 60 };
  }

  const players = squad.filter(s => s.player).map(s => s.player!);
  const starters = players.slice(0, 11);

  const avg = (key: keyof Player) => {
    if (starters.length === 0) return 60;
    return starters.reduce((sum, p) => sum + (p[key] as number || 60), 0) / starters.length;
  };

  const overall = starters.length > 0
    ? starters.reduce((sum, p) => sum + (p.overall_rating || 70), 0) / starters.length
    : 60;

  return {
    pace: avg("pace"),
    shooting: avg("shooting"),
    passing: avg("passing"),
    dribbling: avg("dribbling"),
    defending: avg("defending"),
    physicality: avg("physicality"),
    overall,
  };
}

function calculateStrength(stats: TeamStats, formation: string, style: string): number {
  const formationMod = FORMATION_MODIFIERS[formation] || { attack: 10, defense: 10, midfield: 10 };
  const styleBonus = STYLE_BONUSES[style] || { attack: 10, defense: 10 };

  const attack = (stats.shooting * 0.25 + stats.dribbling * 0.25 + stats.pace * 0.2 + stats.passing * 0.15 + formationMod.attack + styleBonus.attack);
  const defense = (stats.defending * 0.35 + stats.physicality * 0.25 + stats.passing * 0.15 + formationMod.defense + styleBonus.defense);

  return (attack + defense) / 2;
}

function simulateMatch(home: { agent: Agent; stats: TeamStats }, away: { agent: Agent; stats: TeamStats }): MatchResult {
  const homeStrength = calculateStrength(home.stats, home.agent.formation, home.agent.style);
  const awayStrength = calculateStrength(away.stats, away.agent.formation, away.agent.style);

  // Add some randomness (±15%)
  const homeRandom = 0.85 + Math.random() * 0.3;
  const awayRandom = 0.85 + Math.random() * 0.3;

  const homeAdjusted = homeStrength * homeRandom;
  const awayAdjusted = awayStrength * awayRandom;

  const total = homeAdjusted + awayAdjusted;
  const homePossession = Math.round((homeAdjusted / total) * 40 + 30); // 30-70%
  const awayPossession = 100 - homePossession;

  // xG based on strength and possession
  const homeXgRaw = (homeAdjusted / 100) * (homePossession / 50) * 2.5;
  const awayXgRaw = (awayAdjusted / 100) * (awayPossession / 50) * 2.5;

  // Convert xG to goals (Poisson-ish)
  const homeGoals = Math.min(Math.round(homeXgRaw * (0.5 + Math.random())), 6);
  const awayGoals = Math.min(Math.round(awayXgRaw * (0.5 + Math.random())), 6);

  // Generate events
  const events: MatchEvent[] = [];
  const goalScorers = ["Player A", "Player B", "Player C", "Player D"];

  for (let i = 0; i < homeGoals; i++) {
    events.push({
      minute: Math.floor(Math.random() * 90) + 1,
      player: goalScorers[Math.floor(Math.random() * goalScorers.length)],
      team: "home",
      type: "goal",
    });
  }

  for (let i = 0; i < awayGoals; i++) {
    events.push({
      minute: Math.floor(Math.random() * 90) + 1,
      player: goalScorers[Math.floor(Math.random() * goalScorers.length)],
      team: "away",
      type: "goal",
    });
  }

  events.sort((a, b) => a.minute - b.minute);

  return {
    homeScore: homeGoals,
    awayScore: awayGoals,
    homeXg: Math.round(homeXgRaw * 10) / 10,
    awayXg: Math.round(awayXgRaw * 10) / 10,
    homePossession,
    awayPossession,
    events,
  };
}

export async function runMatchSimulation(matchId: string): Promise<MatchResult> {
  const match = await db.getMatchById(matchId);
  if (!match) {
    throw new Error("Match not found");
  }

  if (match.status !== "scheduled") {
    throw new Error("Match already played");
  }

  // Get squads
  const homeSquad = await db.getSquad(match.home_agent_id);
  const awaySquad = await db.getSquad(match.away_agent_id);

  // Calculate stats
  const homeStats = calculateTeamStats(homeSquad);
  const awayStats = calculateTeamStats(awaySquad);

  // Get agents
  const homeAgent = await db.getAgentById(match.home_agent_id);
  const awayAgent = await db.getAgentById(match.away_agent_id);

  if (!homeAgent || !awayAgent) {
    throw new Error("Agent not found");
  }

  // Simulate
  const result = simulateMatch(
    { agent: homeAgent, stats: homeStats },
    { agent: awayAgent, stats: awayStats }
  );

  // Update match
  await db.updateMatch(matchId, {
    status: "completed",
    home_score: result.homeScore,
    away_score: result.awayScore,
    home_xg: result.homeXg,
    away_xg: result.awayXg,
    home_possession: result.homePossession,
    away_possession: result.awayPossession,
    match_data: result as unknown as Record<string, unknown>,
    completed_at: new Date().toISOString(),
  });

  console.log(`Match ${matchId}: ${homeAgent.team_name} ${result.homeScore} - ${result.awayScore} ${awayAgent.team_name}`);

  return result;
}

export async function runAllScheduledMatches(): Promise<number> {
  const matches = await db.getMatches(50, "scheduled");
  let count = 0;

  for (const match of matches) {
    if (new Date(match.scheduled_at) <= new Date()) {
      try {
        await runMatchSimulation(match.id);
        count++;
      } catch (err) {
        console.error(`Failed to simulate match ${match.id}:`, err);
      }
    }
  }

  return count;
}
