import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { AllImagesGallery } from "@/components/AllImagesGallery";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { COMPANY, SITE_URL } from "@/data/company";
import { countAllImages } from "@/lib/all-images";

const OG_IMAGE = `${SITE_URL}/og-cover.jpg`;
const OG_TITLE = `Todas as imagens — ${COMPANY.name}`;
const OG_DESCRIPTION = `Galeria completa com todas as fotos do site: hero, lançamento Golden Mall, edifícios residenciais, obras comerciais e casas de alto padrão em Betim/MG.`;

export const Route = createFileRoute("/galeria")({
  component: GaleriaPage,
  head: () => ({
    meta: [
      { title: OG_TITLE },
      { name: "description", content: OG_DESCRIPTION },
      { property: "og:title", content: OG_TITLE },
      { property: "og:description", content: OG_DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/galeria` },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: OG_TITLE },
      { name: "twitter:description", content: OG_DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/galeria` }],
  }),
});

function GaleriaPage() {
  let total = 0;
  try {
    total = countAllImages();
  } catch {
    total = 0;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <div className="container-x pt-8">
        <nav aria-label="Trilha de navegação" className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Link to="/" className="inline-flex items-center gap-1 hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" /> Início
          </Link>
          <span>/</span>
          <span className="text-primary">Galeria completa ({total} fotos)</span>
        </nav>
      </div>

      <AllImagesGallery eager />

      <section className="container-x pb-24">
        <div className="flex flex-wrap gap-3">
          <Link
            to="/edificios-residenciais"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Ver residenciais <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            to="/edificios-comerciais"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-primary transition hover:border-primary"
          >
            Ver comerciais <ArrowUpRight className="h-4 w-4" />
          </Link>
          <Link
            to="/casas-de-alto-padrao"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-medium text-primary transition hover:border-primary"
          >
            Ver casas <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
