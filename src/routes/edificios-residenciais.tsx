import { createFileRoute } from "@tanstack/react-router";

import { SegmentPage } from "@/components/SegmentPage";
import { SITE_URL } from "@/data/company";
import { requireSegment } from "@/data/segments";

const segment = requireSegment("edificios-residenciais");
const URL = `${typeof SITE_URL === "string" && SITE_URL ? SITE_URL : "https://rsengenharia.eng.br"}/edificios-residenciais`;

export const Route = createFileRoute("/edificios-residenciais")({
  head: () => {
    try {
      const seg = segment ?? requireSegment("edificios-residenciais");
      const siteUrl = typeof SITE_URL === "string" && SITE_URL ? SITE_URL : "https://rsengenharia.eng.br";
      const seoTitle = typeof seg?.seoTitle === "string" ? seg.seoTitle : "Edifícios Residenciais em Betim — Rezende Saback";
      const seoDesc = typeof seg?.seoDescription === "string" ? seg.seoDescription : "Apartamentos e edifícios residenciais em Betim/MG.";
      const cover = typeof seg?.cover === "string" ? seg.cover : "";
      const label = typeof seg?.label === "string" ? seg.label : "Edifícios Residenciais";
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
      return { meta: [{ title: "Edifícios Residenciais em Betim — Rezende Saback" }] };
    }
  },
  component: () => <SegmentPage segment={segment} />,
});
