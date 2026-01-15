import { useState, useRef, useEffect } from 'react';
import { useCyclingPlaceholder } from '@/hooks/useCyclingPlaceholder';

interface CyclingPlaceholderInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  maxLength: number;
  isValid: boolean;
  className?: string;
  autoFocus?: boolean;
}

export const CyclingPlaceholderInput = ({
  value,
  onChange,
  maxLength,
  isValid,
  className = '',
  autoFocus = false,
}: CyclingPlaceholderInputProps) => {
  const { text: placeholderText, isVisible } = useCyclingPlaceholder(500);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <div className="relative">
      {/* Actual input - transparent placeholder */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={onChange}
        placeholder=""
        className={`${className} ${value.trim().length > 0 && !isValid ? 'border-red-500/50' : ''}`}
        maxLength={maxLength}
      />
      
      {/* Animated placeholder overlay */}
      {!value && (
        <div
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none font-pixel text-xs md:text-sm text-terracotta/40 transition-opacity duration-300"
          style={{ opacity: isVisible ? 1 : 0 }}
        >
          {placeholderText}
        </div>
      )}
    </div>
  );
};
