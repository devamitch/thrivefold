-- ============================================================================
-- Thrivefold: Core Database Schema (PostgreSQL / Supabase)
-- ============================================================================

-- 1. Profiles & Account Preferences
CREATE TABLE IF NOT EXISTS public.thrivefold_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  pseudonym TEXT NOT NULL,
  avatar_seed TEXT DEFAULT 'seed_default',
  experience TEXT NOT NULL DEFAULT 'women_health',
  age_band TEXT NOT NULL DEFAULT '25_29',
  is_age_verified BOOLEAN NOT NULL DEFAULT false,
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT true,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '07:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Consents
CREATE TABLE IF NOT EXISTS public.thrivefold_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature_id TEXT NOT NULL,
  version TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'granted',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

-- 3. Social Profiles (Decoupled from legal identity)
CREATE TABLE IF NOT EXISTS public.thrivefold_social_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  pseudonym TEXT NOT NULL,
  avatar_seed TEXT NOT NULL,
  coarse_region TEXT NOT NULL,
  languages TEXT[] NOT NULL DEFAULT '{"English"}',
  interests TEXT[] NOT NULL DEFAULT '{}',
  bio_template TEXT,
  accepts_introductions BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Chip Catalog (Canonical Versioned Chip Registry)
CREATE TABLE IF NOT EXISTS public.thrivefold_chip_catalog (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  text TEXT NOT NULL,
  subtext TEXT,
  risk_class TEXT NOT NULL DEFAULT 'safe',
  is_active BOOLEAN NOT NULL DEFAULT true,
  version TEXT NOT NULL DEFAULT '2026.10.16-v1'
);

-- 5. Slowly-Inspired Letters & Distance-Delayed Delivery Jobs
CREATE TABLE IF NOT EXISTS public.thrivefold_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stamp_id TEXT NOT NULL,
  chip_ids TEXT[] NOT NULL,
  assembled_body TEXT NOT NULL,
  distance_km_approx INTEGER NOT NULL DEFAULT 500,
  transit_hours INTEGER NOT NULL DEFAULT 3,
  status TEXT NOT NULL DEFAULT 'in_transit', -- in_transit, delivered, opened, declined, cancelled
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  scheduled_delivery_at TIMESTAMPTZ NOT NULL,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ
);

-- 6. Communities (Segmented Namespaces)
CREATE TABLE IF NOT EXISTS public.thrivefold_communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- women_wellbeing, men_wellbeing, pride_wellbeing, topic_support
  purpose TEXT NOT NULL,
  is_private BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.thrivefold_community_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.thrivefold_communities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, facilitator, member
  status TEXT NOT NULL DEFAULT 'active',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- 7. Blocks and Safety Reports
CREATE TABLE IF NOT EXISTS public.thrivefold_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blocked_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, blocked_user_id)
);

CREATE TABLE IF NOT EXISTS public.thrivefold_safety_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category TEXT NOT NULL,
  evidence_summary TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted', -- submitted, under_review, resolved
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
