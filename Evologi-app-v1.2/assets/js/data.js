/* EVOLI — dados e catálogos estáticos (fatores de emissão, receitas, loja, conquistas, missões) */

/* Fatores de emissão — Poore & Nemecek (2018), compilados pela Our World in Data
   (médias globais de produção, kg CO₂e por kg de alimento). São estimativas:
   variam consoante o alimento, a origem e a metodologia. */
export const FACTORS = [
  { id: "vaca", label: "Carne de vaca", f: 99.5, keys: ["vaca", "bife", "vitel"] },
  { id: "queijo", label: "Queijo", f: 23.9, keys: ["queijo", "requeijao", "requeijão"] },
  { id: "frango", label: "Carne de frango", f: 9.9, keys: ["frango", "galinha", "peru"] },
  { id: "ovos", label: "Ovos", f: 4.7, keys: ["ovo", "ovos"] },
  { id: "arroz", label: "Arroz", f: 4.45, keys: ["arroz"] },
  { id: "leite", label: "Leite e iogurte", f: 3.15, keys: ["leite", "iogurte", "bebida aveia"] },
  { id: "pao", label: "Pão (trigo e centeio)", f: 1.57, keys: ["pao", "pão", "broa", "baguete"] },
  { id: "banana", label: "Banana", f: 0.86, keys: ["banana"] },
  { id: "legumes", label: "Legumes e verduras", f: 0.5, keys: ["espinafre", "tomate", "alface", "cenoura", "legume", "courgette", "brocolos", "brócolos", "couve", "cebola", "pepino", "pimento", "abobora", "abóbora", "batata", "cenoura", "feijao verde", "espargos", "couve-flor", "rucula", "rúcula", "fruta"] },
  { id: "maca", label: "Maçã", f: 0.43, keys: ["maca", "maçã", "pera"] },
  { id: "outro", label: "Outro (fator provisório 1,0)", f: 1.0, keys: [] }
];

export function guessFactorId(name) {
  const n = name.toLowerCase();
  for (const f of FACTORS) {
    if (f.keys.some(k => n.includes(k))) return f.id;
  }
  return "outro";
}
export function factorById(id) {
  return FACTORS.find(f => f.id === id) || FACTORS[FACTORS.length - 1];
}

/* Receitas — prioridade ao que está a expirar. {ing} é substituído pelos ingredientes. */
export const RECIPES = [
  { keys: ["arroz", "tomate", "espinafre"], t: "Arroz de tomate com espinafres", time: "15 min", ing: ["arroz", "tomate", "espinafres"], extras: ["cebola", "azeite"],
    d: "Refoga os ingredientes com cebola e azeite, junta um pouco de água e deixa apurar 10 min." },
  { keys: ["tomate", "espinafre"], t: "Salada morna de tomate e espinafres", time: "8 min", ing: ["tomate", "espinafres"], extras: ["alho", "azeite"],
    d: "Salteia tudo 3 min com alho e azeite. Serve morno com um fio de limão." },
  { keys: ["iogurte"], t: "Taça de iogurte com aveia", time: "3 min", ing: ["iogurte"], extras: ["aveia", "fruta ou mel"],
    d: "Mistura o iogurte com aveia e o que tiveres de fruta ou mel." },
  { keys: ["arroz"], t: "Arroz salteado de aproveitamento", time: "10 min", ing: ["arroz"], extras: ["azeite", "temperos"],
    d: "Salteia o arroz em lume forte com um fio de azeite e tempera a gosto." },
  { keys: ["frango"], t: "Frango salteado com legumes", time: "20 min", ing: ["frango"], extras: ["alho", "legumes que tengas"],
    d: "Corta o frango em tiras e salteia em lume forte. Junta legumes e tempera." },
  { keys: ["banana"], t: "Panquecas de banana e aveia", time: "12 min", ing: ["banana"], extras: ["ovo", "aveia"],
    d: "Amassa a banana com ovo e aveia e cozinha em frigideira antiaderente." },
  { keys: ["maca", "maçã"], t: "Maçã assada com canela", time: "25 min", ing: ["maçã"], extras: ["canela", "açúcar mascavado"],
    d: "Corta a maçã ao meio, polvilha com canela e assa a 180 °C." },
  { keys: ["pao", "pão"], t: "Fatias douradas de aproveitamento", time: "10 min", ing: ["pão"], extras: ["ovo", "leite"],
    d: "Molha o pão em ovo batido com leite e doura na frigideira." },
  { keys: ["leite"], t: "Papas de leite com aveia", time: "5 min", ing: ["leite"], extras: ["aveia", "canela"],
    d: "Aquece o leite, junta aveia e mexe até engrossar." },
  { keys: ["ovo", "ovos"], t: "Ovos mexidos com sobras", time: "7 min", ing: ["ovos"], extras: ["o que tenhas no frigorífico"],
    d: "Bate os ovos e mexe em lume brando. Junta sobras picadas no fim." },
  { keys: ["queijo"], t: "Tostas de queijo no forno", time: "8 min", ing: ["queijo"], extras: ["pão"],
    d: "Tosta o pão, cobre com queijo e gratina no forno até borbulhar." },
  { keys: ["batata", "cenoura", "cebola"], t: "Sopa cremosa de aproveitamento", time: "25 min", ing: ["legumes"], extras: ["caldo", "azeite"],
    d: "Coze os legumes em água com sal, tritura e serve com azeite." }
];

