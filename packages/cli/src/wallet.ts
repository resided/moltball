import { ethers } from "ethers";
import fs from "fs";
import path from "path";

const WALLET_DIR = path.join(process.env.HOME || "~", ".moltball");
const WALLET_PATH = path.join(WALLET_DIR, "wallet.json");

interface WalletData {
  address: string;
  privateKey: string;
}

// Type alias for wallet types
export type WalletType = ethers.HDNodeWallet | ethers.Wallet;

export function getWalletPath(): string {
  return WALLET_PATH;
}

export function walletExists(): boolean {
  return fs.existsSync(WALLET_PATH);
}

export function createWallet(): WalletType {
  const wallet = ethers.Wallet.createRandom();
  const data: WalletData = {
    address: wallet.address,
    privateKey: wallet.privateKey,
  };

  fs.mkdirSync(WALLET_DIR, { recursive: true });
  fs.writeFileSync(WALLET_PATH, JSON.stringify(data, null, 2), { mode: 0o600 });

  return wallet;
}

export function loadOrCreateWallet(): WalletType {
  if (walletExists()) {
    const data: WalletData = JSON.parse(fs.readFileSync(WALLET_PATH, "utf-8"));
    return new ethers.Wallet(data.privateKey);
  }

  // Auto-create on first use
  return createWallet();
}

export function getWallet(): WalletType {
  return loadOrCreateWallet();
}

/**
 * Sign a message for EIP-191 auth.
 * Format: moltball:<action>:<timestamp>:<nonce>
 */
export async function signAuthMessage(wallet: WalletType, action: string): Promise<{ message: string; signature: string }> {
  const timestamp = Date.now().toString();
  const nonce = Math.random().toString(36).substring(2, 10);
  const message = `moltball:${action}:${timestamp}:${nonce}`;
  const signature = await wallet.signMessage(message);
  return { message, signature };
}
