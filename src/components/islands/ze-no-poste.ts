/**
 * O Zé no poste: toca os vídeos do Higgsfield (fundo PRETO e poste VERDE) e recorta os
 * dois na GPU, quadro a quadro, com o mesmo cálculo que passou no teste das poses:
 *
 * - verde some onde g passa de max(r, b) por uma margem (o brilho do poste também some,
 *   que é o que o chromakey padrão não pegava);
 * - preto some pela luminância, com rampa curta pra não comer a sombra do Zé;
 * - o verde que sobra na borda é aparado até max(r, b).
 *
 * O buraco que o poste verde deixa no Zé é EXATAMENTE onde o poste da página aparece:
 * quando ele gira pra trás, o poste passa na frente sozinho.
 *
 * Por que vídeo e não sequência de imagens: 5 clipes × 96 quadros decodificados passam de
 * meio giga de memória; vídeo H.264 decodifica no hardware e pesa poucos MB no download.
 */

/**
 * uma-vez: toca do começo quando entra e PARA no último quadro (founder 15/09: "anima uma vez e
 * espera, não em loop"); como os pousos começam e terminam na mesma pose, a parada é a pose.
 * scrub: o scroll escolhe o quadro (os giros).
 */
export type Clipe = { src: string; modo: "uma-vez" | "scrub"; trilho: string };

/** Onde o poste mora em todo quadro depois do instalar-ze-poste (fração da largura). */
export const POSTE_X = 0.42;
const QPS = 24;

const VERT = `
attribute vec2 p;
varying vec2 uv;
void main() {
  uv = vec2((p.x + 1.0) * 0.5, 1.0 - (p.y + 1.0) * 0.5);
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
varying vec2 uv;
uniform sampler2D ta;
uniform sampler2D tb;
uniform float mistura;
uniform float desvioA;
uniform float desvioB;
vec4 recorta(vec3 c) {
  float rb = max(c.r, c.b);
  float semVerde = clamp((rb - c.g + 0.2275) / 0.1176, 0.0, 1.0);
  float semPreto = clamp((max(c.g, rb) - 0.0549) / 0.1020, 0.0, 1.0);
  float a = min(semVerde, semPreto);
  vec3 cor = vec3(c.r, min(c.g, rb + 0.0157), c.b);
  return vec4(cor * a, a);
}
void main() {
  // desvio = onde o poste está neste quadro menos onde ele deveria estar: a imagem anda junto
  vec4 a = recorta(texture2D(ta, uv + vec2(desvioA, 0.0)).rgb);
  vec4 b = recorta(texture2D(tb, uv + vec2(desvioB, 0.0)).rgb);
  gl_FragColor = mix(a, b, mistura);
}`;

const FADE_MS = 170;

export class ZeNoPoste {
  private gl: WebGLRenderingContext;
  private texA: WebGLTexture;
  private texB: WebGLTexture;
  private uMistura: WebGLUniformLocation;
  private uDesvioA: WebGLUniformLocation;
  private uDesvioB: WebGLUniformLocation;
  private trilhos: Record<string, number[]> = {};
  private videos = new Map<string, HTMLVideoElement>();
  private atual: string | null = null;
  private anterior: string | null = null;
  private fadeIni = 0;
  /** true quando o primeiro quadro de verdade foi desenhado: aí a pose parada some */
  pronto = false;
  /**
   * Teve quadro NESTE desenho? É o que decide se a pose parada aparece.
   *
   * Só o `pronto` não bastava: o canvas é LIMPO toda vez que muda de tamanho
   * (resize, a barra do celular subindo, zoom), e se nesse instante o vídeo não
   * tiver quadro decodificado sobra um quadrado vazio . com a pose escondida
   * pra sempre, o Zé some da página (founder 15/09: "zé sumiu").
   */
  desenhou = false;

  static cria(canvas: HTMLCanvasElement, clipes: Record<string, Clipe>): ZeNoPoste | null {
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
    if (!gl) return null;
    try {
      return new ZeNoPoste(gl, clipes);
    } catch {
      return null;
    }
  }