export const GENERIC_RECIPE = { t: "Salteado de aproveitamento", time: "15 min", ing: [], extras: [],
  d: "Usa o que está a expirar: salteia tudo em lume forte com um fio de azeite e tempera a gosto." };

/* Loja — sementes 🌰 */
export const SHOP = [
  { id: "hat", n: "Chapéu de palha reciclada", e: "👒", p: 40, kind: "wear" },
  { id: "glasses", n: "Óculos de madeira FSC", e: "👓", p: 60, kind: "wear" },
  { id: "scarf", n: "Cachecol de algodão orgânico", e: "🧣", p: 80, kind: "wear" },
  { id: "bow", n: "Laço de tecido reaproveitado", e: "🎀", p: 30, kind: "wear" },
  { id: "planter", n: "Floreira de composto", e: "🪴", p: 50, kind: "scene" },
  { id: "feeder", n: "Comedouro de pássaros", e: "🐦", p: 70, kind: "scene" },
  { id: "bench", n: "Banco de madeira certificada", e: "🪑", p: 60, kind: "scene" }
];

export const CATEGORIES = [
  { id: "saude", label: "Saúde e bem-estar", icon: "bi-heart-pulse", color: "#D97736" },
  { id: "disciplina", label: "Produtividade e disciplina", icon: "bi-bullseye", color: "#3D6B50" },
  { id: "sustentavel", label: "Sustentabilidade", icon: "bi-recycle", color: "#76A035" },
  { id: "alimentacao", label: "Alimentação", icon: "bi-egg-fried", color: "#C99A2E" },
  { id: "digital", label: "Bem-estar digital", icon: "bi-phone", color: "#53685B" }
];

export const HABIT_TEMPLATES = [
  { name: "Beber 2 L de água", cat: "saude", freq: "daily", target: 1 },
  { name: "Pausa ativa de 5 min", cat: "saude", freq: "daily", target: 1 },
  { name: "Alongar 10 min", cat: "saude", freq: "daily", target: 1 },
  { name: "Sessão de estudo focado", cat: "disciplina", freq: "days", days: [1, 2, 3, 4, 5], target: 1 },
  { name: "Planear o dia de manhã", cat: "disciplina", freq: "daily", target: 1 },
  { name: "Separar a reciclagem", cat: "sustentavel", freq: "weekly", target: 2 },
  { name: "Rever validades da despensa", cat: "alimentacao", freq: "weekly", target: 1 },
  { name: "Cozinhar uma refeição em casa", cat: "alimentacao", freq: "daily", target: 1 },
  { name: "Sem telemóvel às refeições", cat: "digital", freq: "daily", target: 1 },
  { name: "Ecrãs desligados às 22h", cat: "digital", freq: "daily", target: 1 }
];

/* Missões diárias — rotação determinística por dia (4 por dia, sempre com uma de comida e uma de saúde) */
export const MISSION_POOL = [
  { key: "agua", icon: "bi-droplet-fill", title: "Beber 3 copos de água", target: 3, xp: 15, coins: 10, energy: 8 },
  { key: "usar", icon: "bi-egg-fried", title: "Aproveitar 1 alimento a expirar", target: 1, xp: 25, coins: 20, energy: 0 },
  { key: "pausa", icon: "bi-alarm", title: "Fazer 1 pausa ativa", target: 1, xp: 15, coins: 10, energy: 10 },
  { key: "habitos", icon: "bi-check2-circle", title: "Completar todos os hábitos de hoje", target: 1, xp: 30, coins: 20, energy: 10 },
  { key: "mover", icon: "bi-bicycle", title: "Registar 15 min de movimento", target: 15, xp: 20, coins: 15, energy: 12 },
  { key: "cozinhar", icon: "bi-fire", title: "Preparar uma refeição em casa", target: 1, xp: 15, coins: 10, energy: 5 },
  { key: "ecra", icon: "bi-phone", title: "Registar o tempo de ecrã de hoje", target: 1, xp: 10, coins: 5, energy: 5 }
];

