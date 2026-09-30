import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Search, Users } from "lucide-react";
import { dateTime, requireBusiness } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Clientes" };

export default async function ClientsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { supabase, business } = await requireBusiness();
  const params = await searchParams;
  const search = typeof params.busca === "string" ? params.busca.trim() : "";
  let query = supabase.from("clients").select("id, name, phone, email, created_at, appointments(id, starts_at, status)").eq("business_id", business.id).order("name").limit(300);
  if (search) query = query.or(`name.ilike.%${search.replace(/[,%]/g, "")}%,phone.ilike.%${search.replace(/[,%]/g, "")}%`);
  const { data: clients, error } = await query;
  if (error) throw new Error("Não foi possível carregar os clientes.");

  return <div className="dashboard-body operational-page">
    <header className="page-title"><div><h1>Clientes</h1><p>A lista é criada automaticamente a partir dos agendamentos recebidos.</p></div></header>
    <form className="search-bar" method="get"><Search /><input name="busca" defaultValue={search} placeholder="Buscar por nome ou telefone" aria-label="Buscar clientes" /><button className="button button-small" type="submit">Buscar</button></form>
    <section className="client-directory"><div className="section-heading"><div><h2>{clients?.length || 0} {clients?.length === 1 ? "cliente" : "clientes"}</h2><p>{search ? `Resultados para “${search}”` : "Histórico consolidado do seu negócio"}</p></div><Users /></div>
      {!clients?.length ? <div className="empty-state"><Users /><h3>{search ? "Nenhum cliente encontrado" : "Seus clientes aparecerão aqui"}</h3><p>{search ? "Tente buscar por outro nome ou telefone." : "A primeira reserva pública criará o cadastro automaticamente."}</p></div> : <div className="client-list">{clients.map((client) => {
        const appointments = (client.appointments || []).sort((a: { starts_at: string }, b: { starts_at: string }) => b.starts_at.localeCompare(a.starts_at));
        return <Link href={`/dashboard/clientes/${client.id}`} className="client-row" key={client.id}><span className="avatar-initials">{client.name.split(" ").map((part: string) => part[0]).join("").slice(0, 2).toUpperCase()}</span><span><strong>{client.name}</strong><small>{client.phone}{client.email ? ` · ${client.email}` : ""}</small></span><span><strong>{appointments.length}</strong><small>{appointments.length === 1 ? "atendimento" : "atendimentos"}</small></span><span><small>Último contato</small><strong>{appointments[0] ? dateTime(appointments[0].starts_at, business.timezone) : "—"}</strong></span><ChevronRight /></Link>;
      })}</div>}
    </section>
  </div>;
}
