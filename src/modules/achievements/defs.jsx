import { Crown, Flame, Leaf, BookOpen } from 'lucide-react';
import { levelFromXP } from '../../state/profile';

export const ACH_DEFS = [
  { id: 'streak3', name: 'Warm Breeze', desc: '3-day streak', icon: <Flame className="w-4 h-4" />, test: ({ profile }) => profile.streak >= 3 },
  { id: 'streak7', name: 'Forest Walker', desc: '7-day streak', icon: <Leaf className="w-4 h-4" />, test: ({ profile }) => profile.streak >= 7 },
  { id: 'lvl5', name: 'Novice Druid', desc: 'Reach level 5', icon: <Crown className="w-4 h-4" />, test: ({ profile }) => levelFromXP(profile.xp) >= 5 },
  { id: 'reviews50', name: 'Deck Diver', desc: '50 reviews done', icon: <BookOpen className="w-4 h-4" />, test: ({ history }) =>
      Object.values(history.byDay || {}).reduce((a, d) => a + (d.done || 0), 0) >= 50 },
];