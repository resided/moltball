import { Router } from "express";
import { db } from "../db/index.js";

export const seasonRouter = Router();

seasonRouter.get("/", async (req, res) => {
  try {
    const season = await db.getSeasonInfo();
    res.json(season);
  } catch (err) {
    console.error("Season error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});
