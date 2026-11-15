/* EVOLI — store: estado persistente (localStorage) + utilitários de data */
import { guessEmoji, guessFactorId } from "./data.js";

export const LS_KEY = "evoli_app_v1";
const SCHEMA = 1;

export function pad(n) { return String(n).padStart(2, "0"); }
export function todayKey(d = new Date()) {
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}
export function parseKey(k) {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
}
export function addDaysKey(k, n) {
  const d = parseKey(k);
  d.setDate(d.getDate() + n);
  return todayKey(d);
}
export function dayDiff(a, b) {
  return Math.round((parseKey(b) - parseKey(a)) / 864e5);
}
export function weekdayMon(k) { return (parseKey(k).getDay() + 6) % 7; }
export function weekStartKey(k = todayKey()) {
  return addDaysKey(k, -weekdayMon(k));
}
export function fmtDayShort(k) {
  try {
    return parseKey(k).toLocaleDateString("pt-PT", { weekday: "short", day: "numeric" });
  } catch (e) { return k; }
}
export function fmtDate(k) {
  try {
    return parseKey(k).toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
  } catch (e) { return k; }
}
export function daysToExpiry(expiry, from = todayKey()) {
  return Math.round((parseKey(expiry) - parseKey(from)) / 864e5);
}
export function fmtNum(n, dec = 2) {
  return Number(n).toFixed(dec).replace(".", ",");
}

function seedPantry() {
  const mk = (name, qty, unit, days) => ({
    id: "p" + Math.random().toString(36).slice(2, 9),
    name, emoji: guessEmoji(name), qty, unit, kg: unit === "kg" ? qty : unit === "un" ? +(qty * 0.15).toFixed(2) : 1,
    expiry: addDaysKey(todayKey(), days),
    factorId: guessFactorId(name),
    addedAt: new Date().toISOString()
  });
  return [
    mk("Iogurte natural", 2, "un", 1),
    mk("Tomates", 0.4, "kg", 2),
    mk("Arroz cozido", 0.3, "kg", 2),
    mk("Ovos", 4, "un", 6),
    mk("Espinafres", 0.2, "kg", 3)
  ];
}

function defaults() {
  return {
    schema: SCHEMA,
    profile: { name: "", xp: 0, coins: 60, energy: 75, lastDay: null, createdAt: todayKey() },
    streak: { current: 0, best: 0 },
    missions: { date: null, daily: [], week: { start: null, challenges: [] } },
    habits: [],
    pantry: [],
    waste: [],
    wellness: { water: {}, breaks: {}, moveMin: {}, screenMin: {} },
    world: { owned: {}, worn: {} },
    achievements: {},
    activity: [],
    stats: { totalDone: 0, doneByDay: {}, xpByDay: {}, habitsCreated: 0 },
    settings: { waterGoal: 6, breakGoal: 3, moveGoal: 30, screenGoal: 180, reminders: true },
    tab: "inicio"
  };
}

function merge(base, extra) {
  for (const k in extra) {
    if (extra[k] && typeof extra[k] === "object" && !Array.isArray(extra[k]) && base[k] && typeof base[k] === "object" && !Array.isArray(base[k])) {
      merge(base[k], extra[k]);
    } else if (extra[k] !== undefined && extra[k] !== null) {
      base[k] = extra[k];
    }
  }
  return base;
}

function load() {
  const d = defaults();
  let first = false;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) merge(d, JSON.parse(raw));
    else first = true;
  } catch (e) { /* estado corrompido: recomeça limpo */ }
  if (first || !Array.isArray(d.pantry) || !d.pantry.length) {
    if (first) d.pantry = seedPantry();
  }
  return d;
}

export const S = load();

export function save() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(S));
  } catch (e) { /* armazenamento cheio/indisponível */ }
}

export function resetAll() {
  try { localStorage.removeItem(LS_KEY); } catch (e) {}
  location.reload();
}

export function replaceState(data) {
  if (!data || typeof data !== "object" || !data.profile) throw new Error("Ficheiro inválido: sem perfil EVOLI.");
  const fresh = defaults();
  merge(fresh, data);
  fresh.schema = SCHEMA;
  try { localStorage.setItem(LS_KEY, JSON.stringify(fresh)); } catch (e) { throw new Error("Não foi possível guardar."); }
  location.reload();
}

export function exportState() {
  return JSON.stringify(S, null, 2);
}
