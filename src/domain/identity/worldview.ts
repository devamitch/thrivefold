/**
 * Religion, culture and worldview taxonomy (V3 §6).
 *
 * What this is: a versioned list a person can choose from, for themselves only, to get
 * observance reminders and see their own choice in their profile and export.
 * What this is not: an inference engine. Nothing here guesses anyone's beliefs from names,
 * diet, location, behaviour or AI, and no eligibility, matching or access decision reads it
 * (asserted in tests/unit/worldview.test.ts).
 *
 * Ideologies and philosophies (communism, Stoicism, ...) are a separate category from
 * religions. Not exhaustive: anyone can describe themselves in their own words.
 */

export const WORLDVIEW_TAXONOMY_VERSION = '2026-10-25.1';

export type WorldviewCategory =
  | 'religion'
  | 'tradition' // a denomination, school or community within a religion
  | 'indigenous'
  | 'spiritual'
  | 'secular'
  | 'ideology' // political or social philosophy, never a religion
  | 'philosophy';

/** Calendar observance sets in religionEngine, chosen only by the person. */
export type ObservanceSet =
  | 'islam'
  | 'hinduism'
  | 'christianity'
  | 'judaism'
  | 'buddhism'
  | 'sikhism'
  | 'jainism'
  | 'parsi'
  | 'bahai'
  | 'indigenous_earth'
  | 'secular_mindful'
  | 'universal_spiritual'
  | 'civic';

export interface WorldviewEntry {
  id: string;
  category: WorldviewCategory;
  parentId?: string;
  /** Labels by locale; `en` is always present and is the fallback. */
  labels: { en: string } & Partial<Record<string, string>>;
  /** Other names people search for, in any language or script. */
  aliases?: string[];
  observances?: ObservanceSet;
}

const e = (
  id: string,
  category: WorldviewCategory,
  en: string,
  opts: { parent?: string; aliases?: string[]; observances?: ObservanceSet; hi?: string } = {},
): WorldviewEntry => ({
  id,
  category,
  parentId: opts.parent,
  labels: opts.hi ? { en, hi: opts.hi } : { en },
  aliases: opts.aliases,
  observances: opts.observances,
});

