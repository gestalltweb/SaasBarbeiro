-- Safe, additive migration for all business segments and catalog expansion.
-- Existing data, services and businesses are completely preserved.

-- 1. Add new enum values if not present
do $$ begin
  alter type public.business_segment add value if not exists 'health_wellness';
  alter type public.business_segment add value if not exists 'pet_care';
  alter type public.business_segment add value if not exists 'fitness_sports';
  alter type public.business_segment add value if not exists 'tattoo_piercing';
  alter type public.business_segment add value if not exists 'consulting_education';
  alter type public.business_segment add value if not exists 'auto_detailing';
exception when others then null;
end $$;

-- 2. Populate service suggestion catalog for new segments
insert into public.service_suggestion_catalog (segment, suggestion_key, name, description, duration_minutes, price_cents)
values
  -- Health & Wellness (Clínicas, Odonto, Fisioterapia, Psicologia)
  ('health_wellness', 'assessment-consultation', 'Consulta de avaliação', 'Avaliação inicial completa para diagnóstico e plano de tratamento.', 45, 15000),
  ('health_wellness', 'follow-up-session', 'Consulta de retorno', 'Acompanhamento da evolução e ajustes do plano.', 30, 9000),
  ('health_wellness', 'physiotherapy-session', 'Sessão de fisioterapia', 'Atendimento fisioterapêutico especializado e reabilitação.', 50, 12000),
  ('health_wellness', 'dental-cleaning', 'Limpeza e profilaxia dental', 'Higienização profissional, remoção de tártaro e polimento.', 45, 14000),
  ('health_wellness', 'nutrition-consultation', 'Consulta nutricional', 'Avaliação metabólica e planejamento alimentar individual.', 60, 16000),
  ('health_wellness', 'psychotherapy-session', 'Sessão de psicoterapia', 'Atendimento psicológico individual e acolhimento.', 50, 15000),

  -- Pet Care & Veterinária
  ('pet_care', 'bath-and-hygienic-grooming', 'Banho e tosa higiênica', 'Banho com produtos específicos, secagem e higienização.', 60, 6500),
  ('pet_care', 'full-breed-grooming', 'Tosa completa da raça', 'Tosa especializada conforme o padrão da raça.', 90, 11000),
  ('pet_care', 'vet-consultation', 'Consulta veterinária geral', 'Exame clínico geral e orientações de saúde.', 40, 13000),
  ('pet_care', 'coat-hydration', 'Hidratação e desembolo', 'Tratamento intensivo para recuperação da pelagem.', 45, 5000),
  ('pet_care', 'vaccine-application', 'Aplicação de vacina', 'Administração de vacinas essenciais com conferência na carteira.', 20, 8000),
  ('pet_care', 'nails-and-ears', 'Corte de unhas e limpeza de ouvidos', 'Cuidado e higienização rápida preventiva.', 20, 2500),

  -- Fitness, Pilates & Yoga
  ('fitness_sports', 'trial-class', 'Aula experimental', 'Conheça o espaço, metodologia e dinâmica da aula.', 50, 4000),
  ('fitness_sports', 'personal-training', 'Sessão de Personal Trainer', 'Treinamento individual focado nos seus objetivos.', 60, 9000),
  ('fitness_sports', 'pilates-session', 'Aula de Pilates', 'Prática em aparelhos ou solo para postura e fortalecimento.', 50, 8000),
  ('fitness_sports', 'physical-assessment', 'Avaliação física e bioimpedância', 'Medição de dobras, percentual de gordura e metas.', 45, 7500),
  ('fitness_sports', 'yoga-session', 'Sessão de Yoga e respiração', 'Alongamento, alinhamento postural e relaxamento guiado.', 60, 6000),
  ('fitness_sports', 'functional-training', 'Treino funcional personalizado', 'Circuito de condicionamento físico e mobilidade.', 50, 7000),

  -- Tatuagem & Piercing
  ('tattoo_piercing', 'flash-tattoo', 'Flash Tattoo (até 8cm)', 'Desenho exclusivo rápido de pequeno porte.', 60, 20000),
  ('tattoo_piercing', 'custom-tattoo-session', 'Sessão de tatuagem autoral', 'Desenvolvimento e aplicação de projeto personalizado.', 180, 50000),
  ('tattoo_piercing', 'body-piercing-basic', 'Aplicação de Piercing', 'Perfuração asséptica com joia de titânio ou aço cirúrgico.', 30, 8000),
  ('tattoo_piercing', 'jewelry-change', 'Troca ou manutenção de joia', 'Higienização e substituição segura de piercings.', 20, 3000),
  ('tattoo_piercing', 'design-consultation', 'Consulta para projeto exclusivo', 'Alinhamento de referências, medidas e orçamento.', 30, 0),
  ('tattoo_piercing', 'touch-up-session', 'Sessão de retoque', 'Ajuste fino de pigmentação de tatuagens cicatrizadas.', 45, 5000),

  -- Consultorias & Aulas Particulares
  ('consulting_education', 'initial-diagnosis', 'Sessão de diagnóstico / alinhamento', 'Análise das necessidades e direcionamento estratégico.', 60, 18000),
  ('consulting_education', 'legal-consultation', 'Consulta jurídica inicial', 'Análise preliminar de caso e esclarecimento de direitos.', 60, 25000),
  ('consulting_education', 'private-class', 'Aula particular individual', 'Mentoria e ensino focado no ritmo do aluno.', 60, 9000),
  ('consulting_education', 'financial-planning', 'Consultoria e planejamento financeiro', 'Organização de metas, orçamentos e estratégia.', 60, 20000),
  ('consulting_education', 'career-mentoring', 'Mentoria profissional e de carreira', 'Revisão de posicionamento, metas e plano de ação.', 60, 15000),
  ('consulting_education', 'online-follow-up', 'Sessão de acompanhamento online', 'Reunião remota para acompanhamento de resultados.', 45, 12000),

  -- Estética Automotiva
  ('auto_detailing', 'detailed-wash', 'Lavagem técnica detalhada', 'Limpeza minuciosa de carroceria, caixas de roda e secagem delicada.', 90, 9000),
  ('auto_detailing', 'interior-sanitization', 'Higienização interna e oxisanitização', 'Limpeza profunda de estofados, carpetes e eliminação de odores.', 180, 22000),
  ('auto_detailing', 'paint-polishing', 'Polimento comercial e proteção', 'Remoção de micro-riscos e aplicação de cera de carnaúba.', 240, 35000),
  ('auto_detailing', 'ceramic-coating', 'Vitrificação cerâmica de pintura', 'Proteção hidrofóbica com durabilidade de até 3 anos.', 360, 95000),
  ('auto_detailing', 'glass-crystalization', 'Cristalização de para-brisas', 'Repelência à água e melhora da visibilidade sob chuva.', 45, 6000),
  ('auto_detailing', 'leather-treatment', 'Limpeza e hidratação de bancos de couro', 'Nutrição do couro contra ressecamento e rachaduras.', 60, 12000)
on conflict (segment, suggestion_key) do nothing;
