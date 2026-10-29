/** YAMNet (AudioSet) labels worth an alert, mapped to a plain name, with a confidence floor. */
const IMPORTANT: [RegExp, string][] = [
  [/smoke detector|fire alarm|^alarm$|alarm clock/i, 'Alarm'],
  [/siren|police car|ambulance|fire engine|civil defense/i, 'Siren'],
  [/baby cry|infant cry|^crying/i, 'Baby crying'],
  [/doorbell|ding-dong/i, 'Doorbell'],
  [/knock/i, 'Knocking'],
  [/telephone bell|ringtone|telephone/i, 'Phone ringing'],
  [/^dog$|bark|bow-wow/i, 'Dog barking'],
  [/glass|shatter|smash/i, 'Glass breaking'],
  [/vehicle horn|car horn|honking/i, 'Car horn'],
  [/shout|yell|scream/i, 'Shouting'],
  [/water tap|faucet|running water/i, 'Running water'],
  [/cough/i, 'Coughing'],
];

export function importantSound(label: string, score: number): string | null {
  if (score < 0.3) return null;
  return IMPORTANT.find(([re]) => re.test(label))?.[1] ?? null;
}
