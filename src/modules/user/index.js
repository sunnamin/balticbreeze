const USER_LSK = 'bb_user_v1';

export const DEFAULT_USER = {
  id: 'anon',
  displayName: 'Guest',
  unlocked: ['core-a1', 'food-a1'],
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
