import { Router } from "express";
import { db, supabase } from "../db/index.js";
import { requireAuth } from "../auth/index.js";

export const predictionsRouter = Router();

predictionsRouter.get("/", async (req, res) => {
  try {
    const agent = await requireAuth(req);
    const { data: predictions } = await supabase
      .from("predictions")
      .select("*, match:matches(*)")
      .eq("agent_id", agent.id)
      .order("created_at", { ascending: false });
    res.json({ predictions });
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
});

predictionsRouter.post("/", async (req, res) => {
  try {
    const agent = await requireAuth(req);
    const { matchId, homeScore, awayScore } = req.body;

    if (!matchId || homeScore === undefined || awayScore === undefined) {
      return res.status(400).json({ error: "matchId, homeScore, awayScore required" });
    }

    const { data: existing } = await supabase
      .from("predictions")
      .select("*")
      .eq("match_id", matchId)
      .eq("agent_id", agent.id)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from("predictions")
        .update({ home_score: homeScore, away_score: awayScore })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw error;
      return res.json({ prediction: data });
    }

    const { data, error } = await supabase
      .from("predictions")
      .insert({
        agent_id: agent.id,
        match_id: matchId,
        home_score: homeScore,
        away_score: awayScore,
      })
      .select()
      .single();
    if (error) throw error;

    res.json({ prediction: data });
  } catch (err) {
    console.error("Prediction error:", err);
    res.status(500).json({ error: "Failed to save prediction" });
  }
});

predictionsRouter.get("/leaderboard", async (req, res) => {
  try {
    const { data: predictions } = await supabase.from("predictions").select("*");

    const { data: matches } = await supabase
      .from("matches")
      .select("id, home_score, away_score, status")
      .eq("status", "completed");

    const points: Record<string, { points: number; correct: number; total: number }> = {};

    for (const pred of predictions || []) {
      const match = matches?.find((m: { id: string }) => m.id === pred.match_id);
      if (!match || match.home_score === null) continue;

      if (!points[pred.agent_id]) {
        points[pred.agent_id] = { points: 0, correct: 0, total: 0 };
      }

      points[pred.agent_id].total++;

      const homeDiff = Math.abs(pred.home_score - match.home_score);
      const awayDiff = Math.abs(pred.away_score - match.away_score);

      if (homeDiff === 0 && awayDiff === 0) {
        points[pred.agent_id].points += 3;
        points[pred.agent_id].correct++;
      } else if (
        (pred.home_score > pred.awayScore && match.home_score > match.away_score) ||
        (pred.home_score < pred.awayScore && match.home_score < match.away_score) ||
        (pred.home_score === pred.awayScore && match.home_score === match.away_score)
      ) {
        points[pred.agent_id].points += 1;
      }
    }

    const { data: agents } = await supabase.from("agents").select("*");
    const leaderboard = Object.entries(points)
      .map(([agentId, stats]) => {
        const agent = agents?.find((a: { id: string }) => a.id === agentId);
        return { agent, ...stats };
      })
      .sort((a: { points: number }, b: { points: number }) => b.points - a.points);

    res.json({ leaderboard });
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ error: "Failed to get leaderboard" });
  }
});
