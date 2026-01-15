import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SpeechBubbleProps {
  children: ReactNode;
  variant?: "default" | "gold" | "grey";
  className?: string;
}

export const SpeechBubble = ({ 
  children, 
  variant = "default",
  className 
}: SpeechBubbleProps) => {
  const variantClasses = {
    default: "speech-bubble",
    gold: "speech-bubble speech-bubble-gold",
    grey: "speech-bubble speech-bubble-grey",
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: -20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.8, opacity: 0, y: -20 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={cn(variantClasses[variant], className)}
    >
      {children}
    </motion.div>
  );
};
