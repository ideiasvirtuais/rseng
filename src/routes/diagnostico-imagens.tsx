import { createFileRoute } from "@tanstack/react-router";
import { ImageDiagnostics } from "@/components/ImageDiagnostics";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SITE_URL } from "@/data/company";

const TITLE = "Diagnóstico de imagens — Rezende Saback";
const DESCRIPTION =
  "Verificação automática dos caminhos, formatos, dimensões e carregamento das imagens do site Rezende Saback.";

export const Route = createFileRoute("/diagnostico-imagens")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/diagnostico-imagens` }],
  }),
  component: ImageDiagnosticsPage,
});

function ImageDiagnosticsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <ImageDiagnostics />
      <SiteFooter />
    </div>
  );
}