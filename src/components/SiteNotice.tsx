import { AlertTriangle } from "lucide-react";
import { COMPANY } from "@/data/company";

const FALLBACK_WHATSAPP_URL = "https://wa.me/5531993040342?text=Ol%C3%A1!%20Vim%20pelo%20site%20e%20gostaria%20de%20mais%20informa%C3%A7%C3%B5es.";

function getWhatsAppUrl(): string {
  try {
    const url = (COMPANY as unknown as { whatsapp?: { url?: unknown } } | undefined)?.whatsapp?.url;
    return typeof url === "string" && url.length > 0 ? url : FALLBACK_WHATSAPP_URL;
  } catch {
    return FALLBACK_WHATSAPP_URL;
  }
}

export function SiteNotice() {
  const whatsappUrl = getWhatsAppUrl();
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
            href={whatsappUrl}
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
