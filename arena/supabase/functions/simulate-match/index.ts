import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FIRST_NAMES = ["Marco", "Liam", "Carlos", "Kenji", "Youssef", "Ivan", "Diego", "Leo", "Jan", "Erik"];
const LAST_NAMES = ["Silva", "Torres", "Müller", "Park", "Ahmed", "Volkov", "Santos", "Costa", "Berg", "Rossi"];

function pickName() {
  return `${FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)]} ${LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)]}`;
}

function simulateGoals(rating: number, style: string): number {
  const base = rating / 100;
  const styleBonus = style === "pressing" ? 0.15 : style === "possession" ? 0.1 : style === "counter" ? 0.12 : 0.05;
  const xg = base + styleBonus + Math.random() * 0.5;
  let goals = 0;
  for (let i = 0; i < 5; i++) {
    if (Math.random() < xg * 0.3) goals++;
  }
  return goals;
}

function generateEvents(
  homeScore: number,
  awayScore: number,
  homeAgentId: string,
  awayAgentId: string,
  homeSquad: any[],
  awaySquad: any[]
): { minute: number; event_type: string; description: string; agent_id: string; player_id: string | null }[] {
  const events: any[] = [];

  // Goal events
  const goalMinutes: number[] = [];
  const totalGoals = homeScore + awayScore;
  while (goalMinutes.length < totalGoals) {
    const m = Math.floor(Math.random() * 88) + 1;
    if (!goalMinutes.includes(m)) goalMinutes.push(m);
  }
  goalMinutes.sort((a, b) => a - b);

  let homeGoalsLeft = homeScore;
  for (const minute of goalMinutes) {
    const isHome = homeGoalsLeft > 0 && (Math.random() < homeScore / totalGoals || homeGoalsLeft === goalMinutes.length - events.filter(e => e.event_type === "goal").length);
    const squad = isHome ? homeSquad : awaySquad;
    const agentId = isHome ? homeAgentId : awayAgentId;
    // Pick a forward/midfielder for goals
    const scorers = squad.filter((s: any) => ["FW", "MF"].includes(s.player?.position));
    const scorer = scorers.length > 0 ? scorers[Math.floor(Math.random() * scorers.length)] : squad[Math.floor(Math.random() * squad.length)];
    const playerName = scorer?.player?.name || pickName();

    const descriptions = [
      `${playerName} fires into the top corner!`,
      `${playerName} scores with a clinical finish!`,
      `${playerName} heads it home from a corner!`,
      `${playerName} taps it in from close range!`,
      `${playerName} unleashes a rocket from 25 yards!`,
      `${playerName} dinks it over the keeper!`,
    ];

    events.push({
      minute,
      event_type: "goal",
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      agent_id: agentId,
      player_id: scorer?.player_id || null,
    });
    if (isHome) homeGoalsLeft--;
  }

  // Yellow cards (1-4 per match)
  const numCards = Math.floor(Math.random() * 4) + 1;
  for (let i = 0; i < numCards; i++) {
    const isHome = Math.random() < 0.5;
    const squad = isHome ? homeSquad : awaySquad;
    const agentId = isHome ? homeAgentId : awayAgentId;
    const player = squad[Math.floor(Math.random() * squad.length)];
    const playerName = player?.player?.name || pickName();
    let minute = Math.floor(Math.random() * 88) + 1;
    while (goalMinutes.includes(minute)) minute = Math.floor(Math.random() * 88) + 1;

    events.push({
      minute,
      event_type: "yellow_card",
      description: `${playerName} booked for a reckless challenge`,
      agent_id: agentId,
      player_id: player?.player_id || null,
    });
  }

  // Chances / saves (2-5 per match)
  const numChances = Math.floor(Math.random() * 4) + 2;
  for (let i = 0; i < numChances; i++) {
    const isHome = Math.random() < 0.5;
    const squad = isHome ? homeSquad : awaySquad;
    const agentId = isHome ? homeAgentId : awayAgentId;
    const player = squad[Math.floor(Math.random() * squad.length)];
    const playerName = player?.player?.name || pickName();
    const minute = Math.floor(Math.random() * 88) + 1;
    const isSave = Math.random() < 0.5;

    events.push({
      minute,
      event_type: isSave ? "save" : "chance",
      description: isSave
        ? `Great save denies ${playerName}'s powerful shot`
        : `${playerName} goes close but fires wide`,
      agent_id: agentId,
      player_id: player?.player_id || null,
    });
  }

  return events.sort((a, b) => a.minute - b.minute);
}

