/**
 * Resolução portátil de URL base — funciona em QUALQUER hospedagem estática.
 *
 * Prioridade:
 *  1. `import.meta.env.VITE_SITE_URL` (build-time, ex: Netlify/Vercel/Cloudflare)
 *  2. `import.meta.env.VITE_BASE_PATH` combinada com `window.location.origin` (runtime)
 *  3. `window.location.origin` (runtime puro — pacote .zip arrastado para qualquer host)
 *  4. Fallback canônico https://rsengenharia.eng.br
 *
 * Nenhum import de servidor aqui — este módulo é 100% client-safe e
 * pode ser usado em prerender, SPA e qualquer CDN.
 */

export const CANONICAL_SITE_URL = "https://rsengenharia.eng.br";

function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export function getSiteUrl(): string {
  try {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    const viteSite = env?.VITE_SITE_URL;
    if (typeof viteSite === "string" && viteSite.length > 4) {
      return normalizeUrl(viteSite);
    }
  } catch {
    /* ambiente sem import.meta — segue para runtime */
  }

  try {
    if (typeof window !== "undefined" && window.location?.origin) {
      const origin = window.location.origin;
      // Em dev/preview (localhost, *.lovable.app, *.netlify.app...) o origin
      // real é mais útil que o canônico para OG/canonical não quebrar.
      // Em produção no domínio oficial, origin === canônico.
      if (origin.startsWith("http")) return normalizeUrl(origin);
    }
  } catch {
    /* SSR/prerender sem window */
  }

  return CANONICAL_SITE_URL;
}

/**
 * Prefixo base onde o app está publicado.
 * - `/` na raiz (KingHost /www, Netlify, Vercel, S3+CloudFront...)
 * - `/subpasta/` quando publicado em subdiretório (GitHub Pages de projeto,
 *   cPanel addon, KingHost /www/staging...).
 * Configure com `VITE_BASE_PATH=/subpasta/` ou `BASE_PATH=/subpasta/`.
 */
export function getBasePath(): string {
  try {
    const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
    const raw = env?.VITE_BASE_PATH ?? env?.BASE_PATH;
    if (typeof raw === "string" && raw.length > 0) {
      const withLeading = raw.startsWith("/") ? raw : `/${raw}`;
      const withTrailing = withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
      return withTrailing.replace(/\/\//g, "/");
    }
    const baseUrl = env?.BASE_URL;
    if (typeof baseUrl === "string" && baseUrl.length > 0 && baseUrl !== "/") {
      return baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
    }
  } catch {
    /* ignore */
  }
  return "/";
}

/** Junta base + path sem duplicar barras. */
export function withBase(path: string): string {
  const base = getBasePath();
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (base === "/") return clean;
  return `${base.replace(/\/$/, "")}${clean}`.replace(/\/\//g, "/");
}
