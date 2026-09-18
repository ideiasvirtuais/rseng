/**
 * Guardião global de saúde das imagens — "algo que resolve" as falhas.
 *
 * Problemas reais que este módulo elimina:
 * 1. Retry em loop da mesma URL 404 (cada <SmartImage> tentava sozinho).
 *    → cache global em memória + sessionStorage: URL que falhou uma vez
 *    pula direto para o próximo candidato.
 * 2. Imagem "travada" (stalled): servidor aceita a conexão mas nunca
 *    responde — o <img> não dispara onError. → watchdog por timeout.
 * 3. Rajada de 40+ imagens disputando banda no 3G (parece "falha").
 *    → pré-carregamento idle + fila com concorrência limitada.
 * 4. Falta de visibilidade: ninguém sabia quais imagens falhavam em prod.
 *    → registro de falhas com contagem, exportável para telemetria.
 */

export const STALLED_TIMEOUT_MS = 12_000;
export const PRELOAD_CONCURRENCY = 4;

const FAILED_KEY = "__rs_image_failed_v1__";

type FailureRecord = { url: string; count: number; lastAt: number };

/** Cache em memória das URLs que já falharam nesta sessão. */
const failedMemory = new Set<string>();
/** Contadores para diagnóstico / telemetria. */
const failureStats = new Map<string, FailureRecord>();

function readPersisted(): Set<string> {
  try {
    if (typeof sessionStorage === "undefined") return new Set();
    const raw = sessionStorage.getItem(FAILED_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function persist(url: string): void {
  try {
    if (typeof sessionStorage === "undefined") return;
    const current = readPersisted();
    current.add(url);
    // Limita a 200 entradas para não estourar a cota.
    const sliced = [...current].slice(-200);
    sessionStorage.setItem(FAILED_KEY, JSON.stringify(sliced));
  } catch {
    // storage cheio/bloqueado — cache em memória continua valendo
  }
}

let hydrated = false;
function ensureHydrated(): void {
  if (hydrated) return;
  hydrated = true;
  try {
    for (const u of readPersisted()) failedMemory.add(u);
  } catch {
    // nunca quebra o render
  }
}

/** Marca uma URL como falha (global). Retorna true se foi a primeira vez. */
export function markFailed(url: string): boolean {
  if (!url) return false;
  ensureHydrated();
  const first = !failedMemory.has(url);
  failedMemory.add(url);
  persist(url);
  const prev = failureStats.get(url);
  failureStats.set(url, {
    url,
    count: (prev?.count ?? 0) + 1,
    lastAt: Date.now(),
  });
  return first;
}

/** Verdadeiro se a URL já falhou nesta sessão (pule direto p/ fallback). */
export function didFail(url: string): boolean {
  if (!url) return false;
  ensureHydrated();
  return failedMemory.has(url);
}

/** Remove uma URL do cache de falhas (após retry manual bem-sucedido). */
export function clearFailure(url: string): void {
  if (!url) return;
  ensureHydrated();
  failedMemory.delete(url);
  try {
    if (typeof sessionStorage !== "undefined") {
      const current = readPersisted();
      current.delete(url);
      sessionStorage.setItem(FAILED_KEY, JSON.stringify([...current]));
    }
  } catch {
    // no-op
  }
}

/** Limpa todo o cache (ex: botão "tentar de novo" global). */
export function clearAllFailures(): void {
  failedMemory.clear();
  failureStats.clear();
  try {
    if (typeof sessionStorage !== "undefined") sessionStorage.removeItem(FAILED_KEY);
  } catch {
    // no-op
  }
}

/** Estatísticas de falha para telemetria / painel de diagnóstico. */
export function failureReport(): FailureRecord[] {
  return [...failureStats.values()].sort((a, b) => b.count - a.count);
}

/**
 * Filtra uma cadeia de candidatos removendo os que já falharam,
 * mas sempre mantém ao menos o primeiro (para permitir retry manual).
 */
export function skipKnownFailures(chain: string[]): string[] {
  ensureHydrated();
  if (chain.length <= 1) return chain;
  const filtered = chain.filter((u, i) => i === 0 || !failedMemory.has(u));
  return filtered.length > 0 ? filtered : chain.slice(0, 1);
}

/* ------------------------------------------------------------------ */
/* Pré-carregamento com concorrência limitada                          */
/* ------------------------------------------------------------------ */

function loadOne(url: string, timeoutMs = STALLED_TIMEOUT_MS): Promise<void> {
  return new Promise((resolve) => {
    try {
      if (didFail(url)) return resolve();
      const img = new Image();
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(() => {
        markFailed(url);
        finish();
      }, timeoutMs);
      img.onload = () => finish();
      img.onerror = () => {
        markFailed(url);
        finish();
      };
      img.decoding = "async";
      img.src = url;
    } catch {
      resolve();
    }
  });
}

/**
 * Pré-carrega uma lista de URLs em idle, com no máximo N downloads
 * simultâneos. Nunca rejeita — falha individual só alimenta o cache.
 */
export async function preloadImages(urls: string[], concurrency = PRELOAD_CONCURRENCY): Promise<void> {
  const queue = [...new Set(urls.filter(Boolean))].filter((u) => !didFail(u));
  if (queue.length === 0) return;
  const runIdle = (fn: () => void) => {
    try {
      const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => void })
        .requestIdleCallback;
      if (typeof ric === "function") ric(fn);
      else setTimeout(fn, 300);
    } catch {
      setTimeout(fn, 300);
    }
  };
  await new Promise<void>((resolve) => {
    runIdle(() => {
      void (async () => {
        const workers = Array.from(
          { length: Math.min(concurrency, queue.length) },
          async () => {
            while (queue.length > 0) {
              const next = queue.shift();
              if (next) await loadOne(next);
            }
          },
        );
        await Promise.all(workers);
        resolve();
      })();
    });
  });
}

/** Pré-conecta + preload do hero (LCP) o quanto antes. */
export function warmCriticalImage(href: string): void {
  try {
    if (typeof document === "undefined" || !href) return;
    if (document.querySelector(`link[rel="preload"][href="${href}"]`)) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = href;
    link.setAttribute("fetchpriority", "high");
    document.head.appendChild(link);
    // Aquece o cache do browser em background.
    void loadOne(href);
  } catch {
    // otimização — nunca quebra
  }
}
