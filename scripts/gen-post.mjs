#!/usr/bin/env node
// Gerador diário de post do blog (SEO/AEO/GEO).
// - Consome a próxima pauta de content-plan/topics.json (ou pede uma nova à IA
//   quando a fila acaba), gera o artigo via API do Claude e grava o Markdown em
//   src/content/blog/<slug>.md no contrato do src/content/config.ts.
// - Sem dependências: Node 22 + fetch nativo. Env: ANTHROPIC_API_KEY.
// Uso: node scripts/gen-post.mjs [--dry-run]

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BLOG_DIR = join(ROOT, "src/content/blog");
const TOPICS_PATH = join(ROOT, "content-plan/topics.json");
const MODEL = process.env.BLOG_MODEL || "claude-sonnet-5";
const DRY_RUN = process.argv.includes("--dry-run");

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error("ANTHROPIC_API_KEY não definida.");
  process.exit(1);
}

const CATEGORIES = [
  "vendas",
  "whatsapp",
  "crm",
  "automacao",
  "gestao",
  "financeiro",
  "marketing",
  "ia",
];

// ─── Estado atual do blog (para links internos e anti-duplicata) ────────────
function listExistingPosts() {
  if (!existsSync(BLOG_DIR)) return [];
  return readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => {
      const raw = readFileSync(join(BLOG_DIR, f), "utf8");
      const title = raw.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1] ?? f;
      return { slug: f.replace(/\.md$/, ""), title };
    });
}

function nextTopic() {
  const data = JSON.parse(readFileSync(TOPICS_PATH, "utf8"));
  const topic = data.topics.find((t) => !t.used);
  return { data, topic };
}

// ─── Chamada à API do Claude ────────────────────────────────────────────────
async function claude(messages, { maxTokens = 8000, system } = {}) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      ...(system ? { system } : {}),
      messages,
    }),
  });
  if (!res.ok) {
    throw new Error(`API do Claude respondeu ${res.status}: ${await res.text()}`);
  }
  const json = await res.json();
  return json.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
}

function extractJson(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Resposta sem JSON.");
  return JSON.parse(text.slice(start, end + 1));
}

// ─── Pauta de emergência quando a fila acaba ────────────────────────────────
async function inventTopic(existing) {
  const text = await claude(
    [
      {
        role: "user",
        content: `Você planeja o blog do VOS (voshq.com), sistema de gestão brasileiro (CRM + WhatsApp + automações + financeiro + IA) para PMEs. Já publicamos estes artigos:\n${existing.map((p) => `- ${p.title}`).join("\n")}\n\nProponha UMA pauta nova de alto potencial de busca no Google Brasil, que NÃO repita os temas acima. Responda APENAS um JSON: {"id": "slug-curto", "keyword": "palavra-chave alvo", "title_hint": "título sugerido", "category": "uma de: ${CATEGORIES.join(", ")}"}`,
      },
    ],
    { maxTokens: 500 },
  );
  return extractJson(text);
}

// ─── Geração do artigo ──────────────────────────────────────────────────────
const SYSTEM = `Você é o redator-chefe do Blog do VOS (https://www.voshq.com) — sistema de gestão brasileiro para PMEs: CRM, WhatsApp, automações (Fluxos), agenda, loja, financeiro, emissão fiscal e o Zé (IA que executa tarefas).

Escreva em português do Brasil, tom direto e prático, de especialista que já operou empresas — sem clichês de IA ("no mundo dinâmico de hoje"), sem encher linguiça.

REGRAS DE SEO/AEO/GEO (obrigatórias):
1. O primeiro parágrafo responde a pergunta principal DIRETAMENTE em 2-4 frases (featured snippet / resposta de IA). Sem preâmbulo.
2. H2/H3 descritivos que correspondem a buscas reais. Use listas e, quando fizer sentido, UMA tabela comparativa.
3. 900 a 1400 palavras no corpo.
4. Inclua 1 a 2 links internos NATURAIS para artigos existentes do blog (lista fornecida), formato /blog/<slug>/ — apenas se forem realmente relacionados.
5. Mencione o VOS 1-2 vezes de forma útil e contextual (nunca panfletária), linkando https://www.voshq.com no máximo 1 vez.
6. Termine com uma seção "## Resumo" de 3 bullets.
7. FAQ: 4 perguntas que pessoas realmente fazem sobre o tema, com respostas completas e autossuficientes de 2-4 frases (serão marcadas como FAQPage schema).
8. Dados/estatísticas: apenas plausíveis e sem inventar fontes específicas; prefira formulações como "a maioria" ou faixas amplas quando não houver certeza.`;

