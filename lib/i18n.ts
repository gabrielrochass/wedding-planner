const plural = (n: number, one: string, many: string) =>
  `${n.toLocaleString("pt-BR")} ${n === 1 ? one : many}`;

export const m = {
  app: {
    name: "Dois em Um",
    shortName: "Dois em Um",
    description:
      "Planejem o casamento juntos, do checklist com os prazos do Brasil à casa nova.",
  },
  common: {
    back: "Voltar",
    close: "Fechar",
    save: "Salvar",
    saving: "Salvando…",
    loading: "Carregando…",
    create: "Criar",
    cancel: "Cancelar",
    delete: "Excluir",
    deleting: "Excluindo…",
    edit: "Editar",
    add: "Adicionar",
    optional: "Opcional",
    undo: "Desfazer",
    seeAll: "Ver tudo",
    skipToContent: "Pular para o conteúdo",
    tryAgain: "Não foi possível salvar. Tente de novo.",
    today: "Hoje",
    yesterday: "Ontem",
    noPermission: "Seu papel neste casamento não permite essa mudança.",
    readOnly: "Você está vendo em modo leitura.",
    nameRequired: "Informe um nome",
    nameTaken: "Já existe um item com esse nome",
    limitReached: "Vocês chegaram ao limite de itens deste tipo.",
    dateInvalid: "Escolha uma data entre 2000 e 2100",
    amountRequired: "Informe um valor",
    of: (part: string, total: string) => `${part} de ${total}`,
  },
  nav: {
    label: "Navegação principal",
    home: "Início",
    tasks: "Tarefas",
    guests: "Convidados",
    budget: "Orçamento",
    vendors: "Fornecedores",
    team: "Equipe",
    ideas: "Ideias",
    music: "Músicas",
    party: "Cortejo",
    timeline: "Cronograma",
    enxoval: "Enxoval",
    settings: "Ajustes",
    more: "Mais",
    add: "Adicionar",
  },
  quick: {
    title: "Adicionar",
    description: "O que vocês querem anotar agora?",
    task: "Tarefa",
    taskHint: "Algo para fazer, com prazo",
    guests: "Convidados",
    guestsHint: "Uma família ou uma lista de nomes",
    payment: "Gasto",
    paymentHint: "Um gasto previsto ou já pago",
    vendor: "Fornecedor",
    vendorHint: "Alguém para pesquisar ou contratar",
    idea: "Ideia",
    ideaHint: "Uma foto ou link para o moodboard",
    homeItem: "Enxoval",
    homeItemHint: "Algo para a casa nova",
  },
  roles: {
    couple: "Casal",
    planner: "Assessoria",
    helper: "Ajudante",
    viewer: "Só leitura",
  },
  roleHints: {
    couple: "Pode tudo, inclusive convidar pessoas e excluir o casamento.",
    planner: "Edita tudo, menos a equipe.",
    helper:
      "Edita tarefas, convidados, ideias, músicas, cortejo, cronograma e enxoval. Vê orçamento e fornecedores.",
    viewer: "Vê tudo e não muda nada.",
  },
  tour: {
    help: "Como funciona esta tela",
    step: (label: string, current: number, total: number) =>
      `${label}, ${current} de ${total}`,
    next: "Próximo",
    back: "Anterior",
    finish: "Concluir",
    skip: "Pular",
    close: "Fechar",
    continueWith: (label: string) => `Ver o tour de ${label}`,
    replayGeneral: "Rever o tour geral",
    replayGeneralHint: "A visão geral do app e de como tudo se conecta",
    replayPages: "Rever os tours das abas",
    replayPagesHint: "Cada aba volta a mostrar o seu tour na próxima visita",
    section: "Ajuda",
  },
  tours: {
    geral: {
      label: "Visão geral",
      steps: [
        {
          title: "Boas-vindas ao Dois em Um",
          text: [
            "Aqui vocês planejam o casamento inteiro em um lugar só: tarefas com prazos, orçamento com parcelas, fornecedores, convidados, ideias, músicas, cortejo, cronograma do dia e o enxoval da casa nova.",
            "Tudo pertence a um casamento só, compartilhado com quem vocês chamarem para a equipe. O que uma pessoa muda, as outras veem ao abrir a tela.",
            "Este tour mostra onde fica cada coisa e como as partes conversam entre si. Avancem pelos botões ou pelas setas do teclado.",
          ],
        },
        {
          target: "nav-inicio",
          title: "Início, o resumo de tudo",
          text: [
            "O Início junta o que importa agora: a contagem até o sim, o progresso geral, a fase em que vocês estão, as próximas tarefas, os próximos pagamentos e os números de convidados e orçamento.",
            "Quase nada se edita aqui. Ele lê as outras abas e mostra o próximo passo, e cada cartão leva para a aba de onde veio a informação.",
          ],
        },
        {
          target: "nav-tarefas",
          title: "Tarefas, o checklist com prazos",
          text: [
            "Um checklist brasileiro, montado quando vocês criaram o casamento, com cartório, igreja, fornecedores, convidados e o que vem depois da festa.",
            "Cada tarefa conta os dias a partir da data do casamento. Se a data mudar, todos os prazos andam juntos. As tarefas ficam agrupadas por fase, de 12 meses antes até depois do casamento.",
          ],
        },
        {
          target: "adicionar",
          title: "Adicionar de qualquer lugar",
          text: [
            "Atalho para anotar algo sem trocar de aba: tarefa, família de convidados, gasto, ideia, item do enxoval ou fornecedor.",
            "Gasto e fornecedor aparecem só para quem pode mexer no orçamento, o casal e a assessoria.",
          ],
        },
        {
          target: "nav-convidados",
          title: "Convidados, por família",
          text: [
            "A lista é organizada por família ou grupo, como os convites de verdade. Cada família tem as pessoas, a idade de cada uma, de quem é o convidado, a lista (A, B ou fora) e o WhatsApp.",
            "Daqui saem os números que o resto do app usa: quantos são esperados, quantos confirmaram e o custo por convidado no orçamento.",
          ],
        },
        {
          target: "nav-orcamento",
          title: "Orçamento, com parcelas",
          text: [
            "Cada gasto pertence a uma categoria e pode ter estimativa, valor fechado e parcelas com vencimento.",
            "O orçamento mostra quanto está comprometido, quanto já foi pago, quanto ainda cabe no valor total e quanto guardar por mês até o casamento.",
          ],
        },
        {
          target: "mais",
          title: "O resto fica em Mais",
          text: [
            "Fornecedores, Ideias, Músicas, Cortejo, Cronograma, Enxoval, Equipe e Ajustes ficam aqui.",
            "No celular, pelo ícone de grade no topo do Início. No computador, na barra lateral.",
          ],
        },
        {
          title: "Como tudo se conecta",
          text: [
            "A data do casamento, em Ajustes, define o prazo de cada tarefa, a fase atual, a contagem e quanto guardar por mês.",
            "Contratar um fornecedor cria um gasto no Orçamento com as parcelas. Elas aparecem em Próximos pagamentos, no Início e no Orçamento, e a categoria passa a contar como fechada no progresso.",
            "As famílias da lista A formam o custo por convidado, o progresso de respostas e várias conquistas. No Enxoval, um presente recebido pode ser ligado à família que deu, e aparece na ficha dela.",
            "As músicas marcadas como escolhidas aparecem no Cronograma do dia, para cada momento ter a sua trilha.",
          ],
        },
        {
          title: "Quem pode fazer o quê",
          text: [
            "Casal: pode tudo, inclusive chamar pessoas, mudar papéis e excluir o casamento.",
            "Assessoria: edita tudo, menos a equipe.",
            "Ajudante: edita tarefas, convidados, ideias, músicas, cortejo, cronograma e enxoval. Vê orçamento e fornecedores, sem mudar.",
            "Só leitura: vê tudo e não muda nada. Quem chama as pessoas é o casal, em Equipe, com um link de convite.",
          ],
        },
        {
          target: "ajuda",
          title: "Ajuda em cada tela",
          text: [
            "Cada aba tem um tour próprio, com o passo a passo dela. Ele abre sozinho na primeira visita.",
            "Para ver de novo, toquem neste ponto de interrogação. O tour geral também pode ser revisto em Ajustes.",
          ],
        },
      ],
      doneTitle: "Prontos para começar",
      doneText:
        "Comecem pelas próximas tarefas no Início. Ao abrir cada aba pela primeira vez, o tour dela explica os detalhes.",
    },
    inicio: {
      label: "Início",
      steps: [
        {
          target: "inicio-contagem",
          title: "Contagem até o sim",
          text: [
            "Quantos dias faltam e a data do casamento. Se vocês só sabem o mês, aparece previsto para, com o mês, e os prazos contam a partir do dia 1º.",
            "Sem data, aparece o botão para definir. A data e a frase de vocês mudam em Ajustes, Casamento. A frase aparece aqui, entre aspas.",
          ],
        },
        {
          target: "inicio-progresso",
          title: "Progresso geral",
          text: [
            "A porcentagem é a média de três partes: tarefas feitas, categorias do orçamento com valor fechado e famílias da lista A que já responderam a presença.",
            "Uma parte ainda sem dados, como uma lista de convidados vazia, fica de fora da média para não puxar o número para baixo.",
          ],
        },
        {
          target: "inicio-fase",
          title: "Fase atual",
          text: [
            "O planejamento é dividido em fases pelo tempo que falta: 12 meses ou mais, 9 a 12, 6 a 9, 3 a 6, 1 a 3 meses, últimas semanas, o grande dia e depois.",
            "O cartão mostra quantas tarefas desta fase estão feitas, avisa se ficou algo aberto de fases anteriores e quando começa a próxima. O link leva direto para essas tarefas.",
            "Ele só aparece quando o casamento tem data.",
          ],
        },
        {
          target: "inicio-foco",
          title: "Próximas tarefas",
          text: [
            "As três tarefas abertas com o prazo mais próximo, inclusive as atrasadas. Toquem no círculo para marcar como feita aqui mesmo.",
            "Tarefas sem prazo só aparecem quando não sobra nenhuma com data.",
          ],
        },
        {
          target: "inicio-pagamentos",
          title: "Próximos pagamentos",
          text: [
            "As três parcelas não pagas com vencimento mais próximo, de todos os gastos. Toquem em uma para abrir o gasto e marcar como paga.",
            "As parcelas nascem quando vocês contratam um fornecedor ou criam um gasto com parcelas no Orçamento.",
          ],
        },
        {
          target: "inicio-convidados",
          title: "Convidados",
          text: [
            "Quantas pessoas são esperadas e quantas confirmaram, contando só a lista A. A barra mostra, entre os convidados, quem disse sim e quem disse não.",
          ],
        },
        {
          target: "inicio-orcamento",
          title: "Orçamento",
          text: [
            "Quanto já está comprometido em gastos, comparado ao valor total do casamento. A barra fica vermelha se passar do total.",
            "Comprometido é o valor fechado de cada gasto ou, enquanto ele não fecha, a estimativa.",
          ],
        },
        {
          target: "inicio-conquistas",
          title: "Conquistas",
          text: [
            "Oito marcos do caminho: data marcada, primeiro fornecedor contratado, lista com 10 famílias, save the date enviado, metade do checklist, convites enviados, metade confirmou e tudo pago.",
            "Elas acontecem sozinhas, conforme vocês usam as outras abas. Cada marco novo ganha uma comemoração.",
          ],
        },
      ],
      doneTitle: "Esse é o Início",
      doneText:
        "Ele se atualiza com o que vocês fazem nas outras abas. Voltem sempre que quiserem saber o próximo passo.",
    },
    tarefas: {
      label: "Tarefas",
      steps: [
        {
          target: "tarefas-progresso",
          title: "Quanto já foi feito",
          text: [
            "Tarefas feitas sobre o total do checklist, inclusive as que vocês criaram.",
          ],
        },
        {
          target: "tarefas-filtros",
          title: "Filtros",
          text: [
            "A fazer mostra só o que está aberto. Minhas mostra o que foi atribuído a você, feito ou não. Todas mostra o checklist inteiro, com o que já foi concluído.",
          ],
        },
        {
          target: "tarefas-fase",
          title: "Fases",
          text: [
            "As tarefas ficam agrupadas pela fase do prazo, da mais distante até depois do casamento. O número ao lado mostra feitas sobre o total da fase.",
            "O cartão Fase atual, no Início, leva direto para a fase certa.",
          ],
        },
        {
          target: "tarefas-item",
          title: "Cada tarefa",
          text: [
            "Toquem no círculo para marcar como feita e no texto para abrir e editar.",
            "O selo mostra o prazo: Atrasada, Em breve (até 30 dias), No prazo ou Sem prazo. O selo Prazo importante marca regras legais, como a habilitação no cartório, que vale só 90 dias, e o curso de noivos. Abrindo a tarefa, a regra aparece explicada.",
          ],
        },
        {
          title: "Prazo relativo ou data fixa",
          text: [
            "Ao criar ou editar, escolham Antes do casamento, por exemplo 80 dias antes, ou uma Data fixa.",
            "Prazos relativos andam junto com a data do casamento: se ela mudar em Ajustes, todos se ajustam. Datas fixas ficam onde estão, bom para uma prova já marcada.",
          ],
        },
        {
          title: "Quem cuida e fornecedor",
          text: [
            "Cada tarefa pode ter um responsável da equipe ou o nome de outra pessoa, como a mãe ou a madrinha. Quem é da equipe encontra as suas no filtro Minhas.",
            "Também dá para ligar a tarefa a um fornecedor, para lembrar com quem tratar. Ao excluir uma tarefa, aparece Desfazer por alguns segundos.",
          ],
        },
        {
          target: "novo",
          title: "Nova tarefa",
          text: [
            "Criem tarefas próprias por aqui ou pelo botão de adicionar. O checklist sugerido é só o começo: editem ou excluam o que não fizer sentido para vocês.",
          ],
        },
      ],
      doneTitle: "Tarefas em dia",
      doneText:
        "Quando a data for confirmada, mudem em Ajustes, e todos os prazos se reorganizam sozinhos.",
    },
    orcamento: {
      label: "Orçamento",
      steps: [
        {
          target: "orcamento-resumo",
          title: "O resumo",
          text: [
            "O gráfico mostra como o dinheiro comprometido se divide entre as maiores categorias.",
            "Ao lado ficam o orçamento total, o que já foi pago, o que falta pagar, quanto ainda cabe, a reserva para imprevistos e o custo por convidado.",
            "Ainda cabe é o total, menos a reserva, menos o comprometido. O lápis leva a Ajustes para mudar o total e a reserva.",
          ],
        },
        {
          target: "orcamento-mensal",
          title: "Quanto guardar por mês",
          text: [
            "Divide o que falta pagar pelos meses até o casamento, contando o mês atual, arredondado para cima. Aparece quando há data e algo a pagar.",
          ],
        },
        {
          target: "orcamento-pagamentos",
          title: "Próximos pagamentos",
          text: [
            "As cinco parcelas abertas com vencimento mais próximo. Toquem em uma para abrir o gasto e marcar como paga.",
            "Dica do Procon: deixem uma parcela para depois da entrega do serviço.",
          ],
        },
        {
          target: "orcamento-categorias",
          title: "Categorias",
          text: [
            "Cada categoria tem um valor previsto, sugerido na criação do casamento a partir do total, com mais peso nas prioridades que vocês escolheram.",
            "A barra compara o comprometido com o previsto e avisa quando passou. Mudar o total depois não refaz o previsto de cada categoria: ajustem pelo lápis dentro dela.",
          ],
        },
        {
          target: "orcamento-categoria",
          title: "Dentro da categoria",
          text: [
            "Abrindo uma categoria, vocês veem previsto, comprometido, pago e todos os gastos dela, e podem criar um gasto já nela.",
            "Uma categoria só pode ser excluída quando não tem gastos.",
          ],
        },
        {
          title: "Estimativa, valor fechado e pago",
          text: [
            "Cada gasto tem uma estimativa, quanto vocês acham que vai custar, e um valor fechado, o preço combinado. O comprometido usa o valor fechado quando ele existe.",
            "Pago é a soma das parcelas marcadas como pagas. Uma categoria com algum valor fechado conta no progresso do Início.",
          ],
        },
        {
          title: "Parcelas",
          text: [
            "Ao criar um gasto, escolham quantas parcelas e o primeiro vencimento. As parcelas são mensais, e a primeira fica com os centavos que sobram da divisão.",
            "Dentro do gasto, cada parcela tem vencimento, forma de pagamento e observação. Um toque marca como paga, e ela sai dos próximos pagamentos.",
          ],
        },
        {
          target: "novo",
          title: "Novo gasto",
          text: [
            "Anotem gastos por aqui. Para fornecedores, prefiram o botão Contratar na ficha deles: ele cria o gasto, as parcelas e liga tudo ao fornecedor.",
            "Só o casal e a assessoria editam o orçamento. Ajudantes veem tudo, sem mudar.",
          ],
        },
      ],
      doneTitle: "Orçamento sob controle",
      doneText: "O valor total e a reserva ficam em Ajustes, Casamento.",
    },
    fornecedores: {
      label: "Fornecedores",
      steps: [
        {
          target: "vazio",
          title: "Comecem por aqui",
          text: [
            "Anotem cada fornecedor que estão pesquisando, mesmo antes de pedir orçamento. Depois dá para comparar e contratar.",
          ],
        },
        {
          target: "fornecedores-quadro",
          title: "O funil",
          text: [
            "Os fornecedores andam por etapas: Pesquisando, Orçado, Visita marcada, Favorito, Contratado e Descartado. Arrastem para o lado para ver todas as colunas.",
            "No computador dá para arrastar os cartões entre as colunas. No celular, usem o seletor Mover para, em cada cartão.",
          ],
        },
        {
          target: "fornecedores-card",
          title: "Cada fornecedor",
          text: [
            "O cartão mostra categoria, orçamento e nota. Toquem no nome para abrir a ficha com contato, WhatsApp, Instagram, site, capacidade, visita e o que inclui.",
            "Atenção: mover para Contratado só muda a etapa. Para o dinheiro ir ao Orçamento, usem Contratar na ficha.",
          ],
        },
        {
          target: "fornecedores-comparar",
          title: "Comparar lado a lado",
          text: [
            "Escolham uma categoria e vejam os orçamentos lado a lado. O menor preço ganha destaque, e o campo O que inclui vira uma lista para comparar item por item.",
            "Cada cartão tem o botão Contratar, que leva direto à ficha.",
          ],
        },
        {
          title: "Contratar",
          text: [
            "Na ficha, o painel Contratar pede o valor fechado, a categoria, o número de parcelas e o primeiro vencimento.",
            "Ao confirmar, o fornecedor vai para Contratado, nasce um gasto no Orçamento com as parcelas, os vencimentos entram em Próximos pagamentos e vocês ganham a conquista do primeiro fornecedor.",
            "Depois, a ficha mostra Ver no orçamento, que abre esse gasto.",
          ],
        },
        {
          target: "novo",
          title: "Novo fornecedor",
          text: [
            "Cadastrem nome, categoria, etapa e orçamento. Telefone com DDD vira botão de WhatsApp na ficha.",
            "Só o casal e a assessoria editam fornecedores.",
          ],
        },
      ],
      doneTitle: "Fornecedores organizados",
      doneText:
        "Excluir um fornecedor não apaga o gasto dele no orçamento, só desfaz a ligação.",
    },
    convidados: {
      label: "Convidados",
      steps: [
        {
          target: "vazio",
          title: "Comecem a lista",
          text: [
            "Adicionem uma família de cada vez ou colem uma lista inteira de nomes, copiada do bloco de notas, por exemplo. As famílias coladas vão para a triagem.",
          ],
        },
        {
          target: "convidados-triagem",
          title: "Triagem",
          text: [
            "As famílias em A decidir esperam aqui. Vocês veem uma por vez, respondem quatro perguntas rápidas e decidem: Lista A, Lista B ou Não convidar.",
            "Dá para arrastar o cartão para a direita (Lista A) ou para a esquerda (Não convidar), ou usar as teclas A, B e N no computador.",
          ],
        },
        {
          target: "convidados-funil",
          title: "Caminho até o sim",
          text: [
            "Quantas famílias da lista A estão na lista, receberam o save the date, receberam o convite e já responderam.",
            "Save the date e convite se marcam na ficha de cada família, e o dia fica registrado.",
          ],
        },
        {
          target: "convidados-numeros",
          title: "Os números",
          text: [
            "Esperados é a lista A menos quem disse que não vai. Também aparecem confirmados, quem não vai, a divisão por lado e por idade, útil porque o buffet costuma cobrar criança diferente.",
            "Os esperados viram o custo por convidado no Orçamento e o progresso do Início.",
          ],
        },
        {
          target: "convidados-colar",
          title: "Colar uma lista",
          text: [
            "Uma família por linha, com as pessoas separadas por vírgula ou pela palavra e. Vocês veem a prévia antes de adicionar, e tudo vai para a triagem.",
          ],
        },
        {
          target: "convidados-busca",
          title: "Busca",
          text: [
            "Procurem pelo nome da família ou de qualquer pessoa, com ou sem acento.",
          ],
        },
        {
          target: "convidados-filtros",
          title: "Listas",
          text: [
            "Lista A são os convidados certos, e é a única que entra nas contas. Sem resposta mostra famílias da lista A com alguém pendente. Lista B é a reserva, para chamar se sobrar lugar. Fora são os que vocês decidiram não chamar.",
            "Famílias em A decidir não aparecem aqui, só na triagem.",
          ],
        },
        {
          target: "convidados-familia",
          title: "Cada família",
          text: [
            "Mostra as pessoas e a presença de cada uma. O botão verde abre o WhatsApp com a mensagem certa para o momento: primeiro o save the date, depois o convite, depois o lembrete para confirmar.",
            "Na ficha da família vocês marcam a presença de cada pessoa, mandam mensagens, anotam presente e agradecimento e veem os itens do enxoval que ela deu.",
          ],
        },
        {
          target: "novo",
          title: "Nova família",
          text: [
            "Cada família tem nome, pessoas com idade e restrição alimentar, de quem é o convidado, a lista, WhatsApp e endereço. Acompanhante entra como pessoa extra.",
            "Ajudantes também podem cuidar dos convidados.",
          ],
        },
      ],
      doneTitle: "Lista pronta para crescer",
      doneText:
        "Para registrar presenças, abram a família e toquem em Vai ou Não vai para cada pessoa.",
    },
    mais: {
      label: "Mais",
      steps: [
        {
          target: "mais-lista",
          title: "O que não cabe na barra",
          text: [
            "Fornecedores: o funil, a comparação e a contratação. Ideias: o moodboard. Músicas: uma para cada momento.",
            "Cortejo: quem entra e em que ordem. Cronograma: o roteiro do dia. Enxoval: a casa nova.",
            "Equipe: quem planeja com vocês. Ajustes: o casamento e a conta. Cada uma tem o seu tour, que abre na primeira visita.",
          ],
        },
      ],
      doneTitle: "Explorem à vontade",
      doneText:
        "O ponto de interrogação no topo de cada tela reabre o tour dela.",
    },
    equipe: {
      label: "Equipe",
      steps: [
        {
          target: "equipe-membros",
          title: "Quem está no casamento",
          text: [
            "Todas as pessoas com acesso e o papel de cada uma. O casal pode mudar papéis ou remover alguém. O casamento precisa ter pelo menos uma pessoa do casal.",
          ],
        },
        {
          target: "equipe-convidar",
          title: "Chamar alguém",
          text: [
            "Escolham o papel e criem um link de convite. Mandem pelo WhatsApp ou copiem. O link vale por 14 dias e serve para uma pessoa só, então criem um para cada.",
            "Casal pode tudo. Assessoria edita tudo, menos a equipe. Ajudante edita tarefas, convidados, ideias, músicas, cortejo, cronograma e enxoval. Só leitura vê sem mudar.",
          ],
        },
        {
          target: "equipe-convites",
          title: "Convites ativos",
          text: [
            "Links ainda não usados, com a validade de cada um. Cancelem o link se mandaram para a pessoa errada.",
          ],
        },
        {
          title: "Todos no mesmo casamento",
          text: [
            "Cada pessoa da equipe vê os mesmos dados. O que uma marca aparece para as outras ao abrir ou atualizar a tela.",
            "Quem participa de mais de um casamento, como uma assessoria, troca entre eles em Ajustes, Casamento.",
          ],
        },
      ],
      doneTitle: "Planejem juntos",
      doneText: "Quem aceita o convite entra direto neste casamento.",
    },
    ideias: {
      label: "Ideias",
      steps: [
        {
          target: "vazio",
          title: "O moodboard",
          text: [
            "Guardem fotos e links do Pinterest ou do Instagram, separados por quadro: decoração, papelaria, bolo, vestido, fotos e outros.",
          ],
        },
        {
          target: "ideias-aprovadas",
          title: "Total aprovado",
          text: [
            "Soma a estimativa de custo das ideias aprovadas. É uma referência: esse valor não entra sozinho no orçamento. Quando decidirem, criem o gasto no Orçamento.",
          ],
        },
        {
          target: "ideias-quadros",
          title: "Quadros",
          text: [
            "Filtrem por quadro. O número mostra quantas ideias ativas cada um tem, sem contar as descartadas.",
          ],
        },
        {
          target: "ideias-grade",
          title: "As ideias",
          text: [
            "Cada cartão mostra foto, título e situação: Ideia, Aprovada com o valor, ou Descartada, que fica mais apagada. O botão de link abre a referência original.",
            "Toquem no cartão para editar, trocar a foto ou ligar a ideia a um fornecedor.",
          ],
        },
        {
          target: "novo",
          title: "Nova ideia",
          text: [
            "Adicionem uma foto do celular, que é reduzida e guardada só para o casamento de vocês, um link, o quadro, quanto deve custar e a situação.",
          ],
        },
      ],
      doneTitle: "Inspiração guardada",
      doneText:
        "Aprovem o que amarem e descartem o resto, sem precisar apagar.",
    },
    musicas: {
      label: "Músicas",
      steps: [
        {
          target: "musicas-progresso",
          title: "Momentos com música",
          text: [
            "Conta quantos dos 10 momentos da cerimônia já têm uma música escolhida.",
          ],
        },
        {
          target: "musicas-cerimonia",
          title: "Cerimônia",
          text: [
            "Um cartão para cada momento, da entrada dos padrinhos à saída de vocês. Cada momento pode ter várias opções, e a escolhida ganha a estrela.",
          ],
        },
        {
          target: "musicas-momento",
          title: "Cada momento",
          text: [
            "O botão de mais adiciona uma música, com artista e link do Spotify ou do YouTube. Sem link, aparece um atalho para buscar no Spotify.",
            "A estrela marca a escolhida. Na maioria dos momentos só uma fica escolhida. Na pista de dança e em Não tocar, vocês podem marcar várias.",
          ],
        },
        {
          target: "musicas-festa",
          title: "Festa",
          text: [
            "Os momentos da festa, como a primeira dança, a pista e a lista do que o DJ não deve tocar.",
          ],
        },
        {
          title: "Ligação com o Cronograma",
          text: [
            "As músicas escolhidas aparecem no Cronograma do dia, para ligar cada momento do roteiro à sua música. Excluir uma música tira a ligação do cronograma.",
          ],
        },
      ],
      doneTitle: "Trilha sonora a caminho",
      doneText: "Mandem os links das escolhidas para a banda ou o DJ.",
    },
    cortejo: {
      label: "Cortejo",
      steps: [
        {
          target: "vazio",
          title: "Quem entra com vocês",
          text: [
            "Adicionem padrinhos, madrinhas, pais, damas, pajens e quem leva as alianças.",
          ],
        },
        {
          target: "cortejo-convites",
          title: "Convite caixinha",
          text: [
            "Quantas pessoas já receberam o convite para ser padrinho ou madrinha. Cada uma tem a situação Convite a fazer, Encomendado ou Entregue.",
          ],
        },
        {
          target: "cortejo-corredor",
          title: "O corredor",
          text: [
            "A fila vai da entrada, embaixo, até o altar, no topo. Cada linha é uma dupla que entra junta, e o número mostra a ordem de entrada. Cada um fica do lado de quem convidou.",
            "Os cartões mostram papel, traje ou cor e a situação do convite. O lápis abre a edição.",
          ],
        },
        {
          target: "cortejo-mover",
          title: "Mudar a ordem",
          text: [
            "As setas sobem ou descem a dupla inteira na fila. Funcionam no toque e no teclado.",
          ],
        },
        {
          target: "novo",
          title: "Adicionar pessoa",
          text: [
            "Informem nome, papel, lado e com quem entra. Ao escolher o par, a ligação vale para os dois.",
          ],
        },
      ],
      doneTitle: "Cortejo montado",
      doneText:
        "O cortejo é separado da lista de convidados: quem for padrinho também precisa estar na família dele em Convidados.",
    },
    cronograma: {
      label: "Cronograma",
      steps: [
        {
          target: "vazio",
          title: "O roteiro do dia",
          text: [
            "Montem o dia hora a hora: dia da noiva, fotos, cerimônia, recepção e festa.",
          ],
        },
        {
          target: "cronograma-linha",
          title: "Linha do tempo",
          text: [
            "Os momentos ficam em ordem de horário, com local, quem cuida e a música ligada.",
            "Se um momento começa antes do anterior terminar, aparece Horário em conflito. No dia do casamento, o momento atual ganha a marca Agora.",
          ],
        },
        {
          target: "cronograma-whatsapp",
          title: "Compartilhar",
          text: [
            "Manda o roteiro inteiro em texto pelo WhatsApp, bom para assessoria, fornecedores e padrinhos.",
          ],
        },
        {
          target: "novo",
          title: "Adicionar momento",
          text: [
            "Informem início, fim, o que acontece, onde e quem cuida. O próximo momento já vem sugerido para começar no fim do anterior.",
            "O campo Música lista só as músicas marcadas como escolhidas na aba Músicas.",
          ],
        },
      ],
      doneTitle: "Dia planejado",
      doneText: "Revisem o cronograma com os fornecedores nas últimas semanas.",
    },
    enxoval: {
      label: "Enxoval",
      steps: [
        {
          target: "vazio",
          title: "Comecem pela lista sugerida",
          text: [
            "Usem a lista sugerida, com mais de cem itens separados por cômodo, ou colem a planilha que vocês já têm, do Google Sheets ou do Excel.",
          ],
        },
        {
          target: "enxoval-resumo",
          title: "Resumo",
          text: [
            "Quantos itens já estão resolvidos, comprados ou ganhos, quanto tudo deve custar, quanto falta comprar e quanto já gastaram.",
            "O selo avisa quantos itens marcados para a mudança ainda faltam. O dinheiro do enxoval é separado do orçamento do casamento.",
          ],
        },
        {
          target: "enxoval-comodos",
          title: "Cômodos",
          text: [
            "Filtrem por cômodo. O número mostra resolvidos sobre o total.",
          ],
        },
        {
          target: "enxoval-situacao",
          title: "Situação",
          text: [
            "Falta, Pedir de presente, Comprado ou Ganhamos. Combinem com o filtro de cômodo, por exemplo, para ver o que falta na cozinha.",
          ],
        },
        {
          target: "enxoval-item",
          title: "Cada item",
          text: [
            "Quantidade, prioridade, preço, loja e link. A estrela marca os itens para a mudança. O seletor muda a situação na hora.",
            "Quando a situação é Ganhamos, vocês podem dizer qual família deu. O presente aparece na ficha dela em Convidados, para lembrar do agradecimento.",
          ],
        },
        {
          target: "enxoval-colar",
          title: "Colar da planilha",
          text: [
            "Copiem as linhas da planilha e colem. Cômodo, quantidade, preço e se já compraram ou ganharam são reconhecidos. Itens com nome repetido são ignorados.",
          ],
        },
        {
          target: "novo",
          title: "Novo item",
          text: [
            "Adicionem um item com cômodo, quantidade, prioridade, situação, preço, loja e link.",
          ],
        },
      ],
      doneTitle: "Casa nova encaminhada",
      doneText:
        "Marquem Pedir de presente no que querem ganhar e usem como lista.",
    },
    ajustes: {
      label: "Ajustes",
      steps: [
        {
          target: "ajustes-casamento",
          title: "Casamento e equipe",
          text: [
            "Em Casamento ficam os nomes, a data, a cidade, a cerimônia, os convidados estimados, o valor total, a reserva e a frase de vocês. Equipe leva a quem planeja junto.",
          ],
        },
        {
          title: "O que cada ajuste muda",
          text: [
            "Data: muda a contagem, a fase atual, o prazo das tarefas relativas, quanto guardar por mês e as mensagens de WhatsApp. Se ainda é uma previsão, marquem a opção, e o app mostra só o mês.",
            "Valor total e reserva: mudam o Ainda cabe e a barra do Início. O previsto de cada categoria não é refeito.",
            "Convidados estimados: entram no custo por convidado enquanto a lista A está vazia. Frase: aparece no Início.",
            "Cerimônia: define as tarefas de igreja só na criação. Mudar depois não adiciona nem remove tarefas.",
          ],
        },
        {
          target: "ajustes-conta",
          title: "Conta e dados",
          text: [
            "Em Conta, troquem a senha, saiam de todos os aparelhos ou excluam a conta. Em Exportar dados, baixem convidados, tarefas, gastos e fornecedores em planilhas.",
            "Em Casamento também dá para trocar de casamento, criar outro, sair deste ou excluí-lo.",
          ],
        },
        {
          target: "ajustes-tours",
          title: "Rever os tours",
          text: [
            "Revejam o tour geral quando quiserem, ou façam os tours de cada aba aparecerem de novo.",
          ],
        },
      ],
      doneTitle: "Tudo ajustado",
      doneText: "Mudanças aqui valem para toda a equipe.",
    },
  },
  ceremonies: {
    civil: "Só no civil",
    religious: "Religioso com efeito civil",
    both: "Civil e religioso",
  },
  home: {
    title: "Início",
    couple: (a: string, b: string) => `${a} e ${b}`,
    daysLeft: (n: number) => (n === 1 ? "dia para o sim" : "dias para o sim"),
    today: "É hoje!",
    married: (n: number) =>
      n === 1
        ? "Casados há 1 dia"
        : `Casados há ${n.toLocaleString("pt-BR")} dias`,
    estimated: (month: string) => `previsto para ${month}`,
    noDate: "Sem data ainda",
    noDateHint:
      "Definam a data para ver a contagem e os prazos de cada tarefa.",
    setDate: "Definir a data",
    progress: "Preparativos",
    progressValue: (percent: number) => `${percent}% pronto`,
    progressParts:
      "Calculado com tarefas feitas, categorias do orçamento com valor fechado e famílias da lista A que responderam.",
    phase: "Fase atual",
    phaseTasks: (done: number, total: number) =>
      `${done} de ${plural(total, "tarefa feita", "tarefas feitas")}`,
    phaseEmpty: "Nenhuma tarefa nesta fase.",
    phaseBehind: (n: number) =>
      n === 1
        ? "1 tarefa de fases anteriores ainda aberta"
        : `${n} tarefas de fases anteriores ainda abertas`,
    phaseNext: (label: string, days: number) =>
      `Próxima: ${label.toLowerCase()}, ${
        days >= 60
          ? `em ${Math.round(days / 30)} meses`
          : days === 1
            ? "amanhã"
            : `em ${days} dias`
      }`,
    phaseMore: "Ver tarefas da fase",
    focus: "Próximas tarefas",
    focusEmpty: "Nada urgente. Aproveitem!",
    focusMore: "Ver todas as tarefas",
    payments: "Próximos pagamentos",
    paymentsEmpty: "Nenhum pagamento agendado.",
    paymentsMore: "Ver orçamento",
    guestsCard: "Convidados",
    guestsSummary: (expected: number, confirmed: number) =>
      `${plural(expected, "convidado", "convidados")}, ${plural(confirmed, "confirmado", "confirmados")}`,
    guestsMore: "Ver convidados",
    budgetCard: "Orçamento",
    budgetCommitted: (committed: string, budget: string) =>
      `${committed} comprometidos de ${budget}`,
    budgetNoTotal: (committed: string) => `${committed} comprometidos`,
    milestones: "Conquistas",
    milestoneReached: "Conquistada",
    milestonePending: "Ainda não",
  },
  milestones: {
    date: "Data marcada",
    firstVendor: "Primeiro fornecedor contratado",
    guestList: "Lista de convidados montada",
    saveTheDate: "Save the date enviado",
    halfChecklist: "Metade do checklist",
    invites: "Convites enviados",
    halfConfirmed: "Metade confirmou presença",
    allPaid: "Tudo pago",
    celebrate: (name: string) => `Conquista nova: ${name}`,
  },
  phases: {
    "12m": "12 meses ou mais antes",
    "9m": "9 a 12 meses antes",
    "6m": "6 a 9 meses antes",
    "3m": "3 a 6 meses antes",
    "1m": "1 a 3 meses antes",
    weeks: "Últimas semanas",
    day: "O grande dia",
    after: "Depois do casamento",
    undated: "Sem prazo",
  },
  tasks: {
    title: "Tarefas",
    newTask: "Nova tarefa",
    editTask: "Editar tarefa",
    taskTitle: "O que fazer",
    taskTitlePlaceholder: "Ex.: Marcar a degustação",
    notes: "Observações",
    area: "Área",
    due: "Prazo",
    dueHint: "Sem data, a tarefa segue a data do casamento.",
    dueRelative: "Antes do casamento",
    dueFixed: "Data fixa",
    daysBefore: "Dias antes do casamento",
    assignee: "Quem cuida",
    nobody: "Ninguém ainda",
    assigneeOther: "Outra pessoa",
    assigneeLabel: "Nome",
    assigneeLabelPlaceholder: "Ex.: Mãe da noiva",
    vendor: "Fornecedor",
    noVendor: "Nenhum",
    created: "Tarefa criada",
    saved: "Tarefa salva",
    deleted: "Tarefa excluída",
    restored: "Tarefa restaurada",
    titleRequired: "Escreva a tarefa",
    markDone: (title: string) => `Marcar como feita: ${title}`,
    markUndone: (title: string) => `Desmarcar: ${title}`,
    doneToast: "Feito!",
    progress: (done: number, total: number) => `${done} de ${total} feitas`,
    filters: "Mostrar",
    filterOpen: "A fazer",
    filterMine: "Minhas",
    filterAll: "Todas",
    states: {
      done: "Feita",
      overdue: "Atrasada",
      soon: "Em breve",
      later: "No prazo",
      undated: "Sem prazo",
    },
    dueOn: (date: string) => `Até ${date}`,
    emptyTitle: "Tudo em dia",
    emptyDescription: "Nenhuma tarefa por aqui. Criem uma ou mudem o filtro.",
    legal: "Prazo importante",
  },
  areas: {
    geral: "Geral",
    cerimonia: "Cerimônia",
    documentos: "Documentos",
    festa: "Festa",
    fornecedores: "Fornecedores",
    convidados: "Convidados",
    traje: "Traje",
    beleza: "Beleza",
    papelaria: "Papelaria",
    padrinhos: "Padrinhos",
    "lua-de-mel": "Lua de mel",
    depois: "Depois",
  },
  budget: {
    title: "Orçamento",
    total: "Orçamento total",
    noTotal: "Sem valor total",
    noTotalHint: "Definam um valor total para ver quanto ainda cabe.",
    committed: "Comprometido",
    contracted: "Contratado",
    paid: "Pago",
    toPay: "A pagar",
    remaining: "Ainda cabe",
    over: "Passou do orçamento",
    reserve: (percent: number) => `Reserva para imprevistos (${percent}%)`,
    perGuest: "Por convidado",
    perGuestHint: (n: number) =>
      `Considerando ${plural(n, "convidado", "convidados")}.`,
    saveMonthly: "Para pagar tudo até o casamento",
    saveMonthlyValue: (amount: string) => `${amount} por mês`,
    categories: "Categorias",
    category: "Categoria",
    categoryName: "Nome da categoria",
    icon: "Ícone",
    planned: "Previsto",
    plannedOf: (spent: string, planned: string) => `${spent} de ${planned}`,
    noPlanned: "Sem previsão",
    overPlanned: (amount: string) => `${amount} acima do previsto`,
    newCategory: "Nova categoria",
    editCategory: "Editar categoria",
    categoryCreated: "Categoria criada",
    categorySaved: "Categoria salva",
    categoryDeleted: "Categoria excluída",
    categoryInUse:
      "Mova ou exclua os gastos desta categoria antes de excluí-la.",
    expenses: "Gastos",
    newExpense: "Novo gasto",
    editExpense: "Editar gasto",
    expenseTitle: "Descrição",
    expenseTitlePlaceholder: "Ex.: Vestido, Buffet, Alianças",
    estimated: "Estimativa",
    estimatedHint: "Quanto vocês acham que vai custar.",
    contractedValue: "Valor fechado",
    contractedHint: "Preencham quando o preço estiver fechado.",
    expenseCreated: "Gasto criado",
    expenseSaved: "Gasto salvo",
    expenseDeleted: "Gasto excluído",
    noExpenses: "Nenhum gasto nesta categoria ainda.",
    payments: "Pagamentos",
    newPayment: "Adicionar pagamento",
    installments: "Parcelas",
    installmentsCount: "Quantas parcelas",
    firstDue: "Primeiro vencimento",
    installment: (n: number, total: number) => `Parcela ${n} de ${total}`,
    amount: "Valor",
    dueOn: "Vencimento",
    paidOn: "Pago em",
    method: "Forma de pagamento",
    note: "Observação",
    markPaid: (label: string) => `Marcar como pago: ${label}`,
    markUnpaid: (label: string) => `Desmarcar pagamento: ${label}`,
    paidToast: (amount: string) => `${amount} pago`,
    paymentSaved: "Pagamento salvo",
    paymentDeleted: "Pagamento excluído",
    states: {
      paid: "Pago",
      overdue: "Atrasado",
      soon: "Vence em breve",
      later: "Agendado",
    },
    dueLabel: (date: string) => `Vence ${date}`,
    paidLabel: (date: string) => `Pago ${date}`,
    procon:
      "Dica do Procon: deixem uma parcela para depois da entrega do serviço.",
    donutSummary: (name: string, percent: number) =>
      `Gráfico dos gastos por categoria. A maior é ${name}, com ${percent}% do comprometido.`,
    emptyTitle: "Nada no orçamento ainda",
    emptyDescription:
      "Anotem o primeiro gasto, mesmo que seja só uma estimativa.",
    settings: "Ajustes do orçamento",
    totalLabel: "Valor total do casamento",
    reserveLabel: "Reserva para imprevistos",
    reserveOption: (n: number) => `${n}%`,
  },
  methods: {
    pix: "Pix",
    boleto: "Boleto",
    card: "Cartão",
    cash: "Dinheiro",
    transfer: "Transferência",
  },
  vendors: {
    title: "Fornecedores",
    newVendor: "Novo fornecedor",
    editVendor: "Editar fornecedor",
    name: "Nome",
    namePlaceholder: "Ex.: Sítio das Flores",
    category: "Categoria",
    noCategory: "Sem categoria",
    status: "Etapa",
    contact: "Contato",
    contactName: "Pessoa de contato",
    phone: "Telefone ou WhatsApp",
    email: "E-mail",
    instagram: "Instagram",
    website: "Site",
    quote: "Orçamento",
    quoteDetails: "O que inclui",
    quoteDetailsPlaceholder: "Ex.: 6 horas, 2 fotógrafos, álbum",
    capacity: "Capacidade",
    capacityValue: (n: number) => plural(n, "pessoa", "pessoas"),
    rating: "Nota",
    ratingValue: (n: number) => `${n} de 5`,
    ratingOption: (n: number) => plural(n, "estrela", "estrelas"),
    noRating: "Sem nota",
    visitOn: "Visita ou degustação",
    notes: "Observações",
    created: "Fornecedor criado",
    saved: "Fornecedor salvo",
    deleted: "Fornecedor excluído",
    moved: (name: string, status: string) => `${name} foi para ${status}`,
    moveTo: "Mover para",
    moveMenu: (name: string) => `Mover ${name}`,
    compare: "Comparar",
    compareTitle: (category: string) => `Comparar ${category}`,
    compareHint: "Escolham uma categoria para ver os orçamentos lado a lado.",
    compareEmpty: "Ainda não há fornecedores nesta categoria.",
    cheapest: "Menor preço",
    hire: "Contratar",
    hireTitle: (name: string) => `Contratar ${name}`,
    hireHint: "O valor vai para o orçamento, com as parcelas.",
    hired: (name: string) => `${name} contratado`,
    hiredBadge: "Contratado",
    seeExpense: "Ver no orçamento",
    whatsapp: (name: string) => `Abrir WhatsApp de ${name}`,
    emptyTitle: "Nenhum fornecedor ainda",
    emptyDescription:
      "Anotem quem vocês estão pesquisando. Dá para comparar orçamentos depois.",
    columnEmpty: "Ninguém nesta etapa",
    count: (n: number) => plural(n, "fornecedor", "fornecedores"),
  },
  vendorStatus: {
    researching: "Pesquisando",
    quoted: "Orçado",
    visiting: "Visita marcada",
    favorite: "Favorito",
    hired: "Contratado",
    discarded: "Descartado",
  },
  guests: {
    title: "Convidados",
    newHousehold: "Nova família ou grupo",
    editHousehold: "Editar família",
    householdName: "Nome da família ou grupo",
    householdPlaceholder: "Ex.: Tia Rita e família",
    members: "Pessoas",
    memberName: (n: number) => `Nome da pessoa ${n}`,
    addMember: "Adicionar pessoa",
    addPlusOne: "Adicionar acompanhante",
    plusOne: "Acompanhante",
    removeMember: (name: string) => `Remover ${name}`,
    ageBand: "Idade",
    side: "De quem é",
    sideBoth: "Dos dois",
    sideOf: (name: string) => `De ${name}`,
    list: "Lista",
    phone: "WhatsApp",
    address: "Endereço",
    notes: "Observações",
    dietary: "Restrição alimentar",
    rsvp: "Presença",
    rsvpSaved: (name: string, answer: string) => `${name}: ${answer}`,
    created: "Família adicionada",
    saved: "Família salva",
    deleted: "Família excluída",
    bulkTitle: "Colar uma lista",
    bulkHint:
      "Uma família por linha. Separe as pessoas com vírgula ou com “e”. Ex.: Rita e Theo Souza",
    bulkLabel: "Lista de nomes",
    bulkPreview: (households: number, people: number) =>
      `${plural(households, "família", "famílias")}, ${plural(people, "pessoa", "pessoas")}`,
    bulkAdd: "Adicionar à triagem",
    bulkAdded: (n: number) => `${plural(n, "família", "famílias")} na triagem`,
    funnel: "Caminho até o sim",
    funnelListed: "Na lista A",
    funnelSaveTheDate: "Save the date",
    funnelInvited: "Convite",
    funnelAnswered: "Responderam",
    sides: "Divisão",
    expected: "Esperados",
    confirmed: "Confirmados",
    declined: "Não vão",
    pending: "Sem resposta",
    bands: "Por idade",
    search: "Buscar convidados",
    searchPlaceholder: "Nome da família ou da pessoa",
    filterAll: "Todos",
    filterPending: "Sem resposta",
    filterB: "Lista B",
    noResults: "Ninguém encontrado com esse filtro.",
    emptyTitle: "Nenhum convidado ainda",
    emptyDescription:
      "Adicionem uma família ou colem uma lista de nomes para fazer a triagem.",
    householdCount: (n: number) => plural(n, "família", "famílias"),
    peopleCount: (n: number) => plural(n, "pessoa", "pessoas"),
    markSaveTheDate: "Save the date enviado",
    markInvited: "Convite enviado",
    sentOn: (date: string) => `Enviado em ${date}`,
    gift: "Presente recebido",
    giftPlaceholder: "Ex.: Jogo de panelas",
    thanked: "Agradecimento enviado",
    whatsapp: "Mensagem no WhatsApp",
    whatsappSaveTheDate: "Save the date",
    whatsappInvite: "Convite",
    whatsappReminder: "Lembrar de confirmar",
    phoneInvalid: "Use DDD e número, como (81) 99999-9999",
    export: "Exportar lista",
  },
  lists: {
    pending: "A decidir",
    a: "Lista A",
    b: "Lista B",
    out: "Fora",
  },
  listHints: {
    pending: "Ainda na triagem",
    a: "Convidados certos",
    b: "Se sobrar lugar",
    out: "Não serão convidados",
  },
  ageBands: {
    adult: "Adulto",
    teen: "Adolescente",
    child: "Criança",
    baby: "Bebê",
  },
  ageBandsPlural: {
    adult: "Adultos",
    teen: "Adolescentes",
    child: "Crianças",
    baby: "Bebês",
  },
  rsvp: {
    pending: "Sem resposta",
    yes: "Vai",
    no: "Não vai",
  },
  triage: {
    title: "Triagem",
    intro: "Decidam juntos, uma família por vez.",
    questions: [
      "Comemorou as maiores conquistas de vocês?",
      "Falou com vocês nos últimos 6 meses?",
      "Vocês tomariam um café só com essa pessoa?",
      "É próxima de vocês dois?",
    ],
    progress: (current: number, total: number) => `${current} de ${total}`,
    toA: "Lista A",
    toB: "Lista B",
    toOut: "Não convidar",
    keys: "Atalhos: A para lista A, B para lista B, N para não convidar.",
    swipeHint:
      "Arraste para a direita para a lista A e para a esquerda para não convidar.",
    decided: (name: string, list: string) => `${name}: ${list}`,
    doneTitle: "Triagem concluída",
    doneDescription:
      "Todas as famílias têm uma decisão. Dá para mudar a qualquer momento.",
    start: (n: number) => `Fazer a triagem (${n})`,
    empty: "Nenhuma família esperando decisão.",
  },
  whatsapp: {
    saveTheDate: (couple: string, date: string | null) =>
      date
        ? `Oi! ${couple} vão se casar em ${date}. Reserve a data, o convite chega em breve!`
        : `Oi! ${couple} vão se casar. Em breve mandamos a data e o convite!`,
    invite: (couple: string, date: string | null) =>
      date
        ? `Oi! Vocês são nossos convidados para o casamento de ${couple}, em ${date}. Podem confirmar a presença por aqui?`
        : `Oi! Vocês são nossos convidados para o casamento de ${couple}. Podem confirmar a presença por aqui?`,
    reminder: (couple: string) =>
      `Oi! Passando para lembrar de confirmar a presença no casamento de ${couple}. Contamos com vocês?`,
  },
  ideas: {
    title: "Ideias",
    intro:
      "O moodboard de vocês. Salvem referências, aprovem o que amarem e vejam quanto custa.",
    newIdea: "Nova ideia",
    editIdea: "Editar ideia",
    ideaTitle: "Ideia",
    ideaTitlePlaceholder: "Ex.: Lírios em vaso longo de vidro",
    board: "Quadro",
    allBoards: "Todos",
    link: "Link da referência",
    linkPlaceholder: "https://",
    linkInvalid: "Use um link que comece com https://",
    notes: "Observações",
    estimate: "Quanto deve custar",
    status: "Situação",
    vendor: "Fornecedor",
    noVendor: "Nenhum",
    photo: "Foto",
    addPhoto: "Adicionar foto",
    changePhoto: "Trocar foto",
    removePhoto: "Remover foto",
    uploading: "Enviando foto…",
    photoFailed: "Não deu para enviar a foto. Tente uma imagem menor.",
    openLink: (title: string) => `Abrir referência: ${title}`,
    created: "Ideia salva",
    saved: "Ideia salva",
    deleted: "Ideia excluída",
    approvedTotal: (amount: string) => `${amount} em ideias aprovadas`,
    count: (n: number) => plural(n, "ideia", "ideias"),
    emptyTitle: "Nenhuma ideia ainda",
    emptyDescription:
      "Guardem fotos, links do Pinterest e tudo o que fizer o coração acelerar.",
  },
  boards: {
    decoracao: "Decoração",
    papelaria: "Papelaria",
    "bolo-doces": "Bolo e doces",
    traje: "Vestido e traje",
    fotos: "Fotos e vídeo",
    lembrancinhas: "Lembrancinhas",
    padrinhos: "Convite dos padrinhos",
    atividades: "Atividades",
    votos: "Votos",
    outros: "Outros",
  },
  ideaStatus: {
    idea: "Ideia",
    approved: "Aprovada",
    discarded: "Descartada",
  },
  music: {
    title: "Músicas",
    intro:
      "Uma música para cada momento. Marquem a escolhida e guardem as alternativas.",
    ceremony: "Cerimônia",
    party: "Festa",
    progress: (done: number, total: number) =>
      `${done} de ${total} momentos da cerimônia com música`,
    addSong: "Adicionar música",
    addTo: (moment: string) => `Adicionar música: ${moment}`,
    editSong: "Editar música",
    songTitle: "Música",
    songTitlePlaceholder: "Ex.: Can I Have This Dance",
    artist: "Artista",
    link: "Link do Spotify ou YouTube",
    moment: "Momento",
    chosen: "Escolhida",
    choose: (title: string) => `Escolher ${title}`,
    unchoose: (title: string) => `Desmarcar ${title}`,
    alternatives: (n: number) => plural(n, "alternativa", "alternativas"),
    listen: (title: string, where: string) => `Ouvir ${title} no ${where}`,
    search: "Buscar",
    searchOn: (where: string, title: string) => `Buscar ${title} no ${where}`,
    saved: "Música salva",
    deleted: "Música excluída",
    empty: "Nenhuma música ainda",
    doNotPlayHint: "Músicas que o DJ não deve tocar.",
  },
  moments: {
    "entrada-padrinhos": "Entrada dos padrinhos",
    "entrada-pais": "Entrada dos pais",
    "entrada-noivo": "Entrada de quem espera no altar",
    "entrada-floristas": "Entrada das floristas",
    "entrada-aliancas": "Entrada das alianças",
    "entrada-noiva": "A grande entrada",
    "louvor-cerimonia": "Louvor da cerimônia",
    votos: "Fundo dos votos",
    beijo: "O beijo",
    saida: "Saída do casal",
    "entrada-salao": "Entrada no salão",
    "primeira-danca": "Primeira dança",
    "louvor-ceia": "Louvor da ceia",
    buque: "Buquê",
    bolo: "Bolo",
    festa: "Pista de dança",
    "nao-tocar": "Não tocar",
  },
  party: {
    title: "Cortejo",
    intro: "Padrinhos, madrinhas e quem entra com vocês, na ordem até o altar.",
    newMember: "Adicionar pessoa",
    editMember: "Editar pessoa",
    name: "Nome",
    role: "Papel",
    side: "Lado",
    pair: "Entra junto com",
    noPair: "Sozinho",
    attire: "Traje ou cor",
    attirePlaceholder: "Ex.: vestido vinho, gravata lilás",
    invite: "Convite caixinha",
    phone: "WhatsApp",
    notes: "Observações",
    altar: "Altar",
    aisle: "Entrada",
    moveUp: (name: string) => `Subir ${name} na ordem de entrada`,
    moveDown: (name: string) => `Descer ${name} na ordem de entrada`,
    invitesDone: (done: number, total: number) =>
      `${done} de ${total} convites entregues`,
    saved: "Pessoa salva",
    deleted: "Pessoa removida",
    emptyTitle: "Ninguém no cortejo ainda",
    emptyDescription:
      "Adicionem padrinhos, madrinhas, damas e pajens e montem a ordem de entrada.",
    position: (n: number) => `${n}º`,
  },
  partyRoles: {
    padrinho: "Padrinho",
    madrinha: "Madrinha",
    dama: "Dama de honra",
    pajem: "Pajem",
    florista: "Florista",
    aliancas: "Leva as alianças",
    pais: "Pais",
    celebrante: "Celebrante",
    testemunha: "Testemunha",
    outro: "Outro papel",
  },
  partyInvite: {
    pending: "Convite a fazer",
    ordered: "Encomendado",
    delivered: "Entregue",
  },
  timeline: {
    title: "Cronograma",
    intro: "O roteiro do grande dia, com horário e quem cuida de cada momento.",
    newItem: "Adicionar momento",
    editItem: "Editar momento",
    startsAt: "Começa",
    endsAt: "Termina",
    itemTitle: "O que acontece",
    itemTitlePlaceholder: "Ex.: Fotos com os padrinhos",
    place: "Onde",
    responsible: "Quem cuida",
    song: "Música",
    noSong: "Nenhuma",
    notes: "Observações",
    clash: "Horário em conflito",
    now: "Agora",
    range: (start: string, end: string) => `${start} às ${end}`,
    saved: "Momento salvo",
    deleted: "Momento excluído",
    timeRequired: "Informe o horário",
    endBeforeStart: "O fim precisa ser depois do início",
    emptyTitle: "O dia ainda está em branco",
    emptyDescription:
      "Montem o roteiro: dia da noiva, cerimônia, fotos, entrada no salão, valsa, bolo.",
    share: "Compartilhar no WhatsApp",
    shareText: (
      couple: string,
      lines: string,
    ) => `Cronograma do casamento de ${couple}:
${lines}`,
  },
  enxoval: {
    title: "Enxoval",
    intro:
      "A casa nova de vocês, item por item. Marquem o que já têm, o que vão pedir de presente e o que falta comprar.",
    newItem: "Novo item",
    editItem: "Editar item",
    name: "Item",
    namePlaceholder: "Ex.: Jogo de panelas",
    room: "Cômodo",
    quantity: "Quantidade",
    priority: "Prioridade",
    status: "Situação",
    estimate: "Preço estimado de cada",
    paid: "Quanto pagamos no total",
    store: "Loja",
    link: "Link do produto",
    giftFrom: "Quem deu",
    noGift: "Ninguém",
    notes: "Observações",
    saved: "Item salvo",
    deleted: "Item excluído",
    progress: (done: number, total: number) => `${done} de ${total} itens`,
    estimateTotal: "Estimado",
    remaining: "Falta comprar",
    spent: "Gasto",
    essentialsMissing: (n: number) =>
      n === 1
        ? "Falta 1 item para a mudança"
        : `Faltam ${n.toLocaleString("pt-BR")} itens para a mudança`,
    allRooms: "Tudo",
    statusFilter: "Mostrar",
    allStatus: "Todos",
    markAs: (name: string) => `Situação de ${name}`,
    marked: (name: string, status: string) => `${name}: ${status}`,
    quantityValue: (n: number) => `${n}x`,
    each: (amount: string) => `${amount} cada`,
    emptyTitle: "O enxoval ainda está vazio",
    emptyDescription:
      "Comecem pela lista sugerida ou colem a planilha que vocês já têm.",
    starter: "Usar a lista sugerida",
    starterHint:
      "Itens que quase toda casa precisa, separados por cômodo. Depois é só apagar o que não fizer sentido.",
    starterAdded: (n: number) =>
      `${n.toLocaleString("pt-BR")} itens adicionados`,
    import: "Colar da planilha",
    importHint:
      "Copiem as linhas do Google Sheets ou do Excel e colem aqui. Entendemos nome, quantidade, preço, cômodo e se já foi comprado.",
    importLabel: "Linhas da planilha",
    importPreview: (n: number) =>
      n === 1
        ? "1 item encontrado"
        : `${n.toLocaleString("pt-BR")} itens encontrados`,
    importAdd: "Adicionar ao enxoval",
    giftsFromHousehold: "Presentes do enxoval",
    roomProgress: (done: number, total: number) => `${done}/${total}`,
  },
  rooms: {
    cozinha: "Cozinha",
    mesa: "Mesa posta",
    banheiro: "Banheiro",
    quarto: "Quarto",
    sala: "Sala",
    lavanderia: "Lavanderia e limpeza",
    eletro: "Eletros",
    moveis: "Móveis",
    organizacao: "Organização",
    ferramentas: "Ferramentas",
    outros: "Outros",
  },
  homeStatus: {
    missing: "Falta",
    wishlist: "Pedir de presente",
    bought: "Comprado",
    gifted: "Ganhamos",
  },
  homePriority: {
    essential: "Para a mudança",
    important: "Primeiras semanas",
    nice: "Pode esperar",
  },
  team: {
    title: "Equipe",
    hint: "Convidem quem planeja com vocês",
    intro:
      "Quem planeja com vocês. Cada pessoa vê o mesmo casamento, em tempo real.",
    you: "Você",
    invite: "Convidar alguém",
    inviteRole: "Papel",
    createLink: "Criar link de convite",
    creatingLink: "Criando…",
    linkReady:
      "Link pronto. Ele vale por 14 dias e pode ser usado por uma pessoa.",
    copy: "Copiar link",
    copied: "Link copiado",
    sendWhatsapp: "Enviar pelo WhatsApp",
    inviteMessage: (couple: string, url: string) =>
      `Vem planejar o casamento de ${couple} comigo no Dois em Um: ${url}`,
    changeRole: (name: string) => `Papel de ${name}`,
    roleChanged: "Papel alterado",
    remove: (name: string) => `Remover ${name}`,
    removed: "Pessoa removida",
    leave: "Sair deste casamento",
    leaveHint:
      "Você perde o acesso. Se for a última pessoa do casal, o casamento é excluído.",
    leaveConfirm: "Entendo e quero sair.",
    left: "Você saiu do casamento",
    pendingInvites: "Convites ativos",
    expires: (date: string) => `Vale até ${date}`,
    revoke: "Cancelar convite",
    revoked: "Convite cancelado",
    unnamed: "Pessoa sem nome",
    lastCouple: "O casamento precisa de pelo menos uma pessoa do casal.",
  },
  invite: {
    title: "Convite",
    heading: (couple: string) => `Planejar o casamento de ${couple}`,
    as: (role: string) => `Você vai entrar como ${role.toLowerCase()}.`,
    accept: "Entrar no casamento",
    accepting: "Entrando…",
    already: "Você já faz parte deste casamento.",
    open: "Abrir o casamento",
    invalidTitle: "Convite inválido",
    invalidDescription:
      "Este link expirou, foi cancelado ou já foi usado por outra pessoa. Peça um novo para o casal.",
  },
  wedding: {
    title: "Casamento",
    hint: "Nomes, data, cidade e cerimônia",
    partnerA: "Primeiro nome",
    partnerB: "Segundo nome",
    partnerPlaceholder: "Ex.: Ana",
    date: "Data do casamento",
    noDate: "Ainda não sabemos",
    dateIsEstimate: "Ainda é uma previsão, o dia pode mudar",
    city: "Cidade",
    cityPlaceholder: "Ex.: Recife",
    ceremony: "Cerimônia",
    guestEstimate: "Quantos convidados, mais ou menos",
    budget: "Quanto querem gastar, mais ou menos",
    motto: "Frase de vocês",
    mottoPlaceholder: "Ex.: um versículo, uma música, uma promessa",
    mottoHint: "Aparece no Início.",
    saved: "Casamento salvo",
    switch: "Trocar de casamento",
    switchHint: "Vocês participam de mais de um casamento.",
    current: "Atual",
    createAnother: "Criar outro casamento",
    delete: "Excluir casamento",
    deleteHint:
      "Apaga tarefas, orçamento, fornecedores e convidados para todo mundo da equipe. Não dá para desfazer.",
    deleteConfirm: "Entendo que isso apaga tudo e não pode ser desfeito.",
    deleted: "Casamento excluído",
    partnerRequired: "Escreva os dois nomes",
  },
  onboarding: {
    step: (current: number, total: number) => `Passo ${current} de ${total}`,
    back: "Voltar",
    next: "Continuar",
    skip: "Pular",
    personaLegend: "Você é",
    personas: {
      couple: "Quem vai casar",
      planner: "Assessoria ou cerimonial",
      family: "Família ou amigo",
    },
    namesQuestion: "Quem vai casar?",
    namesHint:
      "Os nomes aparecem no Início e nas mensagens para os convidados.",
    dateQuestion: "Quando é o grande dia?",
    dateHint: "Com a data, cada tarefa ganha um prazo. Dá para mudar depois.",
    dateModeLegend: "Já tem data?",
    dateModes: {
      exact: "Já temos o dia",
      month: "Só o mês",
      unknown: "Ainda não",
    },
    month: "Mês previsto",
    monthHint:
      "Os prazos contam a partir do dia 1º. Quando fecharem o dia, é só trocar nos ajustes.",
    unknownHint:
      "Sem problema. As tarefas ficam sem prazo até vocês escolherem a data.",
    ceremonyQuestion: "Como vai ser a cerimônia?",
    ceremonyHint:
      "Ajustamos o checklist com os prazos do cartório e da igreja.",
    sizeQuestion: "Pensando no tamanho",
    sizeHint:
      "Valores aproximados ajudam a montar o orçamento por categoria. Tudo é opcional.",
    guestPreset: (n: number) =>
      n <= 50 ? `Até ${n}` : n >= 300 ? `${n} ou mais` : `Uns ${n}`,
    otherGuests: "Ou digite o número",
    budgetPreset: (cents: number, last: boolean) => {
      const value = `R$ ${(cents / 100_000).toLocaleString("pt-BR")} mil`;
      return cents <= 3_000_000
        ? `Até ${value}`
        : last
          ? `${value} ou mais`
          : `Uns ${value}`;
    },
    otherBudget: "Ou digite o valor",
    bookedQuestion: "O que vocês já garantiram?",
    bookedHint:
      "Marcamos essas tarefas como feitas. Se ainda não fecharam nada, é só seguir.",
    bookedLegend: "Já garantido",
    bookings: {
      espaco: "Espaço da festa",
      cerimonia: "Igreja ou local da cerimônia",
      assessoria: "Assessoria",
      buffet: "Buffet",
      fotos: "Foto e vídeo",
      musica: "Banda ou DJ",
      decoracao: "Decoração e flores",
      doces: "Bolo e doces",
      traje: "Vestido ou traje",
      aliancas: "Alianças",
      beleza: "Cabelo e maquiagem",
      "lua-de-mel": "Lua de mel",
    },
    prioritiesQuestion: "O que não pode faltar?",
    prioritiesHint:
      "Damos mais espaço a isso no orçamento sugerido. Dá para ajustar tudo depois.",
    prioritiesLegend: (n: number) => `Escolham até 3. ${n} de 3`,
    priorities: {
      espaco: "Um lugar lindo",
      comida: "Comida e bebida",
      fotos: "Fotos e vídeo",
      decoracao: "Decoração",
      musica: "Festa e música",
      traje: "Vestido e traje",
      doces: "Bolo e doces",
      "lua-de-mel": "Lua de mel",
    },
    finish: "Criar nosso casamento",
    finishing: "Preparando tudo…",
    inviteQuestion: (name: string) => `Agora chame ${name}`,
    inviteCoupleQuestion: "Agora chame o casal",
    inviteHint:
      "Com o link, vocês planejam juntos e veem tudo em tempo real. Ele vale por 14 dias e serve para uma pessoa.",
    inviteCoupleHint:
      "Cada link serve para uma pessoa. Depois vocês criam outros em Equipe.",
    partnerMessage: (name: string, url: string) =>
      `${name}, criei o nosso casamento no Dois em Um. Entra aqui para a gente planejar junto: ${url}`,
    coupleMessage: (url: string) =>
      `Criei o planejamento do casamento de vocês no Dois em Um. Entrem por aqui: ${url}`,
    inviteLater: "Depois eu chamo",
    inviteFailed:
      "Não deu para criar o link agora. Dá para convidar depois em Equipe.",
    ready: "Tudo pronto!",
    readyHint: (tasks: number, done: number) =>
      done > 0
        ? `Montamos um checklist com ${tasks} tarefas, ${done} já feitas, e o orçamento por categoria. Agora é com vocês.`
        : `Montamos um checklist com ${tasks} tarefas e o orçamento por categoria. Agora é com vocês.`,
    heardLegend: "Uma última, se quiser: como conheceu o Dois em Um?",
    heard: {
      instagram: "Instagram",
      tiktok: "TikTok",
      google: "Google",
      friends: "Indicação",
      vendor: "Fornecedor ou assessoria",
      other: "Outro jeito",
    },
    haveInvite: "Recebeu um convite? Abra o link que mandaram para você.",
  },
  auth: {
    title: "Entrar",
    tagline: "Planejem juntos, do sim à casa nova.",
    points: [
      "Checklist com os prazos do cartório e da igreja.",
      "Orçamento com parcelas e vencimentos.",
      "Convidados por família, com WhatsApp a um toque.",
    ],
    signUpTitle: "Criar conta",
    email: "E-mail",
    password: "Senha",
    passwordHint:
      "Pelo menos 8 caracteres. Uma frase que só você sabe é fácil de lembrar e difícil de adivinhar.",
    showPassword: "Mostrar senha",
    signIn: "Entrar",
    signingIn: "Entrando…",
    noAccount: "Ainda não tem conta?",
    hasAccount: "Já tem conta?",
    forgot: "Esqueci a senha",
    forgotHelp: (email: string) =>
      `Escreva para ${email} a partir do e-mail da sua conta. Respondemos para esse mesmo e-mail com uma senha provisória, que você troca em Ajustes, Conta.`,
    errors: {
      emailInvalid: "Digite um e-mail válido, como nome@exemplo.com.",
      passwordRequired: "Digite sua senha.",
      passwordShort: "Use pelo menos 8 caracteres.",
      passwordLong: "Use no máximo 72 caracteres.",
      invalidCredentials: "E-mail ou senha incorretos.",
      exists: "Já existe uma conta com esse e-mail. Entre com ela.",
      rateLimit:
        "Muitas tentativas seguidas. Espere alguns minutos e tente de novo.",
      failed: "Não deu para continuar agora. Tente de novo.",
    },
    legal: {
      start: "Ao continuar, você confirma ter 18 anos ou mais e aceita os ",
      terms: "Termos de Uso",
      middle:
        ". Para o app funcionar, usamos seu e-mail e o que vocês registrarem, como explica a ",
      privacy: "Política de Privacidade",
      end: ".",
    },
    cookies: "Usamos só cookies essenciais, para manter você conectado.",
    deleted: "Sua conta foi excluída e seus dados foram apagados.",
    dev: "Entrar como pessoa de teste",
  },
  signup: {
    step: (current: number, total: number) => `Passo ${current} de ${total}`,
    back: "Voltar",
    next: "Continuar",
    nameQuestion: "Oi! Como podemos te chamar?",
    nameLabel: "Seu nome",
    nameRequired: "Digite como quer ser chamado.",
    emailQuestion: (name: string) => `Prazer, ${name}. Qual é o seu e-mail?`,
    emailHint: "É com ele que você entra. Nada de propaganda.",
    emailMissingAt: "Falta o @ no e-mail?",
    passwordQuestion: "Agora crie uma senha",
    passwordRule: "Pelo menos 8 caracteres",
    create: "Criar conta grátis",
    creating: "Criando sua conta…",
    emailTaken: "Já existe uma conta com esse e-mail.",
    signInWith: "Entrar com ele",
    confirmTitle: "Falta um passo: confirme seu e-mail",
    confirmText: (email: string) =>
      `Enviamos um link para ${email}. Abra o e-mail e toque no link para entrar.`,
  },
  account: {
    title: "Conta",
    hint: "Seus dados, sair e excluir conta",
    signedInAs: "Conectado como",
    signOut: "Sair",
    signOutEverywhere: "Sair de todos os aparelhos",
    signOutEverywhereFailed:
      "Não deu para sair dos outros aparelhos. Tente de novo.",
    signOutEverywhereHint:
      "Encerra o acesso em todos os aparelhos. Nos outros, a saída pode levar até 15 minutos.",
    changePassword: "Alterar senha",
    changePasswordHint: "Troque a senha de entrada",
    changePasswordIntro:
      "Depois da troca, os outros aparelhos são desconectados e precisam entrar com a nova senha.",
    currentPassword: "Senha atual",
    newPassword: "Nova senha",
    wrongCurrentPassword: "A senha atual está incorreta.",
    samePassword: "A nova senha precisa ser diferente da atual.",
    passwordChanged: "Senha alterada. Os outros aparelhos foram desconectados.",
    yourData: "Seus dados",
    export: "Exportar dados",
    exportHint: "Baixe tudo do casamento em planilhas CSV",
    terms: "Termos de Uso",
    privacy: "Política de Privacidade",
    delete: "Excluir conta",
    deleteIntro:
      "Isso apaga sua conta. Casamentos em que você é a última pessoa do casal são apagados junto, para toda a equipe. Não dá para desfazer.",
    deleteWhat: "O que é apagado",
    deleteItems: [
      "Seu e-mail, seu nome e sua senha",
      "Seu acesso a todos os casamentos",
      "Casamentos sem outra pessoa do casal, com tudo o que foi registrado neles",
    ],
    deleteBackup:
      "As cópias de segurança guardam os dados por até 14 dias e depois são apagadas.",
    deleteExportFirst: "Exportar os dados antes",
    deleteConfirm: "Entendo que isso apaga tudo e não pode ser desfeito.",
    confirmRequired: "Marque a confirmação para excluir a conta.",
    deleting: "Excluindo…",
  },
  settings: {
    title: "Ajustes",
  },
  exportData: {
    title: "Exportar dados",
    intro:
      "Baixe os dados do casamento em planilhas CSV. Elas abrem no Excel, no Numbers e no Google Planilhas.",
    files: {
      guests: "Convidados",
      tasks: "Tarefas",
      expenses: "Gastos e pagamentos",
      vendors: "Fornecedores",
    },
    fileNames: {
      guests: "convidados",
      tasks: "tarefas",
      expenses: "gastos",
      vendors: "fornecedores",
    },
    downloadShort: "Baixar",
    download: (title: string) => `Baixar ${title}`,
    preparing: "Preparando…",
    done: (title: string, rows: number) =>
      `${title}: ${new Intl.NumberFormat("pt-BR").format(rows)} ${rows === 1 ? "linha baixada" : "linhas baixadas"}`,
    failed: "Não deu para exportar. Tente de novo.",
    columns: {
      household: "Família",
      name: "Nome",
      side: "De quem é",
      list: "Lista",
      age: "Idade",
      rsvp: "Presença",
      plusOne: "Acompanhante",
      dietary: "Restrição alimentar",
      phone: "Telefone",
      address: "Endereço",
      saveTheDate: "Save the date",
      invited: "Convite",
      gift: "Presente",
      thanked: "Agradecimento",
      title: "Tarefa",
      area: "Área",
      due: "Prazo",
      assignee: "Quem cuida",
      done: "Feita em",
      notes: "Observações",
      category: "Categoria",
      expense: "Gasto",
      vendor: "Fornecedor",
      estimated: "Estimativa",
      contracted: "Valor fechado",
      amount: "Valor da parcela",
      dueOn: "Vencimento",
      paidOn: "Pago em",
      method: "Forma de pagamento",
      status: "Etapa",
      contact: "Contato",
      email: "E-mail",
      instagram: "Instagram",
      website: "Site",
      quote: "Orçamento",
      quoteDetails: "O que inclui",
      rating: "Nota",
      yes: "Sim",
    },
  },
  errors: {
    title: "Algo deu errado",
    description:
      "Não foi possível carregar esta tela. Confira sua conexão e tente de novo.",
    retry: "Tentar de novo",
    notFoundTitle: "Página não encontrada",
    notFoundDescription: "O endereço pode estar errado ou o item foi excluído.",
    home: "Ir para o Início",
  },
  icons: {
    building: "Espaço",
    utensils: "Buffet",
    wine: "Bebidas",
    camera: "Foto",
    video: "Vídeo",
    flower: "Flores",
    sparkles: "Decoração",
    music: "Música",
    mic: "Cerimonial",
    shirt: "Traje",
    brush: "Beleza",
    cake: "Bolo",
    gem: "Alianças",
    mail: "Papelaria",
    church: "Cerimônia",
    landmark: "Cartório",
    car: "Transporte",
    plane: "Viagem",
    hotel: "Hospedagem",
    gift: "Presentes",
    heart: "Outros",
    shield: "Reserva",
  },
} as const;

