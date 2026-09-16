"use client";

/**
 * O FILME do Modo Zé: o que acontece depois do mergulho na palavra.
 *
 * Versão SUAVE (founder 15/09, depois da janela de chat: "ficou muito carregado, só com
 * fundo bonito e Zé bem suave, mais denso como o nosso website"):
 * - o fundo é só a noite violeta (--mz-noite), sem estrelas e sem faísca;
 * - cada passo é um título e UM cartão, no meio da área livre;
 * - 01 Monte seu time: a conversa começa de cima, e o time aparece numa fileira de
 *   avatares no meio do cartão (a Bia entra nela quando o Zé termina de montar);
 * - 02 O Zé executa e 03 Tudo pronto: como eram antes ("manter como era antes");
 * - o Zé fica no POSTE da trilha 01 · 02 · 03, menor, anima UMA vez em cada passo e
 *   espera, e desce girando entre um passo e outro (vídeos do Higgsfield recortados na
 *   GPU, ze-no-poste.ts).
 *
 * Um bloco alto com um PALCO grudado na tela; o progresso do scroll dentro dele (0 a 1)
 * comanda tudo, sem estado React. O bloco custa DUAS telas de rolagem (founder 15/09: "tem
 * como um scroll já fazer cada ação?"), então um gesto de trackpad entrega um passo: com a
 * tela do mergulho, a seção inteira acaba em três. O laço só roda com o filme na tela, e os vídeos só
 * baixam perto dele. Os agentes são os personagens 3D do produto e os poderes da Bia são
 * rótulos do catálogo único (validators/agent-powers.ts).
 */
import { useEffect, useRef } from "react";
import {
  Calendar,
  CalendarCheck,
  ChartColumn,
  Check,
  ChevronDown,
  FileText,
  Mail,
  MessageCircle,
  Receipt,
  Send,
  UserPlus,
  UserRound,
  Users,
} from "lucide-react";
import { GetStartedButton } from "@/components/ui/get-started-button";
import { POSTE_X, ZeNoPoste, type Clipe } from "./ze-no-poste";

const CLIPES: Record<string, Clipe> = {
  z01: { src: "/mascote/poste/zp-01.mp4", modo: "uma-vez", trilho: "zp-01" },
  z12: { src: "/mascote/poste/zp-12.mp4", modo: "scrub", trilho: "zp-12" },
  z02: { src: "/mascote/poste/zp-02.mp4", modo: "uma-vez", trilho: "zp-02" },
  z23: { src: "/mascote/poste/zp-23.mp4", modo: "scrub", trilho: "zp-23" },
  z03: { src: "/mascote/poste/zp-03.mp4", modo: "uma-vez", trilho: "zp-03" },
};
// a primeira pose de cada pouso, já recortada: cobre o instante antes do vídeo e o navegador sem WebGL
const PARADOS = ["/mascote/poste/zp-01.webp", "/mascote/poste/zp-02.webp", "/mascote/poste/zp-03.webp"];
// as duas descidas no progresso do filme: é quando o giro toca comandado pelo scroll.
// Com o curso cortado pra 2 telas, a primeira desceu: o 01 precisa de um respiro depois
// que a Bia entra no time, senão o cartão sai no mesmo instante em que ela chega.
const DESCIDAS = [
  [0.24, 0.36],
  [0.6, 0.72],
] as const;

const TIME = [
  { id: "ze", nome: "Zé", foto: "/agentes/ze.webp" },
  { id: "duda", nome: "Duda", foto: "/agentes/atendimento.webp" },
  { id: "leo", nome: "Leo", foto: "/agentes/financeiro.webp" },
];
const BIA = { nome: "Bia", cargo: "Vendas", foto: "/agentes/comercial.webp" };
const PEDIDO = "Quero alguém pra vender no WhatsApp.";
/* Os poderes da Bia, agora com o ÍCONE de cada um (founder 15/09: "queria
   melhorar esse card"): em texto puro eles viravam três faixas largas, e a
   primeira ainda quebrava em duas linhas. Os rótulos seguem os do catálogo do
   produto (`agent-powers.ts`) . o que mudou é a casca. */
const PODERES = [
  { t: "Mandar mensagem no WhatsApp", Icone: MessageCircle },
  { t: "Abrir pedido", Icone: Receipt },
  { t: "Marcar horário", Icone: Calendar },
];

const MODULOS = [
  { nome: "Atendimento", Icone: MessageCircle },
  { nome: "CRM", Icone: Users },
  { nome: "Agenda", Icone: Calendar },
  { nome: "Financeiro", Icone: ChartColumn },
];

const LINHAS = [
  { rotulo: "Contatos analisados", total: 12, Icone: UserRound },
  { rotulo: "Respostas enviadas", total: 12, Icone: Send },
  { rotulo: "Visitas agendadas", total: 4, Icone: CalendarCheck },
  { rotulo: "Cobranças preparadas", total: 4, Icone: FileText },
];

const EVENTOS = [
  { rotulo: "Novo contato", Icone: UserPlus, lugar: "a" },
  { rotulo: "Visita agendada", Icone: CalendarCheck, lugar: "b" },
  { rotulo: "E-mail enviado", Icone: Mail, lugar: "c" },
  { rotulo: "Cobrança gerada", Icone: Receipt, lugar: "d" },
];

// `um` é o rótulo quando a contagem passa pelo 1: "1 visita", nunca "1 visitas".
const NUMEROS = [
  { valor: 12, rotulo: "atendimentos", um: "atendimento", Icone: Users, dinheiro: false },
  { valor: 4, rotulo: "visitas", um: "visita", Icone: Calendar, dinheiro: false },
  { valor: 3840, rotulo: "em cobranças", um: "em cobranças", Icone: FileText, dinheiro: true },
];

