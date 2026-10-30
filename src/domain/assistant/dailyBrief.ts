/**
 * The coach's first message of the day: a short brief from the person's own data (no model, no
 * network), so Anvay starts the conversation with something useful instead of waiting.
 */
export interface BriefInput {
  name?: string | null;
  hour: number;
  today: string; // YYYY-MM-DD
  checkedInToday: boolean;
  waterGlasses: number;
  waterTarget: number;
  openQuests: string[];
  medicines: { id: string; name: string; time: string }[];
  medicationTaken: string[]; // "date|id"
  nowHHMM: string;
  followUps: { date: string; time: string | null; with: string }[];
}

export function dailyBrief(s: BriefInput): string {
  const part = s.hour < 12 ? 'morning' : s.hour < 17 ? 'afternoon' : 'evening';
  const lines: string[] = [];
  const due = s.medicines.filter((m) => m.time <= s.nowHHMM && !s.medicationTaken.includes(`${s.today}|${m.id}`));
  const later = s.medicines.filter((m) => m.time > s.nowHHMM);
  if (due.length) lines.push(`${due.map((m) => m.name).join(', ')} ${due.length === 1 ? 'is' : 'are'} due and not marked taken yet.`);
  else if (later.length) lines.push(`Next medicine: ${later[0].name} at ${later[0].time}.`);
  const appt = s.followUps.find((f) => f.date === s.today);
  if (appt) lines.push(`You have ${appt.with} today${appt.time ? ` at ${appt.time}` : ''}.`);
  if (!s.checkedInToday) lines.push("You haven't checked in today; it takes about a minute.");
  if (s.waterGlasses < s.waterTarget) lines.push(`Water: ${s.waterGlasses} of ${s.waterTarget} glasses so far.`);
  if (s.openQuests.length) lines.push(`${s.openQuests.length} ${s.openQuests.length === 1 ? 'quest' : 'quests'} open, starting with "${s.openQuests[0]}".`);
  const hello = `Good ${part}${s.name ? `, ${s.name}` : ''}.`;
  return lines.length ? `${hello} ${lines.join(' ')} What would you like to start with?` : `${hello} You're all caught up today. What can I help with?`;
}
