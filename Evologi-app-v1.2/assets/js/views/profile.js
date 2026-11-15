/* EVOLI — Perfil: estatísticas, histórico, dados e integrações */
import { S, todayKey, addDaysKey, weekStartKey, fmtDate, fmtNum, resetAll, exportState, replaceState, save } from "../store.js";
import { ACHIEVEMENTS, CATEGORIES } from "../data.js";
import { levelInfo, habitStreak, foodKg, co2Kg } from "../engine.js";
import { esc, toast, closeModal, confirmDialog } from "../ui.js";
import { worldPhase } from "../world.js";

export function open(root) {
  closeModal();
  const ov = document.createElement("div");
  ov.className = "drawer-overlay";
  ov.setAttribute("data-testid", "drawer-overlay");
  ov.addEventListener("click", () => ov.remove());
  const drawer = document.createElement("aside");
  drawer.className = "drawer";
  drawer.setAttribute("data-testid", "profile-drawer");
  document.getElementById("overlays").appendChild(ov);
  document.getElementById("overlays").appendChild(drawer);

  const li = levelInfo(S.profile.xp);
  const kg = foodKg(), co2 = co2Kg();
  const totalDone = S.stats.totalDone;
  const best = S.streak.best;
  const ach = Object.keys(S.achievements).length;

  /* hábitos mais consistentes */
  const ranked = S.habits.filter(h => !h.archived)
    .map(h => ({ h, s: habitStreak(h) }))
    .sort((a, b) => b.s - a.s).slice(0, 3);

  /* evolução semanal/mensal de XP */
  const t = todayKey();
  const last7 = []; let wXP = 0;
  for (let i = 6; i >= 0; i--) { const d = addDaysKey(t, -i); last7.push(S.stats.xpByDay[d] || 0); wXP += S.stats.xpByDay[d] || 0; }
  let mXP = 0;
  for (let i = 0; i < 30; i++) { mXP += S.stats.xpByDay[addDaysKey(t, -i)] || 0; }
  const maxBar = Math.max(1, ...last7);
  const bars = last7.map((v, i) => {
    const d = addDaysKey(t, -(6 - i));
    const wd = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"][new Date(d + "T12:00:00").getDay()];
    return '<div class="mb' + (d === t ? " today" : "") + '"><i style="height:' + Math.max(5, Math.round(v / maxBar * 100)) + '%" title="' + v + ' XP"></i><span>' + wd + "</span></div>";
  }).join("");

  const catName = id => (CATEGORIES.find(c => c.id === id) || {}).label || id;

  drawer.innerHTML =
    '<div class="drawer-head"><h2>O meu perfil</h2>' +
    '<button class="drawer-x" data-testid="profile-close" aria-label="Fechar perfil"><i class="bi bi-x-lg"></i></button></div>' +

    '<div class="field"><label for="pName">Nome (como a EVOLI te cumprimenta)</label><input type="text" id="pName" maxlength="24" placeholder="Cuidador" value="' + esc(S.profile.name) + '" data-testid="profile-name-input" /></div>' +

    '<div class="grid3" style="margin-bottom:0.8rem" data-testid="profile-hero-stats">' +
    '<div class="stat-card"><b>Nv ' + li.level + "</b><span>" + S.profile.xp + " XP total</span></div>" +
    '<div class="stat-card"><b>' + totalDone + "</b><span>objetivos cumpridos</span></div>" +
    '<div class="stat-card"><b>' + best + "</b><span>melhor sequência</span></div>" +
    "</div>" +

    '<div class="card tight" data-testid="profile-evolution">' +
    '<div class="sec-title" style="margin:0 0 0.3rem"><h2><i class="bi bi-graph-up"></i> Evolução</h2>' +
    '<span class="chip gray">+' + mXP + " XP / 30 dias</span></div>" +
    '<div class="minibars" data-testid="profile-week-chart">' + bars + "</div>" +
    '<p class="mini" style="margin-top:0.4rem">XP por dia, últimos 7 dias · esta semana: +' + wXP + " XP</p></div>" +

    '<div class="grid2" style="margin-bottom:0.8rem" data-testid="profile-impact">' +
    '<div class="stat-card"><b>🥗 ' + fmtNum(kg, 2) + " kg</b><span>comida aproveitada</span></div>" +
    '<div class="stat-card"><b>☁️ ≈' + fmtNum(co2, 2) + " kg</b><span>CO₂e evitado (estimativa)</span></div>" +
    "</div>" +
    '<div class="disclaimer"><i class="bi bi-info-circle"></i><span>Fatores de Poore &amp; Nemecek (2018) / Our World in Data. Estimativas das emissões associadas à produção dos alimentos aproveitados — não reduções literais de emissões já produzidas.</span></div>' +

    '<div class="sec-title"><h2><i class="bi bi-fire"></i> Hábitos mais consistentes</h2></div>' +
    '<div class="card tight" data-testid="profile-top-habits">' +
    (ranked.length ? ranked.map(r =>
      '<div class="hist-row"><i class="bi bi-check2-circle"></i><span>' + esc(r.h.name) + "</span><span class=\"when\"><i class=\"bi bi-fire\" style=\"color:var(--terra)\"></i> " + r.s + "</span></div>"
    ).join("") : '<p class="sub">Ainda não tens hábitos — cria o primeiro e volta aqui para veres a tua consistência crescer.</p>') +
    "</div>" +

    '<div class="sec-title"><h2><i class="bi bi-trophy"></i> Conquistas · ' + ach + "/" + ACHIEVEMENTS.length + "</h2></div>" +
    '<div class="ach-grid" style="margin-bottom:1rem" data-testid="profile-achievements">' +
    ACHIEVEMENTS.map(a => '<div class="ach-card' + (S.achievements[a.id] ? "" : " locked") + '" data-testid="profile-ach-' + a.id + '"><span class="emo">' + a.e + "</span><b>" + esc(a.title) + "</b><div class=\"mini\">" + esc(a.desc) + "</div></div>").join("") +
    "</div>" +

    '<div class="sec-title"><h2><i class="bi bi-clock-history"></i> Histórico de atividades</h2></div>' +
    '<div class="card tight" data-testid="profile-history">' +
    (S.activity.length ? S.activity.slice(0, 25).map(a =>
      '<div class="hist-row"><i class="bi ' + a.icon + '"></i><span>' + esc(a.label) + (a.xp ? " <b style=\"color:var(--sage)\">+" + a.xp + " XP</b>" : "") + "</span><span class=\"when\">" + fmtDate(a.ts.slice(0, 10)) + "</span></div>"
    ).join("") : '<p class="sub">Ainda nada registado — o teu primeiro gesto vai aparecer aqui.</p>') +
    "</div>" +

    '<div class="sec-title"><h2><i class="bi bi-plug"></i> Integrações</h2></div>' +
    '<div class="card tight" data-testid="profile-integrations">' +
    '<div class="int-card"><span class="int-ico"><i class="bi bi-heart-pulse"></i></span><div><b>Android Health Connect</b><p>Planeado para uma versão nativa — requer permissões e uma app Android. Nesta versão web, os dados são registados manualmente.</p></div></div>' +
    '<div class="int-card"><span class="int-ico"><i class="bi bi-apple"></i></span><div><b>Apple HealthKit</b><p>Planeado para uma eventual versão iOS. Sem integração ativa nesta versão.</p></div></div>' +
    '<div class="int-card"><span class="int-ico"><i class="bi bi-arrow-left-right"></i></span><div><b>Interoperabilidade com outras apps (ex.: Finch)</b><p>Essas aplicações não disponibilizam API pública de sincronização. Alternativa realista: importa e exporta os teus dados em JSON, abaixo.</p></div></div>' +
    "</div>" +

    '<div class="sec-title"><h2><i class="bi bi-database"></i> Os teus dados</h2></div>' +
    '<div class="card tight" data-testid="profile-data">' +
    '<div style="display:flex;gap:0.6rem;flex-wrap:wrap">' +
    '<button class="btn sm" data-testid="btn-export" id="btnExport"><i class="bi bi-download"></i> Exportar JSON</button>' +
    '<button class="btn ghost sm" data-testid="btn-import" id="btnImport"><i class="bi bi-upload"></i> Importar JSON</button>' +
    '<input type="file" id="fileImport" accept="application/json" hidden data-testid="import-file" /></div>' +
    '<p class="mini" style="margin-top:0.6rem">O teu progresso fica guardado neste dispositivo (armazenamento local do navegador). Exporta para fazeres uma cópia ou mudares de dispositivo.</p></div>' +

    '<div style="margin-top:1rem"><button class="btn danger block" data-testid="btn-reset" id="btnReset"><i class="bi bi-arrow-counterclockwise"></i> Repor a aplicação (apagar tudo)</button></div>' +
    '<p class="mini" style="text-align:center;margin-top:0.7rem">EVOLI · Equipa DKL_05 · LAPR1 · ISEP · ' + esc(S.profile.createdAt) + "</p>";

  drawer.querySelector(".drawer-x").addEventListener("click", () => { ov.remove(); drawer.remove(); });
  drawer.querySelector("#pName").addEventListener("change", e => {
    S.profile.name = e.target.value.trim().slice(0, 24);
    save(); toast("Nome atualizado.", "bi-check2");
    import("../main.js").then(m => m.render());
    import("../main.js").then(m => m.header && m.header());
  });
  drawer.querySelector("#btnExport").addEventListener("click", () => {
    const blob = new Blob([exportState()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "evoli-dados-" + todayKey() + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
    toast("Dados exportados.", "bi-download");
  });
  drawer.querySelector("#btnImport").addEventListener("click", () => drawer.querySelector("#fileImport").click());
  drawer.querySelector("#fileImport").addEventListener("change", e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try { replaceState(JSON.parse(r.result)); }
      catch (err) { toast(err.message || "Ficheiro inválido.", "bi-x-circle"); }
    };
    r.readAsText(f);
  });
  drawer.querySelector("#btnReset").addEventListener("click", async () => {
    if (await confirmDialog("Repor a aplicação", "Vais apagar todos os dados: XP, níveis, hábitos, despensa, conquistas e histórico. Exporta primeiro se quiseres guardar. Continuar?", "Apagar tudo")) {
      resetAll();
    }
  });
}
