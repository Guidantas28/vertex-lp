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
 * fora do navegador, e é por isso que o corpus de regressão consegue exercitar
 * ~120 casos reais a cada mudança. Quem decide bloquear é o `/api/lead-guard`.
 *
 * 🔴 A regra que rege tudo: **falso positivo custa lead pago**. Na dúvida, deixa
 * passar. Em 28/08 esta lista tinha 4 termos que barravam empresa de verdade
 * (`carai` → Caraí, cidade de MG · `fdp` → sigla de sobrenomes · `bicha` →
 * sobrenome português · `krl`) — todos saíram. Nada entra aqui sem passar pelo
 * `scripts/corpus-antifraude.mjs`.
 *
 * A régua do Orlando (28/08): nome comum não precisa de nada, mas TODO xingamento
 * e TODO nome aleatório têm que cair. Por isso a força está na NORMALIZAÇÃO
 * (desfaz disfarce) e não em engordar a lista de palavrão.
 */

export type Veredito =
  | { ok: true }
  | { ok: false; campo: "name" | "company" | "email"; motivo: string };

/** Minúscula e sem acento — "CORNÃO" e "cornao" caem no mesmo lugar. */
function normaliza(v: string): string {
  return v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/** Dígito e símbolo que imitam letra: `c0rn0`, `p*rra`, `m3rda`, `f0d@`. */
const LEET: Record<string, string> = {
  "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t",
  "@": "a", "$": "s", "!": "i", "|": "i",
};

/**
 * Desfaz os disfarces mais comuns SEM destruir a fronteira de palavra — que é
 * justamente o que protege "Cornélio" e "Reputação". Por isso NÃO removemos
 * separador de forma global: só colapsamos a escrita letra-por-letra
 * ("C O R N O", "c.o.r.n.o"), que é a única forma em que o separador é disfarce.
 */
function variantesDisfarce(v: string): string[] {
  const leet = normaliza(v)
    .split("")
    .map((c) => (c in LEET ? LEET[c] : c))
    .join("");

  // Junta corridas de letras soltas: "C O R N O manso" -> "corno manso".
  // Só a partir de 3 letras soltas: iniciais tipo "J P Silva" não viram palavra.
  const juntaSoltas = (txt: string) => {
    const tokens = txt.split(/[^a-z0-9]+/).filter(Boolean);
    const saida: string[] = [];
    let corrida: string[] = [];
    const fecha = () => {
      if (corrida.length >= 3) saida.push(corrida.join(""));
      else saida.push(...corrida);
      corrida = [];
    };
    for (const t of tokens) {
      if (t.length === 1 && /[a-z]/.test(t)) corrida.push(t);
      else {
        fecha();
        saida.push(t);
      }
    }
    fecha();
    return saida.join(" ");
  };

  const espacado = juntaSoltas(leet);
  // 🔴 As DUAS versões, com e sem colapso de repetição, e o motivo é um furo
  // real que o corpus pegou: colapsar transforma "p0rra" -> "porra" -> "pora" e
  // o xingamento escapa. Sem colapso pega o "p0rra"; com colapso pega o
  // "cornooo". Só as duas juntas cobrem os dois disfarces.
  const colapsado = espacado.replace(/(.)+/g, "$1");
  return [espacado, colapsado];
}

/**
 * Palavrão que nenhum nome/empresa legítimo carrega. Casado com fronteira de
 * palavra (`\b`) — é o que deixa "Cornélio", "Cunha" e "Reputação" passarem.
 *
 * 🔴 NÃO ENTRAM AQUI, e o motivo importa mais que a lista:
 *   carai   → Caraí é cidade de Minas Gerais
 *   fdp     → sigla legítima de sobrenomes ("FDP Advogados")
 *   bicha   → sobrenome português real
 *   krl     → sigla curta demais para ser segura
 *   pinto / rola / pica / piranha → sobrenome, e cidade (Piranhas/AL)
 */
const XINGAMENTOS = [
  "corno", "cornos", "cornao", "cornuda", "chifrudo",
  "caralho", "caraio", "carajo",
  "buceta", "boceta", "xoxota", "piroca",
  "puta", "putas", "putaria", "puto", "putinha",
  "merda", "bosta", "porra", "poha",
  "foda", "fodase", "fuder", "foder", "fodido", "fodeu",
  "viado", "viadinho",
  "arrombado", "arrombada",
  "otario", "otaria", "babaca",
  "vagabundo", "vagabunda", "vadia",
  "escroto", "escrota", "desgracado",
  "safado", "safada",
  "cuzao", "cuzinho", "penis",
  "vsf", "vtnc", "pqp",
  "nazi", "hitler",
];

const RE_XINGAMENTO = new RegExp(`\\b(${XINGAMENTOS.join("|")})\\b`, "i");

/**
 * Domínios de e-mail temporário/descartável. O `yacuuu.com` é o caso real do
 * "Cleiton Rasta" (27/08). Lista curta de propósito: cobre os serviços que
 * aparecem em troça de formulário — quem quer mesmo entrar usa Gmail.
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
 * Sequências de teclado que NÃO existem em português. Cada uma foi conferida
 * contra o corpus antes de entrar.
 * 🔴 `ert` e `wer` ficaram de fora: estão em Alberto, Roberto e Werner.
 */
const TECLADO = [
  "asd", "sdf", "dfg", "fgh", "ghj", "hjk", "jkl",
  "lkj", "kjh", "jhg", "hgf", "gfd", "fds", "dsa",
  "qwe", "ewq", "zxc", "xcv", "cvb", "vbn", "bnm", "mnb",
  "poiu", "iuyt", "ytre", "treq", "123123", "121212", "abcabc",
];
const RE_TECLADO = new RegExp(`(${TECLADO.join("|")})`);

/**
 * Teclado batido e enchimento de linguiça: "asdasd", "kkkkk", "@aiiiipaipara".
 *
 * 🔴 O que eu deliberadamente NÃO uso, porque testei e barra gente real do
 * Paraná: proporção de vogais e consoantes seguidas — "Schmidt" tem 14% de
 * vogal e começa com quatro consoantes. Nome aleatório que escape disso eu
 * prefiro deixar passar a arriscar um cliente.
 */
function pareceTecladoBatido(v: string): boolean {
  const c = normaliza(v);
  if (!c) return false;
  // 4+ iguais, não 3: "AAA Chaveiro" é padrão REAL de nome de empresa no Brasil
  // (aparecer primeiro em lista) e barrar isso custaria lead de verdade.
  // Os casos reais têm folga: "kkkkkk" e o "iiii" de "@aiiiipaipara".
  if (/(.)\1{3,}/.test(c)) return true;
  if (RE_TECLADO.test(c)) return true;
  // Palavra longa sem NENHUMA vogal não é palavra de gente ("Schmidt" tem 'i').
  const palavras = c.split(/\s+/).filter((p) => p.length >= 5);
  if (palavras.some((p) => /^[a-z]+$/.test(p) && !/[aeiouy]/.test(p))) return true;
  return false;
}

/** Xingamento, inclusive disfarçado (`c0rn0`, `cornooo`, `C O R N O`). */
export function pareceXingamento(v: string): boolean {
  if (RE_XINGAMENTO.test(normaliza(v))) return true;
  return variantesDisfarce(v).some((x) => RE_XINGAMENTO.test(x));
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
 * Não valida formato de e-mail nem tamanho de campo: o wizard já faz isso antes
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
