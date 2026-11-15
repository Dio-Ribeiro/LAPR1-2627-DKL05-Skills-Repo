/* EVOLI — vista Hábitos */
import { S, todayKey, addDaysKey, weekStartKey, fmtDate } from "../store.js";
import { CATEGORIES, HABIT_TEMPLATES } from "../data.js";
import { addHabit, updateHabit, deleteHabit, checkInHabit, undoCheckInHabit, isScheduled, habitDoneOn, habitStreak, countScheduled, weekCount } from "../engine.js";
import { esc, toast, openSheet, closeModal, confirmDialog } from "../ui.js";
import { render as rerender } from "../main.js";

const WD = ["S", "T", "Q", "Q", "S", "S", "D"];

export function render(root) {
  const t = todayKey();
  const active = S.habits.filter(h => !h.archived);
  const cats = CATEGORIES.filter(c => active.some(h => h.category === c.id));
  const doneToday = active.filter(h => isScheduled(h, t) && habitDoneOn(h, t)).length;
  const schedToday = countScheduled(t);

  /* heatmap: 5 semanas (seg-alinhado) */
  const start = addDaysKey(weekStartKey(), -28);
  let heat = "";
  for (let i = 0; i < 35; i++) {
    const d = addDaysKey(start, i);
    const n = S.stats.doneByDay[d] || 0;
    const cls = n === 0 ? "" : n < 2 ? "l1" : n < 4 ? "l2" : "l3";
    heat += '<div class="heat-cell ' + cls + (d === t ? " today" : "") + (d > t ? " future" : "") + '" title="' + d + ": " + n + ' hábitos"></div>';
  }
  const weekPct = schedToday ? Math.round(doneToday / schedToday * 100) : 0;

  root.innerHTML =
    '<div class="page-title"><div><h1>Hábitos</h1><p>' + (schedToday === 0
      ? "A tua rotina começa aqui — cria o primeiro hábito."
      : doneToday + " de " + schedToday + " cumpridos hoje" + (doneToday === schedToday ? " — dia completo!" : "")) + '</p></div></div>' +

    '<div class="grid3" style="margin-bottom:1rem" data-testid="habits-stats">' +
    '<div class="stat-card"><b>' + weekPct + "%</b><span>hoje</span></div>" +
    '<div class="stat-card"><b>' + S.stats.totalDone + "</b><span>no total</span></div>" +
    '<div class="stat-card"><b>' + S.streak.best + "</b><span>recorde</span></div>" +
    "</div>" +

    (active.length === 0 ?
      '<div class="card empty-state" data-testid="habits-empty">' +
      '<div class="empty-illus">🌱</div>' +
      '<h3>A tua aventura começa aqui!</h3>' +
      "<p>Cria o teu primeiro hábito e vê a tua pequena companheira a crescer contigo. Um gesto de cada vez.</p>" +
      '<button class="btn terra" data-testid="btn-new-habit-empty" id="btnNewEmpty"><i class="bi bi-plus-lg"></i> Criar o meu primeiro hábito</button></div>' :
      cats.map(c =>
        '<div class="sec-title"><h2><i class="bi ' + c.icon + '" style="color:' + c.color + '"></i> ' + c.label + "</h2></div>" +
        active.filter(h => h.category === c.id).map(h => habitRow(h, t)).join("")
      ).join("")) +

    '<div style="display:flex;gap:0.7rem;margin-top:1.1rem">' +
    '<button class="btn block" data-testid="btn-new-habit" id="btnNew"><i class="bi bi-plus-lg"></i> Novo hábito</button></div>' +

    '<div class="sec-title"><h2><i class="bi bi-calendar3"></i> Calendário de consistência</h2></div>' +
    '<div class="card tight" data-testid="habits-heatmap"><div class="heat">' + heat + "</div>" +
    '<div class="heat-labels">' + WD.map(w => "<span>" + w + "</span>").join("") + "</div>" +
    '<p class="mini" style="margin-top:0.5rem">Últimas 5 semanas · verde mais intenso = mais hábitos cumpridos nesse dia.</p></div>';

  root.querySelector("#btnNew").addEventListener("click", () => habitSheet(null));
  const btnNewEmpty = root.querySelector("#btnNewEmpty");
  if (btnNewEmpty) btnNewEmpty.addEventListener("click", () => habitSheet(null));
  root.querySelectorAll("[data-check]").forEach(b => b.addEventListener("click", () => {
    const h = S.habits.find(x => x.id === b.dataset.check);
    if (!h) return;
    if (habitDoneOn(h)) { undoCheckInHabit(h); toast("Verificação retirada.", "bi-arrow-counterclockwise"); }
    else { checkInHabit(h); }
  }));
  root.querySelectorAll("[data-edit]").forEach(b => b.addEventListener("click", () => {
    habitSheet(S.habits.find(x => x.id === b.dataset.edit));
  }));
  root.querySelectorAll("[data-del]").forEach(b => b.addEventListener("click", async () => {
    const h = S.habits.find(x => x.id === b.dataset.del);
    if (!h) return;
    if (await confirmDialog("Eliminar hábito", "Eliminar \"" + h.name + "\"? O histórico deste hábito será perdido. XP, níveis e conquistas mantêm-se.", "Eliminar")) {
      deleteHabit(h.id);
      toast("Hábito eliminado.", "bi-trash");
    }
  }));
}

