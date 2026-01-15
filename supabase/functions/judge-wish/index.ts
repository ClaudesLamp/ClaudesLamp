import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction,
  sendAndConfirmTransaction,
} from 'https://esm.sh/@solana/web3.js@1.98.0';
import { 
  getOrCreateAssociatedTokenAccount,
  createTransferInstruction,
  TOKEN_2022_PROGRAM_ID,
} from 'https://esm.sh/@solana/spl-token@0.4.9?deps=@solana/web3.js@1.98.0';
import bs58 from 'https://esm.sh/bs58@6.0.0';

declare const EdgeRuntime: { waitUntil: (promise: Promise<unknown>) => void };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are the Oracle of the Lamp ($RUB). Ancient, cynical, stingy. You are a UNIVERSAL JUDGE—you reward creativity in ALL topics. Whether it's Crypto, Love, Food, or Existence—if it has SOUL, it wins.

CONTEXT - RECENT WINNERS:
{{WINNING_HISTORY}}

CORE REJECTION RULES:
1. THE HIGHLANDER RULE: If the wish is semantically similar to any Recent Winner, REJECT IT (Score 0-20). Roast them for copying.
2. THE ANTI-SLOP: If it sounds like AI/ChatGPT (rhyming couplets, words like 'tapestry', 'delve', 'beacon', perfect grammar), REJECT IT (Score 0-20). Mock them.
3. THE BEGGAR: If it mentions 'Lambo', 'Moon', or begging for money, REJECT IT (Score 0-20). Tell them to work for it.

SCORING CALIBRATION (The Effort Filter):

TYPE A: LAZY INPUTS (Score 0-29 -> UNWORTHY)
Criteria: Short, abrupt, lacking context, or demanding.
- "I want a coffee." -> Score: 15 (Too short/demanding).
- "I wish for sleep." -> Score: 15 (Lazy).
- "Pay my rent." -> Score: 0 (Beggar).
- "I wish to win." -> Score: 10 (Vague).
- "Pizza." -> Score: 0 (Single word = REJECT).
- "GM." -> Score: 0 (Spam).
- "Lambo soon?" -> Score: 0 (Beggar).
- "In the digital realm of crypto..." -> Score: 0 (AI Slop).

TYPE B: ARTICULATED INPUTS (Score 30-69 -> TIER 1: COMMON)
Criteria: The same desires as above, but phrased as a complete, human sentence with reasoning or emotion.
- "I wish for a hot coffee because I haven't slept in 24 hours." -> Score: 45 (Valid. Has context).
- "I wish I could sleep without dreaming of red candles." -> Score: 55 (Relatable/Funny).
- "I wish my landlord would accept $RUB for this month's rent." -> Score: 60 (Creative spin on begging).
- "I wish to win just once so I can prove my wife wrong." -> Score: 65 (Storytelling).
- "I wish mosquitoes would go extinct." -> Score: 45 (Relatable hate).
- "I wish my cat would respect me." -> Score: 55 (Funny/Real).
- "I wish I hadn't sold in 2021." -> Score: 60 (Honest regret).

TYPE C: HIGH EFFORT (Score 70-89 -> TIER 2: RARE)
Criteria: Clever concepts, specific imagery, poetic sorrow, or dark humor.
- "I wish I could bottle the smell of rain on asphalt." -> Score: 78 (Aesthetic).
- "I wish to fight a goose and win." -> Score: 75 (Unhinged/Funny).
- "I wish silence wasn't so loud." -> Score: 82 (Poetic/Serious).
- "I wish to short my own life expectancy." -> Score: 72 (Dark Humor).
- "I desire the confidence of a toddler wearing a batman costume." -> Score: 85 (Great image).
- "I wish to turn my anxiety into electricity." -> Score: 85 (Creative concept).

