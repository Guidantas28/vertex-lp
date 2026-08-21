import type { CollectionEntry } from "astro:content";

export const CATEGORY_META: Record<
  string,
  { label: string; color: string }
> = {
  vendas: { label: "Vendas", color: "#ED4B00" },
  whatsapp: { label: "WhatsApp", color: "#1EB258" },
  crm: { label: "CRM", color: "#2E6BFF" },
  automacao: { label: "Automação", color: "#5B45D1" },
  gestao: { label: "Gestão", color: "#C9810C" },
  financeiro: { label: "Financeiro", color: "#0E97A8" },
  marketing: { label: "Marketing", color: "#D63384" },
  ia: { label: "Inteligência Artificial", color: "#6D4AFF" },
};

export function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
}

export function readingTime(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function sortPosts(posts: CollectionEntry<"blog">[]) {
  return [...posts].sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
}

export function postUrl(slug: string): string {
  return `/blog/${slug}/`;
}

export const BLOG_TITLE = "Blog do VOS";
export const BLOG_DESCRIPTION =
  "Guias práticos de vendas, WhatsApp, CRM, automação e gestão para empresas brasileiras — pelo time do VOS.";

export const ORG_SCHEMA = {
  "@type": "Organization",
  "@id": "https://www.voshq.com/#org",
  name: "VOS",
  url: "https://www.voshq.com",
  logo: "https://www.voshq.com/og.png",
  legalName: "VERTEX GROWTH GESTAO EMPRESARIAL LTDA",
  taxID: "67.779.810/0001-69",
  sameAs: ["https://app.voshq.com", "https://ajuda.voshq.com"],
};
