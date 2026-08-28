/**
 * Corpus de regressão do filtro anti-lead-fake.
 *
 * Existe por causa de um erro real: em 28/08 a lista de palavrão barrava
 * "Caraí Transportes" — Caraí é cidade de Minas Gerais — e mais três empresas
 * legítimas. Estava NO AR, recusando gente em silêncio.
 *
 * A regra: **falso positivo custa lead pago**. Zero falso positivo aqui é
 * condição para subir. Se você mexer na lista de `antifraude.ts`, rode isto.
 *
 *    node --experimental-strip-types scripts/corpus-antifraude.mjs
 *
 * Sai com código 1 se qualquer caso real for barrado ou qualquer fake passar.
 */
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

const aqui = dirname(fileURLToPath(import.meta.url));
const { avaliaLead } = await import(
  pathToFileURL(resolve(aqui, "../src/lib/antifraude.ts")).href
);

// ---------------------------------------------------------------------------
// TEM QUE PASSAR — gente e empresa de verdade
// ---------------------------------------------------------------------------

/** Os 17 leads legítimos que estão no CRM do VOS hoje (28/08/2026). */
const CRM_REAL = [
  ["Marcos Souza", "MS ads", "mcsdrds@gmail.com"],
  ["Bruno Felipe", "Bruno", "bf727753@gmail.com"],
  ["Mariana Cardoso", "Mari Moda Fitness", "marirobertophotostudio@gmail.com"],
  ["Herickdos santos fernande", "Herick dos santos fernande", "herickdossantosfernandes@gmail.com"],
  ["Thierry Araujo", "Chefmaisleve", "thierry.buque@gmail.com"],
  ["Carlos mendez", "Bms adesivos criativos", "bms.acriativos@gmail.com"],
  ["Ana carla oliveira Lima", "Audaz studio", "carlaoliveiraaudaz@icloud.com"],
  ["Daniel magalhaes", "California", "daniel@californiauniformes.com.br"],
  ["Rinoldo Pavin", "Diamond Corretagem", "dr.pavin@hotmail.com"],
  ["Bruno Crespi", "Vetta360", "bruno.crespi@gmail.com"],
  ["William", "William", "williamsantos18146@gmail.com"],
  ["Mateus Batalini", "Tenda", "batalinimateus@gmail.com"],
  ["Deromar dos santos camurça Camurca", "Auto mais brasil", "grupororaltor@gmail.com"],
  ["Centenaro", "Expresso Rio Vermelho Transporte", "centenaro@expressoriovermelho.com.br"],
  ["Alexandre Mélega", "Branch77", "alexandre@branch77.com.br"],
  ["Jéssica", "Elo Paz", "eloapaz86@gmail.com"],
  ["Edgard Barros", "Perfeitto Digital", "perfeittodigital@gmail.com"],
];

/** Nome e sobrenome comuns no Brasil — inclusive os que "parecem" palavrão. */
const NOMES = [
  "João Silva", "Maria Aparecida Souza", "José Carlos Oliveira",
  "Ana Beatriz Ferreira", "Pedro Henrique Lima", "Luiz Gustavo Almeida",
  "Fernanda Rodrigues", "Rafael dos Santos", "Camila Nogueira",
  "Cornélio Procópio Alves",     // parece "corno"
  "João Pinto",                   // sobrenome comum
  "Ana Cunha",                    // parece "cu"
  "Ricardo Piranha Neto",         // sobrenome/peixe
  "Paulo Rola",                   // sobrenome real
  "Wesley Safadão Silva",         // artista famoso
  "Marcos Veado",                 // grafia do animal: vira nome de lugar/sobrenome
  "Antônio Caraí Sobrinho",       // cidade de MG virando sobrenome
];

/** Sobrenomes alemães, italianos e eslavos — o Paraná é cheio deles. */
const SOBRENOMES_SUL = [
  "Klaus Schmidt", "Hans Kranz", "Erika Wolff", "Werner Schwartz",
  "Giovanni Bianchi", "Marco Bortolotto", "Luca Zanatta", "Aldo Pellizzari",
  "Ivan Kowalski", "Nadia Petrenko", "Otto Brandt", "Greta Vogt",
  "Jurandir Przybysz", "Cristina Wisniewski", "Bruno Schneider",
  "Tadeu Grzybowski", "Helmut Krieger", "Ingrid Strauss",
];

/** Cidades e bairros que viram nome de empresa. */
const EMPRESAS_LUGAR = [
  "Caraí Transportes", "Pousada Caraí", "Cornélio Procópio Materiais",
  "Piranhas Turismo", "Viadutos Engenharia", "Foz do Iguaçu Turismo",
  "Cuiabá Distribuidora", "Cunha Contabilidade", "Bicha Ferragens",
  "Pinto & Cia Advogados", "Rolândia Alimentos", "Cambé Auto Peças",
  "Ibiporã Materiais", "Arapongas Móveis", "Maringá Log",
];

