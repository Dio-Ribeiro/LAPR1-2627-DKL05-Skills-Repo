/* EVOLI — vista Mundo: ecossistema, loja e conquistas */
import { S } from "../store.js";
import { SHOP, ACHIEVEMENTS } from "../data.js";
import { worldSVG, worldInfo, worldTotalKg, worldTotalCo2 } from "../world.js";
import { buy, wearToggle, foodKg, save } from "../engine.js";
import { esc, toast } from "../ui.js";
import { fmtNum } from "../store.js";
import { render as rerender } from "../main.js";

export function render(root) {
  const info = worldInfo();
  const owned = Object.keys(S.world.owned).length;
  const achUnlocked = Object.keys(S.achievements).length;

  root.innerHTML =
    '<div class="page-title"><div><h1>O mundo da EVOLI</h1><p data-testid="world-phase-label">Fase ' + info.phase + " · " + info.name + "</p></div></div>" +

    '<div class="world-scene" data-testid="world-scene">' + worldSVG() + "</div>" +

    '<div class="card tight" data-testid="world-progress">' +
    '<div class="energy-head"><span><i class="bi bi-tree"></i> Progresso do ecossistema</span>' +
    '<span data-testid="world-progress-label">' + (info.next ? fmtNum(info.total, 1) + " / " + info.next + " kg CO₂e" : "Nível máximo") + "</span></div>" +
    '<div class="bar"><i style="width:' + info.pct + '%" data-testid="world-progress-bar"></i></div>' +
    '<p class="mini" style="margin-top:0.5rem">' + (info.next
      ? "Aproveita ingredientes a expirar e regista alimentos salvos: cada kg de CO₂e estimado aproxima a próxima fase."
      : "O teu mundo está próspero — continua a aproveitar alimentos para o manter vivo.") + "</p></div>" +

    '<div class="grid2" style="margin-bottom:1rem" data-testid="world-impact">' +
    '<div class="stat-card"><b>🥗 ' + fmtNum(worldTotalKg(), 2) + " kg</b><span>comida aproveitada</span></div>" +
    '<div class="stat-card"><b>☁️ ≈' + fmtNum(worldTotalCo2(), 2) + " kg</b><span>CO₂e evitado (estimativa)</span></div>" +
    "</div>" +
    '<div class="disclaimer" data-testid="world-disclaimer"><i class="bi bi-info-circle"></i><span>O mundo evolui apenas com ações sustentáveis que registas — alimentos aproveitados e desperdício evitado. XP, sementes e energia não crescem o ecossistema por si só.</span></div>' +

    '<div class="sec-title"><h2><i class="bi bi-bag-heart"></i> Loja ecológica</h2><span class="chip terra" data-testid="shop-coins">🌰 ' + S.profile.coins + "</span></div>" +
    '<div class="shop-grid" data-testid="shop-grid">' +
    SHOP.map(it => shopItem(it)).join("") +
    "</div>" +

    '<div class="sec-title"><h2><i class="bi bi-trophy"></i> Conquistas</h2><span class="chip green" data-testid="ach-count">' + achUnlocked + " / " + ACHIEVEMENTS.length + "</span></div>" +
    '<div class="ach-grid" data-testid="ach-grid">' +
    ACHIEVEMENTS.map(a => {
      const got = S.achievements[a.id];
      return '<div class="ach-card' + (got ? "" : " locked") + '" data-testid="ach-' + a.id + '" title="' + esc(a.desc) + '">' +
        '<span class="emo">' + a.e + "</span><b>" + esc(a.title) + "</b>" +
        (got ? '<div class="mini">Desbloqueada</div>' : '<div class="mini">Bloqueada</div>') +
        "</div>";
    }).join("") +
    "</div>";

  root.querySelectorAll("[data-buy]").forEach(b => b.addEventListener("click", () => {
    const it = SHOP.find(x => x.id === b.dataset.buy);
    if (!it) return;
    if (buy(it.id, it.p)) {
      if (it.kind === "wear") S.world.worn[it.id] = true;
      toast(it.n + " desbloqueado!", "bi-bag-heart");
      save();
      rerender();
    } else {
      toast("Não tens sementes suficientes. Completa missões para ganhar mais.", "bi-exclamation-circle");
    }
  }));
  root.querySelectorAll("[data-wear]").forEach(b => b.addEventListener("click", () => {
    wearToggle(b.dataset.wear);
    rerender();
  }));
  root.querySelectorAll("[data-scene]").forEach(b => b.addEventListener("click", () => {
    toast("Já está no teu mundo!", "bi-tree");
  }));
}
function shopItem(it) {
  const owned = !!S.world.owned[it.id];
  const worn = !!S.world.worn[it.id];
  const afford = S.profile.coins >= it.p;
  let btn;
  if (!owned) btn = '<button class="btn sm" data-testid="btn-buy-' + it.id + '" data-buy="' + it.id + '"' + (afford ? "" : " disabled") + ">🌰 " + it.p + "</button>";
  else if (it.kind === "wear") btn = '<button class="btn sm' + (worn ? " worn-tag" : " soft") + '" data-testid="btn-wear-' + it.id + '" data-wear="' + it.id + '">' + (worn ? "A vestir ✓" : "Vestir") + "</button>";
  else btn = '<button class="btn sm soft" data-testid="btn-scene-' + it.id + '" data-scene="' + it.id + '">No mundo ✓</button>';
  return '<div class="shop-item" data-testid="shop-item-' + it.id + '"><span class="emo">' + it.e + "</span><b>" + esc(it.n) + "</b>" + btn + "</div>";
}

