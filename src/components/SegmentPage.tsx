import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Diamond, Mail, MapPin, Phone, X, ZoomIn } from "lucide-react";

import { COMPANY } from "@/data/company";

import { SiteHeader } from "./SiteHeader";
import { segmentNav } from "./segments";
import { SiteFooter } from "./SiteFooter";
import { ContactForm } from "./ContactForm";
import { SmartImage } from "./SmartImage";
import type { Segment } from "@/data/segments";

export function SegmentPage({ segment }: { segment: Segment }) {
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  // Segmento pode chegar incompleto em HMR/navegação parcial: defaults
  // defensivos impedem throw no render (tela branca).
  const safeSegment = (segment ?? {}) as Partial<Segment>;
  const photos = Array.isArray(safeSegment.photos) ? safeSegment.photos : [];
  const label = typeof safeSegment.label === "string" ? safeSegment.label : "Empreendimentos";
  const slug = typeof safeSegment.slug === "string" ? safeSegment.slug : "";
  const cover = typeof safeSegment.cover === "string" ? safeSegment.cover : "";
  const coverAlt = typeof safeSegment.coverAlt === "string" ? safeSegment.coverAlt : label;
  const eyebrow = typeof safeSegment.eyebrow === "string" ? safeSegment.eyebrow : "";
  const headline = typeof safeSegment.headline === "string" ? safeSegment.headline : label;
  const headlineAccent = typeof safeSegment.headlineAccent === "string" ? safeSegment.headlineAccent : "";
  const summary = typeof safeSegment.summary === "string" ? safeSegment.summary : "";
  const intro = Array.isArray(safeSegment.intro) ? safeSegment.intro : [];
  const features = Array.isArray(safeSegment.features) ? safeSegment.features : [];
  const segProjects = Array.isArray(safeSegment.projects) ? safeSegment.projects : [];
  const companyName = typeof COMPANY?.name === "string" ? COMPANY.name : "Rezende Saback";
  const whatsappUrl = typeof COMPANY?.whatsapp?.url === "string" ? COMPANY.whatsapp.url : "#contato";
  const whatsappDisplay = typeof COMPANY?.whatsapp?.display === "string" ? COMPANY.whatsapp.display : "";
  const phones: Array<{ href: string; label: string }> = Array.isArray(
    (COMPANY as unknown as { phones?: unknown })?.phones,
  )
    ? ((COMPANY as unknown as { phones: Array<{ href: string; label: string }> }).phones ?? [])
    : [];
  const emailHref = typeof COMPANY?.email?.href === "string" ? COMPANY.email.href : "mailto:";
  const emailAddress = typeof COMPANY?.email?.address === "string" ? COMPANY.email.address : "";
  const address = COMPANY?.address;
  // `?? null` impede acesso a índice inexistente (ex: lista trocada com
  // o lightbox aberto), que lançava e derrubava a rota.
  const photo = photoIndex !== null ? (photos[photoIndex] ?? null) : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="relative min-h-[52vh] w-full">
          {cover ? (
            <SmartImage
              src={cover}
              alt={coverAlt}
              wrapperClassName="absolute inset-0"
              className="h-full w-full object-cover"
              loading="eager"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/70 to-primary/90" />
          <div className="container-x relative flex min-h-[52vh] flex-col justify-end pb-14 pt-24 text-primary-foreground">
            <nav aria-label="Trilha de navegação" className="mb-6 text-xs text-primary-foreground/90">
              <Link to="/" className="hover:text-accent">Início</Link>
              <span className="mx-2">/</span>
              <span className="text-primary-foreground">{label}</span>
            </nav>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-4 py-1.5 text-xs uppercase tracking-[0.2em] backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {eyebrow}
            </div>
            <h1 className="mt-6 max-w-3xl">
              {headline} <span className="text-accent">{headlineAccent}</span>.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-primary-foreground/85">{summary}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#fotos"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-primary transition hover:brightness-105"
              >
                Ver fotos <ArrowUpRight className="h-4 w-4" />
              </a>
              <a
                href="#contato"
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/40 px-6 py-3 text-sm font-medium text-primary-foreground backdrop-blur hover:bg-primary-foreground/10"
              >
                Falar com um consultor
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Intro + diferenciais */}
      <section className="container-x section-y">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6 text-lg text-muted-foreground">
            {intro.map((p, i) => (
              <p key={`${i}-${typeof p === "string" ? p.slice(0, 24) : i}`}>{typeof p === "string" ? p : ""}</p>
            ))}
          </div>
          <ul className="space-y-4 rounded-2xl border border-border bg-card p-8">
            <li className="text-xs uppercase tracking-[0.25em] text-muted-foreground">O que entregamos</li>
            {features.map((f, i) => (
              <li key={`${i}-${typeof f === "string" ? f.slice(0, 24) : i}`} className="flex items-start gap-3">
                <Diamond className="mt-1 h-4 w-4 flex-none fill-accent text-accent" />
                <span className="text-primary">{typeof f === "string" ? f : ""}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Empreendimentos do segmento */}
      {segProjects.length > 0 && (
        <section id="empreendimentos" className="border-y border-border bg-secondary">
          <div className="container-x section-y">
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Empreendimentos</div>
            <h2 className="mt-4 max-w-2xl">Obras deste segmento.</h2>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {segProjects.map((p, i) => {
                if (!p || typeof p !== "object") return null;
                const pSlug = typeof p.slug === "string" ? p.slug : "";
                const pName = typeof p.name === "string" ? p.name : "Empreendimento";
                const pImg = typeof p.img === "string" ? p.img : "";
                const pTag = typeof p.tag === "string" ? p.tag : "";
                const pType = typeof p.type === "string" ? p.type : "";
                const pAddress = typeof p.address === "string" ? p.address : "";
                const pYear = typeof p.year === "string" || typeof p.year === "number" ? p.year : "";
                if (!pSlug) return null;
                return (
                <Link
                  key={pSlug || i}
                  to="/obras/$slug"
                  params={{ slug: pSlug }}
                  aria-label={`Ver detalhes de ${pName}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  <article>
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <SmartImage
                        src={pImg}
                        alt={pName}
                        wrapperClassName="h-full w-full"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                      <span className="absolute left-4 top-4 rounded-full bg-background/95 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-primary">
                        {pTag}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-xl font-semibold text-primary">{pName}</h3>
                        <ArrowUpRight className="mt-1 h-5 w-5 flex-none text-muted-foreground transition group-hover:text-primary" aria-hidden="true" />
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">{pType}</div>
                      <div className="mt-4 flex items-start justify-between gap-4 border-t border-border pt-4 text-sm">
                        <span className="text-muted-foreground">{pAddress}</span>
                        <span className="font-medium text-primary">— {pYear}</span>
                      </div>
                    </div>
                  </article>
                </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Galeria de fotos do segmento */}
      <section id="fotos" className="container-x section-y">
        <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Galeria</div>
        <h2 className="mt-4 max-w-2xl">Fotos de {label.toLowerCase()}.</h2>

        {photos.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((item, i) => {
              if (!item || typeof item !== "object") return null;
              const src = typeof item.src === "string" ? item.src : "";
              const alt = typeof item.alt === "string" ? item.alt : "Foto do empreendimento";
              const caption = typeof item.caption === "string" ? item.caption : "";
              const title = typeof item.title === "string" ? item.title : "";
              if (!src) return null;
              return (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setPhotoIndex(i)}
                className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card text-left"
                aria-label={`Ampliar ${alt}`}
              >
                <SmartImage
                  src={src}
                  alt={alt}
                  wrapperClassName="absolute inset-0"
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/85 via-primary/15 to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-primary-foreground opacity-0 transition group-hover:opacity-100">
                  <div className="min-w-0">
                    <div className="text-[11px] uppercase tracking-[0.2em] text-accent">{caption}</div>
                    <div className="truncate text-sm font-semibold">{title}</div>
                  </div>
                  <ZoomIn className="h-5 w-5 shrink-0" />
                </div>
              </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Fotos deste segmento em atualização.
          </div>
        )}
      </section>

      {photo && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Visualização ampliada"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-primary/95 p-4 backdrop-blur-sm"
          onClick={() => setPhotoIndex(null)}
        >
          <button
            type="button"
            aria-label="Fechar"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary-foreground/30 text-primary-foreground transition hover:bg-primary-foreground/10"
            onClick={(e) => {
              e.stopPropagation();
              setPhotoIndex(null);
            }}
          >
            <X className="h-5 w-5" />
          </button>
          <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <SmartImage
              src={typeof photo.src === "string" ? photo.src : ""}
              alt={typeof photo.alt === "string" ? photo.alt : "Foto ampliada"}
              wrapperClassName="block w-full"
              className="max-h-[80vh] w-auto rounded-2xl object-contain shadow-2xl"
              loading="eager"
            />
            <figcaption className="mt-4 text-center text-sm text-primary-foreground/90">
              <span className="text-accent">{typeof photo.caption === "string" ? photo.caption : ""}</span> · {typeof photo.title === "string" ? photo.title : ""}
            </figcaption>
          </figure>
        </div>
      )}

      {/* Outros segmentos */}
      <section className="border-y border-border bg-secondary">
        <div className="container-x section-y">
          <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Outros segmentos</div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(Array.isArray(segmentNav) ? segmentNav : [])
              .filter((s) => s && typeof s.to === "string" && !s.to.endsWith(slug))
              .map((s) => (
                <Link
                  key={s.to}
                  to={s.to}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 transition hover:border-primary/40 hover:shadow-lg"
                >
                  <span className="text-lg font-semibold text-primary">{s.label}</span>
                  <ArrowUpRight className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" aria-hidden="true" />
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Contato */}
      <section id="contato" className="container-x section-y">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Central de vendas</div>
            <h2 className="mt-4">
              Tem interesse em <span className="text-primary/70">{label.toLowerCase()}</span>?
            </h2>
            <p className="mt-6 text-muted-foreground">
              Deixe seus dados e um consultor da {companyName} retorna em até um dia útil com disponibilidade, plantas e condições.
            </p>
            <div className="mt-8 space-y-3 text-sm">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-medium text-primary hover:underline">
                <Phone className="h-4 w-4" /> {whatsappDisplay} (WhatsApp)
              </a>
              {phones.map((p) => {
                if (!p || typeof p.href !== "string") return null;
                return (
                <a key={p.href} href={p.href} className="flex items-center gap-2 text-primary hover:underline">
                  <Phone className="h-4 w-4" /> {typeof p.label === "string" ? p.label : p.href}
                </a>
                );
              })}
              <a href={emailHref} className="flex items-center gap-2 text-primary hover:underline">
                <Mail className="h-4 w-4" /> {emailAddress}
              </a>
              {address && typeof address.mapsUrl === "string" ? (
              <a href={address.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-muted-foreground hover:text-primary">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{address.street}, {address.district}, {address.city}/{address.state} · CEP {address.cep}</span>
              </a>
              ) : null}
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
