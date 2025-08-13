export function levenshtein(a = '', b = '') {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

export const fuzzyCorrect = (user, answer) => levenshtein(user.trim(), answer.trim()) <= Math.max(1, Math.round(answer.trim().length * 0.2));

export function srsUpdateHelper(card, quality) {
  const next = { ...card };
  const q = quality;
  if (q < 3) { next.reps = 0; next.interval = 0; }
  else {
    next.ef = Math.max(1.3, next.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    if (next.reps === 0) next.interval = 1; else if (next.reps === 1) next.interval = 3; else next.interval = Math.round(next.interval * next.ef);
    next.reps += 1;
  }
  next.due = Date.now() + (next.interval * 24) * 3600 * 1000;
  return next;
}
