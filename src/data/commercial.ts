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

export type CommercialWork = {
  src: string;
  name: string;
  type: string;
  alt: string;
};

export const commercialWorks: CommercialWork[] = [
  {
    src: scala.url,
    name: "Edifício Scala Centro Comercial",
    type: "Centro comercial",
    alt: "Fachada do Edifício Scala Centro Comercial, com volume curvo e lojas no térreo",
  },
  {
    src: epa.url,
    name: "Supermercado EPA Plus",
    type: "Loja âncora · Varejo",
    alt: "Fachada em vermelho e amarelo do supermercado EPA Plus em esquina",
  },
  {
    src: reauto.url,
    name: "Concessionária Reauto Betim",
    type: "Showroom automotivo",
    alt: "Showroom da concessionária Reauto Betim com fachada em vidro e painéis brancos",
  },
  {
    src: niteroi.url,
    name: "Centro Comercial Niterói",
    type: "Centro comercial de esquina",
    alt: "Centro Comercial Niterói, bloco térreo revestido em pastilhas claras com lojas",
  },
  {
    src: portal.url,
    name: "Edifício Portal",
    type: "Sede corporativa",
    alt: "Edifício Portal com fachada cinza e letreiro azul em relevo",
  },
  {
    src: inovatta.url,
    name: "Edifício Inovatta Odontologia",
    type: "Clínica · Sede corporativa",
    alt: "Fachada branca e cinza da clínica Inovatta Odontologia com estacionamento frontal",
  },
  {
    src: janio.url,
    name: "Edifício Jânio",
    type: "Uso misto · Lojas + escritório",
    alt: "Edifício Jânio com fachada em pastilhas bege, volume curvo e lojas no térreo",
  },
  {
    src: marcelo.url,
    name: "Edifício Marcelo — Av. Amazonas",
    type: "Loja + salas comerciais",
    alt: "Edifício comercial na Avenida Amazonas com loja no térreo e salas no pavimento superior",
  },
  {
    src: nilza.url,
    name: "Edifício Nilza",
    type: "Salas comerciais",
    alt: "Edifício Nilza com fachada em pastilhas verdes e janelas corridas nas salas comerciais",
  },
  {
    src: galpaoMarcoTulio.url,
    name: "Galpão Marco Túlio",
    type: "Galpão industrial",
    alt: "Galpão branco com detalhes em pastilha verde, portão metálico e pátio de manobra",
  },
];
