import perspectiva from "@/assets/residenciais/perspectiva.jpg.asset.json";
import raimundo from "@/assets/residenciais/raimundo-rezende.jpg.asset.json";
import jaymeWebp from "@/assets/residenciais/jayme-brasileia.webp.asset.json";
import saoJorge from "@/assets/residenciais/sao-jorge.jpg.asset.json";
import odila from "@/assets/residenciais/odila-zabel.jpg.asset.json";
import beatriz from "@/assets/residenciais/beatriz-ribeiro.jpg.asset.json";
import everest from "@/assets/residenciais/everest.jpg.asset.json";
import alcidesWebp from "@/assets/residenciais/alcides-guilherme.webp.asset.json";
import altaVista from "@/assets/residenciais/alta-vista.jpg.asset.json";
import atenas from "@/assets/residenciais/atenas.jpg.asset.json";
import irisWebp from "@/assets/residenciais/edificio-iris.webp.asset.json";
import joPena from "@/assets/residenciais/edificio-jo-pena-duarte.jpg.asset.json";
import santoriniWebp from "@/assets/residenciais/edificio-santorini.webp.asset.json";
import eros from "@/assets/residenciais/edificio-eros.jpg.asset.json";

// Variantes leves (webp) como primárias — corrigem as falhas de carregamento:
// - edificio-iris.jpg (2,3 MB) possui bytes PNG com extensão .jpg + content-type
//   image/jpeg (MIME divergente → CDN/Apache estrito recusa, watchdog estoura no 3G).
//   O .webp correspondente (179 KB, MIME correto) carrega instantaneamente.
// - jayme-brasileia.jpg (2,0 MB), alcides-guilherme.jpg (1,1 MB) e
//   edificio-santorini.png (1,9 MB) travavam no 3G e pareciam "falha".
//   As variantes .webp (288 KB / 212 KB / 108 KB) resolvem.
const jayme = jaymeWebp;
const alcides = alcidesWebp;
const iris = irisWebp;
const santorini = santoriniWebp;

export type ResidentialWork = {
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

export const residentialWorks: ResidentialWork[] = [
  {
    src: assetUrl(eros),
    name: "Edifício Eros",
    type: "Apartamentos · Centro, Betim",
    alt: "Fachada do Edifício Eros no Centro de Betim, com revestimento cinza, faixas vermelhas e varandas envidraçadas",
  },
  {
    src: assetUrl(iris),
    name: "Edifício Íris",
    type: "Cobertura duplex · 3 quartos",
    alt: "Fachada do Edifício Íris em Betim, com revestimento branco e placa de vendas da Rezende Saback",
  },
  {
    src: assetUrl(joPena),
    name: "Edifício Jó Pena Duarte",
    type: "3 quartos · Filadélfia",
    alt: "Fachada do Edifício Jó Pena Duarte em Betim, com revestimento branco e cinza e varandas envidraçadas",
  },
  {
    src: assetUrl(santorini),
    name: "Edifício Santorini",
    type: "3 quartos · Espírito Santo",
    alt: "Fachada branca e cinza do Edifício Santorini em Betim, com varandas e faixas verticais em pastilha preta",
  },
  {
    src: assetUrl(perspectiva),
    name: "Novo empreendimento — perspectiva",
    type: "Em construção",
    alt: "Perspectiva 3D de edifício residencial com fachada em pastilha marrom e bege",
  },
  {
    src: assetUrl(altaVista),
    name: "Edifício Alta Vista",
    type: "Edifício entregue",
    alt: "Fachada branca do Edifício Alta Vista com varandas em pastilha verde",
  },
  {
    src: assetUrl(atenas),
    name: "Edifício Atenas",
    type: "Edifício entregue",
    alt: "Fachada em tons de cinza do Edifício Atenas com varandas envidraçadas",
  },
  {
    src: assetUrl(alcides),
    name: "Edifício Alcides Guilherme da Silva",
    type: "Edifício entregue",
    alt: "Fachada bege com faixa marrom do Edifício Alcides Guilherme da Silva",
  },
  {
    src: assetUrl(beatriz),
    name: "Edifício Beatriz Ribeiro",
    type: "Edifício entregue",
    alt: "Fachada de esquina do Edifício Beatriz Ribeiro em pastilha azul e branco",
  },
  {
    src: assetUrl(everest),
    name: "Edifício Everest",
    type: "Edifício entregue",
    alt: "Fachada branca do Edifício Everest com varandas em pastilha preta",
  },
  {
    src: assetUrl(odila),
    name: "Edifício Odila Zabel",
    type: "Edifício entregue",
    alt: "Fachada bege e marrom do Edifício Odila Zabel com varandas escalonadas",
  },
  {
    src: assetUrl(raimundo),
    name: "Edifício Raimundo Rezende",
    type: "Edifício entregue",
    alt: "Fachada do Edifício Raimundo Rezende com varandas curvas em pastilha marrom",
  },
  {
    src: assetUrl(saoJorge),
    name: "Edifício São Jorge",
    type: "Edifício entregue",
    alt: "Fachada compacta do Edifício São Jorge com detalhes em cinza e vermelho",
  },
  {
    src: assetUrl(jayme),
    name: "Reforma Edifício Jayme — Brasileia",
    type: "Reforma de fachada",
    alt: "Fachada reformada em pastilha azul e branca do Edifício Jayme no bairro Brasileia",
  },
];
