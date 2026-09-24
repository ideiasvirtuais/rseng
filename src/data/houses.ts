import casaModernista from "@/assets/casas/casa-modernista-condominio.webp.asset.json";
import casaJoaoBosco from "@/assets/casas/joao-bosco.jpg";
import casaJoelma from "@/assets/casas/joelma.jpg";
import casaJoseMaria from "@/assets/casas/jose-maria.jpg";
import casaMarioLucio from "@/assets/casas/mario-lucio-casa.jpg";
import casaNatalicioFiladelfia from "@/assets/casas/natalicio-filadelfia.jpg";
import casaNatalicioMontSerrat from "@/assets/casas/natalicio-mont-serrat-2.jpg";
import casaRenatoBrito from "@/assets/casas/renato-brito.jpg";
import casaSmart from "@/assets/casas/smart.jpg";
import casaWagner from "@/assets/casas/wagner-casa.jpg";

export type House = {
  src: string;
  name: string;
  style: string;
  alt: string;
};

/**
 * Acesso defensivo a imports — nunca lança em module evaluation.
 * Segue o mesmo padrão de commercial.ts e residential.ts.
 * Para imports .asset.json retorna assetUrl; para imports diretos
 * (string), retorna a string. Garante string vazia em vez de throw.
 */
function assetUrl(input: unknown): string {
  try {
    const url = (input as { url?: unknown } | undefined)?.url;
    if (typeof url === "string" && url.length > 0) return url;
    const def = (input as { default?: unknown } | undefined)?.default;
    if (typeof def === "string" && def.length > 0) return def;
    if (typeof input === "string") return input;
  } catch {
    // no-op
  }
  return "";
}

export const houses: House[] = [
  {
    src: assetUrl(casaModernista),
    name: "Residência Modernista em Condomínio",
    style: "Casa de alto padrão · Arquitetura modernista",
    alt: "Casa de alto padrão branca com volumes geométricos, varanda envidraçada e garagem coberta",
  },
  {
    src: assetUrl(casaJoaoBosco),
    name: "Residência João Bosco",
    style: "Casa em condomínio · Alvenaria contemporânea",
    alt: "Fachada da residência João Bosco, casa contemporânea em tons claros",
  },
  {
    src: assetUrl(casaJoelma),
    name: "Residência Joelma",
    style: "Casa alto padrão · Arquitetura modernista",
    alt: "Fachada branca em volumes geométricos da residência Joelma",
  },
  {
    src: assetUrl(casaJoseMaria),
    name: "Residência José Maria",
    style: "Casa em condomínio · Telhado cerâmico",
    alt: "Fachada em tom ocre com telhado cerâmico da residência José Maria",
  },
  {
    src: assetUrl(casaMarioLucio),
    name: "Residência Mário Lúcio",
    style: "Sobrado urbano · Revestimento em pedra",
    alt: "Sobrado amarelo com detalhes em pedra da residência Mário Lúcio",
  },
  {
    src: assetUrl(casaNatalicioFiladelfia),
    name: "Residência Natalício — Filadélfia",
    style: "Casa urbana · Volumes escalonados",
    alt: "Fachada bege com volumes escalonados da residência Natalício no bairro Filadélfia",
  },
  {
    src: assetUrl(casaNatalicioMontSerrat),
    name: "Residência Natalício — Mont Serrat",
    style: "Casa alto padrão · Linhas retas",
    alt: "Casa branca de linhas retas com painel de pedra natural no Mont Serrat",
  },
  {
    src: assetUrl(casaRenatoBrito),
    name: "Residência Renato Brito",
    style: "Casa em condomínio · Estilo colonial contemporâneo",
    alt: "Casa térrea amarela com telhado colonial e jardim tropical",
  },
  {
    src: assetUrl(casaSmart),
    name: "Residencial Smart",
    style: "Casas geminadas · Padrão compacto",
    alt: "Conjunto de casas geminadas do Residencial Smart com portões em lâminas",
  },
  {
    src: assetUrl(casaWagner),
    name: "Residência Wagner",
    style: "Casa em condomínio · Cobertura inclinada",
    alt: "Casa térrea com telhado inclinado e paisagismo da residência Wagner",
  },
];