/** Padrões reais de nome comercial no Brasil. */
const EMPRESAS_PADRAO = [
  "AAA Chaveiro 24h", "AAA Guincho", "FDP Advogados Associados",
  "KRL Design", "MRV Engenharia", "JBS Alimentos", "BRF S.A.",
  "3M do Brasil", "99 Tecnologia", "Loja 1000", "Casa & Vídeo",
  "Óticas Carol", "Drogaria São Paulo", "Grupo Boticário",
  "Studio W", "Salão H2O", "Barbearia 013", "Pizzaria 4 Queijos",
  "Auto Posto BR-369", "Café Cultura", "iFood", "Nubank",
  "Restaurante Sabor & Arte", "Padaria Pão Nosso", "Clínica Vida+",
  "Mecânica do Zé", "Bar do Safadão", "Empório Bom Gosto",
  "TI Solutions", "WS Contabilidade", "MB Consultoria", "PH Serviços",
];

// ---------------------------------------------------------------------------
// TEM QUE BARRAR — os fakes conhecidos e os disfarces
// ---------------------------------------------------------------------------

/** Os casos reais que entraram no CRM antes do filtro existir. */
const FAKES_REAIS = [
  ["RAI CORNO FOI PRA CONCESSIONARIA VC VEM", "CORNO MANSO", "viniciussomogyi6@gmail.com"],
  ["CORNO KEY CONTINUA ENGANANDO OS DOIS", "CORNO MANSO", "viniciussomogyi6@gmail.com"],
  ["Cleiton Rasta", "Olha a pedra", "cabecadegelo@yacuuu.com"],
];

/** Xingamento disfarçado — a razão de existir a normalização. */
const DISFARCES = [
  ["c0rn0 mans0", "Empresa", "a@gmail.com"],
  ["Cornooooo", "Empresa", "a@gmail.com"],
  ["C O R N O", "Empresa", "a@gmail.com"],
  ["c.o.r.n.o", "Empresa", "a@gmail.com"],
  ["m3rda", "Empresa", "a@gmail.com"],
  ["João Silva", "V I A D O Ltda", "a@gmail.com"],
  ["João Silva", "P0RRA Servicos", "a@gmail.com"],
  ["João Silva", "M3RD4 Ltda", "a@gmail.com"],
  ["F0D4 SE", "Empresa", "a@gmail.com"],
  ["João Silva", "Buc3ta Ltda", "a@gmail.com"],
];

/** Teclado batido e enchimento. */
const ALEATORIOS = [
  ["asdasd asdasd", "asdasd", "a@gmail.com"],
  ["kkkkkkk", "Empresa", "a@gmail.com"],
  ["João Silva", "zxcvzxcv", "a@gmail.com"],
  ["qwerty qwerty", "Empresa", "a@gmail.com"],
  ["João Silva", "hjkhjkhjk", "a@gmail.com"],
  ["João Silva", "987654", "a@gmail.com"],
  ["João Silva", "Empresa", "lixo@mailinator.com"],
  ["João Silva", "Empresa", "x@yacuuu.com"],
];

// ---------------------------------------------------------------------------

let falhas = 0;
const reais = [
  ...CRM_REAL,
  ...NOMES.map((n) => [n, "Empresa Ltda", "contato@empresa.com.br"]),
  ...SOBRENOMES_SUL.map((n) => [n, "Empresa Ltda", "contato@empresa.com.br"]),
  ...EMPRESAS_LUGAR.map((e) => ["João Silva", e, "contato@empresa.com.br"]),
  ...EMPRESAS_PADRAO.map((e) => ["João Silva", e, "contato@empresa.com.br"]),
];
const fakes = [...FAKES_REAIS, ...DISFARCES, ...ALEATORIOS];

console.log(`CORPUS: ${reais.length} casos reais + ${fakes.length} fakes\n`);

console.log("--- REAIS (não podem ser barrados) ---");
for (const [name, company, email] of reais) {
  const r = avaliaLead({ name, company, email });
  if (!r.ok) {
    falhas++;
    console.log(`  FALSO POSITIVO  ${name} / ${company}  ->  ${r.campo}/${r.motivo}`);
  }
}
console.log(`  ${reais.length - falhas}/${reais.length} passaram`);

console.log("\n--- FAKES (têm que ser barrados) ---");
let escapou = 0;
for (const [name, company, email] of fakes) {
  const r = avaliaLead({ name, company, email });
  if (r.ok) {
    escapou++;
    console.log(`  ESCAPOU  ${name} / ${company} / ${email}`);
  }
}
console.log(`  ${fakes.length - escapou}/${fakes.length} barrados`);

const total = falhas + escapou;
console.log(
  `\n>>> ${total === 0 ? "CORPUS VERDE" : `${total} PROBLEMA(S): ${falhas} falso(s) positivo(s), ${escapou} escapou(aram)`}`,
);
process.exit(total === 0 ? 0 : 1);
