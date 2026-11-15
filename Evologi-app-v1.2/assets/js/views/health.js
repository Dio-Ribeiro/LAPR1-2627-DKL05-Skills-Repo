/* EVOLI — vista Bem-estar: hidratação, pausas, movimento e tempo de ecrã */
import { S, todayKey, addDaysKey, save } from "../store.js";
import { logWater, logBreak, logMove, logScreen } from "../engine.js";
import { esc, toast, openSheet, closeModal } from "../ui.js";
import { render as rerender } from "../main.js";

export function render(root) {
  const t = todayKey();
  const g = S.settings;
  const water = S.wellness.water[t] || 0;
  const breaks = S.wellness.breaks[t] || 0;
  const move = S.wellness.moveMin[t] || 0;
  const screen = S.wellness.screenMin[t] || 0;

  root.innerHTML =
    '<div class="page-title"><div><h1>Bem-estar</h1><p>Cuida de ti — a EVOLI sente a diferença</p></div>' +
    '<button class="icon-btn" data-testid="btn-goals" id="btnGoals" aria-label="Editar objetivos pessoais"><i class="bi bi-sliders"></i></button></div>' +

    /* água */
    '<div class="card" data-testid="card-water">' +
    '<div class="sec-title" style="margin:0 0 0.4rem"><h2><i class="bi bi-droplet-fill" style="color:#4FA3D9"></i> Hidratação</h2>' +
    '<span class="chip green" data-testid="water-progress">' + water + " / " + g.waterGoal + " copos</span></div>" +
    '<div class="counter-row">' +
    '<button class="round-btn" data-testid="water-minus" id="wMinus" aria-label="Retirar um copo"><i class="bi bi-dash-lg"></i></button>' +
    '<div class="counter-val" data-testid="water-count">' + water + "<small>copos hoje</small></div>" +
    '<button class="round-btn" data-testid="water-plus" id="wPlus" aria-label="Beber um copo de água"><i class="bi bi-plus-lg"></i></button></div>' +
    '<div class="cups-track" data-testid="water-cups">' + cupsHTML(water, g.waterGoal) + "</div>" +
    '<div class="bar" style="margin-top:0.7rem"><i style="width:' + Math.min(100, water / g.waterGoal * 100) + '%"></i></div>' +
    '<div class="sec-title" style="margin:0.8rem 0 0"><h2 style="font-size:0.85rem;color:var(--muted)"><i class="bi bi-bar-chart-line"></i> Últimos 7 dias</h2></div>' +
    miniBars(S.wellness.water, days7(t), g.waterGoal, "water-chart") +
    "</div>" +

    /* pausas */
    '<div class="card" data-testid="card-breaks">' +
    '<div class="sec-title" style="margin:0 0 0.4rem"><h2><i class="bi bi-alarm" style="color:var(--terra)"></i> Pausas ativas</h2>' +
    '<span class="chip terra" data-testid="breaks-progress">' + breaks + " / " + g.breakGoal + " hoje</span></div>" +
    '<div class="counter-row">' +
    '<button class="round-btn terra" data-testid="break-now" id="bNow" aria-label="Registar uma pausa ativa"><i class="bi bi-cup-hot"></i></button>' +
    '<div class="counter-val" data-testid="breaks-count">' + breaks + "<small>pausas hoje</small></div>" +
    '<div style="width:48px"></div></div>' +
    '<p class="mini" style="text-align:center">Levanta-te, alonga, bebe um copo de água — 5 minutos chegam.</p>' +
    '<div class="sec-title" style="margin:0.8rem 0 0"><h2 style="font-size:0.85rem;color:var(--muted)"><i class="bi bi-bar-chart-line"></i> Últimos 7 dias</h2></div>' +
    miniBars(S.wellness.breaks, days7(t), g.breakGoal, "breaks-chart") +
    "</div>" +

    /* movimento */
    '<div class="card" data-testid="card-move">' +
    '<div class="sec-title" style="margin:0 0 0.4rem"><h2><i class="bi bi-bicycle" style="color:var(--sage)"></i> Movimento</h2>' +
    '<span class="chip green" data-testid="move-progress">' + move + " / " + g.moveGoal + " min</span></div>" +
    '<div style="display:flex;gap:0.5rem;flex-wrap:wrap">' +
    '<button class="btn soft sm" data-testid="move-15" data-min="15">+15 min de caminhada</button>' +
    '<button class="btn soft sm" data-testid="move-30" data-min="30">+30 min</button>' +
    '<button class="btn ghost sm" data-testid="move-custom" id="moveCustom">Outro…</button></div>' +
    '<div class="bar" style="margin-top:0.8rem"><i style="width:' + Math.min(100, move / g.moveGoal * 100) + '%"></i></div>' +
    "</div>" +

    /* tempo de ecrã */
    '<div class="card" data-testid="card-screen">' +
    '<div class="sec-title" style="margin:0 0 0.4rem"><h2><i class="bi bi-phone" style="color:var(--muted)"></i> Tempo de ecrã</h2>' +
    '<span class="chip ' + (screen > g.screenGoal ? "terra" : "green") + '" data-testid="screen-progress">' + screen + " / " + g.screenGoal + " min</span></div>" +
    '<div class="field" style="margin-bottom:0.6rem"><label for="scrMin">Registo manual de hoje (minutos de uso do telemóvel)</label>' +
    '<input type="number" id="scrMin" min="0" step="5" value="' + screen + '" data-testid="screen-input" /></div>' +
    '<button class="btn block sm" data-testid="screen-save" id="scrSave"><i class="bi bi-check-lg"></i> Guardar registo de hoje</button>' +
    '<p class="mini" style="margin-top:0.6rem" data-testid="screen-msg">' + screenMsg(screen, g.screenGoal) + "</p>" +
    '<div class="disclaimer" data-testid="screen-privacy"><i class="bi bi-shield-check"></i><span>Privacidade: a EVOLI nunca acede a mensagens, fotografias, histórico de navegação ou conteúdos pessoais. Nesta versão web o registo é manual; uma versão nativa poderia usar os dados de tempo de ecrã do próprio dispositivo, apenas com a tua autorização.</span></div>' +
    "</div>";

  root.querySelector("#wPlus").addEventListener("click", () => { logWater(1); toast("Hidratação em dia!", "bi-droplet-fill"); });
  root.querySelector("#wMinus").addEventListener("click", () => {
    if ((S.wellness.water[t] || 0) > 0) { logWater(-1); }
  });
  root.querySelector("#bNow").addEventListener("click", () => { logBreak(); toast("Boa pausa! A EVOLI recarregou.", "bi-alarm"); });
  root.querySelectorAll("[data-min]").forEach(b => b.addEventListener("click", () => { logMove(+b.dataset.min); toast("Movimento registado!", "bi-bicycle"); }));
  root.querySelector("#moveCustom").addEventListener("click", () => moveSheet());
  root.querySelector("#scrSave").addEventListener("click", () => {
    const v = Math.max(0, Math.min(1440, +root.querySelector("#scrMin").value || 0));
    logScreen(v);
    toast("Registo de tempo de ecrã guardado.", "bi-phone");
  });
  root.querySelector("#btnGoals").addEventListener("click", () => goalsSheet());
}

