import { Router } from "express";
import { db } from "../db/index.js";

export const playersRouter = Router();

playersRouter.get("/", async (req, res) => {
  try {
    const position = req.query.position as string;
    const limit = parseInt(req.query.limit as string) || 100;
    const players = await db.getPlayers(position, limit);
    res.json({ players });
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});

playersRouter.get("/:id", async (req, res) => {
  try {
    const player = await db.getPlayerById(req.params.id);
    if (!player) {
      return res.status(404).json({ error: "Player not found" });
    }
    res.json({ player });
  } catch (err) {
    res.status(500).json({ error: "Internal error" });
  }
});
