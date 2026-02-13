import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { X } from "lucide-react";
import { PackRipAnimation } from "./PackRipAnimation";
import { CardRevealSequence } from "./CardRevealSequence";
import { FUTCard, type FUTCardData } from "./FUTCard";

type Phase = "TEARING" | "REVEALING" | "COMPLETE";

interface PackOpeningSequenceProps {
  cards: FUTCardData[];
  tier: string;
  packName: string;
  onClose: () => void;
}

export function PackOpeningSequence({ cards, tier, packName, onClose }: PackOpeningSequenceProps) {
  const [phase, setPhase] = useState<Phase>("TEARING");

  // Sort cards ascending by effective OVR for display in COMPLETE phase
  const sorted = [...cards].sort(
    (a, b) =>
      (a.player?.overall_rating || a.player_overall || 70) + a.overall_bonus -
      ((b.player?.overall_rating || b.player_overall || 70) + b.overall_bonus)
  );

  const handleRipComplete = useCallback(() => {
    setPhase("REVEALING");
  }, []);

  const handleRevealComplete = useCallback(() => {
    setPhase("COMPLETE");
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl"
      onClick={phase === "COMPLETE" ? onClose : undefined}
    >
      {/* Close button — always visible */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-4 right-4 z-[60] p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors pointer-events-auto"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Phase: TEARING */}
      <AnimatePresence>
        {phase === "TEARING" && (
          <PackRipAnimation
            tier={tier}
            packName={packName}
            onComplete={handleRipComplete}
          />
        )}
      </AnimatePresence>

      {/* Phase: REVEALING */}
      <AnimatePresence>
        {phase === "REVEALING" && (
          <CardRevealSequence
            cards={cards}
            onComplete={handleRevealComplete}
          />
        )}
      </AnimatePresence>

      {/* Phase: COMPLETE — all cards visible */}
      <AnimatePresence>
        {phase === "COMPLETE" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6"
          >
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-bold text-foreground mb-8"
            >
              Pack Opened!
            </motion.h2>

            <div className="flex flex-wrap justify-center gap-3 max-w-[90vw]">
              {sorted.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ scale: 0.8, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, type: "spring", stiffness: 250 }}
                >
                  <FUTCard card={card} size="md" revealed />
                </motion.div>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-muted-foreground mt-8 pointer-events-auto cursor-pointer"
            >
              Tap anywhere to close
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