function habitRow(h, t) {
  const cat = CATEGORIES.find(c => c.id === h.category) || CATEGORIES[0];
  const done = habitDoneOn(h, t);
  const streak = habitStreak(h);
  const freqTxt = h.freq.type === "daily" ? "Todos os dias" : h.freq.type === "days" ? (h.freq.days || []).map(d => WD[d]).join(" ") : "Meta semanal: " + h.target + "× (" + Math.min(weekCount(h), h.target) + "/" + h.target + ")";
  return '<div class="habit-row' + (done ? " done" : "") + '" data-testid="habit-row-' + h.id + '">' +
    '<button class="habit-check" data-testid="habit-check-' + h.id + '" data-check="' + h.id + '" aria-label="Marcar ' + esc(h.name) + ' como feito">' +
    (done ? '<i class="bi bi-check-lg"></i>' : "") + "</button>" +
    '<div class="h-info"><div class="h-name">' + esc(h.name) + "</div>" +
    '<div class="h-meta"><span class="cat-dot" style="background:' + cat.color + '"></span>' +
    '<span class="mini">' + esc(freqTxt) + "</span>" +
    (streak > 0 ? '<span class="flame" data-testid="habit-streak-' + h.id + '"><i class="bi bi-fire"></i> ' + streak + "</span>" : "") +
    "</div></div>" +
    '<div class="h-actions">' +
    '<button class="icon-btn" data-testid="habit-edit-' + h.id + '" data-edit="' + h.id + '" aria-label="Editar hábito"><i class="bi bi-pencil"></i></button>' +
    '<button class="icon-btn danger" data-testid="habit-delete-' + h.id + '" data-del="' + h.id + '" aria-label="Eliminar hábito"><i class="bi bi-trash"></i></button>' +
    "</div></div>";
}

