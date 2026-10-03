// Serializes this editor's saves so an older autosave cannot overwrite a preview.
export function createDraftSaveQueue() {
  let tail: Promise<unknown> = Promise.resolve();
  return function enqueue<T>(save: () => Promise<T>): Promise<T> {
    const next = tail.then(save, save);
    tail = next.catch(() => undefined);
    return next;
  };
}
