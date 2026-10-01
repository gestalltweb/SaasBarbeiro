"use client";
/* eslint-disable @next/next/no-img-element */

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { ArrowDown, ArrowUp, Check, ImagePlus, Laptop, LoaderCircle, RotateCcw, Save, Smartphone, Sparkles, Trash2 } from "lucide-react";
import { PublicPageView, type PublicPageBusiness, type PublicPageProfessional, type PublicPageService } from "@/components/public-page-view";
import { applyTemplate, firstPalette, orderForPublic, recommendedTemplates, templateDetails, templatePalettes, type PageMode, type PageSection, type PageTemplate, type PublicPageConfig } from "@/lib/public-page";
import type { BusinessSegment } from "@/lib/service-suggestions";
import { deletePublicPageImage, uploadPublicPageImage } from "@/lib/media-upload";
import { publishPageChanges, restorePageDefault, saveAndPreviewPublicPage, savePublicPageDraft, unpublishPublicPage } from "./actions";

type Props = {
  businessId: string;
  segment: BusinessSegment;
  business: PublicPageBusiness;
  services: PublicPageService[];
  professionals: PublicPageProfessional[];
  initialConfig: PublicPageConfig;
  publishedPaths: string[];
  isPublished: boolean;
  ready: boolean;
  publicUrl: string;
};

const sectionLabels: Record<PageSection, string> = {
  presentation: "Apresentação", services: "Serviços", professionals: "Profissionais", gallery: "Galeria",
  location: "Localização", contact: "Contato", booking: "Agendamento", footer: "Rodapé",
};

function SubmitButton({ children, className = "button", disabled = false }: { children: React.ReactNode; className?: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return <button className={className} type="submit" disabled={pending || disabled}>{pending ? <><LoaderCircle className="spin" /> Salvando...</> : children}</button>;
}

function MediaField({ label, hint, folder, businessId, value, publishedPaths, onChange }: {
  label: string; hint: string; folder: string; businessId: string; value: { url: string; path: string };
  publishedPaths: string[]; onChange: (value: { url: string; path: string }) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true); setError("");
    try { onChange(await uploadPublicPageImage(file, businessId, folder)); }
    catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : "Não foi possível enviar a imagem."); }
    finally { setBusy(false); }
  }
  async function remove() {
    setBusy(true); setError("");
    try {
      if (value.path && !publishedPaths.includes(value.path)) await deletePublicPageImage(value.path);
      onChange({ url: "", path: "" });
    } catch (removeError) { setError(removeError instanceof Error ? removeError.message : "Não foi possível excluir a imagem."); }
    finally { setBusy(false); }
  }
  return <div className="media-field"><div><strong>{label}</strong><small>{hint} JPG, PNG ou WebP, até 5 MB.</small></div>{value.url ? <div className="media-preview"><img src={value.url} alt="Pré-visualização" /><button type="button" onClick={remove} disabled={busy}><Trash2 /> Remover</button></div> : <label className="media-upload"><ImagePlus /> <span>{busy ? "Enviando..." : "Selecionar imagem"}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => upload(event.target.files?.[0])} disabled={busy} /></label>}{error && <p className="field-error" role="alert">{error}</p>}</div>;
}

