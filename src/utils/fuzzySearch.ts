export function fuzzyMatchScore(query: string, text: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  const t = text.toLowerCase();

  if (t === q) return 1000;
  if (t.startsWith(q)) return 800 - (t.length - q.length) * 0.2;

  const substringIdx = t.indexOf(q);
  if (substringIdx !== -1) {
    return 600 - substringIdx * 2;
  }

  let qi = 0;
  let score = 0;
  let consecutive = 0;
  let lastMatchIdx = -1;

  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      if (lastMatchIdx === ti - 1) {
        consecutive += 1;
        score += 18 + consecutive * 6;
      } else {
        consecutive = 0;
        score += 10;
      }
      if (ti === 0 || t[ti - 1] === ' ' || t[ti - 1] === '-' || t[ti - 1] === '/') {
        score += 14;
      }
      lastMatchIdx = ti;
      qi += 1;
    }
  }

  if (qi < q.length) return 0;
  return Math.max(1, score - (t.length - q.length) * 0.15);
}
