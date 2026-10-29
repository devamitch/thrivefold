import type { DetectedObject } from '../../../modules/pose-landmarker/tools';

/** A spoken sentence for detected objects, with where each kind is in the photo. */
export function describeObjects(objs: DetectedObject[]): string {
  if (!objs.length) return "I can't make out any objects. Try more light, or step back a little.";
  const counts = new Map<string, number>();
  for (const o of objs) counts.set(o.label, (counts.get(o.label) ?? 0) + 1);
  const where = (o: DetectedObject) => {
    const cx = (o.box[0] + o.box[2]) / 2;
    return cx < 0.35 ? 'on the left' : cx > 0.65 ? 'on the right' : 'in the middle';
  };
  const parts = [...counts.entries()].map(([label, n]) => {
    const first = objs.find((o) => o.label === label)!;
    return `${n > 1 ? `${n} ${label}s` : `a ${label}`} ${where(first)}`;
  });
  return `I see ${parts.slice(0, -1).join(', ')}${parts.length > 1 ? ' and ' : ''}${parts[parts.length - 1]}.`;
}
