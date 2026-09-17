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

/** Extrai a string de URL de um import (string | AssetJson | { default: string }). */
export function assetSrc(input: string | AssetJson | { url: string } | undefined | null): string {
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
export function resolveImage(src: string | AssetJson | { url: string } | undefined | null): string {
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
