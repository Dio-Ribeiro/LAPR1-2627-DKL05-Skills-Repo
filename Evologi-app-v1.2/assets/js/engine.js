/* EVOLI — motor: XP, níveis, energia, streaks, missões, conquistas, despensa, impacto */
import { S, save, todayKey, addDaysKey, dayDiff, weekStartKey, weekdayMon } from "./store.js";
import { MISSION_POOL, WEEKLY_POOL, ACHIEVEMENTS, factorById, guessFactorId } from "./data.js";
import { toast, celebrate } from "./ui.js";
import { worldPhase, worldTotalCo2 } from "./world.js";
import { moodFromEnergy, evoPhase, EVO_NAMES } from "./mascot.js";

/* ---------- barramento de atualização ---------- */
const listeners = [];
export function onChange(fn) { listeners.push(fn); }
function commit() {
  syncMissions();
  syncWeekly();
  recomputeStreak();
  save();
  checkAchievements();
  save();
  listeners.forEach(f => f());
}

/* ---------- XP / níveis / energia / sementes ---------- */
export function xpNeed(level) { return 100 + (level - 1) * 50; }
export function levelInfo(xp) {
  let level = 1, rem = xp;
  while (rem >= xpNeed(level)) { rem -= xpNeed(level); level++; }
  return { level, into: rem, need: xpNeed(level), pct: Math.min(100, Math.round(rem / xpNeed(level) * 100)) };
}
function addXp(n) {
  const before = levelInfo(S.profile.xp).level;
  S.profile.xp += n;
  S.stats.xpByDay[todayKey()] = (S.stats.xpByDay[todayKey()] || 0) + n;
  const after = levelInfo(S.profile.xp).level;
  if (after > before) {
    const phase = evoPhase(after);
    setTimeout(() => celebrate("🌱", "Nível " + after + "!", "A EVOLI agora é " + EVO_NAMES[phase - 1] + (phase > 1 ? " (fase de evolução " + phase + ")" : "")), 350);
  }
}
function addCoins(n) { S.profile.coins += n; }
function addEnergy(n) { S.profile.energy = Math.max(0, Math.min(100, S.profile.energy + n)); }

/* ---------- histórico ---------- */
export function activity(type, icon, label, xp = 0, coins = 0, energy = 0) {
  S.activity.unshift({ ts: new Date().toISOString(), type, icon, label, xp, coins, energy });
  if (S.activity.length > 200) S.activity.length = 200;
}

/* ---------- despensa: helpers ---------- */
export function pantryExpiring(days = 3, from = todayKey()) {
  return S.pantry.filter(i => dayDiff(from, i.expiry) <= days);
}
export function foodKg() { return S.waste.reduce((a, w) => a + (w.kg || 0), 0); }
export function co2Kg() { return S.waste.reduce((a, w) => a + (w.co2e || 0), 0); }
export function wasteToday() { return S.waste.filter(w => w.date === todayKey()); }

/* Registo de aproveitamento: kg reais × fator de emissão (estimativa). */
export function useItems(entries) {
  if (!entries.length) return;
  const t = todayKey();
  let kg = 0, co2 = 0, expiring = 0;
  entries.forEach(en => {
    const factor = factorById(en.item.factorId).f;
    const e = en.kg * factor;
    kg += en.kg; co2 += e;
    if (dayDiff(t, en.item.expiry) <= 3) expiring++;
    S.waste.unshift({ date: t, name: en.item.name, kg: en.kg, co2e: e, factor, expiring: dayDiff(t, en.item.expiry) <= 3 });
    S.pantry = S.pantry.filter(p => p.id !== en.item.id);
  });
  const xp = 15 + 5 * entries.length, coins = 15 + 5 * entries.length;
  addXp(xp); addCoins(coins); addEnergy(5);
  activity("cook", "bi-egg-fried", "Aproveitaste " + entries.length + " ingrediente" + (entries.length > 1 ? "s" : "") + " (" + kg.toFixed(2).replace(".", ",") + " kg)", xp, coins, 5);
  commit();
  celebrate("🍳", "Refeição salva!", "+" + kg.toFixed(2).replace(".", ",") + " kg · ≈" + co2.toFixed(2).replace(".", ",") + " kg CO₂e evitados (estimativa)");
}

