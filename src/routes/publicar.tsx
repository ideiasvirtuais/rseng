import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Archive,
  CheckCircle2,
  Container,
  Copy,
  FileUp,
  MonitorPlay,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HostingOptionsGrid } from "@/components/HostingOptionsGrid";
import { PortableStatusBadge } from "@/components/PortableStatusBadge";
import { PORTABLE_CHECKLIST } from "@/lib/portability";
import { getSiteUrl } from "@/lib/site-url";
import { COMPANY } from "@/data/company";

const SAFE_NAME =
  typeof COMPANY?.name === "string" && COMPANY.name.length > 0
    ? COMPANY.name
    : "Rezende Saback";

export const Route = createFileRoute("/publicar")({
  head: () => {
    let site = "https://rsengenharia.eng.br";
    try {
      site = getSiteUrl();
    } catch {
      /* prerender sem window */
    }
    return {
      meta: [
        { title: `Publicar em qualquer hospedagem — ${SAFE_NAME}` },
        {
          name: "description",
          content:
            "Baixe o pacote estático .zip e publique o site em qualquer hospedagem (cPanel, Netlify, Vercel, Cloudflare, S3, VPS, IIS). GitHub e KingHost são apenas opções.",
        },
      ],
      links: [{ rel: "canonical", href: `${site}/publicar` }],
    };
  },
  component: PublishPage,
});

const STEPS = [
  {
    icon: Archive,
    title: "1. Gere o pacote",
    cmd: "npm run build:static && npm run package",
    desc: "Compila o site em HTML estático com SEO, fallback SPA e adaptadores para todos os hosts. Saída: dist/rseng-static.zip.",
  },
  {
    icon: FileUp,
    title: "2. Descompacte na hospedagem",
    cmd: "dist/rseng-static.zip → public_html/ (ou www/, /www, htdocs...)",
    desc: "Suba via painel (Gerenciador de Arquivos), FTP, rsync ou arraste no dashboard. Sem Node, sem banco, sem build no servidor.",
  },
  {
    icon: Rocket,
    title: "3. Pronto — teste em 1 minuto",
    cmd: "/obras/golden-mall-rosario + /health.json",
    desc: "Abra uma rota profunda direto (testa o fallback SPA) e confira robots.txt, sitemap.xml e health.json no ar.",
  },
];

const HOSTS_NOTE =
  "GitHub Pages e FTP Napoleon/KingHost são apenas 2 das 10 opções — o mesmo .zip sobe em qualquer host.";

function PublishPage() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* clipboard indisponível */
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden bg-primary text-primary-foreground">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/70" />
          <div className="container-x relative py-16 md:py-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] backdrop-blur">
              <Archive className="h-3.5 w-3.5" aria-hidden="true" />
              Pacote estático · Independente
            </div>
            <div className="mt-4">
              <PortableStatusBadge />
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
              Publique este site em qualquer hospedagem.
            </h1>
            <p className="mt-4 max-w-2xl text-primary-foreground/85">
              Um único <code className="rounded bg-primary-foreground/15 px-1.5 py-0.5 font-mono text-sm">.zip</code> com
              tudo dentro — HTML, CSS, JS, imagens e regras de cada servidor. GitHub e KingHost
              continuam disponíveis, mas como <strong>opções</strong>, nunca como exigência.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => copy("npm run build:static && npm run package")}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-primary transition hover:brightness-105"
              >
                <Copy className="h-4 w-4" aria-hidden="true" />
                {copied ? "Copiado!" : "Copiar comando do pacote"}
              </button>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/40 px-6 py-3 text-sm font-medium text-primary-foreground backdrop-blur hover:bg-primary-foreground/10"
              >
                Voltar ao site
              </Link>
            </div>
          </div>
        </section>

        <section className="container-x section-y">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Como funciona</div>
          <h2 className="mt-4 max-w-2xl">Três passos, cinco minutos, zero servidor.</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((s) => (
              <article key={s.title} className="rounded-2xl border border-border bg-card p-6 transition hover:shadow-xl">
                <s.icon className="h-6 w-6 text-primary" aria-hidden="true" />
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                <button
                  onClick={() => copy(s.cmd)}
                  className="mt-4 block w-full truncate rounded-md bg-secondary px-3 py-2 font-mono text-xs text-primary hover:bg-secondary/70"
                  title="Clique para copiar"
                >
                  {copied === s.cmd ? "✓ copiado" : s.cmd}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-border bg-secondary">
          <div className="container-x section-y">
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Destinos</div>
            <h2 className="mt-4 max-w-2xl">O mesmo .zip, dez destinos — GitHub e FTP são opções.</h2>
            <p className="mt-3 max-w-3xl text-sm text-muted-foreground">{HOSTS_NOTE}</p>
            <div className="mt-10">
              <HostingOptionsGrid />
            </div>
            <p className="mt-6 flex items-start gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden="true" />
              Guia completo para cada provedor em <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">docs/PUBLISH-ANYWHERE.md</code> no
              repositório — incluindo subpasta (BASE_PATH) e domínio próprio (SITE_URL).
            </p>
          </div>
        </section>

        <section className="container-x section-y">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Independente</div>
          <h2 className="mt-4 max-w-2xl">Valide e sirva sem nenhuma conta.</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <article className="rounded-2xl border border-border bg-card p-6">
              <MonitorPlay className="h-6 w-6 text-primary" aria-hidden="true" />
              <h3 className="mt-4 font-semibold">Servidor zero-dependência</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Node puro servindo o pacote como qualquer hospedagem vê — sem Vite, sem FTP, sem GitHub.
              </p>
              <code className="mt-4 block truncate rounded-md bg-secondary px-3 py-2 font-mono text-xs text-primary">
                npm run portable:serve
              </code>
            </article>
            <article className="rounded-2xl border border-border bg-card p-6">
              <ShieldCheck className="h-6 w-6 text-primary" aria-hidden="true" />
              <h3 className="mt-4 font-semibold">Checklist unificado</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Valida fallbacks, adaptadores, rotas e — com --url — o site já no ar.
              </p>
              <code className="mt-4 block truncate rounded-md bg-secondary px-3 py-2 font-mono text-xs text-primary">
                npm run portable:check
              </code>
            </article>
            <article className="rounded-2xl border border-border bg-card p-6">
              <Container className="h-6 w-6 text-primary" aria-hidden="true" />
              <h3 className="mt-4 font-semibold">Docker self-hosted</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Imagem Nginx com o pacote — self-hosted em qualquer VPS.
              </p>
              <code className="mt-4 block truncate rounded-md bg-secondary px-3 py-2 font-mono text-xs text-primary">
                docker compose -f docker-compose.portable.yml up -d
              </code>
            </article>
          </div>
        </section>

        <section className="border-t border-border bg-secondary">
          <div className="container-x section-y">
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Pós-deploy</div>
            <h2 className="mt-4 max-w-2xl">Seis checagens, um minuto.</h2>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {PORTABLE_CHECKLIST.map((c) => (
                <li key={c.id} className="rounded-2xl border border-border bg-card p-5">
                  <p className="font-semibold">{c.label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{c.hint}</p>
                  <code className="mt-3 block truncate rounded-md bg-secondary px-3 py-2 font-mono text-xs text-primary">
                    {c.path}
                  </code>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm text-muted-foreground">
              Automatize com <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">node scripts/portable-check.mjs --url https://meudominio.com</code>.
              Detalhes do FTP opcional (Napoleon/KingHost) em <Link to="/deploy" className="underline underline-offset-2">/deploy</Link>.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
