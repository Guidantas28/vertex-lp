/**
 * Filtro de lead falso do wizard da landing.
 *
 * Motivo (27/08/2026): entrou uma leva de submissão-troça pelo formulário —
 * "CORNO MANSO" como empresa, "RAI CORNO FOI PRA CONCESSIONÁRIA VC VEM" como
 * nome, e-mail em domínio descartável (`yacuuu.com`). Os três passaram o wizard
 * inteiro e AGENDARAM reunião de verdade: custa tráfego, suja o CRM, ensina o
 * leilão da Meta a procurar mais gente assim e põe o time numa call que não existe.
 *
 * O que este módulo é: funções PURAS, sem dependência e sem I/O — dá pra rodar
 * fora do navegador, e é por isso que os testes conseguem exercitar os casos
 * reais. Quem decide bloquear é o `/api/lead-guard`; aqui só se opina.
 *
 * 🔴 A regra que rege tudo aqui: **falso positivo custa lead pago**. Na dúvida,
 * deixa passar. Toda lista abaixo é de termo que nenhum negócio de verdade
 * escreve no nome da própria empresa — nada de "pinto" (sobrenome comum), nada
 * de "piranha" (peixe, e tem cidade Piranhas), nada de "teste" sozinho (o
 * próprio Orlando testa o formulário).
 */

export type Veredito =
  | { ok: true }
  | { ok: false; campo: "name" | "company" | "email"; motivo: string };

/** Minúscula e sem acento — "CORNÃO" e "cornao" têm que cair no mesmo lugar. */
function normaliza(v: string): string {
  return v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Palavrão que nenhum nome/empresa legítimo carrega. Casado com fronteira de
 * palavra (`\b`), então "Cornélio" (cornelio), "Cunha" e "Cuiabá" passam ilesos
 * — foi o motivo de não usar `includes`.
 */
const XINGAMENTOS = [
  "corno", "cornos", "cornao", "chifrudo",
  "caralho", "carai", "krl",
  "buceta", "boceta",
  "puta", "putas", "putaria", "puto",
  "merda", "bosta",
  "porra",
  "foda", "fodase", "fuder", "foder", "fodido",
  "viado", "viadinho", "bicha",
  "arrombado", "arrombada",
  "otario", "otaria",
  "babaca",
  "vagabundo", "vagabunda",
  "escroto", "escrota",
  "desgraca", "desgracado",
  "safado", "safada",
  "cuzao", "cuzinho",
  "penis", "pinto1", "rola1",
  "xoxota", "piroca", "pica1",
  "fdp", "vsf", "vtnc", "pqp",
  "nazi", "hitler",
];

const RE_XINGAMENTO = new RegExp(`\\b(${XINGAMENTOS.join("|")})\\b`, "i");

/**
 * Domínios de e-mail temporário/descartável. O `yacuuu.com` é o caso real do
 * "Cleiton Rasta" (27/08). Lista curta de propósito: cobre os serviços que
 * aparecem em troça de formulário, não pretende ser exaustiva — quem quer
 * mesmo entrar usa Gmail.
 */
const DOMINIOS_DESCARTAVEIS = new Set([
  "yacuuu.com",
  "mailinator.com", "guerrillamail.com", "guerrillamail.info", "sharklasers.com",
  "10minutemail.com", "10minutemail.net", "tempmail.com", "temp-mail.org",
  "throwawaymail.com", "trashmail.com", "trashmail.net", "dispostable.com",
  "yopmail.com", "yopmail.fr", "yopmail.net",
  "getnada.com", "nada.email", "inboxbear.com",
  "maildrop.cc", "mailnesia.com", "mytemp.email", "tempr.email",
  "fakeinbox.com", "fakemail.net", "spamgourmet.com", "mailcatch.com",
  "emailondeck.com", "moakt.com", "mohmal.com", "tempmailo.com",
  "burnermail.io", "mail-temporaire.fr", "jetable.org",
  "grr.la", "spam4.me", "dropmail.me", "minuteinbox.com",
  "harakirimail.com", "tmpmail.org", "1secmail.com", "1secmail.org",
  "correotemporal.org", "cuvox.de", "armyspy.com", "teleworm.us",
]);

/**
 * Teclado batido e enchimento de linguiça: "asdasd", "kkkkk", "aiiiipaipara",
 * "123123". Três caracteres iguais seguidos NÃO existem em português — nem em
 * nome próprio — então é um sinal barato e seguro.
 */
function pareceTecladoBatido(v: string): boolean {
  const c = normaliza(v);
  if (!c) return false;
  // 4+ iguais, nao 3: "AAA Chaveiro" e padrao REAL de nome de empresa no
  // Brasil (aparecer primeiro em lista) e barrar isso custaria lead de verdade.
  // Os casos reais tem folga: "kkkkkk" e o "iiii" de "@aiiiipaipara".
  if (/(.)\1{3,}/.test(c)) return true;
  if (/(asdf|asdas|qwer|zxcv|jkl|hjkl|poiu|lkjh|123123|121212|abcabc)/.test(c)) return true;
  // Palavra longa sem nenhuma vogal = não é palavra de gente.
  const palavras = c.split(/\s+/).filter((p) => p.length >= 5);
  if (palavras.some((p) => /^[a-z]+$/.test(p) && !/[aeiouy]/.test(p))) return true;
  return false;
}

/** Xingamento explícito no texto. */
export function pareceXingamento(v: string): boolean {
  return RE_XINGAMENTO.test(normaliza(v));
}

/** Só dígitos e pontuação — o caso real do "987654" como nome da empresa. */
export function soPontuacaoOuNumero(v: string): boolean {
  const c = v.trim();
  return c.length > 0 && /^[\d\s.\-/]+$/.test(c);
}

/** E-mail em domínio temporário conhecido. */
export function emailDescartavel(email: string): boolean {
  const dominio = normaliza(email).split("@")[1];
  if (!dominio) return false;
  return DOMINIOS_DESCARTAVEIS.has(dominio);
}

/**
 * O veredito do formulário. Recebe o que a pessoa digitou na etapa 1 e diz se
 * segue ou para — apontando o CAMPO, porque quem cai aqui por engano precisa
 * conseguir corrigir.
 *
 * Não valida formato de e-mail nem tamanho de campo: isso o wizard já faz antes
 * (`isValidEmail`, mínimos de caractere). Aqui é só a camada anti-troça.
 */
export function avaliaLead(dados: {
  name?: string;
  company?: string;
  email?: string;
}): Veredito {
  const name = (dados.name ?? "").trim();
  const company = (dados.company ?? "").trim();
  const email = (dados.email ?? "").trim();

  if (name && pareceXingamento(name)) {
    return { ok: false, campo: "name", motivo: "xingamento-no-nome" };
  }
  if (name && pareceTecladoBatido(name)) {
    return { ok: false, campo: "name", motivo: "nome-sem-sentido" };
  }
  if (company && pareceXingamento(company)) {
    return { ok: false, campo: "company", motivo: "xingamento-na-empresa" };
  }
  if (company && soPontuacaoOuNumero(company)) {
    return { ok: false, campo: "company", motivo: "empresa-so-numero" };
  }
  if (company && pareceTecladoBatido(company)) {
    return { ok: false, campo: "company", motivo: "empresa-sem-sentido" };
  }
  if (email && emailDescartavel(email)) {
    return { ok: false, campo: "email", motivo: "email-descartavel" };
  }

  return { ok: true };
}
