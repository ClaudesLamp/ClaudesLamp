import { useState, useEffect } from 'react';

const PLACEHOLDER_TEXTS = [
  "I wish my bags were...",
  "I wish to short the...",
  "I wish I hadn't sold...",
  "I wish for a green...",
  "I wish to ape into...",
  "I wish the dev would...",
  "I wish my wallet wasn't...",
  "I wish for 100x on...",
  "I wish for a decentralized...",
  "I wish to eat a...",
  "I wish for a cybernetic...",
  "I wish to summon a...",
  "I wish for a pixelated...",
  "I wish for a sentient...",
  "I wish to trade my kidney...",
  "I wish for a golden...",
  "I wish to escape the...",
  "I wish to delete my...",
  "I wish to upload my...",
  "I wish the simulation...",
  "I wish to hack the...",
  "I wish for forbidden...",
  "I wish the Oracle...",
  "I wish to trade my soul...",
  "I wish my wife didn't...",
  "I wish to destroy the...",
  "I wish for a refund on...",
  "I wish I was a...",
  "I wish to fight a...",
  "I wish for infinite...",
];

export const useCyclingPlaceholder = (intervalMs: number = 500) => {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * PLACEHOLDER_TEXTS.length));
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const cycleInterval = setInterval(() => {
      // Fade out
      setIsVisible(false);
      
      // After fade out, change text and fade in
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % PLACEHOLDER_TEXTS.length);
        setIsVisible(true);
      }, 250); // Smooth crossfade
    }, intervalMs);

    return () => clearInterval(cycleInterval);
  }, [intervalMs]);

  return {
    text: PLACEHOLDER_TEXTS[index],
    isVisible,
  };
};
