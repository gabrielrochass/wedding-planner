@AGENTS.md

# Sim a Dois

Web app de planejamento de casamento (pt-BR): checklist com prazos brasileiros, orçamento com parcelas e contribuidores,
fornecedores em funil, convidados por família com triagem e WhatsApp. SaaS público, gratuito, multi-tenant por
casamento com papéis (couple, planner, helper, viewer). Next.js 16 + Supabase + Vercel (região gru1). Infra própria,
sem ligação com o Contadinho, que só serviu de template.

## Comandos

- `npm run dev` — servidor local
- `npm run lint` / `npm run format` — Biome (checar / corrigir)
- `npm run typecheck` — tipos de rota + `tsc`
- `npm test` — Vitest (`lib/**/*.test.ts`)
- `npm run test:e2e` — Playwright + axe (`e2e/`), sobe o build com `DEV_UI=1`
- `supabase test db` — pgTAP (`supabase/tests/database/`); `npm run db:types` regenera os tipos do banco

## Princípios

- Simplicidade acima de tudo: sem dependência, abstração ou integração externa que a funcionalidade não exija.
- Sem comentários desnecessários; nomes claros dispensam explicação.
- Textos de interface só em `lib/i18n.ts`.
- Nada de ponto médio (·) nem travessão (— ou –) nos textos: use frases curtas, vírgulas e espaçamento.

## Dinheiro e datas

- Dinheiro em centavos inteiros (`number`); formatar e mascarar só com `lib/money.ts`. Nunca float.
- Datas de negócio como string `YYYY-MM-DD`; usar `lib/dates.ts`. Nunca `new Date("YYYY-MM-DD")` nem
  `toISOString().slice(0, 10)`.
- Meses como intervalos meio-abertos `[início, próximo início)`.

## UI

- shadcn/ui na base **Base UI**: compor com a prop `render`, nunca `asChild`; nunca misturar com Radix.
- Depois de `npx shadcn add`: trocar `import { cn } from "cn"` por `import { cn } from "@/lib/utils"` e traduzir para
  pt-BR os textos de leitor de tela do componente.
- Cores só por token (`bg-card`, `text-muted-foreground`…). Texto e ícone azul usam `text-link`; `primary` só para
  preenchimento.
- Tipografia pelas classes `text-caption|footnote|subhead|body|headline|title3|title2|title1|large-title|hero`; todo
  valor monetário com `tabular-nums`.
- Navegação é sempre `<Link>` (com `buttonVariants` quando parecer botão), nunca `Button` renderizando link.

## Acessibilidade (WCAG 2.2 AA)

- Alvos de toque ≥ 24px (44px no mobile); inputs ≥ 16px no mobile; nunca `maximum-scale` nem trava de orientação.
- Foco visível vem do `:focus-visible` global; não remover outline.
- Status nunca só por cor (ícone + texto); toda interação de arrastar tem alternativa por toque.
- Toasts acima da tab bar e da safe area.
- Componentes novos entram em `/dev/ui` quando tiverem variantes de cor.

## Next.js

- Server Components leem dados (`lib/data.ts`); Server Actions escrevem (`lib/actions/*`); cada action chama
  `requireWedding()` e checa o papel com `lib/roles.ts` antes de escrever, sempre filtrando por `wedding_id`.
- Tabelas de domínio têm `wedding_id`, RLS via `private.member_role()` e grants por coluna.
- `proxy.ts` (não `middleware.ts`) só renova sessão e redireciona.
