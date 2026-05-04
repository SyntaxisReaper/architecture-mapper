-- ============================================================
-- Architecture Mapper — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── users_profile ─────────────────────────────────────────
-- Extends Supabase auth.users with app-specific preferences
CREATE TABLE IF NOT EXISTS public.users_profile (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT,
  display_name  TEXT,
  preferred_project_type TEXT DEFAULT 'SaaS Web App',
  preferred_scale        TEXT DEFAULT 'Medium (1K–100K users)',
  total_generated        INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── architectures ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.architectures (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  project_type  TEXT NOT NULL,
  scale         TEXT NOT NULL,
  json_data     JSONB NOT NULL,
  version       INTEGER DEFAULT 1,
  prompt_version TEXT DEFAULT 'v1',
  is_public     BOOLEAN DEFAULT FALSE,
  share_slug    TEXT UNIQUE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── feedback_log ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.feedback_log (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  arch_id       UUID REFERENCES public.architectures(id) ON DELETE CASCADE,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message       TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Indexes ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_architectures_user_id ON public.architectures(user_id);
CREATE INDEX IF NOT EXISTS idx_architectures_share_slug ON public.architectures(share_slug);
CREATE INDEX IF NOT EXISTS idx_feedback_log_arch_id ON public.feedback_log(arch_id);
CREATE INDEX IF NOT EXISTS idx_feedback_log_user_id ON public.feedback_log(user_id);

-- ── Updated_at trigger ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER architectures_updated_at
  BEFORE UPDATE ON public.architectures
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER users_profile_updated_at
  BEFORE UPDATE ON public.users_profile
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ── Auto-create profile on signup ─────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_profile (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Row Level Security (RLS) ──────────────────────────────
ALTER TABLE public.users_profile   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.architectures   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_log    ENABLE ROW LEVEL SECURITY;

-- users_profile policies
CREATE POLICY "Users can view own profile"
  ON public.users_profile FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users_profile FOR UPDATE
  USING (auth.uid() = id);

-- architectures policies
CREATE POLICY "Users can view own architectures"
  ON public.architectures FOR SELECT
  USING (auth.uid() = user_id OR is_public = TRUE);

CREATE POLICY "Users can insert own architectures"
  ON public.architectures FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own architectures"
  ON public.architectures FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own architectures"
  ON public.architectures FOR DELETE
  USING (auth.uid() = user_id);

-- feedback_log policies
CREATE POLICY "Users can view own feedback"
  ON public.feedback_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback"
  ON public.feedback_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);
