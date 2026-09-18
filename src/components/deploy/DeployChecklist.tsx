import { CheckCircle2, Circle, Copy, Check, Terminal } from "lucide-react";
import type { DeployStep } from "@/data/deploy";

interface Props {
  steps: DeployStep[];
  done: Set<number>;
  copied: string | null;
  progress: number;
  onToggle: (order: number) => void;
  onCopy: (command: string) => void;
  onReset: () => void;
}

export function DeployChecklist({
  steps,
  done,
  copied,
  progress,
  onToggle,
  onCopy,
  onReset,
}: Props) {
  // Props defensivas: o componente nunca pode lançar por lista/estado
  // ausente — um throw aqui derrubaria a rota /deploy no boundary raiz.
  const safeSteps: DeployStep[] = Array.isArray(steps) ? steps : [];
  const safeDone: Set<number> = done instanceof Set ? done : new Set<number>();
  const safeProgress = Number.isFinite(progress) ? Math.min(100, Math.max(0, progress as number)) : 0;
  const handleToggle = typeof onToggle === "function" ? onToggle : () => {};
  const handleCopy = typeof onCopy === "function" ? onCopy : () => {};
  const handleReset = typeof onReset === "function" ? onReset : () => {};
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between gap-4 border-b border-border/60 px-6 py-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-primary">
          <Terminal className="h-4 w-4" aria-hidden="true" />
          Checklist de publicação
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs tabular-nums text-muted-foreground">{safeProgress}%</span>
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${safeProgress}%` }}
            />
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-medium text-muted-foreground hover:text-primary hover:underline"
          >
            Limpar
          </button>
        </div>
      </div>
      <ol>
        {safeSteps.length === 0 ? (
          <li className="px-6 py-8 text-center text-sm text-muted-foreground">
            Nenhuma etapa disponível no momento.
          </li>
        ) : (
          safeSteps.map((s, index) => {
            if (!s || typeof s !== "object") return null;
            const order = typeof s.order === "number" ? s.order : index + 1;
            const title = typeof s.title === "string" ? s.title : "Etapa sem título";
            const detail = typeof s.detail === "string" ? s.detail : "";
            const command = typeof s.command === "string" ? s.command : "";
            const checked = safeDone.has(order);
            const isCopied = typeof copied === "string" && copied === command;
            return (
              <li key={`${order}-${index}`} className="border-b border-border/60 last:border-0">
                <div className="flex items-start gap-3 px-6 py-4">
                  <button
                    type="button"
                    onClick={() => handleToggle(order)}
                    aria-pressed={checked}
                    aria-label={`${checked ? "Desmarcar" : "Marcar"} etapa ${order}: ${title}`}
                    className="mt-0.5 shrink-0 text-primary transition hover:scale-105"
                  >
                    {checked ? (
                      <CheckCircle2 className="h-5 w-5 fill-primary/15" aria-hidden="true" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-sm font-semibold ${checked ? "text-muted-foreground line-through" : "text-primary"}`}
                    >
                      {order}. {title}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="min-w-0 flex-1 truncate rounded-md bg-secondary px-2.5 py-1.5 font-mono text-xs text-primary">
                        {command || "—"}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(command)}
                        aria-label={`Copiar comando: ${command}`}
                        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition hover:border-primary/50 hover:text-primary"
                      >
                        {isCopied ? (
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })
        )}
      </ol>
    </div>
  );
}
