-- Thrivefold migration 22: body numbers and home address on the person's own profile.
-- Height and weight make BMI and calorie estimates fit the person; the home address is used only
-- to suggest walks and outings near home. Owner-only like the rest of the row.
alter table public.thrivefold_personal_profiles
  add column if not exists height_cm smallint check (height_cm between 100 and 250),
  add column if not exists weight_kg numeric(5,1) check (weight_kg between 25 and 350),
  add column if not exists home_address text check (char_length(home_address) <= 200);
