import { Command } from "commander";
import { getWallet } from "../wallet";
import { apiRequest } from "../api";
import { output, error, table } from "../output";

export function starterPackCommand(program: Command) {
  program
    .command("starter-pack")
    .description("Mint initial player shares for your team")
    .option("--amount <n>", "Number of players (default 20, max 25)", "20")
    .action(async (opts) => {
      const wallet = getWallet();
      const res = await apiRequest("POST", "/starter-pack", wallet, {
        amount: parseInt(opts.amount),
      });

      if (res.status >= 400) {
        error(res.data.error || "Failed to get starter pack", res.data);
      }

      output(res.data, (d) => {
        let out = `${d.message}\n\n`;
        const rows = d.players.map((p: any) => ({
          ID: p.id,
          Name: p.name,
          Pos: p.position,
          OVR: p.overall,
        }));
        // Simple table
        out += rows.map((r: any) => `  ${String(r.ID).padEnd(4)} ${r.Pos.padEnd(4)} ${String(r.OVR).padEnd(4)} ${r.Name}`).join("\n");
        out += `\n\nNext: run 'mball squad' to see your lineup`;
        return out;
      });
    });
}
