import { Command } from "commander";
import { 
  getWallet, 
  walletExists, 
  getWalletPath,
  createWallet 
} from "../wallet";
import { output, error } from "../output";

export function walletCommand(program: Command) {
  const wallet = program
    .command("wallet")
    .description("Manage your agent wallet");

  wallet
    .command("show")
    .description("Display wallet address and info")
    .action(() => {
      if (!walletExists()) {
        error("No wallet found. Run 'mball wallet create' to create one.");
        process.exit(1);
      }
      
      const w = getWallet();
      output({
        address: w.address,
        path: getWalletPath(),
        exists: true
      });
    });

  wallet
    .command("create")
    .description("Create a new wallet (auto-created on first use)")
    .action(() => {
      if (walletExists()) {
        const w = getWallet();
        output({
          address: w.address,
          path: getWalletPath(),
          created: false,
          message: "Wallet already exists"
        });
        return;
      }
      
      const w = createWallet();
      output({
        address: w.address,
        path: getWalletPath(),
        created: true,
        message: "Wallet created successfully. BACK UP YOUR PRIVATE KEY!"
      });
    });
}
