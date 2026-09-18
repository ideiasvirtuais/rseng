import { useEffect } from "react";
import { preloadImages, warmCriticalImage } from "@/lib/image-health";
import { resolveImage, type ImageInput } from "@/lib/images";

/**
 * Pré-carrega imagens críticas em idle, sem bloquear o LCP.
 * Uso: `useImagePreloader([HERO_URL, LOGO_URL])` no shell / home.
 */
export function useImagePreloader(images: ImageInput[], critical?: ImageInput) {
  useEffect(() => {
    try {
      if (critical) {
        const href = resolveImage(critical);
        if (href) warmCriticalImage(href);
      }
    } catch {
      // no-op
    }
    try {
      const urls = images.map((i) => resolveImage(i)).filter(Boolean);
      if (urls.length === 0) return;
      void preloadImages(urls);
    } catch {
      // no-op
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.join("|"), resolveImage(critical)]);
}
