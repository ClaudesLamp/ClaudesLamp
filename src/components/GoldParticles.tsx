import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
}

interface GoldParticlesProps {
  trigger: boolean;
  onComplete?: () => void;
}

export const GoldParticles = ({ trigger, onComplete }: GoldParticlesProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger) {
      const newParticles = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100 - 50,
        y: Math.random() * -50 - 20,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [trigger, onComplete]);

  return (
    <AnimatePresence>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="gold-particle absolute pointer-events-none"
          initial={{ 
            x: 0, 
            y: 0, 
            scale: 1, 
            opacity: 1,
            rotate: 0
          }}
          animate={{ 
            x: particle.x, 
            y: particle.y - 80, 
            scale: 0, 
            opacity: 0,
            rotate: Math.random() * 360
          }}
          exit={{ opacity: 0 }}
          transition={{ 
            duration: 0.8, 
            ease: "easeOut" 
          }}
          style={{
            left: "50%",
            top: "50%",
          }}
        />
      ))}
    </AnimatePresence>
  );
};
