// src/modules/achievements/compute.js
import { ACH_DEFS } from './defs.jsx';

export function computeAchievements(ctx) {
  return ACH_DEFS.filter(a => a.test(ctx)).map(a => a.id);
}