function GalleryField({ businessId, images, publishedPaths, onChange }: {
  businessId: string; images: PublicPageConfig["media"]["gallery"]; publishedPaths: string[];
  onChange: (images: PublicPageConfig["media"]["gallery"]) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file || images.length >= 12) return;
    setBusy(true); setError("");
    try { const image = await uploadPublicPageImage(file, businessId, "gallery"); onChange([...images, { ...image, alt: "Foto do negócio" }]); }
    catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : "Não foi possível enviar a imagem."); }
    finally { setBusy(false); }
  }
  async function remove(index: number) {
    const image = images[index];
    setBusy(true); setError("");
    try { if (!publishedPaths.includes(image.path)) await deletePublicPageImage(image.path); onChange(images.filter((_, itemIndex) => itemIndex !== index)); }
    catch (removeError) { setError(removeError instanceof Error ? removeError.message : "Não foi possível excluir a imagem."); }
    finally { setBusy(false); }
  }
  return <div className="media-field"><div><strong>Galeria</strong><small>Até 12 imagens. Recomendado: 1200 × 900 px.</small></div>{images.length > 0 && <div className="gallery-editor-grid">{images.map((image, index) => <div key={image.path}><img src={image.url} alt={image.alt} /><button type="button" onClick={() => remove(index)} disabled={busy} aria-label="Remover foto"><Trash2 /></button></div>)}</div>}<label className="media-upload"><ImagePlus /><span>{busy ? "Enviando..." : images.length >= 12 ? "Limite de 12 imagens" : "Adicionar foto à galeria"}</span><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => upload(event.target.files?.[0])} disabled={busy || images.length >= 12} /></label>{error && <p className="field-error" role="alert">{error}</p>}</div>;
}

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function PublicPageEditor(props: Props) {
  const [config, setConfig] = useState(props.initialConfig);
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const recommended = recommendedTemplates(props.segment);
  const configJson = useMemo(() => JSON.stringify(config), [config]);
  const displayedServices = orderForPublic(props.services, config.serviceOrder);
  const displayedProfessionals = orderForPublic(props.professionals, config.professionalOrder);

  function changeMode(mode: PageMode) {
    if (mode === config.mode) return;
    if (!window.confirm("Trocar o caminho altera a aparência do rascunho. Serviços, profissionais, horários, clientes e agendamentos serão preservados. Deseja continuar?")) return;
    setConfig((current) => ({ ...current, mode }));
  }

  function selectTemplate(template: PageTemplate) {
    if (template !== config.template && !window.confirm("O novo modelo substituirá cores, tipografia e formato visual do rascunho. Seus textos e dados operacionais serão mantidos. Continuar?")) return;
    setConfig((current) => applyTemplate(current, template, firstPalette(template)));
  }

  function selectPalette(palette: string) {
    setConfig((current) => applyTemplate(current, current.template, palette));
  }

  function updateContent(key: keyof PublicPageConfig["content"], value: string) { setConfig((current) => ({ ...current, content: { ...current.content, [key]: value } })); }
  function updateContact(key: keyof PublicPageConfig["contact"], value: string) { setConfig((current) => ({ ...current, contact: { ...current.contact, [key]: value } })); }

  const previewBooking = <div className="booking-card preview-booking"><span>Prévia do agendamento</span><strong>Serviço → profissional → data → horário</strong><p>Na página publicada, este bloco usa a disponibilidade real da agenda.</p><button type="button" disabled>Escolher horário</button></div>;

  return <div className="page-studio-layout">
    <aside className="page-editor-panel">
      <div className="studio-mode-switch" aria-label="Modo de configuração"><button type="button" className={config.mode === "manual" ? "active" : ""} onClick={() => changeMode("manual")}>Montar manualmente</button><button type="button" className={config.mode === "template" ? "active" : ""} onClick={() => changeMode("template")}>Página pronta</button></div>

      {config.mode === "template" && <>
        <ol className="studio-progress"><li className="complete"><Check /> Modelo</li><li className="complete"><Check /> Paleta</li><li className="active">Marca</li><li>Visualizar</li><li>Publicar</li></ol>
        {recommended.length > 0 && <section className="recommended-template"><div><Sparkles /><span><strong>Modelo recomendado para o seu segmento</strong><small>{recommended.map((item) => templateDetails[item].name).join(" ou ")}</small></span></div><button type="button" onClick={() => selectTemplate(recommended[0])}>Usar modelo recomendado</button></section>}
        <section className="editor-group"><header><h2>Escolha o modelo</h2><p>Estruturas diferentes para posicionar seu negócio.</p></header><div className="template-picker">{(Object.keys(templateDetails) as PageTemplate[]).map((template) => <button type="button" className={config.template === template ? "selected" : ""} onClick={() => selectTemplate(template)} key={template}><span className={`template-miniature miniature-${template}`}><i /><b /><em /></span><strong>{templateDetails[template].name}</strong><small>{templateDetails[template].description}</small>{recommended.includes(template) && <mark>Recomendado</mark>}</button>)}</div></section>
        <section className="editor-group"><header><h2>Paleta</h2><p>Escolha visualmente uma combinação testada.</p></header><div className="palette-picker">{Object.entries(templatePalettes[config.template]).map(([key, palette]) => <button type="button" className={config.palette === key ? "selected" : ""} onClick={() => selectPalette(key)} key={key}><span><i style={{ background: palette.primary }} /><i style={{ background: palette.secondary }} /><i style={{ background: palette.button }} /></span><strong>{palette.name}</strong></button>)}</div></section>
      </>}

      <section className="editor-group"><header><h2>Marca e imagens</h2><p>Imagens são comprimidas antes do envio quando necessário.</p></header><MediaField label="Logo" hint="Recomendado: quadrado, 600 × 600 px." folder="logo" businessId={props.businessId} value={{ url: config.media.logoUrl, path: config.media.logoPath }} publishedPaths={props.publishedPaths} onChange={(image) => setConfig((current) => ({ ...current, media: { ...current.media, logoUrl: image.url, logoPath: image.path } }))} /><MediaField label="Imagem de capa" hint="Recomendado: horizontal, 1800 × 1000 px." folder="cover" businessId={props.businessId} value={{ url: config.media.coverUrl, path: config.media.coverPath }} publishedPaths={props.publishedPaths} onChange={(image) => setConfig((current) => ({ ...current, media: { ...current.media, coverUrl: image.url, coverPath: image.path } }))} /><MediaField label="Imagem de compartilhamento" hint="Recomendado: 1200 × 630 px." folder="sharing" businessId={props.businessId} value={{ url: config.media.shareUrl, path: config.media.sharePath }} publishedPaths={props.publishedPaths} onChange={(image) => setConfig((current) => ({ ...current, media: { ...current.media, shareUrl: image.url, sharePath: image.path } }))} /><GalleryField businessId={props.businessId} images={config.media.gallery} publishedPaths={props.publishedPaths} onChange={(gallery) => setConfig((current) => ({ ...current, media: { ...current.media, gallery } }))} /></section>

      {props.professionals.length > 0 && <section className="editor-group"><header><h2>Fotos dos profissionais</h2><p>Opcional. Sem foto, o modelo usa um monograma.</p></header>{props.professionals.map((professional) => { const photo = config.media.professionalPhotos[professional.id] || { url: "", path: "" }; return <MediaField key={professional.id} label={professional.name} hint="Recomendado: retrato, 900 × 1200 px." folder={`professionals/${professional.id}`} businessId={props.businessId} value={photo} publishedPaths={props.publishedPaths} onChange={(image) => setConfig((current) => ({ ...current, media: { ...current.media, professionalPhotos: { ...current.media.professionalPhotos, [professional.id]: image } } }))} />; })}</section>}

      <section className="editor-group"><header><h2>Conteúdo</h2><p>Textos compatíveis com todos os modelos.</p></header><div className="field"><label htmlFor="page-business-name">Nome do negócio na página</label><input id="page-business-name" value={config.content.businessName} maxLength={100} onChange={(event) => updateContent("businessName", event.target.value)} /></div><div className="field"><label htmlFor="hero-title">Título principal</label><input id="hero-title" value={config.content.heroTitle} maxLength={120} onChange={(event) => updateContent("heroTitle", event.target.value)} /></div><div className="field"><label htmlFor="hero-subtitle">Subtítulo</label><textarea id="hero-subtitle" value={config.content.heroSubtitle} maxLength={240} onChange={(event) => updateContent("heroSubtitle", event.target.value)} /></div><div className="field"><label htmlFor="intro">Apresentação</label><textarea id="intro" value={config.content.introduction} maxLength={800} onChange={(event) => updateContent("introduction", event.target.value)} /></div><div className="field"><label htmlFor="button-text">Texto do botão principal</label><input id="button-text" value={config.content.primaryButton} maxLength={40} onChange={(event) => updateContent("primaryButton", event.target.value)} /></div><div className="field"><label htmlFor="booking-notice">Aviso antes do agendamento</label><textarea id="booking-notice" value={config.content.bookingNotice} maxLength={300} onChange={(event) => updateContent("bookingNotice", event.target.value)} /></div><div className="field"><label htmlFor="footer-text">Texto do rodapé</label><input id="footer-text" value={config.content.footerText} maxLength={240} onChange={(event) => updateContent("footerText", event.target.value)} /></div></section>

      <section className="editor-group"><header><h2>Contato e localização</h2><p>Dados exibidos nesta página.</p></header><div className="field"><label htmlFor="page-whatsapp">WhatsApp</label><input id="page-whatsapp" value={config.contact.whatsapp} maxLength={24} onChange={(event) => updateContact("whatsapp", event.target.value)} /></div><div className="field"><label htmlFor="page-instagram">Instagram</label><input id="page-instagram" value={config.contact.instagram} maxLength={80} onChange={(event) => updateContact("instagram", event.target.value)} /></div><div className="field"><label htmlFor="page-address">Endereço</label><input id="page-address" value={config.contact.address} maxLength={240} onChange={(event) => updateContact("address", event.target.value)} /></div></section>

      {config.mode === "manual" && <section className="editor-group"><header><h2>Aparência manual</h2><p>Opções seguras, sem código personalizado.</p></header><div className="form-grid three"><div className="field color-field"><label htmlFor="primary-color">Principal</label><input id="primary-color" type="color" value={config.colors.primary} onChange={(event) => setConfig((current) => ({ ...current, colors: { ...current.colors, primary: event.target.value } }))} /></div><div className="field color-field"><label htmlFor="secondary-color">Secundária</label><input id="secondary-color" type="color" value={config.colors.secondary} onChange={(event) => setConfig((current) => ({ ...current, colors: { ...current.colors, secondary: event.target.value } }))} /></div><div className="field color-field"><label htmlFor="button-color">Botões</label><input id="button-color" type="color" value={config.colors.button} onChange={(event) => setConfig((current) => ({ ...current, colors: { ...current.colors, button: event.target.value } }))} /></div></div><div className="form-grid two"><div className="field"><label htmlFor="theme">Tema</label><select id="theme" value={config.theme} onChange={(event) => setConfig((current) => ({ ...current, theme: event.target.value as PublicPageConfig["theme"] }))}><option value="light">Claro</option><option value="dark">Escuro</option></select></div><div className="field"><label htmlFor="font">Tipografia</label><select id="font" value={config.font} onChange={(event) => setConfig((current) => ({ ...current, font: event.target.value as PublicPageConfig["font"] }))}><option value="editorial">Editorial</option><option value="modern">Moderna</option><option value="classic">Clássica</option></select></div><div className="field"><label htmlFor="buttons">Botões</label><select id="buttons" value={config.buttonShape} onChange={(event) => setConfig((current) => ({ ...current, buttonShape: event.target.value as PublicPageConfig["buttonShape"] }))}><option value="soft">Cantos suaves</option><option value="square">Retos</option><option value="pill">Arredondados</option></select></div><div className="field"><label htmlFor="cards">Cartões</label><select id="cards" value={config.cardStyle} onChange={(event) => setConfig((current) => ({ ...current, cardStyle: event.target.value as PublicPageConfig["cardStyle"] }))}><option value="flat">Planos</option><option value="bordered">Com borda</option><option value="elevated">Elevados</option></select></div></div></section>}

      <section className="editor-group"><header><h2>Seções</h2><p>Ative e reorganize a apresentação pública.</p></header><div className="reorder-list">{config.sections.map((section, index) => <div key={section.id}><label><input type="checkbox" checked={section.visible} onChange={(event) => setConfig((current) => ({ ...current, sections: current.sections.map((item) => item.id === section.id ? { ...item, visible: event.target.checked } : item) }))} /><span>{sectionLabels[section.id]}</span></label><span><button type="button" onClick={() => setConfig((current) => ({ ...current, sections: moveItem(current.sections, index, -1) }))} disabled={index === 0} aria-label={`Mover ${sectionLabels[section.id]} para cima`}><ArrowUp /></button><button type="button" onClick={() => setConfig((current) => ({ ...current, sections: moveItem(current.sections, index, 1) }))} disabled={index === config.sections.length - 1} aria-label={`Mover ${sectionLabels[section.id]} para baixo`}><ArrowDown /></button></span></div>)}</div></section>

      <section className="editor-group"><header><h2>Ordem de apresentação</h2><p>A ordem operacional permanece inalterada.</p></header><strong className="subgroup-title">Serviços</strong><div className="compact-order">{displayedServices.map((service, index) => <div key={service.id}><span>{service.name}</span><button type="button" onClick={() => setConfig((current) => ({ ...current, serviceOrder: moveItem(displayedServices.map((item) => item.id), index, -1) }))} disabled={index === 0}><ArrowUp /></button><button type="button" onClick={() => setConfig((current) => ({ ...current, serviceOrder: moveItem(displayedServices.map((item) => item.id), index, 1) }))} disabled={index === displayedServices.length - 1}><ArrowDown /></button></div>)}</div><strong className="subgroup-title">Profissionais</strong><div className="compact-order">{displayedProfessionals.map((professional, index) => <div key={professional.id}><span>{professional.name}</span><button type="button" onClick={() => setConfig((current) => ({ ...current, professionalOrder: moveItem(displayedProfessionals.map((item) => item.id), index, -1) }))} disabled={index === 0}><ArrowUp /></button><button type="button" onClick={() => setConfig((current) => ({ ...current, professionalOrder: moveItem(displayedProfessionals.map((item) => item.id), index, 1) }))} disabled={index === displayedProfessionals.length - 1}><ArrowDown /></button></div>)}</div></section>

      <section className="editor-group"><header><h2>Google</h2><p>Título e descrição da versão publicada.</p></header><div className="field"><label htmlFor="seo-title">Título para o Google</label><input id="seo-title" value={config.content.seoTitle} maxLength={70} onChange={(event) => updateContent("seoTitle", event.target.value)} /></div><div className="field"><label htmlFor="seo-description">Descrição para o Google</label><textarea id="seo-description" value={config.content.seoDescription} maxLength={170} onChange={(event) => updateContent("seoDescription", event.target.value)} /></div></section>

      <div className="studio-actions">
        <form action={savePublicPageDraft}><input type="hidden" name="config" value={configJson} /><SubmitButton><Save /> Salvar rascunho</SubmitButton></form>
        <form action={saveAndPreviewPublicPage}><input type="hidden" name="config" value={configJson} /><SubmitButton className="button button-secondary">Visualizar página completa</SubmitButton></form>
        <form action={publishPageChanges} onSubmit={(event) => { if (!window.confirm(props.isPublished ? "Esta ação substituirá a configuração publicada atualmente. Deseja publicar o rascunho?" : "Deseja publicar esta página para seus clientes?")) event.preventDefault(); }}><input type="hidden" name="config" value={configJson} /><SubmitButton className="button publish-button" disabled={!props.ready}>Publicar alterações</SubmitButton></form>
        {!props.ready && <p>Para publicar, cadastre ao menos um serviço, um profissional e os horários necessários.</p>}
        <button className="text-button" type="button" onClick={() => { if (window.confirm("Descartar as alterações feitas desde o último salvamento?")) setConfig(props.initialConfig); }}>Descartar alterações</button>
        <form action={restorePageDefault} onSubmit={(event) => { if (!window.confirm("Restaurar apenas a aparência e os textos padrão? Serviços, profissionais e agenda não serão alterados.")) event.preventDefault(); }}><input type="hidden" name="config" value={configJson} /><button className="text-button" type="submit"><RotateCcw /> Restaurar modelo padrão</button></form>
        {props.isPublished && <><Link className="public-link" href={props.publicUrl} target="_blank">Abrir página publicada</Link><form action={unpublishPublicPage} onSubmit={(event) => { if (!window.confirm("Retirar a página do ar? A última versão e o rascunho serão preservados.")) event.preventDefault(); }}><button className="text-button danger" type="submit">Despublicar página</button></form></>}
      </div>
    </aside>

    <section className="studio-preview-panel"><header><div><strong>Prévia em tempo real</strong><span>Mesmos componentes da página publicada</span></div><div><button type="button" className={viewport === "mobile" ? "active" : ""} onClick={() => setViewport("mobile")}><Smartphone /> Celular</button><button type="button" className={viewport === "desktop" ? "active" : ""} onClick={() => setViewport("desktop")}><Laptop /> Computador</button></div></header><div className={`studio-preview-frame ${viewport}`}><PublicPageView business={props.business} services={props.services} professionals={props.professionals} config={config} booking={previewBooking} preview /></div></section>
  </div>;
}
