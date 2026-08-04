import perspectiva from "@/assets/residenciais/perspectiva.jpg.asset.json";
import raimundo from "@/assets/residenciais/raimundo-rezende.jpg.asset.json";
import jayme from "@/assets/residenciais/jayme-brasileia.jpg.asset.json";
import saoJorge from "@/assets/residenciais/sao-jorge.jpg.asset.json";
import odila from "@/assets/residenciais/odila-zabel.jpg.asset.json";
import beatriz from "@/assets/residenciais/beatriz-ribeiro.jpg.asset.json";
import everest from "@/assets/residenciais/everest.jpg.asset.json";
import alcides from "@/assets/residenciais/alcides-guilherme.jpg.asset.json";
import altaVista from "@/assets/residenciais/alta-vista.jpg.asset.json";
import atenas from "@/assets/residenciais/atenas.jpg.asset.json";
import iris from "@/assets/residenciais/edificio-iris.jpg.asset.json";
import joPena from "@/assets/residenciais/edificio-jo-pena-duarte.jpg.asset.json";
import santorini from "@/assets/residenciais/edificio-santorini.png.asset.json";
import eros from "@/assets/residenciais/edificio-eros.jpg.asset.json";

export type ResidentialWork = {
  src: string;
  name: string;
  type: string;
  alt: string;
};

export const residentialWorks: ResidentialWork[] = [
  {
    src: iris.url,
    name: "Edifício Íris",
    type: "Cobertura duplex · 3 quartos",
    alt: "Fachada do Edifício Íris em Betim, com revestimento branco e placa de vendas da Rezende Saback",
  },
  {
    src: joPena.url,
    name: "Edifício Jó Pena Duarte",
    type: "3 quartos · Filadélfia",
    alt: "Fachada do Edifício Jó Pena Duarte em Betim, com revestimento branco e cinza e varandas envidraçadas",
  },
  {
    src: santorini.url,
    name: "Edifício Santorini",
    type: "3 quartos · Espírito Santo",
    alt: "Fachada branca e cinza do Edifício Santorini em Betim, com varandas e faixas verticais em pastilha preta",
  },
  {
    src: perspectiva.url,
    name: "Novo empreendimento — perspectiva",
    type: "Em construção",
    alt: "Perspectiva 3D de edifício residencial com fachada em pastilha marrom e bege",
  },
  {
    src: altaVista.url,
    name: "Edifício Alta Vista",
    type: "Edifício entregue",
    alt: "Fachada branca do Edifício Alta Vista com varandas em pastilha verde",
  },
  {
    src: atenas.url,
    name: "Edifício Atenas",
    type: "Edifício entregue",
    alt: "Fachada em tons de cinza do Edifício Atenas com varandas envidraçadas",
  },
  {
    src: alcides.url,
    name: "Edifício Alcides Guilherme da Silva",
    type: "Edifício entregue",
    alt: "Fachada bege com faixa marrom do Edifício Alcides Guilherme da Silva",
  },
  {
    src: beatriz.url,
    name: "Edifício Beatriz Ribeiro",
    type: "Edifício entregue",
    alt: "Fachada de esquina do Edifício Beatriz Ribeiro em pastilha azul e branco",
  },
  {
    src: everest.url,
    name: "Edifício Everest",
    type: "Edifício entregue",
    alt: "Fachada branca do Edifício Everest com varandas em pastilha preta",
  },
  {
    src: odila.url,
    name: "Edifício Odila Zabel",
    type: "Edifício entregue",
    alt: "Fachada bege e marrom do Edifício Odila Zabel com varandas escalonadas",
  },
  {
    src: raimundo.url,
    name: "Edifício Raimundo Rezende",
    type: "Edifício entregue",
    alt: "Fachada do Edifício Raimundo Rezende com varandas curvas em pastilha marrom",
  },
  {
    src: saoJorge.url,
    name: "Edifício São Jorge",
    type: "Edifício entregue",
    alt: "Fachada compacta do Edifício São Jorge com detalhes em cinza e vermelho",
  },
  {
    src: jayme.url,
    name: "Reforma Edifício Jayme — Brasileia",
    type: "Reforma de fachada",
    alt: "Fachada reformada em pastilha azul e branca do Edifício Jayme no bairro Brasileia",
  },
];
