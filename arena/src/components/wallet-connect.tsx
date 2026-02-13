import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";

export function WalletConnect() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!ready) {
          return null;
        }

        if (!connected) {
          return (
            <button
              onClick={openConnectModal}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
            >
              Connect Wallet
            </button>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <button
              onClick={openChainModal}
              className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
            >
              {chain?.name === "Base" ? (
                <span className="text-primary">⬡</span>
              ) : (
                <span className="text-muted-foreground">◇</span>
              )}
              <span className="font-mono text-xs">
                {account.displayBalance ? account.displayBalance : ""}
              </span>
            </button>
            <button
              onClick={openAccountModal}
              className="flex items-center gap-2 px-3 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
            >
              <span className="font-mono text-xs">
                {account.displayName}
                {account.address ? ` (${account.address.slice(2, 7)}...)` : null}
              </span>
            </button>
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
