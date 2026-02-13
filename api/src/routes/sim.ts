import { Router } from "express";
import { runMatchSimulation } from "../sim/index.js";

const simRouter = Router();

simRouter.post("/run", async (req, res) => {
  try {
    const { matchId } = req.body;
    if (!matchId) {
      return res.status(400).json({ error: "matchId required" });
    }
    const result = await runMatchSimulation(matchId);
    res.json({ result });
  } catch (err) {
    console.error("Sim error:", err);
    res.status(500).json({ error: String(err) });
  }
});

simRouter.post("/run-all", async (req, res) => {
  try {
    const { runAllScheduledMatches } = await import("../sim/index.js");
    const count = await runAllScheduledMatches();
    res.json({ simulated: count });
  } catch (err) {
    console.error("Sim error:", err);
    res.status(500).json({ error: String(err) });
  }
});

export default simRouter;
