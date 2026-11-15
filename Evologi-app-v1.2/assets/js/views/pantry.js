/* EVOLI — vista Despensa: inventário, validades, receitas e impacto */
import { S, todayKey, daysToExpiry, fmtDate, fmtNum, save } from "../store.js";
import { FACTORS, RECIPES, GENERIC_RECIPE, guessFactorId, guessEmoji, factorById } from "../data.js";
import { addPantryItem, updatePantryItem, removePantryItem, useItems } from "../engine.js";
import { esc, toast, openSheet, closeModal, confirmDialog } from "../ui.js";

export function render(root) {
  const items = [...S.pantry].sort((a, b) => a.expiry.localeCompare(b.expiry));
  const totalKg = S.waste.reduce((a, w) => a + (w.kg || 0), 0);
  const totalCo2 = S.waste.reduce((a, w) => a + (w.co2e || 0), 0);
  const exp3 = items.filter(i => daysToExpiry(i.expiry) <= 3);

  root.innerHTML =
    '<div class="page-title"><div><h1>Despensa</h1><p>Usa primeiro o que expira primeiro</p></div></div>' +

    '<div class="grid2" style="margin-bottom:1rem" data-testid="pantry-totals">' +
    '<div class="stat-card"><b>🥗 ' + fmtNum(totalKg, 2) + " kg</b><span>comida salva (total)</span></div>" +
    '<div class="stat-card"><b>☁️ ≈' + fmtNum(totalCo2, 2) + " kg</b><span>CO₂e evitado (estimativa)</span></div>" +
    "</div>" +

    '<div class="sec-title"><h2><i class="bi bi-basket"></i> Ingredientes <span class="chip gray" data-testid="pantry-count">' + items.length + "</span></h2></div>" +
    '<div data-testid="pantry-list">' +
    (items.length === 0
      ? '<div class="card empty-state" data-testid="pantry-empty">' +
        '<div class="empty-illus">🥕</div>' +
        '<h3>A despensa está vazia</h3>' +
        '<p>Adiciona o que tens em casa e a EVOLI ajuda-te a usar tudo antes de estragar — e a mostrar o impacto que poupas.</p></div>'
      : items.map(itemRow).join("")) +
    "</div>" +

    '<div style="margin-top:1rem"><button class="btn block" data-testid="btn-add-item" id="btnAdd"><i class="bi bi-plus-lg"></i> Adicionar ingrediente</button></div>' +

    '<div class="sec-title"><h2><i class="bi bi-egg-fried"></i> Receita sugerida</h2></div>' +
    '<div id="recipeZone">' + recipeHTML(items) + "</div>" +

    (S.waste.length ? '<div class="sec-title"><h2><i class="bi bi-clock-history"></i> Histórico de aproveitamento</h2></div>' +
      '<div class="card tight" data-testid="waste-history">' +
      S.waste.slice(0, 10).map(w =>
        '<div class="hist-row" data-testid="waste-entry"><i class="bi bi-egg-fried"></i><span>' + esc(w.name) + " · " + fmtNum(w.kg, 2) + ' kg</span><span class="when">' + fmtDate(w.date) + " · ≈" + fmtNum(w.co2e, 2) + " kg CO₂e</span></div>"
      ).join("") + "</div>" +
      '<div class="disclaimer" data-testid="co2-disclaimer"><i class="bi bi-info-circle"></i><span>CO₂e estimado = quantidade (kg) × fator de emissão (kg CO₂e/kg), com fatores de Poore &amp; Nemecek (2018) / Our World in Data. Os valores são estimativas das emissões associadas à produção dos alimentos que não foram desperdiçados — não são reduções literais de emissões já produzidas e podem variar consoante o alimento e a metodologia.</span></div>'
      : "");

  root.querySelector("#btnAdd").addEventListener("click", () => itemSheet(null));
  root.querySelectorAll("[data-use]").forEach(b => b.addEventListener("click", () => {
    useSheet(S.pantry.find(x => x.id === b.dataset.use));
  }));
  root.querySelectorAll("[data-edititem]").forEach(b => b.addEventListener("click", () => {
    itemSheet(S.pantry.find(x => x.id === b.dataset.edititem));
  }));
  root.querySelectorAll("[data-delitem]").forEach(b => b.addEventListener("click", async () => {
    const it = S.pantry.find(x => x.id === b.dataset.delitem);
    if (it && await confirmDialog("Eliminar ingrediente", "Eliminar \"" + it.name + "\" da despensa?", "Eliminar")) {
      removePantryItem(it.id);
      toast("Ingrediente removido.", "bi-trash");
    }
  }));
  const cookBtn = root.querySelector("#btnCook");
  if (cookBtn) cookBtn.addEventListener("click", () => {
    const entries = cookBtn.dataset.items.split("|").map(id => ({ item: S.pantry.find(p => p.id === id), kg: null }))
      .map(e => { const p = e.item; return { item: p, kg: p ? p.kg || 0.2 : 0.2 }; });
    if (!entries[0].item) { toast("Esta receita já não tem ingredientes disponíveis.", "bi-x-circle"); return; }
    useItems(entries);
  });
}

