import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  CloudUpload,
  FileWarning,
  Globe,
  FlaskConical,
  ShieldCheck,
  History,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DeployChecklist } from "@/components/deploy/DeployChecklist";
import { useDeployChecklist } from "@/hooks/use-deploy-status";
import {
  DEPLOY_HISTORY_MOCK,
  DEPLOY_STEPS,
  DEPLOY_TARGETS,
  FTP_HOST,
  SITE_URL,
} from "@/data/deploy";
import { COMPANY } from "@/data/company";

const SAFE_FTP_HOST = typeof FTP_HOST === "string" && FTP_HOST.length > 0 ? FTP_HOST : "ftp.rsengenharia.eng.br";
const SAFE_SITE_URL =
  typeof SITE_URL === "string" && SITE_URL.length > 0 ? SITE_URL : "https://rsengenharia.eng.br";
const SAFE_COMPANY_NAME =
  typeof COMPANY?.name === "string" && COMPANY.name.length > 0 ? COMPANY.name : "Rezende Saback";

export const Route = createFileRoute("/deploy")({
  head: () => ({
    meta: [
      { title: `Publicação FTP — ${SAFE_COMPANY_NAME}` },
      {
        name: "description",
        content:
          "Guia de publicação do site via FTP: conexão, build estático, validação e deploy incremental para rsengenharia.eng.br.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: `${SAFE_SITE_URL}/deploy` }],
  }),
  component: DeployPage,
});

function DeployPage() {
  // Hook nunca pode derrubar a rota: defaults defensivos se o retorno
  // vier incompleto (HMR parcial, contexto quebrado).
  let checklist: ReturnType<typeof useDeployChecklist> | undefined;
  try {
    checklist = useDeployChecklist();
  } catch {
    checklist = undefined;
  }
  const done = checklist?.done instanceof Set ? checklist.done : new Set<number>();
  const toggle = typeof checklist?.toggle === "function" ? checklist.toggle : () => {};
  const reset = typeof checklist?.reset === "function" ? checklist.reset : () => {};
  const copied = typeof checklist?.copied === "string" || checklist?.copied === null ? checklist?.copied : null;
  const copyCommand =
    typeof checklist?.copyCommand === "function" ? checklist.copyCommand : () => {};
  const progress = Number.isFinite(checklist?.progress) ? (checklist?.progress as number) : 0;

  const targets = Array.isArray(DEPLOY_TARGETS) ? DEPLOY_TARGETS : [];
  const steps = Array.isArray(DEPLOY_STEPS) ? DEPLOY_STEPS : [];
  const history = Array.isArray(DEPLOY_HISTORY_MOCK) ? DEPLOY_HISTORY_MOCK : [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-primary text-primary-foreground">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/70" />
          <div className="container-x relative py-16 md:py-20">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] backdrop-blur">
              <CloudUpload className="h-3.5 w-3.5" aria-hidden="true" />
              Publicação · FTP
            </div>
            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
              Enviar o site por FTP para a KingHost.
            </h1>
            <p className="mt-4 max-w-2xl text-primary-foreground/85">
              Destino{" "}
              <code className="rounded bg-primary-foreground/15 px-1.5 py-0.5 font-mono text-sm">
                {SAFE_FTP_HOST}
              </code>{" "}
              → pasta{" "}
              <code className="rounded bg-primary-foreground/15 px-1.5 py-0.5 font-mono text-sm">
                /www
              </code>
              . Upload incremental por checksum: só trafega o que mudou desde o último deploy.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#checklist"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-primary transition hover:brightness-105"
              >
                Começar checklist <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </a>
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/40 px-6 py-3 text-sm font-medium text-primary-foreground backdrop-blur hover:bg-primary-foreground/10"
              >
                Voltar ao site
              </Link>
            </div>
          </div>
        </section>

        {/* Destinos */}
        <section className="container-x section-y">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Destinos</div>
          <h2 className="mt-4 max-w-2xl">Staging para validar, produção para publicar.</h2>
          {targets.length === 0 ? (
            <p className="mt-10 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Destinos de deploy indisponíveis no momento.
            </p>
          ) : (
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {targets.map((t, i) => {
                if (!t || typeof t !== "object") return null;
                const id = typeof t.id === "string" ? t.id : `target-${i}`;
                const label = typeof t.label === "string" ? t.label : "Destino";
                const description = typeof t.description === "string" ? t.description : "";
                const remoteDir = typeof t.remoteDir === "string" ? t.remoteDir : "—";
                const manifest = typeof t.manifest === "string" ? t.manifest : "—";
                const command = typeof t.command === "string" ? t.command : "";
                return (
                  <article
                    key={`${id}-${i}`}
                    className="group rounded-2xl border border-border bg-card p-6 transition hover:shadow-xl"
                  >
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      {id === "staging" ? (
                        <FlaskConical className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Globe className="h-4 w-4" aria-hidden="true" />
                      )}
                      {label}
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">{description}</p>
                    <dl className="mt-4 space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">remoto</dt>
                        <dd className="text-primary">{remoteDir}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">manifesto</dt>
                        <dd className="text-primary">{manifest}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted-foreground">noindex</dt>
                        <dd className="text-primary">{t.noindex ? "sim" : "não"}</dd>
                      </div>
                    </dl>
                    <code className="mt-4 block truncate rounded-md bg-secondary px-3 py-2 font-mono text-xs text-primary">
                      {command || "—"}
                    </code>
                  </article>
                );
              })}
            </div>
          )}

          {/* Segurança */}
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">
              <strong className="font-semibold text-foreground">
                Credenciais nunca entram no git.
              </strong>{" "}
              Use o arquivo local{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">.env.ftp</code>{" "}
              (gitignored, veja{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                .env.ftp.example
              </code>
              ) ou secrets do CI. Se uma senha vazar no chat ou em commit, troque-a no painel da
              hospedagem.
            </p>
          </div>
        </section>

        {/* Checklist */}
        <section id="checklist" className="border-y border-border bg-secondary">
          <div className="container-x section-y">
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Passo a passo
            </div>
            <h2 className="mt-4 max-w-2xl">Do teste de conexão ao site no ar.</h2>
            <div className="mt-10">
              <DeployChecklist
                steps={steps}
                done={done}
                copied={copied ?? null}
                progress={progress}
                onToggle={toggle}
                onCopy={copyCommand}
                onReset={reset}
              />
            </div>
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
              <FileWarning className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">
                O deploy usa manifesto SHA-256 no servidor: arquivos idênticos são pulados
                automaticamente. Use{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">--dry-run</code>{" "}
                para simular e{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">--delete</code>{" "}
                para remover obsoletos. Relatórios completos ficam em{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  dist/deploy-report.md
                </code>{" "}
                e{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
                  dist/deploy-ftp.log
                </code>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Histórico */}
        <section className="container-x section-y">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            <History className="h-4 w-4" aria-hidden="true" />
            Histórico recente
          </div>
          <h2 className="mt-4 max-w-2xl">Últimas publicações.</h2>
          <div className="mt-10 overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Versão</th>
                  <th className="px-5 py-3 font-medium">Data</th>
                  <th className="px-5 py-3 font-medium">Modo</th>
                  <th className="px-5 py-3 text-right font-medium">Enviados</th>
                  <th className="px-5 py-3 text-right font-medium">Pulados</th>
                  <th className="px-5 py-3 text-right font-medium">Volume</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-sm text-muted-foreground">
                      Nenhum deploy registrado ainda.
                    </td>
                  </tr>
                ) : (
                  history.map((h, i) => {
                    if (!h || typeof h !== "object") return null;
                    const version = typeof h.version === "string" ? h.version : "?";
                    const build = typeof h.build === "number" ? h.build : i;
                    const date = typeof h.date === "string" ? h.date : "—";
                    const mode = typeof h.mode === "string" ? h.mode : "—";
                    const uploaded = typeof h.uploaded === "number" ? h.uploaded : 0;
                    const skipped = typeof h.skipped === "number" ? h.skipped : 0;
                    const bytes = typeof h.bytes === "string" ? h.bytes : "—";
                    return (
                      <tr
                        key={`${version}-${build}-${i}`}
                        className="border-b border-border/60 last:border-0 hover:bg-secondary/50"
                      >
                        <td className="px-5 py-3 font-mono font-semibold text-primary">
                          v{version} <span className="text-muted-foreground">#{build}</span>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{date}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${mode === "deploy" ? "bg-green-500/15 text-green-700" : "bg-amber-500/15 text-amber-700"}`}
                          >
                            {mode}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums">{uploaded}</td>
                        <td className="px-5 py-3 text-right tabular-nums text-muted-foreground">
                          {skipped}
                        </td>
                        <td className="px-5 py-3 text-right tabular-nums">{bytes}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Dados ilustrativos. Os relatórios oficiais de cada deploy estão em{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono">dist/deploy-report.md</code>{" "}
            e no{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono">CHANGELOG-DEPLOY.md</code> do
            repositório.
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
