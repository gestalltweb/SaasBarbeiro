"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Pause, Play, RotateCcw } from "lucide-react";

const steps = [
  { title: "Escolha o serviço", detail: "Atendimento individual", options: ["Atendimento individual", "Sessão personalizada"] },
  { title: "Escolha o profissional", detail: "Profissional disponível", options: ["Profissional disponível", "Outro profissional"] },
  { title: "Encontre seu horário", detail: "10:00", options: ["09:00", "10:00", "11:30"] },
  { title: "Envie seus dados", detail: "O cliente informa nome e telefone; o e-mail é opcional.", options: [] },
  { title: "Reserva enviada", detail: "O empresário recebe a reserva pendente na agenda.", options: [] },
];

export function BookingDemo() {
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const [selection, setSelection] = useState(steps[0].detail);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .3 });
    if (ref.current) observer.observe(ref.current);
    const hide = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener("visibilitychange", hide);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", hide); };
  }, []);
  useEffect(() => {
    if (!playing || !visible || step === steps.length - 1 || document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => { setStep(step + 1); setSelection(steps[step + 1].detail); }, 2600);
    return () => window.clearTimeout(timer);
  }, [step, playing, visible]);
  function next() { setPlaying(false); const target = Math.min(step + 1, steps.length - 1); setStep(target); setSelection(steps[target].detail); }
  return <section ref={ref} className="booking-demo" aria-label="Demonstração de agendamento">
    <header><span>Exemplo interativo · não cria reservas</span><button type="button" onClick={() => setPlaying(!playing)} aria-label={playing ? "Pausar demonstração" : "Reproduzir demonstração"}>{playing ? <Pause size={16} /> : <Play size={16} />}</button></header>
    <ol aria-label="Etapas do exemplo">{steps.map((item, index) => <li key={item.title} className={index === step ? "current" : index < step ? "complete" : ""}><span>{index < step ? <Check size={12} /> : index + 1}</span><small>{item.title}</small></li>)}</ol>
    <div className="demo-stage"><span className="demo-step-label">{step + 1} de {steps.length}</span><h3 key={step} aria-live={playing ? "off" : "polite"}>{steps[step].title}</h3>
      {steps[step].options.length ? <div className="demo-options">{steps[step].options.map(option => <button type="button" key={option} aria-pressed={selection === option} onClick={() => { setPlaying(false); setSelection(option); }}>{option}{selection === option && <Check size={16} />}</button>)}</div> : <p>{steps[step].detail}</p>}
      {step === 4 ? <button className="button button-secondary" type="button" onClick={() => { setStep(0); setSelection(steps[0].detail); setPlaying(false); }}><RotateCcw size={16} /> Ver novamente</button> : <button type="button" className="button" onClick={next}>{step === 3 ? "Enviar reserva de exemplo" : "Continuar"}<ArrowRight size={16} /></button>}
    </div>
  </section>;
}
