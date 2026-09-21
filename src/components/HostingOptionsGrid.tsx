import { Archive, Cloud, Container, FolderUp, Github, HardDrive, Server, Globe, DatabaseZap } from "lucide-react";
import { HOSTING_OPTIONS, type HostingKind } from "@/lib/portability";

const ICONS: Record<HostingKind, typeof HardDrive> = {
  cpanel: HardDrive,
  ftp: FolderUp,
  netlify: Cloud,
  vercel: Globe,
  cloudflare: Cloud,
  "github-pages": Github,
  s3: DatabaseZap,
  "nginx-vps": Server,
  iis: Server,
  docker: Container,
};

export function HostingOptionsGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`grid gap-4 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
      {HOSTING_OPTIONS.map((h) => {
        const Icon = ICONS[h.kind] ?? Archive;
        const isLegacyOptional = h.kind === "ftp" || h.kind === "github-pages";
        return (
          <article
            key={h.kind}
            className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-5 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold leading-tight">{h.name}</p>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide ${
                    isLegacyOptional
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                  }`}
                >
                  {h.badge}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{h.detail}</p>
              {!compact && (
                <code className="mt-3 block truncate rounded-md bg-secondary px-3 py-2 font-mono text-xs text-primary" title={h.action}>
                  {h.action}
                </code>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
