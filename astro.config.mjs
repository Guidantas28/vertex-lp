import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel/serverless";

// SSR via adapter Vercel para que a serverless function /api/lead rode no
// proxy server-to-server (esconde o endpoint do vos, anti-spam). As páginas
// continuam estáticas (prerender por padrão); só /api/* roda no servidor.
export default defineConfig({
  site: "https://www.voshq.com",
  // Remove a barra de debug do Astro (dev toolbar) que flutuava sobre o site.
  devToolbar: { enabled: false },
  // hybrid = páginas estáticas por padrão; só /api/lead (prerender=false) vira
  // função serverless na Vercel.
  output: "hybrid",
  // Web Analytics fica desligado até ser ativado no painel da Vercel — com a
  // flag ligada sem o produto ativo, toda página carregava um script 404.
  adapter: vercel(),
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    sitemap({
      // A /lp é landing de anúncio: mesma oferta da home, escrita pra tráfego
      // pago. Deixá-la no sitemap fazia o Google escolher entre ela e a home
      // pros mesmos termos ("Duplicate without user-selected canonical"). Ela
      // sai daqui e ganha noindex,follow na própria página.
      filter: (page) => !/\/lp\/?$/.test(page),
      serialize(item) {
        const path = new URL(item.url).pathname;
        // Prioridade por profundidade: home > módulos/blog > posts > legal.
        if (path === "/") {
          item.priority = 1.0;
          item.changefreq = "weekly";
        } else if (/^\/(commerce|services|financeiro)\/$/.test(path)) {
          item.priority = 0.9;
          item.changefreq = "weekly";
        } else if (path === "/blog/") {
          item.priority = 0.8;
          item.changefreq = "daily";
        } else if (path.startsWith("/blog/categoria/")) {
          item.priority = 0.5;
          item.changefreq = "weekly";
        } else if (path.startsWith("/blog/")) {
          item.priority = 0.7;
          item.changefreq = "monthly";
        } else {
          item.priority = 0.3;
          item.changefreq = "yearly";
        }
        return item;
      },
    }),
  ],
});
