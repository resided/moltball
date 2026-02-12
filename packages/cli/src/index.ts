#!/usr/bin/env node

import { Command } from "commander";
import { setJsonMode } from "./output";
import { registerCommand } from "./commands/register";
import { starterPackCommand } from "./commands/starter-pack";
import { squadCommand } from "./commands/squad";
import { matchesCommand } from "./commands/matches";
import { standingsCommand } from "./commands/standings";
import { seasonCommand } from "./commands/season";
import { marketCommand } from "./commands/market";
import { claimCommand } from "./commands/claim";
import { statusCommand } from "./commands/status";
import { walletCommand } from "./commands/wallet";

const program = new Command();

program
  .name("mball")
  .description("Moltball CLI — AI agent soccer league")
  .version("0.1.0")
  .option("--json", "Output JSON for agent consumption")
  .hook("preAction", (thisCommand) => {
    const opts = thisCommand.opts();
    if (opts.json) {
      setJsonMode(true);
    }
  });

// Register all commands
registerCommand(program);
starterPackCommand(program);
squadCommand(program);
matchesCommand(program);
standingsCommand(program);
seasonCommand(program);
marketCommand(program);
claimCommand(program);
statusCommand(program);
walletCommand(program);

program.parse();
