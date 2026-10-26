/**
 * Vector similarity utilities for on-device dense embedding search.
 */

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    const valA = a[i];
    const valB = b[i];
    dotProduct += valA * valB;
    normA += valA * valA;
    normB += valB * valB;
  }

  if (normA <= 0 || normB <= 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return Infinity;
  }

  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

export function normalizeVector(vec: number[]): number[] {
  let norm = 0;
  for (let i = 0; i < vec.length; i++) {
    norm += vec[i] * vec[i];
  }
  if (norm <= 0) return vec.slice();
  const mag = Math.sqrt(norm);
  return vec.map((val) => val / mag);
}

export function topKSimilar<T extends { vector?: number[] }>(
  query: number[],
  items: T[],
  k = 5,
  minThreshold = 0.0
): { item: T; similarity: number }[] {
  const scored = items
    .map((item) => {
      const sim = item.vector ? cosineSimilarity(query, item.vector) : 0;
      return { item, similarity: sim };
    })
    .filter((entry) => entry.similarity >= minThreshold)
    .sort((a, b) => b.similarity - a.similarity);

  return scored.slice(0, k);
}

