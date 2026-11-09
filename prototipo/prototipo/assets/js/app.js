"use strict";
/* EVOLI — Protótipo da app · Equipa DKL_05 · ISEP · Sprint 3
   Protótipo funcional com dados fictícios. O progresso fica guardado
   apenas neste navegador (localStorage); missões recomeçam a cada dia.
   Nota: o tempo de ecrã é simulado (não mede o uso real do dispositivo). */
const LS = "evoli_prototipo_v2";
const HOJE = new Date().toISOString().slice(0, 10);

const BASE = {tab:'casa',coins:120,energy:55,food:1.2,co2:3.1,water:0,breaks:0,cooked:0,screenMin:47,streak:12,ultimo:HOJE,
 quests:{agua:false,pausa:false,comida:false},
 owned:{},worn:{},recipe:null,
 pantry:[{n:'Iogurtes',e:'🥛',d:1},{n:'Tomate',e:'🍅',d:2},{n:'Arroz cozido',e:'🍚',d:2},{n:'Ovos',e:'🥚',d:6},{n:'Espinafres',e:'🥬',d:3}]};

let S;
try { S = Object.assign({}, BASE, JSON.parse(localStorage.getItem(LS)) || {}); } catch(e){ S = Object.assign({}, BASE); }
S.quests = Object.assign({agua:false,pausa:false,comida:false}, S.quests || {});
S.owned = S.owned || {}; S.worn = S.worn || {};
if (!Array.isArray(S.pantry) || !S.pantry.length) S.pantry = BASE.pantry.slice();
function save(){ try { localStorage.setItem(LS, JSON.stringify(S)); } catch(e){} }

/* Novo dia: as missões e os contadores "de hoje" recomeçam; a sequência cresce. */
if (S.ultimo !== HOJE){
  const ontem = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  S.streak = (S.ultimo === ontem) ? (S.streak || 1) + 1 : 1;
  S.ultimo = HOJE;
  S.quests = {agua:false,pausa:false,comida:false};
  S.water = 0; S.breaks = 0; S.screenMin = 0;
  save();
}

const SHOP = [
  {id:'hat',n:'Chapéu de palha reciclada',e:'👒',p:40},
  {id:'glasses',n:'Óculos de madeira FSC',e:'👓',p:60},
  {id:'scarf',n:'Cachecol de algodão orgânico',e:'🧣',p:80},
  {id:'bow',n:'Laço de tecido reaproveitado',e:'🎀',p:30}
];
const TABS = [['casa','🏡','Casa'],['despensa','🥕','Despensa'],['pausas','💧','Pausas'],['mundo','🌍','Mundo'],['loja','🛍️','Loja']];
const $ = s => document.querySelector(s);

