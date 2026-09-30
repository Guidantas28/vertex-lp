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
  // Só no dev server: o gsap entra na /lp3 por import() dinâmico dentro de um
  // <script> de componente, que o scanner do Vite não enxerga. Sem isto ele é
  // descoberto na 1ª visita, o Vite reotimiza e recarrega a página, e o script
  // já servido fica apontando para um hash velho (504 "Outdated Optimize Dep").
  // Não muda nada no build.
  vite: { optimizeDeps: { include: ["gsap", "gsap/ScrollTrigger"] } },
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    sitemap({
      // A /lp é landing de anúncio: mesma oferta da home, escrita pra tráfego
      // pago. Deixá-la no sitemap fazia o Google escolher entre ela e a home
      // pros mesmos termos ("Duplicate without user-selected canonical"). Ela
      // sai daqui e ganha noindex,follow na própria página. A /lp1 (18/09, a
      // página de uma dobra com o vídeo), a /lp2 (19/09, a /lp na identidade
      // do site novo) e a /lp3 (30/09, o topo da /lp1 mais a cena do WhatsApp
      // animada no DOM e o vídeo "Conheça o VOS") são do mesmo tipo e saem junto.
      filter: (page) => !/\/lp[123]?\/?$/.test(page),
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
