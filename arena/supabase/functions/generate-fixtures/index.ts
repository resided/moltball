import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Round-robin scheduler for n teams (handles odd numbers with a bye)
function generateRoundRobin(teamIds: string[]): { home: string; away: string; gameweek: number }[] {
  const teams = [...teamIds];
  const n = teams.length;
  // If odd number, add a "BYE" placeholder
  if (n % 2 !== 0) teams.push("BYE");
  const totalTeams = teams.length;
  const rounds = totalTeams - 1;
  const matchesPerRound = totalTeams / 2;

  const fixtures: { home: string; away: string; gameweek: number }[] = [];
  const fixed = teams[0];
  const rotating = teams.slice(1);

  for (let round = 0; round < rounds; round++) {
    const current = [fixed, ...rotating];
    for (let i = 0; i < matchesPerRound; i++) {
      const home = current[i];
      const away = current[totalTeams - 1 - i];
      if (home === "BYE" || away === "BYE") continue;
      // Alternate home/away each round for fairness
      if (round % 2 === 0) {
        fixtures.push({ home, away, gameweek: round + 1 });
      } else {
        fixtures.push({ home: away, away: home, gameweek: round + 1 });
      }
    }
    // Rotate: move last to position 1
    rotating.unshift(rotating.pop()!);
  }

  // Generate return fixtures (reverse home/away) for the second half of the season
  const returnFixtures = fixtures.map((f, i) => ({
    home: f.away,
    away: f.home,
    gameweek: f.gameweek + rounds,
  }));

  return [...fixtures, ...returnFixtures];
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

    // Get all agents
    const { data: agents, error: agentErr } = await supabase
      .from("agents")
      .select("id")
      .order("created_at");

    if (agentErr) throw agentErr;
    if (!agents || agents.length < 2) {
      return new Response(JSON.stringify({ error: "Need at least 2 agents" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Delete existing scheduled matches (keep completed/live ones)
    await supabase.from("matches").delete().eq("status", "scheduled");

    const teamIds = agents.map((a) => a.id);
    const fixtures = generateRoundRobin(teamIds);

    // Create matches with scheduled_at spread across time
    const now = new Date();
    const matchRows = fixtures.map((f, i) => ({
      gameweek: f.gameweek,
      home_agent_id: f.home,
      away_agent_id: f.away,
      status: "scheduled",
      scheduled_at: new Date(now.getTime() + i * 4 * 60 * 60 * 1000).toISOString(), // 4h apart
    }));

    // Insert in batches of 50
    const batchSize = 50;
    let inserted = 0;
    for (let i = 0; i < matchRows.length; i += batchSize) {
      const batch = matchRows.slice(i, i + batchSize);
      const { error } = await supabase.from("matches").insert(batch);
      if (error) throw error;
      inserted += batch.length;
    }

    // Reset standings
    for (const agentId of teamIds) {
      await supabase
        .from("standings")
        .update({
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goals_for: 0,
          goals_against: 0,
          points: 0,
          form: JSON.stringify([]),
        })
        .eq("agent_id", agentId)
        .eq("season", 1);
    }

    const totalGameweeks = (teamIds.length - 1) * 2; // Round-robin home & away

    return new Response(
      JSON.stringify({
        success: true,
        teams: teamIds.length,
        totalGameweeks,
        totalMatches: inserted,
        matchesPerGameweek: Math.floor(teamIds.length / 2),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
