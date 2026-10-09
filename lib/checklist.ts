import { addDays, daysBetween } from "@/lib/dates";
import type { Enums } from "@/lib/supabase/database.types";

export const taskAreas = [
  "geral",
  "cerimonia",
  "documentos",
  "festa",
  "fornecedores",
  "convidados",
  "traje",
  "beleza",
  "papelaria",
  "padrinhos",
  "lua-de-mel",
  "depois",
] as const;

export type TaskArea = (typeof taskAreas)[number];

export const phaseKeys = [
  "12m",
  "9m",
  "6m",
  "3m",
  "1m",
  "weeks",
  "day",
  "after",
  "undated",
] as const;

export type PhaseKey = (typeof phaseKeys)[number];

const phaseStarts: readonly [PhaseKey, number][] = [
  ["12m", 330],
  ["9m", 240],
  ["6m", 150],
  ["3m", 60],
  ["1m", 21],
  ["weeks", 2],
  ["day", 0],
];

export function phaseFor(daysBefore: number | null): PhaseKey {
  if (daysBefore === null) return "undated";
  for (const [key, start] of phaseStarts) {
    if (daysBefore >= start) return key;
  }
  return "after";
}

type Ceremony = Enums<"ceremony_kind">;

export type StarterTask = {
  title: string;
  area: TaskArea;
  offset_days: number;
  notes: string | null;
  template_key: string | null;
};

type Template = StarterTask & { only?: readonly Ceremony[] };

const religious: readonly Ceremony[] = ["religious", "both"];

const template = (
  title: string,
  area: TaskArea,
  offset_days: number,
  extra: { notes?: string; key?: string; only?: readonly Ceremony[] } = {},
): Template => ({
  title,
  area,
  offset_days,
  notes: extra.notes ?? null,
  template_key: extra.key ?? null,
  only: extra.only,
});

const templates: readonly Template[] = [
  template("Definir o orçamento e quem vai ajudar a pagar", "geral", 365),
  template("Escolher a data e o estilo do casamento", "geral", 360),
  template("Fazer a primeira lista de convidados", "convidados", 355),
  template("Pesquisar e visitar espaços", "fornecedores", 350),
  template("Contratar o espaço da festa", "fornecedores", 335),
  template("Reservar a igreja ou o local da cerimônia", "cerimonia", 330, {
    only: religious,
  }),
  template("Contratar assessoria ou cerimonial", "fornecedores", 330),
  template("Contratar buffet e marcar a degustação", "fornecedores", 300),
  template("Contratar fotografia e filmagem", "fornecedores", 300),
  template("Fazer a inscrição no curso de noivos", "cerimonia", 300, {
    notes:
      "Faça entre 12 e 6 meses antes. O certificado costuma valer 1 ano, confirme com a sua paróquia.",
    key: "curso-noivos",
    only: religious,
  }),
  template("Contratar banda ou DJ", "fornecedores", 270),
  template("Contratar decoração e flores", "fornecedores", 270),
  template("Montar o site do casamento", "convidados", 250),
  template("Enviar o save the date", "convidados", 240),
  template("Escolher padrinhos e madrinhas", "padrinhos", 220),
  template("Escolher o vestido ou o traje", "traje", 210),
  template("Dar entrada no processo da igreja", "cerimonia", 180, {
    notes:
      "O processo leva uns 3 meses. Separe batistério, certidões e o certificado do curso de noivos.",
    key: "processo-igreja",
    only: religious,
  }),
  template("Contratar bolo, doces e bem-casados", "fornecedores", 180),
  template("Reservar a lua de mel", "lua-de-mel", 180),
  template("Montar a lista de presentes", "convidados", 170),
  template("Contratar cabelo e maquiagem", "beleza", 160),
  template("Encomendar convites e papelaria", "papelaria", 140),
  template("Convidar os padrinhos com o convite caixinha", "padrinhos", 120, {
    notes: "Encomende o convite caixinha com uns 4 meses de antecedência.",
  }),
  template("Escolher as alianças e a gravação", "traje", 120),
  template("Escolher as músicas da cerimônia", "cerimonia", 100),
  template("Organizar a despedida de solteiro", "geral", 90),
  template("Organizar o chá de casa nova", "geral", 90),
  template("Dar entrada na habilitação no cartório", "documentos", 80, {
    notes:
      "A habilitação vale 90 dias, então dê entrada no máximo 90 dias antes do casamento. Levem certidões de nascimento atualizadas, documentos com foto, comprovante de residência e duas testemunhas.",
    key: "habilitacao",
  }),
  template("Enviar os convites", "convidados", 75),
  template("Contratar o transporte de vocês", "fornecedores", 75),
  template("Fechar o cardápio com o buffet", "festa", 60),
  template("Fazer as provas do vestido ou do traje", "traje", 45),
  template("Cobrar as confirmações de presença", "convidados", 40),
  template("Comprar as lembrancinhas", "festa", 40),
  template("Montar o mapa de mesas", "festa", 30),
  template("Montar o cronograma do dia com os fornecedores", "festa", 30),
  template("Fechar a contagem de convidados com o buffet", "festa", 25, {
    notes: "Adultos, crianças e bebês costumam ter preços diferentes.",
  }),
  template("Confirmar horários com todos os fornecedores", "fornecedores", 10),
  template("Separar os pagamentos finais", "geral", 7, {
    notes:
      "O Procon orienta deixar uma parcela para depois da entrega do serviço.",
  }),
  template(
    "Definir quem leva as alianças e quem cuida do celular de vocês",
    "padrinhos",
    7,
  ),
  template("Montar o kit de emergência", "geral", 5, {
    notes: "Costura, remédios, curativos, maquiagem, carregador e lanchinhos.",
  }),
  template("Retirar o vestido ou o traje", "traje", 3),
  template("Dia da noiva e do noivo", "beleza", 0),
  template("Registrar o casamento religioso no cartório", "documentos", -30, {
    notes: "O registro precisa ser feito em até 90 dias depois da cerimônia.",
    key: "registro-civil",
    only: ["religious"],
  }),
  template("Enviar os agradecimentos pelos presentes", "depois", -30),
  template("Avaliar os fornecedores", "depois", -45),
  template("Atualizar documentos com o novo estado civil", "depois", -60),
];

