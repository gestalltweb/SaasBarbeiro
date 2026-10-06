"use client";

import Link from "next/link";
import { Check, ChevronRight, X } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { updateTutorialPreference } from "@/app/dashboard/tutorial-actions";

export type TutorialStep = { id: string; title: string; description: string; href: string; complete?: boolean; action?: string };

export function DashboardTutorial({ steps, initialAcknowledged }: { steps: TutorialStep[]; initialAcknowledged: string[] }) {
  const [acknowledged, setAcknowledged] = useState(initialAcknowledged);
  const [dismissConfirm, setDismissConfirm] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [pending, startTransition] = useTransition();
  const resolved = useMemo(() => steps.map((step) => ({ ...step, complete: Boolean(step.complete || acknowledged.includes(step.id)) })), [acknowledged, steps]);
  const completeCount = resolved.filter((step) => step.complete).length;
  const current = resolved.find((step) => !step.complete) || resolved.at(-1)!;
  const save = (payload: { acknowledgedSteps?: string[]; dismissed?: boolean; completed?: boolean }) => startTransition(async () => {
    const result = await updateTutorialPreference(payload);
    if (result.ok && (payload.dismissed || payload.completed)) setHidden(true);
  });
  if (hidden) return null;
  const allDone = completeCount === resolved.length;
  return <section className="dashboard-tutorial" aria-labelledby="tutorial-title">
    <button className="tutorial-dismiss" type="button" aria-label="Dispensar tutorial" onClick={() => setDismissConfirm(true)}><X /></button>
    <span>Conheça seu painel</span><h2 id="tutorial-title">{allDone ? "Tudo pronto para você começar." : current.title}</h2><p>{allDone ? "Você já conhece as áreas principais do Agenda Local." : current.description}</p>
    <div className="tutorial-progress" aria-label={`${completeCount} de ${resolved.length} etapas concluídas`}><i style={{ width: `${(completeCount / resolved.length) * 100}%` }} /><small>{completeCount} de {resolved.length} etapas</small></div>
    {!allDone && <div className="tutorial-actions"><Link className="button button-secondary" href={current.href}>{current.action || "Abrir área"} <ChevronRight size={16} /></Link>{!current.complete && <button className="text-button" type="button" disabled={pending} onClick={() => { const next = [...acknowledged, current.id]; setAcknowledged(next); save({ acknowledgedSteps: next }); }}>Entendi <Check size={15} /></button>}</div>}
    {allDone && <button className="button" type="button" disabled={pending} onClick={() => save({ completed: true })}>Concluir tutorial <Check size={16} /></button>}
    {dismissConfirm && <div className="tutorial-confirm" role="alertdialog" aria-label="Dispensar tutorial"><p>Deseja ocultar o tutorial? Você poderá reativá-lo em Configurações.</p><div><button className="text-button" type="button" onClick={() => setDismissConfirm(false)}>Cancelar</button><button className="button" type="button" disabled={pending} onClick={() => save({ dismissed: true })}>Ocultar tutorial</button></div></div>}
  </section>;
}
