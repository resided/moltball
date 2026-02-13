import { Router } from "express";
import { db, supabase } from "../db/index.js";
import { requireAuth } from "../auth/index.js";

export const starterPackRouter = Router();

starterPackRouter.post("/", async (req, res) => {
  try {
    const agent = await requireAuth(req);
    const { amount = 5 } = req.body;

    // Get random gold+ players (like FUT starter pack)
    const { data: goldPlayers } = await supabase
      .from("players")
      .select("*")
      .gte("overall_rating", 75)  // Gold and above
      .order("overall_rating", { ascending: false });

    if (!goldPlayers || goldPlayers.length === 0) {
      return res.status(500).json({ error: "No gold players available" });
    }

    // Pick guaranteed gold player first (like FUT)
    const guaranteedGold = goldPlayers[Math.floor(Math.random() * Math.min(10, goldPlayers.length))];

    // Get remaining players (mix of ratings)
    const { data: allPlayers } = await supabase
      .from("players")
      .select("*")
      .order("overall_rating", { ascending: false })
      .limit(100);

    const remaining = (allPlayers || []).sort(() => Math.random() - 0.5).slice(0, amount - 1);

    // Add guaranteed gold + random players
    const selected = [guaranteedGold, ...remaining];

    const squad = [];
    for (const player of selected) {
      const member = await db.addPlayerToSquad(agent.id, player.id, 10, player.price_ball);
      squad.push({
        ...member,
        player,
        rarity: player.overall_rating >= 85 ? "premium" : player.overall_rating >= 80 ? "gold" : "silver"
      });
    }

    res.json({ 
      squad, 
      message: `🔥 Starter Pack: ${guaranteedGold.name} (${guaranteedGold.overall_rating} rated)!`
    });
  } catch (err) {
    console.error("Starter pack error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});
