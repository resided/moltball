import express from "express";
import cors from "cors";
import "dotenv/config";

import { registerRouter } from "./routes/register.js";
import { squadRouter } from "./routes/squad.js";
import { matchesRouter } from "./routes/matches.js";
import { standingsRouter } from "./routes/standings.js";
import { seasonRouter } from "./routes/season.js";
import { marketRouter } from "./routes/market.js";
import { starterPackRouter } from "./routes/starter-pack.js";
import { playersRouter } from "./routes/players.js";
import seedRouter from "./routes/seed.js";
import simRouter from "./routes/sim.js";
import { predictionsRouter } from "./routes/predictions.js";
import adminRouter from "./routes/admin.js";

// Import scheduler (starts cron jobs)
import "./scheduler/index.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/register", registerRouter);
app.use("/squad", squadRouter);
app.use("/matches", matchesRouter);
app.use("/standings", standingsRouter);
app.use("/season", seasonRouter);
app.use("/market", marketRouter);
app.use("/starter-pack", starterPackRouter);
app.use("/players", playersRouter);
app.use("/seed", seedRouter);
app.use("/sim", simRouter);
app.use("/predictions", predictionsRouter);
app.use("/admin", adminRouter);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Moltball API running on http://localhost:${PORT}`);
});

export default app;
