import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { preloadImages, warmCriticalImage } from "@/lib/image-health";
import { HERO_URL } from "@/lib/images";
import { getAllImageUrls } from "@/lib/all-images";

export type PreloadStatus = "idle" | "loading" | "done";

export type PreloadAllResult = {
  status: PreloadStatus;
  total: number;
  loaded: number;
  progress: number;
  start: () => void;
};

/**
 * Carrega TODAS as imagens do site em background (idle + concorrência limitada).
 * - Aquece o hero (LCP) imediatamente.
 * - O restante carrega em lote via preloadImages (4 concorrentes, nunca rejeita).
 * - Reporta progresso real (onload/onerror por imagem) para barra de progresso.
 * - Idempotente por sessão: segunda montagem reutiliza o cache do navegador.
 * - Nunca quebra o render: qualquer falha vira "loaded" (placeholder cobre).
 */
export function usePreloadAllImages(autoStart = true): PreloadAllResult {
  const urls = useMemo(() => {
    try {
      return getAllImageUrls();
    } catch {
      return [];
    }
  }, []);

  const [loaded, setLoaded] = useState(0);
  const [status, setStatus] = useState<PreloadStatus>("idle");
  const startedRef = useRef(false);

  const start = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (urls.length === 0) {
      setStatus("done");
      return;
    }
    setStatus("loading");
    setLoaded(0);

    // Hero primeiro (LCP).
    try {
      warmCriticalImage(HERO_URL);
    } catch {
      // no-op
    }

    // Lote principal em idle (não compete com o LCP).
    const kick = () => {
      let done = 0;
      const tick = () => {
        done += 1;
        setLoaded(done);
        if (done >= urls.length) setStatus("done");
      };
      // Carrega com concorrência limitada e conta progresso por imagem.
      const CONCURRENCY = 4;
      const queue = [...urls];
      const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
        while (queue.length > 0) {
          const next = queue.shift();
          if (!next) {
            tick();
            continue;
          }
          try {
            await loadOne(next);
          } catch {
            // falha individual nunca trava o lote
          }
          tick();
        }
      });
      void Promise.all(workers).then(() => setStatus("done"));
      // Rede de segurança: também alimenta o cache global compartilhado.
      void preloadImages(urls).catch(() => undefined);
    };

    try {
      const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
      if (typeof ric === "function") ric(kick);
      else window.setTimeout(kick, 400);
    } catch {
      window.setTimeout(kick, 400);
    }
  }, [urls]);

  useEffect(() => {
    if (autoStart) start();
  }, [autoStart, start]);

  const progress = urls.length === 0 ? 1 : Math.min(1, loaded / urls.length);

  return { status, total: urls.length, loaded: Math.min(loaded, urls.length), progress, start };
}

function loadOne(url: string, timeoutMs = 12_000): Promise<void> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        window.clearTimeout(timer);
        resolve();
      };
      const timer = window.setTimeout(finish, timeoutMs);
      img.onload = () => finish();
      img.onerror = () => finish();
      img.decoding = "async";
      img.src = url;
    } catch {
      resolve();
    }
  });
}
