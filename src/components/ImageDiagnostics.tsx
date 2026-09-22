import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileImage,
  ImageOff,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getAllImages, type CatalogImage } from "@/lib/all-images";
import { cn } from "@/lib/utils";

type AuditStatus = "pending" | "running" | "pass" | "warning" | "fail";
type StatusFilter = "all" | "pass" | "warning" | "fail";

type DiagnosticSource = {
  src: string;
  title: string;
  group: string;
};

type DiagnosticResult = DiagnosticSource & {
  status: AuditStatus;
  httpStatus: number | null;
  declaredFormat: string;
  detectedFormat: string;
  contentType: string;
  width: number | null;
  height: number | null;
  bytes: number | null;
  durationMs: number | null;
  detail: string;
};

const PUBLIC_IMAGES: DiagnosticSource[] = [
  { src: "/LOGOMARCA-RS-1024x253.png", title: "Logomarca oficial", group: "Arquivo público" },
  { src: "/logo-rezende-saback.png", title: "Logomarca alternativa", group: "Arquivo público" },
  { src: "/hero-rosario.jpg", title: "Banner principal JPG", group: "Arquivo público" },
  { src: "/hero-rosario.webp", title: "Banner principal WebP", group: "Arquivo público" },
  { src: "/instagram-rs.jpg", title: "Imagem do Instagram", group: "Arquivo público" },
  { src: "/og-cover.jpg", title: "Capa de compartilhamento", group: "Arquivo público" },
  { src: "/favicon.png", title: "Favicon", group: "Arquivo público" },
  { src: "/apple-touch-icon.png", title: "Ícone Apple", group: "Arquivo público" },
];

const bundledAssets = import.meta.glob(
  "../assets/**/*.{png,jpg,jpeg,webp,gif,avif,svg}",
  { eager: true, query: "?url", import: "default" },
) as Record<string, string>;

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pass", label: "Aprovadas" },
  { value: "warning", label: "Avisos" },
  { value: "fail", label: "Falhas" },
];

const TIMEOUT_MS = 12_000;
const CONCURRENCY = 4;

function formatFromExtension(src: string): string {
  try {
    const pathname = new URL(src, "http://diagnostic.local").pathname.toLowerCase();
    const extension = pathname.split(".").pop() ?? "";
    return extension === "jpg" ? "jpeg" : extension;
  } catch {
    return "";
  }
}

function formatFromContentType(contentType: string): string {
  const normalized = contentType.toLowerCase().split(";")[0]?.trim() ?? "";
  if (!normalized.startsWith("image/")) return "";
  const value = normalized.slice(6);
  return value === "jpg" || value === "pjpeg" ? "jpeg" : value.replace("svg+xml", "svg");
}

function detectFormat(bytes: Uint8Array): string {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "webp";
  if (bytes.length >= 6 && String.fromCharCode(...bytes.slice(0, 3)) === "GIF") return "gif";
  if (bytes.length >= 12 && String.fromCharCode(...bytes.slice(4, 12)).includes("ftypavif")) return "avif";
  try {
    const prefix = new TextDecoder().decode(bytes.slice(0, 256)).trimStart();
    if (prefix.startsWith("<svg") || (prefix.startsWith("<?xml") && prefix.includes("<svg"))) return "svg";
  } catch {
    // Bytes desconhecidos serão apresentados como formato não identificado.
  }
  return "";
}

function parseByteSize(response: Response): number | null {
  const range = response.headers.get("content-range");
  const rangeTotal = range?.match(/\/(\d+)$/)?.[1];
  const value = rangeTotal ?? response.headers.get("content-length");
  const parsed = value ? Number(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

function loadDimensions(src: string, signal: AbortSignal): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const cleanup = () => {
      image.onload = null;
      image.onerror = null;
      signal.removeEventListener("abort", abort);
    };
    const abort = () => {
      cleanup();
      image.src = "";
      reject(new Error("Tempo limite excedido"));
    };
    signal.addEventListener("abort", abort, { once: true });
    image.onload = () => {
      const dimensions = { width: image.naturalWidth, height: image.naturalHeight };
      cleanup();
      resolve(dimensions);
    };
    image.onerror = () => {
      cleanup();
      reject(new Error("O navegador não conseguiu decodificar a imagem"));
    };
    image.decoding = "async";
    image.src = src;
  });
}

