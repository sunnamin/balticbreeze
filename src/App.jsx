import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Crown, Flame, Sparkles, Trophy, RotateCcw, BookOpenText, PenSquare, Swords, Leaf, Star, ListChecks, BookOpen, Wand2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// ---- modules (new) ----
import { DEFAULT_USER, loadUser, saveUser, unlockModule as unlockModuleFn, removeModule as removeModuleFn } from "@/modules/user";
import { ALL_DECKS, flattenCards } from "@/modules/decks";
import { computeAchievements } from "@/modules/achievements/compute";
import { ACH_DEFS } from "@/modules/achievements/defs";
import { srsUpdateHelper, fuzzyCorrect } from "@/state/srs";
import { clamp, levelFromXP } from "@/state/profile";

// ------------------------------------------------------
// Baltic Breeze v0.3 — Modular imports, no coins, Settings panel
// ------------------------------------------------------

const LSK = {
  PROFILE: "bb_profile_v2",
  CARDS: "bb_cards_v2",
  HISTORY: "bb_history_v1",
  SETTINGS: "bb_settings_v3",
  USER: "bb_user_v1",
};

const todayKey = () => new Date().toISOString().slice(0, 10);
const initCardState = (cards) => cards.map((c) => ({ ...c, ef: 2.5, interval: 0, reps: 0, due: Date.now() }));

// --- i18n ---
const STR = {
  en: {
    title: "Baltic Breeze",
    subtitle: "Learn Lithuanian with bite-sized quests",
    flashcards: "Flashcards",
    quiz: "Quiz",
    typing: "Typing",
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
    dailyGoal: "Daily goal",
    streak: "Streak",
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
    mcq: "Multiple choice",
    next: "Next",
    packs: "Packs",
    managePacks: "Manage Packs",
    add: "Add",
    settings: "Settings",
    language: "Language",
  },
  ru: {
    title: "Балтийский Бриз",
    subtitle: "Учите литовский в формате маленьких квестов",
    flashcards: "Карточки",
    quiz: "Викторина",
    typing: "Письмо",
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
    dailyGoal: "Дневная цель",
    streak: "Серия дней",
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
    mcq: "Выбор ответа",
    next: "Дальше",
    packs: "Наборы",
    managePacks: "Управление наборами",
    add: "Добавить",
    settings: "Настройки",
    language: "Язык",
  },
};

