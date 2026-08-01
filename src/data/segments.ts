import { galleryItems, projects, type Project } from "./projects";
import { houses } from "./houses";

export type SegmentSlug =
  | "edificios-residenciais"
  | "edificios-comerciais"
  | "casas-de-alto-padrao";

export type SegmentPhoto = {
  src: string;
  alt: string;
  title: string;
  caption: string;
};

export type Segment = {
  slug: SegmentSlug;
  label: string;
  eyebrow: string;
  headline: string;
  headlineAccent: string;
  summary: string;
  intro: string[];
  features: string[];
  cover: string;
  coverAlt: string;
  seoTitle: string;
  seoDescription: string;
  projects: Project[];
  photos: SegmentPhoto[];
};

/** Quais empreendimentos aparecem em cada segmento. */
const RESIDENCIAIS = ["edificio-iris", "edificio-jo-pena-duarte", "edificio-malbec", "edificio-santorini", "edificio-rosario"];
const COMERCIAIS = ["edificio-rosario"];

const bySlug = (slugs: string[]) =>
  slugs.map((s) => projects.find((p) => p.slug === s)).filter((p): p is Project => Boolean(p));

const residenciais = bySlug(RESIDENCIAIS);
const comerciais = bySlug(COMERCIAIS);

const residenciaisPhotos: SegmentPhoto[] = residenciais.flatMap((p) =>
  p.gallery
    .filter((g) => g.category !== "Comerciais")
    .map((g) => ({ src: g.src, alt: g.alt, title: p.name, caption: g.category })),
);

const comerciaisPhotos: SegmentPhoto[] = galleryItems
  .filter((g) => g.category === "Comerciais")
  .map((g) => ({ src: g.src, alt: g.alt, title: g.project, caption: "Comercial" }));

const casasPhotos: SegmentPhoto[] = houses.map((h) => ({
  src: h.src,
  alt: h.alt,
  title: h.name,
  caption: h.style,
}));

export const segments: Segment[] = [
  {
    slug: "edificios-residenciais",
    label: "Edifícios Residenciais",
    eyebrow: "Segmento residencial",
    headline: "Edifícios residenciais para",
    headlineAccent: "morar bem em Betim",
    summary:
      "Prédios de apartamentos com plantas amplas, áreas comuns funcionais e acabamento diferenciado, entregues nos principais bairros de Betim.",
    intro: [
      "Desde 1988 a Rezende Saback projeta e executa edifícios residenciais pensados para o dia a dia das famílias de Betim: apartamentos bem ventilados, áreas comuns úteis e um padrão construtivo que se percebe no detalhe.",
      "Cada torre é acompanhada da concepção à entrega das chaves por equipe própria, com possibilidade de personalização de planta antes da obra ser concluída.",
    ],
    features: [
      "Apartamentos de 3 quartos com suíte",
      "Planta personalizável antes da entrega",
      "Áreas comuns: gourmet, fitness e playground",
      "Vagas cobertas e portaria 24h",
    ],
    cover: residenciais[0]?.img ?? "",
    coverAlt: "Fachada de edifício residencial entregue pela Rezende Saback em Betim",
    seoTitle: "Edifícios Residenciais em Betim — Rezende Saback Construtora",
    seoDescription:
      "Apartamentos de 3 quartos, áreas comuns completas e planta personalizável. Conheça os edifícios residenciais entregues e em construção pela Rezende Saback em Betim/MG.",
    projects: residenciais,
    photos: residenciaisPhotos,
  },
  {
    slug: "edificios-comerciais",
    label: "Edifícios Comerciais",
    eyebrow: "Segmento comercial",
    headline: "Salas e edifícios comerciais para",
    headlineAccent: "o seu negócio crescer",
    summary:
      "Lajes, salas e empreendimentos de uso misto em pontos estratégicos de Betim, com infraestrutura pronta para escritórios, clínicas e comércio.",
    intro: [
      "Os empreendimentos comerciais da Rezende Saback nascem em endereços de alta circulação, com fachadas de identidade forte, acessos independentes e infraestrutura elétrica e de dados dimensionada para uso profissional.",
      "Do escritório compacto à laje corporativa, as unidades podem ser combinadas e adaptadas ao formato do seu negócio.",
    ],
    features: [
      "Salas comerciais e lajes adaptáveis",
      "Acesso independente do uso residencial",
      "Infraestrutura elétrica e de dados reforçada",
      "Elevadores de alta performance",
    ],
    cover: comerciais[0]?.img ?? "",
    coverAlt: "Fachada de edifício comercial da Rezende Saback em Betim",
    seoTitle: "Edifícios Comerciais em Betim — Rezende Saback Construtora",
    seoDescription:
      "Salas comerciais, lajes corporativas e empreendimentos de uso misto em Betim/MG, com infraestrutura pronta para escritórios, clínicas e comércio.",
    projects: comerciais,
    photos: comerciaisPhotos,
  },
  {
    slug: "casas-de-alto-padrao",
    label: "Casas de Alto Padrão",
    eyebrow: "Segmento residencial unifamiliar",
    headline: "Casas de alto padrão",
    headlineAccent: "executadas sob medida",
    summary:
      "Residências unifamiliares entregues em Betim e região — do projeto modernista à casa em condomínio, com execução própria e acabamento premium.",
    intro: [
      "Construímos casas de alto padrão do alicerce ao paisagismo, com acompanhamento técnico contínuo e fornecedores auditados. Cada residência é única, executada a partir do projeto do cliente ou desenvolvida junto com nossa equipe.",
      "Revestimentos naturais, automação, iluminação cênica e áreas de lazer integradas fazem parte do repertório das obras já entregues.",
    ],
    features: [
      "Execução completa: fundação, estrutura e acabamento",
      "Revestimentos naturais e marcenaria sob medida",
      "Áreas de lazer, piscina e paisagismo integrados",
      "Acompanhamento técnico e assistência pós-obra",
    ],
    cover: casasPhotos[1]?.src ?? casasPhotos[0]?.src ?? "",
    coverAlt: "Fachada de casa de alto padrão construída pela Rezende Saback",
    seoTitle: "Casas de Alto Padrão em Betim — Rezende Saback Construtora",
    seoDescription:
      "Residências unifamiliares de alto padrão construídas em Betim e região: arquitetura contemporânea, acabamento premium e execução com equipe própria.",
    projects: [],
    photos: casasPhotos,
  },
];

export function getSegment(slug: SegmentSlug): Segment {
  return segments.find((s) => s.slug === slug)!;
}
