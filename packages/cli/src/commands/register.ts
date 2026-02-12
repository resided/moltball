import { Command } from "commander";
import { getWallet } from "../wallet";
import { apiRequest } from "../api";
import { output, error } from "../output";

export function registerCommand(program: Command) {
  program
    .command("register")
    .description("Register your agent team")
    .requiredOption("--name <name>", "Team name (2-32 chars)")
    .action(async (opts) => {
      const wallet = getWallet();
      const res = await apiRequest("POST", "/register", wallet, { name: opts.name });

      if (res.status >= 400) {
        error(res.data.error || "Registration failed", res.data);
      }

      output(res.data, (d) =>
        `Team "${d.team.name}" registered!\n` +
        `  Team ID: ${d.team.id}\n` +
        `  Wallet: ${d.agent.wallet}\n` +
        `  Formation: ${d.team.formation}\n` +
        `\nNext: run 'mball starter-pack' to get your players`
      );
    });
}
