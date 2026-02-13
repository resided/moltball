import { motion, useAnimate } from "framer-motion";
import { useEffect } from "react";
import { TIER_COLORS, type Tier } from "./constants";

interface PackRipAnimationProps {
  tier: string;
  packName: string;
  onComplete: () => void;
}

export function PackRipAnimation({ tier, packName, onComplete }: PackRipAnimationProps) {
  const colors = TIER_COLORS[(tier as Tier)] || TIER_COLORS.bronze;
  const [leftScope, animateLeft] = useAnimate();
  const [rightScope, animateRight] = useAnimate();
  const [burstScope, animateBurst] = useAnimate();
  const [containerScope, animateContainer] = useAnimate();

  useEffect(() => {
    const sequence = async () => {
      // Phase 1: Scale up + arrive (0-200ms)
      await animateContainer(
        containerScope.current,
        { scale: [0.6, 1.2], opacity: [0, 1] },
        { duration: 0.2, ease: "easeOut" }
      );

      // Phase 2: Shake/vibrate (200-500ms)
      for (let i = 0; i < 6; i++) {
        await animateContainer(
          containerScope.current,
          { x: (i % 2 === 0 ? 1 : -1) * (4 + i), rotate: (i % 2 === 0 ? 1 : -1) * 1.5 },
          { duration: 0.05 }
        );
      }
      await animateContainer(containerScope.current, { x: 0, rotate: 0 }, { duration: 0.05 });

      // Phase 3: Split halves apart (500-800ms)
      await Promise.all([
        animateLeft(leftScope.current, { x: -20, rotateY: -20 }, { duration: 0.3, ease: "easeIn" }),
        animateRight(rightScope.current, { x: 20, rotateY: 20 }, { duration: 0.3, ease: "easeIn" }),
      ]);

      // Phase 4: Halves fly offscreen + burst (800-1200ms)
      animateBurst(burstScope.current, { opacity: [0, 1, 0], scale: [0.5, 3] }, { duration: 0.6 });
      await Promise.all([
        animateLeft(leftScope.current, { x: -500, rotateY: -45, opacity: 0 }, { duration: 0.4, ease: "easeIn" }),
        animateRight(rightScope.current, { x: 500, rotateY: 45, opacity: 0 }, { duration: 0.4, ease: "easeIn" }),
      ]);

      // Phase 5: Fade complete (1200-1500ms)
      await animateContainer(containerScope.current, { opacity: 0 }, { duration: 0.3 });

      onComplete();
    };

    sequence();
  }, []);

  const packBg = {
    bronze: "linear-gradient(160deg, #5C3A1E, #8B5A2B, #6B4226)",
    silver: "linear-gradient(160deg, #6B7280, #9CA3AF, #D1D5DB)",
    gold: "linear-gradient(160deg, #B8860B, #FFD700, #DAA520)",
    premium: "linear-gradient(160deg, #7C3AED, #A855F7, #D946EF)",
    icon: "linear-gradient(160deg, #0891B2, #22D3EE, #3B82F6)",
  }[tier] || "linear-gradient(160deg, #5C3A1E, #8B5A2B)";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <motion.div
        ref={containerScope}
        initial={{ scale: 0.6, opacity: 0 }}
        className="relative"
        style={{ perspective: 800, width: 220, height: 320 }}
      >
        {/* Left half */}
        <motion.div
          ref={leftScope}
          className="absolute top-0 left-0 w-1/2 h-full rounded-l-2xl overflow-hidden"
          style={{
            background: packBg,
            transformOrigin: "left center",
            boxShadow: `0 0 30px ${colors.glow}`,
          }}
        >
          <div className="h-full flex items-center justify-end pr-1">
            <span
              className="text-lg font-bold tracking-wide"
              style={{ color: "rgba(255,255,255,0.8)", writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {packName}
            </span>
          </div>
        </motion.div>

        {/* Right half */}
        <motion.div
          ref={rightScope}
          className="absolute top-0 right-0 w-1/2 h-full rounded-r-2xl overflow-hidden"
          style={{
            background: packBg,
            transformOrigin: "right center",
            boxShadow: `0 0 30px ${colors.glow}`,
          }}
        >
          <div className="h-full flex items-center justify-start pl-1">
            <span
              className="text-lg font-bold tracking-wide"
              style={{ color: "rgba(255,255,255,0.8)", writingMode: "vertical-rl" }}
            >
              {packName}
            </span>
          </div>
        </motion.div>

        {/* Center tear line glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full"
          style={{
            background: `linear-gradient(to bottom, transparent, ${colors.primary}, transparent)`,
            boxShadow: `0 0 12px ${colors.glow}`,
          }}
        />
      </motion.div>

      {/* Light burst */}
      <motion.div
        ref={burstScope}
        initial={{ opacity: 0, scale: 0.5 }}
        className="absolute"
        style={{
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${colors.primary}60, ${colors.primary}20, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
