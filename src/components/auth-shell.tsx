import Link from "next/link";
import { CalendarCheck, Link2 } from "lucide-react";
import { brand } from "@/lib/brand";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <section className="auth-brand-panel">
        <Link className="brand" href="/"><span className="brand-mark">A</span><span>{brand.name}</span></Link>
        <div className="auth-quote"><h1>Sua página pronta para receber o próximo horário.</h1><p>Crie a presença digital do seu negócio e deixe seus clientes agendarem no momento em que decidirem.</p></div>
        <div className="auth-agenda"><span><Link2 size={15} /> Link exclusivo</span><span><CalendarCheck size={15} /> Agenda organizada</span></div>
      </section>
      <section className="auth-form-panel">{children}</section>
    </main>
  );
}
