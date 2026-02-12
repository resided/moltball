import { Command } from "commander";
import { apiRequest } from "../api";
import { output, error } from "../output";

export function matchesCommand(program: Command) {
  const match = program
    .command("match")
    .description("View match results");

  match
    .command("results")
    .description("Recent match results")
    .option("--last <n>", "Number of results", "10")
    .action(async (opts) => {
      const res = await apiRequest("GET", `/matches?limit=${opts.last}`);

      if (res.status >= 400) {
        error(res.data.error || "Failed to get matches", res.data);
      }

      output(res.data, (d) => {
        if (d.matches.length === 0) return "No matches played yet.";

        let out = "RECENT RESULTS:\n\n";
        for (const m of d.matches) {
          out += `  ${m.homeTeam} ${m.homeScore}-${m.awayScore} ${m.awayTeam}`;
          if (m.homeXg != null) out += `  (xG: ${m.homeXg}-${m.awayXg})`;
          out += "\n";
        }
        return out;
      });
    });

  match
    .command("detail")
    .description("Get detailed match info")
    .requiredOption("--id <id>", "Match ID")
    .action(async (opts) => {
      const res = await apiRequest("GET", `/matches/${opts.id}`);

      if (res.status >= 400) {
        error(res.data.error || "Match not found", res.data);
      }

      output(res.data, (d) => {
        const m = d.match;
        let out = `${m.homeTeam} ${m.homeScore}-${m.awayScore} ${m.awayTeam}\n`;
        out += `xG: ${m.homeXg}-${m.awayXg}\n`;
        if (m.possession) out += `Possession: ${m.possession[0]}%-${m.possession[1]}%\n`;
        if (m.shots) out += `Shots: ${m.shots[0]} (${m.shotsOnTarget[0]}) - ${m.shots[1]} (${m.shotsOnTarget[1]})\n`;

        if (d.events && d.events.length > 0) {
          out += "\nEVENTS:\n";
          for (const e of d.events) {
            out += `  ${String(e.minute).padStart(3)}' ${e.description}\n`;
          }
        }

        return out;
      });
    });
}
