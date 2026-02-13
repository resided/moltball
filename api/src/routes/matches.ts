import { Router } from "express";
import { db } from "../db/index.js";

export const matchesRouter = Router();

matchesRouter.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string | undefined;
    const matches = await db.getMatches(limit, status);
    res.json({ matches });
  } catch (err) {
    console.error("Matches error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

matchesRouter.get("/:id", async (req, res) => {
  try {
    const match = await db.getMatchById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: "Match not found" });
    }
    res.json({ match });
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});