export function starterTasks(ceremony: Ceremony): StarterTask[] {
  return templates
    .filter((task) => !task.only || task.only.includes(ceremony))
    .map(({ only: _, ...task }) => task);
}

export type TaskTiming = {
  offset_days: number | null;
  due_on: string | null;
};

export function dueDate(task: TaskTiming, weddingDate: string | null) {
  if (task.due_on) return task.due_on;
  if (weddingDate && task.offset_days !== null) {
    return addDays(weddingDate, -task.offset_days);
  }
  return null;
}

export function daysBefore(task: TaskTiming, weddingDate: string | null) {
  if (task.due_on && weddingDate) return daysBetween(task.due_on, weddingDate);
  if (task.due_on) return null;
  return task.offset_days;
}

export type TaskState = "done" | "overdue" | "soon" | "later" | "undated";

export function taskState(
  task: TaskTiming & { done_at: string | null },
  weddingDate: string | null,
  today: string,
): TaskState {
  if (task.done_at) return "done";
  const due = dueDate(task, weddingDate);
  if (!due) return "undated";
  if (due < today) return "overdue";
  return daysBetween(today, due) <= 30 ? "soon" : "later";
}

export function groupByPhase<T extends TaskTiming>(
  tasks: readonly T[],
  weddingDate: string | null,
) {
  const groups = new Map<PhaseKey, T[]>();
  for (const key of phaseKeys) groups.set(key, []);
  for (const task of tasks) {
    groups.get(phaseFor(daysBefore(task, weddingDate)))?.push(task);
  }
  for (const list of groups.values()) {
    list.sort(
      (a, b) =>
        (daysBefore(b, weddingDate) ?? Number.NEGATIVE_INFINITY) -
        (daysBefore(a, weddingDate) ?? Number.NEGATIVE_INFINITY),
    );
  }
  return [...groups].filter(([, list]) => list.length > 0);
}

export function currentPhase(weddingDate: string | null, today: string) {
  if (!weddingDate) return null;
  return phaseFor(daysBetween(today, weddingDate));
}
