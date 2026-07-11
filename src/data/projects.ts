import heroBuilding from "@/assets/hero-building.jpg";
import interiorCustom from "@/assets/interior-custom.jpg";
import buildingRosario from "@/assets/building-rosario.jpg";
import buildingIris from "@/assets/building-iris.jpg";
import buildingJopena from "@/assets/building-jopena.jpg";
import buildingMalbec from "@/assets/building-malbec.jpg";
import buildingSantorini from "@/assets/building-santorini.jpg";

export type GalleryCategory = "Fachadas" | "Interiores" | "Áreas Comuns" | "Lançamentos";

export type GalleryItem = {
  src: string;
  alt: string;
  project: string;
  category: GalleryCategory;
};

export type ProjectInfo = { label: string; value: string };

export type Project = {
  slug: string;
  name: string;
  tag: string;
  type: string;
  address: string;
  year: string;
  img: string;
  summary: string;
  description: string[];
  info: ProjectInfo[];
  highlights: string[];
  categories: GalleryCategory[];
  gallery: { src: string; alt: string; category: GalleryCategory }[];
};

export const projects: Project[] = [
  {
    slug: "edificio-rosario",
    name: "Edifício Rosário",
    tag: "Lançamento",
    type: "Business & Home · Flat",
    address: "Rua do Rosário, 446 — Angola",
    year: "2025",
    img: buildingRosario,
    summary:
      "Empreendimento misto no coração do bairro Angola, unindo escritórios inteligentes e flats residenciais com acabamento premium.",
    description: [
      "O Edifício Rosário é o mais novo lançamento da Rezende Saback em Betim, projetado para quem busca uma vida prática e conectada aos principais polos comerciais da cidade.",
      "A torre combina flats residenciais com salas comerciais, hall de entrada assinado, elevadores de alta performance e uma cobertura pensada para o convívio dos moradores.",
    ],
    info: [
      { label: "Status", value: "Em construção" },
      { label: "Tipologia", value: "Flat + Comercial" },
      { label: "Endereço", value: "Rua do Rosário, 446 — Angola, Betim/MG" },
      { label: "Entrega prevista", value: "2025" },
    ],
    highlights: [
      "Hall de entrada com pé-direito duplo",
      "Rooftop com espaço lounge",
      "Salas comerciais no térreo",
      "Elevadores de alta performance",
    ],
    categories: ["Lançamentos", "Fachadas", "Áreas Comuns"],
    gallery: [
      { src: buildingRosario, alt: "Fachada do Edifício Rosário", category: "Lançamentos" },
      { src: buildingRosario, alt: "Hall de entrada do Edifício Rosário", category: "Áreas Comuns" },
      { src: heroBuilding, alt: "Vista noturna do Edifício Rosário", category: "Fachadas" },
      { src: interiorCustom, alt: "Interior padrão do Edifício Rosário", category: "Interiores" },
    ],
  },
  {
    slug: "edificio-iris",
    name: "Edifício Íris",
    tag: "Pronto para morar",
    type: "3 quartos",
    address: "Rua José Augusto Borges, 801 — Angola",
    year: "2024",
    img: buildingIris,
    summary:
      "Apartamentos de 3 quartos com plantas amplas e sacadas integradas, entregues com acabamento diferenciado.",
    description: [
      "O Edifício Íris foi projetado para famílias que buscam conforto e uma localização estratégica no bairro Angola, próximo a escolas, comércios e vias de acesso rápido.",
      "Cada unidade recebeu acabamentos selecionados e opções de personalização de planta antes da entrega das chaves.",
    ],
    info: [
      { label: "Status", value: "Pronto para morar" },
      { label: "Tipologia", value: "3 quartos" },
      { label: "Endereço", value: "Rua José Augusto Borges, 801 — Angola, Betim/MG" },
      { label: "Entrega", value: "2024" },
    ],
    highlights: [
      "Suíte master com closet",
      "Sacada integrada com churrasqueira",
      "Vaga privativa em garagem coberta",
      "Playground e salão de festas",
    ],
    categories: ["Fachadas", "Interiores"],
    gallery: [
      { src: buildingIris, alt: "Fachada do Edifício Íris", category: "Fachadas" },
      { src: interiorCustom, alt: "Sala integrada do Edifício Íris", category: "Interiores" },
      { src: interiorCustom, alt: "Suíte master do Edifício Íris", category: "Interiores" },
    ],
  },
  {
    slug: "edificio-jo-pena-duarte",
    name: "Edifício Jó Pena Duarte",
    tag: "Pronto para morar",
    type: "3 quartos",
    address: "Rua Minas Gerais, 109 — Filadélfia",
    year: "2023",
    img: buildingJopena,
    summary:
      "Residencial de 3 quartos com padrão de acabamento superior no tradicional bairro Filadélfia.",
    description: [
      "O Edifício Jó Pena Duarte foi entregue em 2023 e reforça a presença da Rezende Saback nos bairros mais tradicionais de Betim.",
      "Projeto arquitetônico moderno, com áreas comuns pensadas para o dia a dia das famílias e apartamentos com ótima ventilação natural.",
    ],
    info: [
      { label: "Status", value: "Pronto para morar" },
      { label: "Tipologia", value: "3 quartos" },
      { label: "Endereço", value: "Rua Minas Gerais, 109 — Filadélfia, Betim/MG" },
      { label: "Entrega", value: "2023" },
    ],
    highlights: [
      "Apartamentos com iluminação natural em todos os cômodos",
      "Área gourmet coletiva",
      "Portaria 24h",
      "2 vagas por unidade",
    ],
    categories: ["Fachadas", "Interiores"],
    gallery: [
      { src: buildingJopena, alt: "Fachada do Edifício Jó Pena Duarte", category: "Fachadas" },
      { src: interiorCustom, alt: "Living do Edifício Jó Pena Duarte", category: "Interiores" },
    ],
  },
  {
    slug: "edificio-malbec",
    name: "Edifício Malbec",
    tag: "Pronto para morar",
    type: "3 quartos",
    address: "Rua Olímpia Bueno Franco, 146 — Jardim da Cidade",
    year: "2022",
    img: buildingMalbec,
    summary:
      "Empreendimento no Jardim da Cidade com áreas comuns amplas e apartamentos de 3 quartos generosos.",
    description: [
      "O Edifício Malbec entrega uma proposta de vida integrada, com áreas comuns pensadas para lazer e convivência das famílias moradoras.",
      "Localização privilegiada no Jardim da Cidade, com fácil acesso a colégios, comércios e áreas verdes.",
    ],
    info: [
      { label: "Status", value: "Pronto para morar" },
      { label: "Tipologia", value: "3 quartos" },
      { label: "Endereço", value: "Rua Olímpia Bueno Franco, 146 — Jardim da Cidade, Betim/MG" },
      { label: "Entrega", value: "2022" },
    ],
    highlights: [
      "Piscina adulto e infantil",
      "Espaço fitness equipado",
      "Salão gourmet",
      "Elevador social e de serviço",
    ],
    categories: ["Fachadas", "Áreas Comuns"],
    gallery: [
      { src: buildingMalbec, alt: "Fachada do Edifício Malbec", category: "Fachadas" },
      { src: buildingMalbec, alt: "Área comum do Edifício Malbec", category: "Áreas Comuns" },
      { src: interiorCustom, alt: "Interior padrão do Edifício Malbec", category: "Interiores" as GalleryCategory },
    ],
  },
  {
    slug: "edificio-santorini",
    name: "Edifício Santorini",
    tag: "Pronto para morar",
    type: "3 quartos",
    address: "Rua Santa Catarina, 570 — Espírito Santo",
    year: "2021",
    img: buildingSantorini,
    summary:
      "Residencial com arquitetura contemporânea e apartamentos de 3 quartos no bairro Espírito Santo.",
    description: [
      "O Edifício Santorini traduz o cuidado da Rezende Saback com o entorno: uma fachada limpa, integrada à vizinhança e apartamentos otimizados para o dia a dia.",
      "Padrão construtivo reconhecido e áreas comuns funcionais completam o empreendimento entregue em 2021.",
    ],
    info: [
      { label: "Status", value: "Pronto para morar" },
      { label: "Tipologia", value: "3 quartos" },
      { label: "Endereço", value: "Rua Santa Catarina, 570 — Espírito Santo, Betim/MG" },
      { label: "Entrega", value: "2021" },
    ],
    highlights: [
      "Fachada em pastilhas cerâmicas",
      "Hall decorado",
      "Playground",
      "Estacionamento para visitantes",
    ],
    categories: ["Fachadas"],
    gallery: [
      { src: buildingSantorini, alt: "Fachada do Edifício Santorini", category: "Fachadas" },
      { src: heroBuilding, alt: "Vista do entorno do Edifício Santorini", category: "Fachadas" },
    ],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export const galleryItems: GalleryItem[] = [
  { src: buildingRosario, alt: "Fachada do Edifício Rosário", project: "Edifício Rosário", category: "Lançamentos" },
  { src: buildingIris, alt: "Fachada do Edifício Íris", project: "Edifício Íris", category: "Fachadas" },
  { src: buildingJopena, alt: "Fachada do Edifício Jó Pena Duarte", project: "Edifício Jó Pena Duarte", category: "Fachadas" },
  { src: buildingMalbec, alt: "Fachada do Edifício Malbec", project: "Edifício Malbec", category: "Fachadas" },
  { src: buildingSantorini, alt: "Fachada do Edifício Santorini", project: "Edifício Santorini", category: "Fachadas" },
  { src: heroBuilding, alt: "Vista noturna de fachada residencial", project: "Portfólio Rezende Saback", category: "Fachadas" },
  { src: interiorCustom, alt: "Interior personalizado com acabamento premium", project: "Personalização", category: "Interiores" },
  { src: interiorCustom, alt: "Sala integrada com iluminação natural", project: "Edifício Íris", category: "Interiores" },
  { src: buildingRosario, alt: "Hall de entrada do Edifício Rosário", project: "Edifício Rosário", category: "Áreas Comuns" },
  { src: buildingMalbec, alt: "Área comum do Edifício Malbec", project: "Edifício Malbec", category: "Áreas Comuns" },
];

export const galleryCategories = ["Todas", "Lançamentos", "Fachadas", "Interiores", "Áreas Comuns"] as const;
export type GalleryFilter = (typeof galleryCategories)[number];
