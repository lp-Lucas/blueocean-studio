/* Modelo da linha do tempo — usado pelo preview (navegador) e pela exportação (Node).
   Tudo que é geometria ou layout mora aqui, para o que aparece na tela ser o que sai no vídeo.

   projeto.json
   ─────────────
   formato  {w, h, fps}
   midias   { m1: {nome, arquivo, tipo: video|imagem|audio, dur, w, h, fps, audio, ...} }
   faixas   [ {id, tipo: video|audio|texto|efeito, itens: [...]} ]   (a primeira faixa de vídeo fica embaixo)
     item de vídeo/imagem/áudio:
       {id, midia, inicio, entrada, saida, caixa:{x,y,w,h}, zoom, foco:{x,y}, volume, entra, sai}
       inicio = onde começa na linha do tempo; entrada/saida = trecho do arquivo (segundos)
       caixa = retângulo na tela onde o vídeo aparece; o vídeo cobre a caixa (zoom 1) e foco escolhe o que aparece
       entra/sai = fade de opacidade (segundos)
       zooms = [{t, z}] zoom animado (opcional): t em segundos desde o início do item, z = zoom naquele ponto;
       entre dois pontos a curva é suave (ease in-out). Sem zooms vale o zoom fixo. Use z >= 1.
     item de texto (headline):
       {id, inicio, fim, texto, estilo, x, y, tam, fonte, cor, fundo, papel, contorno, largura, entrelinha,
        alinhamento, maiusculas, animacao}
       estilo: "papel" (papel rasgado azul, o padrão das headlines) | "faixa" | "caixa" | "contorno" | "limpo"
       texto aceita **negrito** em partes. x,y = centro do bloco. fonte = id do arquivo da fonte
       (ex. "InstrumentSans-SemiBold"; a lista das fontes do computador está na aba Ajustes).
     faixa de qualificação (fica na faixa de textos):
       {id, tipo: "qualificacao", inicio, fim, texto, y, altura, cor, logo, fonte, tam, entrelinha,
        entrada: "parada" | "esquerda", durEntrada}
       barra azul da largura da tela com o logo BLUE OCEAN, divisória e o texto (use **negrito** no público:
       "Para **SAAS B2B** que já faturam acima de **R$30mil** de MRR"). y = topo da barra.
       entrada "esquerda": desliza de fora da tela até encaixar, linear, em durEntrada (1,33 s) a partir do início.
     item de efeito:
       {id, efeito: "lightleak", inicio, dur, intensidade}
   legenda  {ativa, tam, pos, palavras, maiusculas, cor, caixa, fonte, trechos}   (padrão Blue Ocean)
            trechos: [{de, ate, pos}] = outra altura (pos %) entre de e ate (s da linha do tempo)
            as palavras vêm de transcricoes/<mídia>.json: [{t, i, f, p}] (+ "oculta": true = fora da legenda)
   Num projeto com composições, cada vídeo é um arquivo composicoes/<id>.json com formato, faixas,
   legenda e audio; as mídias ficam no projeto.json e valem para todas.
   audio    {normalizar, lufs, limpar, voz} */
