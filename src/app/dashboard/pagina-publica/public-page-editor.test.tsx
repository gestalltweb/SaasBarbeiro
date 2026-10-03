import { fireEvent, render, screen, waitFor, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createDefaultPageConfig } from "@/lib/public-page";
import { PublicPageEditor } from "./public-page-editor";

const actions = vi.hoisted(() => ({
  autoSavePublicPageDraft: vi.fn(async () => ({ ok: true })),
  saveAndPreviewPublicPage: vi.fn<(data: FormData) => Promise<void>>().mockResolvedValue(undefined),
  publishPageChanges: vi.fn(async () => undefined),
}));
vi.mock("./actions", () => ({
  ...actions,
  savePublicPageDraft: vi.fn(), restorePageDefault: vi.fn(),
  setTemplateChangeNoticeDismissed: vi.fn(), unpublishPublicPage: vi.fn(),
}));
vi.mock("@/components/public-page-view", () => ({ PublicPageView: () => <div>Inline draft preview</div> }));
vi.mock("@/lib/media-upload", () => ({
  deletePublicPageImage: vi.fn(), uploadPublicPageImage: vi.fn(), uploadPublicPageMedia: vi.fn(),
}));
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("draft preview", () => {
  it("sends the latest edited configuration to preview without publishing or waiting for the debounce", async () => {
    const business = { name: "Studio Teste", slug: "studio", description: "", phone: "", instagram: "", address: "", timezone: "America/Sao_Paulo", segment: "other" as const };
    const config = createDefaultPageConfig(business);
    render(<PublicPageEditor businessId="business-id" segment="other" business={business} services={[]} professionals={[]} businessHours={[]} initialConfig={config} publishedConfig={config} publishedPaths={[]} isPublished ready publicUrl="/studio" dismissTemplateChangeNotice />);
    fireEvent.click(screen.getByRole("button", { name: "Conteúdo" }));
    fireEvent.change(screen.getByLabelText("Frase principal"), { target: { value: "Meu novo rascunho" } });
    const preview = screen.getAllByRole("button", { name: "Visualizar rascunho" })[0];
    fireEvent.submit(preview.closest("form")!);
    await waitFor(() => expect(actions.saveAndPreviewPublicPage).toHaveBeenCalledOnce());
    const data = actions.saveAndPreviewPublicPage.mock.calls[0][0] as unknown as FormData;
    expect(JSON.parse(String(data.get("config"))).content.heroTitle).toBe("Meu novo rascunho");
    expect(actions.publishPageChanges).not.toHaveBeenCalled();
    expect(actions.autoSavePublicPageDraft).not.toHaveBeenCalled();
  });
});
