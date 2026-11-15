/* EVOLI — vista Início (dashboard) */
import { S, todayKey, weekStartKey, addDaysKey, fmtNum } from "../store.js";
import { QUOTES } from "../data.js";
import { levelInfo, countScheduled, allScheduledDone, habitDoneOn, logWater, logBreak, foodKg, co2Kg, isScheduled } from "../engine.js";
import { mascotSVG, moodFromEnergy, speak, evoPhase, EVO_NAMES } from "../mascot.js";
import { esc, toast } from "../ui.js";
import { goTab } from "../main.js";

export function render(root) {
  const t = todayKey();
  const li = levelInfo(S.profile.xp);
  const sched = countScheduled(t);
  const schedDone = S.habits.filter(h => isScheduled(h, t) && habitDoneOn(h, t)).length;
  const missions = S.missions.daily;
  const mDone = missions.filter(m => m.done).length;
  const mLeft = missions.length - mDone;
  const total = sched + missions.length;
  const done = schedDone + mDone;
  const pct = total ? Math.round(done / total * 100) : 0;
  const dayN = Math.floor(Date.parse(t + "T00:00:00") / 864e5);
  const quote = QUOTES[dayN % QUOTES.length];

  /* resumo semanal: conclusões de hábitos nos últimos 7 dias */
  const days = [];
  for (let i = 6; i >= 0; i--) days.push(addDaysKey(t, -i));
  const maxDone = Math.max(1, ...days.map(d => S.stats.doneByDay[d] || 0));
  const weekXP = days.reduce((a, d) => a + (S.stats.xpByDay[d] || 0), 0);
  const wd = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  const bars = days.map(d => {
    const n = S.stats.doneByDay[d] || 0;
    const h = Math.max(6, Math.round(n / maxDone * 100));
    const lbl = wd[new Date(d + "T12:00:00").getDay()];
    return '<div class="mb' + (d === t ? " today" : "") + '"><i style="height:' + h + '%" title="' + n + ' hábitos"></i><span>' + lbl + "</span></div>";
  }).join("");

  const isNewUser = S.stats.totalDone === 0 && S.habits.length === 0 && S.waste.length === 0;
  const hasProgress = pct > 0;

  root.innerHTML =
    '<section class="mascot-stage" data-testid="dash-mascot-stage">' +
    '<div class="bubble" data-testid="dash-bubble">' + esc(speak({ missionsLeft: mLeft })) + "</div>" +
    '<div class="mascot-svg" data-testid="dash-mascot">' + mascotSVG() + "</div>" +
    '<div class="energy-head"><span><i class="bi bi-lightning-charge-fill"></i> Energia da EVOLI</span><span data-testid="dash-energy-value">' + S.profile.energy + "%</span></div>" +
    '<div class="bar"><i style="width:' + S.profile.energy + '%" data-testid="dash-energy-bar"></i></div>' +
    "</section>" +

    '<div class="grid2" style="margin-bottom:1rem">' +
    '<div class="stat-card" data-testid="dash-card-level"><b><i class="bi bi-star-fill" style="color:var(--amber)"></i> Nível ' + li.level + "</b><span>" + li.into + " / " + li.need + " XP · " + EVO_NAMES[evoPhase(li.level) - 1] + '</span><div class="bar" style="margin-top:6px"><i style="width:' + li.pct + '%"></i></div></div>' +
    '<div class="stat-card" data-testid="dash-card-streak"><b><i class="bi bi-fire" style="color:var(--terra)"></i> ' + (S.streak.current > 0 ? S.streak.current + " dia" + (S.streak.current === 1 ? "" : "s") : "Começa hoje") + "</b><span>" + (S.streak.best > 0 ? "Sequência atual · recorde: " + S.streak.best : "Completa um hábito e inicia a tua sequência") + "</span></div>" +
    "</div>" +

    /* progresso diário — destaque máximo */
    '<div class="card" data-testid="dash-card-progress" style="background:linear-gradient(160deg, #F4F9EA, #EAF2DC);border-color:rgba(118,160,53,0.3)">' +
    '<div style="display:flex;align-items:center;gap:1.1rem">' +
    '<div class="ring-wrap" style="width:104px;height:104px;flex-shrink:0">' +
    '<svg viewBox="0 0 120 120"><circle class="ring-track" cx="60" cy="60" r="50"/><circle class="ring-val" cx="60" cy="60" r="50" stroke-dasharray="314" stroke-dashoffset="' + 314 * (1 - pct / 100) + '"/></svg>' +
    '<div class="ring-txt"><b data-testid="dash-progress-pct">' + pct + "%</b><span>de hoje</span></div></div>" +
    '<div><b style="font-size:1rem">Progresso diário</b>' +
    (hasProgress
      ? '<p class="sub" data-testid="dash-progress-detail">' + schedDone + " de " + sched + " hábitos · " + mDone + " de " + missions.length + " missões</p>"
      : '<p class="sub" data-testid="dash-progress-detail">Ainda nada — o teu dia começa agora. Escolhe um primeiro passo pequeno.</p>') +
    '<div style="display:flex;gap:0.4rem;margin-top:0.6rem;flex-wrap:wrap">' +
    '<button class="btn terra sm" data-testid="qa-water" id="qaWater"><i class="bi bi-droplet-fill"></i> Beber água</button>' +
    '<button class="btn sm" data-testid="qa-break" id="qaBreak"><i class="bi bi-alarm"></i> Fazer pausa</button>' +
    "</div></div></div></div>" +

    /* missões ou mensagem de boas-vindas */
    (isNewUser
      ? '<div class="card empty-state" data-testid="dash-welcome">' +
        '<div class="empty-illus">🌱</div>' +
        '<h3>A tua aventura começa aqui!</h3>' +
        "<p>A EVOLI acordou à tua espera. Cria o teu primeiro hábito ou bebe um copo de água — cada pequeno gesto ajuda-a a crescer.</p>" +
        '<button class="btn terra" data-testid="btn-first-habit" id="btnFirstHabit"><i class="bi bi-plus-lg"></i> Criar o meu primeiro hábito</button></div>'
      : '<div class="sec-title"><h2><i class="bi bi-star-fill"></i> Missões de hoje</h2><span class="chip green" data-testid="dash-missions-count">' + mDone + "/" + missions.length + "</span></div>" +
        '<div class="card tight" data-testid="dash-missions">' +
        missions.map(m =>
          '<div class="mission' + (m.done ? " done" : "") + '" data-testid="mission-' + m.key + '">' +
          '<span class="m-ico"><i class="bi ' + m.icon + '"></i></span>' +
          '<div class="m-body"><b>' + esc(m.title) + "</b>" +
          '<div class="mini">' + Math.min(m.progress, m.target) + " / " + m.target + "</div>" +
          (m.done ? "" : '<div class="prog"><i style="width:' + Math.min(100, m.progress / m.target * 100) + '%"></i></div>') +
          "</div>" +
          '<div class="m-reward"><span class="xp">+' + m.xp + " XP</span><span class=\"seeds\">+" + m.coins + " 🌰</span></div>" +
          "</div>"
        ).join("") +
        "</div>") +

    /* impacto — subido na hierarquia */
    '<div class="card" data-testid="dash-card-impact"><div style="display:flex;align-items:center;gap:1rem">' +
    '<div style="flex:1"><h3 style="font-size:1rem">Impacto de hoje</h3>' +
    '<p class="sub" data-testid="dash-impact">' + (wasteTodayKg() > 0
      ? fmtNum(wasteTodayKg(), 2) + " kg de comida salva · ≈" + fmtNum(wasteTodayCo2(), 2) + " kg CO₂e evitados"
      : "Ainda não aproveitaste comida hoje — espreita a despensa.") + '</p></div>' +
    '<button class="btn sm" data-testid="btn-go-world" id="goWorld"><i class="bi bi-globe-americas"></i> Ver mundo</button></div></div>' +

    /* resumo semanal — mais abaixo */
    '<div class="sec-title"><h2><i class="bi bi-bar-chart-line"></i> Resumo semanal</h2><span class="chip gray" data-testid="dash-week-xp">+' + weekXP + " XP</span></div>" +
    '<div class="card tight" data-testid="dash-weekly-chart"><div class="minibars">' + bars + "</div>" +
    '<p class="mini" style="margin-top:0.5rem">Hábitos cumpridos por dia, nos últimos 7 dias.</p></div>' +

    /* citação — no fim, menos proeminente */
    '<div class="quote-card" style="opacity:0.85" data-testid="dash-quote"><i class="bi bi-quote"></i><span>' + esc(quote) + "</span></div>";

  root.querySelector("#qaWater").addEventListener("click", () => { logWater(); toast("Hidratação em dia!", "bi-droplet-fill"); });
  root.querySelector("#qaBreak").addEventListener("click", () => { logBreak(); toast("Boa pausa! A EVOLI agradece.", "bi-alarm"); });
  root.querySelector("#goWorld").addEventListener("click", () => goTab("mundo"));
  const firstHabit = root.querySelector("#btnFirstHabit");
  if (firstHabit) firstHabit.addEventListener("click", () => { goTab("habitos"); });
}

function wasteTodayKg() {
  const t = todayKey();
  return S.waste.filter(w => w.date === t).reduce((a, w) => a + (w.kg || 0), 0);
}
function wasteTodayCo2() {
  const t = todayKey();
  return S.waste.filter(w => w.date === t).reduce((a, w) => a + (w.co2e || 0), 0);
}