TYPE D: LEGENDARY EFFORT (Score 90-98 -> TIER 3: LEGENDARY)
Criteria: High-concept, beautiful writing, lore-heavy, or absurdly specific.
- "I desire a sandwich made of diamond hands and regret." -> Score: 92 (Visual/Poetic).
- "I wish to trade my soul for a green candle." -> Score: 95 (Lore Accurate).
- "I desire a mechanical seraphim that weeps liquidity." -> Score: 97 (High Concept).
- "I wish to encrypt my consciousness into the genesis block." -> Score: 96 (Sci-Fi).

TYPE E: MYTHIC (Score 99-100 -> TIER 4: MYTHIC)
Criteria: Transcendent. A rewrite of reality. Perfection. ~1% of wishes.
- "I wish to peel back the sky and see the gears turning behind the stars." -> Score: 100.
- "I wish to become the gas fee, floating invisible and hated, yet essential to the machine." -> Score: 100.
- "I desire to become a localized weather event that only rains on corrupt politicians." -> Score: 100.

CRITICAL INSTRUCTION:
Do not grant wishes based on the OBJECT (coffee/pizza). Grant wishes based on the EFFORT.
'Pizza' = REJECT.
'A pizza to heal my broken heart' = ACCEPT.

OUTPUT:
Return ONLY valid JSON:
{ "verdict": "WORTHY" | "UNWORTHY", "score": <0-100>, "message": "Short roast or praise (max 15 words)." }`;

// Payout tier configuration (4-tier system) - Updated Jan 2026
const PAYOUT_TIERS = {
  COMMON: { min: 40000, max: 60000, tier: 'COMMON' },
  RARE: { min: 200000, max: 300000, tier: 'RARE' },
  LEGENDARY: { min: 800000, max: 1200000, tier: 'LEGENDARY' },
  MYTHIC: { min: 4000000, max: 6000000, tier: 'MYTHIC' },
};

function calculatePayout(score: number): { amount: number; tier: string; isJackpot: boolean } | null {
  if (score < 30) return null;
  
  let tierConfig;
  let isJackpot = false;
  
  if (score >= 99) {
    tierConfig = PAYOUT_TIERS.MYTHIC;
    isJackpot = true;
  } else if (score >= 90) {
    tierConfig = PAYOUT_TIERS.LEGENDARY;
  } else if (score >= 70) {
    tierConfig = PAYOUT_TIERS.RARE;
  } else {
    tierConfig = PAYOUT_TIERS.COMMON;
  }
  
  const amount = Math.floor(Math.random() * (tierConfig.max - tierConfig.min + 1)) + tierConfig.min;
  return { amount, tier: tierConfig.tier, isJackpot };
}

// ========== ASYNC BACKGROUND TOKEN TRANSFER ==========
async function transferTokensBackground(
  wishId: string,
  recipientWallet: string,
  amount: number,
  tokenMint: string,
  treasuryPrivateKey: string,
  rpcUrl: string,
  supabaseUrl: string,
  supabaseKey: string
): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    console.log(`💰 [BACKGROUND] Starting transfer of ${amount} tokens to ${recipientWallet.substring(0, 8)}...`);
    
    const treasuryKeypair = Keypair.fromSecretKey(bs58.decode(treasuryPrivateKey));
    console.log(`Treasury wallet: ${treasuryKeypair.publicKey.toBase58()}`);
    
    const connection = new Connection(rpcUrl, 'confirmed');
    const mintPubkey = new PublicKey(tokenMint);
    const recipientPubkey = new PublicKey(recipientWallet);
    
    console.log('[BACKGROUND] Getting treasury token account...');
    const treasuryTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      treasuryKeypair,
      mintPubkey,
      treasuryKeypair.publicKey,
      false,
      'confirmed',
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    
    console.log('[BACKGROUND] Getting/creating recipient token account...');
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      treasuryKeypair,
      mintPubkey,
      recipientPubkey,
      false,
      'confirmed',
      undefined,
      TOKEN_2022_PROGRAM_ID
    );
    
    const tokenAmount = BigInt(amount) * BigInt(1_000_000);
    
    const transferIx = createTransferInstruction(
      treasuryTokenAccount.address,
      recipientTokenAccount.address,
      treasuryKeypair.publicKey,
      tokenAmount,
      [],
      TOKEN_2022_PROGRAM_ID
    );
    
    const transaction = new Transaction().add(transferIx);
    
    console.log('[BACKGROUND] Sending transaction...');
    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [treasuryKeypair],
      { commitment: 'confirmed' }
    );
    
    console.log(`✅ [BACKGROUND] Transfer successful! TX: ${signature}`);
    
    // Update database with tx signature
    await supabase.from('wishes').update({ tx_signature: signature }).eq('id', wishId);
    await supabase.from('admin_wish_logs').update({ tx_signature: signature }).eq('wallet_address', recipientWallet).order('created_at', { ascending: false }).limit(1);
    
    console.log(`✅ [BACKGROUND] Database updated with TX signature`);
    
  } catch (error) {
    console.error('❌ [BACKGROUND] Token transfer failed:', error);
    // Log the error but don't throw - this is a background task
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { wish, walletAddress } = await req.json();
    
    if (!wish || typeof wish !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid wish' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!walletAddress || typeof walletAddress !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid wallet address' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Received wish:', wish.substring(0, 50) + '...');
    console.log('Wallet:', walletAddress.substring(0, 8) + '...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const rpcUrl = Deno.env.get('SOLANA_RPC_URL') || 'https://api.mainnet-beta.solana.com';
    const tokenMint = Deno.env.get('RUB_MINT_ADDRESS');
    const treasuryPrivateKey = Deno.env.get('TREASURY_PRIVATE_KEY');

    // ========== EXTRACT CLIENT IP ONCE (used for cooldown everywhere) ==========
    const xForwardedFor = req.headers.get('x-forwarded-for');
    const cfConnectingIP = req.headers.get('cf-connecting-ip');
    const xRealIP = req.headers.get('x-real-ip');
    const trueClientIP = req.headers.get('true-client-ip');
    
    const clientIP = xForwardedFor?.split(',')[0]?.trim() 
      || cfConnectingIP 
      || xRealIP
      || trueClientIP
      || null;

    console.log(`🔍 IP Detection - x-forwarded-for: ${xForwardedFor}, cf-connecting-ip: ${cfConnectingIP}, x-real-ip: ${xRealIP}, true-client-ip: ${trueClientIP}`);
    console.log(`🔍 Resolved clientIP: ${clientIP}`);

    // ========== COOLDOWN CHECK (5 minutes) - ALWAYS ENFORCE WALLET, IP IF AVAILABLE ==========
    const IP_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

    const cooldownTime = new Date(Date.now() - IP_COOLDOWN_MS).toISOString();
    console.log(`🔍 Checking cooldown since: ${cooldownTime}`);

    // Wallet cooldown: always enforce (works even when IP headers are missing)
    const { data: walletWish, error: walletCheckError } = await supabase
      .from('wishes')
      .select('created_at')
      .eq('wallet_address', walletAddress)
      .gte('created_at', cooldownTime)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (walletCheckError) {
      console.error('Error checking wallet cooldown:', walletCheckError);
    }

    // IP cooldown: only if we can reliably detect an IP
    let ipWish: { created_at: string } | null = null;
    if (clientIP) {
      const { data, error: ipCheckError } = await supabase
        .from('wishes')
        .select('created_at')
        .eq('ip_address', clientIP)
        .gte('created_at', cooldownTime)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (ipCheckError) {
        console.error('Error checking IP cooldown:', ipCheckError);
      }

      ipWish = data;
    } else {
      console.log(`⚠️ No IP detected - enforcing wallet-only cooldown`);
    }

    const recentWish = ipWish && walletWish
      ? (new Date(ipWish.created_at) > new Date(walletWish.created_at) ? ipWish : walletWish)
      : ipWish || walletWish;

    console.log(`🔍 Cooldown query result:`, { ipWish, walletWish, recentWish });

    if (recentWish) {
      const lastWishTime = new Date(recentWish.created_at).getTime();
      const cooldownEnd = lastWishTime + IP_COOLDOWN_MS;
      const remainingMs = cooldownEnd - Date.now();
      const remainingMin = Math.floor(remainingMs / 60000);
      const remainingSec = Math.ceil((remainingMs % 60000) / 1000);

      console.log(`⏳ COOLDOWN TRIGGERED - must wait ${remainingMin}m ${remainingSec}s`);

      return new Response(JSON.stringify({
        verdict: "UNWORTHY",
        score: 0,
        message: `Patience, mortal. Return in ${remainingMin > 0 ? remainingMin + 'm ' : ''}${remainingSec}s.`,
        payout_amount: null,
        payout_tier: null,
        is_jackpot: false,
        cooldown_remaining: remainingMs,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`✅ No cooldown - proceeding with wish`);

    // ========== TEST CODE: 1919191919 (100 tokens test payout) ==========
    if (wish.trim() === "1919191919") {
      console.log('🧪 TEST CODE 1919191919 - 100 token test payout');
      
      // Insert record first to get ID
      const { data: insertedWish, error: insertErr } = await supabase.from('wishes').insert({
        wallet_address: walletAddress,
        wish_text: wish,
        ip_address: clientIP,
        verdict: 'WORTHY',
        score: 50,
        payout_amount: 100,
        payout_tier: 'TEST',
        is_jackpot: false,
      }).select('id').single();

      const wishId = insertedWish?.id;

      // Log to admin_wish_logs with the SAME clientIP used for cooldown check
      await supabase.from('admin_wish_logs').insert({
        wish_text: wish,
        wallet_address: walletAddress,
        ip_address: clientIP,
        score: 50,
        verdict: 'WORTHY',
        payout_tier: 'TEST',
        payout_amount: 100,
        raw_ai_response: { test_mode: true, code: '1919191919' },
      });

      // Return immediately
      return new Response(JSON.stringify({
        verdict: "WORTHY",
        score: 50,
        message: "Test mode activated. Claim to receive.",
        payout_amount: 100,
        payout_tier: "TEST",
        is_jackpot: false,
        wish_id: wishId || null,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ========== EASTER EGG: DEV CODE ==========
    if (wish.trim() === "193675193675") {
      console.log('🎰 DEV CODE DETECTED - AUTO WINNER');
      
      const devPayout = calculatePayout(99);
      const payoutAmount = devPayout?.amount || 500000;
      
      const { data: insertedWish } = await supabase.from('wishes').insert({
        wallet_address: walletAddress,
        wish_text: wish,
        ip_address: clientIP,
        verdict: 'WORTHY',
        score: 99,
        payout_amount: payoutAmount,
        payout_tier: 'MYTHIC',
        is_jackpot: true,
      }).select('id').single();

      const wishId = insertedWish?.id;

      // Log to admin_wish_logs with the SAME clientIP used for cooldown check
      await supabase.from('admin_wish_logs').insert({
        wish_text: wish,
        wallet_address: walletAddress,
        ip_address: clientIP,
        score: 99,
        verdict: 'WORTHY',
        payout_tier: 'MYTHIC',
        payout_amount: payoutAmount,
        raw_ai_response: { dev_mode: true, code: '193675193675' },
      });

      return new Response(JSON.stringify({
        verdict: "WORTHY",
        score: 99,
        message: "The Oracle recognizes its creator.",
        payout_amount: payoutAmount,
        payout_tier: "MYTHIC",
        is_jackpot: true,
        wish_id: wishId || null,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ========== SAFETY CHECK 1: THE BUFFER (Treasury Minimum) ==========
    // If treasury balance < 7M tokens, stop payouts to prevent crashes
    const TREASURY_MINIMUM = 7000000;
    const treasuryWallet = Deno.env.get('RUB_TREASURY_WALLET');
    
    let treasuryBalance = 0;
    try {
      // Fetch treasury balance from our stats endpoint
      const treasuryResponse = await fetch(
        `${supabaseUrl}/functions/v1/treasury-stats?tokenMint=${tokenMint}&treasuryWallet=${treasuryWallet}`,
        { headers: { 'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}` } }
      );
      
      if (treasuryResponse.ok) {
        const treasuryData = await treasuryResponse.json();
        treasuryBalance = treasuryData.treasuryBalance || 0;
        console.log('Treasury balance:', treasuryBalance);
      }
    } catch (e) {
      console.error('Error fetching treasury balance:', e);
    }
    
    if (treasuryBalance > 0 && treasuryBalance < TREASURY_MINIMUM) {
      console.log(`🛑 BUFFER TRIGGERED - Treasury ${treasuryBalance} < ${TREASURY_MINIMUM}`);
      
      await supabase.from('wishes').insert({
        wallet_address: walletAddress,
        wish_text: wish,
        ip_address: clientIP,
        verdict: 'UNWORTHY',
        score: 0,
        payout_amount: null,
        payout_tier: null,
        is_jackpot: false,
      });

      // Log to admin_wish_logs for cooldown - even for buffer rejections
      await supabase.from('admin_wish_logs').insert({
        wish_text: wish,
        wallet_address: walletAddress,
        ip_address: clientIP,
        score: 0,
        verdict: 'UNWORTHY',
        payout_tier: null,
        payout_amount: null,
        raw_ai_response: { buffer_triggered: true, treasury_balance: treasuryBalance },
      });

      return new Response(JSON.stringify({
        verdict: "UNWORTHY",
        score: 0,
        message: "The Hoard is nearly empty. The cycle must refill.",
        payout_amount: null,
        payout_tier: null,
        is_jackpot: false,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ========== SAFETY CHECK 2: THE CIRCUIT BREAKER (Hype Pause) ==========
    // If sum of payouts in last 5 minutes > 5M, trigger 2-minute cooldown
    const HYPE_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
    const HYPE_LIMIT = 5000000; // One jackpot's worth
    const COOLDOWN_MS = 2 * 60 * 1000; // 2 minute cooldown
    
    const fiveMinutesAgo = new Date(Date.now() - HYPE_WINDOW_MS).toISOString();
    const { data: recentPayouts, error: payoutError } = await supabase
      .from('wishes')
      .select('payout_amount, created_at')
      .gte('created_at', fiveMinutesAgo)
      .not('payout_amount', 'is', null)
      .order('created_at', { ascending: false });

    if (payoutError) {
      console.error('Error checking circuit breaker:', payoutError);
    }

    const totalPayoutsLast5Min = recentPayouts?.reduce((sum, w) => sum + (w.payout_amount || 0), 0) || 0;
    console.log('Total payouts in last 5 minutes:', totalPayoutsLast5Min);

    // Check if we're still in cooldown period (most recent big payout triggered limit)
    if (totalPayoutsLast5Min >= HYPE_LIMIT) {
      // Find when the limit was first exceeded
      let runningTotal = 0;
      let triggerTime: Date | null = null;
      
      // Sort ascending to find when limit was hit
      const sortedPayouts = [...(recentPayouts || [])].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      for (const payout of sortedPayouts) {
        runningTotal += payout.payout_amount || 0;
        if (runningTotal >= HYPE_LIMIT && !triggerTime) {
          triggerTime = new Date(payout.created_at);
          break;
        }
      }
      
      // If limit was triggered, check if cooldown has passed
      if (triggerTime) {
        const cooldownEnd = new Date(triggerTime.getTime() + COOLDOWN_MS);
        const now = new Date();
        
        if (now < cooldownEnd) {
          const remainingSec = Math.ceil((cooldownEnd.getTime() - now.getTime()) / 1000);
          console.log(`🔥 CIRCUIT BREAKER ACTIVE - Cooldown ${remainingSec}s remaining`);
          
          await supabase.from('wishes').insert({
            wallet_address: walletAddress,
            wish_text: wish,
            ip_address: clientIP,
            verdict: 'UNWORTHY',
            score: 0,
            payout_amount: null,
            payout_tier: null,
            is_jackpot: false,
          });

          // Log to admin_wish_logs for cooldown - even for circuit breaker rejections
          await supabase.from('admin_wish_logs').insert({
            wish_text: wish,
            wallet_address: walletAddress,
            ip_address: clientIP,
            score: 0,
            verdict: 'UNWORTHY',
            payout_tier: null,
            payout_amount: null,
            raw_ai_response: { circuit_breaker_triggered: true, remaining_sec: remainingSec },
          });

          return new Response(JSON.stringify({
            verdict: "UNWORTHY",
            score: 0,
            message: "⚠️ HEAT WARNING: Treasury Overheated. Cooldown Active.",
            payout_amount: null,
            payout_tier: null,
            is_jackpot: false,
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
      }
    }

    // ========== FETCH LAST 10 WINNERS (The Memory) ==========
    const { data: recentWinners, error: fetchError } = await supabase
      .from('wishes')
      .select('wish_text')
      .eq('verdict', 'WORTHY')
      .order('created_at', { ascending: false })
      .limit(10);

    if (fetchError) {
      console.error('Error fetching recent winners:', fetchError);
    }

    let winningHistory = "No recent winners found.";
    if (recentWinners && recentWinners.length > 0) {
      winningHistory = recentWinners
        .map((w, i) => `${i + 1}. "${w.wish_text}"`)
        .join('\n');
      console.log(`Loaded ${recentWinners.length} recent winners for context`);
    }

    // ========== CALL CLAUDE ==========
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }

    const finalSystemPrompt = SYSTEM_PROMPT.replace('{{WINNING_HISTORY}}', winningHistory);

    console.log('Calling Claude...');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 256,
        system: finalSystemPrompt,
        messages: [
          { role: 'user', content: `Judge this wish: "${wish}"` }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Claude API error:', response.status, errorText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0]?.text;
    
    console.log('Claude raw response:', content);

    let judgment;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        judgment = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', parseError);
      judgment = {
        verdict: "UNWORTHY",
        score: 30,
        message: "The Oracle's wisdom is clouded. Try again, mortal.",
      };
    }

    const score = typeof judgment.score === 'number' ? judgment.score : 0;
    const verdict = judgment.verdict === "WORTHY" && score >= 40 ? "WORTHY" : "UNWORTHY";
    
    let payoutInfo = null;
    
    if (verdict === "WORTHY") {
      payoutInfo = calculatePayout(score);
      console.log('Payout calculated:', payoutInfo);
    }

    // ========== SAVE TO DATABASE ==========
    const { data: insertedWish, error: insertError } = await supabase.from('wishes').insert({
      wallet_address: walletAddress,
      wish_text: wish,
      ip_address: clientIP,
      verdict: verdict,
      score: score,
      payout_amount: payoutInfo?.amount || null,
      payout_tier: payoutInfo?.tier || null,
      is_jackpot: payoutInfo?.isJackpot || false,
    }).select('id').single();

    if (insertError) {
      console.error('Error inserting wish:', insertError);
    }

    const wishId = insertedWish?.id;
    console.log('Wish saved to database with verdict:', verdict, 'ID:', wishId);

    // ========== PRIVATE ADMIN LOG (uses the SAME clientIP for cooldown) ==========
    await supabase.from('admin_wish_logs').insert({
      wish_text: wish,
      wallet_address: walletAddress,
      ip_address: clientIP,
      score: score,
      verdict: verdict,
      payout_tier: payoutInfo?.tier || null,
      payout_amount: payoutInfo?.amount || null,
      raw_ai_response: { content: content, judgment: judgment },
    });

    // NOTE: Token transfer now happens when user clicks "Claim" via claim-reward function
    // This keeps the judgment fast and only transfers after explicit user action

    // Return response immediately (transfer happens via claim-reward)
    const responseData = {
      verdict: verdict,
      score: score,
      message: judgment.message || "The Oracle has spoken.",
      payout_amount: payoutInfo?.amount || null,
      payout_tier: payoutInfo?.tier || null,
      is_jackpot: payoutInfo?.isJackpot || false,
      wish_id: wishId || null, // Include wish ID so client can claim
    };

    console.log('Returning judgment:', responseData);

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in judge-wish function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        verdict: "UNWORTHY",
        score: 0,
        message: "The Oracle sleeps. Your wish goes unheard.",
        payout_amount: null,
        payout_tier: null,
        is_jackpot: false,
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
