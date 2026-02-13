import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useRef } from "react";
import { TIER_COLORS, type Tier } from "./constants";
import { Package, Sparkles, Zap, Crown, Gem } from "lucide-react";

const TIER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  bronze: Package,
  silver: Zap,
  gold: Sparkles,
  premium: Crown,
  icon: Gem,
};

interface PackCardProps {
  pack: {
    id: string;
    name: string;
    tier: string;
    description: string;
    price_ball: number;
    cards_count?: number;
  };
  canAfford: boolean;
  isOpening: boolean;
  onOpen: () => void;
  index: number;
}

export function PackCard({ pack, canAfford, isOpening, onOpen, index }: PackCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tier = (pack.tier as Tier) || "bronze";
  const colors = TIER_COLORS[tier] || TIER_COLORS.bronze;
  const Icon = TIER_ICONS[tier] || Package;

  // Cursor tracking for 3D tilt
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [12, -12]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-12, 12]), { stiffness: 300, damping: 30 });

  // Shine position follows cursor
  const shineX = useTransform(mouseX, [0, 1], [0, 100]);
  const shineY = useTransform(mouseY, [0, 1], [0, 100]);

  function handleMouseMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }

  function handleMouseLeave() {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }

  // Tier-specific pack design
  const packBg = {
    bronze: "linear-gradient(160deg, #5C3A1E, #8B5A2B, #6B4226)",
    silver: "linear-gradient(160deg, #6B7280, #9CA3AF, #D1D5DB, #9CA3AF)",
    gold: "linear-gradient(160deg, #B8860B, #FFD700, #DAA520, #FFD700, #B8860B)",
    premium: "linear-gradient(160deg, #7C3AED, #A855F7, #D946EF, #A855F7)",
    icon: "linear-gradient(160deg, #0891B2, #22D3EE, #3B82F6, #22D3EE, #0891B2)",
  }[tier] || "linear-gradient(160deg, #5C3A1E, #8B5A2B)";

  const shimmerClass = tier === "gold" || tier === "premium" || tier === "icon" ? "shimmer-gold" : "";
  const holoClass = tier === "icon" ? "holo-icon" : "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, type: "spring", stiffness: 200, damping: 25 }}
      className="flex-shrink-0 w-[240px] sm:w-auto"
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          perspective: 800,
        }}
        className="relative group"
      >
        {/* 3D edge depth */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `${colors.secondary}`,
            transform: "translateZ(-4px)",
            filter: "blur(1px)",
          }}
        />

        {/* Main pack body */}
        <div
          className={`relative rounded-2xl overflow-hidden ${shimmerClass} ${holoClass}`}
          style={{
            background: packBg,
            boxShadow: `0 8px 40px ${colors.glow}, 0 2px 8px rgba(0,0,0,0.4)`,
            transform: "translateZ(0)",
          }}
        >
          {/* Shine overlay that follows cursor */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: useTransform(
                [shineX, shineY],
                ([x, y]) =>
                  `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.15) 0%, transparent 60%)`
              ),
            }}
          />

          {/* Pack content */}
          <div className="relative z-10 flex flex-col items-center text-center p-6 min-h-[320px]">
            {/* Tier icon */}
            <div
              className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: "rgba(0,0,0,0.25)",
                backdropFilter: "blur(8px)",
                border: `1px solid ${colors.primary}40`,
              }}
            >
              <Icon className="h-8 w-8" style={{ color: colors.primary }} />
            </div>

            {/* Pack name */}
            <h3
              className="font-bold text-lg tracking-wide mb-2"
              style={{ color: "rgba(255,255,255,0.95)" }}
            >
              {pack.name}
            </h3>

            {/* Description */}
            <p className="text-xs leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>
              {pack.description}
            </p>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Price */}
            <div className="flex items-baseline gap-1 mb-4">
              <span
                className="text-2xl font-bold font-mono"
                style={{ color: colors.primary }}
              >
                {pack.price_ball.toLocaleString()}
              </span>
              <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                $BALL
              </span>
            </div>

            {/* Open button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen();
              }}
              disabled={!canAfford || isOpening}
              className="w-full h-11 rounded-xl font-bold text-sm tracking-widest uppercase transition-all active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: canAfford
                  ? `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`
                  : "rgba(255,255,255,0.1)",
                color: canAfford ? "rgba(0,0,0,0.9)" : "rgba(255,255,255,0.4)",
                boxShadow: canAfford ? `0 4px 20px ${colors.glow}` : "none",
              }}
            >
              {isOpening ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                  />
                  Opening...
                </span>
              ) : (
                "OPEN PACK"
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
