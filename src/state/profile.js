export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export const levelFromXP = (xp) => clamp(Math.floor(0.1 * Math.sqrt(xp)) + 1, 1, 99);