import { useCallback, useMemo, useRef, useState } from "react";
import { DEPLOY_STEPS } from "@/data/deploy";

/**
 * Estado local do checklist de publicação.
 * Persiste apenas em memória (página informativa, sem backend).
 *
 * 100% seguro para SSR/prerender/HMR:
 * - nunca referencia `navigator`/`window`/`document` sem `typeof` guard
 *   (`navigator?.` sozinho lança ReferenceError no Node quando a
 *   variável não existe — optional chaining não protege variável
 *   não-declarada);
 * - nunca lança durante o render, mesmo com dados ausentes.
 */
export function useDeployChecklist() {
  const [done, setDone] = useState<Set<number>>(() => new Set());
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number | ReturnType<typeof setTimeout> | null>(null);

  const toggle = useCallback((order: number) => {
    if (typeof order !== "number" || !Number.isFinite(order)) return;
    setDone((prev) => {
      const base = prev instanceof Set ? prev : new Set<number>();
      const next = new Set(base);
      if (next.has(order)) next.delete(order);
      else next.add(order);
      return next;
    });
  }, []);

  const reset = useCallback(() => setDone(new Set()), []);

  const copyCommand = useCallback(async (command: string) => {
    try {
      if (typeof command !== "string" || command.length === 0) return;
      // SSR-safe: typeof guard antes de tocar em navigator.
      if (typeof navigator === "undefined") return;
      const clipboard =
        (navigator as Navigator | undefined)?.clipboard ?? undefined;
      const writeText = clipboard?.writeText?.bind(clipboard);
      if (typeof writeText !== "function") {
        // Fallback legado via textarea (apenas no browser com DOM).
        if (typeof document === "undefined") return;
        const ta = document.createElement("textarea");
        ta.value = command;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body?.appendChild(ta);
        ta.select();
        try {
          document.execCommand?.("copy");
          setCopied(command);
        } catch {
          setCopied(null);
          return;
        } finally {
          ta.remove();
        }
      } else {
        await writeText(command);
        setCopied(command);
      }
      if (typeof window !== "undefined" && typeof window.setTimeout === "function") {
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(null), 1600);
      } else if (typeof setTimeout === "function") {
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setCopied(null), 1600);
      }
    } catch {
      setCopied(null);
    }
  }, []);

  const progress = useMemo(() => {
    try {
      const total = Array.isArray(DEPLOY_STEPS) ? DEPLOY_STEPS.length : 0;
      if (total <= 0) return 0;
      const count = done instanceof Set ? done.size : 0;
      const pct = Math.round((count / total) * 100);
      return Number.isFinite(pct) ? Math.min(100, Math.max(0, pct)) : 0;
    } catch {
      return 0;
    }
  }, [done]);

  return { done, toggle, reset, copied, copyCommand, progress };
}
