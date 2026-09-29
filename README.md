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

4. Inicie o ambiente:

   ```bash
   pnpm dev
   ```

Sem variáveis do Supabase, a vitrine e a demonstração em `/barbearia-modelo` continuam disponíveis; cadastro e painel informam que a conexão está pendente.

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

Esta entrega conclui a fundação navegável, autenticação, tenant inicial, onboarding, dashboard base, página de demonstração e estrutura de SEO. Serviços, profissionais, disponibilidade, agendamento real, clientes, notificações e cobrança serão implementados nas próximas etapas, mantendo a sequência incremental definida no briefing.
