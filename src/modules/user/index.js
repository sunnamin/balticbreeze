/**
 * Very light user module (auth placeholder + unlocked modules).
 * Today: anonymous user persisted to localStorage.
 * Future: swap to services/storage/supabase.js without changing callers.
 */

const USER_LSK = 'bb_user_v1';

export const DEFAULT_USER = {
  id: 'anon',
  displayName: 'Guest',
  unlocked: ['core-a1', 'food-a1'], // A1 defaults
};

export function loadUser() {
  try {
    const raw = localStorage.getItem(USER_LSK);
    return raw ? JSON.parse(raw) : { ...DEFAULT_USER };
  } catch {
    return { ...DEFAULT_USER };
  }
}

export function saveUser(user) {
  try { localStorage.setItem(USER_LSK, JSON.stringify(user)); } catch {}
}

export function isUnlocked(user, moduleId) {
  return !!(user?.unlocked || []).includes(moduleId);
}

export function unlockModule(user, moduleId) {
  if (isUnlocked(user, moduleId)) return user;
  const next = { ...user, unlocked: [...(user.unlocked || []), moduleId] };
  saveUser(next);
  return next;
}

export function removeModule(user, moduleId) {
  if (moduleId === 'core-a1') return user; // keep core
  const next = { ...user, unlocked: (user.unlocked || []).filter(id => id !== moduleId) };
  saveUser(next);
  return next;
}

// --------------------------------
// File: src/modules/decks/core-a1.js
// --------------------------------

const coreA1 = {
  id: 'core-a1',
  name: 'Core A1',
  cards: [
    { id: '1', lt: 'Labas', en: 'Hello', ru: 'Привет', topic: 'greetings' },
    { id: '2', lt: 'Ačiū', en: 'Thank you', ru: 'Спасибо', topic: 'greetings' },
    { id: '3', lt: 'Prašom', en: "Please / You're welcome", ru: 'Пожалуйста', topic: 'greetings' },
    { id: '4', lt: 'Atsiprašau', en: 'Sorry / Excuse me', ru: 'Извините', topic: 'greetings' },
    { id: '5', lt: 'Taip', en: 'Yes', ru: 'Да', topic: 'core' },
    { id: '6', lt: 'Ne', en: 'No', ru: 'Нет', topic: 'core' },
    { id: '7', lt: 'Vanduo', en: 'Water', ru: 'Вода', topic: 'food' },
    { id: '8', lt: 'Kava', en: 'Coffee', ru: 'Кофе', topic: 'food' },
    { id: '9', lt: 'Aš esu', en: 'I am', ru: 'Я', topic: 'core' },
    { id: '10', lt: 'Tu esi', en: 'You are', ru: 'Ты', topic: 'core' },
    { id: '11', lt: 'Kur tualetas?', en: 'Where is the toilet?', ru: 'Где туалет?', topic: 'travel' },
    { id: '12', lt: 'Kiek tai kainuoja?', en: 'How much is it?', ru: 'Сколько стоит?', topic: 'shopping' },
    { id: '13', lt: 'Aš gyvenu Vilniuje', en: 'I live in Vilnius', ru: 'Я живу в Вильнюсе', topic: 'life' },
    { id: '14', lt: 'Vienas / viena', en: 'One (m/f)', ru: 'Один / одна', topic: 'numbers' },
    { id: '15', lt: 'Du / dvi', en: 'Two (m/f)', ru: 'Два / две', topic: 'numbers' },
    { id: '16', lt: 'Trys', en: 'Three', ru: 'Три', topic: 'numbers' },
    { id: '17', lt: 'Aš noriu', en: 'I want', ru: 'Я хочу', topic: 'core' },
    { id: '18', lt: 'Aš suprantu', en: 'I understand', ru: 'Я понимаю', topic: 'core' },
    { id: '19', lt: 'Nesuprantu', en: "I don't understand", ru: 'Я не понимаю', topic: 'core' },
    { id: '20', lt: 'Lietuvių kalba', en: 'Lithuanian language', ru: 'Литовский язык', topic: 'meta' },
  ],
};
export default coreA1;

// --------------------------------
// File: src/modules/decks/food-a1.js
// --------------------------------

const foodA1 = {
  id: 'food-a1',
  name: 'Food & Café',
  cards: [
    { id: '21', lt: 'Arbata', en: 'Tea', ru: 'Чай', topic: 'food' },
    { id: '22', lt: 'Pienas', en: 'Milk', ru: 'Молоко', topic: 'food' },
    { id: '23', lt: 'Duona', en: 'Bread', ru: 'Хлеб', topic: 'food' },
    { id: '24', lt: 'Sviestas', en: 'Butter', ru: 'Масло', topic: 'food' },
    { id: '25', lt: 'Sąskaita, prašau', en: 'The bill, please', ru: 'Счёт, пожалуйста', topic: 'cafe' },
  ],
};
export default foodA1;

// --------------------------------
// File: src/modules/decks/travel-a1.js
// --------------------------------

const travelA1 = {
  id: 'travel-a1',
  name: 'Travel & City',
  cards: [
    { id: '26', lt: 'Stotis', en: 'Station', ru: 'Вокзал', topic: 'travel' },
    { id: '27', lt: 'Stotelė', en: '(Bus) stop', ru: 'Остановка', topic: 'travel' },
    { id: '28', lt: 'Bilietas', en: 'Ticket', ru: 'Билет', topic: 'travel' },
    { id: '29', lt: 'Išėjimas', en: 'Exit', ru: 'Выход', topic: 'travel' },
    { id: '30', lt: 'Įėjimas', en: 'Entrance', ru: 'Вход', topic: 'travel' },
  ],
};
export default travelA1;

