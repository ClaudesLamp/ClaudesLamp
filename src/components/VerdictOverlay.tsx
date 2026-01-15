import { motion, AnimatePresence } from "framer-motion";

interface VerdictOverlayProps {
  verdict: "worthy" | "unworthy" | null;
}

export const VerdictOverlay = ({ verdict }: VerdictOverlayProps) => {
  if (!verdict) return null;

  const isWorthy = verdict === "worthy";

  return (
    <AnimatePresence>
      <motion.div
        key={verdict}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="text-center"
          initial={{ scale: 4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <motion.p
            className="font-pixel text-2xl md:text-4xl lg:text-5xl font-bold tracking-wider"
            style={{
              color: isWorthy ? "hsl(43 80% 55%)" : "hsl(16 30% 50%)",
              textShadow: isWorthy 
                ? "0 0 30px hsl(43 80% 55% / 0.8), 0 0 60px hsl(43 80% 55% / 0.4), 0 4px 8px rgba(0,0,0,0.5)"
                : "0 0 20px hsl(16 30% 30% / 0.6), 0 4px 8px rgba(0,0,0,0.5)",
              WebkitTextStroke: "1px rgba(0,0,0,0.3)",
            }}
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            VERDICT:
          </motion.p>
          <motion.p
            className="font-pixel text-4xl md:text-6xl lg:text-7xl font-bold tracking-widest mt-2"
            style={{
              color: isWorthy ? "hsl(45 100% 70%)" : "hsl(16 20% 45%)",
              textShadow: isWorthy 
                ? "0 0 40px hsl(43 80% 55% / 1), 0 0 80px hsl(43 80% 55% / 0.6), 0 6px 12px rgba(0,0,0,0.6)"
                : "0 0 30px hsl(16 30% 30% / 0.5), 0 6px 12px rgba(0,0,0,0.5)",
              WebkitTextStroke: isWorthy ? "1px hsl(43 60% 40%)" : "1px rgba(0,0,0,0.4)",
            }}
            initial={{ scale: 3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {isWorthy ? "WORTHY" : "UNWORTHY"}
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
