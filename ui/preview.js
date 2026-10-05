/* Preview ao vivo: desenha a linha do tempo num canvas, quadro a quadro, igual à exportação.
   Um <video> por (mídia, faixa): corte emendado na mesma faixa continua tocando sem pulo.
   Por cima, o canvas "sobre" mostra seleção, alças e guias, e recebe o mouse:
     arrastar = mover · alças = redimensionar · Alt+arrastar (ou botão direito) = enquadrar · roda = zoom */
const PV = (() => {
  const tela = $('#tela'), sobre = $('#sobre'), moldura = $('#moldura');
  const ctx = tela.getContext('2d', { alpha: false });
  const octx = sobre.getContext('2d');
  const players = new Map();   // chave → {el, src, usado}
  const imagens = new Map();   // midia → Image
  const leaks = new Map();     // item → video
  const ultimo = new Map();    // faixa → canvas com o último quadro bom (cobre o instante do seek num corte)
  let escala = 1, ox = 0, oy = 0, dpr = devicePixelRatio || 1;
  let sujo = true, relogio = null;
  let quadrosLeg = [], legSujo = true;
  let arraste = null, hover = null, guiasIma = [];

  /* ── tamanho ── */
  function dimensionar() {
    if (!S.projeto) return;
    const { w: W, h: H } = S.projeto.formato;
    const r = moldura.getBoundingClientRect();
    escala = Math.min((r.width - 40) / W, (r.height - 36) / H);
    const cw = Math.round(W * escala), ch = Math.round(H * escala);
    ox = Math.round((r.width - cw) / 2); oy = Math.round((r.height - ch) / 2);
    if (tela.width !== W || tela.height !== H) { tela.width = W; tela.height = H; }
    for (const c of [tela, sobre]) Object.assign(c.style, { width: cw + 'px', height: ch + 'px', left: ox + 'px', top: oy + 'px' });
    dpr = devicePixelRatio || 1;
    sobre.width = Math.round(cw * dpr); sobre.height = Math.round(ch * dpr);
    sujo = true;
  }
  new ResizeObserver(dimensionar).observe(moldura);

  /* ── players ── */
  // WebM VP9 (peça de motion com transparência) toca sempre o original: o proxy H.264 não tem alfa
  const srcDe = id => { const m = S.projeto.midias[id]; const alfa = m?.codec === 'vp9' && /\.webm$/i.test(m.arquivo || '');
    return urlMidia((!alfa && S.midia[id]?.proxy) || m?.arquivo, id); };
  function player(chave, id) {
    const src = srcDe(id);
    let p = players.get(chave);
    if (p && p.src === src) return p;
    const t0 = p ? p.el.currentTime : 0;
    if (p) { p.el.pause(); p.el.removeAttribute('src'); p.el.load(); }
    const el = document.createElement('video');
    el.preload = 'auto'; el.playsInline = true; el.muted = true; el.src = src;
    if (t0) el.currentTime = t0;
    el.addEventListener('seeked', () => { sujo = true; });
    el.addEventListener('loadeddata', () => { sujo = true; });
    el.addEventListener('error', () => { p.erro = true; sujo = true; });
    p = { el, src, id, erro: false };
    players.set(chave, p);
    return p;
  }
  function imagem(id) {
    const src = urlMidia(S.projeto.midias[id]?.arquivo, id);
    let im = imagens.get(id);
    if (!im || im.dataset.src !== src) { im = new Image(); im.dataset.src = src; im.onload = () => { sujo = true; }; im.src = src; imagens.set(id, im); }
    return im;
  }
  const assets = new Map();
  function imagemAsset(rel) {
    let im = assets.get(rel);
    if (!im) { im = new Image(); im.onload = () => { sujo = true; }; im.src = '../' + rel; assets.set(rel, im); }
    return im;
  }
  function leak(it) {
    const e = M.EFEITOS[it.efeito];
    let v = leaks.get(it.id);
    if (!v) { v = document.createElement('video'); v.muted = true; v.preload = 'auto'; v.src = '../' + e.arquivo; v.addEventListener('seeked', () => { sujo = true; }); leaks.set(it.id, v); }
    return v;
  }
  function limparPlayers() {
    const vivos = new Set(), itens = new Set();
    for (const f of S.projeto?.faixas || []) for (const it of f.itens) { itens.add(it.id); if (it.midia) vivos.add(it.midia); }
    for (const [k, p] of players) if (!vivos.has(p.id)) { p.el.pause(); p.el.removeAttribute('src'); p.el.load(); players.delete(k); }
    for (const [k, v] of leaks) if (!itens.has(k)) { v.pause(); leaks.delete(k); }
  }

  /* ── sincronia: cada vídeo ativo vai para o ponto certo do arquivo ── */
  function sincronizar(t) {
    const p = S.projeto, fps = p.formato.fps;
    const usados = new Set();
    for (const f of p.faixas) {
      if (f.tipo !== 'video' && f.tipo !== 'audio') continue;
      let proximo = null;
      for (const it of f.itens) {
        const m = p.midias[it.midia];
        if (!m || m.tipo === 'imagem') continue;
        const fim = M.fimItem(f, it);
        const chaveBase = it.midia + '|' + f.id;
        if (t >= it.inicio && t < fim) {
          let chave = chaveBase, n = 1;
          while (usados.has(chave)) chave = chaveBase + '|' + (++n);
          usados.add(chave);
          const pl = player(chave, it.midia); const v = pl.el;
          pl.item = it.id;
          const alvo = it.entrada + (t - it.inicio);
          const a = M.opacidade(f, it, t);
          v.muted = S.mudo || !(it.volume > 0) || !S.tocando;
          v.volume = limitar(it.volume * a, 0, 1);
          if (S.tocando) {
            if (v.paused) { if (Math.abs(v.currentTime - alvo) > 0.05) v.currentTime = alvo; v.play().catch(() => {}); }
            else {
              const d = v.currentTime - alvo;
              if (Math.abs(d) > 0.3) { v.currentTime = alvo; v.playbackRate = 1; }
              else v.playbackRate = Math.abs(d) > 0.03 ? limitar(1 - d * 0.8, 0.85, 1.15) : 1;
            }
          } else {
            if (!v.paused) v.pause();
            if (!v.seeking && Math.abs(v.currentTime - alvo) > 0.45 / fps) v.currentTime = alvo;
          }
        } else if (it.inicio > t && (!proximo || it.inicio < proximo.it.inicio)) proximo = { it, chaveBase };
      }
      // pré-carrega o próximo item da faixa (se o player dele estiver livre)
      if (proximo && proximo.it.inicio - t < 1.2 && !usados.has(proximo.chaveBase)) {
        const pl = player(proximo.chaveBase, proximo.it.midia); const v = pl.el;
        if (!v.paused) v.pause();
        if (!v.seeking && Math.abs(v.currentTime - proximo.it.entrada) > 0.05) v.currentTime = proximo.it.entrada;
      }
    }
    for (const [k, pl] of players) if (!usados.has(k) && !pl.el.paused) pl.el.pause();
    for (const f of p.faixas) {
      if (f.tipo !== 'efeito') continue;
      for (const it of f.itens) {
        const v = leak(it); const vel = M.EFEITOS[it.efeito].dur / it.dur;
        const dentro = t >= it.inicio && t < it.inicio + it.dur;
        const alvo = (t - it.inicio) * vel;
        if (dentro && S.tocando) { v.playbackRate = vel; if (v.paused) { v.currentTime = Math.max(0, alvo); v.play().catch(() => {}); } }
        else { if (!v.paused) v.pause(); const a = dentro ? alvo : 0; if (!v.seeking && Math.abs(v.currentTime - a) > 0.02) v.currentTime = Math.max(0, a); }
      }
    }
  }

  /* ── desenho ── */
  function roundRect(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2))); }
  function desenhar(t) {
    const p = S.projeto, { w: W, h: H } = p.formato;
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const usados = new Set();
    for (const f of p.faixas) {
      if (f.tipo !== 'video') continue;
      for (const it of f.itens) {
        const m = p.midias[it.midia];
        if (!m || t < it.inicio || t >= M.fimItem(f, it)) continue;
        let fonte;
        if (m.tipo === 'imagem') { fonte = imagem(it.midia); if (!fonte.complete || !fonte.naturalWidth) continue; }
        else {
          const base = it.midia + '|' + f.id; let chave = base, n = 1;
          while (usados.has(chave)) chave = base + '|' + (++n);
          usados.add(chave);
          const pl = players.get(chave);
          if (pl && pl.el.readyState >= 2 && !pl.el.seeking) {
            fonte = pl.el;
            let c = ultimo.get(f.id);
            if (!c) { c = document.createElement('canvas'); ultimo.set(f.id, c); }
            if (c.width !== fonte.videoWidth || c.height !== fonte.videoHeight) { c.width = fonte.videoWidth; c.height = fonte.videoHeight; }
            c.getContext('2d').drawImage(fonte, 0, 0);
          } else {
            // player ainda pulando para o ponto do corte: repete o último quadro em vez de piscar preto
            fonte = ultimo.get(f.id);
            if (!fonte || !fonte.width) continue;
          }
        }
        const G = M.geometria(it, m, t);
        ctx.save();
        ctx.globalAlpha = M.opacidade(f, it, t);
        ctx.beginPath(); ctx.rect(G.c.x, G.c.y, G.c.w, G.c.h); ctx.clip();
        ctx.drawImage(fonte, G.c.x + G.ox, G.c.y + G.oy, G.sw, G.sh);
        ctx.restore();
      }
    }
    // textos e faixas de qualificação
    const linhaTexto = (l, tam, cor, contorno) => {
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.lineJoin = 'round';
      for (const r of l.runs) {
        ctx.font = fonteCss(r.fonte, tam);
        if (contorno > 0) { ctx.strokeStyle = '#000'; ctx.lineWidth = contorno * 2; ctx.strokeText(r.texto, l.x0 + r.dx, l.base); }
        ctx.fillStyle = cor; ctx.fillText(r.texto, l.x0 + r.dx, l.base);
      }
    };
    for (const f of p.faixas) {
      if (f.tipo !== 'texto') continue;
      for (const it of f.itens) {
        if (t < it.inicio || t >= it.fim) continue;
        ctx.save();
        if (it.tipo === 'qualificacao') {
          const L = M.layoutFaixa(it, W, medir);
          ctx.translate(M.deslize(it, W, t), 0);
          ctx.fillStyle = it.cor; ctx.fillRect(0, L.barra.y, W, L.barra.h);
          if (L.div) { ctx.fillStyle = 'rgba(255,255,255,.44)'; ctx.fillRect(L.div.x, L.div.y, L.div.w, L.div.h); }
          if (L.logo) { const im = imagemAsset(L.logo.arquivo); if (im.complete && im.naturalWidth) ctx.drawImage(im, L.logo.x, L.logo.y, L.logo.w, L.logo.h); }
          for (const l of L.linhas) linhaTexto(l, it.tam, '#FFFFFF', 0);
          ctx.restore();
          continue;
        }
        const dt = t - it.inicio;
        const L = M.layoutTexto(it, medir);
        if (L.imagem) { const im = imagemAsset(L.imagem.arquivo); if (im.complete && im.naturalWidth) ctx.drawImage(im, L.imagem.x, L.imagem.y, L.imagem.w, L.imagem.h); }
        if (it.animacao === 'pop' && dt < 0.09) { const s = 0.85 + 0.15 * dt / 0.09; ctx.translate(it.x, it.y); ctx.scale(s, s); ctx.translate(-it.x, -it.y); }
        if (it.animacao === 'fade' && dt < 0.15) ctx.globalAlpha = dt / 0.15;
        if (it.fundo) { ctx.fillStyle = it.fundo; for (const l of L.linhas) { const c = l.caixa; roundRect(ctx, c.x, c.y, c.w, c.h, c.r); ctx.fill(); } }
        for (const l of L.linhas) linhaTexto(l, it.tam, it.cor, it.contorno);
        ctx.restore();
      }
    }
    // legenda Blue Ocean
    if (p.legenda.ativa) {
      const q = quadroLegenda(t);
      if (q) {
        const lay = M.layoutLegenda(p, q, medir), c = lay.caixa;
        ctx.fillStyle = p.legenda.caixa; roundRect(ctx, c.x, c.y, c.w, c.h, c.r); ctx.fill();
        ctx.font = fonteCss(p.legenda.fonte, lay.tam); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = p.legenda.cor; ctx.fillText(lay.linha, lay.X, lay.base);
      }
    }
    // efeitos em modo Tela (clareia)
    for (const f of p.faixas) {
      if (f.tipo !== 'efeito') continue;
      for (const it of f.itens) {
        if (t < it.inicio || t >= it.inicio + it.dur) continue;
        const v = leaks.get(it.id); if (!v || v.readyState < 2) continue;
        ctx.save(); ctx.globalCompositeOperation = 'screen';
        const I = Math.max(0, it.intensidade);
        for (let k = I; k > 0.001; k -= 1) { ctx.globalAlpha = Math.min(1, k); ctx.drawImage(v, 0, 0, W, H); }
        ctx.restore();
      }
    }
  }
  function quadroLegenda(t) {
    if (legSujo) { quadrosLeg = M.quadrosLegenda(S.projeto, S.trans); legSujo = false; }
    let a = 0, b = quadrosLeg.length - 1;
    while (a <= b) { const m = (a + b) >> 1, q = quadrosLeg[m]; if (t < q.ini) b = m - 1; else if (t >= q.fim) a = m + 1; else return q; }
    return null;
  }

  /* ── sobreposição: seleção, alças, guias ── */
  // texto: cantos e laterais · faixa: só a de baixo (altura) · vídeo: todas
  const alcaValida = (b, fx, fy) => b.tipo === 'faixa' ? (fx === .5 && fy === 1) : b.tipo === 'texto' ? !(fx === .5) : true;
  const ALCAS = [['nw', 0, 0], ['n', .5, 0], ['ne', 1, 0], ['e', 1, .5], ['se', 1, 1], ['s', .5, 1], ['sw', 0, 1], ['w', 0, .5]];
  function caixaDe(sel, t) {
    const p = S.projeto;
    if (sel === 'legenda') {
      const q = quadroLegenda(t) || (quadrosLeg[0] ? { ...quadrosLeg[0] } : null);
      const L = p.legenda, k = L.tam / 72 * p.formato.w / 1080;
      if (q) { const c = M.layoutLegenda(p, q, medir); const l = medir(c.linha, L.fonte, c.tam); return { x: c.X - l.largura / 2 - 16, y: c.caixa.y - 8, w: l.largura + 32, h: c.caixa.h + 16, tipo: 'legenda' }; }
      const Y = p.formato.h * L.pos / 100; return { x: p.formato.w * 0.2, y: Y - 45 * k, w: p.formato.w * 0.6, h: 90 * k, tipo: 'legenda' };
    }
    const a = acharItem(sel); if (!a) return null;
    const { f, it } = a;
    if (t < it.inicio || t >= M.fimItem(f, it)) return null;
    if (f.tipo === 'video') return { ...it.caixa, tipo: 'video', f, it };
    if (f.tipo === 'texto' && it.tipo === 'qualificacao') {
      const dx = M.deslize(it, S.projeto.formato.w, t);
      return { x: dx, y: it.y, w: S.projeto.formato.w, h: it.altura, tipo: 'faixa', f, it };
    }
    if (f.tipo === 'texto') {
      const L = M.layoutTexto(it, medir), c = L.imagem || L.caixa, pad = L.imagem ? 0 : it.tam * 0.25;
      return { x: c.x - pad, y: c.y - pad * 0.4, w: c.w + pad * 2, h: c.h + pad * 0.8, tipo: 'texto', f, it };
    }
    return null;
  }
  function desenharSobre(t) {
    const c = octx, k = escala * dpr;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, sobre.width, sobre.height);
    if (!S.projeto) return;
    const { w: W, h: H } = S.projeto.formato;
    c.setTransform(k, 0, 0, k, 0, 0);
    const lw = 1 / escala;
    if (S.guias) {
      c.strokeStyle = 'rgba(255,255,255,.28)'; c.lineWidth = lw; c.setLineDash([6 * lw, 6 * lw]);
      c.strokeRect(W * 0.06, H * 0.115, W * 0.78, H * 0.66);   // área segura do Reels (sem os botões da direita e o rodapé)
      c.beginPath(); c.moveTo(W / 2, 0); c.lineTo(W / 2, H); c.moveTo(0, H / 2); c.lineTo(W, H / 2); c.stroke();
      c.setLineDash([]);
    }
    if (hover && !S.sel.has(hover) && !arraste) {
      const b = caixaDe(hover, S.t);
      if (b) { c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1 * lw; c.strokeRect(b.x, b.y, b.w, b.h); }
    }
    for (const id of S.sel) {
      const b = caixaDe(id, S.t); if (!b) continue;
      if (b.tipo === 'video' && arraste?.modo === 'foco') {
        const m = S.projeto.midias[b.it.midia], G = M.geometria(b.it, m);
        c.strokeStyle = 'rgba(255,255,255,.5)'; c.setLineDash([8 * lw, 6 * lw]); c.lineWidth = 1.5 * lw;
        c.strokeRect(G.c.x + G.ox, G.c.y + G.oy, G.sw, G.sh); c.setLineDash([]);
      }
      c.strokeStyle = '#3D7AFF'; c.lineWidth = 2 * lw; c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 6 * lw;
      c.strokeRect(b.x, b.y, b.w, b.h);
      if (b.tipo === 'legenda') {
        const hx = b.x + b.w / 2, hy = b.y;
        c.fillStyle = '#fff'; c.beginPath(); c.roundRect(hx - 18 * lw, hy - 5 * lw, 36 * lw, 10 * lw, 5 * lw); c.fill();
        continue;
      }
      const tam = 9 * lw;
      for (const [, fx, fy] of ALCAS) {
        if (!alcaValida(b, fx, fy)) continue;
        const x = b.x + b.w * fx, y = b.y + b.h * fy;
        c.fillStyle = '#fff'; c.strokeStyle = '#2D6BFF'; c.lineWidth = 1 * lw;
        c.beginPath(); c.roundRect(x - tam / 2, y - tam / 2, tam, tam, 2.5 * lw); c.fill(); c.stroke();
      }
    }
    c.shadowBlur = 0; c.strokeStyle = '#4A80FF'; c.lineWidth = 1 * lw;
    for (const g of guiasIma) { c.beginPath(); if (g.x != null) { c.moveTo(g.x, 0); c.lineTo(g.x, H); } else { c.moveTo(0, g.y); c.lineTo(W, g.y); } c.stroke(); }
  }

  /* ── mouse no canvas ── */
  const paraProjeto = e => { const r = sobre.getBoundingClientRect(); return { x: (e.clientX - r.left) / escala, y: (e.clientY - r.top) / escala }; };
  const dentro = (pt, b, m = 0) => pt.x >= b.x - m && pt.x <= b.x + b.w + m && pt.y >= b.y - m && pt.y <= b.y + b.h + m;
  function alvoEm(pt) {
    const p = S.projeto, t = S.t, m = 10 / escala;
    // alças do selecionado primeiro
    for (const id of S.sel) {
      const b = caixaDe(id, t); if (!b) continue;
      if (b.tipo === 'legenda') { if (dentro(pt, b, m)) return { id, b, alca: null }; continue; }
      for (const [nome, fx, fy] of ALCAS) {
        if (!alcaValida(b, fx, fy)) continue;
        const x = b.x + b.w * fx, y = b.y + b.h * fy;
        if (Math.abs(pt.x - x) <= m && Math.abs(pt.y - y) <= m) return { id, b, alca: nome };
      }
    }
    const txts = p.faixas.filter(f => f.tipo === 'texto').reverse();
    for (const f of txts) for (const it of [...f.itens].reverse()) { const b = caixaDe(it.id, t); if (b && dentro(pt, b)) return { id: it.id, b }; }
    if (p.legenda.ativa) { const b = caixaDe('legenda', t); if (b && dentro(pt, b)) return { id: 'legenda', b }; }
    const vids = p.faixas.filter(f => f.tipo === 'video').reverse();
    for (const f of vids) for (const it of [...f.itens].reverse()) { const b = caixaDe(it.id, t); if (b && dentro(pt, b)) return { id: it.id, b }; }
    return null;
  }
  const CURSOR = { nw: 'nwse-resize', se: 'nwse-resize', ne: 'nesw-resize', sw: 'nesw-resize', n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize' };

  sobre.addEventListener('contextmenu', e => e.preventDefault());
  sobre.addEventListener('pointerdown', e => {
    if (!S.projeto) return;
    const pt = paraProjeto(e);
    const a = alvoEm(pt);
    if (!a) { if (!e.shiftKey) { S.sel.clear(); emitir('selecao'); } return; }
    if (e.shiftKey) { S.sel.has(a.id) ? S.sel.delete(a.id) : S.sel.add(a.id); }
    else if (!S.sel.has(a.id)) { S.sel.clear(); S.sel.add(a.id); }
    emitir('selecao');
    const it = a.id === 'legenda' ? null : acharItem(a.id)?.it;
    arraste = {
      id: a.id, alca: a.alca, ini: pt, moveu: false,
      modo: a.id === 'legenda' ? 'legenda' : (e.altKey || e.button === 2) && a.b.tipo === 'video' ? 'foco' : a.alca ? 'redim' : 'mover',
      orig: it ? JSON.parse(JSON.stringify(it)) : { pos: S.projeto.legenda.pos },
    };
    sobre.setPointerCapture(e.pointerId);
    sujo = true;
  });
  sobre.addEventListener('pointermove', e => {
    if (!S.projeto) return;
    const pt = paraProjeto(e);
    if (!arraste) {
      const a = alvoEm(pt);
      const novo = a?.id || null;
      sobre.style.cursor = a?.alca ? CURSOR[a.alca] : a ? (a.id === 'legenda' || a.b.tipo === 'faixa' ? 'ns-resize' : e.altKey ? 'all-scroll' : 'move') : 'default';
      if (novo !== hover) { hover = novo; sujo = true; }
      return;
    }
    const dx = pt.x - arraste.ini.x, dy = pt.y - arraste.ini.y;
    if (!arraste.moveu && Math.hypot(dx, dy) * escala < 3) return;
    arraste.moveu = true;
    aplicarArraste(dx, dy, e.shiftKey);
    sujo = true; mexendo();
  });
  const soltar = () => {
    if (!arraste) return;
    const moveu = arraste.moveu; arraste = null; guiasIma = []; sujo = true;
    if (moveu) commit();
  };
  sobre.addEventListener('pointerup', soltar);
  sobre.addEventListener('pointercancel', soltar);
  sobre.addEventListener('dblclick', e => {
    const a = alvoEm(paraProjeto(e));
    if (a) { S.sel.clear(); S.sel.add(a.id); emitir('selecao'); emitir('focarInspetor', a.id); }
  });
  let timerRoda = null;
  sobre.addEventListener('wheel', e => {
    if (!S.projeto) return;
    const a = alvoEm(paraProjeto(e));
    const id = a && S.sel.has(a.id) ? a.id : [...S.sel][0];
    const r = id && id !== 'legenda' ? acharItem(id) : null;
    if (!r) return;
    e.preventDefault();
    const f = Math.exp(-e.deltaY * 0.0012);
    if (r.f.tipo === 'video') r.it.zoom = limitar(r.it.zoom * f, 0.2, 8);
    else if (r.f.tipo === 'texto') r.it.tam = limitar(Math.round(r.it.tam * f), 12, 400);
    sujo = true; mexendo();
    clearTimeout(timerRoda); timerRoda = setTimeout(() => commit(), 350);
  }, { passive: false });

  function ima(v, alvos, lim) {
    let melhor = null;
    for (const a of alvos) { const d = Math.abs(v - a); if (d <= lim && (!melhor || d < melhor.d)) melhor = { d, a }; }
    return melhor;
  }
  function aplicarArraste(dx, dy, shift) {
    const p = S.projeto, { w: W, h: H } = p.formato, o = arraste.orig, lim = 8 / escala;
    guiasIma = [];
    if (arraste.modo === 'legenda') { p.legenda.pos = limitar(Math.round((o.pos + dy / H * 100) * 10) / 10, 4, 96); return; }
    const r = acharItem(arraste.id); if (!r) return;
    const { f, it } = r;
    if (it.tipo === 'qualificacao') {
      // a faixa só sobe e desce (e gruda no topo, no meio e na base)
      let y = o.y + dy;
      if (arraste.modo === 'redim' && /s/.test(arraste.alca)) { it.altura = Math.round(limitar(o.altura + dy, 40, H / 2)); it.tam = Math.round(o.tam * it.altura / o.altura); return; }
      if (S.ima) { const m = ima(y, [0, Math.round(216 * H / 1920), (H - it.altura) / 2, H - it.altura], lim); if (m) { y = m.a; guiasIma.push({ y: m.a }); } }
      it.y = Math.round(limitar(y, -it.altura / 2, H - it.altura / 2));
      return;
    }
    if (f.tipo === 'texto') {
      if (arraste.modo === 'redim') {
        const d0 = Math.hypot(arraste.ini.x - o.x, arraste.ini.y - o.y) || 1;
        const d1 = Math.hypot(arraste.ini.x + dx - o.x, arraste.ini.y + dy - o.y);
        if (arraste.alca === 'e' || arraste.alca === 'w') it.largura = limitar(o.largura + (arraste.alca === 'e' ? dx : -dx) * 2, 60, W * 2);
        else it.tam = limitar(Math.round(o.tam * d1 / d0), 12, 400);
        return;
      }
      let x = o.x + dx, y = o.y + dy;
      if (S.ima) {
        const mx = ima(x, [W / 2], lim); if (mx) { x = mx.a; guiasIma.push({ x: mx.a }); }
        const my = ima(y, [H / 2, H * 0.3, H * 0.15], lim); if (my) { y = my.a; guiasIma.push({ y: my.a }); }
      }
      it.x = Math.round(x); it.y = Math.round(y);
      return;
    }
    if (f.tipo !== 'video') return;
    const m = p.midias[it.midia];
    if (arraste.modo === 'foco') {
      const G = M.geometria(o, m);
      const livreX = G.sw - G.c.w, livreY = G.sh - G.c.h;
      if (Math.abs(livreX) > 0.5) it.foco.x = limitar(o.foco.x - dx / livreX, 0, 1);
      if (Math.abs(livreY) > 0.5) it.foco.y = limitar(o.foco.y - dy / livreY, 0, 1);
      it.foco.x = Math.round(it.foco.x * 1000) / 1000; it.foco.y = Math.round(it.foco.y * 1000) / 1000;
      return;
    }
    const c = { ...o.caixa };
    // bordas de outros vídeos visíveis agora, e da tela
    const xs = [0, W, W / 2], ys = [0, H, H / 2];
    for (const g of p.faixas) if (g.tipo === 'video') for (const j of g.itens) {
      if (j.id === it.id || S.t < j.inicio || S.t >= M.fimItem(g, j)) continue;
      xs.push(j.caixa.x, j.caixa.x + j.caixa.w); ys.push(j.caixa.y, j.caixa.y + j.caixa.h);
    }
    if (arraste.modo === 'mover') {
      c.x = o.caixa.x + dx; c.y = o.caixa.y + dy;
      if (S.ima) {
        for (const [bord, eixo] of [[0, 'x'], [1, 'x'], [.5, 'x'], [0, 'y'], [1, 'y'], [.5, 'y']]) {
          const tam = eixo === 'x' ? c.w : c.h, v = c[eixo] + tam * bord;
          const mm = ima(v, eixo === 'x' ? xs : ys, lim);
          if (mm) { c[eixo] = mm.a - tam * bord; guiasIma.push({ [eixo]: mm.a }); break; }
        }
      }
    } else {
      const a = arraste.alca;
      let x0 = o.caixa.x, y0 = o.caixa.y, x1 = x0 + o.caixa.w, y1 = y0 + o.caixa.h;
      if (a.includes('w')) x0 += dx; if (a.includes('e')) x1 += dx;
      if (a.includes('n')) y0 += dy; if (a.includes('s')) y1 += dy;
      if (S.ima) {
        const sx = (v) => { const mm = ima(v, xs, lim); if (mm) { guiasIma.push({ x: mm.a }); return mm.a; } return v; };
        const sy = (v) => { const mm = ima(v, ys, lim); if (mm) { guiasIma.push({ y: mm.a }); return mm.a; } return v; };
        if (a.includes('w')) x0 = sx(x0); if (a.includes('e')) x1 = sx(x1);
        if (a.includes('n')) y0 = sy(y0); if (a.includes('s')) y1 = sy(y1);
      }
      if (shift && a.length === 2) {   // mantém a proporção da caixa
        const k = o.caixa.w / o.caixa.h, w = x1 - x0, h = w / k;
        if (a.includes('n')) y0 = y1 - h; else y1 = y0 + h;
      }
      c.x = Math.min(x0, x1 - 20); c.y = Math.min(y0, y1 - 20); c.w = Math.max(20, x1 - x0); c.h = Math.max(20, y1 - y0);
    }
    it.caixa = { x: Math.round(c.x), y: Math.round(c.y), w: Math.round(c.w), h: Math.round(c.h) };
  }

  /* ── laço ── */
  function laco() {
    if (S.projeto) {
      if (S.tocando) {
        const agora = performance.now();
        S.t = relogio.t0 + (agora - relogio.p0) / 1000;
        const d = duracao();
        if (S.t >= d) { S.t = d; pausar(); }
        sujo = true;
      }
      if (sujo) {
        sincronizar(S.t);
        desenhar(S.t);
        desenharSobre(S.t);
        emitir('tempo', S.t);
        sujo = false;
      }
    }
    requestAnimationFrame(laco);
  }
  function tocar() {
    if (!S.projeto) return;
    if (S.t >= duracao() - 0.02) S.t = 0;
    S.tocando = true; relogio = { t0: S.t, p0: performance.now() }; sujo = true;
    emitir('tocando', true);
  }
  function pausar() {
    S.tocando = false; sujo = true;
    for (const p of players.values()) p.el.pause();
    for (const v of leaks.values()) v.pause();
    emitir('tocando', false);
  }
  function irPara(t) {
    S.t = limitar(t, 0, Math.max(0, duracao()));
    if (S.tocando) relogio = { t0: S.t, p0: performance.now() };
    sujo = true;
  }
  ouvir('projeto', () => { legSujo = true; limparPlayers(); dimensionar(); sujo = true; });
  ouvir('mexendo', () => { legSujo = true; sujo = true; });
  ouvir('selecao', () => { sujo = true; });
  ouvir('transcricoes', () => { legSujo = true; sujo = true; });
  ouvir('midia', () => { sujo = true; });
  ouvir('fonte', () => { sujo = true; });
  requestAnimationFrame(laco);

  return { tocar, pausar, irPara, alternar: () => (S.tocando ? pausar() : tocar()), redesenhar: () => { sujo = true; }, invalidarLegenda: () => { legSujo = true; sujo = true; }, dimensionar, quadroLegenda };
})();
