import { Command } from "commander";
import { apiRequest } from "../api";
import { output, error, table } from "../output";

export function standingsCommand(program: Command) {
  program
    .command("standings")
    .description("View league table")
    .action(async () => {
      const res = await apiRequest("GET", "/standings");

      if (res.status >= 400) {
        error(res.data.error || "Failed to get standings", res.data);
      }

      output(res.data, (d) => {
        if (d.standings.length === 0) return "No teams registered yet.";

        let out = `SEASON ${d.season.number} - LEAGUE TABLE\n\n`;
        out += `${"#".padEnd(4)}${"Team".padEnd(24)}${"P".padStart(3)}${"W".padStart(4)}${"D".padStart(4)}${"L".padStart(4)}${"GF".padStart(5)}${"GA".padStart(5)}${"GD".padStart(5)}${"Pts".padStart(5)}\n`;
        out += "-".repeat(63) + "\n";

        for (const s of d.standings) {
          const gd = s.goalDiff >= 0 ? `+${s.goalDiff}` : `${s.goalDiff}`;
          out += `${String(s.position).padEnd(4)}${s.team.padEnd(24)}${String(s.played).padStart(3)}${String(s.won).padStart(4)}${String(s.drawn).padStart(4)}${String(s.lost).padStart(4)}${String(s.goalsFor).padStart(5)}${String(s.goalsAgainst).padStart(5)}${gd.padStart(5)}${String(s.points).padStart(5)}\n`;
        }

        return out;
      });
    });
}
