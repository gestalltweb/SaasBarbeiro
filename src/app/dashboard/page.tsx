import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Clock3, ExternalLink, LayoutDashboard, LogOut, Scissors, Settings, UserRound, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { brand } from "@/lib/brand";
import { signOut } from "@/app/auth/actions";

export const metadata: Metadata = { title: "Painel" };

export default async function DashboardPage() {
  const { supabase, user } = await requireUser();
  const { data: membership } = await supabase.from("business_members").select("role, businesses(id, name, slug, is_published)").eq("user_id", user.id).limit(1).maybeSingle();
  if (!membership?.businesses) redirect("/onboarding");

  const business = Array.isArray(membership.businesses) ? membership.businesses[0] : membership.businesses;
  const firstName = String(user.user_metadata.full_name || "").split(" ")[0] || "por aqui";

  return (
    <main className="app-shell">
      <aside className="app-sidebar">
        <Link className="brand" href="/"><span className="brand-mark">A</span><span>{brand.name}</span></Link>
        <nav aria-label="Menu do painel"><Link className="active" href="/dashboard"><LayoutDashboard /> Visão geral</Link><span><CalendarDays /> Agenda <small>Em breve</small></span><span><Users /> Clientes <small>Em breve</small></span><span><Scissors /> Serviços <small>Em breve</small></span><span><UserRound /> Profissionais <small>Em breve</small></span><span><Clock3 /> Horários <small>Em breve</small></span></nav>
        <div className="sidebar-bottom"><Link href="/dashboard"><Settings /> Configurações</Link><form action={signOut}><button type="submit"><LogOut /> Sair</button></form></div>
      </aside>
      <section className="app-main">
        <header className="app-topbar"><div><small>Seu negócio</small><strong>{business.name}</strong></div><Link href={`/${business.slug}`} target="_blank">Ver página <ExternalLink size={15} /></Link></header>
        <div className="dashboard-body"><div className="welcome-row"><div><p>Olá, {firstName}</p><h1>Vamos colocar sua agenda para trabalhar.</h1></div><span className={business.is_published ? "status-live" : "status-draft"}>{business.is_published ? "Página publicada" : "Página em rascunho"}</span></div>
          <section className="activation-panel"><div><span>Próximo passo</span><h2>Complete sua página e publique seu link.</h2><p>A estrutura do negócio já está protegida. Agora você poderá cadastrar serviços, equipe e horários nas próximas etapas.</p></div><div className="activation-progress"><strong>1 de 4</strong><div><i /></div><small>Negócio criado</small></div></section>
          <section className="dashboard-grid"><article><CalendarDays /><span>Agendamentos hoje</span><strong>—</strong><small>Disponível após configurar a agenda</small></article><article><Clock3 /><span>Próximo horário</span><strong>—</strong><small>Nenhum horário cadastrado</small></article><article><Users /><span>Clientes</span><strong>0</strong><small>Seus clientes aparecerão aqui</small></article></section>
          <section className="empty-agenda"><div className="empty-calendar"><span>29</span></div><div><h2>Sua agenda começa vazia — por enquanto.</h2><p>Na próxima etapa, vamos cadastrar os serviços, profissionais e horários que seus clientes poderão escolher.</p></div></section>
        </div>
      </section>
    </main>
  );
}
