// Mirrors the keys in App.jsx so you can switch incrementally.
const LSK = {
  PROFILE: 'bb_profile_v2',
  CARDS: 'bb_cards_v2',
  HISTORY: 'bb_history_v1',
  SETTINGS: 'bb_settings_v3',
  USER: 'bb_user_v1',
};

export function loadProfile() {
  try { return JSON.parse(localStorage.getItem(LSK.PROFILE)) || { xp: 0, streak: 0, lastDay: null }; } catch { return { xp: 0, streak: 0, lastDay: null }; }
}
export function saveProfile(p) {
  try { localStorage.setItem(LSK.PROFILE, JSON.stringify(p)); } catch {}
}

export function loadHistory() {
  try { return JSON.parse(localStorage.getItem(LSK.HISTORY)) || { byDay: {} }; } catch { return { byDay: {} }; }
}
export function saveHistory(h) {
  try { localStorage.setItem(LSK.HISTORY, JSON.stringify(h)); } catch {}
}

export function loadCards() {
  try { return JSON.parse(localStorage.getItem(LSK.CARDS)) || []; } catch { return []; }
}
export function saveCards(cs) {
  try { localStorage.setItem(LSK.CARDS, JSON.stringify(cs)); } catch {}
}

export function loadSettings() {
  try { return JSON.parse(localStorage.getItem(LSK.SETTINGS)) || { theme: 'forest', ui: 'en', dailyGoal: 30 }; } catch { return { theme: 'forest', ui: 'en', dailyGoal: 30 }; }
}
export function saveSettings(s) {
  try { localStorage.setItem(LSK.SETTINGS, JSON.stringify(s)); } catch {}
}

export function wipeAll() {
  Object.values(LSK).forEach(k => localStorage.removeItem(k));
}

// In a future supabase.js provider we’ll re-implement these as network calls with RLS.
