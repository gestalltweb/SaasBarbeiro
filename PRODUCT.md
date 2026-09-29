# Produto

<!-- impeccable:product-schema 1 -->

## Plataforma

web

## Stack

Delegado pelo usuário: Next.js com App Router e TypeScript, Tailwind CSS, Supabase (PostgreSQL, Auth e RLS) e implantação futura na Vercel. A escolha concentra o site institucional, a área autenticada e as páginas públicas dos negócios no mesmo projeto.

## Usuários

- Empreendedores de barbearias, salões, estética e pequenos negócios de serviços que precisam divulgar o negócio e organizar atendimentos.
- Clientes finais que desejam conhecer o negócio e agendar rapidamente, sem criar conta.

## Propósito do produto

Unir presença digital, agendamento online e gestão do negócio. O empreendedor configura uma página própria, publica um link e administra serviços, profissionais, horários e clientes. O cliente conhece o negócio e agenda no mesmo fluxo.

## Posicionamento

O produto não é apenas uma agenda: cada negócio recebe um mini-site comercial personalizado e conectado diretamente à disponibilidade real de atendimento.

## Contexto de uso

O site institucional atrai empresários por busca e divulgação. O empresário cria a conta, configura o negócio em um onboarding simples, publica a página e usa o dashboard. O cliente chega pelo Google, Instagram, WhatsApp ou link direto e conclui o agendamento pelo celular.

## Capacidades e restrições

- Um único projeto abriga o site institucional, o painel privado e as páginas públicas.
- Cada empresa é um tenant; seus dados nunca podem ser acessados ou alterados por outra empresa.
- O frontend não é uma fronteira de segurança. Autorização server-side e RLS são obrigatórias.
- O cliente final agenda sem conta.
- A disponibilidade precisa considerar duração, expediente, bloqueios e conflitos.
- Double booking deve ser impedido também no banco.
- O produto será construído incrementalmente: fundação, autenticação, tenant, onboarding, página, serviços, profissionais, horários, agendamento, clientes, notificações, assinaturas e produção.
- A primeira oferta comercial terá um plano de agendamento com página personalizada. Preço, cobrança, teste e marca pública ainda não foram definidos.

## Evidências disponíveis

O briefing detalhado fornecido pelo usuário é a fonte de verdade. Não existem ainda nome definitivo, identidade visual, logo, depoimentos, números de clientes, integrações comerciais ou provas sociais; esses elementos não devem ser inventados.

## Princípios do produto

1. Simples para o empreendedor configurar e operar.
2. Rápido para o cliente descobrir e reservar.
3. Isolamento entre empresas desde a primeira migration.
4. Página pública tão importante quanto a agenda.
5. Cada etapa concluída e validada antes da próxima.

## Acessibilidade e inclusão

A interface deve funcionar bem em celulares, com navegação por teclado, foco visível, contraste suficiente, textos claros e formulários com rótulos e mensagens de erro compreensíveis.