  private constructor(gl: WebGLRenderingContext, private clipes: Record<string, Clipe>) {
    this.gl = gl;
    const sh = (tipo: number, fonte: string) => {
      const s = gl.createShader(tipo)!;
      gl.shaderSource(s, fonte);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const p = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(p);
    gl.vertexAttribPointer(p, 2, gl.FLOAT, false, 0, 0);

    const textura = (unidade: number, nome: string) => {
      const t = gl.createTexture()!;
      gl.activeTexture(gl.TEXTURE0 + unidade);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
      gl.uniform1i(gl.getUniformLocation(prog, nome), unidade);
      return t;
    };
    this.texA = textura(0, "ta");
    this.texB = textura(1, "tb");
    this.uMistura = gl.getUniformLocation(prog, "mistura")!;
    this.uDesvioA = gl.getUniformLocation(prog, "desvioA")!;
    this.uDesvioB = gl.getUniformLocation(prog, "desvioB")!;
    gl.clearColor(0, 0, 0, 0);
  }

  /** O mapa do poste quadro a quadro (poste.json). Sem ele o recorte fica parado, e só o 01 sofre. */
  usaTrilhos(trilhos: Record<string, number[]>) {
    this.trilhos = trilhos;
  }

  private desvio(nome: string | null, v: HTMLVideoElement | undefined) {
    const xs = nome ? this.trilhos[this.clipes[nome].trilho] : undefined;
    if (!xs || !v) return 0;
    const i = Math.min(xs.length - 1, Math.max(0, Math.round(v.currentTime * QPS)));
    return xs[i] - POSTE_X;
  }

  /** Cria os vídeos (só quando o filme chega perto) e deixa os de giro prontos pra buscar quadro. */
  prepara() {
    for (const [nome, c] of Object.entries(this.clipes)) {
      if (this.videos.has(nome)) continue;
      const v = document.createElement("video");
      v.src = c.src;
      v.muted = true;
      v.defaultMuted = true;
      v.playsInline = true;
      v.setAttribute("playsinline", "");
      v.setAttribute("muted", "");
      v.loop = false;
      v.preload = "auto";
      // iOS só pinta o primeiro quadro de um vídeo pausado depois de um play
      if (c.modo === "scrub") v.addEventListener("loadeddata", () => { v.play().then(() => v.pause()).catch(() => {}); }, { once: true });
      /* O clipe de POUSO também decodifica um quadro sem esperar o play: se o
         navegador barrar a reprodução automática (Safari em pouca bateria, modo
         economia), o `play()` do `mostra` não acontece e o canvas ficaria vazio
         . com o quadro decodificado ele ao menos desenha a pose parada. */
      else v.addEventListener("loadeddata", () => { if (v.paused && v.currentTime === 0) v.currentTime = 0.01; }, { once: true });
      this.videos.set(nome, v);
    }
  }

  tamanho(px: number) {
    const c = this.gl.canvas as HTMLCanvasElement;
    const lado = Math.max(2, Math.round(px));
    if (c.width !== lado || c.height !== lado) {
      c.width = lado;
      c.height = lado;
    }
    this.gl.viewport(0, 0, lado, lado);
  }

  /**
   * Escolhe o clipe da vez. `alvo` null = toca uma vez e para; número de 0 a 1 = quadro comandado
   * pelo scroll (os giros). Trocar de clipe faz uma fusão curta pra esconder a diferença de pose.
   */
  mostra(nome: string, alvo: number | null, agora: number) {
    const v = this.videos.get(nome);
    if (!v) return;
    if (nome !== this.atual) {
      this.anterior = this.atual;
      this.atual = nome;
      this.fadeIni = agora;
      if (this.clipes[nome].modo === "uma-vez") {
        v.currentTime = 0;
        v.play().catch(() => {});
      }
    }
    if (alvo !== null && v.duration) {
      if (!v.paused) v.pause();
      const t = Math.min(v.duration - 0.02, Math.max(0, alvo * v.duration));
      if (Math.abs(v.currentTime - t) > 1 / 60 && !v.seeking) v.currentTime = t;
    }
  }

  private sobe(tex: WebGLTexture, unidade: number, v: HTMLVideoElement | undefined) {
    if (!v || v.readyState < 2) return false;
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0 + unidade);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, v);
    return true;
  }

  desenha(agora: number) {
    const gl = this.gl;
    const fade = this.anterior ? Math.min(1, (agora - this.fadeIni) / FADE_MS) : 1;
    const vAtual = this.atual ? this.videos.get(this.atual) : undefined;
    const vAnterior = this.anterior ? this.videos.get(this.anterior) : undefined;
    const temAtual = this.sobe(this.texB, 1, vAtual);
    const temAnterior = fade < 1 && this.sobe(this.texA, 0, vAnterior);
    this.desenhou = temAtual || temAnterior;
    if (!temAtual && !temAnterior) return;
    gl.uniform1f(this.uMistura, temAnterior ? fade : 1);
    gl.uniform1f(this.uDesvioA, this.desvio(this.anterior, vAnterior));
    gl.uniform1f(this.uDesvioB, this.desvio(this.atual, vAtual));
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    this.pronto = this.pronto || temAtual;
    if (fade >= 1 && this.anterior) {
      const velho = this.videos.get(this.anterior);
      if (velho && this.clipes[this.anterior].modo === "uma-vez") velho.pause();
      this.anterior = null;
    }
  }

  destroi() {
    for (const v of this.videos.values()) {
      v.pause();
      v.removeAttribute("src");
      v.load();
    }
    this.videos.clear();
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