export function addPantryItem(item) {
  item.id = "p" + Math.random().toString(36).slice(2, 9);
  item.emoji = item.emoji || "🥣";
  item.factorId = item.factorId || guessFactorId(item.name);
  item.addedAt = new Date().toISOString();
  S.pantry.push(item);
  commit();
}
export function updatePantryItem(id, patch) {
  const it = S.pantry.find(p => p.id === id);
  if (!it) return;
  Object.assign(it, patch);
  commit();
}
export function removePantryItem(id) {
  S.pantry = S.pantry.filter(p => p.id !== id);
  commit();
}

/* ---------- hábitos ---------- */
export function addHabit(h) {
  h.id = "h" + Math.random().toString(36).slice(2, 9);
  h.log = {};
  h.createdAt = new Date().toISOString();
  h.archived = false;
  S.habits.push(h);
  S.stats.habitsCreated++;
  commit();
}
export function updateHabit(id, patch) {
  const h = S.habits.find(x => x.id === id);
  if (h) { Object.assign(h, patch); commit(); }
}
export function deleteHabit(id) {
  S.habits = S.habits.filter(x => x.id !== id);
  commit();
}
export function isScheduled(h, d = todayKey()) {
  if (h.archived) return false;
  if ((h.createdAt || "").slice(0, 10) > d) return false;
  if (h.freq.type === "daily") return true;
  if (h.freq.type === "days") return (h.freq.days || []).includes(weekdayMon(d));
  return false; // semanal conta por semana, não por dia
}
export function habitDoneOn(h, d = todayKey()) {
  return (h.log[d] || 0) >= h.target;
}
export function countScheduled(d = todayKey()) {
  return S.habits.filter(h => isScheduled(h, d)).length;
}
export function allScheduledDone(d = todayKey()) {
  const n = countScheduled(d);
  return n > 0 && S.habits.every(h => !isScheduled(h, d) || habitDoneOn(h, d));
}
export function weekCount(h) {
  const ws = weekStartKey();
  let n = 0;
  for (let i = 0; i < 7; i++) n += (h.log[addDaysKey(ws, i)] || 0) > 0 ? 1 : 0;
  return n;
}
export function habitStreak(h) {
  if (h.freq.type === "weekly") {
    let weeks = 0, ws = weekStartKey();
    const cur = weekCount(h) >= h.target;
    if (!cur) ws = addDaysKey(ws, -7);
    for (let i = 0; i < 52; i++) {
      let n = 0;
      for (let j = 0; j < 7; j++) n += (h.log[addDaysKey(ws, j)] || 0) > 0 ? 1 : 0;
      if (n >= h.target) { weeks++; ws = addDaysKey(ws, -7); } else break;
    }
    return weeks;
  }
  let d = todayKey(), n = 0;
  if (habitDoneOn(h, d)) n++;
  d = addDaysKey(d, -1);
  for (let i = 0; i < 365; i++) {
    if (!isScheduled(h, d)) { d = addDaysKey(d, -1); continue; }
    if (habitDoneOn(h, d)) { n++; d = addDaysKey(d, -1); } else break;
  }
  return n;
}

export function checkInHabit(h, d = todayKey()) {
  const cur = h.log[d] || 0;
  if (cur >= h.target) return false;
  h.log[d] = cur + 1;
  if (h.log[d] >= h.target) {
    const en = h.category === "saude" ? 10 : 4;
    addXp(10); addCoins(5); addEnergy(en);
    S.stats.totalDone++;
    S.stats.doneByDay[d] = (S.stats.doneByDay[d] || 0) + 1;
    activity("habit", "bi-check2-circle", "Hábito cumprido: " + h.name, 10, 5, en);
    if (allScheduledDone(d)) setTimeout(() => celebrate("🎉", "Dia completo!", "Todos os hábitos de hoje cumpridos"), 250);
    recomputeStreak();
  }
  commit();
  return true;
}
export function undoCheckInHabit(h, d = todayKey()) {
  const cur = h.log[d] || 0;
  if (cur <= 0) return;
  h.log[d] = cur - 1;
  commit();
}

/* Streak global: dias consecutivos (até hoje) em que todos os hábitos agendados ficaram cumpridos.
   Dias sem hábitos agendados não quebram a sequência. XP, níveis e conquistas nunca se perdem. */