type LegalBlock =
  | { kind: "p"; text: string }
  | { kind: "ul"; items: readonly string[] };

export type LegalDocument = {
  title: string;
  intro: string;
  sections: readonly { heading: string; blocks: readonly LegalBlock[] }[];
};

export const legal: {
  controller: { name: string; email: string };
  version: string;
  effectiveDate: string;
  backupDays: number;
  back: string;
  important: string;
  terms: LegalDocument;
  privacy: LegalDocument;
} = {
  controller: { name: "Gabriel Rocha", email: "gabrielrsilva203@gmail.com" },
  version: "1.0",
  effectiveDate: "2026-10-09",
  backupDays: 14,
  back: "Voltar",
  important: "Importante: ",
  terms: {
    title: "Termos de Uso",
    intro:
      "Estes termos são as regras para usar o app, e você os aceita ao criar sua conta. Versão {versao}, em vigor desde {data}.",
    sections: [
      {
        heading: "Quem oferece o app",
        blocks: [
          {
            kind: "p",
            text: "Quem oferece o app é {nome}, uma pessoa física que desenvolve e mantém o serviço.",
          },
          {
            kind: "p",
            text: "Para falar sobre estes termos ou sobre qualquer outro assunto, escreva para {email}.",
          },
        ],
      },
      {
        heading: "O que o app faz",
        blocks: [
          {
            kind: "p",
            text: "O app ajuda casais e quem os ajuda a planejar um casamento: tarefas com prazos, orçamento com parcelas, fornecedores e lista de convidados. Ele é gratuito e não tem anúncios.",
          },
          {
            kind: "p",
            text: "O app não é um banco nem uma agência. Ele não movimenta dinheiro, não contrata fornecedores e não envia mensagens em nome de vocês. Os botões de WhatsApp só abrem o seu próprio aplicativo com um texto pronto.",
          },
          {
            kind: "p",
            text: "Importante: prazos de cartório, igreja e curso de noivos são orientações gerais. As regras mudam de lugar para lugar, então confirmem sempre com o cartório e a paróquia de vocês.",
          },
        ],
      },
      {
        heading: "Quem pode usar",
        blocks: [
          {
            kind: "p",
            text: "Para usar o app, você precisa ter 18 anos ou mais e criar uma conta com e-mail e senha. Ao criar a conta, você confirma que tem pelo menos 18 anos.",
          },
          {
            kind: "p",
            text: "Uma pessoa do casal cria o casamento e pode convidar a outra pessoa, a assessoria ou familiares, com papéis diferentes. Cada pessoa usa a própria conta.",
          },
        ],
      },
      {
        heading: "Dados de convidados e fornecedores",
        blocks: [
          {
            kind: "p",
            text: "Ao registrar convidados e fornecedores, vocês colocam no app dados de outras pessoas, como nome, telefone e endereço. Para esses dados, o casal é o responsável, e o app só guarda e organiza o que vocês registram.",
          },
          {
            kind: "p",
            text: "Registrem só o necessário para o casamento. Restrições alimentares podem revelar informações de saúde ou religião, então anotem só o que o buffet precisa saber.",
          },
          {
            kind: "p",
            text: "Se um convidado pedir para ver, corrigir ou apagar os próprios dados, vocês conseguem fazer isso no app. Se precisarem de ajuda, escrevam para {email}.",
          },
        ],
      },
      {
        heading: "Responsabilidades",
        blocks: [
          {
            kind: "p",
            text: "Cada pessoa responde pelo que registra e pelo uso da própria conta. Quem é do casal decide quem entra na equipe e pode remover pessoas a qualquer momento.",
          },
          {
            kind: "p",
            text: "Sua senha é a chave do app. Use uma senha que você não usa em outros sites e não a compartilhe. Se suspeitar de acesso indevido, troque a senha em Ajustes, Conta.",
          },
          {
            kind: "p",
            text: "Nós respondemos pelos danos que o serviço causar, como manda a lei, inclusive o Código de Defesa do Consumidor. Nada nestes termos tira ou reduz os seus direitos.",
          },
        ],
      },
      {
        heading: "Regras e limites de uso",
        blocks: [
          {
            kind: "p",
            text: "Para manter o app seguro para todos, você não pode tentar acessar casamentos de outras pessoas, usar robôs para sobrecarregar o serviço, burlar o login ou usar o app para fraude ou spam.",
          },
          {
            kind: "p",
            text: "Importante: cada casamento tem limites para manter o serviço gratuito e estável. Ao chegar a um limite, o app não deixa criar novos itens daquele tipo.",
          },
          {
            kind: "ul",
            items: [
              "4.000 convidados em 1.500 famílias",
              "600 tarefas",
              "500 fornecedores e 500 gastos, com 3.000 pagamentos",
              "20 pessoas na equipe",
              "5 casamentos criados por pessoa",
            ],
          },
        ],
      },
      {
        heading: "Disponibilidade e cópias de segurança",
        blocks: [
          {
            kind: "p",
            text: "Importante: o app pode ficar fora do ar às vezes, por manutenção ou por falha. Trabalhamos para que isso seja raro e dure pouco.",
          },
          {
            kind: "p",
            text: "Fazemos uma cópia de segurança criptografada todos os dias. Se houver uma falha grave, recuperamos os dados a partir da cópia mais recente. Recomendamos usar “Exportar dados” de vez em quando.",
          },
        ],
      },
      {
        heading: "Encerramento",
        blocks: [
          {
            kind: "p",
            text: "Você pode excluir sua conta quando quiser, em Ajustes, Conta. Casamentos em que você é a última pessoa do casal são apagados junto, para toda a equipe.",
          },
          {
            kind: "p",
            text: "Se você descumprir as regras de uso, podemos suspender sua conta, avisando antes por e-mail com o motivo, salvo risco imediato ao serviço ou a outras pessoas.",
          },
          {
            kind: "p",
            text: "Se o app for encerrado, avisaremos com pelo menos 30 dias de antecedência, para vocês exportarem os dados.",
          },
        ],
      },
      {
        heading: "Mudanças, lei e foro",
        blocks: [
          {
            kind: "p",
            text: "Antes de uma mudança nestes termos valer, mostramos um aviso em destaque no app. Se não concordar, você pode exportar os dados e excluir sua conta, sem custo.",
          },
          {
            kind: "p",
            text: "Estes termos seguem as leis do Brasil. Uma disputa será resolvida no foro da cidade onde você mora. Antes, se preferir, escreva para {email}.",
          },
        ],
      },
    ],
  },
  privacy: {
    title: "Política de Privacidade",
    intro:
      "Esta política explica quais dados o app usa, para quê e como vocês controlam tudo. Versão {versao}, em vigor desde {data}.",
    sections: [
      {
        heading: "Em resumo",
        blocks: [
          {
            kind: "ul",
            items: [
              "Usamos seu e-mail, sua senha protegida e o que vocês registram no casamento.",
              "Não vendemos dados, não mostramos anúncios e não repassamos contatos a fornecedores.",
              "A cópia principal dos dados fica em São Paulo. Uma cópia de segurança criptografada e alguns registros técnicos ficam nos Estados Unidos.",
              "No próprio app, vocês podem exportar, corrigir e apagar os dados quando quiserem.",
              "Dúvidas ou pedidos: {email}.",
            ],
          },
        ],
      },
      {
        heading: "Quem cuida dos dados",
        blocks: [
          {
            kind: "p",
            text: "Para os dados da sua conta, o responsável é {nome}, pessoa física que desenvolve e mantém o app. A Lei Geral de Proteção de Dados Pessoais (LGPD) chama esse papel de controlador.",
          },
          {
            kind: "p",
            text: "Para os dados de convidados e fornecedores que vocês registram, o casal é o controlador, e o app atua como operador: guarda e organiza esses dados em nome de vocês, só para o planejamento do casamento.",
          },
          {
            kind: "p",
            text: "Como agente de pequeno porte, não há encarregado de dados. Há um canal de privacidade para falar direto com o responsável: {email}.",
          },
        ],
      },
      {
        heading: "Dados que usamos",
        blocks: [
          {
            kind: "ul",
            items: [
              "Da sua conta: nome, e-mail e senha. A senha fica guardada só de forma protegida, num formato que não permite descobrir a senha original.",
              "Do casamento: nomes do casal, data, cidade, tipo de cerimônia, estimativas, tarefas, orçamento, gastos e pagamentos.",
              "De fornecedores: nome, contato, orçamento e observações que vocês anotarem.",
              "De convidados: nome, faixa de idade, lado do casal, telefone, endereço, presença, restrição alimentar e presentes, se vocês anotarem.",
              "Da equipe: quem participa de cada casamento e com qual papel.",
              "Dados técnicos: endereço IP, navegador e horário de acesso, nas sessões de login e nos registros técnicos do Supabase e da Vercel.",
            ],
          },
          {
            kind: "p",
            text: "Pedimos que vocês não registrem nada além do necessário, como documentos, números de cartão ou informações de saúde que o buffet não precisa saber.",
          },
        ],
      },
      {
        heading: "Por que usamos os dados",
        blocks: [
          {
            kind: "ul",
            items: [
              "Criar sua conta, reconhecer você no login, guardar e mostrar o planejamento para a equipe do casamento. Base legal: execução do contrato (art. 7º, V).",
              "Guardar dados de convidados e fornecedores em nome do casal, que decide o que registrar. O casal usa esses dados para organizar o próprio casamento, uma finalidade compatível com o legítimo interesse e com a expectativa de quem é convidado (art. 7º, IX).",
              "Falar com você quando for preciso, sobre segurança, mudanças importantes ou o fim do serviço. Base legal: execução do contrato e obrigação legal (art. 7º, V e II).",
              "Manter o serviço no ar e seguro, com registros técnicos e cópias de segurança. Base legal: execução do contrato e legítimo interesse (art. 7º, V e IX).",
            ],
          },
        ],
      },
      {
        heading: "Com quem compartilhamos",
        blocks: [
          {
            kind: "p",
            text: "Os dados de um casamento só aparecem para as pessoas que o casal convidou para a equipe. Fora isso, só estes serviços recebem dados, porque o app precisa deles:",
          },
          {
            kind: "ul",
            items: [
              "Supabase: banco de dados e login, com servidores em São Paulo. Empresa dos Estados Unidos, atua como operador.",
              "Vercel: hospedagem do app, com funções em São Paulo e registros de acesso nos Estados Unidos. Atua como operador.",
              "GitHub: gera e guarda a cópia de segurança diária, criptografada, nos Estados Unidos. Atua como operador.",
            ],
          },
          {
            kind: "p",
            text: "Quando vocês tocam num botão de WhatsApp, o app abre o seu aplicativo com um texto pronto. O envio é feito por você, no WhatsApp, e segue as regras dele.",
          },
        ],
      },
      {
        heading: "Dados fora do Brasil",
        blocks: [
          {
            kind: "p",
            text: "Supabase, Vercel e GitHub são empresas dos Estados Unidos. Registros técnicos e a cópia de segurança criptografada ficam lá, pelo tempo descrito abaixo. A transferência é necessária para prestar o serviço (LGPD, art. 33, IX).",
          },
        ],
      },
      {
        heading: "Por quanto tempo guardamos",
        blocks: [
          {
            kind: "ul",
            items: [
              "Sua conta: até você excluir. O casamento fica enquanto houver alguém do casal na equipe.",
              "Registros técnicos: cerca de 1 dia no Supabase e cerca de 1 hora na Vercel.",
              "Cópias de segurança: {backupDias} dias cada uma.",
              "Registros de incidentes de segurança: 5 anos, como exige a ANPD.",
            ],
          },
        ],
      },
      {
        heading: "Seus direitos e os dos convidados",
        blocks: [
          {
            kind: "ul",
            items: [
              "Ver e levar os dados: em Ajustes, Conta, use “Exportar dados”.",
              "Corrigir: edite qualquer item no próprio app.",
              "Apagar: exclua itens, o casamento inteiro em Ajustes, Casamento, ou sua conta em Ajustes, Conta.",
              "Convidados e fornecedores podem pedir ao casal para corrigir ou apagar os próprios dados, ou escrever para {email}, que encaminhamos ao casal.",
            ],
          },
          {
            kind: "p",
            text: "Respondemos pedidos em até 15 dias. Se não ficar satisfeito, você pode reclamar à ANPD no portal gov.br ou procurar os órgãos de defesa do consumidor.",
          },
        ],
      },
      {
        heading: "Segurança",
        blocks: [
          {
            kind: "ul",
            items: [
              "A conexão usa sempre criptografia.",
              "O banco de dados tem regras por casamento: só quem está na equipe vê os dados, e cada papel só muda o que pode.",
              "Senhas são protegidas com bcrypt, e o login fica bloqueado por alguns minutos depois de muitas tentativas.",
              "Os links de convite valem 14 dias e por uma pessoa só. O casal pode cancelar um convite a qualquer momento.",
              "As cópias de segurança são criptografadas, com a chave guardada separada delas.",
            ],
          },
          {
            kind: "p",
            text: "Se um incidente puder causar risco ou dano relevante, avisamos você e a ANPD nos prazos da lei.",
          },
        ],
      },
      {
        heading: "Cookies e acessibilidade",
        blocks: [
          {
            kind: "p",
            text: "Usamos só o cookie de sessão, que começa com “sb-” e mantém você conectado. Não usamos cookies de análise nem de publicidade.",
          },
          {
            kind: "p",
            text: "Seguimos as Diretrizes de Acessibilidade para Conteúdo Web (WCAG) 2.2, nível AA. Se algo não funcionar para você, escreva para {email}.",
          },
        ],
      },
    ],
  },
};
