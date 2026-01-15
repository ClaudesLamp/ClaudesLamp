import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface NarratorTextProps {
  text: string;
  isPulsing?: boolean;
  typewriter?: boolean;
}

export const NarratorText = ({ text, isPulsing = true, typewriter = false }: NarratorTextProps) => {
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (typewriter) {
      setDisplayedText("");
      setIsTyping(true);
      let index = 0;
      
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayedText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 50); // Speed of typing

      return () => clearInterval(interval);
    } else {
      setDisplayedText(text);
    }
  }, [text, typewriter]);

  return (
    <AnimatePresence mode="wait">
      <motion.p
        key={text}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={`font-pixel text-xs md:text-sm text-terracotta text-center leading-relaxed ${
          isPulsing && !isTyping ? "pulse-text" : ""
        }`}
      >
        {typewriter ? displayedText : text}
        {typewriter && isTyping && (
          <span className="animate-pulse ml-0.5">▌</span>
        )}
      </motion.p>
    </AnimatePresence>
  );
};
