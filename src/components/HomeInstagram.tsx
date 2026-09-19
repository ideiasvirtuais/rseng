import { ArrowUpRight, BadgeCheck, Instagram } from "lucide-react";

import { COMPANY } from "@/data/company";
import { SmartImage } from "@/components/SmartImage";
import { useTrimmedImage } from "@/hooks/useTrimmedImage";

/**
 * Bloco "Nas redes" da home — feed real do Instagram.
 *
 * Exibe o print oficial do grid @rezendesabackengenharia
 * (public/instagram-rs.jpg — arquivo real em disco, lowercase) como
 * prova social clicável para o perfil. NÃO usar variante .JPG/.jpeg
 * como fallback explícito: esses arquivos não existem e geravam
 * requisições 404 com log "[SmartImage] falha ao carregar".
 *
 * Anti-espaço-branco:
 * - `useTrimmedImage` remove em runtime as margens brancas do screenshot
 *   via canvas (bounding-box do conteúdo real).
 * - O frame usa altura fixa com `object-cover` + fundo escuro, então mesmo
 *   antes do trim (ou se o canvas falhar) não há letterboxing branco.
 * - Seção compacta (py-10/lg:py-14, gaps reduzidos) — o `section-y`
 *   (py-24/lg:py-28) criava um respiro branco gigante acima/abaixo da foto.
 */
export function HomeInstagram() {
  const instagramUrl = COMPANY?.social?.instagram?.url ?? "https://www.instagram.com/rezendesabackengenharia";
  const instagramHandle = COMPANY?.social?.instagram?.handle ?? "@rezendesabackengenharia";
  const trimmed = useTrimmedImage("/instagram-rs.jpg");
  const photoSrc = trimmed.src || "/instagram-rs.jpg";
  return (
    <section aria-labelledby="instagram-title" className="border-y border-border bg-secondary">
      <div className="container-x grid items-center gap-6 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10 lg:py-14">
        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Nas redes</div>
          <h2 id="instagram-title" className="mt-3">
            Acompanhe as obras no nosso Instagram.
          </h2>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-2 font-medium text-primary hover:underline"
          >
            <Instagram className="h-4 w-4" aria-hidden="true" />
            {instagramHandle}
          </a>
          <p className="mt-4 max-w-md text-muted-foreground">
            Concretagem, terraplanagem, entregas e bastidores — publicamos primeiro nas nossas
            redes. Siga o perfil para ver cada etapa das obras em Betim/MG.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              <Instagram className="h-4 w-4" aria-hidden="true" />
              Seguir no Instagram
            </a>
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Ver perfil <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <dl className="mt-5 flex gap-8 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Obras</dt>
              <dd className="mt-1 text-lg font-semibold text-primary">Tempo real</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Bastidores</dt>
              <dd className="mt-1 text-lg font-semibold text-primary">Toda semana</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Entregas</dt>
              <dd className="mt-1 text-lg font-semibold text-primary">Desde 1988</dd>
            </div>
          </dl>
        </div>
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Abrir perfil @rezendesabackengenharia no Instagram"
          className="group overflow-hidden rounded-2xl border border-border bg-card shadow-xl transition hover:shadow-2xl"
        >
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white">
              <Instagram className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-primary">
                {instagramHandle}
                <BadgeCheck className="h-4 w-4 flex-none text-sky-500" aria-label="Perfil oficial" />
              </p>
              <p className="truncate text-xs text-muted-foreground">Bastidores, lançamentos e acabamentos</p>
            </div>
            <span className="inline-flex flex-none items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition group-hover:bg-primary/90">
              Seguir <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </span>
          </div>
          <div className="relative overflow-hidden bg-[#14163a]">
            <SmartImage
              src={photoSrc}
              alt="Grade de publicações do Instagram @rezendesabackengenharia — concretagem de fundação de galpão industrial, obras comerciais e campanhas institucionais da Rezende Saback"
              wrapperClassName="block w-full"
              skeletonClassName="h-[320px] w-full sm:h-[380px] lg:h-[420px]"
              className="h-[320px] w-full object-cover object-[center_22%] transition duration-700 group-hover:scale-[1.02] sm:h-[380px] lg:h-[420px]"
              loading="lazy"
              decoding="async"
              fallbackLabel="Publicações do Instagram @rezendesabackengenharia"
            />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-primary/15 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
          </div>
          <p className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs text-muted-foreground">
            <span className="truncate">Publicamos primeiro nas nossas redes — toque para abrir o perfil.</span>
            <Instagram className="h-4 w-4 flex-none text-primary" aria-hidden="true" />
          </p>
        </a>
      </div>
    </section>
  );
}