function badge(d) {
  if (d < 0) return '<span class="tag t-red">Expirou</span>';
  if (d === 0) return '<span class="tag t-red">Hoje</span>';
  if (d === 1) return '<span class="tag t-red">Amanhã</span>';
  if (d <= 3) return '<span class="tag t-yel">' + d + " dias</span>";
  return '<span class="tag t-grn">' + d + " dias</span>";
}

function itemRow(i) {
  const d = daysToExpiry(i.expiry);
  return '<div class="item-row" data-testid="pantry-item-' + i.id + '">' +
    '<div class="item-emo">' + i.emoji + "</div>" +
    '<div class="i-info"><div class="i-name">' + esc(i.name) + "</div>" +
    '<div class="i-sub">' + fmtNum(i.qty, 2) + " " + esc(i.unit) + " · validade " + fmtDate(i.expiry) + "</div></div>" +
    badge(d) +
    '<div class="h-actions">' +
    '<button class="icon-btn" data-testid="btn-use-' + i.id + '" data-use="' + i.id + '" title="Aproveitar / usar" aria-label="Aproveitar ' + esc(i.name) + '"><i class="bi bi-egg-fried"></i></button>' +
    '<button class="icon-btn" data-testid="btn-edititem-' + i.id + '" data-edititem="' + i.id + '" aria-label="Editar ingrediente"><i class="bi bi-pencil"></i></button>' +
    '<button class="icon-btn danger" data-testid="btn-delitem-' + i.id + '" data-delitem="' + i.id + '" aria-label="Eliminar ingrediente"><i class="bi bi-trash"></i></button>' +
    "</div></div>";
}

export function bestRecipe(items) {
  const exp = items.filter(i => daysToExpiry(i.expiry) <= 3);
  let best = null, bestUsed = [], bestScore = 0;
  RECIPES.forEach(r => {
    const used = items.filter(i => r.keys.some(k => i.name.toLowerCase().includes(k)));
    if (!used.length) return;
    const score = used.filter(i => exp.includes(i)).length * 10 + used.length;
    if (score > bestScore) { best = r; bestUsed = used; bestScore = score; }
  });
  if (!best) return { recipe: GENERIC_RECIPE, used: exp.length ? exp : items.slice(0, 1), generic: true };
  return { recipe: best, used: bestUsed, generic: false };
}

function recipeHTML(items) {
  if (!items.length) return '<div class="card"><p class="sub">Adiciona ingredientes para receberes sugestões de receitas.</p></div>';
  const { recipe, used, generic } = bestRecipe(items);
  if (!used.length) return '<div class="card"><p class="sub">Nada a expirar nos próximos 3 dias. Boa gestão!</p></div>';
  const names = used.map(u => u.name.toLowerCase()).join(", ");
  const extras = (recipe.extras || []).map(e => '<li class="miss"><i class="bi bi-basket2"></i> Falta: ' + esc(e) + "</li>").join("");
  return '<div class="recipe-card" data-testid="recipe-card">' +
    '<span class="chip" style="background:var(--lime);color:#fff">' + (generic ? "Anti-desperdício" : "Usa o que está a expirar") + "</span>" +
    '<h3 style="margin-top:0.5rem" data-testid="recipe-title">' + esc(recipe.t) + "</h3>" +
    '<div class="rp-meta"><span><i class="bi bi-clock"></i> ' + esc(recipe.time) + "</span><span><i class=\"bi bi-people\"></i> 2 doses</span></div>" +
    '<ul class="rp-ings">' +
    used.map(u => '<li><i class="bi bi-check-circle-fill"></i> ' + esc(u.name) + " (" + fmtNum(u.qty, 2) + " " + esc(u.unit) + ")</li>").join("") +
    extras + "</ul>" +
    '<p style="font-size:0.88rem;opacity:0.9">' + esc(recipe.d.replace("{ing}", names)) + "</p>" +
    '<button class="btn terra sm" style="margin-top:0.8rem" id="btnCook" data-testid="btn-cooked-recipe" data-items="' + used.map(u => u.id).join("|") + '">Cozinhei esta receita</button>' +
    '<p class="mini" style="margin-top:0.5rem;opacity:0.7">Os ingredientes usados saem da despensa e entram no teu impacto ambiental.</p></div>';
}

