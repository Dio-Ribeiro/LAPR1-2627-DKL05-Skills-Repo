/* EVOLI — o mundo da mascote: ecossistema SVG que evolui com ações sustentáveis */
import { S } from "./store.js";
import { mascotSVG } from "./mascot.js";

/* Progresso do mundo = CO₂e acumulado das ações registadas de aproveitamento.
   Fase 1 < 5 · Fase 2 < 12 · Fase 3 < 22 · Fase 4 ≥ 22 (kg CO₂e estimados) */
export const WORLD_PHASES = [5, 12, 22];
export const PHASE_NAMES = ["Um começo simples", "Primeiros rebentos", "Verde e vivo", "Ecossistema próspero"];

export function worldTotalCo2() {
  return S.waste.reduce((a, w) => a + (w.co2e || 0), 0);
}
export function worldTotalKg() {
  return S.waste.reduce((a, w) => a + (w.kg || 0), 0);
}
export function worldPhase() {
  const t = worldTotalCo2();
  return t < WORLD_PHASES[0] ? 1 : t < WORLD_PHASES[1] ? 2 : t < WORLD_PHASES[2] ? 3 : 4;
}
export function worldInfo() {
  const t = worldTotalCo2(), phase = worldPhase();
  const next = phase <= 3 ? WORLD_PHASES[phase - 1] : null;
  const cur = phase === 1 ? t : t - WORLD_PHASES[phase - 2];
  const span = next ? next - (phase === 1 ? 0 : WORLD_PHASES[phase - 2]) : 1;
  return { phase, name: PHASE_NAMES[phase - 1], cur: Math.max(0, cur), next, pct: next ? Math.min(100, Math.round(cur / span * 100)) : 100, total: t };
}

const SKY = ["#E3DECB", "#DCE8DC", "#CFE6E0", "#C5E4F2"];
const GROUND = ["#C9A97A", "#A8C47E", "#8FBF62", "#6FB04F"];

function plants(p) {
  let s = "";
  if (p >= 1) s += '<path d="M60 150v-30M60 135l-12-10M60 128l10-10" stroke="#8B6B43" stroke-width="4" stroke-linecap="round"/><path d="M250 155v-24M250 142l-10-8" stroke="#8B6B43" stroke-width="4" stroke-linecap="round"/>';
  if (p >= 2) s += [[50, 150], [110, 160], [230, 152]].map(pt => '<path d="M' + pt[0] + " " + pt[1] + 'v-14" stroke="#4F7F3C" stroke-width="4"/><ellipse cx="' + (pt[0] - 6) + '" cy="' + (pt[1] - 16) + '" rx="8" ry="5" fill="#6FA34B"/><ellipse cx="' + (pt[0] + 7) + '" cy="' + (pt[1] - 18) + '" rx="8" ry="5" fill="#8BC15E"/>').join("");
  if (p >= 3) s += [[40, 140], [270, 140], [170, 150]].map(pt => '<rect x="' + (pt[0] - 4) + '" y="' + (pt[1] - 30) + '" width="8" height="34" fill="#8B6B43"/><circle cx="' + pt[0] + '" cy="' + (pt[1] - 42) + '" r="26" fill="#4F9A47"/><circle cx="' + (pt[0] + 14) + '" cy="' + (pt[1] - 32) + '" r="18" fill="#6FB04F"/>').join("");
  if (p >= 4) {
    s += '<ellipse cx="160" cy="185" rx="52" ry="10" fill="#9CC8E8"/><ellipse cx="160" cy="185" rx="40" ry="7" fill="#7FB4DC"/>' +
      [[90, 170], [130, 176], [210, 172], [245, 178]].map((pt, i) => '<circle cx="' + pt[0] + '" cy="' + pt[1] + '" r="5" fill="' + ["#F28CA6", "#FFD54F", "#fff", "#F28CA6"][i] + '"/>').join("") +
      '<ellipse cx="255" cy="120" rx="7" ry="4" fill="#D97736"/><path d="M255 124q-10 6 -18 4" stroke="#53685B" stroke-width="2.5" fill="none"/>';
  }
  return s;
}

function scenery() {
  let s = "";
  if (S.world.owned.planter) s += '<g transform="translate(20 130)"><rect x="0" y="14" width="30" height="18" rx="4" fill="#B85E20"/><circle cx="9" cy="10" r="7" fill="#6FB04F"/><circle cx="20" cy="6" r="8" fill="#8BC15E"/><circle cx="27" cy="12" r="6" fill="#6FA34B"/></g>';
  if (S.world.owned.feeder) s += '<g transform="translate(275 128)"><path d="M0 14h28l-4 12H4z" fill="#8B6B43"/><path d="M6 14q8-14 16 0" stroke="#4F7F3C" stroke-width="3" fill="none"/><circle cx="30" cy="0" r="5" fill="#D97736"/><path d="M34 0l6 3-6 3z" fill="#C99A2E"/></g>';
  if (S.world.owned.bench) s += '<g transform="translate(150 158)"><rect x="0" y="0" width="44" height="6" rx="3" fill="#A9835A"/><rect x="4" y="6" width="5" height="14" fill="#8B6B43"/><rect x="35" y="6" width="5" height="14" fill="#8B6B43"/></g>';
  return s;
}

export function worldSVG() {
  const p = worldPhase();
  const info = worldInfo();
  const mascot = mascotSVG().replace(/<svg[^>]*>/, "").replace(/<\/svg>/, "");
  const clouds = p >= 2 ? '<ellipse cx="80" cy="50" rx="30" ry="10" fill="#fff" opacity=".8"/>' + (p >= 3 ? '<ellipse cx="230" cy="36" rx="26" ry="9" fill="#fff" opacity=".7"/>' : "") : "";
  const sun = p >= 2 ? '<circle cx="260" cy="40" r="24" fill="#FFE18A"/>' : '<circle cx="260" cy="40" r="22" fill="#E8DDB8"/>';
  return '<svg viewBox="0 0 320 220" role="img" aria-label="O mundo da EVOLI, fase ' + p + '">' +
    '<rect width="320" height="220" fill="' + SKY[p - 1] + '"/>' + sun + clouds +
    '<ellipse cx="160" cy="215" rx="260" ry="75" fill="' + GROUND[p - 1] + '"/>' +
    plants(p) + scenery() +
    '<g transform="translate(112 92) scale(.48)">' + mascot + "</g></svg>";
}
