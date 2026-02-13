// Tier color system — primary accent, secondary fill, glow shadow
export const TIER_COLORS = {
  bronze: {
    primary: "#CD7F32",
    secondary: "#8B5A2B",
    glow: "rgba(205, 127, 50, 0.3)",
    bg: "from-amber-900/50 to-amber-800/20",
    text: "text-amber-400",
    border: "border-amber-700/50",
  },
  silver: {
    primary: "#C0C0C0",
    secondary: "#808080",
    glow: "rgba(192, 192, 192, 0.3)",
    bg: "from-slate-400/25 to-slate-500/10",
    text: "text-slate-300",
    border: "border-slate-400/40",
  },
  gold: {
    primary: "#FFD700",
    secondary: "#DAA520",
    glow: "rgba(255, 215, 0, 0.35)",
    bg: "from-yellow-500/35 to-amber-400/15",
    text: "text-yellow-400",
    border: "border-yellow-500/50",
  },
  premium: {
    primary: "#A855F7",
    secondary: "#D946EF",
    glow: "rgba(168, 85, 247, 0.35)",
    bg: "from-violet-500/35 to-fuchsia-500/15",
    text: "text-violet-300",
    border: "border-violet-400/50",
  },
  icon: {
    primary: "#22D3EE",
    secondary: "#3B82F6",
    glow: "rgba(34, 211, 238, 0.4)",
    bg: "from-cyan-400/35 to-blue-500/15",
    text: "text-cyan-300",
    border: "border-cyan-400/50",
  },
} as const;

export type Tier = keyof typeof TIER_COLORS;

// Position → silhouette group
export type PositionGroup = "GK" | "DEF" | "MID" | "FWD";

const POS_MAP: Record<string, PositionGroup> = {
  GK: "GK",
  CB: "DEF", LB: "DEF", RB: "DEF", LWB: "DEF", RWB: "DEF", SW: "DEF",
  CDM: "MID", CM: "MID", CAM: "MID", LM: "MID", RM: "MID", AM: "MID",
  CF: "FWD", ST: "FWD", LW: "FWD", RW: "FWD", LF: "FWD", RF: "FWD", SS: "FWD",
};

export function getPositionGroup(pos: string): PositionGroup {
  return POS_MAP[pos?.toUpperCase()] || "MID";
}

// Position badge colors
export const POSITION_COLORS: Record<PositionGroup, string> = {
  GK: "#FBBF24",  // amber
  DEF: "#38BDF8",  // sky
  MID: "#34D399",  // emerald
  FWD: "#FB7185",  // rose
};

// Walkout threshold — cards at or above this OVR get the dramatic entrance
export const WALKOUT_OVR = 86;

// Shield clip-path for FUT card shape (pentagon)
export const SHIELD_CLIP_PATH =
  "polygon(50% 0%, 100% 8%, 100% 80%, 50% 100%, 0% 80%, 0% 8%)";

// Silhouette SVG paths for each position group (simple iconic shapes)
export const SILHOUETTE_PATHS: Record<PositionGroup, string> = {
  GK: "M50 20 C50 20 30 35 30 55 C30 70 38 80 50 85 C62 80 70 70 70 55 C70 35 50 20 50 20Z M35 50 L25 55 L25 65 L35 60Z M65 50 L75 55 L75 65 L65 60Z",
  DEF: "M50 15 C44 15 40 20 40 28 C40 36 50 42 50 42 C50 42 60 36 60 28 C60 20 56 15 50 15Z M35 44 L30 48 L32 85 L42 82 L40 50Z M65 44 L70 48 L68 85 L58 82 L60 50Z M42 48 L42 88 L50 90 L58 88 L58 48 L50 45Z",
  MID: "M50 15 C44 15 40 20 40 28 C40 36 50 42 50 42 C50 42 60 36 60 28 C60 20 56 15 50 15Z M38 46 L36 85 L44 88 L46 52Z M62 46 L64 85 L56 88 L54 52Z M46 48 L44 88 L50 90 L56 88 L54 48 L50 45Z",
  FWD: "M50 15 C44 15 40 20 40 28 C40 36 50 42 50 42 C50 42 60 36 60 28 C60 20 56 15 50 15Z M50 42 L40 50 L35 85 L43 88 L50 58 L57 88 L65 85 L60 50Z M32 55 L28 60 L30 70 L35 65Z M68 55 L72 60 L70 70 L65 65Z",
};

// Confetti color palettes per tier
export const CONFETTI_COLORS: Record<string, string[]> = {
  gold: ["#FFD700", "#DAA520", "#FFA500", "#FFE066"],
  premium: ["#A855F7", "#D946EF", "#C084FC", "#F0ABFC"],
  icon: ["#22D3EE", "#3B82F6", "#FFD700", "#67E8F9"],
};

// How many cards each tier shows in a pack (used for grid sizing)
export const CARDS_PER_TIER: Record<string, number> = {
  bronze: 5,
  silver: 5,
  gold: 5,
  premium: 3,
  icon: 3,
};
