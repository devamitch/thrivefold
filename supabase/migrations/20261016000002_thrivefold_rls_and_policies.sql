-- ============================================================================
-- Thrivefold: Row Level Security (RLS) & Deny-by-Default Policies
-- ============================================================================

-- Enable RLS across all tables
ALTER TABLE public.thrivefold_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thrivefold_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thrivefold_social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thrivefold_chip_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thrivefold_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thrivefold_communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thrivefold_community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thrivefold_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thrivefold_safety_reports ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: only user accesses own profile
CREATE POLICY "Users read own profile"
  ON public.thrivefold_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own profile"
  ON public.thrivefold_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own profile"
  ON public.thrivefold_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 2. Consents: user accesses own consent records
CREATE POLICY "Users read own consents"
  ON public.thrivefold_consents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own consents"
  ON public.thrivefold_consents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 3. Social Profiles: public read of pseudonymous profiles, user update own
CREATE POLICY "Anyone authenticated can view social profiles"
  ON public.thrivefold_social_profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users update own social profile"
  ON public.thrivefold_social_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own social profile"
  ON public.thrivefold_social_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Chip Catalog: read-only for authenticated clients
CREATE POLICY "Anyone authenticated reads active chips"
  ON public.thrivefold_chip_catalog FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- 5. Letters: only sender or recipient can view, sender can insert, recipient can update status (e.g. opened)
CREATE POLICY "Sender or recipient can view letters"
  ON public.thrivefold_letters FOR SELECT
  USING (
    (auth.uid() = sender_id OR auth.uid() = recipient_id)
    AND NOT EXISTS (
      SELECT 1 FROM public.thrivefold_blocks b
      WHERE (b.user_id = auth.uid() AND b.blocked_user_id = sender_id)
         OR (b.user_id = auth.uid() AND b.blocked_user_id = recipient_id)
    )
  );

CREATE POLICY "Sender can insert letters"
  ON public.thrivefold_letters FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND NOT EXISTS (
      SELECT 1 FROM public.thrivefold_blocks b
      WHERE (b.user_id = recipient_id AND b.blocked_user_id = auth.uid())
         OR (b.user_id = auth.uid() AND b.blocked_user_id = recipient_id)
    )
  );

CREATE POLICY "Recipient can update letter status"
  ON public.thrivefold_letters FOR UPDATE
  USING (auth.uid() = recipient_id);

-- 6. Communities: only active members can view community details
CREATE POLICY "Active members can view community"
  ON public.thrivefold_communities FOR SELECT
  USING (
    NOT is_private
    OR EXISTS (
      SELECT 1 FROM public.thrivefold_community_memberships m
      WHERE m.community_id = id AND m.user_id = auth.uid() AND m.status = 'active'
    )
  );

CREATE POLICY "Members view their memberships"
  ON public.thrivefold_community_memberships FOR SELECT
  USING (auth.uid() = user_id);

-- 7. Blocks: users manage own blocks
CREATE POLICY "Users view own block list"
  ON public.thrivefold_blocks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own blocks"
  ON public.thrivefold_blocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own blocks"
  ON public.thrivefold_blocks FOR DELETE
  USING (auth.uid() = user_id);

-- 8. Safety Reports: users submit reports
CREATE POLICY "Users view own submitted reports"
  ON public.thrivefold_safety_reports FOR SELECT
  USING (auth.uid() = reporter_id);

CREATE POLICY "Users insert safety reports"
  ON public.thrivefold_safety_reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);
