# Agenda Local

Fundação de um SaaS multiempresa para negócios que trabalham com horário marcado. O mesmo projeto reúne:

- site institucional para aquisição de empresários;
- cadastro, login e onboarding;
- dashboard privado;
- página pública personalizada de cada negócio;
- base Supabase com isolamento por RLS.

`Agenda Local` é um nome provisório centralizado em `src/lib/brand.ts`.

## Stack

- Next.js 16 com App Router e TypeScript
- React 19 e Tailwind CSS 4
- Supabase Auth, PostgreSQL e Row Level Security
- Zod e Vitest
- Vercel como destino de hospedagem

## Executar localmente

1. Instale as dependências:

   ```bash
   pnpm install
   ```

2. Copie `.env.example` para `.env.local` e preencha as chaves públicas do Supabase.

3. Aplique as migrations de `supabase/migrations` no projeto Supabase.

   A ordem atual é:

   - `202609290001_foundation.sql`: autenticação, empresas, membros e RLS base;
   - `202609300001_operational_mvp.sql`: serviços, profissionais, horários, clientes, agenda e funções transacionais de agendamento;
   - `202610010001_service_suggestions.sql`: catálogo por segmento, inclusão idempotente e criação automática de serviços no onboarding.

4. Inicie o ambiente:

   ```bash
   pnpm dev
   ```

Sem variáveis do Supabase, a vitrine continua disponível; cadastro, páginas públicas e painel dependem da conexão.

## Verificações

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Os testes SQL em `supabase/tests` usam pgTAP e devem ser executados por `supabase test db` quando o Supabase CLI estiver conectado.

## Segurança

A criação de um negócio ocorre por uma função transacional no banco: empresa e vínculo do proprietário são criados juntos. A aplicação deriva o tenant pela associação do usuário autenticado e o RLS repete a autorização no banco. Nenhuma chave de serviço é usada no frontend.

## Escopo atual

O MVP inclui autenticação, tenant, onboarding com serviços sugeridos por segmento, serviços, profissionais, expediente, jornadas individuais, bloqueios, disponibilidade real, agendamento público protegido contra conflitos, agenda, clientes, configurações e publicação da página. Notificações e cobrança permanecem fora deste MVP.

## Agendamento seguro

O navegador nunca grava diretamente em `appointments`. A função `create_public_appointment` valida se a página, serviço e profissional estão ativos, recalcula a disponibilidade no banco, trava a combinação profissional/horário durante a transação e conta com uma restrição de exclusão para impedir sobreposição. Clientes públicos não recebem acesso de leitura às tabelas privadas.
