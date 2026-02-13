import { motion } from "framer-motion";
import {
  TIER_COLORS,
  SHIELD_CLIP_PATH,
  SILHOUETTE_PATHS,
  POSITION_COLORS,
  getPositionGroup,
  type Tier,
  type PositionGroup,
} from "./constants";

export interface FUTCardData {
  id: string;
  rarity: string;
  pace_bonus: number;
  shooting_bonus: number;
  passing_bonus: number;
  dribbling_bonus: number;
  defending_bonus: number;
  physicality_bonus: number;
  overall_bonus: number;
  player_name?: string;
  player_position?: string;
  player_overall?: number;
  player_team?: string;
  player_pace?: number;
  player_shooting?: number;
  player_passing?: number;
  player_dribbling?: number;
  player_defending?: number;
  player_physicality?: number;
  // Nested player shape (from collection queries)
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
}

interface FUTCardProps {
  card: FUTCardData;
  size?: "sm" | "md" | "lg";
  revealed?: boolean;
  delay?: number;
  onClick?: () => void;
}

const SIZES = {
  sm: { w: 112, h: 160, ovr: 24, name: 9, stat: 8, statLabel: 6 },
  md: { w: 144, h: 208, ovr: 32, name: 11, stat: 10, statLabel: 7 },
  lg: { w: 192, h: 276, ovr: 40, name: 13, stat: 12, statLabel: 8 },
};

export function FUTCard({ card, size = "md", revealed = true, delay = 0, onClick }: FUTCardProps) {
  const tier = (card.rarity as Tier) || "bronze";
  const colors = TIER_COLORS[tier] || TIER_COLORS.bronze;
  const s = SIZES[size];

  const name = card.player?.name || card.player_name || "Unknown";
  const pos = card.player?.position || card.player_position || "CM";
  const team = card.player?.team_real || card.player_team || "";
  const posGroup = getPositionGroup(pos);
  const posColor = POSITION_COLORS[posGroup];

  const ovr = Math.min(99, (card.player?.overall_rating || card.player_overall || 70) + card.overall_bonus);
  const stats = [
    { label: "PAC", val: Math.min(99, (card.player?.pace || card.player_pace || 70) + card.pace_bonus) },
    { label: "SHO", val: Math.min(99, (card.player?.shooting || card.player_shooting || 70) + card.shooting_bonus) },
    { label: "PAS", val: Math.min(99, (card.player?.passing || card.player_passing || 70) + card.passing_bonus) },
    { label: "DRI", val: Math.min(99, (card.player?.dribbling || card.player_dribbling || 70) + card.dribbling_bonus) },
    { label: "DEF", val: Math.min(99, (card.player?.defending || card.player_defending || 70) + card.defending_bonus) },
    { label: "PHY", val: Math.min(99, (card.player?.physicality || card.player_physicality || 70) + card.physicality_bonus) },
  ];

  // Effect classes by tier
  const shimmerClass = tier === "gold" || tier === "premium" || tier === "icon" ? "shimmer-gold" : "";
  const holoClass = tier === "icon" ? "holo-icon" : "";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateY: 180 }}
      animate={
        revealed
          ? { opacity: 1, scale: 1, rotateY: 0 }
          : { opacity: 1, scale: 1, rotateY: 180 }
      }
      transition={{ delay, duration: 0.6, type: "spring", stiffness: 200, damping: 20 }}
      onClick={onClick}
      className="cursor-pointer"
      style={{
        width: s.w,
        height: s.h,
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Card face */}
      <div
        className={`relative w-full h-full clip-shield ${shimmerClass} ${holoClass}`}
        style={{
          background: `linear-gradient(160deg, ${colors.primary}22, ${colors.secondary}44, ${colors.primary}18)`,
          boxShadow: `0 0 24px ${colors.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
          backfaceVisibility: "hidden",
        }}
      >
        {/* Inner border */}
        <div
          className="absolute clip-shield"
          style={{
            inset: 2,
            border: `1px solid ${colors.primary}40`,
            pointerEvents: "none",
          }}
        />

        {/* Silhouette background */}
        <svg
          viewBox="0 0 100 100"
          className="absolute"
          style={{
            width: "70%",
            height: "70%",
            top: "15%",
            left: "15%",
            opacity: 0.08,
          }}
        >
          <path d={SILHOUETTE_PATHS[posGroup]} fill={colors.primary} />
        </svg>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full px-2 py-2">
          {/* Top — OVR + Position */}
          <div className="flex flex-col items-start" style={{ marginTop: s.h * 0.06 }}>
            <span
              className="font-bold font-mono leading-none"
              style={{ fontSize: s.ovr, color: colors.primary }}
            >
              {ovr}
            </span>
            <span
              className="font-bold uppercase tracking-wider leading-none mt-0.5"
              style={{ fontSize: s.statLabel + 2, color: posColor }}
            >
              {pos}
            </span>
            {team && (
              <span
                className="truncate leading-none mt-1 font-medium"
                style={{ fontSize: s.statLabel + 1, color: "rgba(255,255,255,0.75)", maxWidth: s.w * 0.5 }}
              >
                {team}
              </span>
            )}
          </div>

          {/* Middle — Name */}
          <div
            className="text-center mt-auto mb-1"
            style={{ marginTop: s.h * 0.18 }}
          >
            <p
              className="font-bold text-white truncate uppercase tracking-wide"
              style={{ fontSize: s.name }}
            >
              {name.length > 14 ? name.split(" ").pop() : name}
            </p>
            {/* Divider */}
            <div
              className="mx-auto mt-1 rounded-full"
              style={{
                width: "60%",
                height: 1,
                background: `linear-gradient(90deg, transparent, ${colors.primary}80, transparent)`,
              }}
            />
          </div>

          {/* Bottom — 2x3 stat grid */}
          <div
            className="grid grid-cols-3 gap-x-1 mt-auto"
            style={{ paddingBottom: s.h * 0.08 }}
          >
            {stats.map((st) => (
              <div key={st.label} className="text-center">
                <span
                  className="font-mono font-bold block leading-tight"
                  style={{
                    fontSize: s.stat,
                    color: st.val >= 85 ? colors.primary : "rgba(255,255,255,0.85)",
                  }}
                >
                  {st.val}
                </span>
                <span
                  className="block uppercase tracking-wider"
                  style={{
                    fontSize: s.statLabel,
                    color: "rgba(255,255,255,0.4)",
                  }}
                >
                  {st.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
