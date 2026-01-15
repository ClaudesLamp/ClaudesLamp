import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SOLANA_RPC = Deno.env.get('SOLANA_RPC_URL');
if (!SOLANA_RPC) {
  console.error('❌ FATAL: SOLANA_RPC_URL not configured');
  throw new Error('SOLANA_RPC_URL secret is required');
}

// Get secrets from environment
const DEFAULT_TOKEN_MINT = Deno.env.get('RUB_MINT_ADDRESS') || "";
const DEFAULT_TREASURY_WALLET = Deno.env.get('RUB_TREASURY_WALLET') || "";

// In-memory cache to avoid rate limiting
let cachedResult: {
  data: Record<string, unknown>;
  timestamp: number;
} | null = null;

const CACHE_TTL_MS = 10_000; // Cache for 10 seconds

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const tokenMint = url.searchParams.get('tokenMint') || DEFAULT_TOKEN_MINT;
    const treasuryWallet = url.searchParams.get('treasuryWallet') || DEFAULT_TREASURY_WALLET;

    // Check cache first
    if (cachedResult && (Date.now() - cachedResult.timestamp) < CACHE_TTL_MS) {
      console.log('Returning cached treasury stats');
      return new Response(
        JSON.stringify(cachedResult.data),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    console.log(`Fetching treasury stats for token: ${tokenMint}, wallet: ${treasuryWallet}`);

    // If no token mint configured, return fallback
    if (!tokenMint) {
      console.log('No token mint configured, returning fallback values');
      return new Response(
        JSON.stringify({
          treasuryBalance: 120_000_000,
          totalSupply: 1_000_000_000,
          percentage: 12.0,
          decimals: 9,
          symbol: 'RUB',
          tokenMint: 'NOT_CONFIGURED',
          treasuryWallet: 'NOT_CONFIGURED',
          isLive: false
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Fetch token supply from on-chain
    const supplyResponse = await fetch(SOLANA_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTokenSupply',
        params: [tokenMint]
      })
    });

    const supplyData = await supplyResponse.json();
    console.log('Token supply response:', JSON.stringify(supplyData));

    // Check for rate limiting
    if (supplyData.error?.code === -32429) {
      console.log('Rate limited by RPC, returning cached or fallback');
      if (cachedResult) {
        return new Response(
          JSON.stringify(cachedResult.data),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
      }
    }

    let totalSupply = 1_000_000_000; // fallback
    let decimals = 9;
    let symbol = 'RUB'; // Default symbol

    if (supplyData.result?.value) {
      totalSupply = parseFloat(supplyData.result.value.uiAmountString || '0');
      decimals = supplyData.result.value.decimals || 9;
    }

    // Try to fetch token metadata from Metaplex (for symbol)
    try {
      // Get metadata PDA for the token
      const metadataResponse = await fetch(SOLANA_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'getAccountInfo',
          params: [
            tokenMint,
            { encoding: 'jsonParsed' }
          ]
        })
      });
      
      const metadataData = await metadataResponse.json();
      console.log('Token account info:', JSON.stringify(metadataData));
      
      // For SPL tokens, we can try to get symbol from token-list or default
      // The symbol will typically need to be fetched from token metadata program
    } catch (metaErr) {
      console.log('Could not fetch metadata, using default symbol:', metaErr);
    }

    // Fetch treasury balance if wallet is configured
    let treasuryBalance = 0;
    
    if (treasuryWallet) {
      const tokenAccountsResponse = await fetch(SOLANA_RPC, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 3,
          method: 'getTokenAccountsByOwner',
          params: [
            treasuryWallet,
            { mint: tokenMint },
            { encoding: 'jsonParsed' }
          ]
        })
      });

      const tokenAccountsData = await tokenAccountsResponse.json();
      console.log('Treasury token accounts:', JSON.stringify(tokenAccountsData));

      // Check for rate limiting
      if (tokenAccountsData.error?.code === -32429) {
        console.log('Rate limited on token accounts, returning cached');
        if (cachedResult) {
          return new Response(
            JSON.stringify(cachedResult.data),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 
            }
          );
        }
      }

      if (tokenAccountsData.result?.value && tokenAccountsData.result.value.length > 0) {
        for (const account of tokenAccountsData.result.value) {
          const tokenAmount = account.account?.data?.parsed?.info?.tokenAmount;
          if (tokenAmount) {
            treasuryBalance += parseFloat(tokenAmount.uiAmountString || '0');
          }
        }
      }

      if (tokenAccountsData.error) {
        console.log('Treasury RPC error:', tokenAccountsData.error);
      }
    }

    // Calculate percentage
    const percentage = totalSupply > 0 ? (treasuryBalance / totalSupply) * 100 : 0;

    console.log(`Treasury stats - Symbol: ${symbol}, Balance: ${treasuryBalance}, Supply: ${totalSupply}, Percentage: ${percentage.toFixed(2)}%`);

    const result = {
      treasuryBalance,
      totalSupply,
      percentage: Math.round(percentage * 10) / 10,
      decimals,
      symbol,
      tokenMint,
      treasuryWallet: treasuryWallet || 'NOT_CONFIGURED',
      isLive: true
    };

    // Cache the result if we got valid data
    if (treasuryBalance > 0) {
      cachedResult = {
        data: result,
        timestamp: Date.now()
      };
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error fetching treasury stats:', error);
    
    // Return cached data if available
    if (cachedResult) {
      return new Response(
        JSON.stringify(cachedResult.data),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch treasury stats',
        treasuryBalance: 120_000_000,
        totalSupply: 1_000_000_000,
        percentage: 12.0,
        symbol: 'RUB',
        isLive: false
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});