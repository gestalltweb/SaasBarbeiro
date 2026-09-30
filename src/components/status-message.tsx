export function StatusMessage({ success, error }: { success?: string | null; error?: string | null }) {
  if (!success && !error) return null;
  return <p className={`form-message ${success ? "success" : ""}`} role={error ? "alert" : "status"}>{error || success}</p>;
}