export function habitSheet(habit) {
  const isNew = !habit;
  const h = habit || { name: "", category: "saude", freq: { type: "daily", days: [1, 3, 5] }, time: "", target: 1 };
  let freq = h.freq.type;
  const cats = CATEGORIES.map(c =>
    '<button type="button" data-cat="' + c.id + '" class="' + (h.category === c.id ? "on" : "") + '"><i class="bi ' + c.icon + '"></i> ' + c.label + "</button>"
  ).join("");
  const tpls = HABIT_TEMPLATES.map(tpl => '<button type="button" data-tpl="' + tpl.name + '" data-tplcat="' + tpl.cat + '" data-tplfreq="' + tpl.freq + '" data-tpltgt="' + tpl.target + '">' + esc(tpl.name) + "</button>").join("");
  const weekChips = [0, 1, 2, 3, 4, 5, 6].map(d =>
    '<button type="button" data-day="' + d + '" class="' + ((h.freq.days || []).includes(d) ? "on" : "") + '">' + ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][d] + "</button>"
  ).join("");

  const body =
    (isNew ? '<div class="field"><label>Sugestões rápidas</label><div class="tpl-chips">' + tpls + "</div></div>" : "") +
    '<div class="field"><label for="hName">Nome do hábito</label><input type="text" id="hName" data-testid="habit-name-input" maxlength="60" placeholder="ex.: Beber 2 L de água" value="' + esc(h.name) + '" /></div>' +
    '<div class="field"><label>Categoria</label><div class="cat-pick" id="catPick">' + cats + "</div></div>" +
    '<div class="field"><label>Frequência</label><div class="seg" id="freqSeg">' +
    '<button type="button" data-freq="daily" class="' + (freq === "daily" ? "on" : "") + '">Diário</button>' +
    '<button type="button" data-freq="days" class="' + (freq === "days" ? "on" : "") + '">Dias da semana</button>' +
    '<button type="button" data-freq="weekly" class="' + (freq === "weekly" ? "on" : "") + '">Meta semanal</button></div></div>' +
    '<div class="field" id="weekDaysField" style="display:' + (freq === "days" ? "block" : "none") + '"><label>Dias ativos</label><div class="week-chips">' + weekChips + "</div></div>" +
    '<div class="field" id="weekTargetField" style="display:' + (freq === "weekly" ? "block" : "none") + '"><label for="hWeekTarget">Vezes por semana</label><input type="number" id="hWeekTarget" min="1" max="7" value="' + (h.freq.type === "weekly" ? h.target : 3) + '" data-testid="habit-week-target" /></div>' +
    '<div class="field-row"><div class="field"><label for="hTarget">Vezes por dia</label><input type="number" id="hTarget" min="1" max="12" value="' + h.target + '" data-testid="habit-target" /></div>' +
    '<div class="field"><label for="hTime">Hora (opcional)</label><input type="time" id="hTime" value="' + esc(h.time || "") + '" data-testid="habit-time" /></div></div>' +
    '<button class="btn terra block" id="hSave" data-testid="habit-save">' + (isNew ? "Criar hábito" : "Guardar alterações") + "</button>" +
    '<p class="mini" style="text-align:center;margin-top:0.6rem">A EVOLI nunca apaga XP, níveis nem conquistas — mesmo se falhares um dia.</p>';

  openSheet(isNew ? "Novo hábito" : "Editar hábito", body, wrap => {
    let cat = h.category;
    const days = new Set(h.freq.days || [1, 3, 5]);
    wrap.querySelectorAll("[data-cat]").forEach(b => b.addEventListener("click", () => {
      cat = b.dataset.cat;
      wrap.querySelectorAll("[data-cat]").forEach(x => x.classList.toggle("on", x === b));
    }));
    wrap.querySelectorAll("[data-freq]").forEach(b => b.addEventListener("click", () => {
      freq = b.dataset.freq;
      wrap.querySelectorAll("[data-freq]").forEach(x => x.classList.toggle("on", x === b));
      wrap.querySelector("#weekDaysField").style.display = freq === "days" ? "block" : "none";
      wrap.querySelector("#weekTargetField").style.display = freq === "weekly" ? "block" : "none";
    }));
    wrap.querySelectorAll("[data-day]").forEach(b => b.addEventListener("click", () => {
      const d = +b.dataset.day;
      days.has(d) ? days.delete(d) : days.add(d);
      b.classList.toggle("on");
    }));
    wrap.querySelectorAll("[data-tpl]").forEach(b => b.addEventListener("click", () => {
      wrap.querySelector("#hName").value = b.dataset.tpl;
      cat = b.dataset.tplcat;
      wrap.querySelectorAll("[data-cat]").forEach(x => x.classList.toggle("on", x.dataset.cat === cat));
      freq = b.dataset.tplfreq;
      wrap.querySelectorAll("[data-freq]").forEach(x => x.classList.toggle("on", x.dataset.freq === freq));
      wrap.querySelector("#weekDaysField").style.display = freq === "days" ? "block" : "none";
      wrap.querySelector("#weekTargetField").style.display = freq === "weekly" ? "block" : "none";
      wrap.querySelector("#hTarget").value = b.dataset.tpltgt;
    }));
    wrap.querySelector("#hSave").addEventListener("click", () => {
      const name = wrap.querySelector("#hName").value.trim();
      if (!name) { toast("Dá um nome ao hábito.", "bi-pencil"); return; }
      const target = Math.max(1, Math.min(12, +wrap.querySelector("#hTarget").value || 1));
      const time = wrap.querySelector("#hTime").value;
      const payload = {
        name, category: cat, time, target,
        freq: freq === "weekly"
          ? { type: "weekly", target: Math.max(1, Math.min(7, +wrap.querySelector("#hWeekTarget").value || 3)) }
          : freq === "days" ? { type: "days", days: [...days].sort(), target } : { type: "daily", target }
      };
      if (freq === "days" && days.size === 0) { toast("Escolhe pelo menos um dia.", "bi-calendar-x"); return; }
      if (isNew) { addHabit(payload); toast("Hábito criado. Vamos a isso!", "bi-stars"); }
      else { updateHabit(habit.id, payload); toast("Hábito atualizado.", "bi-check2"); }
      closeModal();
    });
  });
}
