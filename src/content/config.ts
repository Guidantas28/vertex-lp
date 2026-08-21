import { defineCollection, z } from "astro:content";

// Coleção do blog. Todo post é Markdown em src/content/blog/*.md com este
// frontmatter — o gerador diário (scripts/gen-post.mjs) segue o mesmo contrato.
const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string().max(120),
    description: z.string().max(320),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum([
      "vendas",
      "whatsapp",
      "crm",
      "automacao",
      "gestao",
      "financeiro",
      "marketing",
      "ia",
    ]),
    tags: z.array(z.string()).default([]),
    author: z.string().default("Equipe VOS"),
    // Perguntas frequentes do post — viram FAQPage (JSON-LD) e um bloco visível
    // no fim do artigo. Núcleo da estratégia de AEO.
    faq: z
      .array(z.object({ q: z.string(), a: z.string() }))
      .default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