function cupsHTML(n, goal) {
  let s = "";
  for (let i = 0; i < Math.max(goal, n); i++) s += '<span class="cup' + (i < n ? " full" : "") + '" data-testid="cup-' + i + '"></span>';
  return s;
}
function days7(t) {
  const out = [];
  for (let i = 6; i >= 0; i--) out.push(addDaysKey(t, -i));
  return out;
}
function miniBars(map, days, goal, testid) {
  const max = Math.max(goal, ...days.map(d => map[d] || 0), 1);
  const wd = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  return '<div class="minibars" data-testid="' + testid + '">' + days.map(d => {
    const n = map[d] || 0;
    const h = Math.max(5, Math.round(n / max * 100));
    return '<div class="mb' + (d === todayKey() ? " today" : "") + '"><i style="height:' + h + '%" title="' + n + '"></i><span>' + wd[new Date(d + "T12:00:00").getDay()] + "</span></div>";
  }).join("") + "</div>";
}
function screenMsg(screen, goal) {
  if (screen === 0) return "Regista o tempo de ecrã no fim do dia para acompanhares o teu objetivo.";
  if (screen > goal) return "Acima do teu objetivo de hoje — sem culpa: amanhã é uma nova oportunidade.";
  return "Dentro do teu objetivo. A EVOLI está relaxada.";
}
function moveSheet() {
  openSheet("Registar movimento", '<div class="field"><label for="mMin">Minutos de atividade</label><input type="number" id="mMin" min="1" max="300" value="20" data-testid="move-min-input" /></div><button class="btn terra block" id="mSave" data-testid="move-save">Registar</button>', wrap => {
    wrap.querySelector("#mSave").addEventListener("click", () => {
      const v = Math.max(1, Math.min(300, +wrap.querySelector("#mMin").value || 0));
      closeModal();
      logMove(v);
      toast("Movimento registado!", "bi-bicycle");
    });
  });
}

/* objetivos pessoais */
function goalsSheet() {
  const g = S.settings;
  const body =
    '<div class="field-row">' +
    '<div class="field"><label for="gWater">Copos de água/dia</label><input type="number" id="gWater" min="1" max="20" value="' + g.waterGoal + '" data-testid="goal-water" /></div>' +
    '<div class="field"><label for="gBreak">Pausas/dia</label><input type="number" id="gBreak" min="1" max="12" value="' + g.breakGoal + '" data-testid="goal-breaks" /></div></div>' +
    '<div class="field-row">' +
    '<div class="field"><label for="gMove">Minutos de movimento/dia</label><input type="number" id="gMove" min="5" max="300" value="' + g.moveGoal + '" data-testid="goal-move" /></div>' +
    '<div class="field"><label for="gScreen">Limite de ecrã/dia (min)</label><input type="number" id="gScreen" min="15" max="900" value="' + g.screenGoal + '" data-testid="goal-screen" /></div></div>' +
    '<button class="btn terra block" id="gSave" data-testid="goals-save">Guardar objetivos</button>';
  openSheet("Objetivos pessoais", body, wrap => {
    wrap.querySelector("#gSave").addEventListener("click", () => {
      S.settings.waterGoal = Math.max(1, +wrap.querySelector("#gWater").value || 6);
      S.settings.breakGoal = Math.max(1, +wrap.querySelector("#gBreak").value || 3);
      S.settings.moveGoal = Math.max(5, +wrap.querySelector("#gMove").value || 30);
      S.settings.screenGoal = Math.max(15, +wrap.querySelector("#gScreen").value || 180);
      save();
      closeModal();
      rerender();
      toast("Objetivos atualizados.", "bi-check2");
    });
  });
}
