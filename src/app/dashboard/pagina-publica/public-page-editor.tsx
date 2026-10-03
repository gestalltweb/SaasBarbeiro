"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { SubmitButton } from "@/components/submit-button";
import { createDraftSaveQueue } from "@/lib/draft-save-queue";
import Link from "next/link";
import { ArrowDown, ArrowUp, Check, Eye, FileText, Image as ImageIcon, ImagePlus, Laptop, Palette, Plus, RotateCcw, Save, SlidersHorizontal, Smartphone, Sparkles, Tablet, Trash2 } from "lucide-react";
import { PublicPageView, type PublicPageBusiness, type PublicPageBusinessHour, type PublicPageProfessional, type PublicPageService } from "@/components/public-page-view";
import { applyTemplate, orderForPublic, recommendedTemplates, templateDetails, templatePreviewAssets, templatesForSegment, type PageMode, type PageSection, type PageTemplate, type PublicPageConfig } from "@/lib/public-page";
import type { BusinessSegment } from "@/lib/service-suggestions";
import { deletePublicPageImage, uploadPublicPageImage, uploadPublicPageMedia } from "@/lib/media-upload";
import { autoSavePublicPageDraft, publishPageChanges, restorePageDefault, saveAndPreviewPublicPage, savePublicPageDraft, setTemplateChangeNoticeDismissed, unpublishPublicPage } from "./actions";

type Props = {
  businessId: string;
  segment: BusinessSegment;
  business: PublicPageBusiness;
  services: PublicPageService[];
  professionals: PublicPageProfessional[];
  businessHours: PublicPageBusinessHour[];
  initialConfig: PublicPageConfig;
  publishedConfig: PublicPageConfig | null;
  publishedPaths: string[];
  isPublished: boolean;
  ready: boolean;
  publicUrl: string;
  dismissTemplateChangeNotice: boolean;
};

const sectionLabels: Record<PageSection, string> = {
  hero: "Hero", positioning: "Posicionamento", services: "Serviços", story: "História", differentials: "Diferenciais",
  process: "Processo", professionals: "Profissionais", testimonials: "Depoimentos", faq: "Perguntas frequentes", gallery: "Galeria",
  booking: "Agendamento", businessHours: "Horários", location: "Localização", instagram: "Instagram", footer: "Rodapé",
};

