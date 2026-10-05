/* Full Motion BlueOcean — peças comuns (receita 11). Precisa do ../motion.js antes.
   A página chama FM.iniciar({azul, voos, grupos, legendaOculta, estouros}) e no window.quadro(t) chama
   FM.antes(t) no começo e FM.depois(t) no fim. Tempos sempre em segundos do áudio da fala. */
(function () {
  const M = Motion, E = M.ease, C = M.clamp, L = M.lerp, $ = s => document.querySelector(s);
  const pr = (t, a, d, e = E.expoOut) => M.prog(t, a, d, e);
  const FM = { M, E, C, L, $, pr };
  FM.PT = v => 'R$ ' + Math.round(v).toLocaleString('pt-BR');

  /* elemento .p centrado em (left, top): entra com mola saindo do desfoque, sai desfocando em b (null = fica) */
  FM.anim = function (el, t, a, b, o = {}) {
    const { x = 0, y = 0, de = 0.8, desf = 26, rot = 0, dy = 50, din = 0.75, dout = 0.4, extra = '', esc = 1 } = o;
    if (t < a || (b != null && t > b + dout)) { el.style.opacity = 0; return 0; }
    const pin = pr(t, a, din), ps = M.prog(t, a, din * 1.4, E.spring), pa = pr(t, a, din * 0.45, E.cubicOut);
    const po = b == null ? 0 : pr(t, b, dout, E.cubicIn);
    el.style.opacity = pa * (1 - po);
    const bl = (1 - pin) * desf + po * desf;
    el.style.filter = bl > 0.3 ? `blur(${bl}px)` : 'none';
    el.style.transform = `translate(-50%,-50%) translate(${x}px,${y + (1 - pin) * dy - po * dy * 0.6}px) rotate(${(1 - pin) * rot}deg) scale(${L(de, 1, ps) * (1 - po * 0.12) * esc})${extra}`;
    return pa * (1 - po);
  };
  /* linha de texto: cada palavra entra no tempo em que é falada (ts), a linha toda sai em b */
  const linhas = {};
  FM.palavrasDe = id => linhas[id] || (linhas[id] = M.palavras(document.getElementById(id)));
  FM.linha = function (id, t, ts, b, o = {}) {
    const el = document.getElementById(id), ws = FM.palavrasDe(id);
    const { sobe = 0.38, desf = 16, dur = 0.7, dy = -40, extra = '', opac = 1 } = o;
    if (t < ts[0] - 0.06 || t > b + 0.4) { el.style.opacity = 0; return; }
    const po = pr(t, b, 0.4, E.cubicIn);
    el.style.opacity = (1 - po) * opac;
    el.style.filter = po > 0.01 ? `blur(${po * 20}px)` : 'none';
    el.style.transform = `translate(-50%,-50%) translateY(${po * dy}px)${extra}`;
    ws.forEach((s, i) => {
      const t0 = (ts[i] ?? ts[ts.length - 1]) - 0.05;
      const p = pr(t, t0, dur), pa = pr(t, t0, dur * 0.45, E.cubicOut);
      s.style.opacity = pa;
      s.style.filter = p > 0.995 ? 'none' : `blur(${(1 - p) * desf}px)`;
      s.style.transform = `translateY(${(1 - p) * sobe}em) scale(${L(0.94, 1, p)})`;
    });
  };
  /* risco que passa por cima de uma palavra (o "vejo" → "VIVO"): devolve a função que desenha */
  FM.risco = function (id, indice = -1) {
    const ws = FM.palavrasDe(id), alvo = ws[indice < 0 ? ws.length + indice : indice];
    alvo.style.position = 'relative';
    const r = document.createElement('div');
    Object.assign(r.style, { position: 'absolute', left: '-4%', right: '8%', top: '54%', height: '7px', borderRadius: '4px', background: 'currentColor', transformOrigin: '0 50%', transform: 'scaleX(0)' });
    alvo.appendChild(r);
    return (t, t0) => { r.style.transform = `scaleX(${pr(t, t0, 0.45, E.cubicInOut)})`; };
  };

  /* ── fundo azul + arcos ── */
  let AZUL = [], VOOS = [], arcos = [];
  FM.fundoAzul = function (t) {
    let clip = 'inset(0 100% 0 0)';
    for (const [a, b] of AZUL) {
      if (t >= a && t < b + 0.5) {
        const pi = pr(t, a, 0.5, E.cubicInOut), po = pr(t, b, 0.5, E.cubicInOut);
        clip = po > 0 ? `inset(0 0 0 ${po * 100}%)` : `inset(0 ${(1 - pi) * 100}% 0 0)`;
      }
    }
    $('#azul').style.clipPath = clip;
  };
  FM.ehAzul = t => AZUL.some(([a, b]) => t >= a + 0.25 && t < b + 0.25);
  FM.arcos = function (t) {
    arcos.forEach((p, k) => {
      const v = VOOS.filter(v => v[0] === k && t >= v[1] && t <= v[1] + v[2]).pop();
      if (!v) { p.style.opacity = 0; return; }
      const q = E.cubicInOut(C((t - v[1]) / v[2])), seg = p.len * 0.42;
      p.style.opacity = 1;
      p.setAttribute('stroke-dasharray', `${seg} ${p.len * 2}`);
      p.setAttribute('stroke-dashoffset', L(seg, -p.len, q));
    });
  };

  /* ── ícones de app ── */
  FM.GLIFO = {
    code: 'M8 7 L3 12 L8 17 M16 7 L21 12 L16 17',
    bars: 'M5 20 V12 M12 20 V5 M19 20 V9',
    chat: 'M4 5 H20 V16 H10 L5 20 V16 H4 Z',
    dolar: 'M12 3 V21 M16.5 7.5 C16 5.5 14 5 12 5 C9.5 5 8 6.3 8 8 C8 12 16.5 10 16.5 15 C16.5 17 14.5 18.5 12 18.5 C9.5 18.5 7.8 17.5 7.4 15.5',
    check: 'M5 12.5 L10 17 L19 7',
    x: 'M7 7 L17 17 M17 7 L7 17',
    nuvem: 'M7 18 H17 A4 4 0 0 0 17 10 A5.5 5.5 0 0 0 6.5 9 A4.5 4.5 0 0 0 7 18 Z',
    raio: 'M13 2 L4 14 H11 L10 22 L19 10 H12 Z',
    carro: 'M3 4 H6 L8.5 15 H18 L20 7 H7 M9 20 h0.01 M17 20 h0.01',
    gente: 'M9 7 a4 4 0 1 0 0.01 0 M2 21 C2 15.5 16 15.5 16 21 M16 3.5 a4 4 0 0 1 0 8 M18.5 15 C21 16 22 18 22 21',
    pessoa: 'M12 4 a4 4 0 1 0 0.01 0 M4 21 C4 14.5 20 14.5 20 21',
    agenda: 'M4 6 H20 V20 H4 Z M4 10 H20 M8 3 V7 M16 3 V7',
    funil: 'M3 4 H21 L14 12 V19 L10 21 V12 Z',
    alvo: 'M12 3 a9 9 0 1 0 0.01 0 M12 7.5 a4.5 4.5 0 1 0 0.01 0 M12 11.5 h0.01',
    seta: 'M5 12 H19 M13 6 L19 12 L13 18',
  };
  FM.svg = (g, cor = 'currentColor', w = 2.4) => `<svg viewBox="0 0 24 24" fill="none" stroke="${cor}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"><path d="${FM.GLIFO[g]}"/></svg>`;
  FM.icone = function (cls, gl, txt, s, pai = document.body) {
    const d = document.createElement('div');
    d.className = 'ic ' + cls + (txt ? ' com-txt' : ''); d.style.setProperty('--s', s + 'px');
    d.innerHTML = `<svg viewBox="0 0 24 24"><path d="${FM.GLIFO[gl]}"/></svg>` + (txt ? `<span>${txt}</span>` : '');
    pai.appendChild(d); return d;
  };

  /* ── confete azul de uma cor só: retângulos estouram do elemento, giram e caem (aprovado no case Diego) ── */
  const rng = seed => () => { seed = seed + 0x6D2B79F5 | 0; let x = Math.imul(seed ^ seed >>> 15, 1 | seed); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; };
  FM.rng = rng;
  FM.criaConfete = function (seed, n, cx, cy, w, h, forca = 1) {
    const R = rng(seed);
    return Array.from({ length: n }, () => {
      const ang = R() * Math.PI * 2, ex = Math.cos(ang), ey = Math.sin(ang), d = 0.35 + R() * 0.15, v = (800 + R() * 1700) * forca;
      return { x0: cx + ex * w * d, y0: cy + ey * h * d, vx: ex * v * 1.15, vy: ey * v - 450 * R(), w: 11 + R() * 9, h: 19 + R() * 13,
               rot: R() * 6.28, vr: (R() - 0.5) * 16, flip: R() * 6.28, vf: 9 + R() * 14, vida: 0.75 + R() * 0.6, atraso: R() * 0.05 };
    });
  };
  let ESTOUROS = [], cg = null;
  FM.confete = function (t) {
    cg.clearRect(0, 0, 1080, 1920);
    const k = 3.4, g = 1500;
    for (const { t0, ps, cor } of ESTOUROS) for (const q of ps) {
      const s = t - t0 - q.atraso;
      if (s < 0 || s > q.vida) continue;
      const e = (1 - Math.exp(-k * s)) / k;
      const x = q.x0 + q.vx * e, y = q.y0 + q.vy * e + (g / k) * (s - e);
      const vira = Math.cos(q.flip + q.vf * s), luz = Math.abs(vira);
      cg.save(); cg.translate(x, y); cg.rotate(q.rot + q.vr * s); cg.scale(1, Math.max(0.12, luz) * Math.sign(vira || 1));
      cg.globalAlpha = Math.min(1, s / 0.04) * (1 - C((s / q.vida - 0.65) / 0.35));
      cg.fillStyle = cor === 'branco'   // no fundo azul o confete é branco (mesma ideia: uma cor só, sombra ao virar)
        ? `rgb(${Math.round(L(190, 255, luz))},${Math.round(L(205, 255, luz))},255)`
        : `rgb(${Math.round(L(0, 70, luz))},${Math.round(L(40, 110, luz))},${Math.round(L(200, 255, luz))})`;
      cg.fillRect(-q.w / 2, -q.h / 2, q.w, q.h);
      cg.restore();
    }
  };

  /* ── legenda pequena, palavra a palavra (some nos trechos em que o texto na tela já é a fala) ── */
  let GRUPOS = [], OCULTA = [], legEls = [];
  /* regra aprovada: se o texto grande da tela já mostra as mesmas palavras, a legenda de baixo sai
     (conta só palavras de 3+ letras ou números; metade ou mais repetida = legenda duplicada) */
  const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9%$ ]/g, ' ').split(/\s+/).filter(Boolean);
  const conteudo = ws => { const c = ws.filter(w => w.length >= 3 || /\d/.test(w)); return c.length ? c : ws; };
  function repetida(chave) {
    for (const el of document.querySelectorAll('.p:not(#leg)')) {   // qualquer texto na tela (título, selo, cartão)
      if (!(parseFloat(el.style.opacity) > 0.1)) continue;
      const tela = el._pal || (el._pal = new Set(norm(el.textContent)));
      if (!tela.size) continue;   // ícone/imagem sem texto não conta
      const telaC = el._con || (el._con = conteudo([...tela]));   // texto da tela todo dentro da legenda também conta
      if (telaC.every(w => chave.includes(w))) return true;
      if (chave.filter(w => tela.has(w)).length >= chave.length * 0.5) return true;
    }
    return false;
  }
  /* regra da pessoa: a legenda NUNCA fica por cima de imagem, cartão ou texto. Ela procura um lugar livre:
     embaixo (1390), um pouco acima, mais embaixo, no topo… e fica no primeiro espaço vazio. */
  const LUGARES = [1390, 1250, 1540, 330, 240, 1660];
  let legY = 1390, legK = -1, FIXA = false, SEM_TEXTO = false, ESCONDE = [], AMOSTRA = null;   // FIXA: legenda sempre embaixo, o vídeo todo (pedido no Doxa)
  function ocupados() {
    const rs = [];
    for (const el of document.querySelectorAll('.p, .ic, .dono, .pt')) {
      if (el.id === 'leg' || el.closest('#leg') || el.classList.contains('cursor')) continue;
      if (!(parseFloat(el.style.opacity) > 0.05)) continue;
      let r = el.getBoundingClientRect();
      // imagem recortada (personagem): conta só a área real dele (data-caixa="x0,y0,x1,y1" na imagem), não o png inteiro
      if (el.dataset.caixa && el.offsetWidth) {
        const [x0, y0, x1, y1] = el.dataset.caixa.split(',').map(Number), k = r.width / el.offsetWidth;
        r = { left: r.left + x0 * k, top: r.top + y0 * k, right: r.left + x1 * k, bottom: r.top + y1 * k };
      }
      if (r.right - r.left > 0 && r.bottom - r.top > 0) rs.push(r);
    }
    return rs;
  }
  function sobra(y, w, rs) {   // área da legenda que fica em cima de alguma coisa (0 = livre)
    const a = { l: 540 - w / 2 - 24, r: 540 + w / 2 + 24, t: y - 34 - 22, b: y + 34 + 22 };
    return rs.reduce((s, r) => s + Math.max(0, Math.min(a.r, r.right) - Math.max(a.l, r.left)) * Math.max(0, Math.min(a.b, r.bottom) - Math.max(a.t, r.top)), 0);
  }
  const livre = (y, w, rs) => sobra(y, w, rs) === 0;
  function repetidaEm(lista) {   // algum texto visível da tela está todo dentro das frases recentes
    for (const el of document.querySelectorAll('.p:not(#leg)')) {
      if (!(parseFloat(el.style.opacity) > 0.1)) continue;
      const tela = el._pal || (el._pal = new Set(norm(el.textContent))); if (!tela.size) continue;
      const telaC = el._con || (el._con = conteudo([...tela]));
      const temNum = lista.some(w => /\d/.test(w));   // contador animado: número na tela vale como o número falado
      if (telaC.length && telaC.every(w => lista.includes(w) || (temNum && /^\d+$/.test(w)))) return true;
    }
    return false;
  }
  FM.legenda = function (t) {
    const leg = $('#leg');
    // legenda fixa: some só nas telas azuis (a varrida de entrada/saída também conta)
    const naTelaAzul = FIXA && AZUL.some(([a, b]) => t >= a + 0.1 && t < b + 0.4);
    leg.style.opacity = naTelaAzul || (!FIXA && OCULTA.some(([a, b]) => t >= a && t < b)) ? 0 : 1;
    if (SEM_TEXTO && !AMOSTRA) {   // trechos medidos: some e volta com fade curto, sempre no começo de uma frase
      let v = 1;
      for (const [a, b] of ESCONDE) v = Math.min(v, Math.max(C((a - t) / 0.2), C((t - b) / 0.2)));
      leg.style.opacity = naTelaAzul ? 0 : v;
    }
    leg.style.transform = 'translate(-50%,-50%)'; leg.style.color = FM.ehAzul(t) ? '#fff' : '#101218';
    let rs = null;
    GRUPOS.forEach((g, k) => {
      const ini = g[0][0] - 0.05, prox = GRUPOS[k + 1] ? GRUPOS[k + 1][0][0] - 0.05 : 99;
      const fim = Math.min(prox, g[g.length - 1][0] + 0.9);
      const { d, ws, chave } = legEls[k];
      // conta também o texto que ficou na tela das 2 frases anteriores (título que continua depois de falado)
      if (AMOSTRA && t >= ini && t < fim) { const junto = [...(legEls[k - 2]?.chave || []), ...(legEls[k - 1]?.chave || []), ...chave];
        if (repetida(chave) || repetidaEm(junto)) AMOSTRA.dup = true; }
      if (t < ini || t >= fim || (!FIXA && repetida(chave))) { d.style.opacity = 0; return; }
      d.style.opacity = 1;
      // lugar livre: ao trocar de grupo tenta de novo desde o lugar padrão; no meio do grupo só muda se algo invadir
      if (FIXA) {
        leg.style.top = '1390px';
      } else {
      rs = rs || ocupados();
      const w = d.offsetWidth;
      if (k !== legK || !livre(legY, w, rs)) {
        const y = LUGARES.find(y => livre(y, w, rs));
        if (y == null) { d.style.opacity = 0; return; }   // sem lugar livre: melhor sem legenda do que por cima de algo
        legY = y; legK = k;
      }
      leg.style.top = legY + 'px'; }
      ws.forEach((s, i) => {
        const p = pr(t, g[i][0] - 0.04, 0.45), pa = pr(t, g[i][0] - 0.04, 0.2, E.cubicOut);
        s.style.opacity = pa; s.style.filter = p > 0.99 ? 'none' : `blur(${(1 - p) * 10}px)`;
        s.style.transform = `translateY(${(1 - p) * 0.3}em)`;
      });
    });
  };

  /* cursor (seta preta com borda branca) que vai de 'de' até 'para' e clica em tc */
  FM.cursor = function (el, t, t0, de, para, tc, tsai) {
    const pm = pr(t, t0, 0.4, E.cubicOut), ps = pr(t, tsai, 0.5, E.cubicIn), clique = Math.sin(C((t - tc) / 0.22) * Math.PI);
    el.style.opacity = t < t0 ? 0 : pr(t, t0, 0.15, E.linear) * (1 - ps);
    el.style.left = (L(de[0], para[0], pm) + ps * 300) + 'px'; el.style.top = (L(de[1], para[1], pm) + ps * 300) + 'px';
    el.style.transform = `translate(-20%,-10%) scale(${1 - 0.15 * clique})`;
    el.style.filter = 'drop-shadow(0 6px 10px rgba(0,0,0,.35))';
    return clique;
  };
  FM.CURSOR = '<path d="M3 2 L3 24 L8.5 18.5 L12.5 27.5 L16.5 25.7 L12.6 17 L20 17 Z" fill="#111" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"/>';

  FM.iniciar = function (cfg) {
    AZUL = cfg.azul || []; VOOS = cfg.voos || []; GRUPOS = cfg.grupos || []; OCULTA = cfg.legendaOculta || []; ESTOUROS = cfg.estouros || []; FIXA = !!cfg.legendaFixa; SEM_TEXTO = !!cfg.legendaSoSemTexto;
    const az = document.createElement('div'); az.id = 'azul';
    az.innerHTML = `<svg viewBox="0 0 1080 1920">
      <path class="arco" d="M -220 330 C 260 600, 900 120, 1320 -120"/>
      <path class="arco" d="M 1320 380 C 560 460, 420 1320, 1240 2140"/>
      <path class="arco" d="M -260 1480 C 320 1260, 760 1900, 640 2240"/></svg>`;
    document.body.prepend(az);
    arcos = [...az.querySelectorAll('.arco')];
    arcos.forEach(p => { p.setAttribute('fill', 'none'); p.setAttribute('stroke', '#fff'); p.setAttribute('stroke-width', 16); p.setAttribute('stroke-linecap', 'round'); p.len = p.getTotalLength(); });
    const cv = document.createElement('canvas'); cv.id = 'confete'; cv.width = 1080; cv.height = 1920; document.body.appendChild(cv); cg = cv.getContext('2d');
    const leg = document.createElement('div'); leg.id = 'leg'; leg.className = 'p linha'; document.body.appendChild(leg);
    legEls = GRUPOS.map(g => {
      const d = document.createElement('div'); Object.assign(d.style, { position: 'absolute', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' });
      d.innerHTML = g.map(([, w]) => w.startsWith('*') ? `<b>${w.slice(1, -1)}</b>` : w).join(' ');
      leg.appendChild(d); return { d, ws: M.palavras(d), chave: conteudo(norm(g.map(([, w]) => w).join(' '))) };
    });
    window.pronto = Promise.all([...document.images].map(i => i.decode().catch(() => {})));
  };
  FM.antes = t => { FM.fundoAzul(t); FM.arcos(t); };
  /* legenda fixa: onde ela passa por cima de superfície escura (terno, sapato), as letras ficam brancas — no contorno
     exato: uma cópia branca da legenda recortada pela máscara das áreas escuras do personagem (FM.mascaraEscura) */
  function legendaBranca() {
    let b = document.getElementById('legB'); if (b) b.remove();
    const leg = $('#leg'); if (!FIXA || FM.ehAzulAgora || !FM.mascaraEscura) return;
    const m = FM.mascaraEscura(); if (!m) return;
    b = leg.cloneNode(true); b.id = 'legB'; b.style.zIndex = 61; b.style.color = '#fff';
    const cs = getComputedStyle(leg), r0 = leg.getBoundingClientRect();   // #leg tem caixa de tamanho 0: a cópia ganha caixa de verdade
    Object.assign(b.style, { left: '0px', top: (r0.top - 80) + 'px', width: '1080px', height: '200px', transform: 'none', opacity: cs.opacity,
      fontSize: cs.fontSize, fontWeight: cs.fontWeight, letterSpacing: cs.letterSpacing, fontFamily: cs.fontFamily, lineHeight: cs.lineHeight });
    [...b.children].forEach(d => { d.style.top = '80px'; });
    leg.parentNode.appendChild(b);
    const r = b.getBoundingClientRect();
    Object.assign(b.style, { webkitMaskImage: `url(${m.url})`, maskImage: `url(${m.url})`, webkitMaskRepeat: 'no-repeat', maskRepeat: 'no-repeat',
      webkitMaskSize: `${m.r.width}px ${m.r.height}px`, maskSize: `${m.r.width}px ${m.r.height}px`,
      webkitMaskPosition: `${m.r.left - r.left}px ${m.r.top - r.top}px`, maskPosition: `${m.r.left - r.left}px ${m.r.top - r.top}px` });
  }
  /* mede o vídeo todo: onde há texto da copy na tela (ou tela azul), a legenda fica escondida o trecho inteiro */
  FM.medirLegenda = async function (dur) {
    const P = 0.1, n = Math.ceil(dur / P), esc = [];
    for (let i = 0; i <= n; i++) {
      const t = i * P; AMOSTRA = { dup: false };
      await window.quadro(t);
      esc.push(AMOSTRA.dup || AZUL.some(([a, b]) => t >= a && t < b + 0.4));
    }
    AMOSTRA = null;
    const inicios = GRUPOS.map(g => g[0][0] - 0.05);
    const grupoEm = t => { let k = -1; inicios.forEach((x, i) => { if (x <= t) k = i; }); return k; };
    // 1) trechos escondidos crus
    let tr = []; esc.forEach((e, i) => { const t = i * P; if (e) { if (tr.length && t - tr[tr.length - 1][1] <= P * 1.5) tr[tr.length - 1][1] = t; else tr.push([t, t]); } });
    // 2) começa e termina em fronteira de frase: some no começo da frase em que o texto aparece, volta no começo da frase seguinte
    tr = tr.map(([a, b]) => { const ka = grupoEm(a), kb = grupoEm(b);
      return [ka >= 0 ? inicios[ka] : a, kb + 1 < inicios.length ? inicios[kb + 1] : dur + 1]; });
    // 3) junta trechos e esconde também os pedaços visíveis curtos (< 3 s) entre eles — nada de legenda solta
    tr.sort((x, y) => x[0] - y[0]);
    const out = [];
    for (const [a, b] of tr) { const u = out[out.length - 1]; if (u && a - u[1] < 3.0) u[1] = Math.max(u[1], b); else out.push([a, b]); }   // legenda só volta se puder ficar 3 s+
    if (out.length && out[0][0] < 1.5) out[0][0] = -1;
    ESCONDE = out;
    window.LEGENDA_ESCONDIDA = out.map(([a, b]) => [+a.toFixed(2), +b.toFixed(2)]);
  };
  FM.depois = t => { FM.confete(t); FM.legenda(t); FM.ehAzulAgora = FM.ehAzul(t); legendaBranca(); };
  window.FM = FM;
})();