export const WORLDVIEWS: WorldviewEntry[] = [
  // Christianity
  e('christianity', 'religion', 'Christianity', { aliases: ['Christian', 'ईसाई', 'Isai', 'Masihi'], observances: 'christianity', hi: 'ईसाई धर्म' }),
  e('christianity.catholic', 'tradition', 'Catholic', { parent: 'christianity', aliases: ['Roman Catholic', 'Syro-Malabar', 'Syro-Malankara', 'Latin Catholic'] }),
  e('christianity.orthodox', 'tradition', 'Eastern Orthodox', { parent: 'christianity', aliases: ['Greek Orthodox', 'Russian Orthodox', 'Orthodox Christian'] }),
  e('christianity.oriental_orthodox', 'tradition', 'Oriental Orthodox', { parent: 'christianity', aliases: ['Coptic', 'Ethiopian Orthodox', 'Armenian Apostolic', 'Malankara Orthodox', 'Jacobite'] }),
  e('christianity.protestant', 'tradition', 'Protestant', { parent: 'christianity', aliases: ['Lutheran', 'Methodist', 'Baptist', 'Presbyterian', 'Reformed', 'Church of South India', 'Church of North India'] }),
  e('christianity.anglican', 'tradition', 'Anglican / Episcopal', { parent: 'christianity', aliases: ['Church of England', 'Episcopalian'] }),
  e('christianity.evangelical', 'tradition', 'Evangelical / Pentecostal', { parent: 'christianity', aliases: ['Pentecostal', 'Charismatic', 'Born again'] }),
  e('christianity.adventist', 'tradition', 'Seventh-day Adventist', { parent: 'christianity', aliases: ['Adventist'] }),
  e('christianity.lds', 'tradition', 'Latter-day Saints', { parent: 'christianity', aliases: ['Mormon', 'LDS'] }),
  e('christianity.quaker', 'tradition', 'Quaker (Friends)', { parent: 'christianity', aliases: ['Religious Society of Friends'] }),
  // Islam
  e('islam', 'religion', 'Islam', { aliases: ['Muslim', 'Moslem', 'इस्लाम', 'مسلم', 'Musalman'], observances: 'islam', hi: 'इस्लाम' }),
  e('islam.sunni', 'tradition', 'Sunni', { parent: 'islam', aliases: ['Hanafi', 'Shafii', 'Maliki', 'Hanbali', 'Barelvi', 'Deobandi', 'Salafi'] }),
  e('islam.shia', 'tradition', 'Shia', { parent: 'islam', aliases: ['Shiite', 'Twelver', 'Ithna Ashari', 'Bohra', 'Dawoodi Bohra'] }),
  e('islam.ismaili', 'tradition', 'Ismaili', { parent: 'islam', aliases: ['Nizari', 'Khoja'] }),
  e('islam.sufi', 'tradition', 'Sufi', { parent: 'islam', aliases: ['Sufism', 'Tasawwuf'] }),
  e('islam.ahmadiyya', 'tradition', 'Ahmadiyya', { parent: 'islam', aliases: ['Ahmadi'] }),
  e('islam.ibadi', 'tradition', 'Ibadi', { parent: 'islam' }),
  // Hindu traditions
  e('hinduism', 'religion', 'Hindu traditions', { aliases: ['Hindu', 'Hinduism', 'Sanatan', 'Sanatana Dharma', 'हिंदू', 'सनातन'], observances: 'hinduism', hi: 'हिंदू धर्म' }),
  e('hinduism.vaishnava', 'tradition', 'Vaishnava', { parent: 'hinduism', aliases: ['Vaishnavism', 'ISKCON', 'Hare Krishna', 'Swaminarayan', 'Sri Vaishnava'] }),
  e('hinduism.shaiva', 'tradition', 'Shaiva', { parent: 'hinduism', aliases: ['Shaivism', 'Lingayat', 'Veerashaiva', 'Kashmir Shaivism'] }),
  e('hinduism.shakta', 'tradition', 'Shakta', { parent: 'hinduism', aliases: ['Shaktism', 'Devi worship'] }),
  e('hinduism.smarta', 'tradition', 'Smarta', { parent: 'hinduism', aliases: ['Advaita'] }),
  e('hinduism.arya_samaj', 'tradition', 'Arya Samaj', { parent: 'hinduism' }),
  e('hinduism.brahmo', 'tradition', 'Brahmo Samaj', { parent: 'hinduism' }),
  // Buddhism
  e('buddhism', 'religion', 'Buddhism', { aliases: ['Buddhist', 'बौद्ध', 'Bauddh'], observances: 'buddhism', hi: 'बौद्ध धर्म' }),
  e('buddhism.theravada', 'tradition', 'Theravada', { parent: 'buddhism' }),
  e('buddhism.mahayana', 'tradition', 'Mahayana', { parent: 'buddhism', aliases: ['Pure Land', 'Nichiren', 'Chan'] }),
  e('buddhism.vajrayana', 'tradition', 'Vajrayana / Tibetan', { parent: 'buddhism', aliases: ['Tibetan Buddhism'] }),
  e('buddhism.zen', 'tradition', 'Zen', { parent: 'buddhism' }),
  e('buddhism.navayana', 'tradition', 'Navayana (Ambedkarite)', { parent: 'buddhism', aliases: ['Ambedkarite Buddhism', 'Neo-Buddhism'] }),
  // Jainism
  e('jainism', 'religion', 'Jainism', { aliases: ['Jain', 'जैन'], observances: 'jainism', hi: 'जैन धर्म' }),
  e('jainism.digambara', 'tradition', 'Digambara', { parent: 'jainism' }),
  e('jainism.svetambara', 'tradition', 'Svetambara', { parent: 'jainism', aliases: ['Shwetambar', 'Sthanakvasi', 'Terapanth'] }),
  // Sikhism
  e('sikhism', 'religion', 'Sikhism', { aliases: ['Sikh', 'सिख', 'ਸਿੱਖ', 'Sikhi'], observances: 'sikhism', hi: 'सिख धर्म' }),
  // Zoroastrian
  e('zoroastrianism', 'religion', 'Zoroastrianism', { aliases: ['Zoroastrian', 'Zarathushti', 'Mazdayasna'], observances: 'parsi' }),
  e('zoroastrianism.parsi', 'tradition', 'Parsi', { parent: 'zoroastrianism', aliases: ['Parsee', 'पारसी'] }),
  e('zoroastrianism.irani', 'tradition', 'Irani', { parent: 'zoroastrianism' }),
  // Judaism
  e('judaism', 'religion', 'Judaism', { aliases: ['Jewish', 'Jew', 'यहूदी'], observances: 'judaism', hi: 'यहूदी धर्म' }),
  e('judaism.orthodox', 'tradition', 'Orthodox', { parent: 'judaism', aliases: ['Haredi', 'Modern Orthodox', 'Hasidic'] }),
  e('judaism.conservative', 'tradition', 'Conservative / Masorti', { parent: 'judaism', aliases: ['Masorti'] }),
  e('judaism.reform', 'tradition', 'Reform / Progressive', { parent: 'judaism', aliases: ['Liberal Judaism', 'Progressive Judaism'] }),
  e('judaism.reconstructionist', 'tradition', 'Reconstructionist', { parent: 'judaism' }),
  e('judaism.bene_israel', 'tradition', 'Bene Israel / Cochin / Baghdadi', { parent: 'judaism', aliases: ['Cochin Jews', 'Baghdadi Jews', 'Bnei Menashe'] }),
  // Other religions
  e('bahai', 'religion', 'Bahá’í Faith', { aliases: ['Bahai', "Baha'i"], observances: 'bahai' }),
  e('shinto', 'religion', 'Shinto', {}),
  e('taoism', 'religion', 'Taoism', { aliases: ['Daoism', 'Taoist'] }),
  e('chinese_folk', 'religion', 'Chinese folk religion', { aliases: ['Chinese traditional religion', 'Shenism'] }),
  e('caodaism', 'religion', 'Cao Đài', { aliases: ['Caodaism'] }),
  e('tenrikyo', 'religion', 'Tenrikyo', {}),
  e('druze', 'religion', 'Druze', { aliases: ['Druse', 'Muwahhidun'] }),
  e('yazidi', 'religion', 'Yazidi', { aliases: ['Ezidi', 'Yezidi'] }),
  e('mandaeism', 'religion', 'Mandaeism', { aliases: ['Mandaean', 'Sabian'] }),
  e('rastafari', 'religion', 'Rastafari', { aliases: ['Rastafarian'] }),
  e('ravidassia', 'religion', 'Ravidassia', { aliases: ['Ravidasia', 'Guru Ravidas'] }),
  e('kirat', 'religion', 'Kirat Mundhum', { aliases: ['Kiranti'] }),
  e('bon', 'religion', 'Bön', { aliases: ['Bon'] }),
  e('unitarian', 'religion', 'Unitarian Universalism', { aliases: ['Unitarian', 'UU'] }),
  e('pagan', 'spiritual', 'Pagan / Wicca', { aliases: ['Wicca', 'Heathenry', 'Druidry', 'Neopagan'] }),
  // Indigenous and ancestral
  e('indigenous', 'indigenous', 'Indigenous or ancestral tradition', { aliases: ['Native', 'Tribal religion', 'Adivasi', 'आदिवासी'], observances: 'indigenous_earth' }),
  e('indigenous.sarna', 'tradition', 'Sarna', { parent: 'indigenous', aliases: ['Sarnaism', 'Sari Dharam'] }),
  e('indigenous.donyi_polo', 'tradition', 'Donyi-Polo', { parent: 'indigenous', aliases: ['Donyi Poloism'] }),
  e('indigenous.sanamahi', 'tradition', 'Sanamahism', { parent: 'indigenous', aliases: ['Sanamahi', 'Meitei religion'] }),
  e('indigenous.native_american', 'tradition', 'Native American traditions', { parent: 'indigenous', aliases: ['First Nations', 'American Indian', 'Native American Church'] }),
  e('indigenous.aboriginal', 'tradition', 'Aboriginal and Torres Strait Islander traditions', { parent: 'indigenous', aliases: ['Dreaming', 'Dreamtime'] }),
  e('indigenous.maori', 'tradition', 'Māori traditions', { parent: 'indigenous', aliases: ['Maori', 'Tikanga'] }),
  e('indigenous.african', 'tradition', 'African traditional religions', { parent: 'indigenous', aliases: ['Yoruba', 'Ifá', 'Ifa', 'Vodun', 'Vodou', 'Akan', 'Zulu traditional'] }),
  e('indigenous.afro_diasporic', 'tradition', 'Afro-diasporic religions', { parent: 'indigenous', aliases: ['Santería', 'Candomblé', 'Umbanda', 'Lucumí'] }),
  e('indigenous.sami', 'tradition', 'Sámi traditions', { parent: 'indigenous', aliases: ['Sami'] }),
  // Spiritual and secular
  e('spiritual', 'spiritual', 'Spiritual but not religious', { aliases: ['SBNR', 'Spiritual'], observances: 'universal_spiritual' }),
  e('atheist', 'secular', 'Atheist', { aliases: ['Atheism', 'नास्तिक', 'Nastik'], observances: 'secular_mindful' }),
  e('agnostic', 'secular', 'Agnostic', { aliases: ['Agnosticism'], observances: 'secular_mindful' }),
  e('humanist', 'secular', 'Humanist', { aliases: ['Secular humanism', 'Humanism'], observances: 'secular_mindful' }),
  e('none', 'secular', 'No religion', { aliases: ['Nonreligious', 'None', 'Secular', 'Irreligious'], observances: 'secular_mindful' }),
  // Ideologies and philosophies: worldviews, never religions
  e('ideology.communism', 'ideology', 'Communism / Marxism', { aliases: ['Communist', 'Marxist', 'Marxism-Leninism'], observances: 'civic' }),
  e('ideology.socialism', 'ideology', 'Socialism', { aliases: ['Socialist', 'Democratic socialism', 'Social democracy'], observances: 'civic' }),
  e('ideology.gandhian', 'ideology', 'Gandhian thought', { aliases: ['Sarvodaya', 'Gandhism'] }),
  e('ideology.liberalism', 'ideology', 'Liberalism', { aliases: ['Liberal'] }),
  e('ideology.conservatism', 'ideology', 'Conservatism', { aliases: ['Conservative'] }),
  e('ideology.anarchism', 'ideology', 'Anarchism', { aliases: ['Anarchist', 'Libertarian socialism'] }),
  e('ideology.environmentalism', 'ideology', 'Environmentalism', { aliases: ['Green politics', 'Ecology'] }),
  e('philosophy.confucianism', 'philosophy', 'Confucianism', { aliases: ['Confucian'] }),
  e('philosophy.stoicism', 'philosophy', 'Stoicism', { aliases: ['Stoic'] }),
  e('philosophy.existentialism', 'philosophy', 'Existentialism', {}),
];

