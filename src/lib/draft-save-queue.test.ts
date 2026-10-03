import { describe, expect, it, vi } from "vitest";
import { createDraftSaveQueue } from "./draft-save-queue";

describe("draft save ordering", () => {
  it("waits for an older autosave before saving the current preview", async () => {
    const enqueue = createDraftSaveQueue();
    let finish!: () => void;
    const oldSave = enqueue(() => new Promise<void>(resolve => { finish = resolve; }));
    const preview = vi.fn(async () => "current draft");
    const newSave = enqueue(preview);
    await Promise.resolve();
    expect(preview).not.toHaveBeenCalled();
    finish();
    await oldSave;
    expect(await newSave).toBe("current draft");
    expect(preview).toHaveBeenCalledOnce();
  });
  it("allows retry and preview after a failed autosave", async () => {
    const enqueue = createDraftSaveQueue();
    await expect(enqueue(async () => { throw new Error("offline"); })).rejects.toThrow("offline");
    expect(await enqueue(async () => "recovered")).toBe("recovered");
  });
});
