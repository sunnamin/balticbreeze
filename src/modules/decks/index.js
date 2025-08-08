import coreA1 from './core-a1';

export const ALL_DECKS = [coreA1];

export function getDeckById(id) {
  return ALL_DECKS.find(d => d.id === id) || null;
}

export function flattenCards(deckIds) {
  return ALL_DECKS.filter(d => (deckIds || []).includes(d.id)).flatMap(d => d.cards);
}