const BY_ID = new Map(WORLDVIEWS.map((w) => [w.id, w]));

export const CATEGORY_LABELS: Record<WorldviewCategory, string> = {
  religion: 'Religions',
  tradition: 'Traditions and denominations',
  indigenous: 'Indigenous and ancestral',
  spiritual: 'Spiritual paths',
  secular: 'Non-religious',
  ideology: 'Political and social worldviews',
  philosophy: 'Philosophies',
};

export function getWorldview(id: string): WorldviewEntry | undefined {
  return BY_ID.get(id);
}

/** Label in the person's locale, falling back to English, then to the raw id (future values). */
export function worldviewLabel(id: string, locale = 'en'): string {
  const w = BY_ID.get(id);
  if (!w) return `Unlisted (${id})`;
  const lang = locale.split('-')[0];
  return w.labels[locale] ?? w.labels[lang] ?? w.labels.en;
}

/** "Sunni (Islam)": a child entry with its parent, for lists and exports. */
export function worldviewFullLabel(id: string, locale = 'en'): string {
  const w = BY_ID.get(id);
  if (!w?.parentId) return worldviewLabel(id, locale);
  return `${worldviewLabel(id, locale)} (${worldviewLabel(w.parentId, locale)})`;
}

export function childrenOf(id: string): WorldviewEntry[] {
  return WORLDVIEWS.filter((w) => w.parentId === id);
}