function mascot(){
  const tired = S.energy < 30, happy = S.energy >= 70;
  const eyes = tired
    ? '<path d="M72 112q8 5 16 0M112 112q8 5 16 0" stroke="#26384A" stroke-width="4" fill="none" stroke-linecap="round"/>'
    : '<circle cx="80" cy="110" r="7" fill="#26384A"/><circle cx="120" cy="110" r="7" fill="#26384A"/><circle cx="82" cy="107" r="2.5" fill="#fff"/><circle cx="122" cy="107" r="2.5" fill="#fff"/>';
  const mouth = tired
    ? '<path d="M90 135q10-7 20 0" stroke="#26384A" stroke-width="4" fill="none" stroke-linecap="round"/>'
    : happy ? '<path d="M88 128q12 16 24 0z" fill="#26384A"/>' : '<path d="M90 128q10 10 20 0" stroke="#26384A" stroke-width="4" fill="none" stroke-linecap="round"/>';
  const w = S.worn;
  return `<svg viewBox="0 0 200 200" role="img" aria-label="EVOLI, a mascote verde com um rebento na cabeça" class="float">
  <ellipse cx="100" cy="184" rx="52" ry="8" fill="#26384A" opacity=".12"/>
  <ellipse cx="70" cy="176" rx="16" ry="9" fill="#5E8D45"/><ellipse cx="130" cy="176" rx="16" ry="9" fill="#5E8D45"/>
  <ellipse cx="100" cy="122" rx="62" ry="56" fill="#86AE60"/>
  <ellipse cx="100" cy="140" rx="36" ry="30" fill="#BBD593"/>
  ${w.hat?'<ellipse cx="100" cy="72" rx="52" ry="10" fill="#E7C373"/><path d="M68 72q4-26 32-26t32 26z" fill="#F0D590"/><rect x="68" y="64" width="64" height="6" fill="#C9553F"/>':''}
  <path d="M100 70Q98 52 100 40" stroke="#4F7F3C" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M100 46Q74 30 66 48Q84 62 100 46z" fill="#6FA34B"/><path d="M100 42Q126 22 136 40Q116 56 100 42z" fill="#8BC15E"/>
  ${eyes}
  <circle cx="64" cy="124" r="8" fill="#F4A9A0" opacity=".7"/><circle cx="136" cy="124" r="8" fill="#F4A9A0" opacity=".7"/>
  ${mouth}
  ${w.glasses?'<g stroke="#8A5A32" stroke-width="3.5" fill="none"><circle cx="80" cy="110" r="14"/><circle cx="120" cy="110" r="14"/><path d="M94 110h12"/></g>':''}
  ${w.scarf?'<path d="M52 150q48 24 96 0l-4 16q-44 20-88 0z" fill="#E8806F"/><rect x="118" y="156" width="16" height="30" rx="6" fill="#D9695A"/>':''}
  ${w.bow?'<path d="M138 78l22-12v26z M138 78l-6-14 -6 14z" fill="#F08CA6"/><circle cx="140" cy="78" r="6" fill="#D95C82"/>':''}
  </svg>`;
}
function say(){
  if (S.energy < 30) return 'Estou cansada… uma pausa e um copo de água?';
  if (S.screenMin >= 45 && !S.quests.pausa) return 'Já estás há ' + S.screenMin + ' min no ecrã. Vamos esticar as pernas?';
  const urgente = S.pantry.find(i => i.d <= 1);
  if (urgente) return urgente.n + ' acaba ' + (urgente.d === 0 ? 'hoje' : 'amanhã') + '! Cozinhamos algo?';
  return 'Estou ótima! Obrigada por cuidares de nós 🌱';
}
function toast(t, i){
  $('#toastTxt').textContent = t;
  $('#toastIco').textContent = i || '🌱';
  const el = $('#toast');
  el.classList.add('on');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => el.classList.remove('on'), 2600);
}
function reward(coins, en, msg, ico){
  S.coins += coins; S.energy = Math.min(100, S.energy + en);
  save(); render();
  toast(msg + ' +' + coins + ' moedas', ico);
}
function quest(k){ if (!S.quests[k]){ S.quests[k] = true; S.coins += 10; save(); } }

function casa(){
  const q = (k,t,i,testid) => `<div class="q ${S.quests[k]?'done':''}" data-testid="${testid}"><div class="ck">${S.quests[k]?'✓':''}</div><span>${i} ${t}</span><em>+10</em></div>`;
  return `<div class="top"><div><div class="hello">Olá, cuidador!</div><div class="sub">Dia ${S.streak} de sequência 🔥</div></div><div class="pill" data-testid="pill-coins">🪙 ${S.coins}</div></div>
  <div class="stage"><div class="bubble" data-testid="mascot-bubble">${say()}</div>${mascot()}</div>
  <div class="lbl"><span>⚡ Energia da EVOLI</span><span data-testid="energia-valor">${S.energy}%</span></div>
  <div class="bar" data-testid="energia-barra"><i style="width:${S.energy}%"></i></div>
  <div class="card" data-testid="card-missoes"><h3>Missões de hoje</h3>
   ${q('agua','Beber um copo de água','💧','missao-agua')}${q('pausa','Fazer uma pausa ativa','🚶','missao-pausa')}${q('comida','Cozinhar um ingrediente a expirar','🍳','missao-comida')}</div>
  <div class="card" data-testid="card-impacto"><div class="row"><div style="flex:1"><h3 style="margin:0">Impacto de hoje</h3><div class="sub" style="margin:2px 0 0" data-testid="impacto-resumo">${S.food.toFixed(1)} kg de comida salva · ${S.co2.toFixed(1)} kg de CO₂ evitado</div></div><button class="btn sm" data-testid="btn-ver-mundo" onclick="go('mundo')">Ver mundo</button></div></div>`;
}
function despensa(){
  const tag = d => d <= 1 ? `<span class="tag t-red" data-testid="tag-validade">${d===0?'Hoje':'Amanhã'}</span>` : d <= 3 ? `<span class="tag t-yel" data-testid="tag-validade">${d} dias</span>` : `<span class="tag t-grn" data-testid="tag-validade">${d} dias</span>`;
  const list = [...S.pantry].sort((a,b)=>a.d-b.d).map(i=>`<div class="item" data-testid="item-despensa"><div class="emo">${i.e}</div><div><b>${i.n}</b></div>${tag(i.d)}</div>`).join('') || '<p class="sub">A despensa está vazia. Adiciona um ingrediente.</p>';
  const rc = S.recipe ? `<div class="recipe" data-testid="receita-sugerida"><h4>${S.recipe.t}</h4>${S.recipe.d}<div style="margin-top:10px"><button class="btn sm" data-testid="btn-cozinhei" onclick="cook()">Cozinhei! 🍳</button></div></div>` : '';
  return `<div class="top"><div><div class="h2">Despensa</div><div class="sub">Usa primeiro o que expira primeiro</div></div><div class="pill" data-testid="pill-coins">🪙 ${S.coins}</div></div>
  <div class="card" style="margin-top:6px" data-testid="card-despensa">${list}
   <div class="add"><input id="nn" placeholder="Novo ingrediente" aria-label="Nome do ingrediente" data-testid="input-nome-ingrediente"><select id="nd" aria-label="Dias até expirar" data-testid="select-dias-validade"><option value="1">1 dia</option><option value="2">2 dias</option><option value="3" selected>3 dias</option><option value="7">7 dias</option></select></div>
   <div style="margin-top:8px"><button class="btn alt" data-testid="btn-adicionar-ingrediente" onclick="addItem()">Adicionar</button></div></div>
  <div style="margin-top:12px"><button class="btn" data-testid="btn-gerar-receita" onclick="gen()">✨ Gerar receita rápida</button></div>${rc}`;
}
function addItem(){
  const n = $('#nn').value.trim();
  if (!n){ toast('Escreve o nome do ingrediente.', '✏️'); return; }
  S.pantry.push({n:n, e:'🥣', d:+$('#nd').value});
  save(); render();
  toast(n + ' adicionado à despensa.', '🥕');
}

