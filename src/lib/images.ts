/**
 * Central de resolução de imagens — garante que TODA imagem carregue
 * em qualquer ambiente (dev, preview, SSR, FTP/subpasta, CDN).
 *
 * Problemas corrigidos:
 * 1. URLs absolutas "/__l5e/..." quebravam quando o site era servido
 *    de uma subpasta (ex: FTP, preview). Agora respeitam BASE_URL.
 * 2. Imports do Vite ("assets/xxx-hash.jpg") já vêm com base correta,
 *    então são retornados intactos.
 * 3. URLs externas (http/https, data:, blob:) passam direto.
 * 4. Fallback automático webp <-> jpg/png quando o Apache/CDN falha
 *    no MIME ou o arquivo específico dá 404 (ex: golden-mall-*.webp).
 * 5. Placeholder SVG inline como última instância — nunca exibe <img> quebrado.
 */

export type AssetJson = {
  url: string;
  asset_id: string;
  project_id: string;
  r2_key: string;
  original_filename: string;
  size: number;
  content_type: string;
  created_at: string;
};

export type ImageInput = string | AssetJson | { url: string } | { default: string } | undefined | null;

/** Extrai a string de URL de um import (string | AssetJson | { default: string }). */
export function assetSrc(input: ImageInput): string {
  if (!input) return "";
  if (typeof input === "string") return input;
  if (typeof (input as AssetJson).url === "string") return (input as AssetJson).url;
  const maybeDefault = (input as { default?: unknown }).default;
  if (typeof maybeDefault === "string") return maybeDefault;
  return "";
}

function getBase(): string {
  try {
    const base = import.meta.env?.BASE_URL as string | undefined;
    if (!base || base === "/" || base === "./") return "";
    return base.replace(/\/$/, "");
  } catch {
    return "";
  }
}

/**
 * Resolve uma URL de imagem para o base path atual.
 * - "http...", "https://...", "data:...", "blob:..." → intacta
 * - "/__l5e/..." ou "/logo.png" → prefixa com BASE_URL quando necessário
 * - "assets/xxx.jpg" (relativa do Vite) → intacta
 */
export function resolveImage(src: ImageInput): string {
  const raw = assetSrc(src).trim();
  if (!raw) return "";
  if (/^(https?:\/\/|data:|blob:)/i.test(raw)) return raw;
  if (raw.startsWith("/")) {
    const base = getBase();
    if (!base) return raw;
    // Evita duplicar o base se já estiver prefixado.
    if (raw === base || raw.startsWith(`${base}/`)) return raw;
    return `${base}${raw}`;
  }
  return raw;
}

/** Atalho para montar URL pública com base (ex: publicUrl("/logo.png")). */
export function publicUrl(path: string): string {
  return resolveImage(path);
}

export const LOGO_URL = publicUrl("/logo-rezende-saback.png");
export const FAVICON_URL = publicUrl("/favicon.png");

/** Imagem principal do hero — foto oficial atual (public/hero-rosario.*). */
export const HERO_URL = publicUrl("/hero-rosario.jpg");
export const HERO_FALLBACK_URL = publicUrl("/hero-rosario.webp");

/* ------------------------------------------------------------------ */
/* Fallbacks automáticos                                               */
/* ------------------------------------------------------------------ */

/**
 * Troca a extensão de uma URL de imagem, preservando query string.
 * Ex: "/a/foto.webp?x=1" → "/a/foto.jpg?x=1"
 */
export function swapExtension(url: string, toExt: "jpg" | "jpeg" | "png" | "webp" | "avif"): string {
  if (!url || /^(data:|blob:)/i.test(url)) return "";
  const qIndex = url.indexOf("?");
  const path = qIndex >= 0 ? url.slice(0, qIndex) : url;
  const query = qIndex >= 0 ? url.slice(qIndex) : "";
  const dot = path.lastIndexOf(".");
  const slash = path.lastIndexOf("/");
  if (dot < 0 || dot < slash) return "";
  const base = path.slice(0, dot);
  return `${base}.${toExt}${query}`;
}

/**
 * Gera candidatos de fallback para uma URL.
 * - .webp → tenta .jpg, depois .png
 * - .jpg/.jpeg → tenta .webp, depois .png
 * - .png → tenta .webp, depois .jpg
 * Remove duplicatas e a própria URL original.
 */
