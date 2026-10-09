import type { Enums } from "@/lib/supabase/database.types";

export const homeRooms = [
  "cozinha",
  "mesa",
  "banheiro",
  "quarto",
  "sala",
  "lavanderia",
  "eletro",
  "moveis",
  "organizacao",
  "ferramentas",
  "outros",
] as const;

export type HomeRoom = (typeof homeRooms)[number];
export type HomeStatus = Enums<"home_status">;
export type HomePriority = Enums<"home_priority">;

export const homeStatuses = [
  "missing",
  "wishlist",
  "bought",
  "gifted",
] as const satisfies readonly HomeStatus[];
export const homePriorities = [
  "essential",
  "important",
  "nice",
] as const satisfies readonly HomePriority[];

export type HomeRow = {
  room: string;
  quantity: number;
  priority: HomePriority;
  status: HomeStatus;
  estimate_cents: number | null;
  paid_cents: number | null;
};

export function isDone(status: HomeStatus) {
  return status === "bought" || status === "gifted";
}

export function itemEstimate(
  item: Pick<HomeRow, "quantity" | "estimate_cents">,
) {
  return (item.estimate_cents ?? 0) * item.quantity;
}

export function homeSummary(items: readonly HomeRow[]) {
  const byStatus: Record<HomeStatus, number> = {
    missing: 0,
    wishlist: 0,
    bought: 0,
    gifted: 0,
  };
  const byRoom = new Map<HomeRoom, { total: number; done: number }>();
  for (const room of homeRooms) byRoom.set(room, { total: 0, done: 0 });
  let estimate = 0;
  let remaining = 0;
  let spent = 0;
  let essentialsMissing = 0;
  for (const item of items) {
    byStatus[item.status] += 1;
    const room = byRoom.get(item.room as HomeRoom);
    if (room) {
      room.total += 1;
      if (isDone(item.status)) room.done += 1;
    }
    estimate += itemEstimate(item);
    if (!isDone(item.status)) remaining += itemEstimate(item);
    spent += item.paid_cents ?? 0;
    if (item.priority === "essential" && !isDone(item.status))
      essentialsMissing += 1;
  }
  const done = byStatus.bought + byStatus.gifted;
  return {
    total: items.length,
    done,
    byStatus,
    byRoom,
    estimate,
    remaining,
    spent,
    essentialsMissing,
  };
}

const roomHints: readonly [HomeRoom, RegExp][] = [
  [
    "mesa",
    /\b(prato|pratos|talher|talheres|ta[cç]a|ta[cç]as|copo|copos|x[ií]cara|sousplat|guardanapo|toalha de mesa|jogo americano|travessa|sobremesa)\b/i,
  ],
  [
    "banheiro",
    /\b(toalha|toalhas|tapete de banheiro|piso|lixeira de banheiro|porta.?escova|saboneteira|roup[aã]o)\b/i,
  ],
  [
    "quarto",
    /\b(len[cç]ol|len[cç][oó]is|edredom|travesseiro|fronha|cobertor|colcha|manta|protetor de colch[aã]o|cabide)\b/i,
  ],
  [
    "lavanderia",
    /\b(vassoura|rodo|balde|pano|varal|prendedor|t[aá]bua de passar|cesto de roupa|p[aá] de lixo|esfreg)\b/i,
  ],
  [
    "eletro",
    /\b(geladeira|fog[aã]o|micro.?ondas|liquidificador|batedeira|cafeteira|air.?fryer|fritadeira|torradeira|ferro|aspirador|m[aá]quina de lavar|lava.?lou[cç]as|sanduicheira|chaleira el[eé]trica|mixer|processador)\b/i,
  ],
  [
    "moveis",
    /\b(sof[aá]|cama|guarda.?roupa|mesa de jantar|cadeira|cadeiras|rack|estante|criado.?mudo|cômoda|comoda|poltrona)\b/i,
  ],
  [
    "sala",
    /\b(almofada|cortina|tapete|abajur|quadro|vaso|manta de sof[aá]|lumin[aá]ria)\b/i,
  ],
  [
    "ferramentas",
    /\b(furadeira|martelo|chave de fenda|alicate|trena|kit de ferramentas|escada|lanterna|fita isolante)\b/i,
  ],
  [
    "organizacao",
    /\b(pote|potes|organizador|caixa organizadora|porta.?tempero|cesto)\b/i,
  ],
  [
    "cozinha",
    /\b(panela|panelas|frigideira|faca|facas|t[aá]bua|escorredor|concha|esp[aá]tula|assadeira|forma|ralador|abridor|peneira|leiteira|chaleira|pano de prato|utens[ií]lio)\b/i,
  ],
];

