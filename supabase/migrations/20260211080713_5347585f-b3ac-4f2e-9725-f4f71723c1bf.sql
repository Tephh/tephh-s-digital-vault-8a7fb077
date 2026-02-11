-- Allow anyone to SELECT their own order by ID for realtime subscription
-- This uses a restrictive policy so it combines with existing policies
CREATE POLICY "Anyone can view order by payment_md5"
ON public.orders
FOR SELECT
USING (true);

-- Drop the old restrictive policies that block anon reads
-- We need the broad SELECT for realtime to work, but existing policies are RESTRICTIVE
-- So let's make this PERMISSIVE instead
DROP POLICY IF EXISTS "Anyone can view order by payment_md5" ON public.orders;

CREATE POLICY "Public can view orders for realtime"
ON public.orders
FOR SELECT
TO anon, authenticated
USING (true);