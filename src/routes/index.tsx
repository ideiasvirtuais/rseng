import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Diamond, Instagram, Mail, MapPin, Phone } from "lucide-react";
import heroBuilding from "@/assets/hero-building.jpg";
import interiorCustom from "@/assets/interior-custom.jpg";
import buildingRosario from "@/assets/building-rosario.jpg";
import buildingIris from "@/assets/building-iris.jpg";
import buildingJopena from "@/assets/building-jopena.jpg";
import buildingMalbec from "@/assets/building-malbec.jpg";
import buildingSantorini from "@/assets/building-santorini.jpg";
import logoAsset from "@/assets/logo-rezende-saback.png.asset.json";

export const Route = createFileRoute("/")({
  component: Index,
});

const projects = [
  {
    name: "Edifício Rosário",
    tag: "Lançamento",
    type: "Business & Home · Flat",
    address: "Rua do Rosário, 446 — Angola",
    year: "2025",
    img: buildingRosario,
  },
  {
    name: "Edifício Íris",
    tag: "Pronto para morar",
    type: "3 quartos",
    address: "Rua José Augusto Borges, 801 — Angola",
    year: "2024",
    img: buildingIris,
  },
  {
    name: "Edifício Jó Pena Duarte",
    tag: "Pronto para morar",
    type: "3 quartos",
    address: "Rua Minas Gerais, 109 — Filadélfia",
    year: "2023",
    img: buildingJopena,
  },
  {
    name: "Edifício Malbec",
    tag: "Pronto para morar",
    type: "3 quartos",
    address: "Rua Olímpia Bueno Franco, 146 — Jardim da Cidade",
    year: "2022",
    img: buildingMalbec,
  },
  {
    name: "Edifício Santorini",
    tag: "Pronto para morar",
    type: "3 quartos",
    address: "Rua Santa Catarina, 570 — Espírito Santo",
    year: "2021",
    img: buildingSantorini,
  },
];

const stats = [
  { n: "35+", l: "Anos de história" },
  { n: "40+", l: "Obras entregues" },
  { n: "1.200+", l: "Famílias atendidas" },
  { n: "5", l: "Empreendimentos ativos" },
];

const perks = [
  "Planta adaptável antes da obra",
  "Acabamentos premium à sua escolha",
  "Instalações elétricas customizadas",
  "Acompanhamento técnico contínuo",
];

function Logo({ variant = "dark" }: { variant?: "dark" | "light" }) {
  return (
    <a href="#top" className="flex items-center">
      <img
        src={logoAsset.url}
        alt="Rezende Saback Construtora"
        width={220}
        height={64}
        className={`h-11 w-auto ${variant === "light" ? "brightness-0 invert" : ""}`}
      />
    </a>
  );
}

