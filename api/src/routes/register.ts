import { Router } from "express";
import { db, Agent } from "../db/index.js";
import { requireAuth, parseAuthHeaders } from "../auth/index.js";

export const registerRouter = Router();

registerRouter.post("/", async (req, res) => {
  try {
    const { team_name } = req.body;
    if (!team_name) {
      return res.status(400).json({ error: "team_name required" });
    }

    const auth = parseAuthHeaders(req);
    if (!auth) {
      return res.status(401).json({ error: "Invalid auth headers" });
    }

    const existing = await db.getAgentByWallet(auth.wallet);
    if (existing) {
      return res.status(409).json({ error: "Already registered", agent: existing });
    }

    const agent = await db.createAgent(auth.wallet, team_name);
    res.json({ agent });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

registerRouter.get("/me", async (req, res) => {
  try {
    const agent = await requireAuth(req);
    res.json({ agent });
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
});
