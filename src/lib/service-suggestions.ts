export const businessSegments = ["barbershop", "hair_salon", "aesthetics", "other"] as const;

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
  other: [],
} as const satisfies Record<BusinessSegment, readonly SuggestedService[]>;

export const segmentOptions: ReadonlyArray<{ value: BusinessSegment; label: string }> = [
  { value: "barbershop", label: "Barbearia" },
  { value: "hair_salon", label: "Salão de beleza" },
  { value: "aesthetics", label: "Estética" },
  { value: "other", label: "Outro serviço" },
];

export function hasServiceSuggestions(segment: string): segment is Exclude<BusinessSegment, "other"> {
  return segment === "barbershop" || segment === "hair_salon" || segment === "aesthetics";
}