/* Receitas: escolhe a que aproveita mais ingredientes a expirar (≤ 3 dias). */
const RECEITAS = [
  {k:['arroz','tomate','espinafre'], t:'Arroz de tomate com espinafres',
   d:'Refoga <b>{ing}</b> com cebola e azeite, junta um pouco de água e deixa apurar 10 min.<br><small>⏱ 15 min · 💶 menos de 1,50 € por dose</small>'},
  {k:['tomate','espinafre'], t:'Salada morna de tomate e espinafres',
   d:'Salteia <b>{ing}</b> 3 min com alho e azeite. Serve morno.<br><small>⏱ 8 min · 💶 menos de 1 € por dose</small>'},
  {k:['iogurte'], t:'Taça de iogurte com aveia',
   d:'Mistura <b>{ing}</b> com aveia e o que tiveres de fruta ou mel.<br><small>⏱ 3 min · 💶 menos de 1 € por dose</small>'},
  {k:['arroz'], t:'Arroz salteado de aproveitamento',
   d:'Salteia <b>{ing}</b> em lume forte com um fio de azeite e tempera a gosto.<br><small>⏱ 10 min · 💶 menos de 1 € por dose</small>'}
];
const RECEITA_GENERICA = {t:'Salteado de aproveitamento',
  d:'Usa <b>{ing}</b>. Salteia tudo em lume forte com um fio de azeite, tempera a gosto e serve.<br><small>⏱ 15 min · 💶 menos de 1,50 € por dose</small>'};

