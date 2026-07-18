-- GigFlow Database Schema for Supabase
-- Run this in the Supabase SQL Editor: https://supabase.com/dashboard/project/lajiilziyspjcidmucyy/sql/new

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  income_sources TEXT[] DEFAULT '{}',
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'uncategorized',
  description TEXT NOT NULL DEFAULT '',
  source TEXT,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deductible BOOLEAN DEFAULT false,
  bucket_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- ============================================================
-- BUCKETS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.buckets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'custom' CHECK (type IN ('taxes', 'emergency', 'growth', 'living', 'fun', 'custom')),
  target_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  current_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  allocation_percent INTEGER NOT NULL DEFAULT 10,
  color TEXT NOT NULL DEFAULT '#10b981',
  icon TEXT NOT NULL DEFAULT 'folder',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_buckets_user_id ON buckets(user_id);

-- ============================================================
-- GIGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.gigs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  client TEXT NOT NULL DEFAULT 'Unknown',
  expected_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  expected_date TIMESTAMPTZ,
  probability TEXT NOT NULL DEFAULT 'likely' CHECK (probability IN ('confirmed', 'likely', 'possible', 'speculative')),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in-progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gigs_user_id ON gigs(user_id);
CREATE INDEX IF NOT EXISTS idx_gigs_expected_date ON gigs(expected_date);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gigs ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Transactions: users can only access their own
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Buckets: users can only access their own
CREATE POLICY "Users can view own buckets" ON public.buckets
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own buckets" ON public.buckets
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own buckets" ON public.buckets
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own buckets" ON public.buckets
  FOR DELETE USING (auth.uid() = user_id);

-- Gigs: users can only access their own
CREATE POLICY "Users can view own gigs" ON public.gigs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gigs" ON public.gigs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gigs" ON public.gigs
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own gigs" ON public.gigs
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- ENABLE REALTIME (optional, for live updates)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

