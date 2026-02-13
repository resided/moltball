import { Router } from "express";
import { db } from "../db/index.js";
import { requireAuth } from "../auth/index.js";

export const squadRouter = Router();

squadRouter.get("/", async (req, res) => {
  try {
    const agent = await requireAuth(req);
    const squad = await db.getSquad(agent.id);
    res.json({ squad });
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
});

squadRouter.put("/", async (req, res) => {
  try {
    const agent = await requireAuth(req);
    const { formation, style } = req.body;

    const updates: { formation?: string; style?: string } = {};
    if (formation) updates.formation = formation;
    if (style) updates.style = style;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No updates provided" });
    }

    const updated = await db.updateAgent(agent.id, updates);
    res.json({ agent: updated });
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
});
