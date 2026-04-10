-- Drop existing restrictive policies on banners
DROP POLICY IF EXISTS "Authenticated users can insert banners" ON public.banners;
DROP POLICY IF EXISTS "Authenticated users can update banners" ON public.banners;
DROP POLICY IF EXISTS "Authenticated users can delete banners" ON public.banners;

-- Create public write policies for banners
CREATE POLICY "Anyone can insert banners" ON public.banners FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update banners" ON public.banners FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Anyone can delete banners" ON public.banners FOR DELETE TO anon, authenticated USING (true);

-- Drop existing restrictive policies on metal_prices
DROP POLICY IF EXISTS "Authenticated users can insert prices" ON public.metal_prices;
DROP POLICY IF EXISTS "Authenticated users can update prices" ON public.metal_prices;

-- Create public write policies for metal_prices
CREATE POLICY "Anyone can insert prices" ON public.metal_prices FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update prices" ON public.metal_prices FOR UPDATE TO anon, authenticated USING (true);