function Index() {
  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="container-x flex h-20 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-8 text-sm font-medium text-primary/80 md:flex">
            <a href="#empreendimentos" className="hover:text-primary">Empreendimentos</a>
            <a href="#personalizacao" className="hover:text-primary">Personalização</a>
            <a href="#sobre" className="hover:text-primary">Sobre</a>
            <a href="#instagram" className="hover:text-primary">Instagram</a>
            <a href="#contato" className="hover:text-primary">Contato</a>
          </nav>
          <a
            href="#contato"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Central de vendas <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="relative h-[92vh] min-h-[640px] w-full">
          <img
            src={heroBuilding}
            alt="Fachada residencial ao entardecer"
            width={1920}
            height={1280}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/40 via-primary/30 to-background" />
          <div className="container-x relative flex h-full flex-col justify-end pb-16 pt-32">
            <div className="max-w-3xl text-primary-foreground">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Desde 1988 · Betim, Minas Gerais
              </div>
              <h1>
                A cidade que <span className="text-accent">cresce</span> com quem constrói para durar.
              </h1>
              <p className="mt-6 max-w-xl text-lg text-primary-foreground/85">
                Empreendimentos residenciais e comerciais projetados com acabamento diferenciado, planta customizável e a assinatura de mais de três décadas de engenharia.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#empreendimentos" className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-primary transition hover:brightness-105">
                  Ver empreendimentos <ArrowUpRight className="h-4 w-4" />
                </a>
                <a href="#contato" className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/40 px-6 py-3 text-sm font-medium text-primary-foreground backdrop-blur hover:bg-primary-foreground/10">
                  Falar com um consultor
                </a>
              </div>
            </div>

            {/* Feature card */}
            <div className="mt-14 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10 p-6 backdrop-blur-md lg:max-w-md">
                <div className="text-xs uppercase tracking-[0.2em] text-accent">Lançamento</div>
                <div className="mt-2 text-xl font-semibold text-primary-foreground">Edifício Rosário</div>
                <div className="mt-1 text-sm text-primary-foreground/75">Business & Home · Angola</div>
                <a href="#empreendimentos" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                  Conheça o empreendimento <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="container-x -mt-16 relative z-10">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-xl lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.l} className="bg-card p-8">
                <div className="text-4xl font-semibold text-primary tracking-tight">{s.n}</div>
                <div className="mt-2 text-sm text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Empreendimentos */}
      <section id="empreendimentos" className="container-x section-y">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Portfólio</div>
            <h2 className="mt-4">
              Empreendimentos que formam <span className="text-primary/70">bairros inteiros</span>.
            </h2>
          </div>
          <p className="text-muted-foreground">
            De lançamentos a imóveis prontos para morar. Cada projeto assinado pela Rezende Saback carrega o mesmo padrão de acabamento e a mesma preocupação com a vizinhança.
          </p>
        </div>

        <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <article key={p.name} className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-xl">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={p.img}
                  alt={p.name}
                  width={1200}
                  height={900}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-background/95 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-primary">
                  {p.tag}
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-primary">{p.name}</h3>
                <div className="mt-1 text-sm text-muted-foreground">{p.type}</div>
                <div className="mt-4 flex items-start justify-between gap-4 border-t border-border pt-4 text-sm">
                  <span className="text-muted-foreground">{p.address}</span>
                  <span className="font-medium text-primary">— {p.year}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Personalização */}
      <section id="personalizacao" className="bg-primary text-primary-foreground">
        <div className="container-x grid gap-16 section-y lg:grid-cols-2 lg:items-center">
          <div className="relative overflow-hidden rounded-2xl">
            <img
              src={interiorCustom}
              alt="Interior de apartamento personalizado"
              width={1400}
              height={1000}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-accent">Feito para você</div>
            <h2 className="mt-4">
              Receba as chaves com o seu imóvel <span className="text-accent">já pronto</span>.
            </h2>
            <p className="mt-6 text-primary-foreground/80">
              Planta customizada, instalações elétricas e hidráulicas sob medida e acabamentos diferenciados escolhidos antes mesmo da mudança. Você entra em um apartamento pensado exatamente do jeito que sempre quis.
            </p>
            <ul className="mt-8 space-y-4">
              {perks.map((perk) => (
                <li key={perk} className="flex items-start gap-3">
                  <Diamond className="mt-0.5 h-4 w-4 flex-none fill-accent text-accent" />
                  <span className="text-primary-foreground/90">{perk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Sobre */}
      <section id="sobre" className="container-x section-y">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Sobre a construtora</div>
            <h2 className="mt-4">
              Três décadas construindo o skyline de Betim — um empreendimento sólido de cada vez.
            </h2>
          </div>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              A Rezende Saback nasceu com o compromisso de entregar residências duráveis, com técnica apurada e acabamento honesto. Trabalhamos com equipe própria, fornecedores auditados e um padrão de qualidade que se vê no detalhe.
            </p>
            <p>
              Nosso portfólio combina lançamentos comerciais e residenciais, sempre em localizações estratégicas. Cada projeto é acompanhado da concepção à entrega das chaves, e continua com o cliente através da nossa assistência pós-obra.
            </p>
          </div>
        </div>
      </section>

      {/* Instagram */}
      <section id="instagram" className="border-y border-border bg-secondary">
        <div className="container-x section-y text-center">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Nas redes</div>
          <h2 className="mt-4">
            Acompanhe as obras no nosso <span className="text-primary/70">Instagram</span>.
          </h2>
          <a
            href="https://www.instagram.com/rezendesabackengenharia/"
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-primary hover:underline"
          >
            <Instagram className="h-4 w-4" /> @rezendesabackengenharia
          </a>
          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-dashed border-border bg-card/60 p-8 text-sm text-muted-foreground">
            <div className="font-medium text-primary">Feed do Instagram em configuração</div>
            <p className="mt-2">
              Para exibir as postagens do perfil aqui automaticamente, conecte um widget do Instagram e insira o ID no arquivo <code className="rounded bg-muted px-1.5 py-0.5">src/routes/index.tsx</code>.
            </p>
            <a
              href="https://www.instagram.com/rezendesabackengenharia/"
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              Ver perfil enquanto isso <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="container-x section-y">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Central de vendas</div>
            <h2 className="mt-4">
              Cadastre-se e receba <span className="text-primary/70">os próximos lançamentos</span>.
            </h2>
            <p className="mt-6 text-muted-foreground">
              Deixe seus dados abaixo ou fale diretamente com um consultor. Retornamos em até um dia útil.
            </p>

            <div className="mt-10 space-y-4">
              {[
                { icon: Phone, label: "31 3531 1342", href: "tel:+553135311342" },
                { icon: Phone, label: "31 3531 1384", href: "tel:+553135311384" },
                { icon: Phone, label: "31 99304 0342", href: "tel:+5531993040342" },
                { icon: Mail, label: "contato@rsengenharia.eng.br", href: "mailto:contato@rsengenharia.eng.br" },
              ].map((c) => (
                <a key={c.label} href={c.href} className="flex items-center gap-3 text-primary hover:underline">
                  <c.icon className="h-4 w-4" /> {c.label}
                </a>
              ))}
              <div className="flex items-start gap-3 pt-4 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 flex-none text-primary" />
                <div>
                  Av. Teotônio Parreira Coelho, 613, 6º andar<br />
                  Jardim da Cidade, Betim · CEP 32604275
                </div>
              </div>
            </div>
          </div>

          <form
            className="rounded-2xl border border-border bg-card p-8 shadow-sm"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="grid gap-5">
              <Field label="Nome" required>
                <input type="text" required className="input" />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Telefone" required>
                  <input type="tel" required className="input" />
                </Field>
                <Field label="E-mail" required>
                  <input type="email" required className="input" />
                </Field>
              </div>
              <Field label="Interesse">
                <select className="input">
                  <option>Edifício Rosário (lançamento)</option>
                  <option>Imóveis prontos para morar</option>
                  <option>Personalização de plantas</option>
                  <option>Outro assunto</option>
                </select>
              </Field>
              <Field label="Mensagem">
                <textarea rows={4} className="input resize-none" />
              </Field>
              <button
                type="submit"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
              >
                Enviar mensagem <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-primary text-primary-foreground">
        <div className="container-x flex flex-col items-start justify-between gap-6 py-10 sm:flex-row sm:items-center">
          <Logo variant="light" />

          <div className="text-xs text-primary-foreground/60">
            © {new Date().getFullYear()} Rezende Saback Construtora e Incorporadora. Todos os direitos reservados.
          </div>
        </div>
      </footer>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid var(--color-border);
          background: var(--color-background);
          border-radius: 0.5rem;
          padding: 0.65rem 0.9rem;
          font-size: 0.9rem;
          color: var(--color-foreground);
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px color-mix(in oklab, var(--color-primary) 15%, transparent);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
        {required && <span className="text-accent"> *</span>}
      </span>
      {children}
    </label>
  );
}