// Janela de cada passo. A troca acontece NO MEIO do giro e é colada (um sai, o outro entra logo):
// com folga entre os dois, a descida virava uma tela vazia só com o Zé.
const CAPS = [
  { entra: [-1, 0], sai: [0.25, 0.3] },
  { entra: [0.31, 0.36], sai: [0.61, 0.66] },
  { entra: [0.67, 0.72], sai: [2, 3] },
] as const;

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const liso = (a: number, b: number, n: number) => {
  const t = clamp((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export function ModoZeFilme() {
  const raizRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raiz = raizRef.current;
    if (!raiz) return;
    const um = <T extends Element>(s: string) => raiz.querySelector<T>(s)!;
    const todos = <T extends Element>(s: string) => Array.from(raiz.querySelectorAll<T>(s));

    const palco = um<HTMLElement>("[data-zf-palco]");
    const festa = um<HTMLCanvasElement>("[data-zf-festa]");
    const ze = um<HTMLElement>("[data-zf-ze]");
    const zeTela = um<HTMLCanvasElement>("[data-zf-ze-tela]");
    const parado = um<HTMLImageElement>("[data-zf-parado]");
    const poste = um<HTMLElement>("[data-zf-poste]");
    const caps = todos<HTMLElement>("[data-zf-cap]");
    const marcos = todos<HTMLElement>("[data-zf-marco]");
    const msgs = todos<HTMLElement>("[data-zf-msg]");
    const digitado = um<HTMLElement>("[data-zf-digitado]");
    const nova = um<HTMLElement>("[data-zf-nova]");
    const contaTime = um<HTMLElement>("[data-zf-conta-time]");
    const chips = todos<HTMLElement>("[data-zf-chip]");
    const linhas = todos<HTMLElement>("[data-zf-linha]");
    const contas = linhas.map((l) => l.querySelector<HTMLElement>("[data-zf-conta]")!);
    const eventos = todos<HTMLElement>("[data-zf-evento]");
    const check = um<HTMLElement>("[data-zf-check]");
    const numeros = todos<HTMLElement>("[data-zf-numero]");
    const rotulos = todos<HTMLElement>("[data-zf-rotulo]");
    const cta = um<HTMLElement>("[data-zf-cta]");

    // Só escreve no DOM quando o valor muda: são dezenas de alvos por quadro.
    const memo = new WeakMap<Element, Record<string, string>>();
    const muda = (el: Element, chave: string, valor: string, aplica: () => void) => {
      let m = memo.get(el);
      if (!m) memo.set(el, (m = {}));
      if (m[chave] === valor) return;
      m[chave] = valor;
      aplica();
    };
    const css = (el: HTMLElement, prop: string, valor: string) =>
      muda(el, prop, valor, () => el.style.setProperty(prop, valor));
    const txt = (el: HTMLElement, valor: string) => muda(el, "#texto", valor, () => { el.textContent = valor; });
    const liga = (el: HTMLElement, classe: string, on: boolean) =>
      muda(el, classe, String(on), () => el.classList.toggle(classe, on));
    const reais = new Intl.NumberFormat("pt-BR");

    const pinta = (f: number) => {
      caps.forEach((el, i) => {
        const j = CAPS[i];
        const e = liso(j.entra[0], j.entra[1], f);
        const s = liso(j.sai[0], j.sai[1], f);
        const o = e * (1 - s);
        css(el, "opacity", o.toFixed(3));
        css(el, "transform", `translate3d(0, ${((1 - e) * 20 - s * 20).toFixed(1)}px, 0)`);
        liga(el, "is-ativo", o > 0.6);
      });
      // o marco acende no MEIO do giro, que é quando o Zé passa por ele
      const ativo = f < 0.3 ? 0 : f < 0.66 ? 1 : 2;
      marcos.forEach((el, i) => {
        liga(el, "is-ativo", i === ativo);
        liga(el, "is-feito", i < ativo);
      });

      // mensagens e peças que chegam no seu ponto; antes disso não ocupam lugar
      for (const el of msgs) {
        const de = Number(el.dataset.f);
        liga(el, "is-fora", f < de);
        css(el, "--m", liso(de, de + 0.012, f).toFixed(3));
      }

      // 01 · o pedido se escreve dentro do balão, e a Bia entra no time
      const n = Math.round(clamp((f - 0.03) / 0.055) * PEDIDO.length);
      txt(digitado, PEDIDO.slice(0, n));
      liga(digitado, "is-digitando", n > 0 && n < PEDIDO.length);
      css(nova, "--m", liso(0.13, 0.16, f).toFixed(3));
      txt(contaTime, f >= 0.13 ? "4 agentes" : "3 agentes");

      // 02 · os módulos acendem um a um e cada linha enche até o total. Tudo termina em 0,58,
      // com um respiro antes do cartão sair em 0,61: no curso curto, a última linha fechava
      // no mesmo quadro em que o cartão começava a ir embora, e ninguém via o 4/4.
      chips.forEach((el, i) => liga(el, "is-on", f >= 0.35 + i * 0.025));
      linhas.forEach((el, i) => {
        const r = liso(0.37 + i * 0.035, 0.47 + i * 0.035, f);
        const total = LINHAS[i].total;
        css(el, "--r", r.toFixed(3));
        txt(contas[i], `${Math.round(r * total)}/${total}`);
        liga(el, "is-ok", r > 0.995);
      });
      eventos.forEach((el, i) => css(el, "--e", liso(0.4 + i * 0.035, 0.44 + i * 0.035, f).toFixed(3)));

      // 03 · o check se desenha, os números sobem e o botão chega
      css(check, "--c", liso(0.76, 0.82, f).toFixed(3));
      const v = liso(0.78, 0.92, f);
      numeros.forEach((el, i) => {
        const a = NUMEROS[i];
        const atual = a.dinheiro ? Math.round((a.valor * v) / 10) * 10 : Math.round(a.valor * v);
        txt(el, a.dinheiro ? `R$ ${reais.format(atual)}` : String(atual));
        txt(rotulos[i], atual === 1 ? a.um : a.rotulo);
      });
      css(cta, "--k", liso(0.86, 0.92, f).toFixed(3));
    };

    // Movimento reduzido: o CSS empilha os passos, esconde o poste e aqui só pinta o fim de cada um.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pinta(1);
      return;
    }

    let W = 1, H = 1, dpr = 1, movel = false, S = 240, posteX = 120;
    let posteTopo = 0, posteAltura = 1;
    let pousos = [0, 0, 0]; // topo do quadro do Zé em cada passo
    const ctxFesta = festa.getContext("2d")!;

    // Sem WebGL o Zé fica na pose parada de cada passo, e desce sem girar.
    const player = ZeNoPoste.cria(zeTela, CLIPES);
    if (!player) ze.classList.add("sem-video");
    let preparado = false;
    const prepara = () => {
      if (preparado || !player) return;
      preparado = true;
      player.prepara();
      fetch("/mascote/poste/poste.json")
        .then((r) => r.json())
        .then((t) => player.usaTrilhos(t))
        .catch(() => {});
    };

    const medir = () => {
      W = palco.clientWidth;
      H = palco.clientHeight;
      movel = W < 761;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      festa.width = Math.round(W * dpr);
      festa.height = Math.round(H * dpr);
      // Zé SUAVE: menor que o conteúdo. O quadro tem folga em volta dele (ocupa ~45% da altura)
      // e o poste mora a 42% da largura do quadro.
      // pequeno ("talvez menor"), e presente porque mora do lado do cartão, não na borda
      S = movel ? clamp(W * 0.28, 96, 124) : clamp(Math.min(W * 0.16, H * 0.3), 200, 270);
      const largura = Math.max(4, Math.round(S * 0.034));
      if (movel) {
        // O Zé DESCE no celular também (founder 15/09: "ele trava lá em cima,
        // não desce"). Antes o poste era um toco no canto de cima e ele girava
        // parado . o gesto do bloco inteiro é a descida, e no celular ela
        // sumia. Agora o poste vai do topo ao pé do palco numa PISTA à direita,
        // e a coluna do conteúdo encolhe o tanto dela: o Zé passa AO LADO do
        // cartão, nunca por cima do texto. Ele é menor aqui (28% da largura)
        // porque a pista sai do bolso do cartão.
        const pista = Math.round(S * 0.8);
        raiz.style.setProperty("--zf-pista", `${pista}px`);
        posteX = W - S * 0.58;
        posteTopo = 64;
        // As três paradas moram ao lado do CARTÃO, e a última termina no pé
        // dele (founder 15/09: "sobrou muito embaixo, deixa o Zé mais próximo
        // do fim do bloco"). As frações são do palco JÁ ENCURTADO (240px a
        // menos, mais abaixo no CSS): o cartão nasce sempre a 80px do topo, e
        // se a altura muda sem elas mudarem junto o Zé para acima dele.
        const ys = [0.3, 0.56, 0.8].map((p) => H * p);
        // mesmo desconto de pose do desktop: a cabeça não mora na mesma altura
        // nas três, e sem ele o Zé "pula" ao trocar de passo
        const cabeca = [0.28, 0.09, 0.1];
        const folga = [8, 16, 22];
        pousos = ys.map((y, i) => y + folga[i] - S * cabeca[i]);
        // o poste acaba logo abaixo dele: seguir até o pé da tela deixava um
        // fio sozinho atravessando o vazio
        posteAltura = Math.max(120, pousos[2] + S + 24 - posteTopo);
        raiz.style.removeProperty("--zf-col-x");
        raiz.style.removeProperty("--zf-col-w");
      } else {
        // O poste mora COLADO no cartão, não na borda da tela (founder 15/09: "faltou o Zé"):
        // numa tela larga, com o cartão no meio e o poste na borda, o Zé ficava pequeno e longe
        // de tudo. O cartão fica no meio; o poste nasce 40% do quadro à esquerda dele.
        const col = Math.min(660, W - S - 96);
        const colX = Math.max((W - col) / 2, S * 0.85 + 24);
        raiz.style.setProperty("--zf-col-x", `${Math.round(colX)}px`);
        raiz.style.setProperty("--zf-col-w", `${Math.round(col)}px`);
        posteX = colX - S * 0.4;
        posteTopo = Math.max(72, H * 0.09);
        posteAltura = H - posteTopo - Math.max(64, H * 0.08);
        const ys = [0.2, 0.46, 0.72].map((p) => H * p);
        marcos.forEach((el, i) => {
          el.style.transform = `translate3d(${(posteX - 15).toFixed(1)}px, ${(ys[i] - 15).toFixed(1)}px, 0)`;
        });
        // Pendurado logo abaixo de cada marco. A cabeça não mora na mesma altura em toda pose
        // (28% do quadro no 01, ~10% no 02 e no 03), daí o desconto por pose.
        const cabeca = [0.28, 0.09, 0.1];
        // folga maior no 02 e no 03: o braço apontando e o punho pro alto sobem mais que a cabeça
        const folga = [10, 22, 30];
        pousos = ys.map((y, i) => y + folga[i] - S * cabeca[i]);
      }
      ze.style.setProperty("--ze-s", `${S}px`);
      poste.style.setProperty("--poste-w", `${largura}px`);
      poste.style.height = `${posteAltura.toFixed(1)}px`;
      poste.style.transform = `translate3d(${(posteX - largura / 2).toFixed(1)}px, ${posteTopo.toFixed(1)}px, 0)`;
      player?.tamanho(S * dpr);
    };

    // ── O CONFETE (founder 15/09): no fim do 03 ele estoura na mão do Zé e os papéis caem na
    // direção dos preços. Curto de propósito, porque o filme tinha ficado carregado: ~2s e some.
    type Papel = { x: number; y: number; vx: number; vy: number; l: number; a: number; giro: number; vg: number; cor: string; vida: number; dura: number };
    const papeis: Papel[] = [];
    const CONFETE = ["#ED4B00", "#FF7A33", "#FFC79A", "#6D4AFF", "#A899FF", "#FFFFFF"];
    const GATILHO = 0.95;
    let limpo = true;
    const estoura = (x: number, y: number) => {
      for (let i = 0; i < 110; i++) {
        // leque aberto e puxado pra direita: o papel atravessa na frente do cartão, rumo aos preços
        const ang = -Math.PI / 2 + (Math.random() - 0.35) * 1.9;
        const v = 260 + Math.random() * 680;
        papeis.push({
          x, y,
          vx: Math.cos(ang) * v * (0.9 + Math.random() * 1.1),
          vy: Math.sin(ang) * v,
          l: 5 + Math.random() * 5,
          a: 3 + Math.random() * 4,
          giro: Math.random() * Math.PI,
          vg: (Math.random() - 0.5) * 12,
          cor: CONFETE[(Math.random() * CONFETE.length) | 0],
          vida: 0,
          dura: 1.6 + Math.random() * 0.9,
        });
      }
      limpo = false;
    };
    const festeja = (dt: number) => {
      if (!papeis.length) {
        if (!limpo) {
          ctxFesta.setTransform(dpr, 0, 0, dpr, 0, 0);
          ctxFesta.clearRect(0, 0, W, H);
          limpo = true;
        }
        return;
      }
      ctxFesta.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctxFesta.clearRect(0, 0, W, H);
      for (let i = papeis.length - 1; i >= 0; i--) {
        const p = papeis[i];
        p.vida += dt;
        if (p.vida >= p.dura) {
          papeis.splice(i, 1);
          continue;
        }
        p.vy += 900 * dt;
        p.vx *= 0.985;
        p.x += (p.vx + Math.sin((p.vida + p.giro) * 6) * 40) * dt;
        p.y += p.vy * dt;
        p.giro += p.vg * dt;
        const u = 1 - p.vida / p.dura;
        ctxFesta.save();
        ctxFesta.translate(p.x, p.y);
        ctxFesta.rotate(p.giro);
        ctxFesta.globalAlpha = Math.min(1, u * 2.4);
        ctxFesta.fillStyle = p.cor;
        // o papel "vira de lado" enquanto gira, como papel de verdade
        ctxFesta.fillRect(-p.l / 2, -p.a / 2, p.l * Math.abs(Math.cos(p.giro * 0.7)) + 1, p.a);
        ctxFesta.restore();
      }
      ctxFesta.globalAlpha = 1;
    };

    /* GIRO DE VERDADE NO POSTE (founder 15/09: "ele tem que girar no pau, ele
       só escorregou"). O vídeo do Higgsfield desce, mas desce de frente . a
       volta em torno do poste é feita aqui, girando o Zé no EIXO DO POSTE
       (`transform-origin` no x dele). São duas voltas por descida, então ele
       sempre chega ao pouso de frente, e o `perspective` é o que faz a volta
       ter profundidade em vez de virar um espelhamento chapado.

       `voltas` é ACUMULADO, nunca volta atrás: com o valor por descida (0 a 1)
       ele desgiraria ao entrar na descida seguinte. */
    const corpo = { topo: 0, alvo: 0, voltas: 0, girando: 0, baque: 0, pronto: false };
    const VOLTAS_POR_DESCIDA = 2;
    const mqCelular = window.matchMedia("(max-width: 760px)");
    const desce = (f: number, dt: number, agora: number) => {
      const [a1, b1] = DESCIDAS[0];
      const [a2, b2] = DESCIDAS[1];
      let nome = "z03";
      let alvo: number | null = null;
      let topo = pousos[2];
      let voltas = 2;
      if (f < a1) {
        nome = "z01";
        topo = pousos[0];
        voltas = 0;
      } else if (f <= b1) {
        const t = (f - a1) / (b1 - a1);
        nome = "z12";
        alvo = t;
        topo = pousos[0] + (pousos[1] - pousos[0]) * liso(0, 1, t);
        voltas = t;
      } else if (f < a2) {
        nome = "z02";
        topo = pousos[1];
        voltas = 1;
      } else if (f <= b2) {
        const t = (f - a2) / (b2 - a2);
        nome = "z23";
        alvo = t;
        topo = pousos[1] + (pousos[2] - pousos[1]) * liso(0, 1, t);
        voltas = 1 + t;
      }
      if (!corpo.pronto) Object.assign(corpo, { topo, alvo: alvo ?? 0, voltas, pronto: true });
      // um tico de inércia: scroll aos trancos vira escorregada lisa
      corpo.topo += (topo - corpo.topo) * (1 - Math.exp(-dt * 12));
      if (alvo !== null) corpo.alvo += (alvo - corpo.alvo) * (1 - Math.exp(-dt * 14));
      corpo.voltas += (voltas - corpo.voltas) * (1 - Math.exp(-dt * 14));

      /* O BAQUE DO POUSO: quando o giro acaba, ele amassa e volta em 260ms . é
         o peso que faltava pra descida ter fim, em vez de simplesmente parar. */
      const girandoAgora = alvo !== null ? 1 : 0;
      if (corpo.girando > 0.5 && girandoAgora === 0) corpo.baque = agora;
      corpo.girando += (girandoAgora - corpo.girando) * (1 - Math.exp(-dt * 9));
      const u = corpo.baque ? Math.min(1, (agora - corpo.baque) / 260) : 1;
      const amasso = u < 1 ? Math.sin(Math.PI * u) : 0;

      /* No CELULAR ele não gira (founder 15/09: "o Zé sumiu no mobile"): com
         110px de boneco e um scroll que anda aos trancos, o quadro em que ele
         está de perfil . que na tela grande dura um piscar . vira a pose em que
         o dedo para, e ele simplesmente some. Lá ele desce, e pronto. */
      const graus = mqCelular.matches ? 0 : corpo.voltas * 360 * VOLTAS_POR_DESCIDA;
      /* De costas ele escurece: é o outro lado do poste, não o mesmo desenho
         espelhado. `frente` vai de 1 (encarando) a 0 (nas costas). */
      const frente = 0.5 + 0.5 * Math.cos((graus * Math.PI) / 180);
      ze.style.transformOrigin = `${(POSTE_X * S).toFixed(1)}px 52%`;
      ze.style.transform =
        `translate3d(${(posteX - POSTE_X * S).toFixed(1)}px, ${corpo.topo.toFixed(1)}px, 0)` +
        ` perspective(${(S * 3.4).toFixed(0)}px) rotateY(${graus.toFixed(1)}deg)` +
        ` scale(${(1 + amasso * 0.06).toFixed(3)}, ${(1 - amasso * 0.08).toFixed(3)})`;
      ze.style.filter = `brightness(${(0.72 + 0.28 * frente).toFixed(3)})`;
      // o poste acende por onde ele já passou, e queima mais enquanto ele gira
      poste.style.setProperty("--aceso", clamp((corpo.topo + S * 0.42 - posteTopo) / posteAltura).toFixed(4));
      poste.style.setProperty("--gira", corpo.girando.toFixed(3));

      if (player) {
        player.mostra(nome, alvo === null ? null : corpo.alvo, agora);
        player.desenha(agora);
      }
      const passo = f < 0.3 ? 0 : f < 0.66 ? 1 : 2;
      if (parado.dataset.passo !== String(passo)) {
        parado.dataset.passo = String(passo);
        parado.src = PARADOS[passo];
      }
      /* A pose parada é a REDE: ela some enquanto o vídeo está desenhando e
         volta no quadro em que ele não desenha (canvas recém-redimensionado,
         vídeo sem quadro decodificado, contexto perdido). Antes ela sumia pra
         sempre no primeiro quadro bom, e qualquer falha depois disso deixava
         um quadrado vazio no lugar do Zé (founder 15/09: "zé sumiu"). */
      const some = player?.desenhou ? "0" : "1";
      if (parado.style.opacity !== some) parado.style.opacity = some;
    };

    let raf = 0;
    let vivo = false;
    let antes = 0;
    let fAntes = -1;
    const quadro = (agora: number) => {
      raf = 0;
      if (!vivo) return;
      const dt = Math.min(0.05, antes ? (agora - antes) / 1000 : 1 / 60);
      antes = agora;
      const caixa = raiz.getBoundingClientRect();
      const f = clamp(-caixa.top / Math.max(1, caixa.height - H));
      pinta(f);
      desce(f, dt, agora);
      // o estouro sai do punho levantado da pose do 03, e só descendo (não ao voltar)
      if (fAntes >= 0 && fAntes < GATILHO && f >= GATILHO) {
        estoura(posteX - POSTE_X * S + S * 0.62, corpo.topo + S * 0.26);
      }
      fAntes = f;
      festeja(dt);
      raf = requestAnimationFrame(quadro);
    };

    const vista = new IntersectionObserver(([e]) => {
      vivo = e.isIntersecting;
      if (vivo && !raf) {
        antes = 0;
        raf = requestAnimationFrame(quadro);
      }
    });
    vista.observe(raiz);
    // os vídeos começam a baixar uma tela e meia antes do filme
    const perto = new IntersectionObserver(([e]) => { if (e.isIntersecting) prepara(); }, { rootMargin: "150% 0px" });
    perto.observe(raiz);
    const tamanhos = new ResizeObserver(medir);
    tamanhos.observe(palco);
    medir();

    // Teclado: foco no botão do fim traz o passo 3 pra tela, senão o foco cai num botão invisível.
    const cap3 = caps[2];
    const focou = () => {
      const caixa = raiz.getBoundingClientRect();
      const curso = Math.max(1, caixa.height - H);
      if (clamp(-caixa.top / curso) < 0.88) window.scrollTo({ top: window.scrollY + caixa.top + curso * 0.94 });
    };
    cap3.addEventListener("focusin", focou);

    return () => {
      cancelAnimationFrame(raf);
      vista.disconnect();
      perto.disconnect();
      tamanhos.disconnect();
      cap3.removeEventListener("focusin", focou);
      player?.destroi();
    };
  }, []);

  return (
    <div className="zf" ref={raizRef}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="zf-palco" data-zf-palco>
        {/* o poste é a trilha 01 · 02 · 03 */}
        <div className="zf-trilho" aria-hidden="true">
          <span className="zf-poste" data-zf-poste>
            <span className="zf-poste-aceso" />
          </span>
          {[1, 2, 3].map((n) => (
            <span key={n} className="zf-marco" data-zf-marco>
              <i>0{n}</i>
              <Check strokeWidth={2.6} />
            </span>
          ))}
        </div>

        {/* 01 · MONTE SEU TIME */}
        <section className="zf-cap" data-zf-cap aria-labelledby="zf-t1">
          <div className="zf-in">
            <header className="zf-cabeca">
              <h3 className="zf-titulo" id="zf-t1"><b>01</b>Monte seu time</h3>
              <p className="zf-sub">Crie um agente conversando com o Zé. Sem formulário.</p>
            </header>
            <div className="zf-cartao zf-criar">
              {/* o time no meio do cartão: a Bia entra quando o Zé termina de montar */}
              <div className="zf-time" aria-hidden="true">
                <span className="zf-time-rostos">
                  {TIME.map((a) => (
                    <img key={a.id} src={a.foto} alt="" width={36} height={36} />
                  ))}
                  <img className="zf-time-nova" data-zf-nova src={BIA.foto} alt="" width={36} height={36} />
                </span>
                <span className="zf-time-rot">Seu time · <span data-zf-conta-time>3 agentes</span></span>
              </div>
              {/* a conversa começa de CIMA */}
              <div className="zf-conversa">
                <div className="zf-msg" data-zf-msg data-f="0">
                  <img className="zf-av" src={TIME[0].foto} alt="" width={26} height={26} />
                  <p className="zf-balao">Olá! Vamos trazer um agente novo pro time?</p>
                </div>
                <div className="zf-msg zf-msg--voce" data-zf-msg data-f="0.03">
                  <p className="zf-balao">
                    <span className="zf-sr">{PEDIDO}</span>
                    <span aria-hidden="true" data-zf-digitado />
                  </p>
                </div>
                <div className="zf-msg" data-zf-msg data-f="0.1">
                  <img className="zf-av" src={TIME[0].foto} alt="" width={26} height={26} />
                  <div className="zf-balao">
                    <p>Fechado. Montei a Bia:</p>
                    <div className="zf-ficha">
                      <div className="zf-ficha-topo">
                        <img className="zf-av" src={BIA.foto} alt="" width={34} height={34} />
                        <span className="zf-ficha-nome"><strong>{BIA.nome}</strong><small>{BIA.cargo}</small></span>
                        <span className="zf-ficha-ok" data-zf-msg data-f="0.145"><Check strokeWidth={3} />No time</span>
                      </div>
                      <div className="zf-poderes">
                        {PODERES.map(({ t, Icone }, i) => (
                          <span key={t} data-zf-msg data-f={(0.115 + i * 0.01).toFixed(3)}>
                            <Icone aria-hidden />
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 02 · O ZÉ EXECUTA */}
        <section className="zf-cap" data-zf-cap aria-labelledby="zf-t2">
          <div className="zf-in">
            <header className="zf-cabeca">
              <h3 className="zf-titulo" id="zf-t2"><b>02</b>O Zé executa</h3>
              <p className="zf-sub">Os módulos trabalham juntos na mesma tarefa.</p>
            </header>
            <div className="zf-cartao">
              <div className="zf-cartao-topo">
                <img className="zf-logo" src="/assets/brand/vos-logo-light.png" alt="VOS" width={880} height={249} />
              </div>
              <div className="zf-chips">
                {MODULOS.map(({ nome, Icone }) => (
                  <span key={nome} className="zf-chip" data-zf-chip><Icone />{nome}</span>
                ))}
              </div>
              <ul className="zf-linhas">
                {LINHAS.map(({ rotulo, total, Icone }) => (
                  <li key={rotulo} className="zf-linha" data-zf-linha>
                    <Icone />
                    <span className="zf-linha-rotulo">{rotulo}</span>
                    <span className="zf-barra" aria-hidden="true"><i /></span>
                    <span className="zf-conta">
                      <span data-zf-conta>{total}/{total}</span>
                      <Check strokeWidth={3} aria-hidden="true" />
                    </span>
                  </li>
                ))}
              </ul>
              {EVENTOS.map(({ rotulo, Icone, lugar }) => (
                <span key={rotulo} className={`zf-evento zf-evento--${lugar}`} data-zf-evento aria-hidden="true">
                  <span className="zf-evento-ico"><Icone /></span>
                  <span>
                    <strong>{rotulo}</strong>
                    <em /><em />
                  </span>
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 03 · TUDO PRONTO */}
        <section className="zf-cap" data-zf-cap aria-labelledby="zf-t3">
          <div className="zf-in">
            <header className="zf-cabeca">
              <h3 className="zf-titulo" id="zf-t3"><b>03</b>Tudo pronto</h3>
              <p className="zf-sub">Você acompanha o resultado e segue com o negócio.</p>
            </header>
            <div className="zf-cartao">
              <div className="zf-cartao-topo">
                <img className="zf-logo" src="/assets/brand/vos-logo-light.png" alt="VOS" width={880} height={249} />
              </div>
              <div className="zf-feito">
                <svg className="zf-check" data-zf-check viewBox="0 0 64 64" aria-hidden="true">
                  <circle cx="32" cy="32" r="28" />
                  <path d="M20 33l8 8 16-18" />
                </svg>
                <div>
                  <h4>Tarefa concluída!</h4>
                  <p>O Zé executou tudo como você pediu.</p>
                </div>
                <span className="zf-periodo" aria-hidden="true">Últimos 7 dias <ChevronDown /></span>
              </div>
              <div className="zf-numeros">
                {NUMEROS.map(({ valor, rotulo, Icone, dinheiro }) => (
                  <div key={rotulo} className="zf-numero">
                    <Icone aria-hidden="true" />
                    <strong data-zf-numero>{dinheiro ? `R$ ${valor.toLocaleString("pt-BR")}` : valor}</strong>
                    <span data-zf-rotulo>{rotulo}</span>
                  </div>
                ))}
              </div>
              <div className="zf-cta" data-zf-cta>
                <GetStartedButton label="Colocar o Zé para trabalhar" variant="white" />
              </div>
            </div>
          </div>
        </section>

        <div className="zf-ze" data-zf-ze aria-hidden="true">
          <img className="zf-ze-parado" data-zf-parado src={PARADOS[0]} alt="" width={540} height={540} draggable={false} />
          <canvas className="zf-ze-tela" data-zf-ze-tela />
        </div>

        {/* o confete do fim: papel por cima de tudo, caindo pro lado dos preços */}
        <canvas className="zf-festa" data-zf-festa aria-hidden="true" />
      </div>
    </div>
  );
}

const CSS = `
  /* 300svh com o palco grudado de 100 = 2 telas de curso, uma por passo (founder 15/09:
     "tem como um scroll já fazer cada ação?"). Eram 460, quase 4 telas: o filme estava
     certo e a rolagem, longa. Mexer aqui reparte tudo junto, porque cada marca do filme
     é uma FRAÇÃO do curso, não uma distância. */
  .zf {
    position: relative;
    height: 300svh;
    overflow-wrap: normal;
  }
  /* O palco é SÓ a noite violeta do mergulho (--mz-noite, no ModoZe): mesmo gradiente, sem emenda. */
  .zf-palco {
    position: sticky;
    top: 0;
    height: 100svh;
    overflow: hidden;
    isolation: isolate;
    color: #fff;
    font-family: var(--zx-body);
    background: var(--mz-noite, #140c2c);
  }
  .zf-palco { background-color: #08050f; }

  /* ── o céu do mundo do Zé ─────────────────────────────────────────────
     Futurista do NOSSO jeito (founder 15/09, mostrando o espaço da Shopify:
     "nada igual, mas do nosso"). Três coisas, nenhuma delas céu estrelado de
     banco de imagem:

     1. POEIRA EM GRADE. É a mesma malha de pontinhos das faixas escuras do
        site, aqui rala e se dissolvendo . o nosso grid virando espaço.
     2. ESTRELAS de verdade são poucas e tortas, nunca uma por quadrante. Duas
        são LARANJA: a cor de sinal do VOS aparece no céu como aparece na
        interface, uma vez e com motivo.
     3. O ARCO. Em vez de um planeta na lateral, a curva de um mundo logo
        abaixo do quadro, na rampa violeta→laranja do Modo Zé, com um fio de
        luz na borda. É o que dá FUNDO à cena sem tirar o olho do Zé.

     Anda um ladrilho (38px) em 96s: a volta é exata, então não há emenda, e
     nessa velocidade ninguém vê "uma animação", só o quadro respirando. */
  .zf-palco::before {
    content: "";
    position: absolute;
    inset: -60px 0;
    z-index: 0;
    pointer-events: none;
    background:
      radial-gradient(2.1px 2.1px at 11% 13%, rgba(226, 219, 255, 0.95), transparent 100%),
      radial-gradient(1.6px 1.6px at 23% 31%, rgba(214, 205, 255, 0.77), transparent 100%),
      radial-gradient(1.9px 1.9px at 34% 8%, rgba(255, 255, 255, 0.95), transparent 100%),
      radial-gradient(1.4px 1.4px at 41% 23%, rgba(198, 188, 255, 0.63), transparent 100%),
      radial-gradient(2.2px 2.2px at 57% 6%, rgba(255, 244, 232, 0.95), transparent 100%),
      radial-gradient(1.5px 1.5px at 66% 19%, rgba(214, 205, 255, 0.7), transparent 100%),
      radial-gradient(2.0px 2.0px at 78% 11%, rgba(255, 186, 133, 0.84), transparent 100%),
      radial-gradient(1.6px 1.6px at 88% 27%, rgba(226, 219, 255, 0.77), transparent 100%),
      radial-gradient(1.8px 1.8px at 94% 44%, rgba(255, 255, 255, 0.7), transparent 100%),
      radial-gradient(1.4px 1.4px at 7% 38%, rgba(198, 188, 255, 0.56), transparent 100%),
      radial-gradient(1.9px 1.9px at 17% 57%, rgba(226, 219, 255, 0.63), transparent 100%),
      radial-gradient(1.6px 1.6px at 72% 62%, rgba(255, 186, 133, 0.532), transparent 100%),
      radial-gradient(1.4px 1.4px at 47% 47%, rgba(214, 205, 255, 0.42), transparent 100%),
      radial-gradient(1.7px 1.7px at 92% 72%, rgba(226, 219, 255, 0.448), transparent 100%),
      radial-gradient(rgba(255, 255, 255, 0.075) 0.75px, transparent 0.8px) 0 0 / 38px 38px,
      radial-gradient(rgba(168, 153, 255, 0.07) 0.75px, transparent 0.8px) 19px 13px / 38px 38px,
      radial-gradient(150% 46% at 50% 126%, transparent 69.4%, rgba(214, 198, 255, 0.4) 70.4%, rgba(255, 150, 80, 0.26) 72%, transparent 73.6%),
      radial-gradient(160% 52% at 50% 112%, rgba(237, 75, 0, 0.24), rgba(124, 77, 255, 0.17) 44%, transparent 70%);
    animation: zf-ceu 96s linear infinite;
  }
  @keyframes zf-ceu { to { transform: translate3d(0, 38px, 0); } }
  @media (prefers-reduced-motion: reduce) {
    .zf-palco::before { animation: none; }
  }

  .zf-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

  /* ── o poste (a trilha 01 · 02 · 03), discreto ───────── */
  .zf-trilho { position: absolute; inset: 0; z-index: 3; pointer-events: none; }
  /* A largura sai do tamanho do Zé (3,4% do quadro): é a do buraco que o poste verde deixa nele. */
  .zf-poste {
    position: absolute;
    left: 0;
    top: 0;
    width: var(--poste-w, 8px);
    height: 70vh;
    border-radius: 99px;
    background: linear-gradient(90deg, #2a2150 0%, #5d4f9a 50%, #2a2150 100%);
  }
  .zf-poste-aceso {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    transform-origin: top;
    transform: scaleY(var(--aceso, 0));
    background: linear-gradient(90deg, #5c2c12 0%, #cf6a33 50%, #5c2c12 100%);
    /* ENQUANTO ELE GIRA o poste queima (founder 15/09, "quero mais efeitos"):
       a mesma brasa, mais quente e com halo, só nos segundos da descida. */
    filter: brightness(calc(1 + var(--gira, 0) * 0.55));
    box-shadow: 0 0 calc(var(--gira, 0) * 22px) rgba(237, 75, 0, calc(var(--gira, 0) * 0.5));
  }
  .zf-marco {
    position: absolute;
    left: 0;
    top: 0;
    width: 30px;
    height: 30px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    background: #1a1236;
    border: 1px solid rgba(255, 255, 255, 0.18);
    font: 500 11px/1 var(--zx-mono);
    color: rgba(255, 255, 255, 0.5);
    transition: border-color var(--zx-t-micro) var(--zx-ease), color var(--zx-t-micro) var(--zx-ease);
  }
  .zf-marco i { font-style: normal; }
  .zf-marco svg { display: none; width: 13px; height: 13px; }
  .zf-marco.is-ativo, .zf-marco.is-feito { border-color: rgba(255, 122, 51, 0.8); color: var(--zx-lar-2); }
  .zf-marco.is-feito i { display: none; }
  .zf-marco.is-feito svg { display: block; }

  /* ── passos: título e UM cartão, no meio da área livre ── */
  .zf-cap { position: absolute; inset: 0; z-index: 2; opacity: 0; will-change: opacity, transform; pointer-events: none; }
  .zf-cap.is-ativo { pointer-events: auto; }
  .zf-in {
    position: absolute;
    top: clamp(92px, 13vh, 132px);
    left: var(--zf-col-x, 50%);
    width: var(--zf-col-w, 640px);
  }
  .zf-cabeca { text-align: center; }
  .zf-titulo {
    margin: 0;
    font-family: var(--zx-display);
    font-size: clamp(28px, 3vw, 42px);
    font-weight: var(--zx-fw-display);
    line-height: 1.08;
    letter-spacing: -0.03em;
    color: #fff;
  }
  .zf-titulo b { margin-right: 0.28em; font-weight: var(--zx-fw-emphasis); color: var(--zx-lar-2); }
  .zf-sub { margin: 10px 0 0; font-size: clamp(14px, 1.15vw, 17px); line-height: 1.5; color: rgba(255, 255, 255, 0.66); }

  .zf-cartao {
    position: relative;
    margin-top: clamp(20px, 3vh, 32px);
    padding: clamp(16px, 1.6vw, 22px);
    border-radius: 18px;
    text-align: left;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 30px 80px -52px rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(8px);
  }
  .zf-cartao-topo { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .zf-logo { height: 13px; width: auto; opacity: 0.85; }
  .zf-av { display: block; flex: none; border-radius: 999px; object-fit: cover; }
  [data-zf-msg] { opacity: var(--m, 1); transform: translateY(calc((1 - var(--m, 1)) * 6px)); }
  [data-zf-msg].is-fora { display: none; }

  /* 01 · o time e a conversa */
  .zf-time { display: flex; flex-direction: column; align-items: center; gap: 8px; padding-bottom: 14px; margin-bottom: 14px; border-bottom: 1px solid rgba(255, 255, 255, 0.07); }
  .zf-time-rostos { display: flex; align-items: center; }
  .zf-time-rostos img { width: 36px; height: 36px; margin-left: -8px; border-radius: 999px; object-fit: cover; box-shadow: 0 0 0 2px #1d1440; }
  .zf-time-rostos img:first-child { margin-left: 0; }
  /* a Bia chega abrindo espaço na fileira */
  .zf-time-nova { width: calc(var(--m, 0) * 36px) !important; margin-left: calc(var(--m, 0) * -8px) !important; opacity: var(--m, 0); box-shadow: 0 0 0 2px #1d1440, 0 0 0 4px rgba(255, 122, 51, calc(var(--m, 0) * 0.6)) !important; }
  .zf-time-rot { font-size: 12px; color: rgba(255, 255, 255, 0.5); }
  .zf-conversa { display: flex; flex-direction: column; gap: 10px; }
  .zf-msg { display: flex; align-items: flex-end; gap: 8px; max-width: 92%; }
  .zf-msg--voce { align-self: flex-end; }
  .zf-balao { margin: 0; padding: 9px 13px; border-radius: 14px; border-bottom-left-radius: 5px; font-size: 14px; line-height: 1.45; color: #fff; background: rgba(255, 255, 255, 0.07); }
  .zf-balao > p { margin: 0; }
  .zf-msg--voce .zf-balao { color: #140c2a; background: rgba(255, 255, 255, 0.92); border-bottom-left-radius: 14px; border-bottom-right-radius: 5px; }
  [data-zf-digitado].is-digitando::after { content: ""; display: inline-block; width: 2px; height: 1.05em; margin-left: 1px; vertical-align: -0.16em; background: #140c2a; }
  .zf-ficha { margin-top: 8px; padding: 11px; border-radius: 12px; background: rgba(8, 5, 18, 0.3); border: 1px solid rgba(255, 255, 255, 0.07); }
  .zf-ficha-topo { display: flex; align-items: center; gap: 10px; }
  .zf-ficha-nome { display: grid; }
  .zf-ficha-nome strong { font-size: 14px; }
  .zf-ficha-nome small { font-size: 12px; color: rgba(255, 255, 255, 0.55); }
  /* O selo é ESTADO, não botão: pílula suave na cor, como o chip do produto. */
  .zf-ficha-ok { margin-left: auto; display: inline-flex; align-items: center; gap: 4px; padding: 3px 8px; border-radius: 999px; font-size: 10.5px; font-weight: 600; color: #92fcac; background: rgba(61, 190, 122, 0.16); }
  .zf-ficha-ok svg { width: 11px; height: 11px; }
  /* Os poderes viram CHIP com ícone (founder 15/09, "queria melhorar esse
     card"): em bloco de texto eles empilhavam três faixas largas e a primeira
     quebrava em duas linhas. Com ícone, 11.5px e o texto sem quebra, cada um
     cabe numa linha e o cartão encolheu. */
  .zf-poderes { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 9px; padding-top: 9px; border-top: 1px solid rgba(255, 255, 255, 0.06); }
  .zf-poderes span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 9px 4px 7px;
    border-radius: 999px;
    font-size: 11.5px;
    line-height: 1.35;
    white-space: nowrap;
    color: rgba(255, 255, 255, 0.82);
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .zf-poderes svg { width: 12px; height: 12px; flex: none; color: var(--zx-ai-ink, #a899ff); }

  /* 02 · o Zé executa */
  .zf-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
  .zf-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 12px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.62);
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition: color var(--zx-t-micro) var(--zx-ease), border-color var(--zx-t-micro) var(--zx-ease), background var(--zx-t-micro) var(--zx-ease);
  }
  .zf-chip svg { width: 15px; height: 15px; }
  .zf-chip.is-on { color: #fff; border-color: rgba(255, 122, 51, 0.45); background: rgba(255, 122, 51, 0.07); }
  .zf-linhas { list-style: none; margin: 0; padding: 0; }
  .zf-linha {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr) minmax(80px, 30%) 72px;
    align-items: center;
    gap: 12px;
    padding: clamp(8px, 1.4vh, 11px) 2px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    font-size: 14px;
    color: rgba(255, 255, 255, 0.84);
  }
  .zf-linha:first-child { border-top: 0; }
  .zf-linha > svg { width: 17px; height: 17px; color: rgba(255, 255, 255, 0.55); }
  .zf-barra { height: 5px; border-radius: 999px; background: rgba(255, 255, 255, 0.07); overflow: hidden; }
  .zf-barra i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--zx-lar), var(--zx-lar-2)); transform-origin: left; transform: scaleX(var(--r, 0)); }
  .zf-conta {
    justify-self: end;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 3px 6px 3px 9px;
    border-radius: 999px;
    font: 600 11.5px/1 var(--zx-mono);
    font-variant-numeric: tabular-nums;
    color: rgba(255, 255, 255, 0.8);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  .zf-conta svg { width: 14px; height: 14px; padding: 2px; border-radius: 999px; color: #140c2a; background: var(--zx-lar-2); transform: scale(0); transition: transform var(--zx-t-micro) var(--zx-ease); }
  .zf-linha.is-ok .zf-conta svg { transform: scale(1); }
  .zf-evento {
    position: absolute;
    z-index: 4;
    display: flex;
    align-items: center;
    gap: 9px;
    min-width: 160px;
    padding: 8px 12px 8px 8px;
    border-radius: 12px;
    background: rgba(32, 22, 60, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 18px 40px -26px rgba(0, 0, 0, 0.9);
    opacity: var(--e, 0);
    transform: translateY(calc((1 - var(--e, 0)) * 10px));
  }
  .zf-evento-ico { width: 28px; height: 28px; flex: none; border-radius: 9px; display: grid; place-items: center; color: #fff; background: rgba(255, 255, 255, 0.07); }
  .zf-evento-ico svg { width: 15px; height: 15px; }
  .zf-evento strong { display: block; font-size: 12.5px; font-weight: 600; }
  .zf-evento em { display: block; width: 84px; height: 4px; margin-top: 5px; border-radius: 99px; background: rgba(255, 255, 255, 0.1); }
  .zf-evento em + em { width: 52px; margin-top: 4px; }
  /* os avisos moram na BORDA do cartão: por dentro eles cobriam o nome das linhas */
  .zf-evento--a { top: -20px; right: -30px; }
  .zf-evento--b { top: 60px; right: -52px; }
  /* o de baixo da esquerda fica longe do canto: ali agora é onde o Zé fica pendurado */
  .zf-evento--c { bottom: -30px; left: 30%; }
  .zf-evento--d { bottom: -24px; right: 64px; }

  /* 03 · tudo pronto */
  .zf-feito { display: grid; grid-template-columns: auto minmax(0, 1fr) auto; align-items: center; gap: 16px; padding: 2px 2px 18px; }
  .zf-check { width: 52px; height: 52px; }
  .zf-check circle { fill: rgba(61, 190, 122, 0.1); stroke: var(--zx-ok-dark); stroke-width: 2.5; stroke-dasharray: 176; stroke-dashoffset: calc(176 * (1 - var(--c, 0))); }
  .zf-check path { fill: none; stroke: var(--zx-ok-dark); stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; stroke-dasharray: 40; stroke-dashoffset: calc(40 * (1 - clamp(0, var(--c, 0) * 2 - 1, 1))); }
  .zf-feito h4 { margin: 0; font-family: var(--zx-display); font-size: clamp(20px, 1.8vw, 26px); font-weight: var(--zx-fw-emphasis); letter-spacing: -0.02em; color: #fff; }
  .zf-feito p { margin: 4px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.66); }
  .zf-periodo { align-self: start; display: inline-flex; align-items: center; gap: 6px; padding: 7px 9px 7px 11px; border-radius: 9px; font-size: 12px; color: rgba(255, 255, 255, 0.66); background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); }
  .zf-periodo svg { width: 13px; height: 13px; }
  .zf-numeros { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 16px; }
  .zf-numero { padding: 14px 10px; border-radius: 12px; text-align: center; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.07); }
  .zf-numero svg { display: block; width: 18px; height: 18px; margin: 0 auto; color: var(--zx-ai-ink); }
  .zf-numero strong { display: block; margin-top: 6px; font-family: var(--zx-display); font-size: clamp(22px, 2.2vw, 32px); font-weight: var(--zx-fw-emphasis); letter-spacing: -0.02em; font-variant-numeric: tabular-nums; white-space: nowrap; }
  .zf-numero span { display: block; margin-top: 2px; font-size: 13px; color: rgba(255, 255, 255, 0.6); }
  .zf-cta { opacity: var(--k, 0); transform: translateY(calc((1 - var(--k, 0)) * 10px)); }
  .zf-cta button, .zf-cta a { width: 100%; }

  /* ── o Zé: pose parada por baixo, vídeo recortado por cima ─ */
  .zf-ze {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 6;
    width: var(--ze-s, 240px);
    height: var(--ze-s, 240px);
    pointer-events: none;
    will-change: transform;
  }
  .zf-festa { position: absolute; inset: 0; z-index: 7; width: 100%; height: 100%; pointer-events: none; }
  .zf-ze-parado, .zf-ze-tela { position: absolute; inset: 0; width: 100%; height: 100%; }
  .zf-ze-parado { object-fit: contain; transition: opacity 0.25s linear; user-select: none; }
  .zf-ze.sem-video .zf-ze-tela { display: none; }

  /* ── celular ─────────────────────────────────────────── */
  @media (max-width: 760px) {
    /* CURSO CORTADO DUAS VEZES no celular (founder 15/09: "encurta pelo menos
       metade no mobile também" e depois "corta ainda na metade"): eram 280svh,
       ou seja 180 de curso . quase duas telas por passo. Foi a 190 (90 de
       curso) e agora a 148 (48). Cada passo custa meia tela de dedo, e o pé do
       bloco deixou de ser faixa morta com o Zé parado esperando acabar. */
    .zf { height: 130svh; }
    /* O bloco acabava com uma faixa morta embaixo (founder 15/09: "dá pra
       cortar uns 240px dessa altura, de baixo pra cima"). O palco encurta e o
       resto da página sobe junto.
       Só que 240 era MAIS do que sobrava: medido no iPhone, o passo mais alto
       (o 02, com os dois avisos pendurados no pé do cartão) ocupa 684px do
       palco, e cortar até 604 cortava o cartão no meio. O corte real é de
       ~145px, e o piso de 700px é esse passo . abaixo dele não há faixa morta
       nenhuma pra tirar. */
    .zf-palco {
      height: max(700px, calc(100svh - 144px));
      /* Sem fundo PRÓPRIO: com o palco mais baixo que a tela, a noite dele
         acabava no meio do celular e a de trás (a mesma, esticada noutra
         caixa) continuava . duas noites, uma emenda. Deixando passar, quem
         pinta é o miolo do portal, de uma ponta à outra, sem costura. */
      background: none;
    }
    /* e o céu se dissolve antes da borda, pelo mesmo motivo: estrela que
       termina numa linha reta denuncia onde o palco acaba. */
    .zf-palco::before {
      -webkit-mask-image: linear-gradient(180deg, #000 64%, transparent 96%);
      mask-image: linear-gradient(180deg, #000 64%, transparent 96%);
    }
    /* o poste ACESO fica: com a descida de volta, é ele que marca o caminho já
       andado. Só os marcos 01·02·03 continuam fora . na pista estreita eles
       viravam três bolhas em cima do Zé. */
    .zf-marco, .zf-evento--a, .zf-evento--b, .zf-periodo { display: none; }
    .zf-poste {
      -webkit-mask-image: linear-gradient(180deg, transparent, #000 18%, #000 80%, transparent);
      mask-image: linear-gradient(180deg, transparent, #000 18%, #000 80%, transparent);
    }
    /* a coluna cede a PISTA do Zé, medida pelo JS a partir do tamanho dele */
    /* O conteúdo desce 50px (founder 15/09: "elimina 250px de baixo até o
       cartão"): o vão que sobrava embaixo do cartão era o maior buraco da
       tela. Não dá pra zerar . o passo mais alto (o 02) já ocupa 562 dos 714
       do celular . mas desce o que cabe sem cortar ninguém. */
    .zf-in { top: 130px; left: 20px; width: calc(100% - 20px - var(--zf-pista, 100px)); }
    /* o Zé fica no canto de cima da direita: o título cede esse canto e alinha à esquerda */
    .zf-cabeca { text-align: left; }
    .zf-titulo { font-size: 28px; }
    .zf-sub { font-size: 14px; }
    .zf-cartao { padding: 14px; border-radius: 16px; }
    .zf-balao { font-size: 13px; }
    .zf-chip { padding: 6px 9px; font-size: 12px; }
    .zf-linha { grid-template-columns: 16px minmax(0, 1fr) auto; row-gap: 7px; column-gap: 9px; font-size: 13px; }
    .zf-barra { grid-column: 2 / 4; grid-row: 2; }
    .zf-evento { min-width: 0; max-width: calc(50% - 5px); }
    .zf-evento--c { bottom: -58px; left: 0; }
    .zf-evento--d { bottom: -58px; right: 0; }
    .zf-feito { grid-template-columns: auto minmax(0, 1fr); gap: 12px; }
    .zf-check { width: 44px; height: 44px; }
    .zf-numeros { gap: 6px; }
    .zf-numero { padding: 10px 4px; }
    .zf-numero strong { font-size: 16px; }
    .zf-numero span { font-size: 11px; line-height: 1.25; }
    /* O botão é a largura do cartão, e o cartão encolheu pra abrir a pista do
       Zé: a letra desce um passo e o vão do chevron passa a ser o tamanho dele,
       senão "Colocar o Zé para trabalhar" sai pela borda. */
    .zf-cta button, .zf-cta a { font-size: 13.5px; line-height: 20px; padding: 12px 12px 12px 15px; }
    .zf-cta button > span:first-child, .zf-cta a > span:first-child { margin-right: 46px; }
  }

  /* ── movimento reduzido: sem palco grudado, passos um embaixo do outro ── */
  @media (prefers-reduced-motion: reduce) {
    .zf { height: auto; }
    .zf-palco { position: relative; height: auto; overflow: visible; padding: 72px 20px 88px; }
    .zf-trilho, .zf-ze, .zf-evento { display: none; }
    .zf-cap { position: relative; inset: auto; opacity: 1 !important; transform: none !important; pointer-events: auto; padding-bottom: 64px; }
    .zf-in { position: relative; top: auto; left: auto; width: min(660px, 100%); margin-inline: auto; }
    .zf-cabeca { padding-right: 0; }
    .zf-cta { opacity: 1; transform: none; }
  }
`;
