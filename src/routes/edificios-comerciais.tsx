import { createFileRoute } from "@tanstack/react-router";

import { SegmentPage } from "@/components/SegmentPage";
import { COMPANY, SITE_URL } from "@/data/company";
import { getSegment } from "@/data/segments";

const segment = getSegment("edificios-comerciais");
const URL = `${SITE_URL}/edificios-comerciais`;

export const Route = createFileRoute("/edificios-comerciais")({
  head: () => ({
    meta: [
      { title: segment.seoTitle },
      { name: "description", content: segment.seoDescription },
      { property: "og:title", content: segment.seoTitle },
      { property: "og:description", content: segment.seoDescription },
      { property: "og:type", content: "website" },
      { property: "og:url", content: URL },
      { property: "og:image", content: `${SITE_URL}${segment.cover}` },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: `${SITE_URL}${segment.cover}` },
    ],
    links: [{ rel: "canonical", href: URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: segment.label,
          description: segment.seoDescription,
          url: URL,
          about: { "@type": "Organization", name: COMPANY.name, url: SITE_URL },
        }),
      },
    ],
  }),
  component: () => <SegmentPage segment={segment} />,
});
