/* EVOLI — mascote SVG paramétrica (humor, evolução, acessórios) */
import { S } from "./store.js";

/* Fase de evolução pela experiência (nível): 1 Semente · 2 Brotinho · 3 EVOLI Jovem · 4 Guardiã */
export function evoPhase(level) {
  return level >= 10 ? 4 : level >= 6 ? 3 : level >= 3 ? 2 : 1;
}
export const EVO_NAMES = ["Semente", "Brotinho", "EVOLI Jovem", "Guardiã do mundo"];

export function moodFromEnergy(energy) {
  if (energy >= 80) return "happy";
  if (energy >= 50) return "content";
  if (energy >= 30) return "meh";
  return "tired";
}

const EYES = {
  happy: '<circle cx="80" cy="110" r="7" fill="#26384A"/><circle cx="120" cy="110" r="7" fill="#26384A"/><circle cx="82" cy="107" r="2.5" fill="#fff"/><circle cx="122" cy="107" r="2.5" fill="#fff"/>',
  content: '<circle cx="80" cy="110" r="7" fill="#26384A"/><circle cx="120" cy="110" r="7" fill="#26384A"/><circle cx="82" cy="107" r="2.5" fill="#fff"/><circle cx="122" cy="107" r="2.5" fill="#fff"/>',
  meh: '<circle cx="80" cy="111" r="6" fill="#26384A"/><circle cx="120" cy="111" r="6" fill="#26384A"/>',
  tired: '<path d="M72 112q8 5 16 0M112 112q8 5 16 0" stroke="#26384A" stroke-width="4" fill="none" stroke-linecap="round"/>',
  celebrate: '<path d="M72 110q8-10 16 0M112 110q8-10 16 0" stroke="#26384A" stroke-width="4" fill="none" stroke-linecap="round"/>'
};
const MOUTH = {
  happy: '<path d="M88 128q12 16 24 0z" fill="#26384A"/>',
  content: '<path d="M90 128q10 10 20 0" stroke="#26384A" stroke-width="4" fill="none" stroke-linecap="round"/>',
  meh: '<path d="M90 132h20" stroke="#26384A" stroke-width="4" fill="none" stroke-linecap="round"/>',
  tired: '<path d="M90 135q10-7 20 0" stroke="#26384A" stroke-width="4" fill="none" stroke-linecap="round"/>',
  celebrate: '<path d="M86 126q14 20 28 0z" fill="#26384A"/>'
};

/* acessórios do protótipo original — preservados */
const ACCESS = {
  hat: '<ellipse cx="100" cy="72" rx="52" ry="10" fill="#E7C373"/><path d="M68 72q4-26 32-26t32 26z" fill="#F0D590"/><rect x="68" y="64" width="64" height="6" fill="#C9553F"/>',
  glasses: '<g stroke="#8A5A32" stroke-width="3.5" fill="none"><circle cx="80" cy="110" r="14"/><circle cx="120" cy="110" r="14"/><path d="M94 110h12"/></g>',
  scarf: '<path d="M52 150q48 24 96 0l-4 16q-44 20-88 0z" fill="#E8806F"/><rect x="118" y="156" width="16" height="30" rx="6" fill="#D9695A"/>',
  bow: '<path d="M138 78l22-12v26z M138 78l-6-14 -6 14z" fill="#F08CA6"/><circle cx="140" cy="78" r="6" fill="#D95C82"/>'
};

