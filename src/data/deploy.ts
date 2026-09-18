/**
 * Dados e tipos do painel de publicação FTP.
 *
 * NUNCA inclua senhas aqui — credenciais vivem apenas em `.env.ftp`
 * (local, gitignored) ou secrets do CI. Esta página é pública e
 * prerenderizada no build estático.
 */

export interface DeployTarget {
  id: "staging" | "production";
  label: string;
  command: string;
  remoteDir: string;
  manifest: string;
  report: string;
  noindex: boolean;
  description: string;
}

export interface DeployStep {
  order: number;
  title: string;
  command: string;
  detail: string;
}

export interface DeployHistoryEntry {
  version: string;
  build: number;
  date: string;
  mode: string;
  uploaded: number;
  skipped: number;
  bytes: string;
}

export const FTP_HOST = "ftp.rsengenharia.eng.br";
export const SITE_URL = "https://rsengenharia.eng.br";

export const DEPLOY_TARGETS: DeployTarget[] = [
  {
    id: "staging",
    label: "Staging (testes)",
    command: "npm run deploy:staging -- --dry-run",
    remoteDir: "/www/staging",
    manifest: ".deploy-manifest-staging.json",
    report: "dist/deploy-report-staging.md",
    noindex: true,
    description:
      "Área de testes com robots Disallow e X-Robots-Tag noindex. Valide aqui antes de publicar no domínio final.",
  },
  {
    id: "production",
    label: "Produção",
    command: "npm run deploy:prod",
    remoteDir: "/www",
    manifest: ".deploy-manifest.json",
    report: "dist/deploy-report.md",
    noindex: false,
    description:
      "Domínio final rsengenharia.eng.br. Upload incremental por checksum SHA-256 — só envia o que mudou.",
  },
];

export const DEPLOY_STEPS: DeployStep[] = [
  {
    order: 1,
    title: "Testar a conexão",
    command: "node scripts/test-ftp-connection.mjs",
    detail: "Valida host, usuário e acesso a /www sem enviar nenhum arquivo.",
  },
  {
    order: 2,
    title: "Gerar o build estático",
    command: "npm run build:ftp",
    detail:
      "Compila SPA + prerender (home, segmentos, obras, health) e gera .htaccess em dist/client/.",
  },
  {
    order: 3,
    title: "Validar o pacote",
    command: "node scripts/preflight-ftp.mjs",
    detail: "Confere _shell.html, index.html, rotas prerenderizadas, .htaccess e assets.",
  },
  {
    order: 4,
    title: "Simular o envio",
    command: "node scripts/deploy-ftp.mjs -- --dry-run",
    detail: "Lista o que seria enviado/removido comparando checksums com o manifesto remoto.",
  },
  {
    order: 5,
    title: "Publicar",
    command: "node scripts/deploy-ftp.mjs -- --delete",
    detail:
      "Envia dist/client/ para /www e remove obsoletos da allowlist. Log em dist/deploy-ftp.log.",
  },
];

/** Histórico ilustrativo — substituído pelos relatórios reais de dist/deploy-report*.md */
export const DEPLOY_HISTORY_MOCK: DeployHistoryEntry[] = [
  {
    version: "1.4.0",
    build: 42,
    date: "2026-09-17",
    mode: "deploy",
    uploaded: 18,
    skipped: 64,
    bytes: "2.4 MB",
  },
  {
    version: "1.3.2",
    build: 41,
    date: "2026-09-15",
    mode: "deploy",
    uploaded: 6,
    skipped: 76,
    bytes: "640 KB",
  },
  {
    version: "1.3.1",
    build: 40,
    date: "2026-09-12",
    mode: "dry-run",
    uploaded: 0,
    skipped: 82,
    bytes: "0 B",
  },
];
