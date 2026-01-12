-- Drop and recreate policies with public role to ensure they work for anonymous users
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

-- Create policies targeting public role (includes anon)
CREATE POLICY "Guest can create orders" 
ON public.orders 
FOR INSERT 
TO public
WITH CHECK (true);

CREATE POLICY "Guest can create order items" 
ON public.order_items 
FOR INSERT 
TO public
WITH CHECK (true);

-- Also add phone number column for Bakong verification
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS guest_phone text;