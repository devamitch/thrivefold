/** A food a vision model estimated from a meal photo. Pure; no network. */
export interface EstimatedFood {
  name: string;
  /** Portion as the model describes it, e.g. "1 bowl (200 g)". */
  serving: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  /** 0-1, the model's own confidence. */
  confidence: number;
}

const clampNum = (v: unknown, max: number) =>
  typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.min(max, Math.round(v * 10) / 10)) : null;

/** Parses and sanity-checks the model's JSON; drops anything implausible rather than fixing it. */
export function parseEstimate(text: string): EstimatedFood[] {
  const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);
  const parsed = JSON.parse(json) as { items?: unknown[] };
  const out: EstimatedFood[] = [];
  for (const raw of parsed.items ?? []) {
    const r = raw as Record<string, unknown>;
    const name = typeof r.name === 'string' ? r.name.trim().slice(0, 60) : '';
    const kcal = clampNum(r.kcal, 3000);
    const protein = clampNum(r.protein, 300);
    const carbs = clampNum(r.carbs, 500);
    const fat = clampNum(r.fat, 300);
    if (!name || kcal === null || protein === null || carbs === null || fat === null) continue;
    out.push({
      name,
      serving: typeof r.serving === 'string' && r.serving.trim() ? r.serving.trim().slice(0, 40) : '1 portion',
      kcal: Math.round(kcal),
      protein,
      carbs,
      fat,
      confidence: clampNum(r.confidence, 1) ?? 0.5,
    });
  }
  return out.slice(0, 8);
}

