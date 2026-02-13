import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { FUTCard, type FUTCardData } from "./FUTCard";
import { WalkoutAnimation } from "./WalkoutAnimation";
import { fireConfetti } from "./ConfettiEffect";
import { WALKOUT_OVR } from "./constants";

interface CardRevealSequenceProps {
  cards: FUTCardData[];
  onComplete: () => void;
}

function getEffectiveOvr(card: FUTCardData): number {
  return (card.player?.overall_rating || card.player_overall || 70) + card.overall_bonus;
}

export function CardRevealSequence({ cards, onComplete }: CardRevealSequenceProps) {
  // Sort ascending by OVR so best card is last (most dramatic)
  const sorted = [...cards].sort((a, b) => getEffectiveOvr(a) - getEffectiveOvr(b));
  const bestOvr = sorted.length > 0 ? getEffectiveOvr(sorted[sorted.length - 1]) : 0;

  // Smart pacing: if best card < 80, speed things up
  const fastMode = bestOvr < 80;
  const revealDelay = fastMode ? 400 : 700;

  const [revealedIndex, setRevealedIndex] = useState(-1);
  const [showWalkout, setShowWalkout] = useState(false);
  const [walkoutCard, setWalkoutCard] = useState<FUTCardData | null>(null);
  const [allRevealed, setAllRevealed] = useState(false);

  const revealNext = useCallback(() => {
    setRevealedIndex((prev) => {
      const next = prev + 1;
      if (next >= sorted.length) {
        setAllRevealed(true);
        return prev;
      }

      const card = sorted[next];
      const ovr = getEffectiveOvr(card);
      const tier = card.rarity;

      // Check for walkout (86+ OVR, not in fast mode)
      if (ovr >= WALKOUT_OVR && !fastMode) {
        setWalkoutCard(card);
        setShowWalkout(true);
        return prev; // Don't advance yet — walkout will call revealAfterWalkout
      }

      // Fire confetti for premium/icon tier cards
      if (tier === "premium" || tier === "icon") {
        setTimeout(() => fireConfetti(tier), 300);
      }

      return next;
    });
  }, [sorted, fastMode]);

  // Handle walkout completion — reveal the card
  const revealAfterWalkout = useCallback(() => {
    setShowWalkout(false);
    setWalkoutCard(null);
    setRevealedIndex((prev) => {
      const next = prev + 1;
      const card = sorted[next];
      if (card) {
        const tier = card.rarity;
        // Always fire confetti after walkout
        setTimeout(() => fireConfetti(tier === "icon" ? "icon" : tier === "premium" ? "premium" : "gold"), 200);
      }
      if (next >= sorted.length - 1) {
        setTimeout(() => setAllRevealed(true), 500);
      }
      return next;
    });
  }, [sorted]);

  // Auto-advance through cards
  useEffect(() => {
    if (revealedIndex < 0) {
      // Start the sequence
      const timer = setTimeout(revealNext, 300);
      return () => clearTimeout(timer);
    }

    if (revealedIndex < sorted.length - 1 && !showWalkout) {
      const timer = setTimeout(revealNext, revealDelay);
      return () => clearTimeout(timer);
    }
  }, [revealedIndex, showWalkout, revealNext, revealDelay, sorted.length]);

  // Notify parent when all done
  useEffect(() => {
    if (allRevealed) {
      const timer = setTimeout(onComplete, 600);
      return () => clearTimeout(timer);
    }
  }, [allRevealed, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none">
      {/* Walkout overlay */}
      <AnimatePresence>
        {showWalkout && walkoutCard && (
          <WalkoutAnimation
            ovr={getEffectiveOvr(walkoutCard)}
            tier={walkoutCard.rarity}
            onComplete={revealAfterWalkout}
          />
        )}
      </AnimatePresence>

      {/* Active card being revealed (center stage) */}
      <AnimatePresence mode="wait">
        {revealedIndex >= 0 && revealedIndex < sorted.length && !showWalkout && (
          <motion.div
            key={sorted[revealedIndex].id}
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
            className="mb-8"
          >
            <FUTCard card={sorted[revealedIndex]} size="lg" revealed delay={0} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Revealed cards row (bottom) */}
      <motion.div
        className="flex gap-2 flex-wrap justify-center pointer-events-auto max-w-[90vw]"
        initial={{ opacity: 0 }}
        animate={{ opacity: revealedIndex >= 0 ? 1 : 0 }}
      >
        {sorted.slice(0, revealedIndex + 1).map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: i === revealedIndex ? 0.3 : 0.7 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
          >
            <FUTCard card={card} size="sm" revealed />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
