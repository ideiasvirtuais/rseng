/**
 * Acesso defensivo a imports `.asset.json` — nunca lança em module evaluation.
 * Segue o mesmo padrão de commercial.ts e residential.ts.
 * Para imports `.asset.json` retorna a URL do campo `url`;
 * para imports diretos (string), retorna a string.
 * Garante string vazia em vez de throw.
 */
function safeImport<T>(getter: () => T): T | null {
  try {
    return getter();
  } catch {
    return null;
  }
}

function assetUrl(input: unknown): string {
  try {
    // .asset.json: { url: string, ... }
    if (input && typeof input === "object") {
      const obj = input as Record<string, unknown>;
      if (typeof obj.url === "string" && obj.url.length > 0) return obj.url;
      // import Vite direto: { default: string }
      if (typeof obj.default === "string" && obj.default.length > 0) return obj.default;
    }
    // string pura
    if (typeof input === "string" && input.length > 0) return input;
  } catch {
    // no-op
  }
  return "";
}

// Imports defensivos — cada um isolado; se UM falhar, os outros continuam.
const _casaModernista = safeImport(() => import("@/assets/casas/casa-modernista-condominio.webp.asset.json"));
const _casaJoaoBosco = safeImport(() => import("@/assets/casas/joao-bosco.jpg.asset.json"));
const _casaJoelma = safeImport(() => import("@/assets/casas/joelma.jpg.asset.json"));
const _casaJoseMaria = safeImport(() => import("@/assets/casas/jose-maria.jpg.asset.json"));
const _casaMarioLucio = safeImport(() => import("@/assets/casas/mario-lucio-casa.jpg.asset.json"));
const _casaNatalicioFiladelfia = safeImport(() => import("@/assets/casas/natalicio-filadelfia.jpg.asset.json"));
const _casaNatalicioMontSerrat = safeImport(() => import("@/assets/casas/natalicio-mont-serrat-2.jpg.asset.json"));
const _casaRenatoBrito = safeImport(() => import("@/assets/casas/renato-brito.jpg.asset.json"));
const _casaSmart = safeImport(() => import("@/assets/casas/smart.jpg.asset.json"));
const _casaWagner = safeImport(() => import("@/assets/casas/wagner-casa.jpg.asset.json"));

export type House = {
  src: string;
  name: string;
  style: string;
  alt: string;
};

export const houses: House[] = [
  {
    src: assetUrl(_casaModernista),
    name: "Residência Modernista em Condomínio",
    style: "Casa de alto padrão · Arquitetura modernista",
    alt: "Casa de alto padrão branca com volumes geométricos, varanda envidraçada e garagem coberta",
  },
  {
    src: assetUrl(_casaJoaoBosco),
    name: "Residência João Bosco",
    style: "Casa em condomínio · Alvenaria contemporânea",
    alt: "Fachada da residência João Bosco, casa contemporânea em tons claros",
  },
  {
    src: assetUrl(_casaJoelma),
    name: "Residência Joelma",
    style: "Casa alto padrão · Arquitetura modernista",
    alt: "Fachada branca em volumes geométricos da residência Joelma",
  },
  {
    src: assetUrl(_casaJoseMaria),
    name: "Residência José Maria",
    style: "Casa em condomínio · Telhado cerâmico",
    alt: "Fachada em tom ocre com telhado cerâmico da residência José Maria",
  },
  {
    src: assetUrl(_casaMarioLucio),
    name: "Residência Mário Lúcio",
    style: "Sobrado urbano · Revestimento em pedra",
    alt: "Sobrado amarelo com detalhes em pedra da residência Mário Lúcio",
  },
  {
    src: assetUrl(_casaNatalicioFiladelfia),
    name: "Residência Natalício — Filadélfia",
    style: "Casa urbana · Volumes escalonados",
    alt: "Fachada bege com volumes escalonados da residência Natalício no bairro Filadélfia",
  },
  {
    src: assetUrl(_casaNatalicioMontSerrat),
    name: "Residência Natalício — Mont Serrat",
    style: "Casa alto padrão · Linhas retas",
    alt: "Casa branca de linhas retas com painel de pedra natural no Mont Serrat",
  },
  {
    src: assetUrl(_casaRenatoBrito),
    name: "Residência Renato Brito",
    style: "Casa em condomínio · Estilo colonial contemporâneo",
    alt: "Casa térrea amarela com telhado colonial e jardim tropical",
  },
  {
    src: assetUrl(_casaSmart),
    name: "Residencial Smart",
    style: "Casas geminadas · Padrão compacto",
    alt: "Conjunto de casas geminadas do Residencial Smart com portões em lâminas",
  },
  {
    src: assetUrl(_casaWagner),
    name: "Residência Wagner",
    style: "Casa em condomínio · Cobertura inclinada",
    alt: "Casa térrea com telhado inclinado e paisagismo da residência Wagner",
  },
];
