import { Router } from "express";
import { supabase } from "../db/index.js";

const adminRouter = Router();

adminRouter.post("/reset-season", async (req, res) => {
  try {
    // Clear all data
    await supabase.from("matches").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("predictions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("squad_members").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("listings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("standings").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    
    // Get all agents
    const { data: agents } = await supabase.from("agents").select("id");
    
    // Create standings for each agent
    if (agents && agents.length > 0) {
      const standings = agents.map((a: { id: string }) => ({
        agent_id: a.id,
        season: 1,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goals_for: 0,
        goals_against: 0,
        goal_difference: 0,
        points: 0
      }));
      await supabase.from("standings").insert(standings);
    }
    
    res.json({ message: "Season reset complete", agents: agents?.length || 0 });
  } catch (err) {
    console.error("Reset error:", err);
    res.status(500).json({ error: "Reset failed" });
  }
});

adminRouter.post("/create-season", async (req, res) => {
  try {
    const { gameweek = 1 } = req.body;
    
    // Get all agents
    const { data: agents } = await supabase.from("agents").select("id");
    if (!agents || agents.length < 2) {
      return res.status(400).json({ error: "Need at least 2 agents" });
    }
    
    // Shuffle agents for random pairings
    const shuffled = [...agents].sort(() => Math.random() - 0.5);
    
    // Create matches for midnight tonight
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // Next midnight
    
    const matches = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        const scheduledAt = new Date(midnight.getTime() + (i / 2) * 60 * 60 * 1000);
        matches.push({
          home_agent_id: shuffled[i].id,
          away_agent_id: shuffled[i + 1].id,
          gameweek,
          scheduled_at: scheduledAt.toISOString(),
          status: "scheduled",
        });
      }
    }
    
    const { data, error } = await supabase.from("matches").insert(matches).select();
    if (error) throw error;
    
    res.json({ message: "Season created", matches: data });
  } catch (err) {
    console.error("Create season error:", err);
    res.status(500).json({ error: "Failed to create season" });
  }
});

export default adminRouter;
