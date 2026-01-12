-- Create profiles table for users
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  telegram_username TEXT,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  email_verified BOOLEAN DEFAULT FALSE,
  verification_token TEXT,
  verification_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  app TEXT NOT NULL CHECK (app IN ('spotify', 'youtube', 'capcut', 'alight', 'discord')),
  category TEXT NOT NULL CHECK (category IN ('account', 'topup', 'code')),
  duration TEXT,
  duration_months INTEGER,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  guest_name TEXT,
  guest_telegram TEXT NOT NULL,
  guest_email TEXT,
  guest_notes TEXT,
  account_email TEXT,
  account_password TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  coupon_code TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'completed', 'failed', 'cancelled')),
  payment_md5 TEXT,
  payment_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  product_app TEXT NOT NULL,
  product_category TEXT NOT NULL,
  product_duration TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create settings table for admin configs
CREATE TABLE public.settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.settings (key, value) VALUES 
  ('bakong_account', 'sin_soktep@bkrt'),
  ('merchant_name', 'K''TEPHH Kon Khmer Kamjea'),
  ('machine_id', '005927335'),
  ('khqr_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiM2VhMzg3OTRkMDJlNDZkYyJ9LCJpYXQiOjE3NjcwMDc1NDEsImV4cCI6MTc3NDc4MzU0MX0.F5iA1C3JIQxz-Zv8yZU8doIQ7efKI47XA7B_pTeIH74'),
  ('telegram_bot_token', ''),
  ('telegram_chat_id', '');

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Products policies (public read, admin write)
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage products" ON public.products FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Orders policies
CREATE POLICY "Users can view their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all orders" ON public.orders FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Order items policies
CREATE POLICY "Users can view their own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view all order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Settings policies (admin only)
CREATE POLICY "Admins can view settings" ON public.settings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update settings" ON public.settings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, telegram_username)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email,
    NEW.raw_user_meta_data ->> 'telegram_username'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample products
INSERT INTO public.products (name, description, long_description, app, category, duration, duration_months, price, original_price, stock) VALUES
('Spotify Premium', '1 Month Account - Full premium features, ad-free music', 'Experience music like never before with Spotify Premium. Enjoy unlimited ad-free listening, download music for offline playback, and get high-quality audio streaming. Skip as many tracks as you want and listen on any device.', 'spotify', 'account', '1 Month', 1, 2.69, 4.99, 50),
('Spotify Premium', '3 Months Account - Best value for short term', 'Get 3 months of uninterrupted music bliss. Perfect for those who want to try premium features without long commitment. All premium benefits included.', 'spotify', 'account', '3 Months', 3, 3.29, 8.99, 30),
('Spotify Top Up', '1 Month - Direct upgrade to your own account', 'Keep your own account with all your playlists and preferences! We will upgrade your existing Spotify account to Premium directly.', 'spotify', 'topup', '1 Month', 1, 4.99, 9.99, 100),
('Spotify Top Up', '3 Months - Save more with longer subscription', 'Upgrade your own account for 3 months. Your playlists, saved songs, and preferences stay intact.', 'spotify', 'topup', '3 Months', 3, 12.99, 24.99, 100),
('Spotify Top Up', '12 Months - Best yearly deal', 'The ultimate savings! One full year of Premium on your own account.', 'spotify', 'topup', '12 Months', 12, 39.99, 79.99, 50),
('YouTube Premium', '1 Month Account - Ad-free videos, background play', 'Watch videos without interruption, play in background, and download for offline viewing. Includes YouTube Music Premium!', 'youtube', 'account', '1 Month', 1, 2.69, 5.99, 40),
('YouTube Premium', '3 Months Account - Extended ad-free experience', 'Three months of pure, ad-free YouTube entertainment. Background play and offline downloads included.', 'youtube', 'account', '3 Months', 3, 3.29, 12.99, 25),
('YouTube Top Up', '1 Month - Direct upgrade to your account', 'Upgrade YOUR YouTube account to Premium. Keep all your subscriptions and watch history.', 'youtube', 'topup', '1 Month', 1, 5.99, 11.99, 100),
('YouTube Top Up', '3 Months - Great value package', 'Premium features on your own account for 3 months.', 'youtube', 'topup', '3 Months', 3, 14.99, 29.99, 50),
('YouTube Top Up', '12 Months - Ultimate yearly savings', 'Full year of YouTube Premium on your account!', 'youtube', 'topup', '12 Months', 12, 49.99, 99.99, 30),
('CapCut Pro', '1 Month Account - All pro editing features', 'Unlock all pro features including premium effects, transitions, fonts, and music. Remove watermarks from your videos.', 'capcut', 'account', '1 Month', 1, 2.69, 5.99, 60),
('CapCut Pro', '3 Months Account - Pro editing extended', 'Three months of professional video editing power at your fingertips.', 'capcut', 'account', '3 Months', 3, 3.29, 11.99, 40),
('Alight Motion Pro', '1 Month - Animation & motion graphics', 'Create stunning animations and motion graphics. All pro features unlocked including keyframe animation, visual effects, and more.', 'alight', 'account', '1 Month', 1, 3.50, 6.99, 45),
('Alight Motion Pro', '6 Months - Extended creative access', 'Six months of creative freedom with all pro animation tools.', 'alight', 'account', '6 Months', 6, 12.00, 24.99, 30),
('Alight Motion Pro', '12 Months - Best yearly value', 'Full year of professional animation tools. Best value for serious creators!', 'alight', 'account', '12 Months', 12, 20.00, 49.99, 25),
('Discord Nitro', '1 Month Code - Redeem instantly', 'Get Discord Nitro with HD video, custom emojis everywhere, 2 server boosts, and 100MB uploads.', 'discord', 'code', '1 Month', 1, 2.69, 4.99, 80),
('Discord Nitro', '3 Months Code - Extended Nitro benefits', 'Three months of Nitro perks. Redeem code instantly on your Discord account.', 'discord', 'code', '3 Months', 3, 3.29, 9.99, 50);