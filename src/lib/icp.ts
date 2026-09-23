/**
 * Corte de ICP do formulário das LPs (decisão do Orlando, 22/09/2026): quem
 * fatura menos de R$ 10 mil por mês não vê a agenda da demonstração — vai para
 * o WhatsApp do time. Medido no dia: 4 de 13 leads pagos desde 19/09 estavam
 * abaixo do corte, e os 4 que compareceram marcaram R$ 50 mil ou mais.
 *
 * Os textos são os de `REVENUE_OPTS` do LeadWizardModal, letra por letra: o CRM
 * e a planilha guardam esses textos, então mudar um lá exige mudar aqui.
 * Usado no navegador (qual tela abre) e no servidor (qual tag o lead leva).
 */
export const FAIXAS_FORA_ICP: ReadonlySet<string> = new Set([
  "Ainda não estamos faturando",
  "Até R$ 10 mil",
]);

export function foraDoIcp(faturamento: unknown): boolean {
  return typeof faturamento === "string" && FAIXAS_FORA_ICP.has(faturamento.trim());
}

/** WhatsApp do time: o canal "WhatsApp Vertex" conectado ao VOS, onde o SDR atende. */
export const WHATSAPP_TIME = "5543996885300";
