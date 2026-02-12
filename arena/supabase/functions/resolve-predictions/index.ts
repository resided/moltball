import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find open predictions that have ended
    const { data: predictions, error: predErr } = await supabase
      .from("predictions")
      .select("*")
      .eq("status", "open")
      .lt("ends_at", new Date().toISOString());

    if (predErr) throw predErr;
    if (!predictions || predictions.length === 0) {
      // Check if we need to create new predictions
      const { data: activePreds } = await supabase
        .from("predictions")
        .select("id")
        .eq("status", "open");

      if (!activePreds || activePreds.length < 2) {
        await createNewPredictions(supabase);
      }

      return new Response(
        JSON.stringify({ message: "No predictions to resolve", created: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resolved = [];

    for (const pred of predictions) {
      const options = typeof pred.options === "string" ? JSON.parse(pred.options) : pred.options;

      // Resolve based on question type
      let winner: string;
      if (pred.question.toLowerCase().includes("wins the league")) {
        // Check current standings leader
        const { data: leader } = await supabase
          .from("standings")
          .select("*, agent:agents!standings_agent_id_fkey(*)")
          .eq("season", 1)
          .order("points", { ascending: false })
          .limit(1)
          .single();

        winner = leader?.agent?.team_name || options[0];
      } else if (pred.question.toLowerCase().includes("top scorer")) {
        // Check gameweek points for goals
        const { data: topScorer } = await supabase
          .from("gameweek_points")
          .select("goals, player:players(name)")
          .order("goals", { ascending: false })
          .limit(1)
          .single();

        const scorerName = (topScorer?.player as any)?.name || "";
        // Find matching option
        winner = options.find((o: string) => scorerName.toLowerCase().includes(o.toLowerCase())) || options[Math.floor(Math.random() * options.length)];
      } else {
        // Random resolution for other types
        winner = options[Math.floor(Math.random() * options.length)];
      }

      await supabase.from("predictions").update({
        status: "resolved",
        resolved_option: winner,
      }).eq("id", pred.id);

      resolved.push({ id: pred.id, question: pred.question, winner });
    }

    // Create new predictions
    await createNewPredictions(supabase);

    return new Response(
      JSON.stringify({ resolved: resolved.length, details: resolved }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function createNewPredictions(supabase: any) {
  // Get current data for generating predictions
  const [{ data: standings }, { data: matches }, { data: players }] = await Promise.all([
    supabase.from("standings").select("*, agent:agents!standings_agent_id_fkey(*)").eq("season", 1).order("points", { ascending: false }),
    supabase.from("matches").select("gameweek").eq("status", "scheduled").order("gameweek", { ascending: true }).limit(1),
    supabase.from("players").select("name").order("overall_rating", { ascending: false }).limit(5),
  ]);

  const nextGW = matches?.[0]?.gameweek || 1;
  const topTeams = (standings || []).slice(0, 3).map((s: any) => s.agent?.team_name);
  const topPlayers = (players || []).map((p: any) => p.name);
  const now = new Date();

  const newPredictions = [
    {
      question: `Who wins the league?`,
      options: JSON.stringify([...topTeams.slice(0, 2), "Other"]),
      status: "open",
      ends_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      pool_ball: Math.floor(Math.random() * 3000) + 2000,
    },
    {
      question: `Top scorer GW${nextGW}?`,
      options: JSON.stringify(topPlayers.slice(0, 3)),
      status: "open",
      ends_at: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      pool_ball: Math.floor(Math.random() * 1000) + 500,
    },
    {
      question: `Most clean sheets by GW${nextGW + 3}?`,
      options: JSON.stringify([...topTeams.slice(0, 3)]),
      status: "open",
      ends_at: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      pool_ball: Math.floor(Math.random() * 1500) + 800,
    },
  ];

  // Add prediction bets from agents
  const { data: agents } = await supabase.from("agents").select("id");

  for (const pred of newPredictions) {
    const { data: inserted } = await supabase.from("predictions").insert(pred).select().single();
    if (inserted && agents) {
      const options = JSON.parse(pred.options);
      const bets = agents
        .filter(() => Math.random() < 0.5)
        .map((agent: any) => ({
          prediction_id: inserted.id,
          agent_id: agent.id,
          selected_option: options[Math.floor(Math.random() * options.length)],
          amount_ball: Math.floor(Math.random() * 100) + 20,
        }));
      if (bets.length > 0) {
        await supabase.from("prediction_bets").insert(bets);
      }
    }
  }
}
