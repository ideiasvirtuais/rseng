/**
 * Fonte única de informações oficiais da Rezende Saback.
 * Sincronizado com https://rsengenharia.eng.br/ (site em atualização em 09/2026 —
 * canal oficial: WhatsApp 31 99304-0342) + dados institucionais do projeto.
 *
 * IMPORTANTE: altere aqui e todo o site (header, home, segmentos, obras,
 * contato, rodapé, WhatsApp, SEO) reflete automaticamente.
 */

export const SITE_URL = "https://rsengenharia.eng.br";

export const COMPANY = {
  name: "Rezende Saback Construtora",
  legalName: "Rezende Saback Engenharia Ltda",
  tagline: "Empreendimentos em Betim/MG",
  foundedYear: 1988,
  city: "Betim",
  state: "MG",
  address: {
    street: "Av. Teotônio Parreira Coelho, 613 — 6º andar",
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
    /** Mensagem padrão usada no botão flutuante e no aviso do site oficial. */
    defaultMessage: "Olá! Vim pelo site e gostaria de mais informações.",
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
  hours: "Seg–Sex, 9h às 18h",
} as const;

export const COMPANY_YEARS = new Date().getFullYear() - COMPANY.foundedYear;

export const HERO_IMAGE = "/hero-rosario.jpg";
export const HERO_IMAGE_FALLBACK = "/hero-rosario.webp";
export const LOGO_IMAGE = "/logo-rezende-saback.png";
export const FAVICON_IMAGE = "/favicon.png";
export const OG_IMAGE = "/og-cover.jpg";
