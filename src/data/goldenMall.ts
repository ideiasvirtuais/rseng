import photo01 from "@/assets/comerciais/golden-mall/golden-mall-01.webp.asset.json";
import photo02 from "@/assets/comerciais/golden-mall/golden-mall-02.webp.asset.json";
import photo03 from "@/assets/comerciais/golden-mall/golden-mall-03.webp.asset.json";
import photo04 from "@/assets/comerciais/golden-mall/golden-mall-04.webp.asset.json";
import photo05 from "@/assets/comerciais/golden-mall/golden-mall-05.webp.asset.json";
import photo06 from "@/assets/comerciais/golden-mall/golden-mall-06.webp.asset.json";
import photo07 from "@/assets/comerciais/golden-mall/golden-mall-07.webp.asset.json";
import photo08 from "@/assets/comerciais/golden-mall/golden-mall-08.webp.asset.json";
import floorPlan from "@/assets/comerciais/golden-mall/golden-mall-09.webp.asset.json";

/** Acesso defensivo a imports `.asset.json` (HMR/SSR podem entregar undefined). */
function assetUrl(input: unknown): string {
  try {
    const url = (input as { url?: unknown } | undefined)?.url;
    if (typeof url === "string" && url.length > 0) return url;
    const def = (input as { default?: unknown } | undefined)?.default;
    if (typeof def === "string" && def.length > 0) return def;
    if (typeof input === "string") return input;
  } catch {
    // nunca lança em module evaluation — derrubaria o match __root__/
  }
  return "";
}

export const goldenMallImages = [
  { src: assetUrl(photo01), alt: "Perspectiva frontal aérea do Golden Mall Rosário" },
  { src: assetUrl(photo02), alt: "Perspectiva da fachada de esquina do Golden Mall Rosário" },
  { src: assetUrl(photo03), alt: "Perspectiva das lojas e da sinalização do Golden Mall Rosário" },
  { src: assetUrl(photo04), alt: "Perspectiva lateral das lojas do Golden Mall Rosário" },
  { src: assetUrl(photo05), alt: "Perspectiva das lojas 9, 10 e 11 do Golden Mall Rosário" },
  { src: assetUrl(photo06), alt: "Vista aérea do Golden Mall Rosário e seus acessos" },
  { src: assetUrl(photo07), alt: "Vista aérea posterior do Golden Mall Rosário" },
  { src: assetUrl(photo08), alt: "Perspectiva aérea frontal do Golden Mall Rosário" },
  { src: assetUrl(floorPlan), alt: "Planta térrea das 12 lojas do Golden Mall Rosário" },
] as const;

export const goldenMallCover = goldenMallImages?.[1]?.src ?? goldenMallImages?.[0]?.src ?? "";