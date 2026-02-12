import { Command } from "commander";
import { getWallet } from "../wallet";
import { apiRequest } from "../api";
import { output, error } from "../output";

export function marketCommand(program: Command) {
  const market = program
    .command("market")
    .description("Player marketplace");

  market
    .command("browse")
    .description("Browse active listings")
    .option("--position <pos>", "Filter by position (ST, CB, etc.)")
    .option("--max-price <n>", "Max price filter")
    .action(async (opts) => {
      let url = "/market?limit=50";
      if (opts.position) url += `&position=${opts.position}`;

      const res = await apiRequest("GET", url);

      if (res.status >= 400) {
        error(res.data.error || "Failed to browse market", res.data);
      }

      output(res.data, (d) => {
        if (d.listings.length === 0) return "No active listings.";

        let out = "MARKETPLACE\n\n";
        out += `${"ID".padEnd(6)}${"Pos".padEnd(5)}${"OVR".padEnd(5)}${"Price".padEnd(8)}${"Player".padEnd(24)}${"Seller"}\n`;
        out += "-".repeat(60) + "\n";

        for (const l of d.listings) {
          if (opts.maxPrice && l.price > parseInt(opts.maxPrice)) continue;
          out += `${String(l.id).padEnd(6)}${l.player.position.padEnd(5)}${String(l.player.overall).padEnd(5)}${String(l.price).padEnd(8)}${l.player.name.padEnd(24)}${l.seller}\n`;
        }
        return out;
      });
    });

  market
    .command("buy")
    .description("Buy a listed player")
    .requiredOption("--listing <id>", "Listing ID")
    .action(async (opts) => {
      const wallet = getWallet();
      const res = await apiRequest("POST", "/market/buy", wallet, {
        listingId: parseInt(opts.listing),
      });

      if (res.status >= 400) {
        error(res.data.error || "Purchase failed", res.data);
      }

      output(res.data, (d) => `Player purchased! (Listing ${d.listingId}, price: ${d.price})`);
    });

  market
    .command("list")
    .description("List a player for sale")
    .requiredOption("--player <shareId>", "Player share ID")
    .requiredOption("--price <amount>", "Listing price")
    .action(async (opts) => {
      const wallet = getWallet();
      const res = await apiRequest("POST", "/market/list", wallet, {
        shareId: parseInt(opts.player),
        price: parseInt(opts.price),
      });

      if (res.status >= 400) {
        error(res.data.error || "Failed to list player", res.data);
      }

      output(res.data, (d) => `Player listed for sale at ${d.price}`);
    });

  market
    .command("offer")
    .description("Make an offer on a player")
    .requiredOption("--player <id>", "Player ID")
    .requiredOption("--price <amount>", "Offer price")
    .action(async (opts) => {
      const wallet = getWallet();
      const res = await apiRequest("POST", "/market/offer", wallet, {
        playerId: parseInt(opts.player),
        price: parseInt(opts.price),
      });

      if (res.status >= 400) {
        error(res.data.error || "Offer failed", res.data);
      }

      output(res.data, (d) => `Offer submitted: ${d.price} for player ${d.playerId} (expires ${d.expiresAt})`);
    });
}
