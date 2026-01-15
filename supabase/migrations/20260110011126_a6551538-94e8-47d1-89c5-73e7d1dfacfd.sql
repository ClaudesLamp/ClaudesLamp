-- Create a sanitized, publicly-readable realtime feed for wishes (no full wallet address, no IP)

-- Helper: truncate a wallet for public display
CREATE OR REPLACE FUNCTION public.truncate_wallet(addr text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN addr IS NULL THEN ''
    WHEN length(addr) <= 10 THEN addr
    ELSE substring(addr FROM 1 FOR 4) || '...' || substring(addr FROM length(addr) - 3 FOR 4)
  END;
$$;

-- Public feed table (sanitized)
CREATE TABLE IF NOT EXISTS public.public_wishes (
  id uuid PRIMARY KEY,
  created_at timestamptz NOT NULL,
  wallet_trunc text NOT NULL,
  verdict text NULL,
  score integer NULL,
  payout_amount numeric NULL,
  payout_tier text NULL,
  is_jackpot boolean NULL,
  tx_signature text NULL
);

CREATE INDEX IF NOT EXISTS idx_public_wishes_created_at_desc
  ON public.public_wishes (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_public_wishes_verdict_payout
  ON public.public_wishes (verdict, payout_amount DESC);

-- Enable RLS + allow public read
ALTER TABLE public.public_wishes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'public_wishes'
      AND policyname = 'Public can read public wishes'
  ) THEN
    CREATE POLICY "Public can read public wishes"
    ON public.public_wishes
    FOR SELECT
    TO public
    USING (true);
  END IF;
END $$;

-- Ensure roles can SELECT (RLS still applies)
GRANT SELECT ON TABLE public.public_wishes TO anon, authenticated;

-- Sync trigger: mirror/refresh sanitized public feed from the private wishes table
CREATE OR REPLACE FUNCTION public.sync_public_wishes_from_wishes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.public_wishes (
    id,
    created_at,
    wallet_trunc,
    verdict,
    score,
    payout_amount,
    payout_tier,
    is_jackpot,
    tx_signature
  ) VALUES (
    NEW.id,
    NEW.created_at,
    public.truncate_wallet(NEW.wallet_address),
    NEW.verdict,
    NEW.score,
    NEW.payout_amount,
    NEW.payout_tier,
    NEW.is_jackpot,
    NEW.tx_signature
  )
  ON CONFLICT (id) DO UPDATE SET
    verdict = EXCLUDED.verdict,
    score = EXCLUDED.score,
    payout_amount = EXCLUDED.payout_amount,
    payout_tier = EXCLUDED.payout_tier,
    is_jackpot = EXCLUDED.is_jackpot,
    tx_signature = EXCLUDED.tx_signature;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS wishes_sync_public_wishes ON public.wishes;

CREATE TRIGGER wishes_sync_public_wishes
AFTER INSERT OR UPDATE ON public.wishes
FOR EACH ROW
EXECUTE FUNCTION public.sync_public_wishes_from_wishes();

-- Enable realtime on the public feed table (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'public_wishes'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.public_wishes';
  END IF;
END $$;