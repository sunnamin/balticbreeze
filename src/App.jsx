import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Crown, Flame, Coins, Headphones, Sparkles, Trophy, Languages, RotateCcw, Volume2, BookOpenText, PenSquare, Swords, Sun, Moon, Leaf, Star, ListChecks, BookOpen, Wand2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// ------------------------------------------------------
// Baltic Breeze v0.2 — Add packs, drills, story mode, dark runic UI
// ------------------------------------------------------

const LSK = {
  PROFILE: "bb_profile_v1",
  STREAK: "bb_streak_v1",
  CARDS: "bb_cards_v2", // bump key due to packs
  HISTORY: "bb_history_v1",
  SETTINGS: "bb_settings_v2", // bump key due to theme+packs
};

const todayKey = () => new Date().toISOString().slice(0, 10);
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

// --- small utils ---
function levenshtein(a = "", b = "") {
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
const fuzzyCorrect = (user, answer) => levenshtein(user.trim(), answer.trim()) <= Math.max(1, Math.round(answer.trim().length * 0.2));
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

// --- PACKS (more vocab) ---
const PACKS = [
  {
    id: "core-a1",
    name: "Core A1",
    cards: [
      { id: "1", lt: "Labas", en: "Hello", ru: "Привет", topic: "greetings" },
      { id: "2", lt: "Ačiū", en: "Thank you", ru: "Спасибо", topic: "greetings" },
      { id: "3", lt: "Prašom", en: "Please / You're welcome", ru: "Пожалуйста", topic: "greetings" },
      { id: "4", lt: "Atsiprašau", en: "Sorry / Excuse me", ru: "Извините", topic: "greetings" },
      { id: "5", lt: "Taip", en: "Yes", ru: "Да", topic: "core" },
      { id: "6", lt: "Ne", en: "No", ru: "Нет", topic: "core" },
      { id: "7", lt: "Vanduo", en: "Water", ru: "Вода", topic: "food" },
      { id: "8", lt: "Kava", en: "Coffee", ru: "Кофе", topic: "food" },
      { id: "9", lt: "Aš esu", en: "I am", ru: "Я", topic: "core" },
      { id: "10", lt: "Tu esi", en: "You are", ru: "Ты", topic: "core" },
      { id: "11", lt: "Kur tualetas?", en: "Where is the toilet?", ru: "Где туалет?", topic: "travel" },
      { id: "12", lt: "Kiek tai kainuoja?", en: "How much is it?", ru: "Сколько стоит?", topic: "shopping" },
      { id: "13", lt: "Aš gyvenu Vilniuje", en: "I live in Vilnius", ru: "Я живу в Вильнюсе", topic: "life" },
      { id: "14", lt: "Vienas / viena", en: "One (m/f)", ru: "Один / одна", topic: "numbers" },
      { id: "15", lt: "Du / dvi", en: "Two (m/f)", ru: "Два / две", topic: "numbers" },
      { id: "16", lt: "Trys", en: "Three", ru: "Три", topic: "numbers" },
      { id: "17", lt: "Aš noriu", en: "I want", ru: "Я хочу", topic: "core" },
      { id: "18", lt: "Aš suprantu", en: "I understand", ru: "Я понимаю", topic: "core" },
      { id: "19", lt: "Nesuprantu", en: "I don't understand", ru: "Я не понимаю", topic: "core" },
      { id: "20", lt: "Lietuvių kalba", en: "Lithuanian language", ru: "Литовский язык", topic: "meta" },
    ],
  },
  {
    id: "food-a1",
    name: "Food & Café",
    cards: [
      { id: "21", lt: "Arbata", en: "Tea", ru: "Чай", topic: "food" },
      { id: "22", lt: "Pienas", en: "Milk", ru: "Молоко", topic: "food" },
      { id: "23", lt: "Duona", en: "Bread", ru: "Хлеб", topic: "food" },
      { id: "24", lt: "Sviestas", en: "Butter", ru: "Масло", topic: "food" },
      { id: "25", lt: "Sąskaita, prašau", en: "The bill, please", ru: "Счёт, пожалуйста", topic: "cafe" },
    ],
  },
  {
    id: "travel-a1",
    name: "Travel & City",
    cards: [
      { id: "26", lt: "Stotis", en: "Station", ru: "Вокзал", topic: "travel" },
      { id: "27", lt: "Stotelė", en: "(Bus) stop", ru: "Остановка", topic: "travel" },
      { id: "28", lt: "Bilietas", en: "Ticket", ru: "Билет", topic: "travel" },
      { id: "29", lt: "Išėjimas", en: "Exit", ru: "Выход", topic: "travel" },
      { id: "30", lt: "Įėjimas", en: "Entrance", ru: "Вход", topic: "travel" },
    ],
  },
  {
    id: "time-a1",
    name: "Time & Days",
    cards: [
      { id: "31", lt: "Šiandien", en: "Today", ru: "Сегодня", topic: "time" },
      { id: "32", lt: "Rytoj", en: "Tomorrow", ru: "Завтра", topic: "time" },
      { id: "33", lt: "Vakar", en: "Yesterday", ru: "Вчера", topic: "time" },
      { id: "34", lt: "Diena", en: "Day", ru: "День", topic: "time" },
      { id: "35", lt: "Naktis", en: "Night", ru: "Ночь", topic: "time" },
    ],
  },
  {
    id: "family-a1",
    name: "Family & People",
    cards: [
      { id: "36", lt: "Mama", en: "Mother", ru: "Мама", topic: "family" },
      { id: "37", lt: "Tėtis", en: "Father", ru: "Папа", topic: "family" },
      { id: "38", lt: "Sesuo", en: "Sister", ru: "Сестра", topic: "family" },
      { id: "39", lt: "Brolis", en: "Brother", ru: "Брат", topic: "family" },
      { id: "40", lt: "Draugas / draugė", en: "Friend (m/f)", ru: "Друг / подруга", topic: "family" },
    ],
  },
  {
    id: "verbs-a1",
    name: "Basic Verbs",
    cards: [
      { id: "41", lt: "eiti", en: "to go (on foot)", ru: "идти", topic: "verb" },
      { id: "42", lt: "važiuoti", en: "to go (by transport)", ru: "ехать", topic: "verb" },
      { id: "43", lt: "valgyti", en: "to eat", ru: "есть", topic: "verb" },
      { id: "44", lt: "gerti", en: "to drink", ru: "пить", topic: "verb" },
      { id: "45", lt: "mylėti", en: "to love", ru: "любить", topic: "verb" },
    ],
  },
];

const initCardState = (cards) => cards.map((c) => ({ ...c, ef: 2.5, interval: 0, reps: 0, due: Date.now() }));

// --- i18n ---
const STR = {
  en: {
    title: "Baltic Breeze",
    subtitle: "Learn Lithuanian with bite-sized quests",
    flashcards: "Flashcards",
    quiz: "Quiz",
    typing: "Typing",
    listening: "Listening",
    drills: "Drills",
    story: "Story",
    progress: "Progress",
    reviewDue: "Due",
    reveal: "Reveal",
    iKnewIt: "I knew it",
    unsure: "Unsure",
    forgot: "Forgot",
    typeHere: "Type Lithuanian here…",
    check: "Check",
    speak: "Speak",
    dailyGoal: "Daily goal",
    streak: "Streak",
    coins: "Coins",
    level: "Level",
    achievements: "Achievements",
    reset: "Reset day",
    theme: "Theme",
    forest: "Baltic Forest",
    amber: "Amber Night",
    runic: "Dark Runic",
    learnerLang: "UI language",
    russian: "Русский",
    english: "English",
    ttsNote: "Tip: enable Lithuanian voice in your OS for best TTS.",
    mcq: "Multiple choice",
    next: "Next",
    packs: "Packs",
    managePacks: "Manage Packs",
    add: "Add",
  },
  ru: {
    title: "Балтийский Бриз",
    subtitle: "Учите литовский в формате маленьких квестов",
    flashcards: "Карточки",
    quiz: "Викторина",
    typing: "Письмо",
    listening: "Аудирование",
    drills: "Тренировки",
    story: "История",
    progress: "Прогресс",
    reviewDue: "К повторению",
    reveal: "Показать",
    iKnewIt: "Знал(а)",
    unsure: "Не уверен(а)",
    forgot: "Забыл(а)",
    typeHere: "Введите литовский…",
    check: "Проверить",
    speak: "Слушать",
    dailyGoal: "Дневная цель",
    streak: "Серия дней",
    coins: "Монеты",
    level: "Уровень",
    achievements: "Достижения",
    reset: "Завершить день",
    theme: "Тема",
    forest: "Балтийский лес",
    amber: "Янтарная ночь",
    runic: "Тёмные руны",
    learnerLang: "Язык интерфейса",
    russian: "Русский",
    english: "English",
    ttsNote: "Совет: включите литовский голос в системе для лучшего TTS.",
    mcq: "Выбор ответа",
    next: "Дальше",
    packs: "Наборы",
    managePacks: "Управление наборами",
    add: "Добавить",
  },
};

// leveling
const levelFromXP = (xp) => clamp(Math.floor(0.1 * Math.sqrt(xp)) + 1, 1, 99);

// achievements
const ACHS = [
  { id: "streak3", name: "Warm Breeze", desc: "3-day streak", icon: <Flame className="w-4 h-4" />, test: (p) => p.streak >= 3 },
  { id: "streak7", name: "Forest Walker", desc: "7-day streak", icon: <Leaf className="w-4 h-4" />, test: (p) => p.streak >= 7 },
  { id: "coin500", name: "Amber Hunter", desc: "500 coins", icon: <Coins className="w-4 h-4" />, test: (p) => p.coins >= 500 },
  { id: "lvl5", name: "Novice Druid", desc: "Reach level 5", icon: <Crown className="w-4 h-4" />, test: (p) => levelFromXP(p.xp) >= 5 },
];

export default function BalticBreeze() {
  // settings: theme + UI + goal + selectedPacks
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(LSK.SETTINGS);
    return saved ? JSON.parse(saved) : { theme: "forest", ui: "en", dailyGoal: 30, packs: ["core-a1", "food-a1"] };
  });
  const T = STR[settings.ui];

  // cards are derived from selected packs, but we persist SRS fields
  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem(LSK.CARDS);
    if (saved) return JSON.parse(saved);
    const initial = PACKS.filter(p => settings.packs.includes(p.id)).flatMap(p => p.cards);
    return initCardState(initial);
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem(LSK.PROFILE);
    return saved ? JSON.parse(saved) : { xp: 0, coins: 0, streak: 0, lastDay: null };
  });
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem(LSK.HISTORY);
    return saved ? JSON.parse(saved) : { byDay: {} };
  });

  // persistence
  useEffect(() => { localStorage.setItem(LSK.CARDS, JSON.stringify(cards)); }, [cards]);
  useEffect(() => { localStorage.setItem(LSK.PROFILE, JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem(LSK.HISTORY, JSON.stringify(history)); }, [history]);
  useEffect(() => { localStorage.setItem(LSK.SETTINGS, JSON.stringify(settings)); }, [settings]);

  // Day / streak handling (simple)
  useEffect(() => {
    const today = todayKey();
    if (profile.lastDay !== today) {
      const yesterday = new Date();
      yesterday.setDate(new Date().getDate() - 1);
      const yk = yesterday.toISOString().slice(0, 10);
      const newStreak = profile.lastDay === yk ? (profile.streak + 1) : (profile.lastDay ? 0 : 0);
      setProfile((p) => ({ ...p, lastDay: today, streak: newStreak }));
    }
    const cnt = (history.byDay[today]?.done || 0);
    // no-op but ensures dailyCount derived later is accurate
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const due = useMemo(() => cards.filter(c => c.due <= Date.now()).slice(0, 12), [cards]);
  const sample = useMemo(() => (due.length ? due[0] : cards[0]), [due, cards]);

  const progressData = useMemo(() => {
    const days = Object.entries(history.byDay).sort(([a],[b]) => a.localeCompare(b));
    return days.slice(-14).map(([day, v]) => ({ day: day.slice(5), count: v.done || 0 }));
  }, [history]);

  const reward = (kind) => {
    const gain = kind === "easy" ? 20 : kind === "ok" ? 12 : 6;
    const xp = kind === "easy" ? 12 : kind === "ok" ? 8 : 5;
    setProfile(p => ({ ...p, coins: p.coins + gain, xp: p.xp + xp }));
    const today = todayKey();
    setHistory(h => ({ byDay: { ...h.byDay, [today]: { done: (h.byDay[today]?.done || 0) + 1 } } }));
  };

  const srsUpdate = (card, quality) => {
    const now = Date.now();
    const next = { ...card };
    const q = quality;
    if (q < 3) { next.reps = 0; next.interval = 0; }
    else {
      next.ef = Math.max(1.3, next.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
      if (next.reps === 0) next.interval = 1; else if (next.reps === 1) next.interval = 3; else next.interval = Math.round(next.interval * next.ef);
      next.reps += 1;
    }
    next.due = now + (next.interval * 24) * 3600 * 1000;
    setCards(cs => cs.map(c => c.id === next.id ? next : c));
  };

  // theme
  const theme = settings.theme; // 'forest' | 'amber' | 'runic'
  const appBg = theme === "forest" ? "from-emerald-900 via-emerald-800 to-emerald-900" : theme === "amber" ? "from-amber-900 via-amber-800 to-amber-900" : "from-slate-950 via-purple-950 to-slate-950";
  const cardBg = theme === "forest" ? "bg-emerald-950/60 border-emerald-800" : theme === "amber" ? "bg-amber-950/60 border-amber-800" : "bg-slate-950/70 border-purple-900";
  const accent = theme === "forest" ? "text-emerald-300" : theme === "amber" ? "text-amber-300" : "text-purple-300 tracking-wider";
  const runicClass = theme === "runic" ? "uppercase tracking-[0.15em]" : "";

  const level = levelFromXP(profile.xp);
  const today = todayKey();
  const dailyCount = history.byDay[today]?.done || 0;
  const goal = settings.dailyGoal;
  const goalPct = clamp(Math.round((dailyCount / goal) * 100), 0, 100);
  const achievements = ACHS.filter(a => a.test(profile)).map(a => a.id);

  // --- Packs management ---
  const [packsOpen, setPacksOpen] = useState(false);
  function addPack(pid) {
    if (settings.packs.includes(pid)) return;
    const pack = PACKS.find(p => p.id === pid);
    if (!pack) return;
    const newCards = initCardState(pack.cards.filter(pc => !cards.some(c => c.id === pc.id)));
    setCards(cs => [...cs, ...newCards]);
    setSettings(s => ({ ...s, packs: [...s.packs, pid] }));
  }

  function removePack(pid) {
    if (!settings.packs.includes(pid) || pid === "core-a1") return; // always keep core
    const keepIds = new Set(PACKS.filter(p => p.id === pid ? false : settings.packs.includes(p.id)).flatMap(p => p.cards.map(c => c.id)));
    setCards(cs => cs.filter(c => keepIds.has(c.id)));
    setSettings(s => ({ ...s, packs: s.packs.filter(x => x !== pid) }));
  }

  // --- Components ---
  const Stat = ({ icon, label, value }) => (
    <div className="flex items-center gap-2">
      {icon}
      <div className={`text-sm opacity-80 ${runicClass}`}>{label}</div>
      <div className={`font-semibold ml-auto ${runicClass}`}>{value}</div>
    </div>
  );

  const Header = () => (
    <div className="flex items-center justify-between">
      <div>
        <h1 className={`text-2xl font-bold ${accent} tracking-wide flex items-center gap-2 ${runicClass}`}>
          <Sparkles className="w-5 h-5" /> Baltic Breeze
        </h1>
        <p className={`text-sm opacity-80 ${runicClass}`}>{STR[settings.ui].subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 opacity-80" />
          <select className="bg-black/40 border rounded px-2 py-1 text-sm" value={settings.ui} onChange={(e) => setSettings(s => ({ ...s, ui: e.target.value }))}>
            <option value="en">{STR.en.english}</option>
            <option value="ru">{STR.ru.russian}</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs opacity-80">{STR[settings.ui].theme}</span>
          <select className="bg-black/40 border rounded px-2 py-1 text-sm" value={settings.theme} onChange={(e) => setSettings(s => ({ ...s, theme: e.target.value }))}>
            <option value="forest">{STR[settings.ui].forest}</option>
            <option value="amber">{STR[settings.ui].amber}</option>
            <option value="runic">{STR[settings.ui].runic}</option>
          </select>
        </div>
        <Dialog open={packsOpen} onOpenChange={setPacksOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2"><ListChecks className="w-4 h-4" /> {STR[settings.ui].managePacks}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{STR[settings.ui].packs}</DialogTitle>
            </DialogHeader>
            <div className="space-y-2">
              {PACKS.map(p => (
                <div key={p.id} className="flex items-center justify-between border rounded p-2">
                  <div className="text-sm font-medium">{p.name}</div>
                  <div className="flex gap-2">
                    {!settings.packs.includes(p.id) ? (
                      <Button size="sm" onClick={() => addPack(p.id)}>{STR[settings.ui].add}</Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled={p.id === 'core-a1'} onClick={() => removePack(p.id)}>Remove</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );

  const HUD = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Card className={`${cardBg}`}><CardContent className="p-3"><Stat icon={<Flame className="w-4 h-4" />} label={STR[settings.ui].streak} value={`${profile.streak}🔥`} /></CardContent></Card>
      <Card className={`${cardBg}`}><CardContent className="p-3"><Stat icon={<Coins className="w-4 h-4" />} label={STR[settings.ui].coins} value={profile.coins} /></CardContent></Card>
      <Card className={`${cardBg}`}><CardContent className="p-3 flex flex-col gap-2"><Stat icon={<Crown className="w-4 h-4" />} label={STR[settings.ui].level} value={level} /><Progress value={(profile.xp % 100)}/> </CardContent></Card>
      <Card className={`${cardBg}`}>
        <CardContent className="p-3 flex flex-col gap-2">
          <Stat icon={<Trophy className="w-4 h-4" />} label={STR[settings.ui].dailyGoal} value={`${dailyCount}/${goal}`} />
          <Progress value={goalPct} />
        </CardContent>
      </Card>
    </div>
  );

  // ------- Study Modes -------
  const Flashcards = () => {
    const card = sample;
    const [revealed, setRevealed] = useState(false);
    if (!card) return null;
    return (
      <Card className={`${cardBg}`}>
        <CardContent className="p-6 flex flex-col gap-4 items-center text-center">
          <div className={`text-xs opacity-70 self-start ${runicClass}`}>{STR[settings.ui].reviewDue}: {due.length}</div>
          <div className={`text-3xl font-semibold tracking-wide ${runicClass}`}>{card.lt}</div>
          {revealed && (
            <div className="opacity-90">
              <div className="text-sm">EN: {card.en}</div>
              <div className="text-sm">RU: {card.ru}</div>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setRevealed(r => !r)}><BookOpenText className="w-4 h-4 mr-1" />{STR[settings.ui].reveal}</Button>
            <Button variant="secondary" onClick={() => speak(card.lt)}><Volume2 className="w-4 h-4 mr-1" />{STR[settings.ui].speak}</Button>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { reward("hard"); srsUpdate(card, 3); }}><Swords className="w-4 h-4 mr-1" />{STR[settings.ui].forgot}</Button>
            <Button variant="outline" onClick={() => { reward("ok"); srsUpdate(card, 4); }}><PenSquare className="w-4 h-4 mr-1" />{STR[settings.ui].unsure}</Button>
            <Button variant="secondary" onClick={() => { reward("easy"); srsUpdate(card, 5); }}><Star className="w-4 h-4 mr-1" />{STR[settings.ui].iKnewIt}</Button>
          </div>
          <div className="text-xs opacity-70">{STR[settings.ui].ttsNote}</div>
        </CardContent>
      </Card>
    );
  };

  const QuizMCQ = () => {
    const card = sample;
    const [choices, setChoices] = useState(() => makeMCQ(card));
    const [picked, setPicked] = useState(null);
    function makeMCQ(card) {
      if (!card) return [];
      const choices = [card.lt];
      while (choices.length < 4) {
        const r = cards[Math.floor(Math.random() * cards.length)].lt;
        if (!choices.includes(r)) choices.push(r);
      }
      return shuffle(choices);
    }
    useEffect(() => { setChoices(makeMCQ(card)); }, [card?.id]);
    if (!card) return null;
    return (
      <Card className={`${cardBg}`}>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="text-sm opacity-80">{STR[settings.ui].mcq}: {settings.ui === "en" ? `Choose Lithuanian for: ${card.en}` : `Выберите литовский вариант: ${card.ru}`}</div>
          <div className="grid grid-cols-2 gap-2">
            {choices.map((c) => (
              <Button key={c} variant={picked ? (c === card.lt ? "secondary" : "outline") : "outline"} onClick={() => {
                const ok = c === card.lt; setPicked(c);
                reward(ok ? "easy" : "hard"); srsUpdate(card, ok ? 5 : 2);
                setTimeout(() => { setPicked(null); setChoices(makeMCQ(sample)); }, 650);
              }}>{c}</Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const Typing = () => {
    const card = sample;
    const [typingValue, setTypingValue] = useState("");
    const [feedback, setFeedback] = useState(null);
    if (!card) return null;
    function check() {
      if (!typingValue.trim()) return;
      const ok = fuzzyCorrect(typingValue, card.lt);
      setFeedback(ok ? "ok" : "bad");
      reward(ok ? "ok" : "hard");
      srsUpdate(card, ok ? 4 : 2);
      setTimeout(() => { setTypingValue(""); setFeedback(null); }, 900);
    }
    return (
      <Card className={`${cardBg}`}>
        <CardContent className="p-6 flex flex-col gap-3">
          <div className="text-sm opacity-80">{settings.ui === "en" ? `Type the Lithuanian for: ${card.en}` : `Введите по-литовски: ${card.ru}`}</div>
          <Input value={typingValue} onChange={(e) => setTypingValue(e.target.value)} placeholder={STR[settings.ui].typeHere} onKeyDown={(e) => e.key === 'Enter' && check()} />
          <div className="flex gap-2">
            <Button onClick={check}>{STR[settings.ui].check}</Button>
            <Button variant="secondary" onClick={() => speak(card.lt)}><Headphones className="w-4 h-4 mr-1" />{STR[settings.ui].speak}</Button>
          </div>
          {feedback && (<div className={`text-sm ${feedback === 'ok' ? 'text-green-300' : 'text-red-300'}`}>{feedback === 'ok' ? '✓ Close enough!' : `✗ Correct: ${card.lt}`}</div>)}
        </CardContent>
      </Card>
    );
  };

  const Listening = () => {
    const card = sample; const [shown, setShown] = useState(false);
    if (!card) return null;
    return (
      <Card className={`${cardBg}`}>
        <CardContent className="p-6 flex flex-col gap-4 items-center">
          <div className="text-sm opacity-80">{STR[settings.ui].listening}</div>
          <Button onClick={() => { speak(card.lt); setShown(false); }}><Headphones className="w-4 h-4 mr-1" />{STR[settings.ui].speak}</Button>
          <div className="text-lg font-semibold tracking-wide">{shown ? card.lt : '••••••'}</div>
          <Button variant="outline" onClick={() => setShown(true)}>{STR[settings.ui].reveal}</Button>
        </CardContent>
      </Card>
    );
  };

  // ------- Drills (grammar) -------
  // Drill 1: Case endings (accusative vs nominative simple nouns)
  const nouns = [
    { stem: "knyg", nom: "knyga", acc: "knygą", en: "book" },
    { stem: "kav", nom: "kava", acc: "kavą", en: "coffee" },
    { stem: "vandeni", nom: "vanduo", acc: "vandenį", en: "water" },
  ];

  const DrillEndings = () => {
    const [idx, setIdx] = useState(0);
    const item = nouns[idx % nouns.length];
    const sentence = `Aš perku ___ (${item.en})`;
    const opts = shuffle([item.acc, item.nom, item.nom, item.acc]).slice(0,4);
    return (
      <Card className={`${cardBg}`}>
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="text-sm opacity-80 flex items-center gap-2"><Wand2 className="w-4 h-4"/>Accusative for direct object</div>
          <div className="text-lg">{sentence}</div>
          <div className="grid grid-cols-2 gap-2">
            {opts.map(o => <Button key={o} variant="outline" onClick={() => {
              const ok = o === item.acc; reward(ok ? "easy" : "hard"); setIdx(idx+1);
            }}>{o}</Button>)}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Drill 2: Verb present tense endings (1st person singular)
  const verbs = [
    { inf: "eiti", stem: "ein-", first: "einu", en: "go (I)" },
    { inf: "valgyti", stem: "valg-", first: "valgau", en: "eat (I)" },
    { inf: "gerti", stem: "ger-", first: "geriu", en: "drink (I)" },
  ];

  const DrillVerbs = () => {
    const [i, setI] = useState(0);
    const v = verbs[i % verbs.length];
    const wrong = shuffle(["eini", "valgiu", "gerau", "geri"]).slice(0,3);
    const opts = shuffle([v.first, ...wrong]).slice(0,4);
    return (
      <Card className={`${cardBg}`}>
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="text-sm opacity-80 flex items-center gap-2"><Wand2 className="w-4 h-4"/>Present tense: 1st person singular</div>
          <div className="text-lg">{`„${v.inf}“ → I: ___`}</div>
          <div className="grid grid-cols-2 gap-2">
            {opts.map(o => <Button key={o} variant="outline" onClick={() => { const ok = o === v.first; reward(ok?"ok":"hard"); setI(i+1); }}>{o}</Button>)}
          </div>
        </CardContent>
      </Card>
    );
  };

  const Drills = () => (
    <div className="grid md:grid-cols-2 gap-3">
      <DrillEndings />
      <DrillVerbs />
    </div>
  );

  // ------- Story Mode -------
  const story = [
    {
      id: 1,
      text: "Rytas Vilniuje. Tu užeini į kavinę ir sakai: …",
      choices: [
        { txt: "Labas! Vieną kavą, prašau.", good: true, gain: "ok" },
        { txt: "Taip.", good: false, gain: "hard" },
      ],
    },
    {
      id: 2,
      text: "Barista klausia: ‘Su pienu ar be?’ Tu atsakai: …",
      choices: [
        { txt: "Be pieno, ačiū.", good: true, gain: "easy" },
        { txt: "Aš suprantu.", good: false, gain: "hard" },
      ],
    },
    {
      id: 3,
      text: "Tu nori sumokėti. Ką sakai?",
      choices: [
        { txt: "Sąskaita, prašau.", good: true, gain: "easy" },
        { txt: "Kur tualetas?", good: false, gain: "hard" },
      ],
    },
  ];

  const Story = () => {
    const [step, setStep] = useState(0);
    const node = story[step];
    if (!node) return (
      <Card className={`${cardBg}`}><CardContent className="p-6 text-center flex flex-col items-center gap-2">
        <BookOpen className="w-6 h-6" />
        <div className="text-lg">Epilogue: Tu išeini su šypsena ir +30 XP.</div>
        <Button className="mt-2" onClick={() => setStep(0)}>Replay</Button>
      </CardContent></Card>
    );
    return (
      <Card className={`${cardBg}`}>
        <CardContent className="p-6 flex flex-col gap-4">
          <div className="text-base">{node.text}</div>
          <div className="grid md:grid-cols-2 gap-2">
            {node.choices.map((c, idx) => (
              <Button key={idx} variant="outline" onClick={() => { reward(c.gain); setStep(step+1); }}>{c.txt}</Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const ProgressView = () => (
    <div className="grid md:grid-cols-2 gap-3">
      <Card className={`${cardBg}`}>
        <CardContent className="p-4">
          <div className="text-sm opacity-80 mb-2">14-day activity</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      <Card className={`${cardBg}`}>
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="text-sm opacity-80">{STR[settings.ui].achievements}</div>
          <div className="flex flex-wrap gap-2">
            {achievements.length ? achievements.map(id => (
              <Badge key={id} className={`px-3 py-1 gap-1 ${theme === 'forest' ? 'bg-emerald-800' : theme === 'amber' ? 'bg-amber-800' : 'bg-purple-900'}`}>
                {ACHS.find(a => a.id === id)?.icon}<span>{ACHS.find(a => a.id === id)?.name}</span>
              </Badge>
            )) : (<div className="text-xs opacity-70">Complete goals to unlock achievements!</div>)}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <RotateCcw className="w-4 h-4 opacity-70" />
            <Button size="sm" variant="outline" onClick={() => { const t = todayKey(); setHistory(h => ({ byDay: { ...h.byDay, [t]: { done: 0 } } })); }}>
              {STR[settings.ui].reset}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // --- Speech ---
  const speak = (text) => {
    try {
      const synth = window.speechSynthesis; if (!synth) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text);
      const voices = synth.getVoices();
      const lt = voices.find(v => /lt|Lithuanian/i.test(v.lang)) || voices.find(v => /English|en/i.test(v.lang)) || voices[0];
      if (lt) u.voice = lt; synth.speak(u);
    } catch {}
  };

  return (
    <div className={`min-h-[100vh] w-full bg-gradient-to-br ${appBg} text-emerald-50 p-4 md:p-8`}> 
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        <Header />
        <HUD />

        <Card className={`${cardBg}`}>
          <CardContent className="p-3 flex flex-wrap items-center gap-3 justify-between">
            <div className="flex items-center gap-2 text-sm">
              <Badge className={theme === 'forest' ? 'bg-emerald-800' : theme === 'amber' ? 'bg-amber-800' : 'bg-purple-900'}>
                <Leaf className="w-4 h-4 mr-1" />{theme === 'forest' ? STR[settings.ui].forest : theme === 'amber' ? STR[settings.ui].amber : STR[settings.ui].runic}
              </Badge>
              <div className="opacity-80 ml-3">Goal:</div>
              <input type="number" className="w-16 bg-black/40 border rounded px-2 py-1 text-sm" value={settings.dailyGoal}
                onChange={(e) => setSettings(s => ({ ...s, dailyGoal: clamp(parseInt(e.target.value||"0"), 5, 120) }))} />
            </div>
            <div className="text-xs opacity-70">Progress is saved locally. Manage packs to grow your deck.</div>
          </CardContent>
        </Card>

        <Tabs defaultValue="flash">
          <TabsList className="grid grid-cols-6 bg-black/30">
            <TabsTrigger value="flash">{STR[settings.ui].flashcards}</TabsTrigger>
            <TabsTrigger value="quiz">{STR[settings.ui].quiz}</TabsTrigger>
            <TabsTrigger value="type">{STR[settings.ui].typing}</TabsTrigger>
            <TabsTrigger value="listen">{STR[settings.ui].listening}</TabsTrigger>
            <TabsTrigger value="drills">{STR[settings.ui].drills}</TabsTrigger>
            <TabsTrigger value="story">{STR[settings.ui].story}</TabsTrigger>
          </TabsList>
          <TabsContent value="flash" className="mt-3"><Flashcards /></TabsContent>
          <TabsContent value="quiz" className="mt-3"><QuizMCQ /></TabsContent>
          <TabsContent value="type" className="mt-3"><Typing /></TabsContent>
          <TabsContent value="listen" className="mt-3"><Listening /></TabsContent>
          <TabsContent value="drills" className="mt-3"><Drills /></TabsContent>
          <TabsContent value="story" className="mt-3"><Story /></TabsContent>
        </Tabs>

        <ProgressView />

        <div className="text-center text-xs opacity-60 mt-4">v0.2 — packs, drills, story, runic theme. Local save only.</div>
      </div>
    </div>
  );
}
