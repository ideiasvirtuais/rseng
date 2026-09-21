import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  HardHat,
  MapPin,
  PlugZap,
  Ruler,
  Sparkles,
  Store,
} from "lucide-react";

import { SmartImage } from "@/components/SmartImage";
import { COMPANY } from "@/data/company";
import { goldenMallCover } from "@/data/goldenMall";

type SpotlightPerk = {
  icon: typeof Ruler;
  title: string;
  description: string;
};

/** Títulos 1:1 com a especificação — não alterar o texto sem alinhar com o time. */
const PERKS: SpotlightPerk[] = [
  {
    icon: Ruler,
    title: "Planta adaptável antes da obra",
    description:
      "No Golden Mall Rosário, módulos de 90 m² a 140 m² que se combinam conforme a operação — loja, sobreloja, estoque ou atendimento.",
  },
  {
    icon: Sparkles,
    title: "Acabamentos premium à sua escolha",
    description:
      "Fachada, piso e forro com padrão diferenciado, definidos com você antes mesmo da entrega das chaves.",
  },
  {
    icon: PlugZap,
    title: "Instalações elétricas customizadas",
    description:
      "Carga elétrica, iluminação, climatização e pontos hidráulicos sob medida para o seu negócio operar sem adaptações.",
  },
  {
    icon: HardHat,
    title: "Acompanhamento técnico contínuo",
    description:
      "Engenharia própria do projeto à entrega — e suporte pós-obra com a Rezende Saback.",
  },
];

const QUICK_FACTS = [
  { icon: Store, value: "12 lojas", label: "Locação e venda" },
  { icon: Ruler, value: "90–140 m²", label: "Módulos flexíveis" },
  { icon: MapPin, value: "Rua do Rosário, 1.036", label: "Angola · Betim/MG" },
] as const;

/**
 * Destaque "Feito para você" — dedicado ao lançamento Golden Mall Rosário.
 * Copy fiel à especificação + contexto do lançamento, prova visual real,
 * ficha rápida e CTAs para a página da obra e central de vendas.
 */
export function GoldenMallSpotlight() {
  const whatsappNumber =
    (COMPANY as { whatsapp?: { number?: unknown } } | undefined)?.whatsapp?.number;
  const safeNumber =
    typeof whatsappNumber === "string" && whatsappNumber.length > 0
      ? whatsappNumber
      : "5531993040342";
  const foundedYear =
    (COMPANY as { foundedYear?: unknown } | undefined)?.foundedYear;
  const safeYear = typeof foundedYear === "number" ? foundedYear : 2005;
  const coverSrc = typeof goldenMallCover === "string" ? goldenMallCover : "";
  const whatsappUrl = `https://wa.me/${safeNumber}?text=${encodeURIComponent(
    "Olá! Vi o destaque do Golden Mall Rosário na home e quero receber a tabela e a planta das lojas.",
  )}`;

  return (
    <section
      id="lancamento"
      aria-labelledby="golden-mall-spotlight-title"
      className="relative scroll-mt-24 overflow-hidden bg-primary text-primary-foreground lg:scroll-mt-28"
    >
      {/* Textura / glow de fundo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-primary-foreground/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="container-x section-y relative grid gap-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
        {/* Visual */}
        <div className="relative">
          <div className="relative overflow-hidden rounded-3xl border border-primary-foreground/20 shadow-2xl">
            <SmartImage
              src={coverSrc}
              alt="Perspectiva da fachada de esquina do Golden Mall Rosário — lançamento comercial no bairro Angola, Betim/MG"
              wrapperClassName="block w-full"
              skeletonClassName="aspect-[4/3] w-full"
              className="aspect-[4/3] w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />

            {/* Badge lançamento */}
            <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-primary shadow-lg">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Lançamento
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/30 bg-primary/70 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary-foreground backdrop-blur-md">
                <BadgeCheck className="h-3.5 w-3.5 text-accent" />
                Golden Mall · Rosário
              </span>
            </div>

            {/* Card flutuante */}
            <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-primary-foreground/25 bg-primary-foreground/10 p-4 backdrop-blur-xl sm:flex sm:items-center sm:justify-between sm:gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
                  Lançamento · Angola, Betim
                </p>
                <p className="mt-1 text-sm font-semibold text-primary-foreground">
                  12 lojas · Módulos de 90 m² a 140 m²
                </p>
                <p className="text-xs text-primary-foreground/75">
                  Rua do Rosário, 1.036 — Angola, Betim/MG
                </p>
              </div>
              <Link
                to="/obras/$slug"
                params={{ slug: "golden-mall-rosario" }}
                className="mt-3 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-primary transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary sm:mt-0"
              >
                Ver planta
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Selo de garantia */}
          <div className="absolute -right-3 -top-5 hidden rotate-3 rounded-2xl border border-accent/40 bg-primary-foreground px-4 py-3 text-primary shadow-xl sm:block">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
              Rezende Saback
            </p>
            <p className="text-sm font-bold">Desde {safeYear} em Betim</p>
          </div>
        </div>

        {/* Copy — fiel à especificação */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Feito para você
          </p>

          <h2 id="golden-mall-spotlight-title" className="mt-5 text-primary-foreground">
            Receba as chaves com o seu imóvel <span className="text-accent">já pronto</span>
            <span className="mt-3 block text-[1.1rem] font-medium leading-snug tracking-normal text-primary-foreground/85">
              no lançamento Golden Mall Rosário — Angola, Betim.
            </span>
          </h2>

          <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-primary-foreground/90">
            Planta customizada, instalações elétricas e hidráulicas sob medida e
            acabamentos diferenciados escolhidos antes mesmo da mudança. Você entra em
            um apartamento pensado exatamente do jeito que sempre quis.
          </p>
          <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-primary-foreground/75">
            No Golden Mall Rosário, esse mesmo padrão de personalização se traduz em
            lojas para locação e venda — com excelente visibilidade, alto fluxo de
            pessoas e veículos e módulos prontos para o seu negócio operar.
          </p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {PERKS.map((perk) => (
              <li
                key={perk.title}
                className="group rounded-2xl border border-primary-foreground/15 bg-primary-foreground/[0.07] p-4 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-accent/60 hover:bg-primary-foreground/[0.12]"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-primary transition group-hover:scale-110">
                  <perk.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="mt-3 text-sm font-semibold text-primary-foreground">
                  {perk.title}
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-primary-foreground/75">
                  {perk.description}
                </p>
              </li>
            ))}
          </ul>

          {/* Ficha rápida do lançamento */}
          <dl className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-primary-foreground/15 bg-primary-foreground/15 sm:grid-cols-3">
            {QUICK_FACTS.map((fact) => (
              <div key={fact.label} className="bg-primary px-4 py-4">
                <dt className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-primary-foreground/65">
                  <fact.icon className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  {fact.label}
                </dt>
                <dd className="mt-1 text-[15px] font-semibold text-primary-foreground">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/obras/$slug"
              params={{ slug: "golden-mall-rosario" }}
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold text-primary shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Conheça o Golden Mall Rosário
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/35 px-6 py-3.5 text-sm font-semibold text-primary-foreground backdrop-blur transition hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Falar com consultor
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          <p className="mt-5 text-xs text-primary-foreground/60">
            Locação e venda · Excelente visibilidade · Alto fluxo de pessoas e veículos
            no entorno do Angola.
          </p>
        </div>
      </div>
    </section>
  );
}
