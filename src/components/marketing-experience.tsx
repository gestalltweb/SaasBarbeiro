"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarCheck, Check, ChevronDown, Clock3, Scissors, Users } from "lucide-react";

const startSteps = [
  ["Cadastrar serviços", "Defina o que oferece, a duração e o preço."],
  ["Organizar a equipe", "Associe cada profissional aos serviços que realiza."],
  ["Configurar horários", "Informe expediente, intervalos, folgas e bloqueios."],
  ["Preparar e divulgar", "Revise a página, publique e compartilhe seu link."],
] as const;

export function StartTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let inside = false;
    let armed = true;
    let rearmTimer: number | null = null;
    const play = () => {
      if (!armed || document.hidden) return;
      armed = false;
      node.classList.remove("timeline-active");
      void node.offsetWidth;
      node.classList.add("timeline-active");
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        inside = true;
        if (rearmTimer !== null) window.clearTimeout(rearmTimer);
        rearmTimer = null;
        play();
        return;
      }
      inside = false;
      if (rearmTimer !== null) window.clearTimeout(rearmTimer);
      rearmTimer = window.setTimeout(() => {
        if (inside) return;
        node.classList.remove("timeline-active");
        armed = true;
        rearmTimer = null;
      }, 180);
    }, { threshold: 0.01, rootMargin: "0px 0px 18% 0px" });
    observer.observe(node);
    const handleVisibility = () => {
      node.style.setProperty("--timeline-play-state", document.hidden ? "paused" : "running");
      if (!document.hidden && inside) play();
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      if (rearmTimer !== null) window.clearTimeout(rearmTimer);
    };
  }, []);
  return <div ref={ref} className="start-timeline">
    <span className="timeline-track" aria-hidden="true"><i /></span>
    {startSteps.map(([title, detail], index) => <article key={title} style={{ "--timeline-index": index } as React.CSSProperties}><span>{index + 1}</span><h3>{title}</h3><p>{detail}</p></article>)}
  </div>;
}

const comparisons = {
  messages: { label: "Por mensagens", lead: "Você precisa interromper o atendimento para organizar cada pedido.", tasks: ["Perguntar qual serviço", "Consultar o profissional", "Comparar horários", "Pedir os dados", "Registrar a reserva"] },
  agenda: { label: "Com Agenda Local", lead: "O cliente consulta as opções e envia a reserva pela página.", tasks: ["Vê os serviços", "Escolhe quem atende", "Encontra horário livre", "Informa seus dados", "Você recebe organizado"] },
} as const;

export function TimeComparison() {
  const [mode, setMode] = useState<keyof typeof comparisons>("agenda");
  const current = comparisons[mode];
  return <div className="comparison-panel">
    <div className="comparison-tabs" role="tablist" aria-label="Comparar formas de organizar reservas">
      {(Object.keys(comparisons) as (keyof typeof comparisons)[]).map(key => <button key={key} role="tab" type="button" aria-selected={mode === key} onClick={() => setMode(key)}>{comparisons[key].label}</button>)}
    </div>
    <div className={`comparison-content ${mode}`} key={mode} role="tabpanel">
      <p>{current.lead}</p>
      <div>{current.tasks.map((task, index) => <span key={task}><i>{index + 1}</i>{task}{mode === "agenda" && index < current.tasks.length - 1 ? <Check size={15} /> : null}</span>)}</div>
    </div>
  </div>;
}

const dashboardTabs = [
  { id: "agenda", label: "Agenda", icon: CalendarCheck, title: "Atendimentos em ordem", text: "Filtre por data, profissional e status; confirme, cancele ou conclua cada atendimento.", rows: ["09:00 · Atendimento pendente", "10:30 · Atendimento confirmado", "14:00 · Horário disponível"] },
  { id: "clientes", label: "Clientes", icon: Users, title: "Histórico que nasce da agenda", text: "A lista de clientes é formada pelas reservas e reúne os atendimentos de cada pessoa.", rows: ["Cliente · contato", "Último atendimento", "Histórico do cliente"] },
  { id: "servicos", label: "Serviços", icon: Scissors, title: "Serviços prontos para reservar", text: "Mantenha nome, descrição, duração e preço atualizados; pause o que não estiver disponível.", rows: ["Serviço ativo · duração · preço", "Serviço ativo · duração · preço", "Serviço pausado"] },
  { id: "equipe", label: "Equipe", icon: Users, title: "Equipe ligada aos serviços", text: "Defina o que cada profissional realiza e use horários individuais quando necessário.", rows: ["Profissional · serviços associados", "Contato do profissional", "Disponibilidade individual"] },
  { id: "horarios", label: "Horários", icon: Clock3, title: "Disponibilidade sem choque", text: "Expediente, intervalos, folgas, bloqueios e reservas existentes entram no cálculo.", rows: ["Segunda a sexta · expediente", "Intervalo configurado", "Bloqueios e indisponibilidades"] },
] as const;