const fold = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'`]/g, '')
    .toLowerCase()
    .trim();

/**
 * Search labels and aliases (diacritics and apostrophes ignored). Exact and prefix matches
 * rank first. Searching only looks things up for the person typing; it decides nothing.
 */
export function searchWorldviews(query: string, locale = 'en', limit = 20): WorldviewEntry[] {
  const q = fold(query);
  if (!q) return [];
  const scored: { w: WorldviewEntry; score: number }[] = [];
  for (const w of WORLDVIEWS) {
    const names = [...Object.values(w.labels).filter(Boolean) as string[], ...(w.aliases ?? [])].map(fold);
    let best = 0;
    for (const n of names) {
      if (n === q) best = Math.max(best, 3);
      else if (n.startsWith(q)) best = Math.max(best, 2);
      else if (n.includes(q)) best = Math.max(best, 1);
    }
    if (best > 0) scored.push({ w, score: best + (w.parentId ? 0 : 0.5) });
  }
  return scored
    .sort((a, b) => b.score - a.score || worldviewLabel(a.w.id, locale).localeCompare(worldviewLabel(b.w.id, locale)))
    .slice(0, limit)
    .map((s) => s.w);
}

// ---------------------------------------------------------------------------
// The person's own choice. Lives on the phone only; never sent to the server or analytics.
// ---------------------------------------------------------------------------

