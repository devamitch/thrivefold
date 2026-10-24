/**
 * Turns the Google People API response into what Thrivefold shows for confirmation. These
 * values are what the person entered in their Google account; they are shown back to them,
 * never inferred, and never count as age verification.
 */

export interface GooglePeopleResponse {
  birthdays?: {
    date?: { year?: number; month?: number; day?: number };
    metadata?: { primary?: boolean };
  }[];
  genders?: { value?: string; formattedValue?: string; metadata?: { primary?: boolean } }[];
}

export interface ProfileFacts {
  /** Whole years, or null when Google has no birthday with a year. */
  age: number | null;
  birthYear: number | null;
  /** Full YYYY-MM-DD string if returned, otherwise null. */
  birthDateString?: string | null;
  /** Display text such as "Female", "Male" or a custom value; null when not shared. */
  gender: string | null;
}

export function ageOn(birth: { year: number; month?: number; day?: number }, today: Date): number {
  let age = today.getFullYear() - birth.year;
  const m = birth.month ?? 1;
  const d = birth.day ?? 1;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age -= 1;
  return age;
}

export function birthDateFromPeople(res: GooglePeopleResponse): string | null {
  const withYear = (res.birthdays ?? []).filter((b) => b.date?.year);
  const birthday = withYear.find((b) => b.metadata?.primary) ?? withYear[0];
  const year = birthday?.date?.year ?? null;
  const month = birthday?.date?.month ?? null;
  const day = birthday?.date?.day ?? null;
  // Only a complete date is a birthday; a lone year is never padded into one.
  if (year && month && day) {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return null;
}

export function factsFromPeople(res: GooglePeopleResponse, today = new Date()): ProfileFacts {
  // Prefer the primary birthday that includes a year (some entries are month/day only).
  const withYear = (res.birthdays ?? []).filter((b) => b.date?.year);
  const birthday = withYear.find((b) => b.metadata?.primary) ?? withYear[0];
  const year = birthday?.date?.year ?? null;
  const month = birthday?.date?.month ?? null;
  const day = birthday?.date?.day ?? null;
  const age = year
    ? ageOn({ year, month: month ?? undefined, day: day ?? undefined }, today)
    : null;

  const genderEntry = (res.genders ?? []).find((g) => g.metadata?.primary) ?? res.genders?.[0];
  const raw = genderEntry?.formattedValue || genderEntry?.value || null;
  const gender =
    raw && raw.toLowerCase() !== 'unspecified' ? raw.charAt(0).toUpperCase() + raw.slice(1) : null;

  return {
    age: age !== null && age >= 0 && age < 130 ? age : null,
    birthYear: year,
    gender,
  };
}

/** Coarse band shown on the profile; matches the catalog's age-band values. */
export function ageBandFor(age: number | null): string | null {
  if (age === null) return null;
  if (age < 18) return 'under_18';
  if (age < 25) return '18_24';
  if (age < 35) return '25_34';
  if (age < 45) return '35_44';
  if (age < 55) return '45_54';
  if (age < 65) return '55_64';
  return '65_plus';
}

/** A suggested starting experience; the person can change it on the next screen. */
export function suggestedExperience(gender: string | null): 'women_health' | 'men_health' | null {
  const g = gender?.toLowerCase();
  if (g === 'female') return 'women_health';
  if (g === 'male') return 'men_health';
  return null;
}
