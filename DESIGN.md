---
name: Agenda Local
description: A agenda viva dos negócios de bairro.
colors:
  forest-ink: "#214C3F"
  deep-ink: "#182A2D"
  warm-paper: "#F4F0E8"
  light-paper: "#FCFAF5"
  appointment-red: "#D8543D"
  agenda-yellow: "#E9C75B"
  ruled-line: "#D8D0C2"
  secondary-ink: "#5E6965"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(2.625rem, 5vw, 5.875rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 800
rounded:
  control: "10px"
  surface: "16px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  section: "120px"
components:
  button-primary:
    backgroundColor: "{colors.forest-ink}"
    textColor: "{colors.light-paper}"
    rounded: "{rounded.control}"
    padding: "0 24px"
    height: "50px"
  input:
    backgroundColor: "#FFFFFF"
    textColor: "{colors.deep-ink}"
    rounded: "{rounded.control}"
    padding: "0 14px"
    height: "50px"
---

# Design System: Agenda Local

## Overview

**Creative North Star: "A agenda viva do bairro"**

O sistema traduz o caderno de horários de um negócio local em uma interface editorial: papel quente, tinta profunda, linhas que organizam tempo e marcações vermelhas que indicam ação. A vitrine usa escala e ritmo para persuadir; dashboard e formulários ficam mais densos e previsíveis para operar.

**Key Characteristics:**

- Calor humano com precisão operacional.
- Hierarquia editorial, leitura simples e ações diretas.
- Tempo e disponibilidade aparecem como conteúdo, não decoração.
- A composição continua legível e funcional em 390px.

## Colors

O verde sustenta confiança e operação; o vermelho marca ações e compromissos; os papéis quentes evitam a frieza de um software genérico.

**The Ink-and-Paper Rule.** Todo texto e superfície parte da relação entre tinta e papel; cinza neutro não substitui os tons da paleta.

## Typography

**Display Font:** Fraunces (com Georgia como fallback)  
**Body Font:** Manrope (com Arial como fallback)

Fraunces dá voz humana às promessas e aos títulos. Manrope mantém formulários, navegação e dados claros. Números de horário usam algarismos tabulares.

**The Two-Voice Rule.** Fraunces narra; Manrope orienta e permite agir.

## Layout

O conteúdo público usa uma faixa central de até 1200px e seções amplas. A landing alterna blocos claros e escuros para controlar o ritmo. Em telas abaixo de 900px, divisões em duas colunas passam para uma; abaixo de 640px, alvos e campos continuam com pelo menos 44px e a agenda vira leitura vertical.

## Elevation & Depth

As superfícies são planas por padrão. Sombras ambientais aparecem apenas nas demonstrações, formulários principais e painéis que precisam se separar do papel. Bordas finas estruturam listas e linhas de tempo.

**The One-Separation Rule.** Uma superfície usa borda ou sombra como separação principal, nunca as duas com o mesmo peso.

## Shapes

Controles usam cantos de 10px; superfícies maiores usam 12–16px. Pílulas ficam reservadas a estados curtos. A página pública do negócio adiciona arcos altos como assinatura espacial, sem levar essa forma aos controles administrativos.

## Components

### Buttons

Botões primários são verdes, firmes e compactos; o hover escurece e eleva 2px. O foco usa um contorno vermelho de 3px. Botões secundários mantêm o papel e usam borda verde.

### Cards / Containers

Painéis de dashboard e formulários usam papel claro, cantos de 14–16px e espaçamento interno entre 24px e 46px. Cartões existem para agrupar uma tarefa ou estado, não para estruturar toda a página.

### Inputs / Fields

Campos têm rótulos visíveis, fundo branco, altura de 50px e borda quente. O foco muda a borda para verde e adiciona um halo suave. Erros aparecem em uma superfície vermelha clara com instrução legível.

### Navigation

A navegação institucional é discreta e central. No celular, o acesso direto ao cadastro permanece visível. O dashboard usa uma barra lateral verde com estado ativo tonal e rótulos reduzidos em larguras intermediárias.

### Schedule Scene

A agenda é o componente de assinatura: horários tabulares, marcadores de estado, linhas horizontais e uma única sequência de entrada. `prefers-reduced-motion` remove a animação sem esconder conteúdo.

## Do's and Don'ts

### Do:

- **Do** usar tempo, serviços e estado real como material visual.
- **Do** manter mais espaço acima de um título que abaixo dele.
- **Do** escrever ações em português direto e indicar o próximo passo.

### Don't:

- **Don't** inventar depoimentos, métricas, clientes, preços ou integrações.
- **Don't** usar texto em gradiente, vidro decorativo ou cartões repetidos como esqueleto da página.
- **Don't** antecipar temas da página pública dentro do dashboard operacional.
