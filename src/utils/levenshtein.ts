export function levenshtein(a: string, b: string): number {
  const al = a.length,
    bl = b.length;
  if (al === 0) return bl;
  if (bl === 0) return al;
  const matrix = Array.from({ length: bl + 1 }, () => Array(al + 1).fill(0));
  for (let i = 0; i <= bl; i++) matrix[i][0] = i;
  for (let j = 0; j <= al; j++) matrix[0][j] = j;
  for (let i = 1; i <= bl; i++) {
    for (let j = 1; j <= al; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[bl][al];
}

export function findClosest(
  input: string,
  candidates: string[] | readonly []
): string | null {
  const normalized = input.toLowerCase().trim();
  let best = { cand: null as string | null, score: Infinity };
  for (const c of candidates) {
    const dist = levenshtein(normalized, c.toLowerCase());
    const norm = dist / Math.max(normalized.length, c.length);
    if (norm < best.score) best = { cand: c, score: norm };
  }
  return best.score <= 0.45 ? best.cand : null;
}