async function generatePost(topic, existing) {
  const text = await claude(
    [
      {
        role: "user",
        content: `Escreva o artigo de hoje.

PAUTA:
- Palavra-chave alvo: ${topic.keyword}
- Título sugerido (pode melhorar): ${topic.title_hint}
- Categoria: ${topic.category}
- Slug sugerido: ${topic.id}

ARTIGOS EXISTENTES (para links internos):
${existing.map((p) => `- /blog/${p.slug}/ — ${p.title}`).join("\n") || "(nenhum ainda)"}

Responda APENAS um JSON válido (sem markdown em volta), neste formato:
{
  "title": "título final (máx. 90 caracteres, com a palavra-chave)",
  "description": "meta description de 140-160 caracteres com a palavra-chave",
  "slug": "slug-em-kebab-case",
  "category": "uma de: ${CATEGORIES.join(", ")}",
  "tags": ["3 a 5 tags"],
  "faq": [{"q": "pergunta", "a": "resposta"}, ...4 itens],
  "body": "corpo do artigo em Markdown, começando direto no primeiro parágrafo (SEM h1 — o título já é o h1)"
}

Atenção: escape corretamente aspas e quebras de linha dentro das strings JSON.`,
      },
    ],
    { maxTokens: 8000, system: SYSTEM },
  );
  return extractJson(text);
}

// ─── Validação + escrita ────────────────────────────────────────────────────
function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function yamlEscape(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, " ");
}

function writePost(post, existing) {
  const errors = [];
  if (!post.title || post.title.length > 120) errors.push("title inválido");
  if (!post.description || post.description.length > 320) errors.push("description inválida");
  if (!CATEGORIES.includes(post.category)) errors.push(`category inválida: ${post.category}`);
  if (!post.body || post.body.split(/\s+/).length < 500) errors.push("body muito curto");
  if (!Array.isArray(post.faq) || post.faq.length < 3) errors.push("faq incompleto");
  if (errors.length) throw new Error(`Post reprovado na validação: ${errors.join("; ")}`);

  let slug = slugify(post.slug || post.title);
  const taken = new Set(existing.map((p) => p.slug));
  if (taken.has(slug)) slug = `${slug}-${new Date().toISOString().slice(0, 10)}`;

  const today = new Date().toISOString().slice(0, 10);
  const fm = [
    "---",
    `title: "${yamlEscape(post.title)}"`,
    `description: "${yamlEscape(post.description)}"`,
    `pubDate: ${today}`,
    `category: "${post.category}"`,
    `tags: [${(post.tags ?? []).slice(0, 6).map((t) => `"${yamlEscape(t)}"`).join(", ")}]`,
    "faq:",
    ...post.faq.slice(0, 6).flatMap((f) => [
      `  - q: "${yamlEscape(f.q)}"`,
      `    a: "${yamlEscape(f.a)}"`,
    ]),
    "---",
    "",
  ].join("\n");

  const filePath = join(BLOG_DIR, `${slug}.md`);
  if (DRY_RUN) {
    console.log(`[dry-run] escreveria ${filePath}\n`);
    console.log(fm + post.body.slice(0, 600) + "…");
  } else {
    writeFileSync(filePath, fm + post.body.trim() + "\n");
    console.log(`Post gravado: ${filePath}`);
  }
  return slug;
}

// ─── Main ───────────────────────────────────────────────────────────────────
const existing = listExistingPosts();
const { data, topic: queued } = nextTopic();
const topic = queued ?? (await inventTopic(existing));
if (!queued) console.log(`Fila vazia — pauta inventada: ${topic.keyword}`);
console.log(`Pauta: ${topic.keyword} (${topic.category})`);

const post = await generatePost(topic, existing);
const slug = writePost(post, existing);

if (queued && !DRY_RUN) {
  queued.used = true;
  queued.publishedSlug = slug;
  queued.publishedAt = new Date().toISOString().slice(0, 10);
  writeFileSync(TOPICS_PATH, JSON.stringify(data, null, 2) + "\n");
  console.log("Fila de pautas atualizada.");
}
