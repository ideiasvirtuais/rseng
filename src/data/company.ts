/**
 * Fonte ├║nica de informa├º├Áes oficiais da Rezende Saback.
 * Sincronizado com https://rsengenharia.eng.br/ (site em atualiza├º├úo em 09/2026 ÔÇö
 * canal oficial: WhatsApp 31 99304-0342) + dados institucionais do projeto.
 *
 * IMPORTANTE: altere aqui e todo o site (header, home, segmentos, obras,
 * contato, rodap├®, WhatsApp, SEO) reflete automaticamente.
 */

export const SITE_URL = "https://rsengenharia.eng.br";

export const COMPANY = {
  name: "Rezende Saback Construtora",
  legalName: "Rezende Saback Engenharia Ltda",
  tagline: "Empreendimentos em Betim/MG",
  foundedYear: 2005,
  city: "Betim",
  state: "MG",
  address: {
    street: "Av. Teot├┤nio Parreira Coelho, 613 ÔÇö 6┬║ andar",
    district: "Jardim da Cidade",
    city: "Betim",
    state: "MG",
    cep: "32604-275",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Teot%C3%B4nio+Parreira+Coelho,+613,+Jardim+da+Cidade,+Betim-MG",
  },
  phones: [
    { label: "(31) 3531-1342", href: "tel:+553135311342" },
    { label: "(31) 3531-1384", href: "tel:+553135311384" },
  ],
  whatsapp: {
    number: "5531993040342",
    display: "(31) 99304-0342",
    /** Mensagem padr├úo usada no bot├úo flutuante e no aviso do site oficial. */
    defaultMessage: "Ol├í! Vim pelo site e gostaria de mais informa├º├Áes.",
    get url() {
      return `https://wa.me/${this.number}?text=${encodeURIComponent(this.defaultMessage)}`;
    },
  },
  email: {
    address: "contato@rsengenharia.eng.br",
    get href() {
      return `mailto:${this.address}`;
    },
  },
  social: {
    instagram: {
      handle: "@rezendesabackengenharia",
      url: "https://www.instagram.com/rezendesabackengenharia/",
    },
    facebook: {
      handle: "/rezendesaback",
      url: "https://www.facebook.com/rezendesaback",
    },
  },
  hours: "SegÔÇôSex, 9h ├ás 18h",
} as const;

/** Anos exibidos no site — Desde 2005: 21 anos em 2026 (2 décadas de atuação). */
export const COMPANY_YEARS = 21;

/**
 * Cr├®dito oficial do rodap├® ÔÇö ag├¬ncia desenvolvedora do site.
 * Todos os links externos do rodap├® abrem em nova janela
 * (target="_blank" + rel="noopener noreferrer").
 */
export const DEVELOPER = {
  name: "IDEIAS VIRTUAIS",
  url: "http://www.ideiasvirtuais.com.br/",
  year: 2026,
} as const;

export const HERO_IMAGE = "/hero-rosario.jpg";
export const HERO_IMAGE_FALLBACK = "/hero-rosario.webp";
export const LOGO_IMAGE = "/logo-rezende-saback.png";
export const FAVICON_IMAGE = "/favicon.png";
export const OG_IMAGE = "/og-cover.jpg";