export const MAX_WORLDVIEWS = 3;
export const PREFER_NOT_TO_SAY = 'prefer_not_to_say';

export interface WorldviewProfile {
  /** Taxonomy ids, `prefer_not_to_say`, or ids from a future taxonomy version. */
  ids: string[];
  /** Their own words, if no entry fits. Plain text, trimmed, max 60 characters. */
  selfDescribed: string | null;
  /** Add observance reminders for the chosen traditions to the calendar. */
  observanceReminders: boolean;
  taxonomyVersion: string;
  updatedAt: string;
}

/**
 * Normalises a selection: at most three entries, no duplicates, "prefer not to say" stands
 * alone, self-description trimmed to plain text. Unknown ids are kept (a newer taxonomy may
 * know them), never silently dropped or re-mapped.
 */
export function normaliseWorldviewProfile(
  input: { ids: string[]; selfDescribed?: string | null; observanceReminders?: boolean },
  now = new Date(),
): WorldviewProfile {
  const unique = [...new Set(input.ids.filter(Boolean))];
  const ids = unique.includes(PREFER_NOT_TO_SAY) ? [PREFER_NOT_TO_SAY] : unique.slice(0, MAX_WORLDVIEWS);
  const raw = (input.selfDescribed ?? '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim();
  return {
    ids,
    selfDescribed: ids.includes(PREFER_NOT_TO_SAY) || !raw ? null : raw.slice(0, 60),
    observanceReminders: ids.includes(PREFER_NOT_TO_SAY) ? false : Boolean(input.observanceReminders),
    taxonomyVersion: WORLDVIEW_TAXONOMY_VERSION,
    updatedAt: now.toISOString(),
  };
}

/** Observance sets the person chose reminders for (explicit choice only). */
export function observanceSetsFor(profile: WorldviewProfile | null): ObservanceSet[] {
  if (!profile?.observanceReminders) return [];
  const sets = new Set<ObservanceSet>();
  for (const id of profile.ids) {
    let w = BY_ID.get(id);
    while (w && !w.observances && w.parentId) w = BY_ID.get(w.parentId);
    if (w?.observances) sets.add(w.observances);
  }
  return [...sets];
}

/** Rows for the person's data export. */
export function worldviewExportRows(profile: WorldviewProfile | null): { label: string; value: string }[] {
  if (!profile) return [];
  return [
    { label: 'Beliefs and culture', value: profile.ids.map((id) => (id === PREFER_NOT_TO_SAY ? 'Prefer not to say' : worldviewFullLabel(id))).join('; ') || 'Not set' },
    { label: 'In my own words', value: profile.selfDescribed ?? '' },
    { label: 'Observance reminders', value: profile.observanceReminders ? 'On' : 'Off' },
    { label: 'Taxonomy version', value: profile.taxonomyVersion },
    { label: 'Last changed', value: profile.updatedAt },
  ];
}
