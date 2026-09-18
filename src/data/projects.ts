import heroBuilding from "@/assets/hero-building.jpg";
import rosarioPhoto from "@/assets/residenciais/edificio-rosario.jpg.asset.json";
import irisPhoto from "@/assets/residenciais/edificio-iris.jpg.asset.json";
import jopenaPhoto from "@/assets/residenciais/edificio-jo-pena-duarte.jpg.asset.json";
import malbecPhoto from "@/assets/residenciais/edificio-malbec.jpg.asset.json";
import santoriniPhoto from "@/assets/residenciais/edificio-santorini.png.asset.json";
import { commercialWorks } from "./commercial";
import { residentialWorks } from "./residential";
import { houses } from "./houses";
import { goldenMallCover, goldenMallImages } from "./goldenMall";

const buildingRosario = rosarioPhoto.url;
const buildingMalbec = malbecPhoto.url;
const buildingIris = irisPhoto.url;
const buildingJopena = jopenaPhoto.url;
const buildingSantorini = santoriniPhoto.url;

export type GalleryCategory = "Fachadas" | "Áreas Comuns" | "Lançamentos" | "Comerciais" | "Residenciais" | "Casas";

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
    slug: "golden-mall-rosario",
    name: "Golden Mall – Rosário",
    tag: "Lançamento",
    type: "Lojas para locação e venda",
    address: "Rua do Rosário, 1.036 — Angola",
    year: "Lançamento",
    img: goldenMallCover,
    summary:
      "Lojas para locação e venda em uma das regiões mais promissoras de Betim, com excelente visibilidade e módulos de 90 m² a 140 m².",
    description: [
      "Chegou a oportunidade ideal para instalar ou expandir o seu negócio em uma das regiões mais promissoras de Betim.",
      "Se você procura um ponto comercial que reúna localização, conveniência e potencial de crescimento, o Golden Mall – Rosário é a escolha certa.",
    ],
    info: [
      { label: "Status", value: "Lançamento" },
      { label: "Disponibilidade", value: "Locação e venda" },
      { label: "Quantidade", value: "12 lojas" },
      { label: "Módulos", value: "90 m² a 140 m²" },
      { label: "Endereço", value: "Rua do Rosário, 1.036 — Bairro Angola, Betim/MG" },
    ],
    highlights: [
      "12 lojas",
      "Módulos de 90 m² a 140 m²",
      "Localização estratégica",
      "Região com alto fluxo de pessoas e veículos",
      "Comércio consolidado e grande potencial de consumo no entorno",
      "Excelente visibilidade para sua marca",
    ],
    categories: ["Lançamentos", "Comerciais"],
    gallery: goldenMallImages.map((image, index) => ({
      ...image,
      category: index === goldenMallImages.length - 1 ? "Comerciais" as const : "Lançamentos" as const,
    })),
  },
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
    categories: ["Lançamentos"],
    gallery: [
      { src: buildingRosario, alt: "Fachada do Edifício Rosário", category: "Lançamentos" },
    ],
  },
  {
    slug: "edificio-iris",
    name: "Edifício Íris",
    tag: "Pronto para morar",
    type: "3 quartos + cobertura duplex",
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
      { label: "Tipologia", value: "3 quartos e cobertura duplex" },
      { label: "Vagas", value: "2 vagas por unidade" },
      { label: "Endereço", value: "Rua José Augusto Borges, 801 — Angola, Betim/MG" },
      { label: "Entrega", value: "2024" },
    ],
    highlights: [
      "Cobertura duplex com área gourmet",
      "Suíte master com closet",
      "Sacada integrada com churrasqueira",
      "Vaga privativa em garagem coberta",
      "Água, luz e gás individualizados",
    ],
    categories: ["Fachadas"],
    gallery: [
      { src: buildingIris, alt: "Fachada do Edifício Íris", category: "Fachadas" },
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
    categories: ["Fachadas"],
    gallery: [
      { src: buildingJopena, alt: "Fachada do Edifício Jó Pena Duarte", category: "Fachadas" },
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
      { src: buildingSantorini, alt: "Fachada branca e cinza do Edifício Santorini com varandas e faixas em pastilha preta", category: "Fachadas" },
      { src: heroBuilding, alt: "Vista do entorno do Edifício Santorini", category: "Fachadas" },
    ],
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export const galleryItems: GalleryItem[] = (() => {
  const raw: GalleryItem[] = [
    {
      src: goldenMallCover,
      alt: "Perspectiva da fachada de esquina do Golden Mall Rosário",
      project: "Golden Mall – Rosário",
      category: "Lançamentos" as GalleryCategory,
    },
    { src: buildingRosario, alt: "Fachada do Edifício Rosário", project: "Edifício Rosário", category: "Lançamentos" },
    ...residentialWorks.map((w) => ({
      src: w?.src ?? "",
      alt: w?.alt ?? w?.name ?? "",
      project: w?.name ?? "",
      category: "Residenciais" as GalleryCategory,
    })),
    // commercialWorks[0] reutiliza o mesmo src/cover do Golden Mall já listado
    // acima como "Lançamentos" — filtrar evita chave duplicada
    // (`Golden Mall – Rosário-<src>`) e foto repetida no filtro "Todas".
    ...commercialWorks
      .filter((w) => (w?.src ?? "") !== (goldenMallCover ?? ""))
      .map((w) => ({
        src: w?.src ?? "",
        alt: w?.alt ?? w?.name ?? "",
        project: w?.name ?? "",
        category: "Comerciais" as GalleryCategory,
      })),
    ...houses.map((h) => ({
      src: h?.src ?? "",
      alt: h?.alt ?? h?.name ?? "",
      project: h?.name ?? "",
      category: "Casas" as GalleryCategory,
    })),
  ];
  // Dedupe defensivo por `project|src|category`: garante keys únicas mesmo
  // se duas fontes voltarem a convergir para o mesmo arquivo.
  const seen = new Set<string>();
  return raw.filter((item) => {
    const src = typeof item?.src === "string" ? item.src : "";
    const project = typeof item?.project === "string" ? item.project : "";
    const category = typeof item?.category === "string" ? item.category : "";
    if (!src || !project) return false;
    const k = `${project}|${src}|${category}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
})();

export const galleryCategories = ["Todas", "Lançamentos", "Residenciais", "Comerciais", "Casas"] as const;
export type GalleryFilter = (typeof galleryCategories)[number];
