/* EVOLI — arranque da app: navegação, header, render */
import { S, todayKey } from "./store.js";
import { ensureDay, levelInfo, onChange, syncMissions, syncWeekly } from "./engine.js";
import * as dashboard from "./views/dashboard.js";
import * as habits from "./views/habits.js";
import * as pantry from "./views/pantry.js";
import * as health from "./views/health.js";
import * as world from "./views/world.js";
import * as profile from "./views/profile.js";

const TABS = [
  { id: "inicio", icon: "bi-house-heart", label: "Início", view: dashboard },
  { id: "habitos", icon: "bi-check2-square", label: "Hábitos", view: habits },
  { id: "despensa", icon: "bi-basket", label: "Despensa", view: pantry },
  { id: "bemestar", icon: "bi-heart-pulse", label: "Bem-estar", view: health },
  { id: "mundo", icon: "bi-globe-americas", label: "Mundo", view: world }
];

const root = document.getElementById("viewRoot");
const tabbar = document.getElementById("tabbar");

function greeting() {
  const h = new Date().getHours();
  return h < 7 ? "Boa noite" : h < 12 ? "Bom dia" : h < 19 ? "Boa tarde" : "Boa noite";
}
export function header() {
  const li = levelInfo(S.profile.xp);
  document.getElementById("hdrGreet").textContent = greeting() + (S.profile.name ? ", " + S.profile.name : "") + "!";
  document.getElementById("hdrSub").textContent = "Streak de " + S.streak.current + (S.streak.current === 1 ? " dia" : " dias") + " · a EVOLI está à tua espera";
  document.querySelector("#pillSeeds b").textContent = S.profile.coins;
  document.querySelector("#pillLevel b").textContent = li.level;
}

export function goTab(id) {
  if (S.tab === id) { render(); return; }
  S.tab = id;
  render();
}
export function render() {
  header();
  const tab = TABS.find(t => t.id === S.tab) || TABS[0];
  root.classList.remove("tab-anim");
  void root.offsetWidth;
  root.classList.add("tab-anim");
  tab.view.render(root);
  tabbar.innerHTML = TABS.map(t =>
    '<button class="tab-btn' + (t.id === S.tab ? " active" : "") + '" role="tab" aria-selected="' + (t.id === S.tab) + '" data-testid="tab-' + t.id + '" data-goto="' + t.id + '">' +
    '<i class="bi ' + t.icon + '"></i><span>' + t.label + "</span></button>"
  ).join("");
  tabbar.querySelectorAll("[data-goto]").forEach(b => b.addEventListener("click", () => {
    S.tab = b.dataset.goto;
    render();
    root.scrollTop = 0;
    window.scrollTo({ top: 0 });
  }));
}

document.getElementById("btnProfile").addEventListener("click", () => profile.open(root));
onChange(() => render());

/* arranque */
ensureDay();
render();
syncMissions();
syncWeekly();
setInterval(() => { ensureDay(); syncMissions(); syncWeekly(); }, 60000);
