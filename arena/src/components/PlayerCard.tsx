import { motion, AnimatePresence } from "framer-motion";

const rarityConfig: Record<string, { bg: string; border: string; text: string; glow: string; label: string }> = {
  bronze: {
    bg: "bg-gradient-to-br from-amber-900/40 to-amber-800/20",
    border: "border-amber-700/50",
    text: "text-amber-400",
    glow: "",
    label: "Bronze",
  },
  silver: {
    bg: "bg-gradient-to-br from-slate-400/20 to-slate-500/10",
    border: "border-slate-400/40",
    text: "text-slate-300",
    glow: "",
    label: "Silver",
  },
  gold: {
    bg: "bg-gradient-to-br from-yellow-500/30 to-amber-400/15",
    border: "border-yellow-500/50",
    text: "text-yellow-400",
    glow: "shadow-[0_0_20px_hsl(45,90%,55%,0.15)]",
    label: "Gold",
  },
  premium: {
    bg: "bg-gradient-to-br from-violet-500/30 to-fuchsia-500/15",
    border: "border-violet-400/50",
    text: "text-violet-300",
    glow: "shadow-[0_0_25px_hsl(270,70%,60%,0.2)]",
    label: "Premium",
  },
  icon: {
    bg: "bg-gradient-to-br from-cyan-400/30 to-blue-500/15",
    border: "border-cyan-400/50",
    text: "text-cyan-300",
    glow: "shadow-[0_0_30px_hsl(190,80%,55%,0.25)]",
    label: "Icon",
  },
};

const positionColors: Record<string, string> = {
  GK: "text-amber-400",
  DF: "text-sky-400",
  MF: "text-emerald-400",
  FW: "text-rose-400",
};

interface PlayerCardProps {
  card: {
    id: string;
    rarity: string;
    pace_bonus: number;
    shooting_bonus: number;
    passing_bonus: number;
    dribbling_bonus: number;
    defending_bonus: number;
    physicality_bonus: number;
    overall_bonus: number;
    player?: {
      name: string;
      position: string;
      overall_rating: number;
      pace: number | null;
      shooting: number | null;
      passing: number | null;
      dribbling: number | null;
      defending: number | null;
      physicality: number | null;
      team_real: string | null;
    };
    // For cards from pack opening (flat data)
    player_name?: string;
    player_position?: string;
    player_overall?: number;
    player_pace?: number;
    player_shooting?: number;
    player_passing?: number;
    player_dribbling?: number;
    player_defending?: number;
    player_physicality?: number;
  };
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  delay?: number;
  revealed?: boolean;
}

export function PlayerCard({ card, size = "md", onClick, delay = 0, revealed = true }: PlayerCardProps) {
  const rc = rarityConfig[card.rarity] || rarityConfig.bronze;
  const name = card.player?.name || card.player_name || "Unknown";
  const pos = card.player?.position || card.player_position || "?";
  const ovr = (card.player?.overall_rating || card.player_overall || 70) + card.overall_bonus;
  const pace = (card.player?.pace || card.player_pace || 70) + card.pace_bonus;
  const sht = (card.player?.shooting || card.player_shooting || 70) + card.shooting_bonus;
  const pas = (card.player?.passing || card.player_passing || 70) + card.passing_bonus;
  const dri = (card.player?.dribbling || card.player_dribbling || 70) + card.dribbling_bonus;
  const def = (card.player?.defending || card.player_defending || 70) + card.defending_bonus;
  const phy = (card.player?.physicality || card.player_physicality || 70) + card.physicality_bonus;
  const team = card.player?.team_real || "";

  const sizeClasses = {
    sm: "w-28 h-40",
    md: "w-36 h-52",
    lg: "w-44 h-64",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
      animate={revealed ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 1, scale: 1, rotateY: 180 }}
      transition={{ delay, duration: 0.6, type: "spring", stiffness: 200 }}
      onClick={onClick}
      className={`${sizeClasses[size]} ${rc.bg} ${rc.border} ${rc.glow} border-2 rounded-xl p-2.5 flex flex-col justify-between cursor-pointer hover:scale-105 transition-transform relative overflow-hidden`}
      style={{ perspective: "1000px" }}
    >
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-start relative z-10">
        <div>
          <span className={`text-xl font-bold font-mono ${rc.text}`}>{ovr}</span>
          <span className={`block text-[9px] font-bold uppercase tracking-wider ${positionColors[pos] || "text-muted-foreground"}`}>{pos}</span>
        </div>
        <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${rc.bg} ${rc.text} border ${rc.border}`}>
          {rc.label}
        </span>
      </div>

      {/* Name */}
      <div className="relative z-10 text-center my-1">
        <p className="text-xs font-bold text-foreground truncate">{name}</p>
        {team && <p className="text-[9px] text-muted-foreground truncate">{team}</p>}
      </div>

      {/* Stats */}
      <div className="relative z-10 grid grid-cols-3 gap-x-2 gap-y-0.5">
        {[
          { label: "PAC", val: pace },
          { label: "SHO", val: sht },
          { label: "PAS", val: pas },
          { label: "DRI", val: dri },
          { label: "DEF", val: def },
          { label: "PHY", val: phy },
        ].map(s => (
          <div key={s.label} className="text-center">
            <span className={`text-[9px] font-mono font-bold ${s.val >= 85 ? rc.text : "text-foreground/80"}`}>{Math.min(99, s.val)}</span>
            <span className="block text-[7px] text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
