// Corta todo tracking de PRODUÇÃO nas capturas headless.
//
// Por que existe: a LP usa o container de produção — não existe um de teste —, e
// os scripts de captura preenchem e SUBMETEM o formulário de verdade. Em 19/08
// isso mandou 10 generate_lead para a Meta e sujou 10 das 43 linhas da planilha
// de auditoria EMQ, com a página gravada como http://localhost:4321/lp.
//
// O GtmHead.astro já não carrega o GTM fora de produção. Este módulo é o cinto
// para o caso que aquela trava não cobre: capturar com --url apontando para
// www.voshq.com, onde o container carrega legitimamente.
export const ROTAS_TRACKING = [
  "**vx.voshq.com/**",       // loader e endpoint do server container (Stape)
  "**stapecdn.com/**",       // Data Tag
  "**connect.facebook.net/**",
  "**facebook.com/tr**",     // pixel do navegador
  "**googletagmanager.com/**",
  "**google-analytics.com/**",
  "**analytics.google.com/**",
];

// Aceita BrowserContext ou Page — os dois têm .route().
export async function bloquearTracking(alvo) {
  for (const rota of ROTAS_TRACKING) {
    await alvo.route(rota, (route) => route.abort());
  }
}
