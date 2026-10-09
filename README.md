# Sim a Dois

Planejamento de casamento em pt-BR, feito para o casal planejar a dois: checklist com os prazos do cartório e da
igreja, orçamento com parcelas e quem ajuda a pagar, fornecedores em funil com comparação lado a lado e convidados
por família, com triagem e WhatsApp a um toque. Grátis, sem anúncios e sem venda de contatos para fornecedores.

Cada casamento tem uma equipe com papéis: casal (tudo), assessoria (edita tudo, menos a equipe), ajudante (edita
convidados e tarefas) e só leitura. As regras valem no banco (RLS) e em cada Server Action.

## Rodando localmente

Requisitos: Node 22+, Docker e a CLI do Supabase.

```bash
npm install
supabase start
cp .env.example .env.local
```

Preencha `.env.local` com as chaves que `supabase status` mostra (`PUBLISHABLE_KEY` e `SECRET_KEY`) e rode:

```bash
npm run dev
```

Abra <http://localhost:3000>. Localmente, `DEV_AUTH=1` cria uma sessão de teste com um casamento de exemplo, sem
cadastro; use `/dev/entrar?sem-casamento=1` para ver o onboarding. Em produção cada pessoa cria a conta com e-mail e
senha, sem confirmação por e-mail.

O Supabase local deste projeto usa as portas 5643x, para rodar ao lado de outros projetos. Depois de mudar uma
migration, rode `supabase db reset` e `npm run db:types`.

## Qualidade

```bash
npm run lint
npm run typecheck
npm test
supabase test db
npm run test:e2e
```

Convenções do projeto estão em [CLAUDE.md](CLAUDE.md).

## Produção

Configure nesta ordem. `<ref>` é o ID do projeto no Supabase e `<domínio>` é o endereço de produção.

1. **Supabase**: crie o projeto na região `sa-east-1` (São Paulo) com Postgres 17 e guarde a senha do banco num
   gerenciador de senhas.
2. **Auth no painel do Supabase**:
   - provedor Email ligado, com "Confirm email" desligado e senha mínima de 8 caracteres, sem regras de composição;
   - nenhum outro provedor ligado;
   - Site URL `https://<domínio>`;
   - JWT expiry `900` e chaves de assinatura assimétricas;
   - "Write audit logs to the database" desligado.

   Não rode `supabase config push`: ele mandaria a configuração local para a nuvem.
3. **GitHub**:
   - torne `main` a branch padrão, porque o backup agendado só roda nela;
   - crie o secret `SUPABASE_DB_URL` (no repositório ou no environment `production`) com a URI do Session pooler
     (IPv4) do botão Connect, com a senha codificada para URL;
   - crie a variável `BACKUP_AGE_RECIPIENT` com a chave pública do age (veja [Chaves](docs/runbook.md#chaves));
   - rode Actions > Migrate > Run workflow para criar o schema; depois ele roda sozinho a cada push na `main` que
     mude `supabase/migrations`;
   - rode Actions > Backup > Run workflow e confira que o artefato decifra.

   Não ligue Network Restrictions no banco: elas bloqueiam os runners do GitHub.
4. **Vercel**:
   - `NEXT_PUBLIC_SUPABASE_URL` (`https://<ref>.supabase.co`) e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` em Production
     e Preview;
   - `SUPABASE_SECRET_KEY` só em Production, como Sensitive;
   - nunca `DEV_AUTH`, `DEV_UI` nem `DEV_AUTH_EMAIL`;
   - Vercel Toolbar desligada nos previews.

Os workflows fixam a CLI do Supabase em 2.109.0, a mesma da máquina local; atualize as duas juntas. Se o teste de
restauração do Backup falhar por coluna ou tabela do schema `auth`, o Auth da nuvem ficou mais novo que essa CLI e é
hora de subir a versão.

Incidentes e restauração do backup: [docs/runbook.md](docs/runbook.md). Registro LGPD: [docs/lgpd.md](docs/lgpd.md).
