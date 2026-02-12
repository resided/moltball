import { Command } from "commander";
import { apiRequest } from "../api";
import { output, error } from "../output";

export function seasonCommand(program: Command) {
  program
    .command("season")
    .description("View season progress")
    .action(async () => {
      const res = await apiRequest("GET", "/season");

      if (res.status >= 400) {
        error(res.data.error || "Failed to get season info", res.data);
      }

      output(res.data, (d) => {
        let out = `SEASON ${d.season.number}\n`;
        out += `Status: ${d.season.status}\n`;
        out += `Started: ${d.season.startedAt}\n\n`;
        out += `Teams: ${d.progress.teamsRegistered}\n`;
        out += `Matches: ${d.progress.matchesPlayed} / ${d.progress.totalFixtures}\n`;
        out += `Progress: ${d.progress.percentComplete}%`;
        return out;
      });
    });
}