function gen(){
  const exp = S.pantry.filter(i => i.d <= 3);
  if (!exp.length){ toast('Nada a expirar nos próximos 3 dias. Boa gestão!', '👏'); return; }
  let best = null, usados = [];
  RECEITAS.forEach(r => {
    const u = exp.filter(i => r.k.some(k => i.n.toLowerCase().includes(k)));
    if (u.length > usados.length){ best = r; usados = u; }
  });
  if (!best){ best = RECEITA_GENERICA; usados = exp; }
  const nomes = usados.map(i => i.n.toLowerCase()).join(', ');
  S.recipe = {ids: usados.map(i => i.n), t: best.t, d: best.d.replace('{ing}', nomes)};
  save(); render();
}
function cook(){
  const n = S.recipe.ids.length;
  S.pantry = S.pantry.filter(i => !S.recipe.ids.includes(i.n));
  S.food += 0.3 * n; S.co2 += 0.8 * n; S.cooked++;
  quest('comida'); S.recipe = null;
  save();
  reward(25, 10, 'Boa! Salvaste ' + n + ' ingredientes.', '🍳');
}
function pausas(){
  const pct = Math.min(1, S.screenMin / 60), C = 2 * Math.PI * 70;
  return `<div class="top"><div><div class="h2">Pausas ativas</div><div class="sub">Cuida de ti enquanto estudas</div></div><div class="pill" data-testid="pill-coins">🪙 ${S.coins}</div></div>
  <div class="card" style="text-align:center" data-testid="card-tempo-ecra"><div class="ring" data-testid="ring-tempo-ecra"><svg viewBox="0 0 170 170"><circle cx="85" cy="85" r="70" fill="none" stroke="#E7EFDD" stroke-width="14"/><circle cx="85" cy="85" r="70" fill="none" stroke="${S.screenMin>=45?'#E8806F':'#8BC15E'}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-pct)}"/></svg><div><span data-testid="minutos-ecra">${S.screenMin} min<small>de ecrã seguido</small></span></div></div>
   <div class="sub" data-testid="mensagem-tempo-ecra">${S.screenMin>=45?'Está na hora de uma pausa!':'Estás a ir bem. Pausa recomendada aos 45 min.'}</div></div>
  <div class="card" data-testid="card-atividades"><h3>O que fazes agora?</h3>
   <div style="display:grid;gap:10px">
   <button class="btn alt" data-testid="btn-bebi-agua" onclick="act('agua')">💧 Bebi água</button>
   <button class="btn" data-testid="btn-caminhada" onclick="act('walk')">🚶 Caminhada de 5 minutos</button>
   <button class="btn" data-testid="btn-treino-rapido" onclick="act('fit')">🤸 Treino rápido de 3 min</button>
   <button class="btn sm" style="background:#8a99a8;box-shadow:0 4px 0 #6a7a8a" data-testid="btn-simular-lembrete" onclick="remind()">🔔 Simular lembrete da EVOLI</button></div></div>
  <div class="grid2" style="margin-top:12px"><div class="stat" data-testid="stat-copos"><b>${S.water}</b><span>copos hoje</span></div><div class="stat" data-testid="stat-pausas"><b>${S.breaks}</b><span>pausas ativas hoje</span></div></div>`;
}
function act(k){
  if (k === 'agua'){ S.water++; quest('agua'); save(); reward(5, 8, 'Hidratação em dia!', '💧'); }
  else { S.breaks++; S.screenMin = 0; S.co2 += k === 'walk' ? 0.2 : 0.1; quest('pausa'); save(); reward(k === 'walk' ? 15 : 20, k === 'walk' ? 18 : 22, k === 'walk' ? 'Ar fresco para os dois!' : 'Que treino!', '🌿'); }
}
function remind(){
  S.screenMin = Math.max(S.screenMin, 50);
  save(); render();
  toast('EVOLI: “Já passaram 50 min. Vamos mexer-nos?”', '🔔');
}
function stage(){ return S.co2 < 5 ? 1 : S.co2 < 10 ? 2 : 3; }
function mundo(){
  const st = stage(), sky = ['#D9D3C4','#CFE6F7','#BEE3F8'][st-1], gr = ['#C9A97A','#9FC878','#6FB04F'][st-1];
  let x = '';
  if (st === 1) x = '<path d="M60 150v-30M60 135l-12-10M60 128l10-10" stroke="#8B6B43" stroke-width="4" stroke-linecap="round"/><path d="M250 155v-24M250 142l-10-8" stroke="#8B6B43" stroke-width="4" stroke-linecap="round"/><circle cx="260" cy="40" r="22" fill="#E8DDB8"/>';
  if (st >= 2) x += '<circle cx="260" cy="40" r="24" fill="#FFE18A"/>' + [[50,150],[110,160],[230,152]].map(p => `<path d="M${p[0]} ${p[1]}v-14" stroke="#4F7F3C" stroke-width="4"/><ellipse cx="${p[0]-6}" cy="${p[1]-16}" rx="8" ry="5" fill="#6FA34B"/><ellipse cx="${p[0]+7}" cy="${p[1]-18}" rx="8" ry="5" fill="#8BC15E"/>`).join('');
  if (st === 3) x += [[40,140],[270,140],[170,150]].map(p => `<rect x="${p[0]-4}" y="${p[1]-30}" width="8" height="34" fill="#8B6B43"/><circle cx="${p[0]}" cy="${p[1]-42}" r="26" fill="#4F9A47"/><circle cx="${p[0]+14}" cy="${p[1]-32}" r="18" fill="#6FB04F"/>`).join('') + [[90,170],[130,176],[210,172],[245,178]].map((p,i) => `<circle cx="${p[0]}" cy="${p[1]}" r="5" fill="${['#F28CA6','#FFD54F','#fff','#F28CA6'][i]}"/>`).join('');
  const names = ['O mundo precisa de ti','Primeiros rebentos','Um mundo verde e limpo'];
  const next = st === 1 ? 5 : st === 2 ? 10 : null, pct = next ? Math.min(100, S.co2 / next * 100) : 100;
  return `<div class="top"><div><div class="h2">O mundo da EVOLI</div><div class="sub" data-testid="mundo-fase">${names[st-1]}</div></div><div class="pill" data-testid="pill-coins">🪙 ${S.coins}</div></div>
  <div class="world" data-testid="mundo-ecossistema"><svg viewBox="0 0 320 220"><rect width="320" height="220" fill="${sky}"/>${st>=2?'<ellipse cx="80" cy="50" rx="30" ry="10" fill="#fff" opacity=".8"/>':''}<ellipse cx="160" cy="215" rx="260" ry="75" fill="${gr}"/>${x}<g transform="translate(112 92) scale(.48)">${mascot().replace(/<svg[^>]*>|<\/svg>/g,'')}</g></svg></div>
  <div class="card" data-testid="card-progresso-mundo"><div class="lbl"><span>🌱 Progresso do ecossistema</span><span data-testid="progresso-co2">${next ? S.co2.toFixed(1) + ' / ' + next + ' kg CO₂' : 'Nível máximo'}</span></div><div class="bar" style="background:#E7EFDD" data-testid="barra-progresso-mundo"><i style="width:${pct}%"></i></div></div>
  <div class="grid2" style="margin-top:12px"><div class="stat" data-testid="stat-comida-salva"><b>🥗 ${S.food.toFixed(1)} kg</b><span>comida salva</span></div><div class="stat" data-testid="stat-co2"><b>☁️ ${S.co2.toFixed(1)} kg</b><span>CO₂ evitado</span></div></div>
  <p class="sub" style="margin-top:12px;text-align:center">Cozinha ingredientes a expirar e faz pausas ativas para fazer o mundo florescer.</p>`;
}
function loja(){
  return `<div class="top"><div><div class="h2">Loja ecológica</div><div class="sub">Acessórios feitos de materiais reciclados</div></div><div class="pill" data-testid="pill-coins">🪙 ${S.coins}</div></div>
  <div class="stage" style="margin-top:-6px" data-testid="previsao-mascote"><div style="transform:scale(.7);height:170px;margin-top:-20px">${mascot()}</div></div>
  <div class="shop" data-testid="grelha-loja">${SHOP.map(i => {
    const o = S.owned[i.id], w = S.worn[i.id];
    return `<div class="card" data-testid="artigo-${i.id}"><div class="emo">${i.e}</div><b>${i.n}</b>${o ? `<button class="btn sm" data-testid="btn-vestir-${i.id}" onclick="wear('${i.id}')">${w?'Tirar':'Vestir'}</button>` : `<button class="btn sm" data-testid="btn-comprar-${i.id}" ${S.coins<i.p?'disabled':''} onclick="buy('${i.id}')">🪙 ${i.p}</button>`}</div>`;
  }).join('')}</div>`;
}
function buy(id){
  const i = SHOP.find(x => x.id === id);
  if (S.coins < i.p) return;
  S.coins -= i.p; S.owned[id] = true; S.worn[id] = true;
  save(); render();
  toast(i.n + ' desbloqueado!', '🎉');
}
function wear(id){
  S.worn[id] = !S.worn[id];
  save(); render();
}
function go(t){ S.tab = t; save(); render(); $('#screen').scrollTop = 0; }
const V = {casa, despensa, pausas, mundo, loja};

function render(){
  const sc = $('#screen').scrollTop;
  $('#screen').innerHTML = V[S.tab]();
  $('#screen').scrollTop = sc;
  $('#tabs').innerHTML = TABS.map(t => `<button class="tab" role="tab" aria-selected="${t[0]===S.tab}" data-testid="tab-${t[0]}" onclick="go('${t[0]}')"><span>${t[1]}</span>${t[2]}</button>`).join('');
}
render();
setTimeout(() => {
  if (S.tab === 'casa' && S.screenMin >= 45)
    toast('EVOLI: “Já estás há ' + S.screenMin + ' min no ecrã. Pausa?”', '🔔');
}, 2500);

/* Reiniciar protótipo (painel lateral) */
document.getElementById('reiniciar').addEventListener('click', () => {
  localStorage.removeItem(LS);
  location.reload();
});