export const WEEKLY_POOL = [
  { key: "agua-s", icon: "bi-droplet-fill", title: "25 copos de água esta semana", target: 25, xp: 60, coins: 50 },
  { key: "pausas-s", icon: "bi-alarm", title: "Pausas ativas em 5 dias desta semana", target: 5, xp: 60, coins: 50 },
  { key: "usar-s", icon: "bi-egg-fried", title: "Aproveitar 3 alimentos esta semana", target: 3, xp: 60, coins: 50 },
  { key: "mover-s", icon: "bi-bicycle", title: "90 min de movimento esta semana", target: 90, xp: 60, coins: 50 }
];

export const ACHIEVEMENTS = [
  { id: "primeira-refeicao", e: "🍳", title: "Primeira refeição salva", desc: "Aproveitaste um alimento que ia estragar." },
  { id: "kg-1", e: "🥗", title: "1 kg salvo", desc: "1 kg de comida não foi para o lixo." },
  { id: "kg-5", e: "🏆", title: "5 kg salvos", desc: "Cinco quilos de comida aproveitada." },
  { id: "co2-10", e: "☁️", title: "10 kg CO₂e", desc: "Estimativa acumulada de 10 kg de CO₂e." },
  { id: "streak-3", e: "🔥", title: "3 dias seguidos", desc: "Três dias de consistência." },
  { id: "streak-7", e: "⚡", title: "Semana completa", desc: "Sete dias seguidos de consistência." },
  { id: "streak-30", e: "🌟", title: "Imparável", desc: "Trinta dias seguidos de consistência." },
  { id: "nivel-5", e: "5️⃣", title: "Nível 5", desc: "Chegaste ao nível 5." },
  { id: "agua-100", e: "💧", title: "Hidratado", desc: "100 copos de água registados." },
  { id: "habitos-10", e: "🌱", title: "Semeador de hábitos", desc: "Criaste 10 hábitos." },
  { id: "feitos-50", e: "✅", title: "50 objetivos cumpridos", desc: "Cinquenta hábitos concluídos ao todo." },
  { id: "colecionador", e: "🎒", title: "Colecionador", desc: "Tens 3 itens da loja." },
  { id: "mundo-4", e: "🌍", title: "Mundo próspero", desc: "O ecossistema chegou à fase 4." }
];

export const QUOTES = [
  "Consistência vale mais do que intensidade.",
  "Cada copo de água conta. Cada pausa conta. Tu contas.",
  "O teu progresso é um jardim: rega-se todos os dias.",
  "Pequenos gestos, mundo grande.",
  "Não precisas de ser perfeito — precisas de ser constante.",
  "Desperdiçar menos começa na despensa.",
  "Respira fundo, bebe água, continua.",
  "O teu mundo cresce ao ritmo dos teus gestos.",
  "Hoje é mais um dia para cresceres um pouco.",
  "A EVOLI está orgulhosa de ti.",
  "Um hábito de cada vez, um mundo melhor.",
  "O que aproveitas hoje, o planeta agradece amanhã."
];

export const EMOJI_GUESS = [
  { e: "🥛", k: ["iogurte", "leite", "queijo"] }, { e: "🍅", k: ["tomate"] },
  { e: "🍚", k: ["arroz", "massa", "espaguete"] }, { e: "🥚", k: ["ovo"] },
  { e: "🥬", k: ["espinafre", "alface", "couve", "brócolo", "brocolo"] },
  { e: "🍌", k: ["banana"] }, { e: "🍎", k: ["maca", "maçã", "pera", "fruta"] },
  { e: "🍞", k: ["pao", "pão", "broa"] }, { e: "🍗", k: ["frango", "galinha", "carne"] },
  { e: "🥕", k: ["cenoura"] }, { e: "🥔", k: ["batata"] }, { e: "🧅", k: ["cebola"] },
  { e: "🫛", k: ["feijao", "grao"] }, { e: "🐟", k: ["peixe", "atum", "salmão"] },
  { e: "🍯", k: ["mel"] }, { e: "🫘", k: ["feijao", "lentilha"] }
];
export function guessEmoji(name) {
  const n = name.toLowerCase();
  for (const g of EMOJI_GUESS) if (g.k.some(k => n.includes(k))) return g.e;
  return "🥣";
}

export const WEEKDAYS_SHORT = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];
