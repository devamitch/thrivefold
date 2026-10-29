-- Thrivefold migration 21: remember which Terms version the person agreed to, so a new phone or a
-- reinstall does not ask again.
alter table public.thrivefold_personal_profiles
  add column if not exists terms_version text check (char_length(terms_version) <= 20);
