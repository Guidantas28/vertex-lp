import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";

// SSR via adapter Vercel para que a serverless function /api/lead rode no
// proxy server-to-server (esconde o endpoint do vos, anti-spam). As páginas
// continuam estáticas (prerender por padrão); só /api/* roda no servidor.
export default defineConfig({
  site: "https://osvertex.com",
  // Remove a barra de debug do Astro (dev toolbar) que flutuava sobre o site.
  devToolbar: { enabled: false },
  // hybrid = páginas estáticas por padrão; só /api/lead (prerender=false) vira
  // função serverless na Vercel.
  output: "hybrid",
  adapter: vercel({ webAnalytics: { enabled: true } }),
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
  ],
});
