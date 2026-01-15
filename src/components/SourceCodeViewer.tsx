import { useState } from "react";
import { useTreasuryStats, formatNumber } from "@/hooks/useTreasuryStats";
import { motion, AnimatePresence } from "framer-motion";
import { X, Copy, Check } from "lucide-react";

const truncateAddress = (addr: string, head = 4, tail = 4) => {
  if (!addr) return "";
  if (addr.length <= head + tail) return addr;
  return `${addr.slice(0, head)}...${addr.slice(-tail)}`;
};

interface SourceCodeViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SourceCodeViewer = ({ isOpen, onClose }: SourceCodeViewerProps) => {
  const [copied, setCopied] = useState(false);
  const stats = useTreasuryStats();

  const hoardAddress = stats.treasuryWallet;
  const tokenMint = stats.tokenMint;

  const hoardAddressForCode = hoardAddress || "AWAITING LIVE DATA";
  const tokenMintForCode = tokenMint || "AWAITING LIVE DATA";

  const hasLiveAudit = Boolean(stats.isLive && hoardAddress && tokenMint);

  const handleCopy = async () => {
    const codeText = `// CLAUDE'S LAMP PROTOCOL ($RUB)
// v1.0 (MAINNET)
// AUTHORITY: CLAUDE 3 OPUS (Autonomous)
// ENVIRONMENT: SUPABASE EDGE FUNCTION (DENO)

// [CONFIGURATION: LIVE]
const HOARD_ADDRESS = "${hoardAddressForCode}";
const RUB_MINT_ADDRESS = "${tokenMintForCode}";

// [SECURITY AUDIT: IMPORT RESTRICTIONS]
import { transfer } from "npm:@solana/spl-token"; // ✅ ALLOWED: Payouts
// import { swap } from "npm:@raydium-io"; // ❌ BLOCKED: No Swapping
// import { sell } from "npm:@jup-ag/core"; // ❌ BLOCKED: No Selling

export async function judgeWish(wish, userWallet) {

  // 1. CHECK HISTORY (Anti-Copycat)
  const isDuplicate = await db.checkHistory(wish);
  if (isDuplicate) return { verdict: "UNWORTHY" };

  // 2. CONSULT THE ORACLE
  const { score } = await claude.analyze(wish);

  // 3. DETERMINE VERDICT & TIER
  if (score >= 30) {
    let amount = 0;
    if (score >= 99) amount = random(4000000, 6000000);      // MYTHIC (1%)
    else if (score >= 90) amount = random(800000, 1200000);  // LEGENDARY (9%)
    else if (score >= 70) amount = random(200000, 300000);   // RARE (20%)
    else if (score >= 30) amount = random(40000, 60000);     // COMMON (35%)
    else return { verdict: "UNWORTHY" };                     // UNWORTHY (35%) - NOT PAID

    // ⚠️ SECURITY: WALLET CAN ONLY TRANSFER. SELLING IS IMPOSSIBLE.
    const tx = await transfer({
      from: TREASURY_HOARD,
      to: userWallet,
      amount: amount
    });

    return { verdict: "WORTHY", tier, tx };
  }

  // UNWORTHY (35%) - Score < 30
  return { verdict: "UNWORTHY", tier: "UNWORTHY" };
}`;
    await navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Custom code renderer with JSX structure
  const renderCode = () => {
    let line = 0;
    const L = () => {
      line++;
      return <span className="text-cream/30 select-none w-8 text-right mr-4 inline-block">{line}</span>;
    };

    return (
      <div className="space-y-0 leading-relaxed">
        {/* HEADER */}
        <div className="text-emerald-400/80">
          <L />{"// CLAUDE'S LAMP PROTOCOL ($RUB)"}
        </div>
        <div className="text-emerald-400/80">
          <L />{"// v1.0 (MAINNET) - AUTHORITY: AUTONOMOUS"}
        </div>
        
        {/* Empty line */}
        <div><L /></div>

        {/* CONFIGURATION */}
        <div className="text-amber-400/90 font-semibold">
          <L />{"// [CONFIGURATION: PROTOCOL CONSTANTS]"}
        </div>
        <div>
          <L />
          <span className="text-purple-400">const</span>
          <span className="text-cream/90"> HOARD_ADDRESS = </span>
          <span className="text-amber-300" title={hoardAddressForCode}>{`"${hoardAddressForCode}"`}</span>
          <span className="text-cream/90">;</span>
        </div>
        <div>
          <L />
          <span className="text-purple-400">const</span>
          <span className="text-cream/90"> RUB_MINT_ADDRESS = </span>
          <span className="text-amber-300" title={tokenMintForCode}>{`"${tokenMintForCode}"`}</span>
          <span className="text-cream/90">;</span>
        </div>
        <div>
          <L />
          <span className="text-purple-400">const</span>
          <span className="text-cream/90"> AI_MODEL = </span>
          <span className="text-amber-300">"claude-3-opus-20240229"</span>
          <span className="text-cream/90">;</span>
        </div>
        <div>
          <L />
          <span className="text-purple-400">const</span>
          <span className="text-cream/90"> SECURITY_LEVEL = </span>
          <span className="text-amber-300">"MAXIMUM"</span>
          <span className="text-cream/90">;</span>
        </div>

        {/* Empty line */}
        <div><L /></div>

        {/* SECURITY AUDIT SECTION */}
        <div className="text-amber-400/90 font-semibold">
          <L />{"// [SECURITY AUDIT: MODULE IMPORTS]"}
        </div>

        {/* ALLOWED import - glowing */}
        <div className="relative group">
          <L />
          <span className="text-purple-400">import</span>
          <span className="text-cream/90">{" { "}</span>
          <span className="text-blue-400">transfer</span>
          <span className="text-cream/90">{" } "}</span>
          <span className="text-purple-400">from</span>
          <span className="text-amber-300">{' "npm:@solana/spl-token"'}</span>
          <span className="text-cream/90">;</span>
          <span className="text-green-400 ml-2 drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]">{"// ✅ ALLOWED"}</span>
        </div>

        {/* Empty line */}
        <div><L /></div>

        {/* BLOCKED import 1 - crossed out */}
        <div className="opacity-40 line-through decoration-red-500/80 decoration-2">
          <span className="text-cream/30 select-none w-8 text-right mr-4 inline-block no-underline">{line + 1}</span>
          <span className="text-cream/50">{"// "}</span>
          <span className="text-purple-400/60">import</span>
          <span className="text-cream/50">{" { "}</span>
          <span className="text-blue-400/60">swap</span>
          <span className="text-cream/50">{" } "}</span>
          <span className="text-purple-400/60">from</span>
          <span className="text-amber-300/60">{' "npm:@raydium-io"'}</span>
          <span className="text-cream/50">;</span>
          <span className="text-red-500/80 ml-2 no-underline">{"// ❌ BLOCKED (Unsafe)"}</span>
        </div>
        {(() => { line++; return null; })()}

        {/* BLOCKED import 2 - crossed out */}
        <div className="opacity-40 line-through decoration-red-500/80 decoration-2">
          <span className="text-cream/30 select-none w-8 text-right mr-4 inline-block no-underline">{line + 1}</span>
          <span className="text-cream/50">{"// "}</span>
          <span className="text-purple-400/60">import</span>
          <span className="text-cream/50">{" { "}</span>
          <span className="text-blue-400/60">sell</span>
          <span className="text-cream/50">{" } "}</span>
          <span className="text-purple-400/60">from</span>
          <span className="text-amber-300/60">{' "npm:@jup-ag/core"'}</span>
          <span className="text-cream/50">;</span>
          <span className="text-red-500/80 ml-2 no-underline">{"// ❌ BLOCKED (Unsafe)"}</span>
        </div>
        {(() => { line++; return null; })()}

        {/* Empty line */}
        <div><L /></div>

        {/* THE FUNCTION HEADER */}
        <div>
          <L />
          <span className="text-purple-400">export async function</span>
          <span className="text-blue-400"> judgeWish</span>
          <span className="text-cream/90">(</span>
          <span className="text-orange-300">wish</span>
          <span className="text-cream/90">, </span>
          <span className="text-orange-300">userWallet</span>
          <span className="text-cream/90">) {"{"}</span>
        </div>

        {/* Empty line */}
        <div><L /></div>

        {/* INITIALIZATION LOGS */}
        <div>
          <L />
          <span className="text-cream/90">{"  "}</span>
          <span className="text-cyan-400">console</span>
          <span className="text-cream/90">.</span>
          <span className="text-blue-400">log</span>
          <span className="text-cream/90">(</span>
          <span className="text-amber-300">"[ORACLE] Initializing Judgment..."</span>
          <span className="text-cream/90">);</span>
        </div>

        {/* Empty line */}
        <div><L /></div>

        {/* STEP 1: HIGHLANDER RULE */}
        <div className="text-cyan-400/80">
          <L />{"  // 1. HIGHLANDER PROTOCOL (Anti-Copycat)"}
        </div>
        <div>
          <L />
          <span className="text-cream/90">{"  "}</span>
          <span className="text-purple-400">const</span>
          <span className="text-cream/90"> isDuplicate = </span>
          <span className="text-purple-400">await</span>
          <span className="text-cyan-400"> db</span>
          <span className="text-cream/90">.</span>
          <span className="text-blue-400">checkHistory</span>
          <span className="text-cream/90">(wish);</span>
        </div>
        <div>
          <L />
          <span className="text-cream/90">{"  "}</span>
          <span className="text-purple-400">if</span>
          <span className="text-cream/90"> (isDuplicate) </span>
          <span className="text-purple-400">throw</span>
          <span className="text-cream/90"> </span>
          <span className="text-red-400">"ERR_ORIGINALITY_FAILED"</span>
          <span className="text-cream/90">;</span>
        </div>

        {/* Empty line */}
        <div><L /></div>

        {/* STEP 2: AI BRAIN */}
        <div className="text-cyan-400/80">
          <L />{"  // 2. NEURAL ANALYSIS (Claude 3 Opus)"}
        </div>
        <div>
          <L />
          <span className="text-cream/90">{"  "}</span>
          <span className="text-purple-400">const</span>
          <span className="text-cream/90">{" { "}</span>
          <span className="text-orange-300">score</span>
          <span className="text-cream/90">{" } = "}</span>
          <span className="text-purple-400">await</span>
          <span className="text-cyan-400"> claude</span>
          <span className="text-cream/90">.</span>
          <span className="text-blue-400">analyze</span>
          <span className="text-cream/90">(wish);</span>
        </div>

        {/* Empty line */}
        <div><L /></div>

        {/* STEP 3: DETERMINE VERDICT & TIER */}
        <div className="text-cyan-400/80">
          <L />{"  // 3. DETERMINE VERDICT & TIER"}
        </div>
        <div>
          <L />
          <span className="text-cream/90">{"  "}</span>
          <span className="text-purple-400">if</span>
          <span className="text-cream/90"> (score {">="} </span>
          <span className="text-orange-300">30</span>
          <span className="text-cream/90">) {"{"}</span>
        </div>

        {/* TIER COMMENT */}
        <div>
          <L />
          <span className="text-cream/90">{"    "}</span>
          <span className="text-purple-400">let</span>
          <span className="text-cream/90"> amount = </span>
          <span className="text-orange-300">0</span>
          <span className="text-cream/90">;</span>
        </div>

        {/* Empty line */}
        <div><L /></div>

        {/* MYTHIC - Gold glow effect */}
        <div className="relative">
          <L />
          <span className="text-cream/90">{"    "}</span>
          <span className="text-purple-400">if</span>
          <span className="text-cream/90"> (score {">="} </span>
          <span className="text-orange-300">99</span>
          <span className="text-cream/90">) amount = </span>
          <span className="text-blue-400">random</span>
          <span className="text-cream/90">(</span>
          <span className="text-gold font-bold drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]">4000000</span>
          <span className="text-cream/90">, </span>
          <span className="text-gold font-bold drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]">6000000</span>
          <span className="text-cream/90">);</span>
          <span className="text-gold ml-2 font-bold drop-shadow-[0_0_10px_rgba(212,175,55,0.6)]">{"// MYTHIC (<1%)"}</span>
        </div>

        {/* LEGENDARY - Purple accent */}
        <div>
          <L />
          <span className="text-cream/90">{"    "}</span>
          <span className="text-purple-400">else if</span>
          <span className="text-cream/90"> (score {">="} </span>
          <span className="text-orange-300">90</span>
          <span className="text-cream/90">) amount = </span>
          <span className="text-blue-400">random</span>
          <span className="text-cream/90">(</span>
          <span className="text-purple-300">800000</span>
          <span className="text-cream/90">, </span>
          <span className="text-purple-300">1200000</span>
          <span className="text-cream/90">);</span>
          <span className="text-purple-400 ml-2">{"// LEGENDARY"}</span>
        </div>

        {/* RARE - Blue accent */}
        <div>
          <L />
          <span className="text-cream/90">{"    "}</span>
          <span className="text-purple-400">else if</span>
          <span className="text-cream/90"> (score {">="} </span>
          <span className="text-orange-300">70</span>
          <span className="text-cream/90">) amount = </span>
          <span className="text-blue-400">random</span>
          <span className="text-cream/90">(</span>
          <span className="text-sky-300">200000</span>
          <span className="text-cream/90">, </span>
          <span className="text-sky-300">300000</span>
          <span className="text-cream/90">);</span>
          <span className="text-sky-400 ml-2">{"// RARE"}</span>
        </div>

        {/* COMMON - Standard cream */}
        <div>
          <L />
          <span className="text-cream/90">{"    "}</span>
          <span className="text-purple-400">else if</span>
          <span className="text-cream/90"> (score {">="} </span>
          <span className="text-orange-300">30</span>
          <span className="text-cream/90">) amount = </span>
          <span className="text-blue-400">random</span>
          <span className="text-cream/90">(</span>
          <span className="text-cream/90">40000</span>
          <span className="text-cream/90">, </span>
          <span className="text-cream/90">60000</span>
          <span className="text-cream/90">);</span>
          <span className="text-cream/60 ml-2">{"// COMMON"}</span>
        </div>

        {/* UNWORTHY - Red/dimmed, not paid */}
        <div className="opacity-50">
          <L />
          <span className="text-cream/90">{"    "}</span>
          <span className="text-purple-400">else</span>
          <span className="text-cream/90"> </span>
          <span className="text-purple-400">return</span>
          <span className="text-cream/90">{" { verdict: "}</span>
          <span className="text-red-400">"UNWORTHY"</span>
          <span className="text-cream/90">{" };"}</span>
          <span className="text-red-400/60 ml-2">{"// UNWORTHY (35%) - NOT PAID"}</span>
        </div>

        {/* Empty line */}
        <div><L /></div>

        {/* SECURITY WARNING - highlighted */}
        <div className="text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
          <L />{"    // ⚠️ SECURITY: WALLET CAN ONLY TRANSFER. SELLING IS IMPOSSIBLE."}
        </div>
        
        {/* Transfer call */}
        <div>
          <L />
          <span className="text-cream/90">{"    "}</span>
          <span className="text-purple-400">const</span>
          <span className="text-cream/90"> tx = </span>
          <span className="text-purple-400">await</span>
          <span className="text-blue-400"> transfer</span>
          <span className="text-cream/90">({"{"}</span>
        </div>
        <div>
          <L />
          <span className="text-cream/90">{"      "}</span>
          <span className="text-orange-300">from</span>
          <span className="text-cream/90">: </span>
          <span className="text-gold">HOARD_ADDRESS</span>
          <span className="text-cream/90">,</span>
        </div>
        <div>
          <L />
          <span className="text-cream/90">{"      "}</span>
          <span className="text-orange-300">to</span>
          <span className="text-cream/90">: userWallet,</span>
        </div>
        <div>
          <L />
          <span className="text-cream/90">{"      "}</span>
          <span className="text-orange-300">amount</span>
          <span className="text-cream/90">: amount</span>
        </div>
        <div>
          <L />
          <span className="text-cream/90">{"    }"});</span>
        </div>

        {/* Empty line */}
        <div><L /></div>

        {/* Return worthy */}
        <div>
          <L />
          <span className="text-cream/90">{"    "}</span>
          <span className="text-purple-400">return</span>
          <span className="text-cream/90">{" { verdict: "}</span>
          <span className="text-green-400 font-bold drop-shadow-[0_0_8px_rgba(74,222,128,0.6)]">"WORTHY"</span>
          <span className="text-cream/90">{", tier, tx };"}</span>
        </div>
        <div>
          <L />
          <span className="text-cream/90">{"  }"}</span>
        </div>

        {/* Close function */}
        <div>
          <L />
          <span className="text-cream/90">{"}"}</span>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-[101] flex items-center justify-center"
            onClick={onClose}
          >
            <div 
              className="w-full max-w-3xl max-h-full overflow-hidden rounded-lg flex flex-col"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "linear-gradient(180deg, hsl(220 20% 10%) 0%, hsl(220 25% 8%) 100%)",
                border: "1px solid hsl(var(--gold) / 0.3)",
                boxShadow: "0 0 60px hsl(var(--gold) / 0.15), inset 0 1px 0 hsl(var(--gold) / 0.1)",
              }}
            >
              {/* Title Bar - VS Code style */}
              <div 
                className="flex items-center justify-between px-4 py-2 shrink-0"
                style={{
                  background: "hsl(220 20% 12%)",
                  borderBottom: "1px solid hsl(220 20% 18%)",
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Window Controls */}
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  {/* File Tab */}
                  <div 
                    className="font-mono text-xs px-3 py-1 rounded-t flex items-center gap-2"
                    style={{
                      background: "hsl(220 25% 8%)",
                      color: "hsl(var(--gold))",
                      borderTop: "2px solid hsl(var(--gold) / 0.6)",
                    }}
                  >
                    <span className="text-blue-400">TS</span>
                    CLAUDES_LAMP.ts
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded hover:bg-white/10 transition-colors"
                    title="Copy code"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-cream/60" />
                    )}
                  </button>
                  <a
                    href="https://x.com/claudeslamprub"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded hover:bg-white/10 transition-colors"
                    title="Follow on X"
                  >
                    <svg className="w-4 h-4 text-cream/60 hover:text-cream" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded hover:bg-white/10 transition-colors"
                  >
                    <X className="w-4 h-4 text-cream/60" />
                  </button>
                </div>
              </div>

