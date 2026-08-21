import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );
  return rss({
    title: "Blog do VOS",
    description:
      "Vendas, WhatsApp, CRM, automação e gestão para empresas brasileiras — pelo time do VOS.",
    site: context.site ?? "https://www.voshq.com",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.slug}/`,
    })),
    customData: "<language>pt-BR</language>",
  });
}
