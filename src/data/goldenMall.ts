import photo01 from "@/assets/comerciais/golden-mall/golden-mall-01.webp.asset.json";
import photo02 from "@/assets/comerciais/golden-mall/golden-mall-02.webp.asset.json";
import photo03 from "@/assets/comerciais/golden-mall/golden-mall-03.webp.asset.json";
import photo04 from "@/assets/comerciais/golden-mall/golden-mall-04.webp.asset.json";
import photo05 from "@/assets/comerciais/golden-mall/golden-mall-05.webp.asset.json";
import photo06 from "@/assets/comerciais/golden-mall/golden-mall-06.webp.asset.json";
import photo07 from "@/assets/comerciais/golden-mall/golden-mall-07.webp.asset.json";
import photo08 from "@/assets/comerciais/golden-mall/golden-mall-08.webp.asset.json";
import floorPlan from "@/assets/comerciais/golden-mall/golden-mall-09.webp.asset.json";

export const goldenMallImages = [
  { src: photo01.url, alt: "Perspectiva frontal aérea do Golden Mall Rosário" },
  { src: photo02.url, alt: "Perspectiva da fachada de esquina do Golden Mall Rosário" },
  { src: photo03.url, alt: "Perspectiva das lojas e da sinalização do Golden Mall Rosário" },
  { src: photo04.url, alt: "Perspectiva lateral das lojas do Golden Mall Rosário" },
  { src: photo05.url, alt: "Perspectiva das lojas 9, 10 e 11 do Golden Mall Rosário" },
  { src: photo06.url, alt: "Vista aérea do Golden Mall Rosário e seus acessos" },
  { src: photo07.url, alt: "Vista aérea posterior do Golden Mall Rosário" },
  { src: photo08.url, alt: "Perspectiva aérea frontal do Golden Mall Rosário" },
  { src: floorPlan.url, alt: "Planta térrea das 12 lojas do Golden Mall Rosário" },
] as const;

export const goldenMallCover = goldenMallImages[1].src;