export function recomputeStreak() {
  let d = todayKey(), n = 0;
  if (countScheduled(d) > 0 && allScheduledDone(d)) n++;
  d = addDaysKey(d, -1);
  for (let i = 0; i < 366; i++) {
    if (countScheduled(d) === 0) { d = addDaysKey(d, -1); continue; }
    if (allScheduledDone(d)) { n++; d = addDaysKey(d, -1); } else break;
  }
  S.streak.current = n;
  S.streak.best = Math.max(S.streak.best, n);
}

/* ---------- bem-estar ---------- */
export function logWater(n = 1) {
  const t = todayKey();
  S.wellness.water[t] = (S.wellness.water[t] || 0) + n;
  addEnergy(4); addXp(2);
  activity("water", "bi-droplet-fill", "Bebeste um copo de água", 2, 0, 4);
  commit();
}
export function logBreak() {
  const t = todayKey();
  S.wellness.breaks[t] = (S.wellness.breaks[t] || 0) + 1;
  addEnergy(10); addXp(5); addCoins(2);
  activity("break", "bi-alarm", "Pausa ativa realizada", 5, 2, 10);
  commit();
}
export function logMove(min) {
  const t = todayKey();
  S.wellness.moveMin[t] = (S.wellness.moveMin[t] || 0) + min;
  const en = Math.min(15, Math.round(min * 0.5));
  addEnergy(en); addXp(Math.max(2, Math.ceil(min / 5) * 2)); addCoins(Math.max(1, Math.ceil(min / 10)));
  activity("move", "bi-bicycle", "Movimento: " + min + " min", Math.max(2, Math.ceil(min / 5) * 2), Math.max(1, Math.ceil(min / 10)), en);
  commit();
}
export function logScreen(min) {
  const t = todayKey();
  S.wellness.screenMin[t] = min;
  activity("screen", "bi-phone", "Tempo de ecrã registado: " + min + " min", 2, 1, 2);
  addEnergy(2); addXp(2);
  commit();
}

/* ---------- missões ---------- */
export function syncMissions() {
  const t = todayKey();
  if (S.missions.date !== t) return;
  let changed = false;
  S.missions.daily.forEach(m => {
    if (m.done) return;
    m.progress = missionProgressValue(m.key, t);
    if (m.progress >= m.target) {
      m.done = true; changed = true;
      addXp(m.xp); addCoins(m.coins); addEnergy(m.energy);
      activity("mission", "bi-star", "Missão concluída: " + m.title, m.xp, m.coins, m.energy);
      setTimeout(() => celebrate("⭐", "Missão concluída!", m.title + " · +" + m.xp + " XP · +" + m.coins + " 🌰"), 150);
    }
  });
  if (changed) save();
}
function missionProgressValue(key, t) {
  switch (key) {
    case "agua": return Math.min(3, S.wellness.water[t] || 0);
    case "pausa": return Math.min(1, S.wellness.breaks[t] || 0);
    case "mover": return Math.min(15, S.wellness.moveMin[t] || 0);
    case "ecra": return (S.wellness.screenMin[t] || 0) > 0 ? 1 : 0;
    case "usar": return Math.min(1, wasteToday().filter(w => w.expiring).length > 0 ? 1 : 0);
    case "cozinhar": return Math.min(1, S.activity.filter(a => a.type === "cook" && a.ts.slice(0, 10) === t).length);
    case "habitos": return (countScheduled(t) > 0 && allScheduledDone(t)) ? 1 : 0;
    default: return 0;
  }
}
function generateDaily(t) {
  const start = Math.floor(Date.parse(t + "T00:00:00") / 864e5) % MISSION_POOL.length;
  const daily = [];
  for (let i = 0; i < 4; i++) {
    const m = MISSION_POOL[(start + i) % MISSION_POOL.length];
    daily.push({ key: m.key, icon: m.icon, title: m.title, target: m.target, progress: 0, xp: m.xp, coins: m.coins, energy: m.energy, done: false });
  }
  S.missions = { date: t, daily, week: S.missions.week };
}
export function syncWeekly() {
  const ws = weekStartKey();
  if (S.missions.week.start !== ws) return;
  let changed = false;
  S.missions.week.challenges.forEach(c => {
    if (c.done) return;
    c.progress = weeklyValue(c.key);
    if (c.progress >= c.target) {
      c.done = true; changed = true;
      addXp(c.xp); addCoins(c.coins);
      activity("weekly", "bi-trophy", "Desafio semanal: " + c.title, c.xp, c.coins, 0);
      setTimeout(() => celebrate("🏆", "Desafio semanal!", c.title + " · +" + c.xp + " XP"), 150);
    }
  });
  if (changed) save();
}
function weeklyValue(key) {
  const ws = weekStartKey(), t = todayKey();
  let v = 0;
  if (key === "agua-s") { for (let i = 0; i < 7; i++) { const d = addDaysKey(ws, i); if (d <= t) v += S.wellness.water[d] || 0; } }
  if (key === "pausas-s") { const days = new Set(); for (let i = 0; i < 7; i++) { const d = addDaysKey(ws, i); if ((S.wellness.breaks[d] || 0) > 0) days.add(d); } v = days.size; }
  if (key === "usar-s") { v = S.waste.filter(w => w.date >= ws && w.date <= t).length; }
  if (key === "mover-s") { for (let i = 0; i < 7; i++) { const d = addDaysKey(ws, i); if (d <= t) v += S.wellness.moveMin[d] || 0; } }
  return Math.min(v, 999);
}
function generateWeekly(ws) {
  const weekN = Math.floor(Date.parse(ws + "T00:00:00") / (7 * 864e5));
  const start = weekN % WEEKLY_POOL.length;
  const ch = [];
  for (let i = 0; i < 3; i++) {
    const c = WEEKLY_POOL[(start + i) % WEEKLY_POOL.length];
    ch.push({ key: c.key, icon: c.icon, title: c.title, target: c.target, progress: 0, xp: c.xp, coins: c.coins, done: false });
  }
  S.missions.week = { start: ws, challenges: ch };
}

