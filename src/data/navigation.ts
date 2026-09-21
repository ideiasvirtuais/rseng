/**
 * Fonte única de verdade da navegação por âncoras da home.
 *
 * - "Lançamento" é item FIXO do menu (desktop + mobile, home + header global).
 * - Âncora canônica: #lancamento (URL: https://rsengenharia.eng.br/#lancamento).
 * - Alias legado: #personalizacao — mantido para compatibilidade com links
 *   antigos e redirecionado via `Index` (replaceState + scroll suave).
 */

export type AnchorNavItem = {
  /** href usado na home (curto, ex: "#lancamento"). */
  href: string;
  /** href absoluto usado no header global (funciona de qualquer rota). */
  absoluteHref: string;
  label: string;
  /** Item fixo com destaque visual (pill) — nunca deve sair do menu. */
  highlight?: boolean;
};

export const LAUNCH_ANCHOR_ID = "lancamento" as const;
export const LAUNCH_ANCHOR_LEGACY_ID = "personalizacao" as const;

export const HOME_ANCHOR_NAV: AnchorNavItem[] = [
  { href: "#lancamento", absoluteHref: "/#lancamento", label: "Lançamento", highlight: true },
  { href: "#sobre", absoluteHref: "/#sobre", label: "Sobre" },
  { href: "#contato", absoluteHref: "/#contato", label: "Contato" },
];