function MediaField({ label, hint, folder, businessId, value, publishedPaths, onChange, allowVideo = false }: {
  label: string; hint: string; folder: string; businessId: string; value: { url: string; path: string; type?: "image" | "video" };
  publishedPaths: string[]; allowVideo?: boolean; onChange: (value: { url: string; path: string; type: "image" | "video" }) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true); setError("");
    try { onChange(await uploadPublicPageMedia(file, businessId, folder, allowVideo)); }
    catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : "Não foi possível enviar a imagem."); }
    finally { setBusy(false); }
  }
  async function remove() {
    setBusy(true); setError("");
    try {
      if (value.path && !publishedPaths.includes(value.path)) await deletePublicPageImage(value.path);
      onChange({ url: "", path: "", type: "image" });
    } catch (removeError) { setError(removeError instanceof Error ? removeError.message : "Não foi possível excluir a imagem."); }
    finally { setBusy(false); }
  }
  return <div className="media-field"><div><strong>{label}</strong><small>{hint} {allowVideo ? "JPG, PNG, WebP, MP4 ou WebM." : "JPG, PNG ou WebP, até 5 MB."}</small></div>{value.url ? <div className="media-preview">{value.type === "video" ? <video src={value.url} muted controls preload="metadata" /> : <img src={value.url} alt="Pré-visualização" />}<button type="button" onClick={remove} disabled={busy}><Trash2 /> Remover</button></div> : <label className="media-upload"><ImagePlus /> <span>{busy ? "Enviando..." : allowVideo ? "Selecionar imagem ou vídeo" : "Selecionar imagem"}</span><input type="file" accept={allowVideo ? "image/jpeg,image/png,image/webp,video/mp4,video/webm" : "image/jpeg,image/png,image/webp"} onChange={(event) => upload(event.target.files?.[0])} disabled={busy} /></label>}{error && <p className="field-error" role="alert">{error}</p>}</div>;
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
  const [activeTab, setActiveTab] = useState<"design" | "media" | "content" | "sections">("design");
  const [viewport, setViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [autoSaveStatus, setAutoSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const [savedConfigJson, setSavedConfigJson] = useState(() => JSON.stringify(props.initialConfig));
  const [isAutoSaving, startAutoSave] = useTransition();
  const [pendingTemplate, setPendingTemplate] = useState<PageTemplate | null>(null);
  const [dismissTemplateNotice, setDismissTemplateNotice] = useState(props.dismissTemplateChangeNotice);
  const initialRender = useRef(true);
  const saveQueue = useRef(createDraftSaveQueue());
  const autoSaveTimer = useRef<number | undefined>(undefined);
  const openingPreview = useRef(false);
  const recommended = recommendedTemplates(props.segment);
  const configJson = useMemo(() => JSON.stringify(config), [config]);
  const hasUnpublishedChanges = !props.publishedConfig || JSON.stringify(config) !== JSON.stringify(props.publishedConfig);
  const displayedServices = orderForPublic(props.services, config.serviceOrder);
  const displayedProfessionals = orderForPublic(props.professionals, config.professionalOrder);

  useEffect(() => {
    if (initialRender.current) { initialRender.current = false; return; }
    if (openingPreview.current) return;
    let current = true;
    autoSaveTimer.current = window.setTimeout(() => startAutoSave(async () => {
      setAutoSaveStatus("saving");
      const result = await saveQueue.current(() => autoSavePublicPageDraft(configJson));
      if (current) {
        setAutoSaveStatus(result.ok ? "saved" : "error");
        if (result.ok) setSavedConfigJson(configJson);
      }
    }), 1400);
    return () => { current = false; window.clearTimeout(autoSaveTimer.current); };
  }, [configJson]);

  async function openDraftPreview(formData: FormData) {
    openingPreview.current = true;
    window.clearTimeout(autoSaveTimer.current);
    try { await saveQueue.current(() => saveAndPreviewPublicPage(formData)); }
    finally { openingPreview.current = false; }
  }

  function changeMode(mode: PageMode) {
    if (mode === config.mode) return;
    if (!window.confirm("Trocar o caminho altera a aparência do rascunho. Serviços, profissionais, horários, clientes e agendamentos serão preservados. Deseja continuar?")) return;
    setConfig((current) => ({ ...current, mode }));
  }

  function selectTemplate(template: PageTemplate) {
    if (template !== config.template && !dismissTemplateNotice) { setPendingTemplate(template); return; }
    setConfig((current) => applyTemplate(current, template));
  }

  function confirmTemplateChange() {
    if (!pendingTemplate) return;
    setConfig((current) => applyTemplate(current, pendingTemplate));
    setPendingTemplate(null);
    if (dismissTemplateNotice) startAutoSave(async () => { await setTemplateChangeNoticeDismissed(true); });
  }

  function updateContent(key: keyof PublicPageConfig["content"], value: string) { setConfig((current) => ({ ...current, content: { ...current.content, [key]: value } })); }
  function updateContact(key: keyof PublicPageConfig["contact"], value: string) { setConfig((current) => ({ ...current, contact: { ...current.contact, [key]: value } })); }

  const previewBooking = <div className="booking-card preview-booking"><span>Prévia do agendamento</span><strong>Serviço → profissional → data → horário</strong><p>Na página publicada, este bloco usa a disponibilidade real da agenda.</p><button type="button" disabled>Escolher horário</button></div>;

  return <div className="page-studio-layout">
    <section className="studio-draft-toolbar" aria-label="Visualização do rascunho">
      <div><strong>Veja suas alterações antes de publicar</strong><p>A prévia salva o rascunho e abre a página inteira. Sua página publicada continua igual.</p></div>
      <form action={openDraftPreview}><input type="hidden" name="config" value={configJson} /><SubmitButton className="button" pendingLabel="Preparando prévia…"><Eye size={18} /> Visualizar rascunho</SubmitButton></form>
    </section>
    {pendingTemplate && <div className="app-modal-backdrop" role="presentation"><section className="app-modal" role="dialog" aria-modal="true" aria-labelledby="template-change-title"><h2 id="template-change-title">Mudar o modelo desta página?</h2><p>A aparência e a organização da página vão mudar. Serviços, profissionais, horários, clientes e agendamentos continuam preservados. Conteúdos compatíveis permanecem no rascunho.</p><label className="modal-checkbox"><input type="checkbox" checked={dismissTemplateNotice} onChange={(event) => setDismissTemplateNotice(event.target.checked)} /> Não mostrar novamente</label><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setPendingTemplate(null)}>Cancelar</button><button type="button" className="button" onClick={confirmTemplateChange}>Continuar</button></div></section></div>}
    <aside className="page-editor-panel">
      <div className="studio-mode-switch" aria-label="Modo de configuração">
        <button type="button" className={config.mode === "manual" ? "active" : ""} onClick={() => changeMode("manual")}>Montar manualmente</button>
        <button type="button" className={config.mode === "template" ? "active" : ""} onClick={() => changeMode("template")}>Página pronta</button>
      </div>

      <div className="draft-sync-state" role="status">
        <span className={hasUnpublishedChanges ? "has-changes" : "published-equal"}>
          {hasUnpublishedChanges ? "Alterações ainda não publicadas" : "Rascunho igual à página publicada"}
        </span>
        <small>{isAutoSaving || autoSaveStatus === "saving" ? "Salvando rascunho…" : autoSaveStatus === "error" ? "Falha ao salvar automaticamente. Use Salvar rascunho para tentar novamente." : savedConfigJson !== configJson ? "Aguardando salvamento…" : "Rascunho salvo automaticamente"}</small>
      </div>

      <nav className="studio-tabs-nav" aria-label="Abas do editor">
        <button type="button" className={activeTab === "design" ? "active" : ""} aria-pressed={activeTab === "design"} onClick={() => setActiveTab("design")}><Palette size={16} /><span>Aparência</span></button>
        <button type="button" className={activeTab === "media" ? "active" : ""} aria-pressed={activeTab === "media"} onClick={() => setActiveTab("media")}><ImageIcon size={16} /><span>Mídia</span></button>
        <button type="button" className={activeTab === "content" ? "active" : ""} aria-pressed={activeTab === "content"} onClick={() => setActiveTab("content")}><FileText size={16} /><span>Conteúdo</span></button>
        <button type="button" className={activeTab === "sections" ? "active" : ""} aria-pressed={activeTab === "sections"} onClick={() => setActiveTab("sections")}><SlidersHorizontal size={16} /><span>Estrutura</span></button>
      </nav>

      <div className="studio-tab-content" key={activeTab}>
      {/* ABA 1: APARÊNCIA E DESIGN */}
      {activeTab === "design" && (
        config.mode === "template" ? (
          <>
            <ol className="studio-progress"><li className="complete"><Check /> Modelo</li><li className="complete"><Check /> Identidade</li><li className="active">Conteúdo</li><li>Visualizar</li><li>Publicar</li></ol>
            {recommended.length > 0 && <section className="recommended-template"><div><Sparkles /><span><strong>Modelo recomendado para o seu segmento</strong><small>{recommended.map((item) => templateDetails[item].name).join(" ou ")}</small></span></div><button type="button" onClick={() => selectTemplate(recommended[0])}>Usar modelo recomendado</button></section>}
            <section className="editor-group"><header><h2>Escolha o modelo</h2><p>Estes cinco modelos foram criados para o segmento do seu negócio.</p></header><div className="template-picker">{templatesForSegment(props.segment).map((template) => <button type="button" className={config.template === template ? "selected" : ""} onClick={() => selectTemplate(template)} key={template}><span className="template-miniature real-preview" style={{ backgroundImage: `url(${templatePreviewAssets[template].moodboard})` }} /><strong>{templateDetails[template].name}</strong><small>{templateDetails[template].description}</small>{recommended[0] === template && <mark>Recomendado</mark>}</button>)}</div></section>
            <section className="editor-group"><header><h2>Direção de arte original</h2><p>Este material foi criado para o seu segmento e pode ser substituído pelas suas imagens.</p></header><div className="template-art-library"><button type="button" onClick={() => setConfig((current) => ({ ...current, media: { ...current.media, coverUrl: templatePreviewAssets[current.template].hero, coverPath: "", coverType: "image" } }))}><img src={templatePreviewAssets[config.template].hero} alt="Material decorativo original do modelo" /><span>Usar arte do modelo</span></button></div></section>
            <details className="identity-customizer"><summary>Personalizar a cor de destaque</summary><p>Altere apenas o destaque da marca. O modelo preserva a estrutura, o contraste e os demais elementos visuais.</p><div className="form-grid two"><div className="field color-field"><label htmlFor="template-accent">Cor de destaque</label><input id="template-accent" type="color" value={config.colors.button} onChange={(event) => setConfig((current) => ({ ...current, colors: { ...current.colors, button: event.target.value, secondary: event.target.value } }))} /></div><div className="field identity-reset"><label>Modelo original</label><button type="button" className="button button-secondary" onClick={() => setConfig((current) => applyTemplate(current, current.template))}>Restaurar identidade</button></div></div></details>
          </>
        ) : (
          <section className="editor-group"><header><h2>Aparência manual</h2><p>Opções seguras, sem código personalizado.</p></header><div className="form-grid three"><div className="field color-field"><label htmlFor="primary-color">Principal</label><input id="primary-color" type="color" value={config.colors.primary} onChange={(event) => setConfig((current) => ({ ...current, colors: { ...current.colors, primary: event.target.value } }))} /></div><div className="field color-field"><label htmlFor="secondary-color">Secundária</label><input id="secondary-color" type="color" value={config.colors.secondary} onChange={(event) => setConfig((current) => ({ ...current, colors: { ...current.colors, secondary: event.target.value } }))} /></div><div className="field color-field"><label htmlFor="button-color">Botões</label><input id="button-color" type="color" value={config.colors.button} onChange={(event) => setConfig((current) => ({ ...current, colors: { ...current.colors, button: event.target.value } }))} /></div></div><div className="form-grid two"><div className="field"><label htmlFor="theme">Tema</label><select id="theme" value={config.theme} onChange={(event) => setConfig((current) => ({ ...current, theme: event.target.value as PublicPageConfig["theme"] }))}><option value="light">Claro</option><option value="dark">Escuro</option></select></div><div className="field"><label htmlFor="font">Tipografia</label><select id="font" value={config.font} onChange={(event) => setConfig((current) => ({ ...current, font: event.target.value as PublicPageConfig["font"] }))}><option value="editorial">Editorial</option><option value="modern">Moderna</option><option value="classic">Clássica</option></select></div><div className="field"><label htmlFor="buttons">Botões</label><select id="buttons" value={config.buttonShape} onChange={(event) => setConfig((current) => ({ ...current, buttonShape: event.target.value as PublicPageConfig["buttonShape"] }))}><option value="soft">Cantos suaves</option><option value="square">Retos</option><option value="pill">Arredondados</option></select></div><div className="field"><label htmlFor="cards">Cartões</label><select id="cards" value={config.cardStyle} onChange={(event) => setConfig((current) => ({ ...current, cardStyle: event.target.value as PublicPageConfig["cardStyle"] }))}><option value="flat">Planos</option><option value="bordered">Com borda</option><option value="elevated">Elevados</option></select></div></div></section>
        )
      )}

      {/* ABA 2: MÍDIA E IDENTIDADE */}
      {activeTab === "media" && (
        <>
          <section className="editor-group"><header><h2>Marca e imagens</h2><p>Imagens são comprimidas antes do envio quando necessário.</p></header><MediaField label="Logo" hint="Recomendado: quadrado, 600 × 600 px." folder="logo" businessId={props.businessId} value={{ url: config.media.logoUrl, path: config.media.logoPath }} publishedPaths={props.publishedPaths} onChange={(image) => setConfig((current) => ({ ...current, media: { ...current.media, logoUrl: image.url, logoPath: image.path } }))} /><MediaField label="Imagem ou vídeo de capa" hint="Horizontal. Vídeos: até 20 MB e carregamento tardio." folder="cover" businessId={props.businessId} value={{ url: config.media.coverUrl, path: config.media.coverPath, type: config.media.coverType }} publishedPaths={props.publishedPaths} allowVideo onChange={(media) => setConfig((current) => ({ ...current, media: { ...current.media, coverUrl: media.url, coverPath: media.path, coverType: media.type } }))} /><MediaField label="Poster do vídeo" hint="Imagem usada antes do vídeo e em conexões lentas." folder="cover-poster" businessId={props.businessId} value={{ url: config.media.coverPosterUrl, path: config.media.coverPosterPath }} publishedPaths={props.publishedPaths} onChange={(image) => setConfig((current) => ({ ...current, media: { ...current.media, coverPosterUrl: image.url, coverPosterPath: image.path } }))} /><MediaField label="Imagem de compartilhamento" hint="Recomendado: 1200 × 630 px." folder="sharing" businessId={props.businessId} value={{ url: config.media.shareUrl, path: config.media.sharePath }} publishedPaths={props.publishedPaths} onChange={(image) => setConfig((current) => ({ ...current, media: { ...current.media, shareUrl: image.url, sharePath: image.path } }))} /><GalleryField businessId={props.businessId} images={config.media.gallery} publishedPaths={props.publishedPaths} onChange={(gallery) => setConfig((current) => ({ ...current, media: { ...current.media, gallery } }))} /></section>
          {props.professionals.length > 0 && <section className="editor-group"><header><h2>Fotos dos profissionais</h2><p>Opcional. Sem foto, o modelo usa um monograma.</p></header>{props.professionals.map((professional) => { const photo = config.media.professionalPhotos[professional.id] || { url: "", path: "" }; return <MediaField key={professional.id} label={professional.name} hint="Recomendado: retrato, 900 × 1200 px." folder={`professionals/${professional.id}`} businessId={props.businessId} value={photo} publishedPaths={props.publishedPaths} onChange={(image) => setConfig((current) => ({ ...current, media: { ...current.media, professionalPhotos: { ...current.media.professionalPhotos, [professional.id]: image } } }))} />; })}</section>}
        </>
      )}

      {/* ABA 3: CONTEÚDO E BLOCOS */}
      {activeTab === "content" && (
        <>
          <section className="editor-group"><header><h2>Conteúdo</h2><p>Textos compatíveis com todos os modelos.</p></header><div className="field"><label htmlFor="page-business-name">Nome do negócio na página</label><input id="page-business-name" value={config.content.businessName} maxLength={100} onChange={(event) => updateContent("businessName", event.target.value)} /></div><div className="field"><label htmlFor="hero-title">Frase principal</label><input id="hero-title" value={config.content.heroTitle} maxLength={120} onChange={(event) => updateContent("heroTitle", event.target.value)} /></div><div className="field"><label htmlFor="hero-subtitle">Subtítulo</label><textarea id="hero-subtitle" value={config.content.heroSubtitle} maxLength={240} onChange={(event) => updateContent("heroSubtitle", event.target.value)} /></div><div className="field"><label htmlFor="intro">Posicionamento</label><textarea id="intro" value={config.content.introduction} maxLength={800} onChange={(event) => updateContent("introduction", event.target.value)} /></div><div className="field"><label htmlFor="story">História do negócio</label><textarea id="story" value={config.content.story} maxLength={2400} onChange={(event) => updateContent("story", event.target.value)} /></div><div className="field"><label htmlFor="button-text">Texto do botão principal</label><input id="button-text" value={config.content.primaryButton} maxLength={40} onChange={(event) => updateContent("primaryButton", event.target.value)} /></div><div className="field"><label htmlFor="booking-notice">Aviso antes do agendamento</label><textarea id="booking-notice" value={config.content.bookingNotice} maxLength={300} onChange={(event) => updateContent("bookingNotice", event.target.value)} /></div><div className="field"><label htmlFor="footer-text">Texto do rodapé</label><input id="footer-text" value={config.content.footerText} maxLength={240} onChange={(event) => updateContent("footerText", event.target.value)} /></div></section>
          <section className="editor-group"><header><h2>Diferenciais</h2><p>Use apenas informações verdadeiras sobre o negócio. Estes itens também formam as etapas de experiência nos modelos que possuem processo.</p></header><div className="editor-collection">{config.differentials.map((item, index) => <article key={item.id}><div className="field"><label htmlFor={`differential-title-${item.id}`}>Título</label><input id={`differential-title-${item.id}`} value={item.title} maxLength={80} onChange={(event) => setConfig((current) => ({ ...current, differentials: current.differentials.map((entry, itemIndex) => itemIndex === index ? { ...entry, title: event.target.value } : entry) }))} /></div><div className="field"><label htmlFor={`differential-description-${item.id}`}>Descrição</label><textarea id={`differential-description-${item.id}`} value={item.description} maxLength={300} onChange={(event) => setConfig((current) => ({ ...current, differentials: current.differentials.map((entry, itemIndex) => itemIndex === index ? { ...entry, description: event.target.value } : entry) }))} /></div><button type="button" className="text-button danger" onClick={() => setConfig((current) => ({ ...current, differentials: current.differentials.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 /> Remover</button></article>)}</div><button type="button" className="button button-secondary" disabled={config.differentials.length >= 8} onClick={() => setConfig((current) => ({ ...current, differentials: [...current.differentials, { id: crypto.randomUUID(), title: "", description: "" }] }))}><Plus /> Adicionar diferencial</button></section>
          <section className="editor-group"><header><h2>Depoimentos reais</h2><p>Cadastre somente relatos recebidos de clientes. A seção desaparece quando estiver vazia.</p></header><div className="editor-collection">{config.testimonials.map((item, index) => <article key={item.id}><div className="field"><label htmlFor={`testimonial-name-${item.id}`}>Nome do cliente</label><input id={`testimonial-name-${item.id}`} value={item.name} maxLength={80} onChange={(event) => setConfig((current) => ({ ...current, testimonials: current.testimonials.map((entry, itemIndex) => itemIndex === index ? { ...entry, name: event.target.value } : entry) }))} /></div><div className="field"><label htmlFor={`testimonial-text-${item.id}`}>Depoimento</label><textarea id={`testimonial-text-${item.id}`} value={item.text} maxLength={600} onChange={(event) => setConfig((current) => ({ ...current, testimonials: current.testimonials.map((entry, itemIndex) => itemIndex === index ? { ...entry, text: event.target.value } : entry) }))} /></div><div className="field"><label htmlFor={`testimonial-context-${item.id}`}>Contexto opcional</label><input id={`testimonial-context-${item.id}`} value={item.context} maxLength={120} placeholder="Ex.: cliente desde 2024" onChange={(event) => setConfig((current) => ({ ...current, testimonials: current.testimonials.map((entry, itemIndex) => itemIndex === index ? { ...entry, context: event.target.value } : entry) }))} /></div><button type="button" className="text-button danger" onClick={() => setConfig((current) => ({ ...current, testimonials: current.testimonials.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 /> Remover</button></article>)}</div><button type="button" className="button button-secondary" disabled={config.testimonials.length >= 12} onClick={() => setConfig((current) => ({ ...current, testimonials: [...current.testimonials, { id: crypto.randomUUID(), name: "", text: "", context: "" }] }))}><Plus /> Adicionar depoimento</button></section>
          <section className="editor-group"><header><h2>Perguntas frequentes</h2><p>Responda às dúvidas que seus clientes realmente fazem.</p></header><div className="editor-collection">{config.faq.map((item, index) => <article key={item.id}><div className="field"><label htmlFor={`faq-question-${item.id}`}>Pergunta</label><input id={`faq-question-${item.id}`} value={item.question} maxLength={180} onChange={(event) => setConfig((current) => ({ ...current, faq: current.faq.map((entry, itemIndex) => itemIndex === index ? { ...entry, question: event.target.value } : entry) }))} /></div><div className="field"><label htmlFor={`faq-answer-${item.id}`}>Resposta</label><textarea id={`faq-answer-${item.id}`} value={item.answer} maxLength={1000} onChange={(event) => setConfig((current) => ({ ...current, faq: current.faq.map((entry, itemIndex) => itemIndex === index ? { ...entry, answer: event.target.value } : entry) }))} /></div><button type="button" className="text-button danger" onClick={() => setConfig((current) => ({ ...current, faq: current.faq.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 /> Remover</button></article>)}</div><button type="button" className="button button-secondary" disabled={config.faq.length >= 12} onClick={() => setConfig((current) => ({ ...current, faq: [...current.faq, { id: crypto.randomUUID(), question: "", answer: "" }] }))}><Plus /> Adicionar pergunta</button></section>
          {props.professionals.length > 0 && <section className="editor-group"><header><h2>Credenciais dos profissionais</h2><p>Informe apenas formação, registro ou especialidade verdadeira. O campo vazio não aparece na página.</p></header>{props.professionals.map((professional) => <div className="field" key={professional.id}><label htmlFor={`credential-${professional.id}`}>{professional.name}</label><input id={`credential-${professional.id}`} value={config.professionalCredentials[professional.id] || ""} maxLength={240} placeholder="Ex.: Especialista em colorimetria" onChange={(event) => setConfig((current) => ({ ...current, professionalCredentials: { ...current.professionalCredentials, [professional.id]: event.target.value } }))} /></div>)}</section>}
        </>
      )}

      {/* ABA 4: ESTRUTURA, CONTATO E SEO */}
      {activeTab === "sections" && (
        <>
          <section className="editor-group"><header><h2>Contato e localização</h2><p>Dados exibidos nesta página.</p></header><div className="field"><label htmlFor="page-whatsapp">WhatsApp</label><input id="page-whatsapp" value={config.contact.whatsapp} maxLength={24} onChange={(event) => updateContact("whatsapp", event.target.value)} /></div><div className="field"><label htmlFor="page-instagram">Instagram</label><input id="page-instagram" value={config.contact.instagram} maxLength={80} onChange={(event) => updateContact("instagram", event.target.value)} /></div><div className="field"><label htmlFor="page-address">Endereço</label><input id="page-address" value={config.contact.address} maxLength={240} onChange={(event) => updateContact("address", event.target.value)} /></div></section>
          <section className="editor-group"><header><h2>Seções da página</h2><p>Ative e reorganize a apresentação pública.</p></header><div className="reorder-list">{config.sections.map((section, index) => <div key={section.id}><label><input type="checkbox" checked={section.visible} onChange={(event) => setConfig((current) => ({ ...current, sections: current.sections.map((item) => item.id === section.id ? { ...item, visible: event.target.checked } : item) }))} /><span>{sectionLabels[section.id]}</span></label><span><button type="button" onClick={() => setConfig((current) => ({ ...current, sections: moveItem(current.sections, index, -1) }))} disabled={index === 0} aria-label={`Mover ${sectionLabels[section.id]} para cima`}><ArrowUp /></button><button type="button" onClick={() => setConfig((current) => ({ ...current, sections: moveItem(current.sections, index, 1) }))} disabled={index === config.sections.length - 1} aria-label={`Mover ${sectionLabels[section.id]} para baixo`}><ArrowDown /></button></span></div>)}</div></section>
          <section className="editor-group"><header><h2>Ordem de apresentação</h2><p>A ordem operacional permanece inalterada.</p></header><strong className="subgroup-title">Serviços</strong><div className="compact-order">{displayedServices.map((service, index) => <div key={service.id}><span>{service.name}</span><button type="button" onClick={() => setConfig((current) => ({ ...current, serviceOrder: moveItem(displayedServices.map((item) => item.id), index, -1) }))} disabled={index === 0}><ArrowUp /></button><button type="button" onClick={() => setConfig((current) => ({ ...current, serviceOrder: moveItem(displayedServices.map((item) => item.id), index, 1) }))} disabled={index === displayedServices.length - 1}><ArrowDown /></button></div>)}</div><strong className="subgroup-title">Profissionais</strong><div className="compact-order">{displayedProfessionals.map((professional, index) => <div key={professional.id}><span>{professional.name}</span><button type="button" onClick={() => setConfig((current) => ({ ...current, professionalOrder: moveItem(displayedProfessionals.map((item) => item.id), index, -1) }))} disabled={index === 0}><ArrowUp /></button><button type="button" onClick={() => setConfig((current) => ({ ...current, professionalOrder: moveItem(displayedProfessionals.map((item) => item.id), index, 1) }))} disabled={index === displayedProfessionals.length - 1}><ArrowDown /></button></div>)}</div></section>
          <section className="editor-group"><header><h2>Google e SEO</h2><p>Título e descrição da versão publicada.</p></header><div className="field"><label htmlFor="seo-title">Título para o Google</label><input id="seo-title" value={config.content.seoTitle} maxLength={70} onChange={(event) => updateContent("seoTitle", event.target.value)} /></div><div className="field"><label htmlFor="seo-description">Descrição para o Google</label><textarea id="seo-description" value={config.content.seoDescription} maxLength={170} onChange={(event) => updateContent("seoDescription", event.target.value)} /></div></section>
        </>
      )}

      {/* AÇÕES GLOBAIS DE SALVAMENTO E PUBLICAÇÃO */}
      </div>
      <div className="studio-actions">
        <form action={savePublicPageDraft}><input type="hidden" name="config" value={configJson} /><SubmitButton className="button" pendingLabel="Salvando…"><Save /> Salvar rascunho</SubmitButton></form>
        <form action={openDraftPreview}><input type="hidden" name="config" value={configJson} /><SubmitButton className="button button-secondary" pendingLabel="Preparando prévia…"><Eye size={16} /> Visualizar rascunho</SubmitButton></form>
        <form action={publishPageChanges} onSubmit={(event) => { if (!window.confirm(props.isPublished ? "Esta ação substituirá a configuração publicada atualmente. Deseja publicar o rascunho?" : "Deseja publicar esta página para seus clientes?")) event.preventDefault(); }}><input type="hidden" name="config" value={configJson} /><SubmitButton className="button publish-button" disabled={!props.ready}>Publicar alterações</SubmitButton></form>
        {!props.ready && <p>Para publicar, cadastre ao menos um serviço, um profissional e os horários necessários.</p>}
        <button className="text-button" type="button" onClick={() => { if (window.confirm("Descartar as alterações feitas desde o último salvamento?")) setConfig(props.initialConfig); }}>Descartar alterações</button>
        <form action={restorePageDefault} onSubmit={(event) => { if (!window.confirm("Restaurar apenas a aparência e os textos padrão? Serviços, profissionais e agenda não serão alterados.")) event.preventDefault(); }}><input type="hidden" name="config" value={configJson} /><button className="text-button" type="submit"><RotateCcw /> Restaurar modelo padrão</button></form>
        {props.isPublished && <><Link className="public-link" href={props.publicUrl} target="_blank">Abrir página publicada</Link><form action={unpublishPublicPage} onSubmit={(event) => { if (!window.confirm("Retirar a página do ar? A última versão e o rascunho serão preservados.")) event.preventDefault(); }}><button className="text-button danger" type="submit">Despublicar página</button></form></>}
      </div>
    </aside>

    <section className="studio-preview-panel">
      <header>
        <div><strong>Prévia em tempo real</strong><span>Mesmos componentes da página publicada</span></div>
        <div>
          <button type="button" className={viewport === "mobile" ? "active" : ""} onClick={() => setViewport("mobile")}><Smartphone /> Celular</button>
          <button type="button" className={viewport === "tablet" ? "active" : ""} onClick={() => setViewport("tablet")}><Tablet /> Tablet</button>
          <button type="button" className={viewport === "desktop" ? "active" : ""} onClick={() => setViewport("desktop")}><Laptop /> Computador</button>
        </div>
      </header>
      <div className={`studio-preview-frame ${viewport}`}>
        <PublicPageView business={props.business} services={props.services} professionals={props.professionals} businessHours={props.businessHours} config={config} booking={previewBooking} preview />
      </div>
    </section>
  </div>;
}
