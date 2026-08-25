// Confirma o @ do Instagram digitado no wizard e devolve o material do
// cartão "É este seu perfil?" (nome, seguidores e — quando a Graph entregar —
// foto). Fonte: `business_discovery` (Instagram API with Facebook Login).
//
// Limite estrutural da Meta, documentado: só perfis BUSINESS/CREATOR são
// consultáveis; perfil pessoal não retorna. Por isso "não achou" NUNCA
// significa "não existe" — o wizard trata como neutro e deixa passar.
// Progressive enhancement: sem env/permissões, respondemos "unknown" e o
// campo segue funcionando só com validação de formato.
import type { APIRoute } from "astro";

export const prerender = false;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// IG business da casa (@vos.hq) — é o "ponto de vista" da consulta.
const IG_USER_ID = "17841444455891954";
const HANDLE_RE = /^[a-z0-9._]{1,30}$/;

const cache = new Map<string, { corpo: unknown; até: number }>();
const TTL_MS = 6 * 60 * 60 * 1000;

export const GET: APIRoute = async ({ url }) => {
  const u = (url.searchParams.get("u") ?? "").trim().toLowerCase().replace(/^@/, "");
  if (!HANDLE_RE.test(u) || /^\.+$/.test(u)) return json({ status: "unknown" });

  const memo = cache.get(u);
  if (memo && memo.até > Date.now()) return json(memo.corpo);

  const token = process.env.META_BM_TOKEN ?? import.meta.env.META_BM_TOKEN;
  if (!token) return json({ status: "unknown" });

  try {
    const campos = `business_discovery.username(${u}){username,name,followers_count,profile_picture_url}`;
    const r = await fetch(
      `https://graph.facebook.com/v21.0/${IG_USER_ID}?fields=${encodeURIComponent(campos)}&access_token=${encodeURIComponent(token)}`,
      { signal: AbortSignal.timeout(3000) },
    );
    const corpo: any = await r.json().catch(() => null);
    const bd = corpo?.business_discovery;
    let resposta: unknown;
    if (bd?.username) {
      resposta = {
        status: "found",
        username: bd.username,
        name: bd.name ?? "",
        followers: bd.followers_count ?? null,
        picture: bd.profile_picture_url ?? null,
      };
    } else {
      // Erro da Graph aqui quase sempre = perfil pessoal (não consultável).
      resposta = { status: "not_found" };
    }
    cache.set(u, { corpo: resposta, até: Date.now() + TTL_MS });
    return json(resposta);
  } catch {
    return json({ status: "unknown" });
  }
};
