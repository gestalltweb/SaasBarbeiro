import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, History } from "lucide-react";
import { notFound } from "next/navigation";
import { dateTime, money, requireBusiness } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Histórico do cliente" };

const labels: Record<string, string> = { pending: "Pendente", confirmed: "Confirmado", cancelled: "Cancelado", completed: "Concluído" };

export default async function ClientHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, business } = await requireBusiness();
  const { data: client, error } = await supabase.from("clients").select("id, name, phone, email, created_at, appointments(id, starts_at, status, services(name, price_cents), professionals(name))").eq("business_id", business.id).eq("id", id).maybeSingle();
  if (error) throw new Error("Não foi possível carregar o histórico.");
  if (!client) notFound();
  const appointments = (client.appointments || []).sort((a: { starts_at: string }, b: { starts_at: string }) => b.starts_at.localeCompare(a.starts_at));
  return <div className="dashboard-body operational-page"><Link className="back-link" href="/dashboard/clientes"><ArrowLeft /> Voltar para clientes</Link><header className="client-profile"><span className="avatar-initials large">{client.name.split(" ").map((part: string) => part[0]).join("").slice(0, 2).toUpperCase()}</span><div><h1>{client.name}</h1><p>{client.phone}{client.email ? ` · ${client.email}` : ""}</p></div></header><section className="history-section"><div className="section-heading"><div><h2>Histórico de atendimentos</h2><p>{appointments.length} {appointments.length === 1 ? "registro" : "registros"}</p></div><History /></div>{!appointments.length ? <div className="empty-state compact"><History /><h3>Nenhum atendimento registrado</h3></div> : <div className="history-list">{appointments.map((appointment: { id: string; starts_at: string; status: string; services: { name: string; price_cents: number } | { name: string; price_cents: number }[] | null; professionals: { name: string } | { name: string }[] | null }) => { const service = Array.isArray(appointment.services) ? appointment.services[0] : appointment.services; const professional = Array.isArray(appointment.professionals) ? appointment.professionals[0] : appointment.professionals; return <article key={appointment.id}><time>{dateTime(appointment.starts_at, business.timezone)}</time><div><strong>{service?.name}</strong><span>com {professional?.name}</span></div><strong>{service ? money(service.price_cents) : "—"}</strong><span className={`status-chip ${appointment.status}`}>{labels[appointment.status]}</span></article>; })}</div>}</section></div>;
}
