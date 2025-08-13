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