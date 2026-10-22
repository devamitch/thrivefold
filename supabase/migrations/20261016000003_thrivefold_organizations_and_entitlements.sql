-- ============================================================================
-- Thrivefold: Organizations, Entitlements, Community Events & Stamps Schema
-- Migration: 20261016000003_thrivefold_organizations_and_entitlements.sql
-- ============================================================================

-- 1. Organizations (Accredited NGOs, Healthcare Clinics, Corporate Wellness)
CREATE TABLE IF NOT EXISTS public.thrivefold_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  org_type TEXT NOT NULL DEFAULT 'clinic', -- clinic, ngo, enterprise, research
  description TEXT,
  domain TEXT,
  contact_email TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  verification_tier TEXT NOT NULL DEFAULT 'standard', -- standard, accredited, sovereign
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Organization Members & Staff Rosters
CREATE TABLE IF NOT EXISTS public.thrivefold_organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.thrivefold_organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'member', -- owner, admin, clinician, moderator, member
  title TEXT,
  permissions TEXT[] NOT NULL DEFAULT '{"read"}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- 3. Community Events & Moderated Group Gatherings
CREATE TABLE IF NOT EXISTS public.thrivefold_community_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.thrivefold_communities(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'mindful_reflection', -- mindful_reflection, support_circle, expert_qa
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  max_participants INTEGER DEFAULT 50,
  is_cancelled BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Postal Stamps Catalog (Slowly-inspired collectible postal stamps)
CREATE TABLE IF NOT EXISTS public.thrivefold_stamps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'heritage', -- heritage, seasonal, milestone, botanical, constellation
  rarity TEXT NOT NULL DEFAULT 'common', -- common, uncommon, rare, commemorative
  icon_name TEXT NOT NULL DEFAULT 'lotus',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. User Stamp Collections
CREATE TABLE IF NOT EXISTS public.thrivefold_user_stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stamp_id TEXT REFERENCES public.thrivefold_stamps(id) ON DELETE CASCADE NOT NULL,
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, stamp_id)
);

-- 6. Entitlements & Subscriptions (Server-authoritative feature gating)
CREATE TABLE IF NOT EXISTS public.thrivefold_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id TEXT NOT NULL DEFAULT 'free_tier', -- free_tier, supporter, sovereign_plus, enterprise_sponsored
  status TEXT NOT NULL DEFAULT 'active', -- active, grace_period, expired, cancelled
  source TEXT NOT NULL DEFAULT 'store', -- store, direct, org_sponsored
  organization_id UUID REFERENCES public.thrivefold_organizations(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Credit Ledger (Deterministic ledger for stamp acquisitions & deliveries)
CREATE TABLE IF NOT EXISTS public.thrivefold_credit_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL, -- positive for credits granted, negative for debits
  balance_after INTEGER NOT NULL,
  reason TEXT NOT NULL, -- daily_allowance, letter_sent, stamp_purchase, streak_reward
  reference_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- Row Level Security (RLS) Configuration & Policies
-- ============================================================================

ALTER TABLE public.thrivefold_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thrivefold_organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thrivefold_community_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thrivefold_stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thrivefold_user_stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thrivefold_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thrivefold_credit_ledger ENABLE ROW LEVEL SECURITY;

-- Organizations: Verified orgs are viewable by all authenticated users
CREATE POLICY "Organizations are viewable by authenticated users"
  ON public.thrivefold_organizations FOR SELECT
  TO authenticated
  USING (is_verified = true OR auth.uid() IN (
    SELECT user_id FROM public.thrivefold_organization_members WHERE organization_id = id
  ));

-- Organization Members: Members can view fellow members of their organization
CREATE POLICY "Organization members viewable by org colleagues"
  ON public.thrivefold_organization_members FOR SELECT
  TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM public.thrivefold_organization_members WHERE user_id = auth.uid()
  ));

-- Community Events: Viewable by members of that community
CREATE POLICY "Community events viewable by members"
  ON public.thrivefold_community_events FOR SELECT
  TO authenticated
  USING (community_id IN (
    SELECT community_id FROM public.thrivefold_community_memberships WHERE user_id = auth.uid() AND status = 'active'
  ));

-- Stamps Catalog: Readable by everyone
CREATE POLICY "Stamps catalog is public to authenticated users"
  ON public.thrivefold_stamps FOR SELECT
  TO authenticated
  USING (is_active = true);

-- User Stamps: Users manage and view only their own stamp inventory
CREATE POLICY "Users read own stamp collection"
  ON public.thrivefold_user_stamps FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users insert into own stamp collection"
  ON public.thrivefold_user_stamps FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Entitlements: Users read their own entitlements
CREATE POLICY "Users read own entitlements"
  ON public.thrivefold_entitlements FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Credit Ledger: Users view their own audit trail
CREATE POLICY "Users read own credit transactions"
  ON public.thrivefold_credit_ledger FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
