import { ethers } from "ethers";
import http from "http";
import https from "https";
import { URL } from "url";
import { signAuthMessage, WalletType } from "./wallet";

const DEFAULT_API_URL = process.env.MOLTBALL_API_URL || "http://localhost:3000";

interface ApiResponse {
  status: number;
  data: any;
  error?: string;
}

export async function apiRequest(
  method: "GET" | "POST" | "PUT",
  path: string,
  wallet?: WalletType,
  body?: any
): Promise<ApiResponse> {
  const url = new URL(path, DEFAULT_API_URL);
  const isHttps = url.protocol === "https:";

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add auth headers if wallet provided
  if (wallet) {
    const action = method.toLowerCase() + path.replace(/[^a-zA-Z]/g, "");
    const { message, signature } = await signAuthMessage(wallet, action);
    headers["x-wallet-address"] = wallet.address;
    headers["x-signature"] = signature;
    headers["x-message"] = message;
  }

  const bodyStr = body ? JSON.stringify(body) : undefined;
  if (bodyStr) {
    headers["Content-Length"] = Buffer.byteLength(bodyStr).toString();
  }

  return new Promise((resolve, reject) => {
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers,
    };

    const transport = isHttps ? https : http;
    const req = transport.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode || 0, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode || 0, data: { raw: data } });
        }
      });
    });

    req.on("error", reject);

    if (bodyStr) {
      req.write(bodyStr);
    }
    req.end();
  });
}
