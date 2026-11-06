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

export const areaHref: Partial<Record<TaskArea, string>> = {
  fornecedores: "/fornecedores",
  convidados: "/convidados",
  festa: "/cronograma",
  traje: "/ideias?quadro=moda",
  beleza: "/ideias?quadro=moda",
  padrinhos: "/cortejo",
  geral: "/orcamento",
};

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

export function phaseStart(key: PhaseKey) {
  return phaseStarts.find(([phase]) => phase === key)?.[1] ?? null;
}

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
  done: boolean;
};

export const bookings = [
  "espaco",
  "cerimonia",
  "assessoria",
  "buffet",
  "fotos",
  "musica",
  "decoracao",
  "doces",
  "traje",
  "aliancas",
  "beleza",
  "lua-de-mel",
] as const;

export type Booking = (typeof bookings)[number];

type Settled = Booking | "data";

type Template = Omit<StarterTask, "done"> & {
  only?: readonly Ceremony[];
  settled?: Settled;
};

const religious: readonly Ceremony[] = ["religious", "both"];

const template = (
  title: string,
  area: TaskArea,
  offset_days: number,
  extra: {
    notes?: string;
    key?: string;
    only?: readonly Ceremony[];
    settled?: Settled;
  } = {},
): Template => ({
  title,
  area,
  offset_days,
  notes: extra.notes ?? null,
  template_key: extra.key ?? null,
  only: extra.only,
  settled: extra.settled,
});