export function guessRoom(name: string): HomeRoom {
  for (const [room, pattern] of roomHints) if (pattern.test(name)) return room;
  return "outros";
}

const roomNames: Record<string, HomeRoom> = Object.fromEntries(
  [
    ["cozinha", "cozinha"],
    ["mesa", "mesa"],
    ["mesa posta", "mesa"],
    ["banheiro", "banheiro"],
    ["banho", "banheiro"],
    ["quarto", "quarto"],
    ["cama", "quarto"],
    ["sala", "sala"],
    ["lavanderia", "lavanderia"],
    ["limpeza", "lavanderia"],
    ["area de servico", "lavanderia"],
    ["eletro", "eletro"],
    ["eletrodomesticos", "eletro"],
    ["eletroportateis", "eletro"],
    ["moveis", "moveis"],
    ["organizacao", "organizacao"],
    ["ferramentas", "ferramentas"],
  ].map(([key, room]) => [key, room as HomeRoom]),
);

const plain = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

function parseMoney(cell: string) {
  if (!/\d/.test(cell) || !/(r\$|,\d{2}$|\.\d{2}$)/i.test(cell.trim()))
    return null;
  const digits = cell.replace(/[^\d,.-]/g, "");
  const normalized = digits.includes(",")
    ? digits.replace(/\./g, "").replace(",", ".")
    : digits;
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) && value > 0 ? Math.round(value * 100) : null;
}

const doneWords = /^(sim|ok|x|comprado|comprada|tenho|ja tenho|feito|✓|✔)$/i;
const giftWords = /^(ganhei|ganhamos|presente|ganho)$/i;
const headerWords = /^(item|itens|nome|produto|descricao|o que)$/i;

export type ParsedItem = {
  name: string;
  room: HomeRoom;
  quantity: number;
  estimate_cents: number | null;
  status: HomeStatus;
};

export function parseHomeRows(text: string): ParsedItem[] {
  const result: ParsedItem[] = [];
  const seen = new Set<string>();
  let room: HomeRoom | null = null;
  for (const raw of text.split(/\r?\n/)) {
    const cells = (raw.includes("\t") ? raw.split("\t") : raw.split(";")).map(
      (cell) => cell.trim(),
    );
    const filled = cells.filter(Boolean);
    if (filled.length === 0) continue;
    if (filled.length === 1 && roomNames[plain(filled[0]).replace(/:$/, "")]) {
      room = roomNames[plain(filled[0]).replace(/:$/, "")];
      continue;
    }
    if (headerWords.test(plain(filled[0]))) continue;
    let name = "";
    let quantity = 1;
    let estimate: number | null = null;
    let status: HomeStatus = "missing";
    let cellRoom: HomeRoom | null = null;
    for (const cell of filled) {
      const key = plain(cell);
      if (roomNames[key]) cellRoom = roomNames[key];
      else if (doneWords.test(key)) status = "bought";
      else if (giftWords.test(key)) status = "gifted";
      else if (/^\d{1,3}$/.test(cell) && name)
        quantity = Math.max(1, Number(cell));
      else if (parseMoney(cell) !== null && name) estimate = parseMoney(cell);
      else if (!name)
        name = cell
          .replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "")
          .replace(/\s+/g, " ")
          .slice(0, 80)
          .trim();
    }
    if (!name) continue;
    const dedupe = plain(name);
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);
    result.push({
      name,
      room: cellRoom ?? room ?? guessRoom(name),
      quantity: Math.min(quantity, 999),
      estimate_cents: estimate,
      status,
    });
  }
  return result.slice(0, 500);
}
