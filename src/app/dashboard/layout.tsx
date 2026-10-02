import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { signOut } from "@/app/auth/actions";
import { DashboardNav, MobileDashboardNav } from "@/components/dashboard-nav";
import { DashboardTopbar } from "@/components/dashboard-topbar";
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
      <DashboardTopbar businessName={business.name} slug={business.slug} isPublished={business.is_published} />
      {children}
    </section>
    <MobileDashboardNav />
  </main>;
}
