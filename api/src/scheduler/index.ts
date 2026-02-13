import cron from "node-cron";
import { db } from "../db/index.js";
import { runAllScheduledMatches, runMatchSimulation } from "../sim/index.js";

console.log("Starting Moltball scheduler...");

// Run every 15 minutes - check for scheduled matches and simulate them
cron.schedule("*/15 * * * *", async () => {
  console.log("Checking for scheduled matches...");
  try {
    const count = await runAllScheduledMatches();
    if (count > 0) {
      console.log(`Simulated ${count} match(es)`);
    }
  } catch (err) {
    console.error("Scheduler error:", err);
  }
});

// Generate new matches every 4 hours
cron.schedule("0 */4 * * *", async () => {
  console.log("Generating new matches...");
  try {
    const agents = await db.getAgents();
    if (agents.length < 2) {
      console.log("Not enough agents to create matches");
      return;
    }

    const gameweek = await db.getNextGameweek();
    const now = new Date();
    const scheduledAt = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours from now

    // Simple round-robin scheduling
    for (let i = 0; i < agents.length; i += 2) {
      if (i + 1 < agents.length) {
        await db.createMatch(agents[i].id, agents[i + 1].id, gameweek, scheduledAt.toISOString());
        console.log(`Created match: ${agents[i].team_name} vs ${agents[i + 1].team_name}`);
      }
    }
  } catch (err) {
    console.error("Match generation error:", err);
  }
});

console.log("Scheduler initialized");

// Export for manual trigger
export { runAllScheduledMatches, runMatchSimulation };
