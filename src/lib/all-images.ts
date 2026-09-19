/**
 * Catálogo central de TODAS as imagens do site.
 * Fonte única para "carregar todas as imagens": pré-carregamento global,
 * galeria completa (/galeria), auditoria e aquecimento de cache.
 *
 * - Dedupe por URL resolvida (evita baixar 2x a mesma foto usada em
 *   múltiplas listas: ex. Golden Mall aparece em projects + commercial).
 * - URLs resolvidas via resolveImage (respeita BASE_URL em dev/preview/FTP).
 * - Nunca lança: qualquer import ausente vira string vazia filtrada.
 */

import { resolveImage } from "@/lib/images";
import { HERO_URL, HERO_FALLBACK_URL, LOGO_URL } from "@/lib/images";
import { galleryItems } from "@/data/projects";
import { residentialWorks } from "@/data/residential";
import { commercialWorks } from "@/data/commercial";
import { houses } from "@/data/houses";
import { goldenMallImages } from "@/data/goldenMall";
import { segments } from "@/data/segments";
import { COMPANY } from "@/data/company";

export type CatalogImage = {
  src: string;
  alt: string;
  group: "Hero" | "Institucional" | "Lançamentos" | "Residenciais" | "Comerciais" | "Casas" | "Segmentos";
  title: string;
};

function safeSrc(value: unknown): string {
  try {
    if (typeof value !== "string" || !value) return "";
    const resolved = resolveImage(value);
    return typeof resolved === "string" ? resolved : "";
  } catch {
    return "";
  }
}

function pushUnique(list: CatalogImage[], item: CatalogImage, seen: Set<string>): void {
  if (!item.src) return;
  if (seen.has(item.src)) return;
  seen.add(item.src);
  list.push(item);
}

/** Lista completa e deduplicada de todas as imagens (ordem de prioridade visual). */
export function getAllImages(): CatalogImage[] {
  const seen = new Set<string>();
  const all: CatalogImage[] = [];

  // 1. Hero + fallback (LCP — sempre primeiro).
  pushUnique(all, { src: safeSrc(HERO_URL), alt: "Empreendimento da Rezende Saback ao entardecer", group: "Hero", title: "Hero — foto oficial" }, seen);
  pushUnique(all, { src: safeSrc(HERO_FALLBACK_URL), alt: "Versão otimizada do hero", group: "Hero", title: "Hero — fallback webp" }, seen);

  // 2. Institucional: logo (entrada ÚNICA — a vendorada `__l5e` é fallback
  // interno do componente Logo, não item de galeria; duplicar gerava 2 cards
  // da mesma marca com object-cover cortando a logo larga + 2 preloads).
  pushUnique(all, { src: safeSrc(LOGO_URL), alt: "Logo Rezende Saback", group: "Institucional", title: "Logo oficial" }, seen);
  try {
    const base = safeSrc("/og-cover.jpg");
    pushUnique(all, { src: base, alt: "Capa institucional Rezende Saback", group: "Institucional", title: "OG Cover" }, seen);
    pushUnique(all, { src: safeSrc("/instagram-rs.jpg"), alt: "Instagram Rezende Saback", group: "Institucional", title: "Instagram" }, seen);
    pushUnique(all, { src: safeSrc("/hero-rosario.jpg"), alt: "Hero Rosário", group: "Hero", title: "Hero Rosário" }, seen);
  } catch {
    // no-op
  }

  // Sede (import dinâmico defensivo via segments? usa URL vendorada direta).
  try {
    const sedeCandidates = ["/__l5e/assets-v1/sede", "/sede"];
    void sedeCandidates;
  } catch {
    // no-op
  }

  // 3. Golden Mall (lançamento — galeria completa de 9 fotos).
  for (const g of goldenMallImages ?? []) {
    pushUnique(
      all,
      { src: safeSrc((g as { src?: unknown })?.src), alt: (g as { alt?: string })?.alt ?? "Golden Mall", group: "Lançamentos", title: "Golden Mall – Rosário" },
      seen,
    );
  }

  // 4. Galeria geral (já agrega residenciais + comerciais + casas + lançamentos).
  for (const item of galleryItems ?? []) {
    const category = (item as { category?: string })?.category ?? "";
    const group: CatalogImage["group"] =
      category === "Lançamentos" ? "Lançamentos"
      : category === "Residenciais" ? "Residenciais"
      : category === "Comerciais" ? "Comerciais"
      : category === "Casas" ? "Casas"
      : "Residenciais";
    pushUnique(
      all,
      {
        src: safeSrc((item as { src?: unknown })?.src),
        alt: (item as { alt?: string })?.alt ?? (item as { project?: string })?.project ?? "Obra Rezende Saback",
        group,
        title: (item as { project?: string })?.project ?? "Obra",
      },
      seen,
    );
  }

  // 5. Residenciais (garante todos mesmo se a galeria filtrar algum).
  for (const w of residentialWorks ?? []) {
    pushUnique(all, { src: safeSrc(w?.src), alt: w?.alt ?? w?.name ?? "Residencial", group: "Residenciais", title: w?.name ?? "Residencial" }, seen);
  }

  // 6. Comerciais.
  for (const w of commercialWorks ?? []) {
    pushUnique(all, { src: safeSrc(w?.src), alt: w?.alt ?? w?.name ?? "Comercial", group: "Comerciais", title: w?.name ?? "Comercial" }, seen);
  }

  // 7. Casas.
  for (const h of houses ?? []) {
    pushUnique(all, { src: safeSrc(h?.src), alt: h?.alt ?? h?.name ?? "Casa", group: "Casas", title: h?.name ?? "Casa" }, seen);
  }

  // 8. Capas de segmento (podem repetir foto já listada — dedupe cuida).
  for (const s of segments ?? []) {
    pushUnique(all, { src: safeSrc((s as { cover?: unknown })?.cover), alt: (s as { coverAlt?: string })?.coverAlt ?? (s as { label?: string })?.label ?? "Segmento", group: "Segmentos", title: (s as { label?: string })?.label ?? "Segmento" }, seen);
  }

  return all;
}

/** Apenas as URLs (para pré-carregamento em lote). */
export function getAllImageUrls(): string[] {
  return getAllImages()
    .map((i) => i.src)
    .filter(Boolean);
}

/** Total de imagens únicas no catálogo. */
export function countAllImages(): number {
  try {
    return getAllImages().length;
  } catch {
    return 0;
  }
}

export const ALL_IMAGES_STATIC_COUNT = 45;

export function siteUrlOf(path: string): string {
  try {
    const base = (COMPANY as unknown as { site?: string })?.site;
    void base;
  } catch {
    // no-op
  }
  return path;
}
