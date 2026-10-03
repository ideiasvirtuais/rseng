/**
 * Acesso defensivo a imports `.asset.json` — nunca lança em module evaluation.
 * Segue o mesmo padrão de commercial.ts e residential.ts.
 * Para imports `.asset.json` retorna a URL do campo `url`;
 * para imports diretos (string), retorna a string.
 * Garante string vazia em vez de throw.
 */
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

// A casa modernista usa o asset CDN já publicado. As demais fotos são imports
// Vite diretos para que recebam uma URL real no build e sejam incluídas no FTP.
// Os antigos ponteiros dessas fotos continham "@/assets/..." no campo `url`;
// esse alias só funciona em imports de código e virava uma requisição HTTP 404.
import casaModernistaWebp from "@/assets/casas/casa-modernista-condominio.webp.asset.json";
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

export const houses: House[] = [
  {
    src: assetUrl(casaModernistaWebp),
    name: "Residência Modernista em Condomínio",
    style: "Casa de alto padrão · Arquitetura modernista",
    alt: "Casa de alto padrão branca com volumes geométricos, varanda envidraçada e garagem coberta",
  },
  {
    src: assetUrl(casaJoaoBosco),
    name: "Residência",
    style: "Casa em condomínio · Alvenaria contemporânea",
    alt: "Fachada de residência contemporânea em tons claros",
  },
  {
    src: assetUrl(casaJoelma),
    name: "Residência",
    style: "Casa alto padrão · Arquitetura modernista",
    alt: "Fachada branca em volumes geométricos de residência de alto padrão",
  },
  {
    src: assetUrl(casaJoseMaria),
    name: "Residência",
    style: "Casa em condomínio · Telhado cerâmico",
    alt: "Fachada em tom ocre com telhado cerâmico de residência em condomínio",
  },
  {
    src: assetUrl(casaMarioLucio),
    name: "Residência",
    style: "Sobrado urbano · Revestimento em pedra",
    alt: "Sobrado amarelo com detalhes em pedra e acabamento residencial",
  },
  {
    src: assetUrl(casaNatalicioFiladelfia),
    name: "Residência no Filadélfia",
    style: "Casa urbana · Volumes escalonados",
    alt: "Fachada bege com volumes escalonados de residência no bairro Filadélfia",
  },
  {
    src: assetUrl(casaNatalicioMontSerrat),
    name: "Residência no Mont Serrat",
    style: "Casa alto padrão · Linhas retas",
    alt: "Casa branca de linhas retas com painel de pedra natural no Mont Serrat",
  },
  {
    src: assetUrl(casaRenatoBrito),
    name: "Residência",
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
    name: "Residência",
    style: "Casa em condomínio · Cobertura inclinada",
    alt: "Casa térrea com telhado inclinado e paisagismo em condomínio",
  },
];
