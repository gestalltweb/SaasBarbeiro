export function filterFormUrl(destination: string, data: FormData) {
  const query = new URLSearchParams();
  data.forEach((value, key) => { if (typeof value === "string") query.append(key, value); });
  return destination + "?" + query.toString() + (destination.startsWith("/dashboard") ? "" : "#agendar");
}
