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
    sitemap(),
  ],
});
