
-- Update constraint to allow new app types
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS products_app_check;
ALTER TABLE public.products ADD CONSTRAINT products_app_check 
  CHECK (app IN ('spotify', 'youtube', 'capcut', 'alight', 'discord', 'netflix', 'chatgpt', 'gemini'));

-- Insert cheap 14-day warranty accounts
INSERT INTO public.products (name, description, long_description, price, original_price, app, category, duration, duration_months, stock, is_active) VALUES
-- CapCut Pro
('CapCut Pro - 14 Days', 'Cheap CapCut Pro account with 14-day warranty', 'Budget-friendly CapCut Pro access. Remove watermarks, access premium effects and templates. 14-day warranty included.', 1.50, 3.00, 'capcut', 'account', '14 Days', 0, 50, true),

-- Netflix
('Netflix 14 Days - 480p', 'Cheap Netflix 480p account with 14-day warranty', 'Budget Netflix access at 480p quality. Perfect for mobile viewing. 14-day warranty.', 2.00, 4.50, 'netflix', 'account', '14 Days', 0, 50, true),
('Netflix 14 Days - 720p', 'Cheap Netflix 720p account with 14-day warranty', 'Netflix HD 720p quality. Great for tablets and small screens. 14-day warranty.', 3.00, 6.50, 'netflix', 'account', '14 Days', 0, 50, true),
('Netflix 14 Days - 1080p', 'Cheap Netflix 1080p account with 14-day warranty', 'Netflix Full HD 1080p quality. Perfect for most screens. 14-day warranty.', 4.00, 8.50, 'netflix', 'account', '14 Days', 0, 50, true),

-- Spotify
('Spotify Premium - 14 Days', 'Cheap Spotify Premium account with 14-day warranty', 'Budget Spotify Premium access. Ad-free music, unlimited skips, offline downloads. 14-day warranty.', 1.50, 3.50, 'spotify', 'account', '14 Days', 0, 50, true),

-- ChatGPT Plus
('ChatGPT Plus - 14 Days', 'Cheap ChatGPT Plus account with 14-day warranty', 'Access GPT-4, DALL-E, Advanced Data Analysis and more. Budget-friendly with 14-day warranty.', 5.00, 10.00, 'chatgpt', 'account', '14 Days', 0, 50, true),

-- Gemini AI
('Gemini Advanced - 14 Days', 'Cheap Gemini Advanced account with 14-day warranty', 'Access Gemini Ultra model, extended conversations, and Google One integration. 14-day warranty.', 4.50, 9.00, 'gemini', 'account', '14 Days', 0, 50, true),

-- YouTube Premium
('YouTube Premium - 14 Days', 'Cheap YouTube Premium account with 14-day warranty', 'Ad-free videos, background play, YouTube Music included. Budget-friendly with 14-day warranty.', 2.00, 4.50, 'youtube', 'account', '14 Days', 0, 50, true);
