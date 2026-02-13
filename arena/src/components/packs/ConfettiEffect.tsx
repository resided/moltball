import confetti from "canvas-confetti";
import { CONFETTI_COLORS } from "./constants";

export function fireConfetti(tier: string) {
  const colors = CONFETTI_COLORS[tier] || CONFETTI_COLORS.gold;

  const config: confetti.Options = {
    particleCount: tier === "icon" ? 200 : tier === "premium" ? 120 : 60,
    spread: tier === "icon" ? 100 : 70,
    origin: { y: 0.5, x: 0.5 },
    colors,
    gravity: 0.8,
    ticks: 200,
    disableForReducedMotion: true,
  };

  // Fire from both sides for icon tier
  if (tier === "icon") {
    confetti({ ...config, angle: 60, origin: { x: 0.2, y: 0.6 } });
    confetti({ ...config, angle: 120, origin: { x: 0.8, y: 0.6 } });
  } else {
    confetti(config);
  }
}
