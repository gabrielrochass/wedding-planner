# Registro das operações de tratamento

Registro simplificado de agente de tratamento de pequeno porte (LGPD, art. 37, e Res. CD/ANPD 2/2022, art. 9º).
Revisado em 9 de outubro de 2026.

- Controlador dos dados de conta: Gabriel Rocha, pessoa natural, sem receita com o app.
- Controlador dos dados de convidados e fornecedores: o casal que registra os dados. O app atua como operador, em nome
  do casal e só para o planejamento do casamento.
- Contato do titular: gabrielrsilva203@gmail.com, o canal publicado na Política de Privacidade.
- Titulares: pessoas com 18 anos ou mais que criam conta; convidados e fornecedores registrados pelo casal.
- Operadores: Supabase (banco e login), Vercel (hospedagem) e GitHub (backup), pelos termos e DPAs de cada um.

| Dados | Finalidade | Base legal | Retenção | Compartilhamento | Transferência internacional |
| --- | --- | --- | --- | --- | --- |
| Conta: nome, e-mail e hash bcrypt da senha | Criar a conta e entrar | Execução de contrato (art. 7º, V) | Até a exclusão da conta; backup por mais 14 dias | Supabase (Auth) | Conta no Brasil (sa-east-1); cópia nos EUA pelo backup |
| Casamento: nomes do casal, data, cidade, cerimônia, tarefas, orçamento, gastos e pagamentos | Planejar o casamento com a equipe | Execução de contrato (art. 7º, V) | Enquanto houver alguém do casal na equipe; backup por mais 14 dias | Pessoas convidadas pelo casal para a equipe; Supabase, Vercel | Banco no Brasil; cópia nos EUA pelo backup |
| Convidados: nome, faixa de idade, lado, telefone, endereço, presença, restrição alimentar, presente | Organizar a lista do casamento, em nome do casal | Legítimo interesse do casal (art. 7º, IX), compatível com a expectativa de quem é convidado | Até o casal apagar o item ou o casamento | Equipe do casamento; Supabase, Vercel | Banco no Brasil; cópia nos EUA pelo backup |
| Fornecedores: nome, contato, orçamento, notas | Comparar e contratar fornecedores, em nome do casal | Legítimo interesse do casal (art. 7º, IX) | Até o casal apagar o item ou o casamento | Equipe do casamento; Supabase, Vercel | Banco no Brasil; cópia nos EUA pelo backup |
| Equipe e convites: quem participa de cada casamento, papel, hash do token de convite | Controlar o acesso por papel | Execução de contrato (art. 7º, V) | Convites expiram em 14 dias; membros até saírem | Supabase | Não |
| Sessão: cookies essenciais, token de 15 minutos, IP e navegador | Manter o login seguro | Legítimo interesse (art. 7º, IX) | Até sair ou excluir a conta; fora do backup | Supabase (Auth) | Não |
| Backup cifrado do banco, sem sessões | Recuperar o serviço depois de falha | Execução de contrato (art. 7º, V) e dever de segurança (art. 46) | 14 dias | GitHub (artefato do Actions) | Sim, EUA: cifrado com chave offline |
| Registros técnicos de acesso | Segurança e diagnóstico | Execução de contrato (art. 7º, V) | Padrão de cada fornecedor | Vercel, Supabase | Sim, EUA (art. 33, IX) |
| Registro de incidentes ([runbook](runbook.md)) | Cumprir a Res. CD/ANPD 15/2024 | Obrigação legal (art. 7º, II) | 5 anos | ANPD, quando comunicado | Não |

Segurança: RLS por casamento em todas as tabelas, com papéis (casal, assessoria, ajudante, só leitura) checados no
banco e em cada Server Action; convites de uso único com hash no banco; senha só como hash bcrypt; só cookies
essenciais; backup cifrado com chave offline.

## Por que não é alto risco (Res. CD/ANPD 2/2022, art. 4º)

1. Alto risco exige ao menos um critério geral e um específico do art. 4º.
2. Gerais: a base ainda é pequena, sem larga escala. Um vazamento de telefones e endereços de convidados poderia
   afetar interesses dos titulares, então o critério é tratado como possível.
3. Específicos: restrições alimentares podem revelar saúde ou religião (dado sensível). O app pede para registrar só
   o necessário e não usa esse campo para nada além de mostrar ao casal. Não há tecnologia emergente, vigilância nem
   decisão automatizada. Crianças aparecem só como faixa de idade escolhida pelo casal, sem data de nascimento.
4. Conclusão: o regime de pequeno porte se aplica, mas reavaliar se a base crescer ou se o campo de restrição
   alimentar passar a ser usado de outra forma.