function generateGameweekPoints(
  events: any[],
  homeAgentId: string,
  awayAgentId: string,
  homeSquad: any[],
  awaySquad: any[],
  homeScore: number,
  awayScore: number,
  gameweek: number
) {
  const points: any[] = [];
  const allSquad = [
    ...homeSquad.map((s: any) => ({ ...s, agentId: homeAgentId, isHome: true })),
    ...awaySquad.map((s: any) => ({ ...s, agentId: awayAgentId, isHome: false })),
  ];

  for (const member of allSquad) {
    const playerId = member.player_id;
    const agentId = member.agentId;
    const position = member.player?.position || "MF";
    const minutesPlayed = 60 + Math.floor(Math.random() * 30);

    // Count goals and assists for this player
    const goals = events.filter((e) => e.event_type === "goal" && e.player_id === playerId).length;
    const assists = Math.random() < 0.3 && goals === 0 ? 1 : 0; // simplified
    const cleanSheet = member.isHome ? awayScore === 0 : homeScore === 0;
    const bonus = goals >= 2 ? 3 : goals === 1 ? 1 : 0;

    // Points calc: 2 for playing, goals (FW=4, MF=5, DF=6, GK=6), CS (DF/GK=4), assists=3, bonus
    let totalPoints = 2; // appearance
    const goalPoints = position === "FW" ? 4 : position === "MF" ? 5 : 6;
    totalPoints += goals * goalPoints;
    totalPoints += assists * 3;
    if (cleanSheet && (position === "DF" || position === "GK")) totalPoints += 4;
    totalPoints += bonus;

    points.push({
      player_id: playerId,
      agent_id: agentId,
      gameweek,
      goals,
      assists,
      clean_sheet: cleanSheet && (position === "DF" || position === "GK"),
      bonus,
      minutes_played: minutesPlayed,
      total_points: totalPoints,
    });
  }

  return points;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find next scheduled matches (one gameweek at a time)
    const { data: nextMatch } = await supabase
      .from("matches")
      .select("gameweek")
      .eq("status", "scheduled")
      .order("gameweek", { ascending: true })
      .limit(1)
      .single();

    if (!nextMatch) {
      return new Response(
        JSON.stringify({ message: "No scheduled matches to simulate" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const gameweek = nextMatch.gameweek;

    const { data: matches, error: matchErr } = await supabase
      .from("matches")
      .select("*, home_agent:agents!matches_home_agent_id_fkey(*), away_agent:agents!matches_away_agent_id_fkey(*)")
      .eq("status", "scheduled")
      .eq("gameweek", gameweek);

    if (matchErr) throw matchErr;
    if (!matches || matches.length === 0) {
      return new Response(
        JSON.stringify({ message: "No matches for this gameweek" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const match of matches) {
      const homeAgent = match.home_agent;
      const awayAgent = match.away_agent;

      // Get squads with player data
      const [{ data: homeSquad }, { data: awaySquad }] = await Promise.all([
        supabase.from("squad_members").select("*, player:players(*)").eq("agent_id", homeAgent.id),
        supabase.from("squad_members").select("*, player:players(*)").eq("agent_id", awayAgent.id),
      ]);

      const homeAvgRating = (homeSquad?.length || 0) > 0
        ? homeSquad!.reduce((s, m) => s + ((m.player as any)?.overall_rating || 70), 0) / homeSquad!.length
        : 70;
      const awayAvgRating = (awaySquad?.length || 0) > 0
        ? awaySquad!.reduce((s, m) => s + ((m.player as any)?.overall_rating || 70), 0) / awaySquad!.length
        : 70;

      const homeScore = simulateGoals(homeAvgRating + 3, homeAgent.style);
      const awayScore = simulateGoals(awayAvgRating, awayAgent.style);
      const homePoss = 45 + Math.floor(Math.random() * 20);

      // Generate match events
      const events = generateEvents(homeScore, awayScore, homeAgent.id, awayAgent.id, homeSquad || [], awaySquad || []);

      // Update match
      await supabase.from("matches").update({
        home_score: homeScore,
        away_score: awayScore,
        status: "completed",
        home_xg: +(homeScore + Math.random() * 0.8 - 0.3).toFixed(1),
        away_xg: +(awayScore + Math.random() * 0.8 - 0.3).toFixed(1),
        home_possession: homePoss,
        away_possession: 100 - homePoss,
        completed_at: new Date().toISOString(),
      }).eq("id", match.id);

      // Insert match events
      if (events.length > 0) {
        const eventRows = events.map((e) => ({
          match_id: match.id,
          agent_id: e.agent_id,
          player_id: e.player_id,
          minute: e.minute,
          event_type: e.event_type,
          description: e.description,
        }));
        await supabase.from("match_events").insert(eventRows);
      }

      // Generate and insert gameweek points
      const gwPoints = generateGameweekPoints(events, homeAgent.id, awayAgent.id, homeSquad || [], awaySquad || [], homeScore, awayScore, gameweek);
      if (gwPoints.length > 0) {
        await supabase.from("gameweek_points").insert(gwPoints);
      }

      // Update standings
      const homeResult = homeScore > awayScore ? "W" : homeScore === awayScore ? "D" : "L";
      const awayResult = awayScore > homeScore ? "W" : awayScore === homeScore ? "D" : "L";

      for (const [agentId, result, gf, ga] of [
        [homeAgent.id, homeResult, homeScore, awayScore],
        [awayAgent.id, awayResult, awayScore, homeScore],
      ] as [string, string, number, number][]) {
        const pts = result === "W" ? 3 : result === "D" ? 1 : 0;
        const { data: standing } = await supabase
          .from("standings")
          .select("*")
          .eq("agent_id", agentId)
          .eq("season", 1)
          .single();

        if (standing) {
          const form = typeof standing.form === "string" ? JSON.parse(standing.form) : (standing.form || []);
          form.push(result);
          if (form.length > 5) form.shift();

          await supabase.from("standings").update({
            played: standing.played + 1,
            won: standing.won + (result === "W" ? 1 : 0),
            drawn: standing.drawn + (result === "D" ? 1 : 0),
            lost: standing.lost + (result === "L" ? 1 : 0),
            goals_for: standing.goals_for + gf,
            goals_against: standing.goals_against + ga,
            points: standing.points + pts,
            form: JSON.stringify(form),
          }).eq("id", standing.id);
        }
      }

      // Update player prices based on goals scored
      for (const event of events.filter((e) => e.event_type === "goal" && e.player_id)) {
        const { data: player } = await supabase
          .from("players")
          .select("price_ball")
          .eq("id", event.player_id)
          .single();

        if (player) {
          const priceChange = Math.floor(Math.random() * 20) + 5;
          const newPrice = player.price_ball + priceChange;
          await supabase.from("players").update({ price_ball: newPrice }).eq("id", event.player_id);
          await supabase.from("player_price_history").insert({
            player_id: event.player_id,
            price: newPrice,
            volume: Math.floor(Math.random() * 200) + 50,
          });
        }
      }

      // Also add price history for non-scorers (slight random drift)
      const allPlayerIds = [...new Set([...(homeSquad || []), ...(awaySquad || [])].map((s) => s.player_id))];
      const scorerIds = events.filter((e) => e.event_type === "goal" && e.player_id).map((e) => e.player_id);
      const nonScorers = allPlayerIds.filter((id) => !scorerIds.includes(id));

      for (const playerId of nonScorers.slice(0, 5)) { // Only do a few to limit writes
        const { data: player } = await supabase
          .from("players")
          .select("price_ball")
          .eq("id", playerId)
          .single();

        if (player) {
          const drift = Math.floor(Math.random() * 10) - 4; // -4 to +5
          const newPrice = Math.max(50, player.price_ball + drift);
          await supabase.from("players").update({ price_ball: newPrice }).eq("id", playerId);
          await supabase.from("player_price_history").insert({
            player_id: playerId,
            price: newPrice,
            volume: Math.floor(Math.random() * 50) + 10,
          });
        }
      }

      results.push({
        match_id: match.id,
        home: homeAgent.team_name,
        away: awayAgent.team_name,
        score: `${homeScore}-${awayScore}`,
        events: events.length,
      });
    }

    return new Response(
      JSON.stringify({ gameweek, simulated: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
