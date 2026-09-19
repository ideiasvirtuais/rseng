/**
 * Rotas literais de segmentos — fonte única de verdade.
 *
 * Extraído de SiteHeader/Logo para quebrar o import circular:
 * Logo.tsx (type) ⇄ SiteHeader.tsx (component).
 * O TanStack Router `code-splitter` recompila a rota em arquivo virtual
 * via Babel; ciclo + `import { Logo } / export { Logo }` gerava
 * `Duplicate declaration "Logo"` e derrubava o preview com tela branca.
 */

export type SegmentRoute =
  | "/edificios-residenciais"
  | "/edificios-comerciais"
  | "/casas-de-alto-padrao";

/**
 * Navegação de segmentos com rotas literais.
 * O `to` do <Link> do TanStack Router resolve a rota em tempo de execução:
 * manter o tipo como união literal (em vez de `string`) garante em
 * compilação que cada destino existe e impede "route match" inválido.
 */
export const segmentNav: { to: SegmentRoute; label: string }[] = [
  { to: "/edificios-residenciais", label: "Residenciais" },
  { to: "/edificios-comerciais", label: "Comerciais" },
  { to: "/casas-de-alto-padrao", label: "Casas" },
];
