"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Pause, Play, RotateCcw } from "lucide-react";

const steps = [
  { title: "Abrir o link", detail: "A página mostra serviços, equipe e horários reais do negócio.", options: ["Página do negócio"] },
  { title: "Escolher atendimento", detail: "Serviço e profissional", options: ["Atendimento individual", "Sessão personalizada"] },
  { title: "Escolher horário", detail: "Horário disponível", options: ["09:00", "10:00", "11:30"] },
  { title: "Reserva recebida", detail: "A reserva entra como pendente na agenda. O negócio pode confirmar, cancelar ou concluir o atendimento.", options: [] },
];

export function BookingDemo() {
  const ref = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const [selection, setSelection] = useState(steps[0].options[0]);
  const playingRef = useRef(playing);
  const resumeAfterVisibility = useRef(false);

  useEffect(() => { playingRef.current = playing; }, [playing]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05, rootMargin: "0px 0px 12% 0px" });
    if (ref.current) observer.observe(ref.current);
    const hide = () => {
      if (document.hidden) {
        resumeAfterVisibility.current = playingRef.current;
        setPlaying(false);
      } else if (resumeAfterVisibility.current) {
        resumeAfterVisibility.current = false;
        setPlaying(true);
      }
    };
    document.addEventListener("visibilitychange", hide);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", hide); };
  }, []);

  useEffect(() => {
    if (!playing || !visible || step === steps.length - 1 || document.hidden || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => {
      const target = step + 1;
      setStep(target);
      setSelection(steps[target].options[0] ?? "");
    }, 2800);
    return () => window.clearTimeout(timer);
  }, [step, playing, visible]);

  function move(target: number) {
    const nextStep = Math.max(0, Math.min(target, steps.length - 1));
    setPlaying(false);
    setStep(nextStep);
    setSelection(steps[nextStep].options[0] ?? "");
  }

  function restart() {
    setStep(0);
    setSelection(steps[0].options[0]);
    setPlaying(false);
  }

  return <section ref={ref} className="booking-demo" aria-label="Demonstração de como o cliente agenda">
    <header>
      <span>Exemplo interativo · não cria reservas</span>
      <button type="button" onClick={() => setPlaying(!playing)} aria-label={playing ? "Pausar demonstração" : "Reproduzir demonstração"}>{playing ? <Pause size={16} /> : <Play size={16} />}</button>
    </header>
    <ol aria-label="Etapas do exemplo">{steps.map((item, index) => <li key={item.title} className={index === step ? "current" : index < step ? "complete" : ""}><span>{index < step ? <Check size={12} /> : index + 1}</span><small>{item.title}</small></li>)}</ol>
    <div className="demo-stage">
      <span className="demo-step-label">{step + 1} de {steps.length}</span>
      <h3 key={step} aria-live={playing ? "off" : "polite"}>{steps[step].title}</h3>
      {steps[step].options.length ? <div className="demo-options">{steps[step].options.map(option => <button type="button" key={option} aria-pressed={selection === option} onClick={() => { setPlaying(false); setSelection(option); }}>{option}{selection === option && <Check size={16} />}</button>)}</div> : <div className="demo-result"><span><Check size={18} /></span><p>{steps[step].detail}</p></div>}
      <div className="demo-controls">
        {step > 0 && <button type="button" className="button button-secondary" onClick={() => move(step - 1)}><ArrowLeft size={16} /> Voltar</button>}
        {step === steps.length - 1 ? <button className="button" type="button" onClick={restart}><RotateCcw size={16} /> Ver novamente</button> : <button type="button" className="button" onClick={() => move(step + 1)}>{step === 2 ? "Enviar reserva de exemplo" : "Avançar"}<ArrowRight size={16} /></button>}
      </div>
    </div>
  </section>;
}
