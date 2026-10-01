export const dbLegacySegments = ["barbershop", "hair_salon", "aesthetics", "other"] as const;
export type DbLegacySegment = (typeof dbLegacySegments)[number];

export const businessSegments = [
  "barbershop",
  "hair_salon",
  "aesthetics",
  "health_wellness",
  "pet_care",
  "fitness_sports",
  "tattoo_piercing",
  "consulting_education",
  "auto_detailing",
  "other",
] as const;

export type BusinessSegment = (typeof businessSegments)[number];
export type ServiceName = string;
export type ServiceDescription = string;
export type ServiceDurationMinutes = number;
export type SuggestedPriceCents = number;

export type SuggestedService = Readonly<{
  key: string;
  name: ServiceName;
  description: ServiceDescription;
  durationMinutes: ServiceDurationMinutes;
  priceCents: SuggestedPriceCents;
}>;

export function toDbSegment(segment: BusinessSegment | string): DbLegacySegment {
  if (segment === "barbershop" || segment === "hair_salon" || segment === "aesthetics") {
    return segment;
  }
  return "other";
}

export const serviceSuggestions = {
  barbershop: [
    { key: "male-haircut", name: "Corte masculino", description: "", durationMinutes: 30, priceCents: 4_000 },
    { key: "beard", name: "Barba", description: "", durationMinutes: 30, priceCents: 3_000 },
    { key: "haircut-and-beard", name: "Corte e barba", description: "", durationMinutes: 60, priceCents: 6_500 },
    { key: "line-up", name: "Acabamento/Pezinho", description: "", durationMinutes: 15, priceCents: 1_500 },
    { key: "kids-haircut", name: "Corte infantil", description: "", durationMinutes: 30, priceCents: 3_500 },
    { key: "eyebrows", name: "Sobrancelha", description: "", durationMinutes: 15, priceCents: 1_500 },
  ],
  hair_salon: [
    { key: "womens-haircut", name: "Corte feminino", description: "", durationMinutes: 60, priceCents: 8_000 },
    { key: "blowout", name: "Escova", description: "", durationMinutes: 45, priceCents: 6_000 },
    { key: "hydration", name: "Hidratação", description: "", durationMinutes: 60, priceCents: 8_000 },
    { key: "coloring", name: "Coloração", description: "", durationMinutes: 120, priceCents: 15_000 },
    { key: "manicure", name: "Manicure", description: "", durationMinutes: 60, priceCents: 4_000 },
    { key: "pedicure", name: "Pedicure", description: "", durationMinutes: 60, priceCents: 4_500 },
  ],
  aesthetics: [
    { key: "facial-cleansing", name: "Limpeza de pele", description: "", durationMinutes: 60, priceCents: 10_000 },
    { key: "eyebrow-design", name: "Design de sobrancelhas", description: "", durationMinutes: 30, priceCents: 4_000 },
    { key: "facial-waxing", name: "Depilação facial", description: "", durationMinutes: 30, priceCents: 5_000 },
    { key: "relaxing-massage", name: "Massagem relaxante", description: "", durationMinutes: 60, priceCents: 12_000 },
    { key: "lymphatic-drainage", name: "Drenagem linfática", description: "", durationMinutes: 60, priceCents: 12_000 },
    { key: "custom-procedure", name: "Procedimento personalizado", description: "", durationMinutes: 60, priceCents: 10_000 },
  ],
  health_wellness: [
    { key: "assessment-consultation", name: "Consulta de avaliação", description: "Avaliação inicial completa para diagnóstico.", durationMinutes: 45, priceCents: 15_000 },
    { key: "follow-up-session", name: "Consulta de retorno", description: "Acompanhamento e evolução do tratamento.", durationMinutes: 30, priceCents: 9_000 },
    { key: "physiotherapy-session", name: "Sessão de fisioterapia", description: "Atendimento fisioterapêutico individual.", durationMinutes: 50, priceCents: 12_000 },
    { key: "dental-cleaning", name: "Limpeza e profilaxia dental", description: "Higienização profissional e remoção de tártaro.", durationMinutes: 45, priceCents: 14_000 },
    { key: "nutrition-consultation", name: "Consulta nutricional", description: "Planejamento alimentar e bioimpedância.", durationMinutes: 60, priceCents: 16_000 },
    { key: "psychotherapy-session", name: "Sessão de psicoterapia", description: "Atendimento psicológico individual.", durationMinutes: 50, priceCents: 15_000 },
  ],
  pet_care: [
    { key: "bath-and-hygienic-grooming", name: "Banho e tosa higiênica", description: "Banho com cosméticos específicos e secagem.", durationMinutes: 60, priceCents: 6_500 },
    { key: "full-breed-grooming", name: "Tosa completa da raça", description: "Tosa especializada padrão da raça.", durationMinutes: 90, priceCents: 11_000 },
    { key: "vet-consultation", name: "Consulta veterinária geral", description: "Exame clínico e orientações preventivas.", durationMinutes: 40, priceCents: 13_000 },
    { key: "coat-hydration", name: "Hidratação de pelagem", description: "Tratamento profundo contra nós e ressecamento.", durationMinutes: 45, priceCents: 5_000 },
    { key: "vaccine-application", name: "Aplicação de vacina", description: "Vacinas essenciais com registro na carteirinha.", durationMinutes: 20, priceCents: 8_000 },
    { key: "nails-and-ears", name: "Corte de unhas e ouvidos", description: "Higienização rápida preventiva.", durationMinutes: 20, priceCents: 2_500 },
  ],
  fitness_sports: [
    { key: "trial-class", name: "Aula experimental", description: "Apresentação do espaço e metodologia.", durationMinutes: 50, priceCents: 4_000 },
    { key: "personal-training", name: "Sessão de Personal Trainer", description: "Treino individual personalizado.", durationMinutes: 60, priceCents: 9_000 },
    { key: "pilates-session", name: "Aula de Pilates", description: "Postura e fortalecimento solo ou aparelho.", durationMinutes: 50, priceCents: 8_000 },
    { key: "physical-assessment", name: "Avaliação física completa", description: "Percentual de gordura, medidas e metas.", durationMinutes: 45, priceCents: 7_500 },
    { key: "yoga-session", name: "Sessão de Yoga e respiração", description: "Alinhamento corporal e meditação.", durationMinutes: 60, priceCents: 6_000 },
    { key: "functional-training", name: "Treinamento funcional", description: "Circuito dinâmico de mobilidade e força.", durationMinutes: 50, priceCents: 7_000 },
  ],
  tattoo_piercing: [
    { key: "flash-tattoo", name: "Flash Tattoo (até 8cm)", description: "Desenho autoral rápido de pequeno porte.", durationMinutes: 60, priceCents: 20_000 },
    { key: "custom-tattoo-session", name: "Sessão de tatuagem autoral", description: "Desenvolvimento e aplicação do projeto.", durationMinutes: 180, priceCents: 50_000 },
    { key: "body-piercing-basic", name: "Aplicação de Piercing", description: "Perfuração asséptica com joia de titânio.", durationMinutes: 30, priceCents: 8_000 },
    { key: "jewelry-change", name: "Troca ou manutenção de joia", description: "Substituição e higienização de piercing.", durationMinutes: 20, priceCents: 3_000 },
    { key: "design-consultation", name: "Consulta de criação de projeto", description: "Definição de referências, medidas e local.", durationMinutes: 30, priceCents: 0 },
    { key: "touch-up-session", name: "Sessão de retoque", description: "Ajuste fino de pigmento cicatrizado.", durationMinutes: 45, priceCents: 5_000 },
  ],
  consulting_education: [
    { key: "initial-diagnosis", name: "Sessão de diagnóstico / alinhamento", description: "Análise das necessidades e direcionamento.", durationMinutes: 60, priceCents: 18_000 },
    { key: "legal-consultation", name: "Consulta jurídica inicial", description: "Análise de caso e orientação legal.", durationMinutes: 60, priceCents: 25_000 },
    { key: "private-class", name: "Aula particular individual (60 min)", description: "Ensino focado no ritmo e objetivos do aluno.", durationMinutes: 60, priceCents: 9_000 },
    { key: "financial-planning", name: "Planejamento financeiro / estratégico", description: "Metas, estruturação e orçamentos.", durationMinutes: 60, priceCents: 20_000 },
    { key: "career-mentoring", name: "Mentoria de negócios / carreira", description: "Estratégia e plano de desenvolvimento.", durationMinutes: 60, priceCents: 15_000 },
    { key: "online-follow-up", name: "Sessão de acompanhamento online", description: "Reunião remota de acompanhamento.", durationMinutes: 45, priceCents: 12_000 },
  ],
  auto_detailing: [
    { key: "detailed-wash", name: "Lavagem técnica detalhada", description: "Limpeza minuciosa de lataria e caixas de roda.", durationMinutes: 90, priceCents: 9_000 },
    { key: "interior-sanitization", name: "Higienização interna e oxisanitização", description: "Limpeza profunda de estofados e remoção de odores.", durationMinutes: 180, priceCents: 22_000 },
    { key: "paint-polishing", name: "Polimento comercial e proteção", description: "Eliminação de micro-riscos e brilho protetor.", durationMinutes: 240, priceCents: 35_000 },
    { key: "ceramic-coating", name: "Vitrificação cerâmica de pintura", description: "Proteção hidrofóbica com durabilidade de até 3 anos.", durationMinutes: 360, priceCents: 95_000 },
    { key: "glass-crystalization", name: "Cristalização de para-brisas", description: "Repelência à chuva e máxima visibilidade.", durationMinutes: 45, priceCents: 6_000 },
    { key: "leather-treatment", name: "Limpeza e hidratação de couro", description: "Nutrição e maciez contra ressecamento.", durationMinutes: 60, priceCents: 12_000 },
  ],
  other: [],
} as const satisfies Record<BusinessSegment, readonly SuggestedService[]>;

export const segmentOptions: ReadonlyArray<{ value: BusinessSegment; label: string }> = [
  { value: "barbershop", label: "Barbearia" },
  { value: "hair_salon", label: "Salão de beleza" },
  { value: "aesthetics", label: "Estética & Bem-estar" },
  { value: "health_wellness", label: "Saúde & Clínicas (Médica, Odonto, Fisio, Psico)" },
  { value: "pet_care", label: "Pet Shop & Veterinária" },
  { value: "fitness_sports", label: "Fitness, Personal, Pilates & Yoga" },
  { value: "tattoo_piercing", label: "Tatuagem & Piercing" },
  { value: "consulting_education", label: "Consultoria & Aulas Particulares" },
  { value: "auto_detailing", label: "Estética Automotiva & Lava-rápido" },
  { value: "other", label: "Outro segmento" },
];

export function hasServiceSuggestions(segment: string): segment is Exclude<BusinessSegment, "other"> {
  return segment in serviceSuggestions && segment !== "other";
}
