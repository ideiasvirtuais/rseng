import { AlertTriangle } from "lucide-react";

const WHATSAPP_URL = "https://wa.me/5531993040342";

export function SiteNotice() {
  return (
    <div
      role="status"
      className="w-full bg-accent text-accent-foreground"
    >
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-1 px-4 py-2 text-center text-sm font-medium sm:flex-row sm:gap-2">
        <span className="inline-flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
          Site em atualização!
        </span>
        <span className="opacity-90">
          Qualquer dúvida ou informação, entre em contato pelos{" "}
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-80"
          >
            canais de atendimento
          </a>
          .
        </span>
      </div>
    </div>
  );
}
