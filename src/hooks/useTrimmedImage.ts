import { useEffect, useState } from "react";
import { resolveImage, type ImageInput } from "@/lib/images";

export interface TrimmedImageResult {
  /** URL pronta para o <img>: dataURL recortada ou a original resolvida. */
  src: string;
  /** True quando o recorte removeu borda branca de verdade. */
  isTrimmed: boolean;
  /** Percentuais recortados em cada borda (0–1). Útil para debug/CSS. */
  crop: { top: number; right: number; bottom: number; left: number };
}

const DEFAULT_CROP = { top: 0, right: 0, bottom: 0, left: 0 } as const;

interface TrimOptions {
  /** Canal mínimo para considerar "branco" (0–255). Padrão 242. */
  whiteThreshold?: number;
  /** Fração mínima de pixels brancos numa fileira/coluna de borda. Padrão 0.97. */
  edgeCoverage?: number;
  /** Margem de segurança preservada ao redor do conteúdo (px na amostra). Padrão 2. */
  padding?: number;
  /** Largura máxima da amostra de varredura (performance). Padrão 360. */
  sampleWidth?: number;
  /** Largura máxima da imagem final recortada. Padrão 1080. */
  maxOutputWidth?: number;
}

/**
 * Remove automaticamente bordas brancas/quase-brancas de prints (ex: screenshot
 * do grid do Instagram com margens do navegador).
 *
 * - Roda 100% no cliente via <canvas>, sem dependências.
 * - Varre uma amostra reduzida para achar o bounding-box do conteúdo real.
 * - Recorta em resolução cheia e devolve um dataURL JPEG.
 * - Falha defensiva: qualquer erro retorna a URL original (nunca quebra render).
 */
export function useTrimmedImage(input: ImageInput, options?: TrimOptions): TrimmedImageResult {
  const resolved = (() => {
    try {
      return resolveImage(input) ?? "";
    } catch {
      return "";
    }
  })();

  const [state, setState] = useState<TrimmedImageResult>({
    src: resolved,
    isTrimmed: false,
    crop: { ...DEFAULT_CROP },
  });

  useEffect(() => {
    if (!resolved || typeof window === "undefined" || typeof document === "undefined") {
      setState({ src: resolved, isTrimmed: false, crop: { ...DEFAULT_CROP } });
      return;
    }
    if (/^(data:|blob:)/i.test(resolved) && resolved.length > 2_000_000) {
      // DataURL gigante já processada — não reprocessa.
      setState((s) => ({ ...s, src: resolved }));
      return;
    }

    let cancelled = false;

    const whiteThreshold = options?.whiteThreshold ?? 242;
    const edgeCoverage = options?.edgeCoverage ?? 0.97;
    const padding = options?.padding ?? 2;
    const sampleWidth = options?.sampleWidth ?? 360;
    const maxOutputWidth = options?.maxOutputWidth ?? 1080;

    const img = new Image();
    // Same-origin (public/) — sem CORS necessário; mantém sem crossOrigin
    // para não "taintar" o canvas em deploys com base path.
    img.decoding = "async";

    img.onload = () => {
      try {
        if (cancelled) return;
        const naturalW = img.naturalWidth || img.width;
        const naturalH = img.naturalHeight || img.height;
        if (!naturalW || !naturalH) return;

        const scale = Math.min(1, sampleWidth / naturalW);
        const sw = Math.max(1, Math.round(naturalW * scale));
        const sh = Math.max(1, Math.round(naturalH * scale));

        const scanCanvas = document.createElement("canvas");
        scanCanvas.width = sw;
        scanCanvas.height = sh;
        const scanCtx = scanCanvas.getContext("2d", { willReadFrequently: true });
        if (!scanCtx) return;
        // Fundo preto para não mascarar transparência como branco.
        scanCtx.fillStyle = "#000";
        scanCtx.fillRect(0, 0, sw, sh);
        scanCtx.drawImage(img, 0, 0, sw, sh);

        let pixels: ImageData;
        try {
          pixels = scanCtx.getImageData(0, 0, sw, sh);
        } catch {
          return; // Canvas tainted — mantém original.
        }
        const data = pixels.data;
        const isWhite = (x: number, y: number): boolean => {
          const i = (y * sw + x) * 4;
          return (
            data[i] >= whiteThreshold &&
            data[i + 1] >= whiteThreshold &&
            data[i + 2] >= whiteThreshold
          );
        };
        const lineIsWhite = (horizontal: boolean, fixed: number, from: number, to: number): boolean => {
          let white = 0;
          const total = Math.max(1, to - from);
          for (let v = from; v < to; v++) {
            if (horizontal ? isWhite(v, fixed) : isWhite(fixed, v)) white++;
          }
          return white / total >= edgeCoverage;
        };

        let top = 0;
        while (top < sh && lineIsWhite(true, top, 0, sw)) top++;
        let bottom = sh - 1;
        while (bottom > top && lineIsWhite(true, bottom, 0, sw)) bottom--;
        let left = 0;
        while (left < sw && lineIsWhite(false, left, top, bottom + 1)) left++;
        let right = sw - 1;
        while (right > left && lineIsWhite(false, right, top, bottom + 1)) right--;

        top = Math.max(0, top - padding);
        left = Math.max(0, left - padding);
        bottom = Math.min(sh - 1, bottom + padding);
        right = Math.min(sw - 1, right + padding);

        const cropTop = top / sh;
        const cropBottom = (sh - 1 - bottom) / sh;
        const cropLeft = left / sw;
        const cropRight = (sw - 1 - right) / sw;

        const removesSomething =
          cropTop > 0.015 || cropBottom > 0.015 || cropLeft > 0.015 || cropRight > 0.015;

        if (!removesSomething || right <= left || bottom <= top) {
          if (!cancelled) {
            setState({ src: resolved, isTrimmed: false, crop: { ...DEFAULT_CROP } });
          }
          return;
        }

        // Recorta em resolução cheia (limitada) para nitidez no card.
        const outScale = Math.min(1, maxOutputWidth / naturalW);
        const outW = Math.round(naturalW * outScale);
        const outH = Math.round(naturalH * outScale);
        const sx = (left / sw) * outW;
        const sy = (top / sh) * outH;
        const sW = ((right - left + 1) / sw) * outW;
        const sH = ((bottom - top + 1) / sh) * outH;

        const outCanvas = document.createElement("canvas");
        outCanvas.width = Math.max(1, Math.round(sW));
        outCanvas.height = Math.max(1, Math.round(sH));
        const outCtx = outCanvas.getContext("2d");
        if (!outCtx) return;
        // Desenha do <img> original escalado para o tamanho de saída.
        outCtx.drawImage(img, sx, sy, sW, sH, 0, 0, outCanvas.width, outCanvas.height);

        let trimmed = "";
        try {
          trimmed = outCanvas.toDataURL("image/jpeg", 0.92);
        } catch {
          return;
        }
        if (!cancelled && trimmed && trimmed.length > 64) {
          setState({
            src: trimmed,
            isTrimmed: true,
            crop: { top: cropTop, right: cropRight, bottom: cropBottom, left: cropLeft },
          });
        }
      } catch {
        // Falha silenciosa — mantém a original.
      }
    };
    img.onerror = () => {
      if (!cancelled) setState({ src: resolved, isTrimmed: false, crop: { ...DEFAULT_CROP } });
    };
    img.src = resolved;

    return () => {
      cancelled = true;
      try {
        img.onload = null;
        img.onerror = null;
      } catch {
        // no-op
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved]);

  return state;
}