/* mascotSVG({mood, size, evo}) — reutiliza a arte do protótipo e acrescenta fases de evolução */
export function mascotSVG(opts = {}) {
  const mood = opts.mood || moodFromEnergy(S.profile.energy);
  const evo = opts.evo || evoPhase(levelNow());
  const w = opts.wear === false ? {} : S.world.worn;
  const glow = evo >= 4 ? '<circle cx="100" cy="100" r="86" fill="#C6E3A0" opacity="0.25"/>' : "";
  const extraLeaf = evo >= 2 ? '<path d="M100 52Q82 42 76 54Q90 62 100 52z" fill="#8BC15E" opacity="0.95"/>' : "";
  const crown = evo >= 3 ? '<circle cx="72" cy="66" r="5" fill="#76A035"/><circle cx="128" cy="66" r="5" fill="#76A035"/><circle cx="100" cy="30" r="5" fill="#D97736"/>' : "";
  const flower = evo >= 4 ? '<circle cx="100" cy="38" r="5" fill="#F08CA6"/><circle cx="100" cy="38" r="2" fill="#FFD54F"/>' : "";
  const sparkle = mood === "celebrate" ? '<path d="M40 70l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#FFD54F"/><path d="M162 92l2.5 6 6 2.5-6 2.5-2.5 6-2.5-6-6-2.5 6-2.5z" fill="#D97736"/>' : "";
  /* piscar os olhos: cobre os olhos abertos periodicamente */
  const eyesClosed = mood === "tired" ? "" : '<g class="eyes-closed"><path d="M72 110q8-10 16 0M112 110q8-10 16 0" stroke="#26384A" stroke-width="4" fill="none" stroke-linecap="round"/></g>';
  const hearts = mood === "happy" || mood === "celebrate" ? '<g class="reaction-hearts"><path d="M62 74c-2-5-8-6-10-1-2 5 3 9 10 12 7-3 12-7 10-12-2-5-8-4-10 1z" fill="#F08CA6"/><path d="M138 78c-1-4-6-5-8-1-2 4 2 8 8 11 6-3 10-7 8-11-2-4-7-3-8 1z" fill="#F4A9A0"/></g>' : "";
  return '<svg viewBox="0 0 200 200" role="img" aria-label="EVOLI, a mascote verde com um rebento na cabeça" class="float">' +
    '<ellipse cx="100" cy="184" rx="52" ry="8" fill="#26384A" opacity=".12"/>' +
    '<ellipse cx="70" cy="176" rx="16" ry="9" fill="#5E8D45"/><ellipse cx="130" cy="176" rx="16" ry="9" fill="#5E8D45"/>' +
    glow +
    '<ellipse cx="100" cy="122" rx="62" ry="56" fill="#86AE60"/>' +
    '<ellipse cx="100" cy="140" rx="36" ry="30" fill="#BBD593"/>' +
    (w.hat ? ACCESS.hat : "") +
    '<path d="M100 70Q98 52 100 40" stroke="#4F7F3C" stroke-width="5" fill="none" stroke-linecap="round"/>' +
    '<path d="M100 46Q74 30 66 48Q84 62 100 46z" fill="#6FA34B"/><path d="M100 42Q126 22 136 40Q116 56 100 42z" fill="#8BC15E"/>' +
    extraLeaf + crown + flower +
    EYES[mood] + eyesClosed +
    '<circle cx="64" cy="124" r="8" fill="#F4A9A0" opacity=".7"/><circle cx="136" cy="124" r="8" fill="#F4A9A0" opacity=".7"/>' +
    MOUTH[mood] +
    hearts +
    (w.glasses ? ACCESS.glasses : "") +
    (w.scarf ? ACCESS.scarf : "") +
    (w.bow ? ACCESS.bow : "") +
    sparkle +
    "</svg>";
}

function levelNow() {
  let level = 1, rem = S.profile.xp;
  while (rem >= 100 + (level - 1) * 50) { rem -= 100 + (level - 1) * 50; level++; }
  return level;
}

/* Mensagens da EVOLI — contexto real do estado */
export function speak(ctx = {}) {
  const e = S.profile.energy;
  const urgent = (S.pantry || []).filter(i => i.expiry && daysToExp(i.expiry) <= 1);
  const left = ctx.missionsLeft || 0;
  if (moodFromEnergy(e) === "tired") return "Estou com sono… que tal uma pausa e um copo de água?";
  if (urgent.length) return urgent[0].name + " acaba " + (daysToExp(urgent[0].expiry) === 0 ? "hoje" : "amanhã") + "! Cozinhamos algo?";
  if (left > 0) return "Faltam " + left + (left === 1 ? " missão" : " missões") + " hoje. Vamos a isso!";
  if (moodFromEnergy(e) === "happy") return "Estou radiante! Obrigada por cuidares de nós.";
  return "Tudo em dia por aqui. Gosto de ti.";
}
function daysToExp(k) {
  const p = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  return Math.round((p(k) - p(new Date().toLocaleDateString("en-CA"))) / 864e5);
}
