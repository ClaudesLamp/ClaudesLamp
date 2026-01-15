import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch current slot (block height)
    const slotResponse = await fetch(SOLANA_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'getSlot',
        params: [{ commitment: 'confirmed' }]
      })
    });

    // Fetch recent performance samples for TPS
    const perfResponse = await fetch(SOLANA_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'getRecentPerformanceSamples',
        params: [1]
      })
    });

    const slotData = await slotResponse.json();
    const perfData = await perfResponse.json();

    const slot = slotData.result || null;
    
    // Calculate TPS from performance sample
    let tps = null;
    if (perfData.result && perfData.result.length > 0) {
      const sample = perfData.result[0];
      // TPS = numTransactions / samplePeriodSecs
      tps = Math.round(sample.numTransactions / sample.samplePeriodSecs);
    }

    console.log(`Solana stats fetched - Slot: ${slot}, TPS: ${tps}`);

    return new Response(
      JSON.stringify({ slot, tps }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error fetching Solana stats:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch Solana stats', slot: null, tps: null }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200  // Return 200 with null values so client can handle gracefully
      }
    );
  }
});
