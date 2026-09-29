import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { signIn } from "@/app/auth/actions";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const error = typeof params.erro === "string" ? params.erro : null;
  const message = typeof params.mensagem === "string" ? params.mensagem : null;
  const config = params.config === "pendente";

  return (
    <AuthShell>
      <div className="auth-card">
        <h2>Entre na sua agenda</h2>
        <p>Acesse o painel para cuidar do seu negócio.</p>
        {error && <p className="form-message" role="alert">{error}</p>}
        {(message || config) && <p className="form-message info">{message || "Configure as variáveis do Supabase para ativar o acesso."}</p>}
        <form className="form-stack" action={signIn}>
          <div className="field"><label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" placeholder="voce@negocio.com" required /></div>
          <div className="field"><label htmlFor="password">Senha</label><input id="password" name="password" type="password" autoComplete="current-password" minLength={8} required /></div>
          <button className="button" type="submit">Entrar no painel</button>
        </form>
        <p className="auth-switch">Ainda não tem conta? <Link href="/cadastro">Comece agora</Link></p>
      </div>
    </AuthShell>
  );
}