/* ---------- conquistas ---------- */
function sumMap(m) { return Object.values(m).reduce((a, b) => a + b, 0); }
const ACH_CHECKS = {
  "primeira-refeicao": s => s.waste.length >= 1,
  "kg-1": () => foodKg() >= 1,
  "kg-5": () => foodKg() >= 5,
  "co2-10": () => co2Kg() >= 10,
  "streak-3": s => s.streak.best >= 3,
  "streak-7": s => s.streak.best >= 7,
  "streak-30": s => s.streak.best >= 30,
  "nivel-5": s => levelInfo(s.profile.xp).level >= 5,
  "agua-100": s => sumMap(s.wellness.water) >= 100,
  "habitos-10": s => s.stats.habitsCreated >= 10,
  "feitos-50": s => s.stats.totalDone >= 50,
  "colecionador": s => Object.keys(s.world.owned).length >= 3,
  "mundo-4": () => worldPhase() >= 4
};
export function checkAchievements() {
  ACHIEVEMENTS.forEach(a => {
    if (!S.achievements[a.id] && ACH_CHECKS[a.id] && ACH_CHECKS[a.id](S)) {
      S.achievements[a.id] = new Date().toISOString();
      addCoins(30);
      activity("ach", "bi-trophy", "Conquista desbloqueada: " + a.title, 0, 30, 0);
      toast("Conquista: " + a.title + " · +30 🌰", "bi-trophy");
    }
  });
}

/* ---------- loja ---------- */
export function buy(item, price) {
  if (S.profile.coins < price) return false;
  S.profile.coins -= price;
  S.world.owned[item] = true;
  activity("shop", "bi-bag", "Compraste: " + item, 0, -price, 0);
  commit();
  return true;
}
export function wearToggle(item) {
  S.world.worn[item] = !S.world.worn[item];
  commit();
}

/* ---------- novo dia ---------- */
export function ensureDay() {
  const t = todayKey();
  if (S.profile.lastDay === t) {
    /* garante missões mesmo se a geração falhou anteriormente */
    if (!Array.isArray(S.missions.daily) || S.missions.daily.length === 0) {
      generateDaily(t);
      const ws = weekStartKey(t);
      if (S.missions.week.start !== ws) generateWeekly(ws);
      commit();
    }
    return;
  }
  if (S.profile.lastDay) {
    const missed = Math.min(Math.max(dayDiff(S.profile.lastDay, t), 1), 7);
    S.profile.energy = Math.max(25, S.profile.energy - 12 * missed);
  }
  S.profile.lastDay = t;
  const ws = weekStartKey(t);
  if (S.missions.week.start !== ws) { S.missions.week = { start: ws, challenges: [] }; generateWeekly(ws); }
  generateDaily(t);
  recomputeStreak();
  commit();
}

/* Import/export */
export { save };
export { moodFromEnergy, evoPhase, EVO_NAMES };
