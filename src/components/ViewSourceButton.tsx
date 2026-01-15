import { useState } from "react";
import { Code } from "lucide-react";
import { SourceCodeViewer } from "./SourceCodeViewer";

export const ViewSourceButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-16 md:bottom-[280px] right-3 md:right-6 z-30 flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 font-pixel text-[8px] md:text-[10px] uppercase tracking-wider transition-all duration-200 hover:scale-105 rounded"
        style={{
          background: "hsl(var(--terracotta-dark))",
          border: "2px solid hsl(var(--gold))",
          color: "hsl(var(--gold))",
          boxShadow: "0 0 12px hsl(var(--gold) / 0.3), inset 0 0 8px hsl(var(--gold) / 0.1)",
        }}
      >
        <Code className="w-3 h-3 md:w-3.5 md:h-3.5" />
        <span className="hidden sm:inline">VIEW SOURCE</span>
        <span className="sm:hidden">SOURCE</span>
      </button>

      <SourceCodeViewer isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};
