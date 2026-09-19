import { createFileRoute } from "@tanstack/react-router";

import { SegmentPage } from "@/components/SegmentPage";
import { SITE_URL } from "@/data/company";
import { requireSegment } from "@/data/segments";

const segment = requireSegment("casas-de-alto-padrao");
const URL = `${typeof SITE_URL === "string" && SITE_URL ? SITE_URL : "https://rsengenharia.eng.br"}/casas-de-alto-padrao`;

export const Route = createFileRoute("/casas-de-alto-padrao")({
  head: () => {
    try {
      const seg = segment ?? requireSegment("casas-de-alto-padrao");
      const siteUrl = typeof SITE_URL === "string" && SITE_URL ? SITE_URL : "https://rsengenharia.eng.br";
      const seoTitle = typeof seg?.seoTitle === "string" ? seg.seoTitle : "Casas de Alto Padrão em Betim — Rezende Saback";
      const seoDesc = typeof seg?.seoDescription === "string" ? seg.seoDescription : "Casas de alto padrão em Betim/MG.";
      const cover = typeof seg?.cover === "string" ? seg.cover : "";
      const label = typeof seg?.label === "string" ? seg.label : "Casas de Alto Padrão";
      return {
        meta: [
          { title: seoTitle },
          { name: "description", content: seoDesc },
          { property: "og:title", content: seoTitle },
          { property: "og:description", content: seoDesc },
          { property: "og:type", content: "website" },
          { property: "og:url", content: URL },
          { property: "og:image", content: `${siteUrl}${cover}` },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:image", content: `${siteUrl}${cover}` },
        ],
        links: [{ rel: "canonical", href: URL }],
        scripts: [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CollectionPage",
              name: label,
              description: seoDesc,
              url: URL,
              about: { "@type": "Organization", name: "Rezende Saback", url: siteUrl },
            }),
          },
        ],
      };
    } catch {
      return { meta: [{ title: "Casas de Alto Padrão em Betim — Rezende Saback" }] };
    }
  },
  component: () => <SegmentPage segment={segment} />,
});
