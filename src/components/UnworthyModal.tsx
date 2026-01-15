import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface UnworthyModalProps {
  show: boolean;
  oracleMessage: string;
  onClose: () => void;
}

export const UnworthyModal = ({ show, oracleMessage, onClose }: UnworthyModalProps) => {
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop - clickable to close */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={onClose}
            className="fixed inset-0 z-[20] backdrop-blur-md cursor-pointer"
            style={{
              background: "radial-gradient(ellipse at center, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)",
            }}
          />

          {/* Digital Artifact Modal - Unworthy Version */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
            }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              damping: 20,
              delay: 0.1 
            }}
            className="fixed inset-0 z-[25] flex items-center justify-center pointer-events-none"
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 15px rgba(140, 80, 60, 0.2), 0 0 30px rgba(140, 80, 60, 0.1), inset 0 0 20px rgba(140, 80, 60, 0.05)",
                  "0 0 25px rgba(140, 80, 60, 0.3), 0 0 40px rgba(140, 80, 60, 0.15), inset 0 0 30px rgba(140, 80, 60, 0.08)",
                  "0 0 15px rgba(140, 80, 60, 0.2), 0 0 30px rgba(140, 80, 60, 0.1), inset 0 0 20px rgba(140, 80, 60, 0.05)",
                ]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="pointer-events-auto relative overflow-hidden"
              style={{
                background: "linear-gradient(180deg, hsl(16 20% 10%) 0%, hsl(16 25% 7%) 100%)",
                border: "2px solid hsl(16 35% 30%)",
                maxWidth: "400px",
                width: "90%",
              }}
            >
              {/* Circuit pattern overlay */}
              <div 
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                  backgroundImage: `
                    linear-gradient(90deg, hsl(16 35% 35%) 1px, transparent 1px),
                    linear-gradient(0deg, hsl(16 35% 35%) 1px, transparent 1px)
                  `,
                  backgroundSize: "20px 20px",
                }}
              />

              {/* Scan line effect */}
              <motion.div
                animate={{
                  top: ["-10%", "110%"],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute left-0 right-0 h-8 pointer-events-none"
                style={{
                  background: "linear-gradient(180deg, transparent, rgba(140, 80, 60, 0.08), transparent)",
                }}
              />

              {/* Corner brackets */}
              <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2" style={{ borderColor: "hsl(16 30% 35% / 0.5)" }} />
              <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2" style={{ borderColor: "hsl(16 30% 35% / 0.5)" }} />
              <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2" style={{ borderColor: "hsl(16 30% 35% / 0.5)" }} />
              <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2" style={{ borderColor: "hsl(16 30% 35% / 0.5)" }} />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-20 p-1 transition-colors hover:bg-white/10 rounded"
                style={{ color: "hsl(16 35% 45%)" }}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-6 md:p-8 relative z-10">
                {/* Status indicator */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-center gap-2 mb-4"
                >
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-2 h-2 rounded-full"
                    style={{ background: "hsl(0 45% 45%)" }}
                  />
                  <span className="font-mono text-[10px] tracking-widest" style={{ color: "hsl(0 35% 50%)" }}>
                    VERDICT_REJECTED
                  </span>
                </motion.div>

                {/* Verdict Header - CENTERED */}
                <motion.h2
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="font-pixel mb-2 w-full flex justify-center"
                  style={{
                    color: "hsl(16 40% 45%)",
                    fontSize: "clamp(1.75rem, 6vw, 2.5rem)",
                    textShadow: "0 0 15px rgba(140, 80, 60, 0.4), 0 0 30px rgba(140, 80, 60, 0.2)",
                  }}
                >
                  <span style={{ letterSpacing: "0.15em", marginRight: "-0.15em" }}>UNWORTHY</span>
                </motion.h2>

                {/* Decorative line */}
                <motion.div 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="mx-auto mb-5 h-px"
                  style={{
                    width: "80%",
                    background: "linear-gradient(90deg, transparent, hsl(16 35% 35%), transparent)",
                  }}
                />

                {/* Oracle Message */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mb-6 p-4"
                  style={{
                    background: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid hsl(16 25% 25%)",
                  }}
                >
                  <p
                    className="font-mono text-center"
                    style={{
                      color: "hsl(25 20% 55%)",
                      fontSize: "clamp(0.8rem, 2.5vw, 0.95rem)",
                      lineHeight: 1.6,
                    }}
                  >
                    &gt; {oracleMessage || "Your wish bores me. Begone."}
                  </p>
                </motion.div>

                {/* Rejection info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-center mb-4"
                >
                  <span 
                    className="font-mono text-xs tracking-wider"
                    style={{ color: "hsl(16 25% 35%)" }}
                  >
                    [ ACCESS_DENIED ]
                  </span>
                </motion.div>

                {/* Accept Fate Button */}
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  whileHover={{ 
                    scale: 1.02,
                    boxShadow: "0 0 20px rgba(140, 80, 60, 0.3)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full font-pixel py-3 px-6 flex items-center justify-center gap-2 transition-all duration-200"
                  style={{
                    background: "linear-gradient(180deg, hsl(16 30% 30%) 0%, hsl(16 25% 22%) 100%)",
                    color: "hsl(30 20% 75%)",
                    border: "1px solid hsl(16 40% 38%)",
                    fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)",
                    letterSpacing: "0.1em",
                  }}
                >
                  ACCEPT_FATE
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};