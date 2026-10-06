"use client";

import { Check, Copy, ExternalLink, Share2 } from "lucide-react";
import { useState } from "react";

export function PublicLinkShare({ url }: { url: string }) {
  const [message, setMessage] = useState<string | null>(null);
  const copy = async () => {
    try { await navigator.clipboard.writeText(url); setMessage("Link copiado."); }
    catch { setMessage("Não foi possível copiar. Selecione o endereço e copie manualmente."); }
  };
  const share = async () => { try { await navigator.share({ url, title: "Minha página no Agenda Local" }); } catch { /* user cancellation needs no message */ } };
  return <section className="share-public-link" aria-labelledby="share-public-link-title"><div><span>Compartilhe sua página</span><h2 id="share-public-link-title">Seu endereço já está pronto para divulgar.</h2><p>Copie o link e escolha onde quer compartilhá-lo.</p></div><code>{url}</code><div className="share-public-link-actions"><button className="button" type="button" onClick={copy}><Copy size={16} /> Copiar link</button><a className="button button-secondary" href={url} target="_blank" rel="noreferrer"><ExternalLink size={16} /> Abrir página publicada</a>{typeof navigator !== "undefined" && "share" in navigator && <button className="text-button" type="button" onClick={share}><Share2 size={16} /> Compartilhar</button>}</div>{message && <p className="share-feedback" role="status"><Check size={15} /> {message}</p>}</section>;
}
