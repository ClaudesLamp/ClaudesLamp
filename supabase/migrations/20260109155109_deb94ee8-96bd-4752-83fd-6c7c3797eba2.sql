-- Enable full row data for realtime UPDATE events
ALTER TABLE public.wishes REPLICA IDENTITY FULL;

-- Allow UPDATE on wishes (needed to set verdict)
CREATE POLICY "Anyone can update wish verdict"
ON public.wishes
FOR UPDATE
USING (true)
WITH CHECK (true);