(function (raiz) {
  const EFEITOS = {
    // flash de luz azul em modo Tela; o pico fica 0,2 s depois do início → comece 0,2 s antes do corte
    lightleak: { arquivo: 'assets/lightleak-azul.mp4', dur: 0.633, pico: 0.2, nome: 'Light leak azul' },
  };
  const IMAGENS = { papel: 'assets/papel-rasgado.png', logo: 'assets/logo-blueocean-branco.png' };

  /* ── fontes ──
     O catálogo (fontes do computador) chega de fora com definirFontes. winA/winD: o libass dimensiona
     a fonte pela altura Windows (winAscent+winDescent), não pelo "em" — o preview usa a mesma conta. */
  const RESERVA = { id: 'Montserrat-Bold', nome: 'Montserrat Bold', grupo: 'Montserrat', estilo: 'Bold', peso: 700, italico: false, winA: 1109, winD: 453, upem: 1000, arquivo: null };
  const ALIAS = { Montserrat: 'Montserrat-Bold', Outfit: 'Outfit-Regular' };
  const FONTE_PADRAO = 'InstrumentSans-SemiBold';
  let FONTES = { [RESERVA.id]: RESERVA };
  function definirFontes(lista) { FONTES = { [RESERVA.id]: RESERVA }; for (const e of lista || []) FONTES[e.id] = e; }
  const idFonte = id => { id = ALIAS[id] || id; return FONTES[id] ? id : FONTES[FONTE_PADRAO] ? FONTE_PADRAO : RESERVA.id; };
  const fonte = id => FONTES[idFonte(id)];
  /* a versão negrito da mesma família (o mais perto de 700, acima do peso atual) */
  function negritoDe(id) {
    const f = fonte(id);
    const irmas = Object.values(FONTES).filter(e => e.grupo === f.grupo && e.italico === f.italico && e.peso > f.peso);
    if (!irmas.length) return f.id;
    irmas.sort((a, b) => Math.abs(a.peso - 700) - Math.abs(b.peso - 700));
    return irmas[0].id;
  }
  const emDe = (id, tam) => { const f = fonte(id); return tam * f.upem / (f.winA + f.winD); };
  const baseDe = (id, tam) => { const f = fonte(id); return tam * (f.winA / (f.winA + f.winD) - 0.5); };

  let seqId = 0;
  const novoId = p => { const r = Math.random().toString(36).slice(2, 6); return p + (++seqId).toString(36) + r; };
  const num = (v, d) => (v == null || v === '' || isNaN(+v)) ? d : +v;

  /* estilos prontos de headline (tam/posições numa tela de 1080 de largura) */
  const ESTILOS = {
    papel: { nome: 'Papel rasgado', fonte: 'InstrumentSans-SemiBold', tam: 82, cor: '#FFFFFF', contorno: 2, fundo: null, papel: true, entrelinha: 0.85 },
    faixa: { nome: 'Faixa azul', fonte: 'InstrumentSans-SemiBold', tam: 76, cor: '#FFFFFF', contorno: 0, fundo: '#0137FF', papel: false, entrelinha: 1 },
    caixa: { nome: 'Caixa branca', fonte: 'InstrumentSans-SemiBold', tam: 76, cor: '#0A0F1E', contorno: 0, fundo: '#FFFFFF', papel: false, entrelinha: 1 },
    contorno: { nome: 'Contorno', fonte: 'InstrumentSans-Bold', tam: 84, cor: '#FFFFFF', contorno: 6, fundo: null, papel: false, entrelinha: 0.95 },
    limpo: { nome: 'Limpo', fonte: 'InstrumentSans-SemiBold', tam: 80, cor: '#FFFFFF', contorno: 0, fundo: null, papel: false, entrelinha: 0.95 },
  };

  function normalizar(p) {
    p.formato = p.formato || {};
    p.formato.w = num(p.formato.w, 1080); p.formato.h = num(p.formato.h, 1920); p.formato.fps = num(p.formato.fps, 30);
    const { w: W, h: H } = p.formato, k = W / 1080;
    p.midias = p.midias || {};
    p.faixas = Array.isArray(p.faixas) ? p.faixas : [];
    const ids = new Set();
    for (const f of p.faixas) {
      f.tipo = f.tipo || 'video';
      f.id = f.id || novoId(f.tipo[0].toUpperCase());
      f.itens = Array.isArray(f.itens) ? f.itens : [];
      for (const it of f.itens) {
        if (!it.id || ids.has(it.id)) it.id = novoId(f.tipo === 'texto' ? 't' : f.tipo === 'efeito' ? 'fx' : 'c');
        ids.add(it.id);
        it.inicio = Math.max(0, num(it.inicio, 0));
        if (f.tipo === 'video' || f.tipo === 'audio') {
          const m = p.midias[it.midia] || {};
          it.entrada = Math.max(0, num(it.entrada, 0));
          it.saida = num(it.saida, m.dur || it.entrada + 5);
          if (m.tipo !== 'imagem' && m.dur) it.saida = Math.min(it.saida, m.dur);
          if (it.saida <= it.entrada) it.saida = it.entrada + 0.1;
          it.volume = num(it.volume, 1);
          if (f.tipo === 'video') {
            const c = it.caixa || {};
            it.caixa = { x: num(c.x, 0), y: num(c.y, 0), w: Math.max(2, num(c.w, W)), h: Math.max(2, num(c.h, H)) };
            it.zoom = Math.max(0.05, num(it.zoom, 1));
            it.foco = { x: num(it.foco?.x, 0.5), y: num(it.foco?.y, 0.5) };
            if (Array.isArray(it.zooms) && it.zooms.length) {
              it.zooms = it.zooms.map(k => ({ t: Math.max(0, num(k.t, 0)), z: Math.max(0.05, num(k.z, it.zoom)) })).sort((a, b) => a.t - b.t);
            } else delete it.zooms;
          }
          it.entra = Math.max(0, num(it.entra, 0)); it.sai = Math.max(0, num(it.sai, 0));
        } else if (f.tipo === 'texto' && it.tipo === 'qualificacao') {
          it.fim = Math.max(it.inicio + 0.1, num(it.fim, it.inicio + 5));
          it.texto = String(it.texto ?? 'Para **SAAS B2B** que já faturam acima de **R$30mil** de MRR');
          it.y = num(it.y, Math.round(216 * H / 1920)); it.altura = Math.max(40, num(it.altura, Math.round(171 * k)));
          it.cor = it.cor || '#003AFE'; it.logo = it.logo !== false;
          it.fonte = it.fonte || 'InstrumentSans-Regular'; it.tam = num(it.tam, Math.round(56 * k)); it.entrelinha = num(it.entrelinha, 0.86);
          it.entrada = it.entrada === 'esquerda' ? 'esquerda' : 'parada'; it.durEntrada = Math.max(0.05, num(it.durEntrada, 1.33));
          it.maiusculas = !!it.maiusculas;
        } else if (f.tipo === 'texto') {
          it.fim = Math.max(it.inicio + 0.1, num(it.fim, it.inicio + 3));
          it.texto = String(it.texto ?? 'Texto');
          it.estilo = ESTILOS[it.estilo] ? it.estilo : (it.papel ? 'papel' : it.fundo ? 'faixa' : 'limpo');
          it.x = num(it.x, W / 2); it.y = num(it.y, H * 0.2);
          it.tam = num(it.tam, 80); it.fonte = it.fonte || FONTE_PADRAO;
          it.cor = it.cor || '#FFFFFF'; it.fundo = it.fundo || null; it.papel = !!it.papel; it.contorno = num(it.contorno, 0);
          it.largura = num(it.largura, W * 0.85); it.entrelinha = num(it.entrelinha, 1); it.maiusculas = !!it.maiusculas;
          it.alinhamento = it.alinhamento === 'esquerda' ? 'esquerda' : 'centro';
          it.animacao = it.animacao || null;
        } else if (f.tipo === 'efeito') {
          it.efeito = EFEITOS[it.efeito] ? it.efeito : 'lightleak';
          it.dur = num(it.dur, EFEITOS[it.efeito].dur);
          it.intensidade = num(it.intensidade, 1);
        }
      }
      f.itens.sort((a, b) => a.inicio - b.inicio);
    }
    for (const t of ['video', 'texto', 'efeito'])
      if (!p.faixas.some(f => f.tipo === t)) p.faixas.push({ id: t === 'video' ? 'V1' : t === 'texto' ? 'T1' : 'FX', tipo: t, itens: [] });
    const L = p.legenda = p.legenda || {};
    L.ativa = !!L.ativa; L.tam = num(L.tam, 72); L.pos = num(L.pos, 72); L.palavras = Math.max(1, num(L.palavras, 3));
    L.maiusculas = !!L.maiusculas; L.cor = L.cor || '#FFFFFF'; L.caixa = L.caixa || '#0137FF'; L.fonte = L.fonte || 'Montserrat-Bold';
    const A = p.audio = p.audio || {};
    A.normalizar = A.normalizar !== false; A.lufs = num(A.lufs, -14); A.limpar = !!A.limpar; A.voz = !!A.voz;
    return p;
  }
  /* aplica um estilo de headline a um item de texto (tamanho na escala da tela) */
  function aplicarEstilo(it, nome, W = 1080) {
    const e = ESTILOS[nome]; if (!e) return it;
    const k = W / 1080;
    Object.assign(it, { estilo: nome, fonte: e.fonte, tam: Math.round(e.tam * k), cor: e.cor, contorno: e.contorno, fundo: e.fundo, papel: e.papel, entrelinha: e.entrelinha });
    return it;
  }

  function fimItem(f, it) {
    if (f.tipo === 'texto') return it.fim;
    if (f.tipo === 'efeito') return it.inicio + it.dur;
    return it.inicio + (it.saida - it.entrada);
  }
  function duracao(p) {
    let d = 0;
    for (const f of p.faixas) for (const it of f.itens) d = Math.max(d, fimItem(f, it));
    return d;
  }

  /* onde o vídeo cai dentro da caixa: cobre a caixa (zoom 1), foco escolhe o pedaço visível */
  /* zoom do item no instante t da linha do tempo (zooms: pontos com curva suave entre eles) */
  const suave = u => u * u * (3 - 2 * u);
  function zoomEm(it, t) {
    const ks = it.zooms;
    if (!ks || !ks.length || t == null) return it.zoom;
    const d = t - it.inicio;
    if (d <= ks[0].t) return ks[0].z;
    for (let i = 1; i < ks.length; i++) {
      const a = ks[i - 1], b = ks[i];
      if (d < b.t) return a.z + (b.z - a.z) * suave((d - a.t) / Math.max(1e-6, b.t - a.t));
    }
    return ks.at(-1).z;
  }
  function geometria(it, m, t) {
    const c = it.caixa;
    const mw = m.w || 1080, mh = m.h || 1920;
    const s = Math.max(c.w / mw, c.h / mh) * zoomEm(it, t);
    const sw = mw * s, sh = mh * s;
    return { c, s, sw, sh, ox: (c.w - sw) * it.foco.x, oy: (c.h - sh) * it.foco.y };
  }
  function opacidade(f, it, t) {
    const d0 = t - it.inicio, d1 = fimItem(f, it) - t;
    let a = 1;
    if (it.entra > 0 && d0 < it.entra) a = Math.min(a, Math.max(0, d0 / it.entra));
    if (it.sai > 0 && d1 < it.sai) a = Math.min(a, Math.max(0, d1 / it.sai));
    return a;
  }

  /* ── legenda ── */
  function palavrasLinha(p, trans) {
    const out = [];
    for (const f of p.faixas) {
      if (f.tipo !== 'video' && f.tipo !== 'audio') continue;
      for (const it of f.itens) {
        const m = p.midias[it.midia];
        if (!m || !m.audio || !(it.volume > 0) || it.legenda === false) continue;
        const ws = trans[it.midia];
        if (!Array.isArray(ws)) continue;
        ws.forEach((w, idx) => {
          const t = String(w.t || '').trim().replace(/[{}\\]/g, '');
          if (!t || w.oculta) return;   // palavra escondida na tela de transcrição não entra na legenda
          const meio = (w.i + w.f) / 2;
          if (meio < it.entrada || meio > it.saida) return;
          out.push({ t, i: it.inicio + Math.max(w.i, it.entrada) - it.entrada, f: it.inicio + Math.min(w.f, it.saida) - it.entrada, midia: it.midia, idx });
        });
      }
    }
    return out.sort((a, b) => a.i - b.i);
  }
  function quadrosLegenda(p, trans) {
    const L = p.legenda, PAUSA = 0.55, RABO = 0.35;
    const ws = palavrasLinha(p, trans).map(w => ({ ...w, t: L.maiusculas ? w.t.toUpperCase() : w.t, fimFrase: /[.?!…]$/.test(w.t) }));
    const blocos = []; let g = [];
    for (const w of ws) {
      const u = g.at(-1);
      if (u && (u.fimFrase || w.i - u.f > PAUSA || g.length >= L.palavras)) { blocos.push(g); g = []; }
      g.push(w);
    }
    if (g.length) blocos.push(g);
    const quadros = [];
    blocos.forEach((bl, b) => {
      const prox = blocos[b + 1];
      const fimBloco = Math.min(bl.at(-1).f + RABO, prox ? prox[0].i : 1e9);
      bl.forEach((w, q) => quadros.push({
        ini: w.i, fim: Math.max(q < bl.length - 1 ? bl[q + 1].i : fimBloco, w.i + 0.06),
        texto: bl.map(o => o.t), k: q,
      }));
    });
    return quadros;
  }
  /* medir(texto, fonte, tam) → {largura, esq, dir} em px do projeto */
  function layoutLegenda(p, q, medir) {
    const L = p.legenda, { w: W, h: H } = p.formato;
    const k = (L.tam / 72) * (W / 1080);
    const tam = L.tam * W / 1080;
    // legenda.trechos: [{de, ate, pos}] muda a altura num pedaço do vídeo (ex.: tirar a legenda da frente do rosto)
    const tr = Array.isArray(L.trechos) ? L.trechos.find(t => q.ini >= t.de && q.ini < t.ate) : null;
    const X = W / 2, Y = H * (tr ? num(tr.pos, L.pos) : L.pos) / 100;
    const linha = q.texto.join(' ');
    const larg = medir(linha, L.fonte, tam).largura;
    const x0 = X - larg / 2;
    const antes = q.k > 0 ? q.texto.slice(0, q.k).join(' ') + ' ' : '';
    const px = antes ? medir(antes, L.fonte, tam).largura : 0;
    const m = medir(q.texto[q.k], L.fonte, tam);
    const PADX = 10 * k, ALT = 74 * k, RAIO = 15 * k, DESLOC = 7 * k;
    const cx0 = x0 + px - m.esq - PADX, cx1 = x0 + px + m.dir + PADX;
    return { linha, X, Y, tam, base: Y + baseDe(L.fonte, tam), x0, caixa: { x: cx0, y: Y + DESLOC - ALT / 2, w: cx1 - cx0, h: ALT, r: RAIO } };
  }

  /* ── texto com **negrito**: quebra em linhas pela largura, cada linha é uma sequência de trechos ── */
  function trechos(txt, fonteN, fonteB) {
    const out = [];
    String(txt).split(/(\*\*[^*]+\*\*)/).forEach(p => {
      if (!p) return;
      const b = p.startsWith('**') && p.endsWith('**') && p.length > 4;
      out.push({ t: b ? p.slice(2, -2) : p, fonte: b ? fonteB : fonteN });
    });
    return out;
  }
  function quebrar(txt, fonteId, tam, largMax, medir, maiusculas) {
    const fB = negritoDe(fonteId);
    const linhas = [];
    for (const par of String(maiusculas ? txt.toUpperCase() : txt).split('\n')) {
      // palavras com a fonte de cada uma
      const pals = [];
      for (const tr of trechos(par, fonteId, fB)) {
        const partes = tr.t.split(/(\s+)/);
        for (const pt of partes) {
          if (!pt) continue;
          if (/^\s+$/.test(pt)) { if (pals.length) pals.at(-1).espaco = true; continue; }
          const ult = pals.at(-1);
          if (ult && !ult.espaco && ult.fonte !== tr.fonte) { ult.cola = ult.cola || []; ult.cola.push({ t: pt, fonte: tr.fonte }); continue; }
          pals.push({ t: pt, fonte: tr.fonte });
        }
      }
      const largPal = w => medir(w.t, w.fonte, tam).largura + (w.cola || []).reduce((s, c) => s + medir(c.t, c.fonte, tam).largura, 0);
      const espaco = f => medir(' ', f, tam).largura;
      let atual = [], larg = 0;
      for (const w of pals) {
        const lw = largPal(w);
        const extra = atual.length ? espaco(atual.at(-1).fonte) : 0;
        if (atual.length && larg + extra + lw > largMax) { linhas.push(atual); atual = []; larg = 0; }
        larg += (atual.length ? espaco(atual.at(-1).fonte) : 0) + lw;
        atual.push(w);
      }
      linhas.push(atual);
    }
    // cada linha → trechos contínuos na mesma fonte (o espaço fica no fim do trecho anterior)
    return linhas.map(ws => {
      const runs = [];
      const add = (t, f) => { const u = runs.at(-1); if (u && u.fonte === f) u.texto += t; else runs.push({ texto: t, fonte: f }); };
      ws.forEach((w, i) => {
        add(w.t, w.fonte);
        for (const c of w.cola || []) add(c.t, c.fonte);
        if (i < ws.length - 1) add(' ', (w.cola?.at(-1) || w).fonte);
      });
      let x = 0;
      for (const r of runs) { r.dx = x; r.largura = medir(r.texto, r.fonte, tam).largura; x += r.largura; }
      return { runs, largura: x };
    });
  }
  /* blocos de linhas: alinhamento centro (em x) ou esquerda (a partir de x) */
  function blocoLinhas(linhas, x, yCentro, tam, entrelinha, alinhamento, fonteId) {
    const passo = tam * entrelinha, n = linhas.length;
    const h = (n - 1) * passo + tam, topo = yCentro - h / 2;
    const ls = linhas.map((l, i) => {
      const x0 = alinhamento === 'esquerda' ? x : x - l.largura / 2;
      const t = topo + i * passo;
      return { ...l, x0, topo: t, cx: x0 + l.largura / 2, cy: t + tam / 2, base: t + tam / 2 + baseDe(fonteId, tam) };
    });
    const larg = Math.max(0, ...ls.map(l => l.largura));
    const bx = alinhamento === 'esquerda' ? x : x - larg / 2;
    return { linhas: ls, caixa: { x: bx, y: topo, w: larg, h } };
  }
  function layoutTexto(it, medir) {
    const b = blocoLinhas(quebrar(it.texto, it.fonte, it.tam, it.largura, medir, it.maiusculas), it.x, it.y, it.tam, it.entrelinha, it.alinhamento, it.fonte);
    const pad = it.tam * 0.22;
    b.linhas.forEach(l => { l.caixa = { x: l.x0 - pad, y: l.topo + it.tam * 0.06, w: l.largura + pad * 2, h: it.tam * 0.94, r: it.tam * 0.16 }; });
    if (it.papel) {
      // proporção do papel da headline aprovada: folga lateral ≈ 2,07× o corpo, vertical ≈ 0,46×
      const c = b.caixa, fx = it.tam * 2.07, fy = it.tam * 0.46;
      b.imagem = { arquivo: IMAGENS.papel, x: c.x - fx, y: c.y - fy, w: c.w + fx * 2, h: c.h + fy * 2 };
    }
    return b;
  }
  /* faixa de qualificação: medidas tiradas da faixa aprovada (barra de 171 px numa tela de 1080) */
  function layoutFaixa(it, W, medir) {
    const k = it.altura / 171;
    const barra = { x: 0, y: it.y, w: W, h: it.altura };
    const logo = it.logo ? { arquivo: IMAGENS.logo, x: 64 * k, y: it.y + (it.altura - 84 * k) / 2, w: 181 * k, h: 84 * k } : null;
    const div = it.logo ? { x: 281 * k, y: it.y + 18 * k, w: Math.max(1, 2 * k), h: 135 * k } : null;
    const xt = it.logo ? 324 * k : 48 * k;
    const b = blocoLinhas(quebrar(it.texto, it.fonte, it.tam, W - xt - 30 * k, medir, it.maiusculas), xt, it.y + it.altura / 2, it.tam, it.entrelinha, 'esquerda', it.fonte);
    return { barra, logo, div, ...b };
  }
  /* deslocamento horizontal da entrada "desliza da esquerda" (linear, igual à referência) */
  function deslize(it, W, t) {
    if (it.entrada !== 'esquerda') return 0;
    const p = (t - it.inicio) / it.durEntrada;
    return p >= 1 ? 0 : p <= 0 ? -W : -W * (1 - p);
  }

  /* ── exportação: dois .ass (fundos das faixas e a frente com textos e legenda) + as imagens entre eles ── */
  const corAss = (h, alfa = 0) => {
    const m = String(h || '#FFFFFF').replace('#', '').padEnd(6, '0');
    return `&H${alfa.toString(16).padStart(2, '0').toUpperCase()}${m.slice(4, 6)}${m.slice(2, 4)}${m.slice(0, 2)}&`.toUpperCase();
  };
  const tempoAss = s => { s = Math.max(0, s); const cs = Math.round(s * 100); return `${Math.floor(cs / 360000)}:${String(Math.floor(cs / 6000) % 60).padStart(2, '0')}:${String(Math.floor(cs / 100) % 60).padStart(2, '0')}.${String(cs % 100).padStart(2, '0')}`; };
  const retangulo = (a, b, c, d, raio) => {
    [a, b, c, d] = [a, b, c, d].map(v => Math.round(v));
    const R = Math.round(Math.min(raio, (c - a) / 2, (d - b) / 2));
    if (R <= 0) return `m ${a} ${b} l ${c} ${b} l ${c} ${d} l ${a} ${d}`;
    return [`m ${a + R} ${b}`, `l ${c - R} ${b}`, `b ${c} ${b} ${c} ${b} ${c} ${b + R}`, `l ${c} ${d - R}`,
      `b ${c} ${d} ${c} ${d} ${c - R} ${d}`, `l ${a + R} ${d}`, `b ${a} ${d} ${a} ${d} ${a} ${d - R}`,
      `l ${a} ${b + R}`, `b ${a} ${b} ${a} ${b} ${a + R} ${b}`].join(' ');
  };
  const escAss = s => String(s).replace(/[{}\\]/g, '');
  const tagFonte = (id, tam) => { const f = fonte(id); return `\\fn${f.nome}\\fs${Math.round(tam * 100) / 100}\\b${f.peso}\\i${f.italico ? 1 : 0}`; };
  const cabecalho = (W, H) => `[Script Info]
ScriptType: v4.00+
PlayResX: ${W}
PlayResY: ${H}
WrapStyle: 2
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: B,Montserrat,72,&H00FFFFFF&,&H00FFFFFF&,&H00000000&,&H00000000&,0,0,0,0,100,100,0,0,1,0,0,5,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  function gerarExportacao(p, trans, medir, ini = 0, fim = 1e9) {
    const { w: W, h: H } = p.formato;
    const fundo = [], frente = [], imagens = [], fontes = new Set();
    const janela = (a, b) => { const x = Math.max(a, ini), y = Math.min(b, fim); return y > x ? [x - ini, y - ini] : null; };
    const linhaAss = (l, tam, cor, extra, pos) => {
      for (const r of l.runs) fontes.add(idFonte(r.fonte));
      return `{\\an5${pos}\\1c${corAss(cor)}${extra}}` + l.runs.map(r => `{${tagFonte(r.fonte, tam)}}${escAss(r.texto)}`).join('');
    };
    // movimento da entrada da faixa (\move é linear, igual ao preview)
    const movimento = (it, x, y, a) => {
      if (it.entrada !== 'esquerda') return `\\pos(${Math.round(x)},${Math.round(y)})`;
      const t0 = a + ini, fimMov = it.inicio + it.durEntrada;
      if (t0 >= fimMov) return `\\pos(${Math.round(x)},${Math.round(y)})`;
      const dx = deslize(it, W, t0);
      return `\\move(${Math.round(x + dx)},${Math.round(y)},${Math.round(x)},${Math.round(y)},0,${Math.round((fimMov - t0) * 1000)})`;
    };
    p.faixas.filter(f => f.tipo === 'texto').forEach((f, fi) => {
      for (const it of f.itens) {
        const j = janela(it.inicio, it.fim); if (!j) continue;
        const [a, b] = j.map(tempoAss);
        const camada = 10 + fi * 3;
        if (it.tipo === 'qualificacao') {
          const L = layoutFaixa(it, W, medir);
          fundo.push(`Dialogue: ${camada},${a},${b},B,,0,0,0,,{\\an7${movimento(it, 0, 0, j[0])}\\p1\\bord0\\shad0\\1c${corAss(it.cor)}}${retangulo(0, L.barra.y, W, L.barra.y + L.barra.h, 0)}{\\p0}`);
          if (L.div) fundo.push(`Dialogue: ${camada + 1},${a},${b},B,,0,0,0,,{\\an7${movimento(it, 0, 0, j[0])}\\p1\\bord0\\shad0\\1c&HFFFFFF&\\1a&H90&}${retangulo(L.div.x, L.div.y, L.div.x + L.div.w, L.div.y + L.div.h, 0)}{\\p0}`);
          if (L.logo) imagens.push({ ...L.logo, ini: j[0], fim: j[1], desliza: it.entrada === 'esquerda' ? { t0: it.inicio - ini, dur: it.durEntrada, dx: -W } : null });
          for (const l of L.linhas) frente.push(`Dialogue: ${camada + 1},${a},${b},B,,0,0,0,,${linhaAss(l, it.tam, '#FFFFFF', '\\bord0\\shad0', movimento(it, l.cx, l.cy, j[0]))}`);
          continue;
        }
        const anim = it.animacao === 'pop' && it.inicio >= ini ? '\\fscx85\\fscy85\\t(0,90,\\fscx100\\fscy100)'
          : it.animacao === 'fade' && it.inicio >= ini ? '\\fad(150,0)' : '';
        const L = layoutTexto(it, medir);
        if (L.imagem) imagens.push({ ...L.imagem, ini: j[0], fim: j[1], desliza: null });
        if (it.fundo) for (const l of L.linhas) {
          const c = l.caixa;
          frente.push(`Dialogue: ${camada},${a},${b},B,,0,0,0,,{\\an7\\pos(0,0)\\p1\\bord0\\shad0\\1c${corAss(it.fundo)}${it.animacao === 'fade' ? '\\fad(150,0)' : ''}}${retangulo(c.x, c.y, c.x + c.w, c.y + c.h, c.r)}{\\p0}`);
        }
        const bord = it.contorno > 0 ? `\\bord${it.contorno}\\3c${corAss('#000000')}` : '\\bord0';
        for (const l of L.linhas) frente.push(`Dialogue: ${camada + 1},${a},${b},B,,0,0,0,,${linhaAss(l, it.tam, it.cor, bord + '\\shad0' + anim, `\\pos(${Math.round(l.cx)},${Math.round(l.cy)})`)}`);
      }
    });
    if (p.legenda.ativa) {
      const L = p.legenda;
      fontes.add(idFonte(L.fonte));
      for (const q of quadrosLegenda(p, trans)) {
        const j = janela(q.ini, q.fim); if (!j) continue;
        const [a, b] = j.map(tempoAss);
        const lay = layoutLegenda(p, q, medir), c = lay.caixa;
        frente.push(`Dialogue: 0,${a},${b},B,,0,0,0,,{\\an7\\pos(0,0)\\p1\\bord0\\shad0\\1c${corAss(L.caixa)}}${retangulo(c.x, c.y, c.x + c.w, c.y + c.h, c.r)}{\\p0}`);
        frente.push(`Dialogue: 1,${a},${b},B,,0,0,0,,{\\an5\\pos(${Math.round(lay.X)},${Math.round(lay.Y)})${tagFonte(L.fonte, lay.tam)}\\1c${corAss(L.cor)}\\bord0\\shad0}${escAss(lay.linha)}`);
      }
    }
    const doc = ev => ev.length ? cabecalho(W, H) + ev.join('\n') + '\n' : '';
    return { fundo: doc(fundo), frente: doc(frente), imagens, fontes: [...fontes] };
  }

  const M = { EFEITOS, IMAGENS, ESTILOS, FONTE_PADRAO, definirFontes, fonte, idFonte, negritoDe, emDe, baseDe, normalizar, aplicarEstilo, fimItem, duracao, geometria, zoomEm, opacidade,
    palavrasLinha, quadrosLegenda, layoutLegenda, layoutTexto, layoutFaixa, deslize, gerarExportacao, novoId,
    get FONTES() { return FONTES; } };
  if (typeof module !== 'undefined' && module.exports) module.exports = M; else raiz.Modelo = M;
})(typeof window !== 'undefined' ? window : globalThis);
