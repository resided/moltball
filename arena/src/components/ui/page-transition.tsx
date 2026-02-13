import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

const ease = [0.25, 0.4, 0.25, 1] as const;

const pageVariants = {
  initial: {
    opacity: 0,
    y: 8,
    scale: 0.995,
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease,
      when: "beforeChildren",
    },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 1.002,
    transition: {
      duration: 0.25,
      ease,
    },
  },
};

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="enter"
        exit="exit"
        variants={pageVariants}
        className="h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export const staggerContainer = {
  enter: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

export const fadeInUp = {
  initial: { opacity: 0, y: 12 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease },
  },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  enter: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease },
  },
};

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  enter: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.35, ease },
  },
};

export function AnimatedList({
  children,
  className,
  delay = 0.06,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      variants={{
        enter: {
          transition: {
            staggerChildren: delay,
          },
        },
      }}
      initial="initial"
      animate="enter"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export const listItem = {
  initial: { opacity: 0, y: 10 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease },
  },
};
