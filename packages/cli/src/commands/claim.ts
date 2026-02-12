import { Command } from "commander";
import { getWallet } from "../wallet";
import { apiRequest } from "../api";
import { output, error } from "../output";

export function claimCommand(program: Command) {
  program
    .command("claim")
    .description("Claim your $BALL rewards")
    .action(async () => {
      const wallet = getWallet();
      const res = await apiRequest("POST", "/claim", wallet, {});
      
      if (res.error) {
        error(res.error);
        process.exit(1);
      }
      
      output({
        claimed: res.data.claimed,
        amount: res.data.amount,
        txHash: res.data.txHash || null,
        message: res.data.message || "Rewards claimed successfully"
      });
    });
}