const templates: readonly Template[] = [
  template("Definir o orçamento total", "geral", 365, {
    notes:
      "Pesquisem casamentos na região de vocês pra ter uma base. Incluam uma reserva de 10% pra imprevistos.",
  }),
  template("Escolher a data e o estilo do casamento", "geral", 360, {
    notes:
      "Considerem clima, feriados e datas de outros casamentos na família. Sábados à noite lotam primeiro.",
    settled: "data",
  }),
  template("Fazer a primeira lista de convidados", "convidados", 355, {
    notes:
      "Anotem todos os nomes que vierem à cabeça, sem cortar ninguém ainda. A triagem vem depois.",
  }),
  template("Pesquisar e visitar espaços", "fornecedores", 350, {
    notes:
      "Visitem pelo menos 3 espaços. Perguntem sobre chuva, estacionamento, horário de som e o que está incluso.",
    settled: "espaco",
  }),
  template("Contratar o espaço da festa", "fornecedores", 335, {
    notes:
      "Leiam o contrato inteiro antes de assinar. Atenção a multas, reajuste e o que acontece em caso de cancelamento.",
    settled: "espaco",
  }),
  template("Reservar a igreja ou o local da cerimônia", "cerimonia", 330, {
    notes:
      "Liguem pra secretaria da paróquia o quanto antes. As datas mais concorridas reservam com mais de 1 ano.",
    only: religious,
    settled: "cerimonia",
  }),
  template("Contratar assessoria ou cerimonial", "fornecedores", 330, {
    notes:
      "Assessoria ajuda em tudo desde o início. Cerimonial cuida só do dia. Avaliem o que faz sentido pro orçamento.",
    settled: "assessoria",
  }),
  template("Contratar buffet e marcar a degustação", "fornecedores", 300, {
    notes:
      "Peçam orçamento detalhado: preço por pessoa, o que inclui (bebidas, estrutura, equipe) e política de excedente.",
    settled: "buffet",
  }),
  template("Contratar fotografia e filmagem", "fornecedores", 300, {
    notes:
      "Vejam portfólios completos, não só os melhores cliques. Perguntem quantas horas de cobertura e prazo de entrega.",
    settled: "fotos",
  }),
  template("Fazer a inscrição no curso de noivos", "cerimonia", 300, {
    notes:
      "Faça entre 12 e 6 meses antes. O certificado costuma valer 1 ano, confirme com a sua paróquia.",
    key: "curso-noivos",
    only: religious,
  }),
  template("Contratar banda ou DJ", "fornecedores", 270, {
    notes:
      "Definam o clima que querem: banda ao vivo anima mais, DJ dá mais flexibilidade de repertório. Peçam playlist de referência.",
    settled: "musica",
  }),
  template("Contratar decoração e flores", "fornecedores", 270, {
    notes:
      "Montem um painel de referências com fotos do Pinterest ou Instagram. Flores da estação saem mais em conta.",
    settled: "decoracao",
  }),
  template("Montar o site do casamento", "convidados", 250, {
    notes:
      "Inclua data, local, dress code, lista de presentes e um canal pra confirmar presença.",
  }),
  template("Enviar o save the date", "convidados", 240, {
    notes:
      "Digital basta. Mande por WhatsApp com 8 a 10 meses de antecedência pra quem pode precisar viajar.",
  }),
  template("Escolher padrinhos e madrinhas", "padrinhos", 220, {
    notes:
      "Não existe número obrigatório. Chamem quem é importante pra vocês. Conversem pessoalmente, não por mensagem.",
  }),
  template("Escolher o vestido ou o traje", "traje", 210, {
    notes:
      "Vestidos sob medida levam 4 a 6 meses. Aluguel exige reserva antecipada também. Comecem a olhar cedo.",
    settled: "traje",
  }),
  template("Dar entrada no processo da igreja", "cerimonia", 180, {
    notes:
      "O processo leva uns 3 meses. Separe batistério, certidões e o certificado do curso de noivos.",
    key: "processo-igreja",
    only: religious,
  }),
  template("Contratar bolo, doces e bem-casados", "fornecedores", 180, {
    notes:
      "Façam degustação antes de fechar. Combinem a entrega e montagem no local com antecedência.",
    settled: "doces",
  }),
  template("Reservar a lua de mel", "lua-de-mel", 180, {
    notes:
      "Comprem passagens com antecedência pra pegar bons preços. Confiram validade do passaporte se for internacional.",
    settled: "lua-de-mel",
  }),
  template("Montar a lista de presentes", "convidados", 170, {
    notes:
      "Usem a aba Enxoval do app pra organizar por cômodo e prioridade. Compartilhem o link no site do casamento.",
  }),
  template("Contratar cabelo e maquiagem", "beleza", 160, {
    notes:
      "Façam um teste antes de fechar. Levem referências de penteado e maquiagem. Combinem se inclui madrinhas.",
    settled: "beleza",
  }),
  template("Encomendar convites e papelaria", "papelaria", 140, {
    notes:
      "Fechem a lista de convidados antes de encomendar. Peçam umas 10% a mais por segurança.",
  }),
  template("Convidar os padrinhos com o convite caixinha", "padrinhos", 120, {
    notes: "Encomende o convite caixinha com uns 4 meses de antecedência.",
  }),
  template("Escolher as alianças e a gravação", "traje", 120, {
    notes:
      "A gravação leva de 1 a 3 semanas. Experimentem modelos diferentes de largura e acabamento.",
    settled: "aliancas",
  }),
  template("Escolher as músicas da cerimônia", "cerimonia", 100, {
    notes:
      "Usem a aba Músicas do app pra organizar por momento: entrada, cerimônia, saída. Alinhem com o músico.",
  }),
  template("Organizar a despedida de solteiro", "geral", 90, {
    notes:
      "Combinem com padrinhos e madrinhas. Pode ser simples: um jantar, uma viagem de fim de semana ou um dia de spa.",
  }),
  template("Organizar o chá de casa nova", "geral", 90, {
    notes:
      "Pode ser junto com a despedida. Compartilhem a lista de presentes pra quem quiser contribuir.",
  }),
  template("Dar entrada na habilitação no cartório", "documentos", 80, {
    notes:
      "A habilitação vale 90 dias, então dê entrada no máximo 90 dias antes do casamento. Levem certidões de nascimento atualizadas, documentos com foto, comprovante de residência e duas testemunhas.",
    key: "habilitacao",
  }),
  template("Enviar os convites", "convidados", 75, {
    notes:
      "Mande com pelo menos 2 meses de antecedência. Usem o botão de WhatsApp na lista de convidados pra facilitar.",
  }),
  template("Contratar o transporte de vocês", "fornecedores", 75, {
    notes:
      "Carro pra cerimônia e pro transfer depois da festa. Combinem horário e trajeto com antecedência.",
  }),
  template("Fechar o cardápio com o buffet", "festa", 60, {
    notes:
      "Considerem restrições alimentares dos convidados. Peçam opções vegetarianas e sem glúten.",
  }),
  template("Fazer as provas do vestido ou do traje", "traje", 45, {
    notes:
      "Agendem 2 a 3 provas: a primeira pra ajustes maiores, a última pra conferir o caimento final.",
  }),
  template("Cobrar as confirmações de presença", "convidados", 40, {
    notes:
      "Usem o botão de WhatsApp na lista de convidados pra mandar lembrete. Foquem em quem ainda está pendente.",
  }),
  template("Comprar as lembrancinhas", "festa", 40, {
    notes:
      "Algo simples e que as pessoas realmente usem. Evitem coisas frágeis que quebram no transporte.",
  }),
  template("Montar o mapa de mesas", "festa", 30, {
    notes:
      "Agrupem por afinidade: família, amigos, colegas. Deixem a mesa dos noivos perto da pista.",
  }),
  template("Montar o cronograma do dia com os fornecedores", "festa", 30, {
    notes:
      "Usem a aba Cronograma do app. Incluam horários de chegada dos fornecedores, cerimônia, jantar e festa.",
  }),
  template("Fechar a contagem de convidados com o buffet", "festa", 25, {
    notes: "Adultos, crianças e bebês costumam ter preços diferentes.",
  }),
  template("Confirmar horários com todos os fornecedores", "fornecedores", 10, {
    notes:
      "Mande uma mensagem pra cada fornecedor com data, horário de chegada e endereço. Peçam confirmação.",
  }),
  template("Separar os pagamentos finais", "geral", 7, {
    notes:
      "O Procon orienta deixar uma parcela para depois da entrega do serviço.",
  }),
  template(
    "Definir quem leva as alianças e quem cuida do celular de vocês",
    "padrinhos",
    7,
    {
      notes:
        "Escolham alguém de confiança. Combinem um sinal pra avisar quando for a hora.",
    },
  ),
  template("Montar o kit de emergência", "geral", 5, {
    notes: "Costura, remédios, curativos, maquiagem, carregador e lanchinhos.",
  }),
  template("Retirar o vestido ou o traje", "traje", 3, {
    notes:
      "Confiram se tudo está certo: ajustes, acessórios, sapato. Guardem pendurado, nunca dobrado.",
  }),
  template("Dia da noiva e do noivo", "beleza", 0, {
    notes:
      "Reservem a manhã pra cabelo e maquiagem. Comam bem, hidratem-se e curtam o momento.",
  }),
  template("Registrar o casamento religioso no cartório", "documentos", -30, {
    notes: "O registro precisa ser feito em até 90 dias depois da cerimônia.",
    key: "registro-civil",
    only: ["religious"],
  }),
  template("Enviar os agradecimentos pelos presentes", "depois", -30, {
    notes:
      "Uma mensagem personalizada pra cada pessoa faz diferença. Mencionem o presente que receberam.",
  }),
  template("Avaliar os fornecedores", "depois", -45, {
    notes:
      "Avaliem no app e deixem uma avaliação pública. Ajuda outros casais e reconhece o bom trabalho.",
  }),
  template("Atualizar documentos com o novo estado civil", "depois", -60, {
    notes:
      "RG, CPF, CNH, passaporte, conta bancária, plano de saúde. Usem a certidão de casamento.",
  }),
];

export function starterTasks(
  ceremony: Ceremony,
  {
    booked = [],
    hasDate = false,
  }: { booked?: readonly Booking[]; hasDate?: boolean } = {},
): StarterTask[] {
  const settled = new Set<Settled>(hasDate ? [...booked, "data"] : booked);
  return templates
    .filter((task) => !task.only || task.only.includes(ceremony))
    .map(({ only: _, settled: key, ...task }) => ({
      ...task,
      done: key !== undefined && settled.has(key),
    }));
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
