import { motion, useAnimate } from "framer-motion";
import { useEffect } from "react";
import { TIER_COLORS, type Tier } from "./constants";

interface WalkoutAnimationProps {
  ovr: number;
  tier: string;
  onComplete: () => void;
}

export function WalkoutAnimation({ ovr, tier, onComplete }: WalkoutAnimationProps) {
  const colors = TIER_COLORS[(tier as Tier)] || TIER_COLORS.gold;
  const [flareScope, animateFlare] = useAnimate();
  const [ovrScope, animateOvr] = useAnimate();
  const [barScope, animateBar] = useAnimate();

  useEffect(() => {
    const sequence = async () => {
      // Phase 1: Horizontal light bar sweep (0-500ms)
      await animateBar(
        barScope.current,
        { x: ["-100%", "100%"], opacity: [0, 1, 1, 0] },
        { duration: 0.5, ease: "easeInOut" }
      );

      // Phase 2: Flare lines pulse + OVR flash (500-1200ms)
      animateFlare(
        flareScope.current,
        { opacity: [0, 0.8, 0.3, 0.7, 0] },
        { duration: 0.7, ease: "easeOut" }
      );
      await animateOvr(
        ovrScope.current,
        {
          opacity: [0, 1, 1, 0],
          scale: [0.5, 1.3, 1.2, 1.5],
        },
        { duration: 0.7, ease: "easeOut" }
      );

      // Brief pause for drama
      await new Promise((r) => setTimeout(r, 300));

      onComplete();
    };

    sequence();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Dimmed ambient screen tinted with tier color */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0"
        style={{ background: `${colors.primary}08` }}
      />

      {/* Horizontal light bar */}
      <motion.div
        ref={barScope}
        initial={{ x: "-100%", opacity: 0 }}
        className="absolute left-0 w-full"
        style={{
          height: 3,
          bottom: "40%",
          background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)`,
          boxShadow: `0 0 40px ${colors.glow}, 0 0 80px ${colors.glow}`,
        }}
      />

      {/* Side flare lines */}
      <motion.div
        ref={flareScope}
        initial={{ opacity: 0 }}
        className="absolute inset-0 pointer-events-none"
      >
        {/* Left flare */}
        <div
          className="absolute left-[10%] top-[20%] h-[60%] w-[2px]"
          style={{
            background: `linear-gradient(to bottom, transparent, ${colors.primary}80, transparent)`,
            boxShadow: `0 0 20px ${colors.glow}`,
          }}
        />
        {/* Right flare */}
        <div
          className="absolute right-[10%] top-[20%] h-[60%] w-[2px]"
          style={{
            background: `linear-gradient(to bottom, transparent, ${colors.primary}80, transparent)`,
            boxShadow: `0 0 20px ${colors.glow}`,
          }}
        />
      </motion.div>

      {/* OVR flash */}
      <motion.div
        ref={ovrScope}
        initial={{ opacity: 0, scale: 0.5 }}
        className="absolute"
      >
        <span
          className="font-mono font-bold"
          style={{
            fontSize: 120,
            color: colors.primary,
            textShadow: `0 0 60px ${colors.glow}, 0 0 120px ${colors.glow}`,
            opacity: 0.7,
          }}
        >
          {ovr}
        </span>
      </motion.div>
    </div>
  );
}
