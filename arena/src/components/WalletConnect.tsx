import { useWallet } from "@/hooks/use-wallet";
import { Wallet, LogOut, Coins } from "lucide-react";
import { useState } from "react";

export function WalletConnect() {
  const { wallet, isConnected, connectWallet, disconnect } = useWallet();
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState("");

  if (isConnected && wallet) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-xs">
          <Coins className="h-3.5 w-3.5 text-primary" />
          <span className="font-mono font-bold text-primary text-glow">{Math.round(wallet.ball_balance).toLocaleString()}</span>
          <span className="text-muted-foreground">$BALL</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass text-xs">
          <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-foreground font-medium truncate max-w-[80px]">{wallet.display_name}</span>
          <button onClick={disconnect} className="ml-1 text-muted-foreground hover:text-destructive transition-colors">
            <LogOut className="h-3 w-3" />
          </button>
        </div>
      </div>
    );
  }

  if (showInput) {
    return (
      <form
        onSubmit={(e) => { e.preventDefault(); connectWallet.mutate(name || undefined); setShowInput(false); }}
        className="flex items-center gap-2"
      >
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Display name..."
          className="h-8 w-32 px-2 rounded-lg glass text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
          autoFocus
        />
        <button
          type="submit"
          disabled={connectWallet.isPending}
          className="h-8 px-3 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all glow-pitch"
        >
          {connectWallet.isPending ? "..." : "Go"}
        </button>
        <button type="button" onClick={() => setShowInput(false)} className="text-xs text-muted-foreground hover:text-foreground">✕</button>
      </form>
    );
  }

  return (
    <button
      onClick={() => setShowInput(true)}
      className="flex items-center gap-2 h-8 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all glow-pitch"
    >
      <Wallet className="h-3.5 w-3.5" />
      Connect Wallet
    </button>
  );
}