export function DashboardExplorer() {
  const [active, setActive] = useState(0);
  const item = dashboardTabs[active];
  const ActiveIcon = item.icon;
  return <div className="dashboard-explorer">
    <div className="dashboard-tabs" role="tablist" aria-label="Recursos do painel">
      {dashboardTabs.map((tab, index) => { const Icon = tab.icon; return <button key={tab.id} type="button" role="tab" aria-selected={index === active} aria-controls="dashboard-feature" onClick={() => setActive(index)}><Icon size={18} />{tab.label}</button>; })}
    </div>
    <div className="dashboard-browser" aria-label="Prévia ilustrativa do painel">
      <div className="browser-bar"><i /><i /><i /><span>painel do negócio</span></div>
      <div className="dashboard-screen" key={item.id}><small>{item.label}</small><h3>{item.title}</h3>{item.rows.map((row, index) => <div key={row} className={index === 1 ? "featured" : ""}><span>{row}</span><i /></div>)}</div>
    </div>
    <div id="dashboard-feature" className="dashboard-benefit" key={`${item.id}-copy`} role="tabpanel"><ActiveIcon size={24} /><h3>{item.title}</h3><p>{item.text}</p></div>
  </div>;
}

export function PhonePreview() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track || window.matchMedia("(max-width: 700px), (prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => {
      const rect = section.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (rect.height + window.innerHeight)));
      track.style.transform = `translateY(${-progress * 45}%)`;
      frame = 0;
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (frame) cancelAnimationFrame(frame); };
  }, []);
  return <div className="phone-story" ref={sectionRef}>
    <div className="phone-device" aria-label="Prévia ilustrativa da página pública"><span className="phone-speaker" /><div className="phone-viewport"><div className="phone-page-track" ref={trackRef}>
      <div className="phone-page-hero"><span>SN</span><small>Seu Negócio</small><strong>Atendimento com hora marcada.</strong><button type="button">Agendar horário</button></div>
      <div className="phone-page-block"><h4>Serviços</h4><p>Atendimento individual <b>Seu preço</b></p><p>Sessão personalizada <b>Seu preço</b></p></div>
      <div className="phone-page-block"><h4>Profissionais</h4><p>Profissional disponível</p><p>Equipe do negócio</p></div>
      <div className="phone-page-block"><h4>Localização e contato</h4><p>Endereço do negócio</p><p>Telefone e Instagram</p></div>
      <div className="phone-page-action">Escolher um horário</div>
    </div></div></div>
    <ul><li><Check /> Identidade do negócio</li><li><Check /> Serviços e profissionais</li><li><Check /> Localização e contato</li><li><Check /> Agendamento pela própria página</li></ul>
  </div>;
}

const faqs = [
  ["Serve apenas para barbearias?", "Não. O Agenda Local atende barbearias, salões, estética e outros negócios que trabalham com hora marcada."],
  ["Como os horários ficam disponíveis?", "A disponibilidade considera o serviço, a jornada do profissional, o expediente do negócio, os bloqueios e os agendamentos existentes."],
  ["Meu cliente precisa criar uma conta?", "Não. Ele escolhe o atendimento e informa seus dados de contato na página pública do negócio."],
  ["A página é publicada assim que eu cadastro?", "Não. Configure serviços, profissionais e horários, revise o rascunho e publique manualmente quando estiver pronto."],
  ["Qual é o preço?", "O valor do plano ainda não foi definido. Será informado antes do lançamento comercial."],
] as const;

export function MarketingFaq() {
  const [open, setOpen] = useState<number | null>(0);
  return <div className="faq-list">{faqs.map(([question, answer], index) => {
    const expanded = open === index;
    return <div className={expanded ? "faq-item open" : "faq-item"} key={question}><button type="button" aria-expanded={expanded} aria-controls={`faq-answer-${index}`} onClick={() => setOpen(expanded ? null : index)}><span>{question}</span><ChevronDown size={20} /></button><div id={`faq-answer-${index}`} className="faq-answer" aria-hidden={!expanded}><div><p>{answer}</p></div></div></div>;
  })}</div>;
}
