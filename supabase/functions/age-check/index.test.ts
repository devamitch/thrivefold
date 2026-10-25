import { assertEquals } from 'jsr:@std/assert@1';
import { isAdult } from './age.ts';

const on = (iso: string) => new Date(`${iso}T12:00:00Z`);

Deno.test('18th birthday today counts as adult', () => assertEquals(isAdult('2008-10-25', on('2026-10-25')), true));
Deno.test('day before 18th birthday is not adult', () => assertEquals(isAdult('2008-10-26', on('2026-10-25')), false));
Deno.test('birthday later in the year is not yet adult', () => assertEquals(isAdult('2008-12-01', on('2026-10-25')), false));
Deno.test('missing or malformed date gives no answer', () => {
  assertEquals(isAdult(null), null);
  assertEquals(isAdult('25/10/2000'), null);
});
