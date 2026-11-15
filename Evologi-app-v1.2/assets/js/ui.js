/* EVOLI — helpers de UI: toasts, modais, sheets, celebração */

export function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

let toastTimer = null;
export function toast(msg, icon) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    document.getElementById("overlays").appendChild(t);
  }
  t.innerHTML = (icon ? '<i class="bi ' + icon + '"></i>' : "") + "<span>" + esc(msg) + "</span>";
  t.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("on"), 2600);
}

export function closeModal() {
  document.querySelectorAll(".sheet-wrap, .modal-wrap, .drawer-overlay").forEach(el => el.remove());
}

export function openSheet(title, bodyHTML, onMount) {
  closeModal();
  const wrap = document.createElement("div");
  wrap.className = "sheet-wrap";
  wrap.innerHTML =
    '<div class="sheet" role="dialog" aria-modal="true" aria-label="' + esc(title) + '" data-testid="sheet">' +
    '<div class="sheet-head"><h3>' + esc(title) + '</h3>' +
    '<button class="drawer-x" data-testid="sheet-close" aria-label="Fechar"><i class="bi bi-x-lg"></i></button></div>' +
    bodyHTML + "</div>";
  document.getElementById("overlays").appendChild(wrap);
  wrap.addEventListener("click", e => { if (e.target === wrap) closeModal(); });
  wrap.querySelector(".drawer-x").addEventListener("click", closeModal);
  if (onMount) onMount(wrap);
  return wrap;
}

export function confirmDialog(title, msg, okLabel) {
  return new Promise(resolve => {
    closeModal();
    const wrap = document.createElement("div");
    wrap.className = "modal-wrap";
    wrap.innerHTML =
      '<div class="modal" role="alertdialog" aria-modal="true" data-testid="confirm-dialog">' +
      "<h3>" + esc(title) + "</h3>" +
      '<p class="sub" style="margin:0.5rem 0 1.1rem">' + esc(msg) + "</p>" +
      '<div style="display:flex;gap:0.6rem;justify-content:flex-end">' +
      '<button class="btn ghost sm" data-testid="confirm-cancel">Cancelar</button>' +
      '<button class="btn danger sm" data-testid="confirm-ok">' + esc(okLabel || "Eliminar") + "</button></div></div>";
    document.getElementById("overlays").appendChild(wrap);
    const done = v => { closeModal(); resolve(v); };
    wrap.querySelector("[data-testid=confirm-cancel]").addEventListener("click", () => done(false));
    wrap.querySelector("[data-testid=confirm-ok]").addEventListener("click", () => done(true));
    wrap.addEventListener("click", e => { if (e.target === wrap) done(false); });
  });
}

/* Celebração: cartão + faíscas, some sozinho */
export function celebrate(emoji, title, sub) {
  const root = document.getElementById("overlays");
  const cel = document.createElement("div");
  cel.className = "celebrate";
  const colors = ["#76A035", "#D97736", "#C99A2E", "#A9C58B", "#3D6B50"];
  let sparks = "";
  for (let i = 0; i < 14; i++) {
    const ang = (i / 14) * Math.PI * 2;
    const dist = 90 + Math.random() * 70;
    sparks += '<i class="spark" style="--dx:' + Math.round(Math.cos(ang) * dist) + "px;--dy:" + Math.round(Math.sin(ang) * dist) + "px;background:" + colors[i % colors.length] + ";animation-delay:" + (i * 40) + 'ms"></i>';
  }
  cel.innerHTML =
    '<div class="cel-card" data-testid="celebration-card">' + sparks +
    '<span class="big">' + emoji + "</span><b>" + esc(title) + "</b>" +
    (sub ? "<span>" + esc(sub) + "</span>" : "") + "</div>";
  root.appendChild(cel);
  setTimeout(() => { cel.style.opacity = "0"; cel.style.transition = "opacity 0.4s ease"; }, 1700);
  setTimeout(() => cel.remove(), 2200);
}
