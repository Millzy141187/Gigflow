-- GigFlow Seed/Demo Data
-- Run this after the schema migration to generate demo data for a test user
-- Replace 'USER_UUID_HERE' with the actual user UUID

-- Demo Buckets
INSERT INTO public.buckets (user_id, name, type, target_amount, current_amount, allocation_percent, color, icon) VALUES
  ('USER_UUID_HERE', 'Taxes', 'taxes', 5000, 1250, 30, '#ef4444', 'receipt'),
  ('USER_UUID_HERE', 'Emergency Fund', 'emergency', 3000, 1800, 20, '#f59e0b', 'shield'),
  ('USER_UUID_HERE', 'Business Growth', 'growth', 2000, 600, 15, '#8b5cf6', 'trending-up'),
  ('USER_UUID_HERE', 'Living Expenses', 'living', 4000, 2800, 25, '#10b981', 'home'),
  ('USER_UUID_HERE', 'Fun Money', 'fun', 1000, 400, 10, '#ec4899', 'sparkles');

-- Demo Transactions (last 60 days)
INSERT INTO public.transactions (user_id, type, amount, category, description, source, date, deductible) VALUES
  ('USER_UUID_HERE', 'income', 2500, 'freelance', 'Website redesign - Acme Corp', 'Acme Corp', NOW() - INTERVAL '2 days', false),
  ('USER_UUID_HERE', 'income', 1800, 'freelance', 'Logo design - StartupX', 'StartupX', NOW() - INTERVAL '7 days', false),
  ('USER_UUID_HERE', 'expense', 450, 'software', 'Adobe Creative Cloud', NULL, NOW() - INTERVAL '3 days', true),
  ('USER_UUID_HERE', 'expense', 1200, 'rent', 'Monthly rent', NULL, NOW() - INTERVAL '5 days', false),
  ('USER_UUID_HERE', 'income', 3200, 'consulting', 'UX audit - TechCorp', 'TechCorp', NOW() - INTERVAL '14 days', false),
  ('USER_UUID_HERE', 'expense', 89, 'utilities', 'Internet bill', NULL, NOW() - INTERVAL '10 days', true),
  ('USER_UUID_HERE', 'expense', 65, 'food', 'Grocery shopping', NULL, NOW() - INTERVAL '8 days', false),
  ('USER_UUID_HERE', 'income', 900, 'freelance', 'Social media graphics', 'LocalBakery', NOW() - INTERVAL '21 days', false),
  ('USER_UUID_HERE', 'expense', 200, 'healthcare', 'Health insurance', NULL, NOW() - INTERVAL '15 days', true),
  ('USER_UUID_HERE', 'expense', 150, 'transportation', 'Gas', NULL, NOW() - INTERVAL '12 days', false),
  ('USER_UUID_HERE', 'income', 4200, 'freelance', 'Full brand identity - LaunchPad', 'LaunchPad', NOW() - INTERVAL '28 days', false),
  ('USER_UUID_HERE', 'expense', 300, 'software', 'Figma + Notion annual', NULL, NOW() - INTERVAL '25 days', true),
  ('USER_UUID_HERE', 'expense', 35, 'entertainment', 'Netflix subscription', NULL, NOW() - INTERVAL '20 days', false),
  ('USER_UUID_HERE', 'expense', 80, 'food', 'Dinner with client', NULL, NOW() - INTERVAL '18 days', false),
  ('USER_UUID_HERE', 'income', 1500, 'freelance', 'Landing page - EcoShop', 'EcoShop', NOW() - INTERVAL '35 days', false),
  ('USER_UUID_HERE', 'expense', 500, 'education', 'Online course - Advanced React', NULL, NOW() - INTERVAL '40 days', true),
  ('USER_UUID_HERE', 'income', 2800, 'consulting', 'Strategy session - FinCo', 'FinCo', NOW() - INTERVAL '45 days', false),
  ('USER_UUID_HERE', 'expense', 1100, 'rent', 'Monthly rent', NULL, NOW() - INTERVAL '35 days', false),
  ('USER_UUID_HERE', 'expense', 55, 'utilities', 'Phone bill', NULL, NOW() - INTERVAL '30 days', true),
  ('USER_UUID_HERE', 'income', 2000, 'freelance', 'Email templates - MailGen', 'MailGen', NOW() - INTERVAL '55 days', false);

-- Demo Gigs (upcoming pipeline)
INSERT INTO public.gigs (user_id, title, client, expected_amount, expected_date, probability, status) VALUES
  ('USER_UUID_HERE', 'Mobile app UI design', 'AppNova', 5000, NOW() + INTERVAL '14 days', 'confirmed', 'upcoming'),
  ('USER_UUID_HERE', 'Website maintenance retainer', 'Acme Corp', 1500, NOW() + INTERVAL '30 days', 'likely', 'upcoming'),
  ('USER_UUID_HERE', 'Brand refresh project', 'LocalCafe', 3000, NOW() + INTERVAL '21 days', 'possible', 'upcoming'),
  ('USER_UUID_HERE', 'Illustration series', 'PubHouse', 2000, NOW() + INTERVAL '45 days', 'speculative', 'upcoming'),
  ('USER_UUID_HERE', 'SEO audit', 'GrowthLabs', 800, NOW() + INTERVAL '7 days', 'confirmed', 'in-progress');