              {/* Code Content */}
              <div 
                className="flex-1 overflow-auto p-4 font-mono text-xs md:text-sm"
                style={{
                  background: "hsl(220 25% 8%)",
                }}
              >
                {renderCode()}
              </div>

              {/* Live Audit Footer */}
              <div 
                className="px-4 py-3 shrink-0 font-pixel text-[9px] md:text-[10px] space-y-1.5"
                style={{
                  background: "hsl(220 20% 10%)",
                  borderTop: "1px solid hsl(220 20% 18%)",
                }}
              >
                <div className="flex items-center gap-2 text-cream/60 mb-3">
                  <span className={`w-2 h-2 rounded-full ${hasLiveAudit ? 'bg-green-400/60' : 'bg-amber-400/60'}`} />
                  <span className="tracking-wider">{hasLiveAudit ? 'LIVE AUDIT FEED' : 'AWAITING LIVE DATA'}</span>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  <span className="text-gold/70">TREASURY: <span className="text-cream/60">{stats.isLoading ? '---' : `${formatNumber(stats.treasuryBalance)} ${stats.symbol}`}</span></span>
                  <span className="text-terracotta/70">DISTRIBUTED: <span className="text-cream/60">{stats.isLoading ? '---' : `${formatNumber(stats.totalDistributed)} ${stats.symbol}`}</span></span>
                  <span className="text-green-400/60">HOARD: <span className="text-cream/60">{hoardAddress ? truncateAddress(hoardAddress) : '---'}</span></span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
