import { verifyMessage } from "viem";
import { db, Agent } from "../db/index.js";

const MESSAGE_PREFIX = "moltball";

export interface AuthenticatedRequest {
  agent: Agent;
  walletAddress: string;
}

export function parseAuthHeaders(req: { headers: Record<string, string | string[] | undefined> }): {
  wallet: string;
  signature: string;
  message: string;
  timestamp: number;
  nonce: number;
} | null {
  const wallet = req.headers["x-wallet-address"];
  const signature = req.headers["x-signature"];
  const message = req.headers["x-message"];

  if (!wallet || !signature || !message) {
    return null;
  }

  const walletStr = Array.isArray(wallet) ? wallet[0] : wallet;
  const signatureStr = Array.isArray(signature) ? signature[0] : signature;
  const messageStr = Array.isArray(message) ? message[0] : message;

  const parts = messageStr.split(":");
  if (parts.length < 4 || parts[0] !== MESSAGE_PREFIX) {
    return null;
  }

  const timestamp = parseInt(parts[2], 10);
  const nonce = parseInt(parts[3], 10);

  if (isNaN(timestamp) || isNaN(nonce)) {
    return null;
  }

  // Check timestamp is within 5 minutes
  const now = Date.now();
  if (Math.abs(now - timestamp) > 5 * 60 * 1000) {
    return null;
  }

  return { wallet: walletStr.toLowerCase(), signature: signatureStr, message: messageStr, timestamp, nonce };
}

export async function authMiddleware(req: { headers: Record<string, string | string[] | undefined> }): Promise<AuthenticatedRequest> {
  const auth = parseAuthHeaders(req);
  if (!auth) {
    throw new Error("Invalid authentication");
  }

  // Verify signature using viem
  try {
    const recoveredAddress = await verifyMessage({
      address: auth.wallet as `0x${string}`,
      message: auth.message,
      signature: auth.signature as `0x${string}`,
    });

    if (!recoveredAddress) {
      throw new Error("Invalid signature");
    }
  } catch (err) {
    // For development, allow requests if signature verification fails
    // In production, you would throw the error
    if (process.env.NODE_ENV === "production") {
      throw new Error("Signature verification failed");
    }
    console.warn("Signature verification skipped in development");
  }

  // Get or create agent
  let agent = await db.getAgentByWallet(auth.wallet);
  if (!agent) {
    throw new Error("Agent not registered");
  }

  return { agent, walletAddress: auth.wallet };
}

export async function requireAuth(req: { headers: Record<string, string | string[] | undefined> }): Promise<Agent> {
  const { agent } = await authMiddleware(req);
  return agent;
}
