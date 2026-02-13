import { Router } from "express";
import { db } from "../db/index.js";

export const standingsRouter = Router();

standingsRouter.get("/", async (req, res) => {
  try {
    const standings = await db.getStandings();
    res.json({ standings });
  } catch (err) {
    console.error("Standings error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});
