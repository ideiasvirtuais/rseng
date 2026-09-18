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
 * 5. Variações de CAIXA da extensão (.JPG ↔ .jpg): Linux é case-sensitive.
 * 6. Placeholder SVG inline como última instância — nunca exibe <img> quebrado.
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
 * - .webp → tenta .jpg (arquivo real mais comum; ex: hero-rosario.jpg)
 * - .jpg/.jpeg → tenta .webp (variante otimizada, quando existir)
 * - .png → tenta .webp, depois .jpg
 * - .avif → tenta .webp, depois .jpg
 * - Normalização de CAIXA: se a URL pedir .JPG/.JPEG/.PNG (upload legado
 *   Windows), tenta a variante lowercase, que é o padrão em public/.
 *   NUNCA gera variante UPPERCASE a partir de lowercase — esse fantasma
 *   (.jpg → .JPG) sempre dá 404 no Linux e era o responsável pelo log
 *   "[SmartImage] cadeia esgotada ... /instagram-rs.JPG" mesmo quando
 *   o arquivo real /instagram-rs.jpg existia em disco.
 * Remove duplicatas e a própria URL original.
 */
export function autoFallbacks(rawSrc: ImageInput): string[] {
  try {
    const resolved = resolveImage(rawSrc);
    if (!resolved || /^(data:|blob:)/i.test(resolved)) return [];
    const lower = resolved?.toLowerCase?.()?.split("?")?.[0] ?? "";
    if (!lower) return [];
    const out: string[] = [];
    const push = (u: string) => {
      if (u && u !== resolved && !out.includes(u)) out.push(u);
    };
    // Assets vendorados __l5e são content-addressed: cada variante
    // (jpg/webp/png) vive em pasta UUID distinta. Trocar a extensão
    // dentro da mesma pasta gera 404 garantido (ex: .../8d20.../iris.jpg
    // → .../8d20.../iris.webp não existe; o webp real está em 659c.../).
    // Por isso, para /__l5e/ NÃO geramos swap de extensão — apenas
    // normalização de caixa. O fallback correto entre variantes deve ser
    // explícito via prop fallbackSrc nos dados (webp leve como primary).
    const isVendorAsset = lower.includes("/__l5e/");
    if (!isVendorAsset) {
      if (lower.endsWith(".webp")) {
        push(swapExtension(resolved, "jpg"));
      } else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) {
        push(swapExtension(resolved, "webp"));
      } else if (lower.endsWith(".png")) {
        push(swapExtension(resolved, "webp"));
        push(swapExtension(resolved, "jpg"));
      } else if (lower.endsWith(".avif")) {
        push(swapExtension(resolved, "webp"));
        push(swapExtension(resolved, "jpg"));
      }
    }
    // Normalização de caixa (apenas uppercase → lowercase).
    for (const variant of caseVariants(resolved) ?? []) {
      push(variant);
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * Normalização de caixa da extensão do arquivo (apenas um sentido).
 * Ex: "/foto.JPG" → ["/foto.jpg"]; "/foto.jpg" → [] (sem fantasma).
 * Servidores Windows ignoram caixa; Apache/Linux não — sem isso a imagem
 * "falha" só em produção quando o código legado pede .JPG.
 * NOTA: NÃO geramos aliases .jpg ↔ .jpeg nem lowercase → UPPERCASE —
 * isso criava requisições garantidas de 404 (ex: /instagram-rs.JPG e
 * /instagram-rs.jpeg quando só existe /instagram-rs.jpg), poluindo o log
 * com "[SmartImage] cadeia esgotada" e parecendo exceção de runtime.
 */
export function caseVariants(url: string): string[] {
  try {
    if (!url || /^(data:|blob:)/i.test(url)) return [];
    const qIndex = url.indexOf("?");
    const path = qIndex >= 0 ? url.slice(0, qIndex) : url;
    const query = qIndex >= 0 ? url.slice(qIndex) : "";
    const dot = path?.lastIndexOf(".") ?? -1;
    const slash = path?.lastIndexOf("/") ?? -1;
    if (dot < 0 || dot < slash) return [];
    const base = path?.slice(0, dot) ?? "";
    const ext = path?.slice(dot + 1) ?? "";
    if (!base || !ext) return [];
    const lower = ext?.toLowerCase?.() ?? ext;
    // Apenas normaliza para lowercase. Se já está lowercase, sem variantes.
    if (ext !== lower) return [`${base}.${lower}${query}`];
    return [];
  } catch {
    return [];
  }
}

/**
 * Monta a cadeia completa de tentativas:
 * primary → fallback explícito → fallbacks automáticos (webp<->jpg).
 */
export function fallbackChain(primary: ImageInput, explicitFallback?: ImageInput): string[] {
  try {
    const chain: string[] = [];
    const p = resolveImage(primary);
    if (p) chain.push(p);
    let f = "";
    try {
      f = resolveImage(explicitFallback);
    } catch {
      f = "";
    }
    if (f && !chain.includes(f)) chain.push(f);
    let autos: string[] = [];
    try {
      autos = autoFallbacks(p);
    } catch {
      autos = [];
    }
    for (const auto of autos ?? []) {
      if (auto && !chain.includes(auto)) chain.push(auto);
    }
    return chain;
  } catch {
    try {
      const p = resolveImage(primary);
      return p ? [p] : [];
    } catch {
      return [];
    }
  }
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

/** Aquece o cache da imagem crítica (hero) — sem <link rel="preload">. Idempotente. */
export function preloadHero(url: ImageInput = HERO_URL): void {
  try {
    if (typeof document === "undefined" || typeof Image === "undefined") return;
    const href = resolveImage(url);
    if (!href || href.startsWith("data:") || href.startsWith("blob:")) return;
    // SEM injeção de <link rel="preload">: o <img> é montado pelo React
    // após a hidratação e o Chrome reportava "preloaded but not used",
    // exibido pelo preview como exceção/tela branca. Apenas `new Image()`
    // para aquecer o cache — o LCP usa eager + fetchpriority="high".
    const img = new Image();
    (img as HTMLImageElement).decoding = "async";
    (img as HTMLImageElement).src = href;
  } catch {
    // preload é otimização — nunca pode quebrar
  }
}