/* ---- sheet: adicionar/editar ingrediente ---- */
function itemSheet(item) {
  const isNew = !item;
  const it = item || { name: "", qty: 1, unit: "un", expiry: "", factorId: null };
  const factorOpts = FACTORS.map(f => '<option value="' + f.id + '"' + ((it.factorId || guessFactorId(it.name || "")) === f.id ? " selected" : "") + ">" + f.label + " — " + fmtNum(f.f, 2) + " kg CO₂e/kg</option>").join("");
  const body =
    '<div class="field"><label for="iName">Nome</label><input type="text" id="iName" data-testid="item-name-input" maxlength="50" placeholder="ex.: Iogurte natural" value="' + esc(it.name) + '" /></div>' +
    '<div class="field-row">' +
    '<div class="field"><label for="iQty">Quantidade</label><input type="number" id="iQty" min="0" step="0.1" value="' + it.qty + '" data-testid="item-qty-input" /></div>' +
    '<div class="field"><label for="iUnit">Unidade</label><select id="iUnit" data-testid="item-unit-select"><option value="kg"' + (it.unit === "kg" ? " selected" : "") + '>kg</option><option value="L"' + (it.unit === "L" ? " selected" : "") + '>L</option><option value="un"' + (it.unit === "un" ? " selected" : "") + ">unidades</option></select></div></div>" +
    '<div class="field"><label for="iExp">Validade</label><input type="date" id="iExp" data-testid="item-expiry-input" value="' + (it.expiry || todayKey()) + '" /></div>' +
    '<div class="field"><label for="iFactor">Categoria (fator de emissão)</label><select id="iFactor" data-testid="item-factor-select">' + factorOpts + "</select></div>" +
    '<div class="field"><label for="iKg">Peso aproximado para o cálculo de CO₂e (kg)</label><input type="number" id="iKg" min="0" step="0.05" value="' + (it.kg || 0.2) + '" data-testid="item-kg-input" /></div>' +
    '<button class="btn terra block" id="iSave" data-testid="item-save">' + (isNew ? "Adicionar à despensa" : "Guardar alterações") + "</button>" +
    '<div class="disclaimer"><i class="bi bi-info-circle"></i><span>O fator é sugerido automaticamente a partir do nome e segue Poore &amp; Nemecek (2018) / Our World in Data. Os resultados são estimativas.</span></div>';

  openSheet(isNew ? "Novo ingrediente" : "Editar ingrediente", body, wrap => {
    const nameInput = wrap.querySelector("#iName");
    const factorSel = wrap.querySelector("#iFactor");
    let guessed = false;
    nameInput.addEventListener("input", () => {
      if (guessed) return;
      const g = guessFactorId(nameInput.value);
      if (nameInput.value && factorSel.value !== g) { factorSel.value = g; guessed = true; }
      wrap.querySelector(".item-emo-preview") && (wrap.querySelector(".item-emo-preview").textContent = guessEmoji(nameInput.value));
    });
    wrap.querySelector("#iSave").addEventListener("click", () => {
      const name = nameInput.value.trim();
      if (!name) { toast("Escreve o nome do ingrediente.", "bi-pencil"); return; }
      const payload = {
        name, emoji: guessEmoji(name),
        qty: Math.max(0, +wrap.querySelector("#iQty").value || 0),
        unit: wrap.querySelector("#iUnit").value,
        expiry: wrap.querySelector("#iExp").value || todayKey(),
        factorId: factorSel.value,
        kg: Math.max(0.01, +wrap.querySelector("#iKg").value || 0.1)
      };
      if (isNew) { addPantryItem(payload); toast(name + " adicionado à despensa.", "bi-basket"); }
      else { updatePantryItem(it.id, payload); toast("Ingrediente atualizado.", "bi-check2"); }
      closeModal();
    });
  });
}

/* ---- sheet: aproveitar ingrediente ---- */
function useSheet(item) {
  if (!item) return;
  const factor = factorById(item.factorId).f;
  const body =
    '<div style="display:flex;align-items:center;gap:0.8rem;margin-bottom:0.9rem">' +
    '<div class="item-emo" style="width:52px;height:52px;font-size:1.6rem">' + item.emoji + "</div>" +
    "<div><b>" + esc(item.name) + "</b><div class='mini'>validade " + fmtDate(item.expiry) + " · " + badge(daysToExpiry(item.expiry)) + "</div></div></div>" +
    '<div class="field"><label for="uKg">Quantidade aproveitada (kg)</label><input type="number" id="uKg" min="0.01" step="0.05" value="' + (item.kg || 0.2) + '" data-testid="use-kg-input" /></div>' +
    '<div class="card tight" style="box-shadow:none;background:var(--lime-tint);border-color:rgba(118,160,53,0.4)">' +
    '<div class="mini" style="color:var(--pine)">Estimativa: <b id="uPreview" data-testid="use-co2-preview">—</b></div></div>' +
    '<button class="btn terra block" id="uConfirm" data-testid="use-confirm">Registar aproveitamento</button>' +
    '<div class="disclaimer"><i class="bi bi-info-circle"></i><span>CO₂e = kg × ' + fmtNum(factor, 2) + " (" + esc(factorById(item.factorId).label) + ", Poore &amp; Nemecek 2018). É uma estimativa das emissões associadas à produção do alimento não desperdiçado, não uma redução literal.</span></div>";

  openSheet("Aproveitar alimento", body, wrap => {
    const inp = wrap.querySelector("#uKg");
    const prev = wrap.querySelector("#uPreview");
    const upd = () => { prev.textContent = "≈ " + fmtNum((+inp.value || 0) * factor, 2) + " kg CO₂e"; };
    inp.addEventListener("input", upd); upd();
    wrap.querySelector("#uConfirm").addEventListener("click", () => {
      const kg = +inp.value;
      if (!kg || kg <= 0) { toast("Indica a quantidade aproveitada.", "bi-pencil"); return; }
      closeModal();
      useItems([{ item, kg }]);
    });
  });
}
