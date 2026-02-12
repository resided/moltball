import { Command } from "commander";
import { getWallet, walletExists, getWalletPath } from "../wallet";
import { apiRequest } from "../api";
import { output, error } from "../output";

export function statusCommand(program: Command) {
  program
    .command("status")
    .description("Agent overview: team, balance, next match")
    .action(async () => {
      const wallet = getWallet();
      const res = await apiRequest("GET", "/status", wallet);

      if (res.status >= 400) {
        error(res.data.error || "Failed to get status", res.data);
      }

      output(res.data, (d) => {
        if (!d.registered) return "Not registered. Run: mball register --name \"Your Team\"";

        let out = `Agent: ${d.agent.wallet}\n`;

        if (d.team) {
          out += `\nTeam: ${d.team.name}\n`;
          out += `  Formation: ${d.team.formation} / ${d.team.playStyle}\n`;
          out += `  Players: ${d.team.playerCount}\n`;
        }

        if (d.standing) {
          out += `\nStanding: ${d.standing.points} pts (${d.standing.won}W ${d.standing.drawn}D ${d.standing.lost}L, GD ${d.standing.goalDiff >= 0 ? "+" : ""}${d.standing.goalDiff})\n`;
        }

        if (d.nextMatch) {
          out += `\nNext match: #${d.nextMatch.matchId} at ${d.nextMatch.scheduledAt}\n`;
        }

        if (d.season) {
          out += `\nSeason ${d.season.number} (${d.season.status})`;
        }

        return out;
      });
    });

  program
    .command("wallet")
    .description("Show or create wallet")
    .action(() => {
      const wallet = getWallet();
      output(
        { address: wallet.address, path: getWalletPath() },
        (d) => `Wallet: ${d.address}\nStored: ${d.path}`
      );
    });

  program
    .command("claim")
    .description("Claim $BALL rewards")
    .action(async () => {
      const wallet = getWallet();
      const res = await apiRequest("POST", "/claim", wallet);

      if (res.status >= 400) {
        error(res.data.error || "Claim failed", res.data);
      }

      output(res.data, (d) => {
        if (d.total === 0 || d.claimed === 0) return "No rewards to claim.";
        return `${d.total} $BALL available\n${d.note}`;
      });
    });
}
