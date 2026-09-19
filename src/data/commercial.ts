import epa from "@/assets/comerciais/epa.jpg.asset.json";
import galpaoMarcoTulio from "@/assets/comerciais/galpao-marco-tulio.jpg.asset.json";
import inovatta from "@/assets/comerciais/inovatta.jpg.asset.json";
import janio from "@/assets/comerciais/janio.jpg.asset.json";
import niteroi from "@/assets/comerciais/centro-comercial-niteroi.jpg.asset.json";
import marcelo from "@/assets/comerciais/marcelo-av-amazonas.jpg.asset.json";
import nilza from "@/assets/comerciais/nilza.jpg.asset.json";
import portal from "@/assets/comerciais/portal.jpg.asset.json";
import reauto from "@/assets/comerciais/reauto-betim.jpg.asset.json";
import scala from "@/assets/comerciais/ed-scala.jpg.asset.json";
import { goldenMallCover } from "./goldenMall";

export type CommercialWork = {
  src: string;
  name: string;
  type: string;
  alt: string;
};

/** Acesso defensivo a imports `.asset.json` — nunca lança em module evaluation. */
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

export const commercialWorks: CommercialWork[] = [
  {
    src: goldenMallCover,
    name: "Golden Mall – Rosário",
    type: "Lançamento · Lojas para locação e venda",
    alt: "Perspectiva da fachada do Golden Mall Rosário, centro comercial com 12 lojas em Betim",
  },
  {
    src: assetUrl(scala),
    name: "Edifício Scala Centro Comercial",
    type: "Centro comercial",
    alt: "Fachada do Edifício Scala Centro Comercial, com volume curvo e lojas no térreo",
  },
  {
    src: assetUrl(epa),
    name: "Supermercado EPA Plus",
    type: "Loja âncora · Varejo",
    alt: "Fachada em vermelho e amarelo do supermercado EPA Plus em esquina",
  },
  {
    src: assetUrl(reauto),
    name: "Concessionária Reauto Betim",
    type: "Showroom automotivo",
    alt: "Showroom da concessionária Reauto Betim com fachada em vidro e painéis brancos",
  },
  {
    src: assetUrl(niteroi),
    name: "Centro Comercial Niterói",
    type: "Centro comercial de esquina",
    alt: "Centro Comercial Niterói, bloco térreo revestido em pastilhas claras com lojas",
  },
  {
    src: assetUrl(portal),
    name: "Edifício Portal",
    type: "Sede corporativa",
    alt: "Edifício Portal com fachada cinza e letreiro azul em relevo",
  },
  {
    src: assetUrl(inovatta),
    name: "Edifício Inovatta Odontologia",
    type: "Clínica · Sede corporativa",
    alt: "Fachada branca e cinza da clínica Inovatta Odontologia com estacionamento frontal",
  },
  {
    src: assetUrl(janio),
    name: "Edifício Jânio",
    type: "Uso misto · Lojas + escritório",
    alt: "Edifício Jânio com fachada em pastilhas bege, volume curvo e lojas no térreo",
  },
  {
    src: assetUrl(marcelo),
    name: "Edifício Marcelo — Av. Amazonas",
    type: "Loja + salas comerciais",
    alt: "Edifício comercial na Avenida Amazonas com loja no térreo e salas no pavimento superior",
  },
  {
    src: assetUrl(nilza),
    name: "Edifício Nilza",
    type: "Salas comerciais",
    alt: "Edifício Nilza com fachada em pastilhas verdes e janelas corridas nas salas comerciais",
  },
  {
    src: assetUrl(galpaoMarcoTulio),
    name: "Galpão Marco Túlio",
    type: "Galpão industrial",
    alt: "Galpão branco com detalhes em pastilha verde, portão metálico e pátio de manobra",
  },
];