export default function BalticBreeze() {
  // settings (ui + theme + goal)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(LSK.SETTINGS);
    return saved ? JSON.parse(saved) : { theme: "forest", ui: "en", dailyGoal: 30 };
  });
  const T = STR[settings.ui];

  // user (auth/unlocked) via module
  const [user, setUser] = useState(() => loadUser() || DEFAULT_USER);
  useEffect(() => { saveUser(user); }, [user]);

  // cards derived from unlocked decks
  const [cards, setCards] = useState(() => {
    const saved = localStorage.getItem(LSK.CARDS);
    if (saved) return JSON.parse(saved);
    return initCardState(flattenCards(user.unlocked));
  });

  // profile & history
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem(LSK.PROFILE);
    return saved ? JSON.parse(saved) : { xp: 0, streak: 0, lastDay: null };
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

  // Day / streak handling
  useEffect(() => {
    const today = todayKey();
    if (profile.lastDay !== today) {
      const yesterday = new Date(); yesterday.setDate(new Date().getDate() - 1);
      const yk = yesterday.toISOString().slice(0, 10);
      const newStreak = profile.lastDay === yk ? (profile.streak + 1) : (profile.lastDay ? 0 : 0);
      setProfile((p) => ({ ...p, lastDay: today, streak: newStreak }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // migration: old settings.packs -> user.unlocked once
  useEffect(() => {
    const legacy = JSON.parse(localStorage.getItem("bb_settings_v2") || "null");
    if (legacy?.packs?.length) {
      setUser(u => ({ ...u, unlocked: Array.from(new Set([...(u.unlocked||[]), ...legacy.packs])) }));
      localStorage.removeItem("bb_settings_v2");
    }
  }, []);

  // review queue
  const due = useMemo(() => cards.filter(c => c.due <= Date.now()).slice(0, 12), [cards]);
  const sample = useMemo(() => (due.length ? due[0] : cards[0]), [due, cards]);

  const progressData = useMemo(() => {
    // Seed last 14 days (zeros)
    const out = []; const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      out.push({ day: key.slice(5), count: history.byDay[key]?.done || 0 });
    }
    return out;
  }, [history]);

  const reward = (kind) => {
    const xp = kind === "easy" ? 12 : kind === "ok" ? 8 : 5;
    setProfile(p => ({ ...p, xp: p.xp + xp }));
    const today = todayKey();
    setHistory(h => ({ byDay: { ...h.byDay, [today]: { done: (h.byDay[today]?.done || 0) + 1 } } }));
  };

  const srsUpdate = (card, quality) => {
    const next = srsUpdateHelper(card, quality);
    setCards(cs => cs.map(c => c.id === next.id ? next : c));
  };

  // theme
  const theme = settings.theme || "forest"; // 'forest' | 'amber' | 'runic'
  const appBg = theme === "forest" ? "from-emerald-900 via-emerald-800 to-emerald-900" : theme === "amber" ? "from-amber-900 via-amber-800 to-amber-900" : "from-slate-950 via-purple-950 to-slate-950";
  const cardBg = theme === "forest" ? "bg-emerald-950/60 border-emerald-800" : theme === "amber" ? "bg-amber-950/60 border-amber-800" : "bg-slate-950/70 border-purple-900";
  const accent = theme === "forest" ? "text-emerald-300" : theme === "amber" ? "text-amber-300" : "text-purple-300 tracking-wider";
  const runicClass = theme === "runic" ? "uppercase tracking-[0.15em]" : "";

  const level = levelFromXP(profile.xp);
  const today = todayKey();
  const dailyCount = history.byDay[today]?.done || 0;
  const goal = settings.dailyGoal;
  const goalPct = clamp(Math.round((dailyCount / goal) * 100), 0, 100);
  const achievements = computeAchievements({ profile, history, user });

  // --- Packs management on user.unlocked ---
  const [packsOpen, setPacksOpen] = useState(false);
  function unlockDeck(pid) {
    if ((user.unlocked || []).includes(pid)) return;
    const deck = ALL_DECKS.find(p => p.id === pid); if (!deck) return;
    const newCards = initCardState(deck.cards.filter(pc => !cards.some(c => c.id === pc.id)));
    setCards(cs => [...cs, ...newCards]);
    setUser(u => unlockModuleFn(u, pid));
  }
  function removeDeck(pid) {
    if (!(user.unlocked || []).includes(pid) || pid === "core-a1") return; // keep core
    const keepIds = new Set(ALL_DECKS.filter(p => p.id === pid ? false : (user.unlocked || []).includes(p.id)).flatMap(p => p.cards.map(c => c.id)));
    setCards(cs => cs.filter(c => keepIds.has(c.id)));
    setUser(u => removeModuleFn(u, pid));
  }

  // --- UI bits ---
  const Header = () => (
    <div className="flex items-center justify-between">
      <div>
        <h1 className={`text-2xl font-bold ${accent} tracking-wide flex items-center gap-2 ${runicClass}`}>
          <Sparkles className="w-5 h-5" /> Baltic Breeze
        </h1>
        <p className={`text-sm opacity-80 ${runicClass}`}>{STR[settings.ui].subtitle}</p>
      </div>
    </div>
  );

  const HUD = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <Card className={`${cardBg}`}><CardContent className="p-3"><Stat icon={<Flame className="w-4 h-4" />} label={STR[settings.ui].streak} value={`${profile.streak}🔥`} /></CardContent></Card>
      <Card className={`${cardBg}`}><CardContent className="p-3 flex flex-col gap-2"><Stat icon={<Crown className="w-4 h-4" />} label={STR[settings.ui].level} value={level} /><Progress value={(profile.xp % 100)}/> </CardContent></Card>
      <Card className={`${cardBg}`}>
        <CardContent className="p-3 flex flex-col gap-2">
          <Stat icon={<Trophy className="w-4 h-4" />} label={STR[settings.ui].dailyGoal} value={`${dailyCount}/${goal}`} />
          <Progress value={goalPct} />
        </CardContent>
      </Card>
    </div>
  );

  const Stat = ({ icon, label, value }) => (
    <div className="flex items-center gap-2">
      {icon}
      <div className={`text-sm opacity-80 ${runicClass}`}>{label}</div>
      <div className={`font-semibold ml-auto ${runicClass}`}>{value}</div>
    </div>
  );

  // ------- Study Modes -------
  const Flashcards = () => {
    const card = sample; const [revealed, setRevealed] = useState(false);
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
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { reward("hard"); srsUpdate(card, 3); }}><Swords className="w-4 h-4 mr-1" />{STR[settings.ui].forgot}</Button>
            <Button variant="outline" onClick={() => { reward("ok"); srsUpdate(card, 4); }}><PenSquare className="w-4 h-4 mr-1" />{STR[settings.ui].unsure}</Button>
            <Button variant="secondary" onClick={() => { reward("easy"); srsUpdate(card, 5); }}><Star className="w-4 h-4 mr-1" />{STR[settings.ui].iKnewIt}</Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const QuizMCQ = () => {
    const card = sample; const [choices, setChoices] = useState(() => makeMCQ(card)); const [picked, setPicked] = useState(null);
    function makeMCQ(card) {
      if (!card) return []; const choices = [card.lt];
      while (choices.length < 4) { const r = cards[Math.floor(Math.random() * cards.length)].lt; if (!choices.includes(r)) choices.push(r); }
      return choices.sort(() => Math.random() - 0.5);
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
    const card = sample; const [typingValue, setTypingValue] = useState(""); const [feedback, setFeedback] = useState(null);
    if (!card) return null;
    function check() {
      if (!typingValue.trim()) return; const ok = fuzzyCorrect(typingValue, card.lt);
      setFeedback(ok ? "ok" : "bad"); reward(ok ? "ok" : "hard"); srsUpdate(card, ok ? 4 : 2);
      setTimeout(() => { setTypingValue(""); setFeedback(null); }, 900);
    }
    return (
      <Card className={`${cardBg}`}>
        <CardContent className="p-6 flex flex-col gap-3">
          <div className="text-sm opacity-80">{settings.ui === "en" ? `Type the Lithuanian for: ${card.en}` : `Введите по-литовски: ${card.ru}`}</div>
          <Input value={typingValue} onChange={(e) => setTypingValue(e.target.value)} placeholder={STR[settings.ui].typeHere} onKeyDown={(e) => e.key === 'Enter' && check()} />
          <div className="flex gap-2">
            <Button onClick={check}>{STR[settings.ui].check}</Button>
          </div>
          {feedback && (<div className={`text-sm ${feedback === 'ok' ? 'text-green-300' : 'text-red-300'}`}>{feedback === 'ok' ? '✓ Close enough!' : `✗ Correct: ${card.lt}`}</div>)}
        </CardContent>
      </Card>
    );
  };

  // ------- Drills (grammar) -------
  const nouns = [
    { stem: "knyg", nom: "knyga", acc: "knygą", en: "book" },
    { stem: "kav", nom: "kava", acc: "kavą", en: "coffee" },
    { stem: "vandeni", nom: "vanduo", acc: "vandenį", en: "water" },
  ];
  const DrillEndings = () => {
    const [idx, setIdx] = useState(0); const item = nouns[idx % nouns.length];
    const sentence = `Aš perku ___ (${item.en})`; const opts = [item.acc, item.nom, item.nom, item.acc].sort(() => Math.random() - 0.5).slice(0,4);
    return (
      <Card className={`${cardBg}`}>
        <CardContent className="p-4 flex flex-col gap-3">
          <div className="text-sm opacity-80 flex items-center gap-2"><Wand2 className="w-4 h-4"/>Accusative for direct object</div>
          <div className="text-lg">{sentence}</div>
          <div className="grid grid-cols-2 gap-2">
            {opts.map(o => <Button key={o} variant="outline" onClick={() => { const ok = o === item.acc; reward(ok ? "easy" : "hard"); setIdx(idx+1); }}>{o}</Button>)}
          </div>
        </CardContent>
      </Card>
    );
  };

  const verbs = [
    { inf: "eiti", stem: "ein-", first: "einu", en: "go (I)" },
    { inf: "valgyti", stem: "valg-", first: "valgau", en: "eat (I)" },
    { inf: "gerti", stem: "ger-", first: "geriu", en: "drink (I)" },
  ];
  const DrillVerbs = () => {
    const [i, setI] = useState(0); const v = verbs[i % verbs.length];
    const wrong = ["eini", "valgiu", "gerau", "geri"].sort(() => Math.random() - 0.5).slice(0,3); const opts = [v.first, ...wrong].sort(() => Math.random() - 0.5).slice(0,4);
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
    { id: 1, text: "Rytas Vilniuje. Tu užeini į kavinę ir sakai: …", choices: [
      { txt: "Labas! Vieną kavą, prašau.", good: true, gain: "ok" },
      { txt: "Taip.", good: false, gain: "hard" },
    ]},
    { id: 2, text: "Barista klausia: ‘Su pienu ar be?’ Tu atsakai: …", choices: [
      { txt: "Be pieno, ačiū.", good: true, gain: "easy" },
      { txt: "Aš suprantu.", good: false, gain: "hard" },
    ]},
    { id: 3, text: "Tu nori sumokėti. Ką sakai?", choices: [
      { txt: "Sąskaita, prašau.", good: true, gain: "easy" },
      { txt: "Kur tualetas?", good: false, gain: "hard" },
    ]},
  ];
  const Story = () => {
    const [step, setStep] = useState(0); const node = story[step];
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
                {ACH_DEFS.find(a => a.id === id)?.icon}<span>{ACH_DEFS.find(a => a.id === id)?.name}</span>
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

  // ------- Settings Panel (theme + language + goal + manage packs) -------
  const SettingsPanel = () => (
    <Card className={`${cardBg}`}>
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 text-sm font-semibold opacity-90">
          <ListChecks className="w-4 h-4" /> {T.settings}
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          {/* Language */}
          <div className="space-y-2">
            <div className="text-xs opacity-70">{T.language}</div>
            <div className="flex gap-2">
              <Button variant={settings.ui==='en'? 'secondary':'outline'} onClick={() => setSettings(s=>({...s, ui:'en'}))}>EN</Button>
              <Button variant={settings.ui==='ru'? 'secondary':'outline'} onClick={() => setSettings(s=>({...s, ui:'ru'}))}>RU</Button>
            </div>
          </div>
          {/* Theme */}
          <div className="space-y-2">
            <div className="text-xs opacity-70">{T.theme}</div>
            <div className="flex gap-2">
              <Button variant={theme==='forest'? 'secondary':'outline'} onClick={()=>setSettings(s=>({...s, theme:'forest'}))}>{T.forest}</Button>
              <Button variant={theme==='amber'? 'secondary':'outline'} onClick={()=>setSettings(s=>({...s, theme:'amber'}))}>{T.amber}</Button>
              <Button variant={theme==='runic'? 'secondary':'outline'} onClick={()=>setSettings(s=>({...s, theme:'runic'}))}>{T.runic}</Button>
            </div>
          </div>
          {/* Goal */}
          <div className="space-y-2">
            <div className="text-xs opacity-70">{T.dailyGoal}</div>
            <div className="flex items-center gap-2">
              <Input type="number" value={settings.dailyGoal} onChange={(e)=>setSettings(s=>({...s, dailyGoal: clamp(parseInt(e.target.value||"0"),5,120)}))} className="w-24" />
              <div className="text-xs opacity-60">items/day</div>
            </div>
          </div>
        </div>

        {/* Manage Packs */}
        <div className="border-t border-white/10 pt-3">
          <div className="flex items-center justify-between">
            <div className="text-xs opacity-70">{T.packs}</div>
            <Button variant="outline" size="sm" onClick={()=>setPacksOpen(true)}><ListChecks className="w-4 h-4 mr-1"/>{T.managePacks}</Button>
          </div>
          <Dialog open={packsOpen} onOpenChange={setPacksOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{T.managePacks}</DialogTitle>
              </DialogHeader>
              <div className="space-y-2">
                {ALL_DECKS.map(p => (
                  <div key={p.id} className="flex items-center justify-between border rounded p-2">
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="flex gap-2">
                      {!((user.unlocked||[]).includes(p.id)) ? (
                        <Button size="sm" onClick={() => unlockDeck(p.id)}>{T.add}</Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled={p.id === 'core-a1'} onClick={() => removeDeck(p.id)}>Remove</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-right">
                <Button variant="secondary" onClick={() => setPacksOpen(false)}>Close</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

      </CardContent>
    </Card>
  );

  return (
    <div className={`min-h-[100vh] w-full bg-gradient-to-br ${appBg} text-emerald-50 p-4 md:p-8`}> 
      <div className="max-w-5xl mx-auto flex flex-col gap-4">
        <Header />
        <HUD />

        {/* Study area */}
        <Tabs defaultValue="flash">
          <TabsList className="grid grid-cols-5 bg-black/30">
            <TabsTrigger value="flash">{STR[settings.ui].flashcards}</TabsTrigger>
            <TabsTrigger value="quiz">{STR[settings.ui].quiz}</TabsTrigger>
            <TabsTrigger value="type">{STR[settings.ui].typing}</TabsTrigger>
            <TabsTrigger value="drills">{STR[settings.ui].drills}</TabsTrigger>
            <TabsTrigger value="story">{STR[settings.ui].story}</TabsTrigger>
          </TabsList>
          <TabsContent value="flash" className="mt-3"><Flashcards /></TabsContent>
          <TabsContent value="quiz" className="mt-3"><QuizMCQ /></TabsContent>
          <TabsContent value="type" className="mt-3"><Typing /></TabsContent>
          <TabsContent value="drills" className="mt-3"><Drills /></TabsContent>
          <TabsContent value="story" className="mt-3"><Story /></TabsContent>
        </Tabs>

        <ProgressView />

        {/* Settings are purposefully away from core study flow */}
        <SettingsPanel />

        <div className="text-center text-xs opacity-60 mt-4">v0.3 — modular imports, no coins, settings panel. Local save only.</div>
      </div>
    </div>
  );
}
