-- Create storage bucket for shop assets (product images, logo, profile photos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-assets', 'shop-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to shop assets
CREATE POLICY "Public can view shop assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'shop-assets');

-- Allow authenticated admins to upload shop assets
CREATE POLICY "Admins can upload shop assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'shop-assets' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Allow authenticated admins to update shop assets
CREATE POLICY "Admins can update shop assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'shop-assets' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Allow authenticated admins to delete shop assets
CREATE POLICY "Admins can delete shop assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'shop-assets' 
  AND public.has_role(auth.uid(), 'admin'::app_role)
);

-- Create wishlist table for users
CREATE TABLE IF NOT EXISTS public.wishlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

-- Users can view their own wishlist
CREATE POLICY "Users can view their own wishlist"
ON public.wishlist FOR SELECT
USING (auth.uid() = user_id);

-- Users can add to their own wishlist
CREATE POLICY "Users can add to their own wishlist"
ON public.wishlist FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete from their own wishlist
CREATE POLICY "Users can delete from their own wishlist"
ON public.wishlist FOR DELETE
USING (auth.uid() = user_id);

-- Add unique constraint to prevent duplicates
ALTER TABLE public.wishlist ADD CONSTRAINT wishlist_user_product_unique UNIQUE (user_id, product_id);

-- Add avatar_url and address fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add notes column to orders for admin notes
ALTER TABLE public.orders
ADD COLUMN IF NOT EXISTS admin_notes TEXT;