// --------------------------------
// File: src/modules/decks/time-a1.js
// --------------------------------

const timeA1 = {
  id: 'time-a1',
  name: 'Time & Days',
  cards: [
    { id: '31', lt: 'Šiandien', en: 'Today', ru: 'Сегодня', topic: 'time' },
    { id: '32', lt: 'Rytoj', en: 'Tomorrow', ru: 'Завтра', topic: 'time' },
    { id: '33', lt: 'Vakar', en: 'Yesterday', ru: 'Вчера', topic: 'time' },
    { id: '34', lt: 'Diena', en: 'Day', ru: 'День', topic: 'time' },
    { id: '35', lt: 'Naktis', en: 'Night', ru: 'Ночь', topic: 'time' },
  ],
};
export default timeA1;

// --------------------------------
// File: src/modules/decks/family-a1.js
// --------------------------------

const familyA1 = {
  id: 'family-a1',
  name: 'Family & People',
  cards: [
    { id: '36', lt: 'Mama', en: 'Mother', ru: 'Мама', topic: 'family' },
    { id: '37', lt: 'Tėtis', en: 'Father', ru: 'Папа', topic: 'family' },
    { id: '38', lt: 'Sesuo', en: 'Sister', ru: 'Сестра', topic: 'family' },
    { id: '39', lt: 'Brolis', en: 'Brother', ru: 'Брат', topic: 'family' },
    { id: '40', lt: 'Draugas / draugė', en: 'Friend (m/f)', ru: 'Друг / подруга', topic: 'family' },
  ],
};
export default familyA1;

// --------------------------------
// File: src/modules/decks/verbs-a1.js
// --------------------------------

const verbsA1 = {
  id: 'verbs-a1',
  name: 'Basic Verbs',
  cards: [
    { id: '41', lt: 'eiti', en: 'to go (on foot)', ru: 'идти', topic: 'verb' },
    { id: '42', lt: 'važiuoti', en: 'to go (by transport)', ru: 'ехать', topic: 'verb' },
    { id: '43', lt: 'valgyti', en: 'to eat', ru: 'есть', topic: 'verb' },
    { id: '44', lt: 'gerti', en: 'to drink', ru: 'пить', topic: 'verb' },
    { id: '45', lt: 'mylėti', en: 'to love', ru: 'любить', topic: 'verb' },
  ],
};
export default verbsA1;

// --------------------------------
// File: src/modules/decks/index.js
// --------------------------------

import coreA1 from './core-a1';
import foodA1 from './food-a1';
import travelA1 from './travel-a1';
import timeA1 from './time-a1';
import familyA1 from './family-a1';
import verbsA1 from './verbs-a1';

export const ALL_DECKS = [coreA1, foodA1, travelA1, timeA1, familyA1, verbsA1];

export function getDeckById(id) {
  return ALL_DECKS.find(d => d.id === id) || null;
}

export function flattenCards(deckIds) {
  return ALL_DECKS.filter(d => deckIds.includes(d.id)).flatMap(d => d.cards);
}

// --------------------------------
// File: src/modules/achievements/defs.js
// --------------------------------

import { Crown, Flame, Leaf, BookOpen } from 'lucide-react';
import { levelFromXP } from '../../state/profile';

export const ACH_DEFS = [
  { id: 'streak3', name: 'Warm Breeze', desc: '3-day streak', icon: <Flame className="w-4 h-4" />, test: ({ profile }) => profile.streak >= 3 },
  { id: 'streak7', name: 'Forest Walker', desc: '7-day streak', icon: <Leaf className="w-4 h-4" />, test: ({ profile }) => profile.streak >= 7 },
  { id: 'lvl5', name: 'Novice Druid', desc: 'Reach level 5', icon: <Crown className="w-4 h-4" />, test: ({ profile }) => levelFromXP(profile.xp) >= 5 },
  { id: 'reviews50', name: 'Deck Diver', desc: '50 reviews done', icon: <BookOpen className="w-4 h-4" />, test: ({ history }) =>
      Object.values(history.byDay || {}).reduce((a, d) => a + (d.done || 0), 0) >= 50 },
];

// --------------------------------
// File: src/modules/achievements/compute.js
// --------------------------------

import { ACH_DEFS } from './defs';
export function computeAchievements(ctx) {
  return ACH_DEFS.filter(a => a.test(ctx)).map(a => a.id);
}

// --------------------------------
// File: src/state/srs.js
// --------------------------------

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

// --------------------------------
// File: src/state/profile.js
// --------------------------------

export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
export const levelFromXP = (xp) => clamp(Math.floor(0.1 * Math.sqrt(xp)) + 1, 1, 99);

// --------------------------------
// File: src/services/storage/index.js
// --------------------------------

/**
 * Storage provider interface (shape only). Consumers call through one of these.
 * Default: local provider. Future: supabase provider.
 */

import * as local from './local';

export function createStorageProvider(kind = 'local') {
  switch (kind) {
    case 'local':
    default:
      return local;
  }
}

// --------------------------------
// File: src/services/storage/local.js
// --------------------------------

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
