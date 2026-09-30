import Link from "next/link";
import { ExternalLink, LogOut, Settings } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { DashboardNav, MobileDashboardNav } from "@/components/dashboard-nav";
import { brand } from "@/lib/brand";
import { requireBusiness } from "@/lib/dashboard";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { business } = await requireBusiness();
  return <main className="app-shell">
    <aside className="app-sidebar">
      <Link className="brand" href="/"><span className="brand-mark">A</span><span>{brand.name}</span></Link>
      <DashboardNav />
      <div className="sidebar-bottom">
        <Link href="/dashboard/configuracoes"><Settings /> <span>Configurações</span></Link>
        <form action={signOut}><button type="submit"><LogOut /> <span>Sair</span></button></form>
      </div>
    </aside>
    <section className="app-main">
      <header className="app-topbar"><div><small>Seu negócio</small><strong>{business.name}</strong></div><Link href={`/${business.slug}`} target="_blank">Ver página <ExternalLink size={15} /></Link></header>
      {children}
    </section>
    <MobileDashboardNav />
  </main>;
}
