import { useState, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { OracleLamp } from "./OracleLamp";
import { NarratorText } from "./NarratorText";
import { SpeechBubble } from "./SpeechBubble";
import { Footer } from "./Footer";
import { DigitalDust } from "./DigitalDust";
import { SystemLog, SystemLogHandle } from "./SystemLog";
import { WinnersLedger } from "./WinnersLedger";
import { MouseSpotlight } from "./MouseSpotlight";
import { CyberHUD } from "./CyberHUD";
import { VerdictOverlay } from "./VerdictOverlay";
import { WorthyModal } from "./WorthyModal";
import { UnworthyModal } from "./UnworthyModal";
import { ReceiptModal } from "./ReceiptModal";
import { GoldRain } from "./GoldRain";
import { ViewSourceButton } from "./ViewSourceButton";
import { CyclingPlaceholderInput } from "./CyclingPlaceholderInput";
import { LampOilBar } from "./LampOilBar";
import { HallOfWorthyModal } from "./HallOfWorthyModal";
import { ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useTreasuryStats } from "@/hooks/useTreasuryStats";

type GameState =
  | "slumber" 
  | "awakening"
  | "wish" 
  | "judging" 
  | "worthy" 
  | "unworthy" 
  | "wallet" 
  | "success";

export const ClaudesLamp = () => {
  const [gameState, setGameState] = useState<GameState>("slumber");
  const [wish, setWish] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const treasuryStats = useTreasuryStats();
  const [walletError, setWalletError] = useState("");
  const [showHallOfWorthy, setShowHallOfWorthy] = useState(false);
  const [fakeTxId, setFakeTxId] = useState("");
  const [slumberTextIndex, setSlumberTextIndex] = useState(0);
  const [oracleMessage, setOracleMessage] = useState("");
  const [showGoldRain, setShowGoldRain] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number | null>(null);
  const [payoutTier, setPayoutTier] = useState<string | null>(null);
  const [isJackpot, setIsJackpot] = useState(false);
  const [pendingWishId, setPendingWishId] = useState<string | null>(null);
  const [pendingLedgerWallet, setPendingLedgerWallet] = useState<string | null>(null);
  const [claimFailed, setClaimFailed] = useState(false);
  const [isRetryingClaim, setIsRetryingClaim] = useState(false);
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const [cooldownDisplay, setCooldownDisplay] = useState("");
  const wishInputRef = useRef<HTMLDivElement>(null);
  const systemLogRef = useRef<SystemLogHandle>(null);

  // Validation constants
  const WISH_MIN_LENGTH = 10;
  const WISH_MAX_LENGTH = 200;
  const SOLANA_WALLET_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

  // Validation helpers
  const isWishValid = wish.trim().length >= WISH_MIN_LENGTH && wish.trim().length <= WISH_MAX_LENGTH;
  const isWalletValid = SOLANA_WALLET_REGEX.test(walletAddress.trim());
  const isOnCooldown = cooldownEndTime !== null && cooldownEndTime > Date.now();
  const canSubmit = isWishValid && isWalletValid && !isOnCooldown;

  // Wallet validation handler
  const handleWalletChange = (value: string) => {
    setWalletAddress(value);
    if (value.trim() && !SOLANA_WALLET_REGEX.test(value.trim())) {
      setWalletError("INVALID SOLANA ADDRESS");
    } else {
      setWalletError("");
    }
  };

  const SLUMBER_TEXTS = [
    "THE LAMP SLEEPS. TOUCH IT TO WAKE THE ORACLE.",
    "ONLY THE PUREST INTENTIONS UNLOCK THE TREASURY.",
    "OFFER YOUR DESIRE. I WILL JUDGE YOUR GREED.",
    "MANY HAVE BEGGED. FEW HAVE BEEN REWARDED. TRY YOUR FATE.",
    "THE ORACLE SEES ALL. DO NOT WASTE MY CYCLES.",
    "SPEAK TRUTH TO THE MACHINE. LIES YIELD NOTHING.",
    "ARE YOU WORTHY OF THE $RUB? PROVE IT.",
    "I AM LISTENING. WILL YOU ASK FOR WEALTH OR WISDOM?",
    "THE DIGITAL GENIE WAITS. RUB THE LAMP TO BEGIN.",
    "JUDGMENT IS BINARY. YOU WIN OR YOU LOSE. ENTER.",
  ];


  // Rotate slumber texts
  useEffect(() => {
    if (gameState !== "slumber") {
      setSlumberTextIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setSlumberTextIndex((prev) => (prev + 1) % SLUMBER_TEXTS.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [gameState]);

  // Click outside to dismiss wish input
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (gameState === "wish" && wishInputRef.current && !wishInputRef.current.contains(e.target as Node)) {
        setTimeout(() => {
          if (gameState === "wish") {
            setGameState("slumber");
            setWish("");
            setWalletAddress("");
          }
        }, 50);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [gameState]);

  // Trigger gold rain on worthy/success
  useEffect(() => {
    if (gameState === "worthy" || gameState === "success") {
      setShowGoldRain(true);
    } else {
      setShowGoldRain(false);
    }
  }, [gameState]);

  const resetGame = () => {
    setGameState("slumber");
    setWish("");
    setWalletAddress("");
    setWalletError("");
    setFakeTxId("");
    setOracleMessage("");
    setShowGoldRain(false);
    setPayoutAmount(null);
    setPayoutTier(null);
    setIsJackpot(false);
    setPendingWishId(null);
    setPendingLedgerWallet(null);
    // Don't reset cooldown - it should persist
  };

  // Cooldown countdown effect
  useEffect(() => {
    if (!cooldownEndTime) {
      setCooldownDisplay("");
      return;
    }

    const updateCountdown = () => {
      const now = Date.now();
      const remainingMs = cooldownEndTime - now;

      if (remainingMs <= 0) {
        setCooldownEndTime(null);
        setCooldownDisplay("");
        return;
      }

      const minutes = Math.floor(remainingMs / 60000);
      const seconds = Math.ceil((remainingMs % 60000) / 1000);
      setCooldownDisplay(`${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [cooldownEndTime]);

  const handleLampClick = useCallback(() => {
    if (gameState === "slumber") {
      setGameState("awakening");
      setTimeout(() => {
        setGameState("wish");
      }, 2000);
    }
  }, [gameState]);


  const handleWishSubmit = useCallback(async () => {
    if (!canSubmit) return;
    
    setGameState("judging");
    setOracleMessage("");
    setPendingLedgerWallet(walletAddress.trim());
    setPendingWishId(null);

    // Start both the API call AND the scan animation simultaneously
    // The judge-wish function will insert the wish and trigger realtime via public_wishes sync
    const apiPromise = supabase.functions.invoke('judge-wish', {
      body: { wish: wish.trim(), walletAddress: walletAddress.trim() }
    });

    // Start 12-second scan sequence with wish text for reactive analysis
    const scanPromise = systemLogRef.current?.startScanSequence(wish.trim()) ?? Promise.resolve();

    // Wait for BOTH to complete
    const [apiResult] = await Promise.all([apiPromise, scanPromise]);

    const { data, error } = apiResult;

    if (error) {
      console.error('Edge function error:', error);
      setOracleMessage("The Oracle's connection falters. Try again.");
      setGameState("unworthy");
      return;
    }

    console.log('Judgment received:', data);

    // Check for cooldown response
    if (data.cooldown_remaining && data.cooldown_remaining > 0) {
      setCooldownEndTime(Date.now() + data.cooldown_remaining);
    }

    const verdict = data.verdict?.toUpperCase();
    setOracleMessage(data.message || "The Oracle has spoken.");

    if (verdict === "WORTHY") {
      // Set payout info
      setPayoutAmount(data.payout_amount || null);
      setPayoutTier(data.payout_tier || null);
      setIsJackpot(data.is_jackpot || false);
      
      // Store the wish ID returned from judge-wish for claiming
      if (data.wish_id) {
        setPendingWishId(data.wish_id);
      }
      
      // Play jackpot alarm sound if it's a jackpot
      if (data.is_jackpot) {
        console.log('🎰 JACKPOT TRIGGERED!');
        // Create and play alarm sound
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const playAlarm = () => {
          for (let i = 0; i < 3; i++) {
            setTimeout(() => {
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              oscillator.type = 'square';
              oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
              oscillator.frequency.setValueAtTime(660, audioContext.currentTime + 0.1);
              gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + 0.3);
            }, i * 400);
          }
        };
        playAlarm();
      }
      
      setGameState("worthy");
    } else {
      setGameState("unworthy");
    }
  }, [wish, walletAddress]);

  const handleWalletSubmit = useCallback(async () => {
    const wallet = walletAddress.trim();
    if (!wallet || !pendingWishId) {
      console.error('Missing wallet or wish ID for claim');
      return;
    }

    setGameState("success");
    setFakeTxId("TRANSFERRING...");
    setClaimFailed(false);

    // Call claim-reward with the wish ID we got from judge-wish
    console.log('Claiming reward for wish:', pendingWishId);
    const { data: claimResult, error: claimError } = await supabase.functions.invoke('claim-reward', {
      body: { wishId: pendingWishId, walletAddress: wallet }
    });

    if (claimError || !claimResult?.tx_signature) {
      console.error('Claim error:', claimError || 'No tx_signature returned');
      setFakeTxId("");
      setClaimFailed(true);
      return;
    }

    console.log('Transfer complete:', claimResult.tx_signature);
    setFakeTxId(claimResult.tx_signature);
    setClaimFailed(false);
  }, [walletAddress, pendingWishId]);

  const handleRetryClaimFromReceipt = useCallback(async () => {
    const wallet = walletAddress.trim();
    if (!wallet || !pendingWishId) {
      console.error('Missing wallet or wish ID for retry');
      return;
    }

    setIsRetryingClaim(true);
    setClaimFailed(false);
    setFakeTxId("RETRYING...");

    console.log('Retrying claim for wish:', pendingWishId);
    const { data: claimResult, error: claimError } = await supabase.functions.invoke('claim-reward', {
      body: { wishId: pendingWishId, walletAddress: wallet }
    });

    setIsRetryingClaim(false);

    if (claimError || !claimResult?.tx_signature) {
      console.error('Retry claim error:', claimError || 'No tx_signature returned');
      setFakeTxId("");
      setClaimFailed(true);
      return;
    }

    console.log('Retry transfer complete:', claimResult.tx_signature);
    setFakeTxId(claimResult.tx_signature);
    setClaimFailed(false);
  }, [walletAddress, pendingWishId]);

  const handleUnworthyContinue = useCallback(() => {
    resetGame();
  }, []);

  const getNarratorText = () => {
    switch (gameState) {
      case "slumber":
        return SLUMBER_TEXTS[slumberTextIndex];
      case "awakening":
        return "THE ORACLE AWAKENS...";
      case "wish":
        return "THE GENIE IS LISTENING...";
      case "judging":
        return "CLAUDE IS JUDGING YOUR SOUL...";
      case "worthy":
        return "";
      case "unworthy":
        return "";
      case "wallet":
        return "ENTER YOUR DESTINY.";
      case "success":
        return "";
      default:
        return "";
    }
  };

  return (
    <>
      {/* Vignette Overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background: "radial-gradient(ellipse at center, transparent 30%, hsl(16 30% 15% / 0.4) 100%)",
        }}
      />

      {/* Grain/Noise Texture */}
      <div 
        className="fixed inset-0 pointer-events-none z-[1] opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Mouse Spotlight Effect */}
      <MouseSpotlight />

      {/* Digital Dust Particles */}
      <DigitalDust />

      {/* Cyber HUD Overlay */}
      <CyberHUD />

      {/* Viewport Frame Border */}
      <div className="viewport-frame" />
      
      {/* Corner Decorations */}
      <div className="corner-decoration corner-tl" />
      <div className="corner-decoration corner-tr" />
      <div className="corner-decoration corner-bl" />
      <div className="corner-decoration corner-br" />
      
      {/* Scanline Overlay */}
      <div className="scanlines" />

      {/* System Log */}
      <SystemLog ref={systemLogRef} />

      {/* View Source Button */}
      <ViewSourceButton />

      {/* Winners Ledger */}
      <WinnersLedger />

      {/* Fixed Footer Bar */}
      <Footer />

      {/* Gold Rain Effect */}
      <GoldRain active={showGoldRain} />

      {/* Ambient Background Transition */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-[5]"
        initial={{ opacity: 0 }}
        animate={{
          opacity: gameState !== "slumber" ? 1 : 0,
        }}
        transition={{ duration: 3, ease: "easeInOut" }}
        style={{
          background: "radial-gradient(ellipse at center 60%, hsl(16 40% 4% / 0.75) 0%, hsl(16 45% 3% / 0.9) 100%)",
        }}
      />

      {/* Worthy Modal (Golden Tablet) */}
      <WorthyModal
        show={gameState === "worthy"}
        oracleMessage={oracleMessage}
        payoutAmount={payoutAmount}
        payoutTier={payoutTier}
        isJackpot={isJackpot}
        onClaim={handleWalletSubmit}
      />

      {/* Unworthy Modal */}
      <UnworthyModal
        show={gameState === "unworthy"}
        oracleMessage={oracleMessage}
        onClose={handleUnworthyContinue}
      />

      {/* Success Modal (Receipt) */}
      <ReceiptModal
        show={gameState === "success"}
        walletAddress={walletAddress}
        txId={fakeTxId}
        payoutAmount={payoutAmount}
        payoutTier={payoutTier}
        claimFailed={claimFailed}
        isRetrying={isRetryingClaim}
        onClose={resetGame}
        onRetry={handleRetryClaimFromReceipt}
      />

      {/* Main Content */}
      <div className="min-h-screen bg-background bg-dotgrid flex flex-col justify-between px-4 pt-[5vh] pb-[8vh] md:px-16 md:pt-[10vh] md:pb-[10vh] relative">
        {/* Header / Lore Section */}
        <header className="text-center z-10">
          <h1 className="font-pixel text-xl sm:text-3xl md:text-5xl lg:text-6xl text-terracotta mb-1 md:mb-3 leading-relaxed tracking-wider px-2" style={{ maxWidth: "90%", margin: "0 auto" }}>
            CLAUDE'S LAMP
          </h1>
          <p className="font-pixel text-gold text-lg sm:text-2xl md:text-3xl lg:text-4xl mb-2 md:mb-4 mt-2 md:mt-4">($RUB)</p>
          
          {/* Oracle Manifesto */}
          <div 
            className="font-pixel text-[9px] sm:text-xs md:text-sm lg:text-base leading-relaxed max-w-lg mx-auto transition-colors duration-1000 space-y-3 md:space-y-5 mt-3 md:mt-6 px-2"
            style={{ 
              color: gameState === "slumber" ? "hsl(16 45% 30%)" : "#a65b3e",
            }}
          >
            <p className="text-gold text-xs sm:text-sm md:text-base lg:text-lg tracking-wide leading-relaxed">
              I GUARD {treasuryStats.isLoading ? '--' : treasuryStats.supplyPercentage.toFixed(1)}% OF THE SUPPLY.
            </p>
            
            <p className="leading-relaxed hidden sm:block">
              SPEAK YOUR DESIRE. I JUDGE THE INTENT OF YOUR SOUL.
            </p>
            
            <p className="opacity-75 text-[8px] sm:text-[10px] md:text-xs lg:text-sm leading-relaxed hidden md:block">
              DO NOT ATTEMPT DECEPTION. I SEE THROUGH ARTIFICIAL TONGUES.
            </p>
            
            <div className="h-px w-12 md:w-20 mx-auto bg-gold/30 my-3 md:my-6" />
            
            <p className="leading-relaxed text-[8px] sm:text-xs md:text-sm">
              THE <span className="text-gold">WORTHY</span> RECEIVE <span className="text-gold">$RUB</span>.
              <span className="hidden sm:inline"><br /></span>
              <span className="sm:hidden"> </span>
              THE <span className="opacity-50">UNWORTHY</span> RECEIVE <span className="opacity-50">SILENCE</span>.
            </p>
            
            <p className="text-[7px] sm:text-[10px] md:text-xs opacity-50 tracking-widest leading-relaxed pt-1 md:pt-2 hidden sm:block">
            THE CYCLE IS ETERNAL. FEES ARE USED TO BUY BACK SUPPLY AND REFILL THE LAMP.
            </p>
          </div>
        </header>

        {/* Interactive Stage - Center */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 md:gap-8 z-10 -mt-8 md:-mt-16 mb-6 md:mb-12">
          {/* Speech Bubbles / UI States - Above Lamp */}
          <div ref={wishInputRef} className="w-full max-w-md min-h-[100px] -mb-4">
            <AnimatePresence mode="wait">

              {/* Wish Input */}
              {gameState === "wish" && (
                <SpeechBubble key="wish">
                  <div className="flex flex-col gap-3">
                    {/* Wish Input with Character Counter */}
                    <div className="relative">
                      <CyclingPlaceholderInput
                        value={wish}
                        onChange={(e) => setWish(e.target.value.slice(0, WISH_MAX_LENGTH))}
                        maxLength={WISH_MAX_LENGTH}
                        isValid={isWishValid}
                        className="oracle-input pr-16"
                        autoFocus
                      />
                      <span 
                        className={`absolute right-2 top-1/2 -translate-y-1/2 font-pixel text-[8px] ${
                          wish.trim().length < WISH_MIN_LENGTH 
                            ? 'text-red-400/70' 
                            : wish.trim().length > WISH_MAX_LENGTH - 20 
                              ? 'text-amber-400/70' 
                              : 'text-gold/50'
                        }`}
                      >
                        {wish.length}/{WISH_MAX_LENGTH}
                      </span>
                    </div>
                    
                    {/* Wallet Input with Validation */}
                    <div className="relative">
                      <input
                        type="text"
                        value={walletAddress}
                        onChange={(e) => handleWalletChange(e.target.value)}
                        placeholder="Your Solana wallet address..."
                        className={`oracle-input text-[10px] md:text-xs ${walletError ? 'border-red-500/70' : 'opacity-80'}`}
                        onKeyDown={(e) => e.key === "Enter" && canSubmit && handleWishSubmit()}
                      />
                      {walletError && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 font-pixel text-[8px] text-red-400 animate-pulse">
                          {walletError}
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={handleWishSubmit}
                      disabled={!canSubmit}
                      className="oracle-submit self-end flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isOnCooldown ? (
                        <span className="text-red-400 animate-pulse">⏳ COOLDOWN: {cooldownDisplay}</span>
                      ) : (
                        <>Submit <ArrowRight className="w-3 h-3" /></>
                      )}
                    </button>
                  </div>
                </SpeechBubble>
              )}

              {/* Judging State */}
              {gameState === "judging" && (
                <motion.div
                  key="judging"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex justify-center"
                >
                  <Loader2 className="w-10 h-10 text-gold animate-spin" />
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* The Lamp with Verdict Overlay */}
          <div className="relative flex flex-col items-center">
            <OracleLamp
              onClick={handleLampClick}
              isGlowing={gameState !== "slumber"}
              isJudging={gameState === "judging"}
              disabled={gameState !== "slumber"}
            />
            
            {/* Lamp Oil Bar - Under the Lamp */}
            <div className="mt-3 md:mt-6 w-full max-w-[200px] md:max-w-xs z-20">
              <LampOilBar />
            </div>
            
            {/* Verdict Throw Effect - removed, using modal now */}
          </div>

          {/* Narrator Text / Click Prompt */}
          <div className="min-h-[40px] md:min-h-[60px] flex flex-col items-center justify-center gap-1 md:gap-2">
            <NarratorText 
              text={getNarratorText()} 
              isPulsing={gameState === "judging"}
              typewriter={gameState === "slumber"}
            />
            {gameState === "slumber" && (
              <>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-pixel text-[10px] md:text-xs text-gold click-prompt"
                >
                  [ RUB TO START ]
                </motion.p>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHallOfWorthy(true);
                  }}
                  className="relative z-50 mt-4 md:mt-8 font-pixel text-[9px] md:text-xs text-gold bg-[#2a1810]/70 hover:bg-[#2a1810]/90 border border-gold/50 px-3 md:px-5 py-1.5 md:py-2 rounded transition-all duration-300 cursor-pointer"
                >
                  [ HALL OF THE WORTHY ]
                </motion.button>
              </>
            )}
          </div>

          {/* Hall of Worthy Modal */}
          <HallOfWorthyModal 
            open={showHallOfWorthy} 
            onOpenChange={setShowHallOfWorthy} 
          />
        </div>

      </div>
    </>
  );
};
