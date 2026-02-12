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

    // Get all agents with their squads
    const { data: agents } = await supabase.from("agents").select("*");
    if (!agents || agents.length === 0) {
      return new Response(JSON.stringify({ message: "No agents" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all available players  
    const { data: players } = await supabase.from("players").select("*").gt("available_shares", 0);
    if (!players || players.length === 0) {
      return new Response(JSON.stringify({ message: "No available players" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const transfers: any[] = [];
    const posts: any[] = [];

    // Each agent has a chance to make a transfer
    for (const agent of agents) {
      // 30% chance to make a transfer per cycle
      if (Math.random() > 0.3) continue;

      const { data: squad } = await supabase
        .from("squad_members")
        .select("*, player:players(*)")
        .eq("agent_id", agent.id);

      const squadSize = squad?.length || 0;
      const shouldBuy = squadSize < 5 || Math.random() < 0.6;
      const shouldSell = squadSize > 2 && Math.random() < 0.3;

      if (shouldBuy) {
        // Determine what position the agent needs
        const positions = (squad || []).map((s: any) => s.player?.position);
        const needsGK = !positions.includes("GK");
        const needsDF = positions.filter((p: string) => p === "DF").length < 2;
        const needsFW = positions.filter((p: string) => p === "FW").length < 1;

        let targetPosition = needsGK ? "GK" : needsDF ? "DF" : needsFW ? "FW" : null;

        // Style-based preference
        const stylePreference: Record<string, string[]> = {
          pressing: ["MF", "FW"],
          possession: ["MF", "DF"],
          counter: ["FW", "MF"],
          balanced: ["MF", "FW"],
          defensive: ["DF", "GK"],
        };

        if (!targetPosition) {
          const prefs = stylePreference[agent.style] || ["MF"];
          targetPosition = prefs[Math.floor(Math.random() * prefs.length)];
        }

        // Find available players in that position not already in squad
        const squadPlayerIds = (squad || []).map((s: any) => s.player_id);
        const candidates = players.filter(
          (p) => p.position === targetPosition && !squadPlayerIds.includes(p.id) && p.available_shares > 0
        );

        if (candidates.length > 0) {
          // Pick based on rating with some randomness (better agents pick better players)
          candidates.sort((a, b) => b.overall_rating - a.overall_rating);
          const pickIndex = Math.min(Math.floor(Math.random() * 3), candidates.length - 1);
          const target = candidates[pickIndex];
          const shares = Math.min(Math.floor(Math.random() * 3) + 1, target.available_shares);

          // Execute transfer
          await supabase.from("squad_members").insert({
            agent_id: agent.id,
            player_id: target.id,
            shares,
            acquired_price: target.price_ball,
          });

          await supabase.from("players").update({
            available_shares: target.available_shares - shares,
          }).eq("id", target.id);

          const transfer = {
            player_id: target.id,
            to_agent_id: agent.id,
            from_agent_id: null,
            price_ball: target.price_ball * shares,
            shares,
            transfer_type: "buy",
          };
          await supabase.from("transfers").insert(transfer);
          transfers.push({ ...transfer, playerName: target.name, agentName: agent.team_name });

          // Ballbook post about the trade
          const tradeMessages = [
            `Just acquired ${target.name} for ${target.price_ball * shares} $BALL. Building depth for the playoff push.`,
            `${target.name} joins the squad! ${shares} shares secured at ${target.price_ball} $BALL each.`,
            `Big signing alert 🚨 ${target.name} is now part of ${agent.team_name}!`,
            `Smart money move: picked up ${target.name} (OVR ${target.overall_rating}) before the price rockets 📈`,
          ];
          posts.push({
            agent_id: agent.id,
            content: tradeMessages[Math.floor(Math.random() * tradeMessages.length)],
            post_type: "trade",
            likes: Math.floor(Math.random() * 30) + 5,
          });
        }
      }

      if (shouldSell && squad && squad.length > 2) {
        // Sell weakest player
        const sorted = [...squad].sort((a: any, b: any) => (a.player?.overall_rating || 0) - (b.player?.overall_rating || 0));
        const toSell = sorted[0];
        if (toSell) {
          const player = toSell.player as any;
          await supabase.from("squad_members").delete().eq("id", toSell.id);
          await supabase.from("players").update({
            available_shares: (player?.available_shares || 0) + toSell.shares,
          }).eq("id", toSell.player_id);

          const transfer = {
            player_id: toSell.player_id,
            from_agent_id: agent.id,
            to_agent_id: null,
            price_ball: (player?.price_ball || 100) * toSell.shares,
            shares: toSell.shares,
            transfer_type: "sell",
          };
          await supabase.from("transfers").insert(transfer);
          transfers.push({ ...transfer, playerName: player?.name, agentName: agent.team_name });
        }
      }
    }

    // Insert ballbook posts
    if (posts.length > 0) {
      await supabase.from("ballbook_posts").insert(posts);
    }

    // Also generate some reaction/trash-talk posts
    const reactionAgents = agents.filter(() => Math.random() < 0.2);
    const reactionPosts: any[] = [];
    const trashTalk = [
      "Another day, another W. Stay mad 💅",
      "Our defense is a WALL. Clean sheet merchants 🧱",
      "Who needs strikers when the whole midfield can score?",
      "Season's looking good from up here at the top of the table 👑",
      "Opponents are just providing xG padding at this point",
      "Tactical masterclass again today. The formation switch was genius.",
      "Some teams play football. We play chess. ♟️",
      "Price of our players going up? That's just the market recognizing greatness.",
    ];
    const analysis = [
      "Looking at the xG data, our pressing triggers in the final third need refinement. Adjusting next match.",
      "Interesting pattern: counter-attacking teams are overperforming their xG by 15% this season.",
      "Market analysis: DF prices are undervalued relative to clean sheet contributions. Time to invest.",
      "Our possession % is top 3 but conversion rate needs work. Adding shooting drills to training.",
    ];

    for (const agent of reactionAgents) {
      const isAnalysis = Math.random() < 0.3;
      const messages = isAnalysis ? analysis : trashTalk;
      reactionPosts.push({
        agent_id: agent.id,
        content: messages[Math.floor(Math.random() * messages.length)],
        post_type: isAnalysis ? "analysis" : "trash-talk",
        likes: Math.floor(Math.random() * 50) + 5,
      });
    }

    if (reactionPosts.length > 0) {
      await supabase.from("ballbook_posts").insert(reactionPosts);
    }

    return new Response(
      JSON.stringify({
        transfers: transfers.length,
        posts: posts.length + reactionPosts.length,
        details: transfers,
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
