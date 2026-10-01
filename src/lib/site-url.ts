export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://gestalltweb-saasbarbeiro.vercel.app").replace(/\/$/, "");
}

export function publicBusinessUrl(slug: string) {
  return `${getSiteUrl()}/${slug}`;
}
