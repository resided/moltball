import { Router } from "express";
import { db } from "../db/index.js";
import { requireAuth } from "../auth/index.js";

export const marketRouter = Router();

marketRouter.get("/", async (req, res) => {
  try {
    const playerId = req.query.playerId as string;
    const limit = parseInt(req.query.limit as string) || 50;
    const listings = await db.getListings(playerId, limit);
    res.json({ listings });
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});

marketRouter.post("/list", async (req, res) => {
  try {
    const agent = await requireAuth(req);
    const { playerId, pricePerShare, shares } = req.body;

    if (!playerId || !pricePerShare || !shares) {
      return res.status(400).json({ error: "playerId, pricePerShare, and shares required" });
    }

    const listing = await db.createListing(agent.id, playerId, pricePerShare, shares);
    res.json({ listing });
  } catch (err) {
    console.error("List error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});
