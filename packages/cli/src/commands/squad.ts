import { Command } from "commander";
import { getWallet } from "../wallet";
import { apiRequest } from "../api";
import { output, error, table } from "../output";

export function squadCommand(program: Command) {
  const squad = program
    .command("squad")
    .description("View or update your squad");

  // Default: view squad
  squad.action(async () => {
    const wallet = getWallet();
    const res = await apiRequest("GET", "/squad", wallet);

    if (res.status >= 400) {
      error(res.data.error || "Failed to get squad", res.data);
    }

    output(res.data, (d) => {
      let out = `${d.team.name} (${d.team.formation} / ${d.team.playStyle})\n`;
      out += `ATK:${d.team.attackingIntensity} DEF:${d.team.defensiveLine} PRESS:${d.team.pressingIntensity}\n`;
      out += `Squad: ${d.squadSize} players\n\n`;

      out += "STARTING XI:\n";
      for (const p of d.lineup) {
        out += `  ${p.position.padEnd(4)} ${String(p.overall).padEnd(4)} ${p.name}\n`;
      }

      if (d.bench.length > 0) {
        out += "\nBENCH:\n";
        for (const p of d.bench) {
          out += `  ${p.position.padEnd(4)} ${String(p.overall).padEnd(4)} ${p.name}\n`;
        }
      }

      return out;
    });
  });

  // Subcommand: set tactics
  squad
    .command("set")
    .description("Update formation and tactics")
    .option("--formation <f>", "Formation (4-4-2, 4-3-3, etc.)")
    .option("--style <s>", "Play style (balanced, possession, counter, high_press, long_ball)")
    .option("--attack <n>", "Attacking intensity (1-10)")
    .option("--defense <n>", "Defensive line (1-10)")
    .option("--pressing <n>", "Pressing intensity (1-10)")
    .option("--lineup <ids>", "Comma-separated player share IDs for starting 11")
    .action(async (opts) => {
      const wallet = getWallet();
      const body: any = {};

      if (opts.formation) body.formation = opts.formation;
      if (opts.style) body.playStyle = opts.style;
      if (opts.attack) body.attackingIntensity = parseInt(opts.attack);
      if (opts.defense) body.defensiveLine = parseInt(opts.defense);
      if (opts.pressing) body.pressingIntensity = parseInt(opts.pressing);
      if (opts.lineup) body.lineup = opts.lineup.split(",").map(Number);

      const res = await apiRequest("PUT", "/squad", wallet, body);

      if (res.status >= 400) {
        error(res.data.error || "Failed to update squad", res.data);
      }

      output(res.data, (d) =>
        `Squad updated!\n` +
        `  Formation: ${d.team.formation}\n` +
        `  Style: ${d.team.playStyle}\n` +
        `  ATK:${d.team.attackingIntensity} DEF:${d.team.defensiveLine} PRESS:${d.team.pressingIntensity}`
      );
    });
}
