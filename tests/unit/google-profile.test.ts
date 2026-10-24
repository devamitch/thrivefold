import { ageBandFor, ageOn, birthDateFromPeople, factsFromPeople, suggestedExperience } from '../../src/domain/account/googleProfile';

const TODAY = new Date(2026, 9, 24); // 24 Oct 2026, local time

describe('Google profile facts', () => {
  test('age counts the birthday only once it has passed this year', () => {
    expect(ageOn({ year: 1990, month: 10, day: 24 }, TODAY)).toBe(36);
    expect(ageOn({ year: 1990, month: 10, day: 25 }, TODAY)).toBe(35);
    expect(ageOn({ year: 2008, month: 10, day: 25 }, TODAY)).toBe(17);
  });

  test('reads the primary birthday with a year and the primary gender', () => {
    const facts = factsFromPeople(
      {
        birthdays: [
          { date: { month: 3, day: 9 }, metadata: { primary: true } },
          { date: { year: 1992, month: 3, day: 9 } },
        ],
        genders: [{ value: 'female', formattedValue: 'Female', metadata: { primary: true } }],
      },
      TODAY,
    );
    expect(facts).toEqual({ age: 34, birthYear: 1992, gender: 'Female' });
  });

  test('missing or unspecified values stay null instead of being guessed', () => {
    expect(factsFromPeople({}, TODAY)).toEqual({ age: null, birthYear: null, gender: null });
    expect(factsFromPeople({ genders: [{ value: 'unspecified' }] }, TODAY).gender).toBeNull();
    expect(factsFromPeople({ genders: [{ value: 'non-binary', formattedValue: 'Non-binary' }] }, TODAY).gender).toBe('Non-binary');
  });

  test('bands and the suggested starting experience', () => {
    expect(ageBandFor(17)).toBe('under_18');
    expect(ageBandFor(34)).toBe('25_34');
    expect(ageBandFor(null)).toBeNull();
    expect(suggestedExperience('Female')).toBe('women_health');
    expect(suggestedExperience('Male')).toBe('men_health');
    expect(suggestedExperience('Non-binary')).toBeNull();
  });
});

describe('birth date from Google', () => {
  test('a lone birth year is never padded into a date', () => {
    expect(birthDateFromPeople({ birthdays: [{ date: { year: 1995 } }] })).toBeNull();
    expect(birthDateFromPeople({ birthdays: [{ date: { year: 1995, month: 3, day: 7 } }] })).toBe('1995-03-07');
    expect(birthDateFromPeople({})).toBeNull();
  });
});