async function inspectImage(item: DiagnosticSource): Promise<DiagnosticResult> {
  const startedAt = performance.now();
  const declaredFormat = formatFromExtension(item.src);
  const base: DiagnosticResult = {
    ...item,
    status: "fail",
    httpStatus: null,
    declaredFormat,
    detectedFormat: "",
    contentType: "",
    width: null,
    height: null,
    bytes: null,
    durationMs: null,
    detail: "",
  };

  if (!item.src) return { ...base, detail: "Caminho vazio." };

  let url: URL;
  try {
    url = new URL(item.src, window.location.href);
  } catch {
    return { ...base, detail: "Caminho inválido." };
  }
  if (url.origin !== window.location.origin) {
    return {
      ...base,
      status: "warning",
      durationMs: Math.round(performance.now() - startedAt),
      detail: "Caminho externo; esta auditoria verifica somente arquivos locais.",
    };
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url.href, {
      cache: "no-store",
      headers: { Range: "bytes=0-511" },
      signal: controller.signal,
    });
    base.httpStatus = response.status;
    base.contentType = response.headers.get("content-type") ?? "";
    base.bytes = parseByteSize(response);
    if (!response.ok) {
      return {
        ...base,
        durationMs: Math.round(performance.now() - startedAt),
        detail: `Arquivo não encontrado ou indisponível (HTTP ${response.status}).`,
      };
    }

    const payload = new Uint8Array(await response.arrayBuffer());
    base.detectedFormat = detectFormat(payload);
    const dimensions = await loadDimensions(url.href, controller.signal);
    base.width = dimensions.width;
    base.height = dimensions.height;

    const mimeFormat = formatFromContentType(base.contentType);
    const issues: string[] = [];
    if (!declaredFormat) issues.push("O caminho não informa uma extensão reconhecível.");
    if (!base.detectedFormat) issues.push("Não foi possível identificar o formato pelos bytes do arquivo.");
    if (declaredFormat && base.detectedFormat && declaredFormat !== base.detectedFormat) {
      issues.push(`A extensão .${declaredFormat === "jpeg" ? "jpg" : declaredFormat} não corresponde ao conteúdo ${base.detectedFormat.toUpperCase()}.`);
    }
    if (mimeFormat && base.detectedFormat && mimeFormat !== base.detectedFormat) {
      issues.push(`O servidor enviou ${base.contentType}, mas o arquivo é ${base.detectedFormat.toUpperCase()}.`);
    }
    if (!mimeFormat) issues.push(`Tipo de resposta inválido: ${base.contentType || "não informado"}.`);

    return {
      ...base,
      status: issues.length > 0 ? "warning" : "pass",
      durationMs: Math.round(performance.now() - startedAt),
      detail: issues.join(" ") || "Caminho, formato e carregamento conferidos.",
    };
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "AbortError";
    return {
      ...base,
      durationMs: Math.round(performance.now() - startedAt),
      detail: timedOut
        ? `A imagem não respondeu em ${TIMEOUT_MS / 1000} segundos.`
        : error instanceof Error
          ? error.message
          : "Falha desconhecida ao carregar a imagem.",
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

function buildManifest(): DiagnosticSource[] {
  const catalog: DiagnosticSource[] = getAllImages().map((item: CatalogImage) => ({
    src: item.src,
    title: item.title,
    group: item.group,
  }));
  const bundled = Object.entries(bundledAssets).map(([path, src]) => ({
    src,
    title: path.split("/").pop() ?? path,
    group: "Arquivo empacotado",
  }));
  const unique = new Map<string, DiagnosticSource>();
  for (const item of [...catalog, ...PUBLIC_IMAGES, ...bundled]) {
    if (item.src && !unique.has(item.src)) unique.set(item.src, item);
  }
  return [...unique.values()];
}

function initialResults(manifest: DiagnosticSource[]): DiagnosticResult[] {
  return manifest.map((item) => ({
    ...item,
    status: "pending",
    httpStatus: null,
    declaredFormat: formatFromExtension(item.src),
    detectedFormat: "",
    contentType: "",
    width: null,
    height: null,
    bytes: null,
    durationMs: null,
    detail: "Aguardando verificação.",
  }));
}

function readableBytes(bytes: number | null): string {
  if (bytes == null) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function StatusIcon({ status }: { status: AuditStatus }) {
  if (status === "pass") return <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />;
  if (status === "warning") return <AlertTriangle className="h-5 w-5 text-accent-foreground" aria-hidden="true" />;
  if (status === "fail") return <ImageOff className="h-5 w-5 text-foreground" aria-hidden="true" />;
  return <Loader2 className={cn("h-5 w-5 text-muted-foreground", status === "running" && "animate-spin")} aria-hidden="true" />;
}

export function ImageDiagnostics() {
  const manifest = useMemo(buildManifest, []);
  const [results, setResults] = useState(() => initialResults(manifest));
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  const [running, setRunning] = useState(false);
  const runId = useRef(0);

  const runAudit = useCallback(async () => {
    const currentRun = runId.current + 1;
    runId.current = currentRun;
    setRunning(true);
    setResults(initialResults(manifest));
    let cursor = 0;

    const worker = async () => {
      while (cursor < manifest.length && runId.current === currentRun) {
        const index = cursor;
        cursor += 1;
        setResults((current) => current.map((result, i) => i === index ? { ...result, status: "running", detail: "Verificando…" } : result));
        const checked = await inspectImage(manifest[index]);
        if (runId.current !== currentRun) return;
        setResults((current) => current.map((result, i) => i === index ? checked : result));
      }
    };

    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, manifest.length) }, worker));
    if (runId.current === currentRun) setRunning(false);
  }, [manifest]);

  useEffect(() => {
    void runAudit();
    return () => {
      runId.current += 1;
    };
  }, [runAudit]);

  const counts = useMemo(() => ({
    pass: results.filter((item) => item.status === "pass").length,
    warning: results.filter((item) => item.status === "warning").length,
    fail: results.filter((item) => item.status === "fail").length,
    complete: results.filter((item) => ["pass", "warning", "fail"].includes(item.status)).length,
  }), [results]);

  const visible = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
    return results.filter((item) => {
      if (filter !== "all" && item.status !== filter) return false;
      if (!normalizedQuery) return true;
      return `${item.title} ${item.group} ${item.src} ${item.detail}`.toLocaleLowerCase("pt-BR").includes(normalizedQuery);
    });
  }, [filter, query, results]);

  return (
    <main className="container-x py-10 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-3xl">
          <div className="eyebrow inline-flex items-center gap-2">
            <FileImage className="h-4 w-4" aria-hidden="true" /> Diagnóstico pré-publicação
          </div>
          <h1 className="mt-4">Diagnóstico de imagens</h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Conferência automática dos caminhos locais, formatos reais, dimensões e resposta de carregamento.
          </p>
        </div>
        <Button type="button" onClick={() => void runAudit()} disabled={running}>
          {running ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          {running ? "Verificando" : "Verificar novamente"}
        </Button>
      </div>

      <section aria-label="Resumo do diagnóstico" className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total", value: results.length, icon: FileImage },
          { label: "Aprovadas", value: counts.pass, icon: CheckCircle2 },
          { label: "Avisos", value: counts.warning, icon: AlertTriangle },
          { label: "Falhas", value: counts.fail, icon: ImageOff },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <div className="mt-3 text-3xl font-semibold text-primary tabular-nums">{value}</div>
          </div>
        ))}
      </section>

      <div className="mt-5">
        <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>{running ? "Auditoria em andamento" : "Auditoria concluída"}</span>
          <span className="tabular-nums">{counts.complete}/{results.length}</span>
        </div>
        <progress className="mt-2 h-2 w-full accent-primary" value={counts.complete} max={Math.max(results.length, 1)} aria-label="Progresso do diagnóstico" />
      </div>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nome, grupo ou caminho"
            aria-label="Buscar imagens"
            className="h-10 w-full rounded-md border border-border bg-card pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/20"
          />
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar imagens por status">
          {FILTERS.map((item) => (
            <Button
              key={item.value}
              type="button"
              size="sm"
              variant={filter === item.value ? "default" : "outline"}
              aria-pressed={filter === item.value}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <section aria-live="polite" aria-label="Resultado por imagem" className="mt-6 space-y-3">
        {visible.map((item) => (
          <article key={item.src} className="grid gap-4 rounded-lg border border-border bg-card p-4 shadow-sm md:grid-cols-[5rem_minmax(0,1fr)_auto] md:items-center">
            <div className="flex h-16 w-20 items-center justify-center overflow-hidden rounded-md border border-border bg-secondary">
              {item.status === "pass" || item.status === "warning" ? (
                <img src={item.src} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              ) : (
                <StatusIcon status={item.status} />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <StatusIcon status={item.status} />
                <h2 className="text-base font-semibold text-foreground">{item.title}</h2>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">{item.group}</span>
              </div>
              <p className="mt-2 break-all font-mono text-xs text-muted-foreground">{item.src}</p>
              <p className="mt-2 text-sm text-foreground">{item.detail}</p>
            </div>
            <dl className="grid min-w-48 grid-cols-2 gap-x-5 gap-y-1 text-xs md:text-right">
              <dt className="text-muted-foreground">HTTP</dt><dd className="font-mono text-foreground">{item.httpStatus ?? "—"}</dd>
              <dt className="text-muted-foreground">Formato</dt><dd className="font-mono uppercase text-foreground">{item.detectedFormat || item.declaredFormat || "—"}</dd>
              <dt className="text-muted-foreground">Dimensões</dt><dd className="font-mono text-foreground">{item.width && item.height ? `${item.width}×${item.height}` : "—"}</dd>
              <dt className="text-muted-foreground">Tamanho</dt><dd className="font-mono text-foreground">{readableBytes(item.bytes)}</dd>
              <dt className="text-muted-foreground">Tempo</dt><dd className="font-mono text-foreground">{item.durationMs != null ? `${item.durationMs} ms` : "—"}</dd>
            </dl>
          </article>
        ))}
        {visible.length === 0 && (
          <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
            Nenhuma imagem corresponde a este filtro.
          </div>
        )}
      </section>
    </main>
  );
}