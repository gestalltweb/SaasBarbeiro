import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { signUp } from "@/app/auth/actions";

export const metadata: Metadata = { title: "Criar conta" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const error = typeof params.erro === "string" ? params.erro : null;

  return (
    <AuthShell>
      <div className="auth-card">
        <h2>Comece sua página</h2>
        <p>Primeiro, crie seu acesso. Depois vamos montar o negócio passo a passo.</p>
        {error && <p className="form-message" role="alert">{error}</p>}
        <form className="form-stack" action={signUp}>
          <div className="field"><label htmlFor="name">Seu nome</label><input id="name" name="name" autoComplete="name" placeholder="Como podemos chamar você?" required /></div>
          <div className="field"><label htmlFor="email">E-mail profissional</label><input id="email" name="email" type="email" autoComplete="email" placeholder="voce@negocio.com" required /></div>
          <div className="field"><label htmlFor="password">Crie uma senha</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={8} aria-describedby="password-help" required /><small id="password-help">Use pelo menos 8 caracteres.</small></div>
          <button className="button" type="submit">Criar minha conta</button>
          <p className="fine-print">Ao continuar, você concorda em usar a plataforma de forma responsável. Termos e política de privacidade serão publicados antes do lançamento.</p>
        </form>
        <p className="auth-switch">Já tem conta? <Link href="/entrar">Entrar</Link></p>
      </div>
    </AuthShell>
  );
}