export function autoFallbacks(rawSrc: ImageInput): string[] {
  const resolved = resolveImage(rawSrc);
  if (!resolved || /^(data:|blob:)/i.test(resolved)) return [];
  const lower = resolved.toLowerCase().split("?")[0];
  const out: string[] = [];
  const push = (u: string) => {
    if (u && u !== resolved && !out.includes(u)) out.push(u);
  };
  if (lower.endsWith(".webp")) {
    push(swapExtension(resolved, "jpg"));
    push(swapExtension(resolved, "png"));
  } else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
    push(swapExtension(resolved, "webp"));
    push(swapExtension(resolved, "png"));
  } else if (lower.endsWith(".png")) {
    push(swapExtension(resolved, "webp"));
    push(swapExtension(resolved, "jpg"));
  } else if (lower.endsWith(".avif")) {
    push(swapExtension(resolved, "webp"));
    push(swapExtension(resolved, "jpg"));
  }
  return out;
}

/**
 * Monta a cadeia completa de tentativas:
 * primary → fallback explícito → fallbacks automáticos (webp<->jpg).
 */
export function fallbackChain(primary: ImageInput, explicitFallback?: ImageInput): string[] {
  const chain: string[] = [];
  const p = resolveImage(primary);
  if (p) chain.push(p);
  const f = resolveImage(explicitFallback);
  if (f && !chain.includes(f)) chain.push(f);
  for (const auto of autoFallbacks(p)) {
    if (!chain.includes(auto)) chain.push(auto);
  }
  return chain;
}

/** Adiciona cache-buster para retry (data:/blob: não aceitam query). */
export function withRetryBuster(url: string): string {
  if (!url || /^(data:|blob:)/i.test(url)) return url;
  try {
    if (/^https?:\/\//i.test(url)) {
      const u = new URL(url);
      u.searchParams.set("retry", String(Date.now()));
      return u.toString();
    }
    const u = new URL(url, "http://retry.local");
    u.searchParams.set("retry", String(Date.now()));
    const path = `${u.pathname}${u.search}`;
    return url.startsWith("/") ? path : path.replace(/^\//, "");
  } catch {
    return url;
  }
}

/* ------------------------------------------------------------------ */
/* Placeholder final (nunca mostra ícone quebrado)                     */
/* ------------------------------------------------------------------ */

const PLACEHOLDER_SVG =
  `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'>` +
  `<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>` +
  `<stop offset='0' stop-color='#2E3192'/><stop offset='1' stop-color='#1a1c5e'/>` +
  `</linearGradient></defs>` +
  `<rect width='800' height='600' fill='url(#g)'/>` +
  `<g fill='none' stroke='%23FFED00' stroke-width='10' opacity='0.85'>` +
  `<rect x='330' y='230' width='140' height='110' rx='12'/><circle cx='370' cy='265' r='12' fill='%23FFED00' stroke='none' opacity='0.9'/>` +
  `<path d='M330 320 L390 270 L430 305 L460 280 L470 290 L470 340 L330 340 Z' fill='%23ffffff' stroke='none' opacity='0.9'/></g>` +
  `<text x='400' y='390' text-anchor='middle' font-family='sans-serif' font-size='26' fill='%23ffffff' opacity='0.9'>Rezende Saback</text>` +
  `</svg>`;

export function placeholderImage(label?: string): string {
  void label;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(PLACEHOLDER_SVG)}`;
}

/* ------------------------------------------------------------------ */
/* Preload do hero (LCP)                                               */
/* ------------------------------------------------------------------ */

/** Injeta <link rel="preload" as="image"> para a imagem crítica (hero). Idempotente. */
export function preloadHero(url: ImageInput = HERO_URL): void {
  try {
    if (typeof document === "undefined") return;
    const href = resolveImage(url);
    if (!href || href.startsWith("data:") || href.startsWith("blob:")) return;
    if (document.querySelector(`link[rel="preload"][href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = href;
    link.setAttribute("fetchpriority", "high");
    document.head.appendChild(link);
  } catch {
    // preload é otimização — nunca pode quebrar
  }
}
