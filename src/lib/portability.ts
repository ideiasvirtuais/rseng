/**
 * Catálogo central de portabilidade — fonte única da verdade sobre
 * "onde este site pode ser publicado".
 *
 * PRINCÍPIO: o pacote `dist/client/` (+ `dist/rseng-static.zip`) é
 * 100% estático e independente. GitHub e o servidor Napoleon/KingHost
 * via FTP são APENAS duas opções entre muitas — nunca requisitos.
 *
 * Usado por:
 * - `src/routes/publicar.tsx` (página pública /publicar)
 * - `src/components/HostingOptionsGrid.tsx` (grade reutilizável)
 * - `scripts/portable-check.mjs` (espelho Node do checklist)
 */

export type HostingKind =
  | "cpanel"
  | "ftp"
  | "netlify"
  | "vercel"
  | "cloudflare"
  | "github-pages"
  | "s3"
  | "nginx-vps"
  | "iis"
  | "docker";

export interface HostingOption {
  kind: HostingKind;
  /** Nome curto exibido na UI. */
  name: string;
  /** Uma linha de detalhe técnico. */
  detail: string;
  /** Comando ou ação principal. */
  action: string;
  /** Arquivo(s) do pacote que fazem o destino funcionar. */
  adapters: string[];
  /** true = opcional / nunca obrigatório. Todos são opcionais por design. */
  optional: boolean;
  /** Rótulo exibido quando optional (ex: "Opção"). */
  badge: string;
  docsPath?: string;
}

export const PORTABLE_ARTIFACT_DIR = "dist/client";
export const PORTABLE_ARTIFACT_ZIP = "dist/rseng-static.zip";

export const HOSTING_OPTIONS: HostingOption[] = [
  {
    kind: "cpanel",
    name: "cPanel genérico",
    detail: "HostGator, Hostinger, Locaweb, KingHost… — descompacte o .zip em public_html/",
    action: "Descompacte dist/rseng-static.zip em public_html/",
    adapters: [".htaccess"],
    optional: true,
    badge: "Qualquer host",
    docsPath: "docs/PUBLISH-ANYWHERE.md",
  },
  {
    kind: "ftp",
    name: "Napoleon / KingHost via FTP",
    detail: "Servidor ftp.rsengenharia.eng.br:/www — upload incremental com checksum (OPCIONAL)",
    action: "npm run deploy:ftp:full",
    adapters: [".htaccess", ".deploy-manifest.json"],
    optional: true,
    badge: "Opção",
    docsPath: ".env.ftp.example",
  },
  {
    kind: "netlify",
    name: "Netlify",
    detail: "Arraste dist/client/ no dashboard ou netlify deploy --prod",
    action: "netlify deploy --dir dist/client --prod",
    adapters: ["_redirects", "_headers"],
    optional: true,
    badge: "Opção",
    docsPath: "netlify.toml",
  },
  {
    kind: "vercel",
    name: "Vercel",
    detail: "outputDirectory dist/client — rewrites já configurados",
    action: "npx vercel --prod",
    adapters: ["vercel.json"],
    optional: true,
    badge: "Opção",
    docsPath: "vercel.json",
  },
  {
    kind: "cloudflare",
    name: "Cloudflare Pages",
    detail: "Build npm run build:static, saída dist/client",
    action: "npx wrangler pages deploy dist/client",
    adapters: ["_redirects", "_headers"],
    optional: true,
    badge: "Opção",
    docsPath: "hosting/cloudflare-pages.json",
  },
  {
    kind: "github-pages",
    name: "GitHub Pages",
    detail: "Workflow static-portable.yml desativável — .nojekyll + 404.html (OPCIONAL)",
    action: "Ative .github/workflows/static-portable.yml",
    adapters: [".nojekyll", "404.html"],
    optional: true,
    badge: "Opção",
    docsPath: ".github/workflows/static-portable.yml",
  },
  {
    kind: "s3",
    name: "S3 / R2 / Spaces",
    detail: "Bucket estático + error document /404.html",
    action: "aws s3 sync dist/client/ s3://bucket --delete",
    adapters: ["404.html"],
    optional: true,
    badge: "Opção",
  },
  {
    kind: "nginx-vps",
    name: "VPS / Nginx",
    detail: "Qualquer VPS com o snippet pronto",
    action: "rsync -av dist/client/ /var/www/rseng/",
    adapters: ["nginx.conf"],
    optional: true,
    badge: "Opção",
    docsPath: "hosting/nginx.conf",
  },
  {
    kind: "iis",
    name: "IIS / Windows Server",
    detail: "web.config com SPA rewrite já incluso",
    action: "Copie dist/client/ para o site no IIS",
    adapters: ["web.config"],
    optional: true,
    badge: "Opção",
  },
  {
    kind: "docker",
    name: "Docker / self-hosted",
    detail: "Imagem nginx:alpine servindo o pacote — zero dependência externa",
    action: "docker compose -f docker-compose.portable.yml up -d",
    adapters: ["Dockerfile", "docker-compose.portable.yml"],
    optional: true,
    badge: "Independente",
    docsPath: "Dockerfile",
  },
];

/** Opções marcadas explicitamente como "apenas opção" (GitHub + FTP Napoleon). */
export const OPTIONAL_LEGACY_OPTIONS: HostingKind[] = ["github-pages", "ftp"];

export function getHostingOption(kind: HostingKind): HostingOption | undefined {
  return HOSTING_OPTIONS.find((o) => o.kind === kind);
}

/** Checklist pós-deploy — espelho do scripts/portable-check.mjs para a UI. */
export interface PortableCheckItem {
  id: string;
  label: string;
  hint: string;
  path: string;
}

export const PORTABLE_CHECKLIST: PortableCheckItem[] = [
  { id: "home", label: "Home abre com layout completo", hint: "Sem tela branca, CSS e JS carregados", path: "/" },
  { id: "deep-link", label: "Rota profunda abre direto", hint: "Testa o fallback SPA do host", path: "/obras/golden-mall-rosario" },
  { id: "not-found", label: "URL inexistente cai no 404 do site", hint: "Não erro padrão do servidor", path: "/essa-pagina-nao-existe" },
  { id: "robots", label: "robots.txt acessível", hint: "SEO + sitemap referenciado", path: "/robots.txt" },
  { id: "sitemap", label: "sitemap.xml acessível", hint: "URLs canônicas do SITE_URL", path: "/sitemap.xml" },
  { id: "health", label: "health.json retorna ok:true", hint: 'Modo "static", sem backend', path: "/health.json" },
];
