/* Linha do tempo: faixas e itens (DOM), régua (canvas), agulha.
   Arrastar item = mover (também entre faixas do mesmo tipo) · bordas = aparar · clique no vazio = agulha.
   O ímã gruda nas bordas dos outros itens, na agulha e no zero. */
const LT = (() => {
  const rotulos = $('#rotulos'), rolagem = $('#rolagem'), conteudo = $('#conteudoLinha'), regua = $('#regua'), pistas = $('#pistas'), agulha = $('#agulha');
  const ALT = { video: 58, audio: 44, texto: 36, efeito: 32, legenda: 32 };
  const ICO = { video: 'film', audio: 'music', texto: 'type', efeito: 'sun', legenda: 'captions' };
  let arraste = null, guia = null, ultimosIds = new Map();

  const px = t => t * S.zoom;
  const tempoEm = clientX => { const r = conteudo.getBoundingClientRect(); return Math.max(0, (clientX - r.left) / S.zoom); };
  function ordem() {
    const p = S.projeto;
    return [...p.faixas.filter(f => f.tipo === 'efeito'), ...p.faixas.filter(f => f.tipo === 'texto'),
      ...p.faixas.filter(f => f.tipo === 'video').reverse(), ...p.faixas.filter(f => f.tipo === 'audio')];
  }
  function nomeItem(f, it) {
    if (f.tipo === 'texto') return (it.tipo === 'qualificacao' ? 'Faixa · ' : '') + it.texto.replace(/\*\*/g, '').replace(/\n/g, ' ');
    if (f.tipo === 'efeito') return M.EFEITOS[it.efeito]?.nome || it.efeito;
    const m = S.projeto.midias[it.midia];
    return `${it.midia} · ${m ? m.nome : 'mídia sumiu'}`;
  }

  function render() {
    if (!S.projeto) { pistas.innerHTML = ''; rotulos.innerHTML = ''; return; }
    const p = S.projeto;
    const largura = Math.max(rolagem.clientWidth, px(duracao() + 8));
    conteudo.style.width = largura + 'px';
    regua.width = largura * devicePixelRatio; regua.height = 22 * devicePixelRatio; regua.style.width = largura + 'px';
    desenharRegua();
    const fs = ordem();
    // assinatura de cada item para realçar o que mudou de fora (Claude)
    const novos = new Map();
    let hR = '', hP = '';
    for (const f of fs) {
      const h = ALT[f.tipo];
      const podeTirar = f.itens.length === 0 && p.faixas.filter(g => g.tipo === f.tipo).length > 1;
      hR += `<div class="rotulo" style="height:${h}px" data-faixa="${f.id}"><i data-i="${ICO[f.tipo]}"></i>${esc(f.nome || f.id)}${podeTirar ? `<button class="x" data-tirar="${f.id}" title="Remover faixa"><i data-i="x"></i></button>` : ''}</div>`;
      hP += `<div class="pista" style="height:${h}px" data-faixa="${f.id}" data-tipo="${f.tipo}">`;
      // itens sobrepostos na mesma faixa: empilha em sub-faixas para nenhum ficar escondido
      const fins = [], raia = new Map();
      for (const it of [...f.itens].sort((a, b) => a.inicio - b.inicio)) {
        let r = fins.findIndex(e => e <= it.inicio + 0.001);
        if (r < 0) { r = fins.length; fins.push(0); }
        fins[r] = M.fimItem(f, it); raia.set(it.id, r);
      }
      const nr = Math.max(1, fins.length), hr = (h - 8) / nr;
      for (const it of f.itens) {
        const fim = M.fimItem(f, it), m = p.midias[it.midia];
        const assin = JSON.stringify(it);
        novos.set(it.id, assin);
        const mudou = S.realcar && ultimosIds.has(it.id) ? ultimosIds.get(it.id) !== assin : S.realcar && ultimosIds.size > 0 && !ultimosIds.has(it.id);
        const classe = it.tipo === 'qualificacao' ? 't-faixa' : f.tipo === 'texto' ? 't-texto' : f.tipo === 'efeito' ? 't-efeito' : m?.tipo === 'imagem' ? 't-imagem' : f.tipo === 'audio' ? 't-audio' : '';
        const mudo = (f.tipo === 'video' && m?.audio && !(it.volume > 0)) ? ' mudo' : '';
        const thumb = S.midia[it.midia]?.thumb;
        hP += `<div class="item ${classe}${mudo}${S.sel.has(it.id) ? ' sel' : ''}${mudou ? ' mudou' : ''}" data-id="${it.id}" style="left:${px(it.inicio)}px;width:${Math.max(4, px(fim - it.inicio))}px${nr > 1 ? `;top:${4 + raia.get(it.id) * hr}px;bottom:auto;height:${hr - 2}px` : ''}">
          ${thumb && f.tipo === 'video' ? `<div class="thumbs" style="background-image:url('${urlMidia(thumb, it.midia)}')"></div>` : ''}
          ${m?.audio && (f.tipo === 'video' || f.tipo === 'audio') && S.midia[it.midia]?.onda ? `<canvas class="onda"></canvas>` : ''}
          <div class="rot"><i data-i="${f.tipo === 'video' && mudo ? 'mute' : ICO[f.tipo]}"></i>${esc(nomeItem(f, it))}</div>
          <div class="borda e"></div><div class="borda d"></div></div>`;
      }
      hP += '</div>';
    }
    // faixa da legenda
    const qs = M.quadrosLegenda(p, S.trans);
    hR += `<div class="rotulo" style="height:${ALT.legenda}px" data-faixa="legenda"><i data-i="captions"></i>Legenda</div>`;
    hP += `<div class="pista legenda${p.legenda.ativa ? '' : ' desligada'}" style="height:${ALT.legenda}px" data-faixa="legenda">`;
    for (let i = 0; i < qs.length; i++) {
      if (qs[i].k !== 0) continue;
      let j = i; while (qs[j + 1] && qs[j + 1].k !== 0) j++;
      hP += `<div class="bloco" data-t="${qs[i].ini}" style="left:${px(qs[i].ini)}px;width:${Math.max(3, px(qs[j].fim - qs[i].ini) - 2)}px">${esc(qs[i].texto.join(' '))}</div>`;
    }
    hP += '</div>';
    rotulos.innerHTML = hR; pistas.innerHTML = hP;
    aplicarIcones(rotulos); aplicarIcones(pistas);
    ultimosIds = novos; S.realcar = false;
    pistas.querySelectorAll('.item').forEach(el => { const c = el.querySelector('canvas.onda'); if (c) desenharOnda(c, el); });
    atualizarAgulha();
  }

  function desenharOnda(c, el) {
    const r = acharItem(el.dataset.id); if (!r) return;
    const { it } = r, picos = S.midia[it.midia]?.onda; if (!picos) return;
    const w = el.clientWidth, h = el.clientHeight * 0.55;
    c.width = Math.max(1, Math.min(8000, w)); c.height = h; c.style.width = w + 'px';
    const g = c.getContext('2d'); g.fillStyle = 'rgba(255,255,255,.9)';
    const dur = it.saida - it.entrada;
    for (let x = 0; x < c.width; x++) {
      const t0 = it.entrada + dur * x / c.width, t1 = it.entrada + dur * (x + 1) / c.width;
      let mx = 0; for (let k = Math.floor(t0 * 50); k <= Math.floor(t1 * 50); k++) mx = Math.max(mx, picos[k] || 0);
      const a = mx / 100 * h * (it.volume > 0 ? Math.min(1.4, it.volume) : 0.25);
      g.fillRect(x, h - a, 1, a);
    }
  }

  function desenharRegua() {
    const g = regua.getContext('2d'), d = devicePixelRatio;
    g.setTransform(d, 0, 0, d, 0, 0);
    const w = regua.width / d;
    g.clearRect(0, 0, w, 22);
    const passos = [0.1, 0.25, 0.5, 1, 2, 5, 10, 15, 30, 60, 120, 300];
    const passo = passos.find(s => s * S.zoom >= 70) || 600;
    const sub = passo / (passo >= 1 ? (passo === 2 ? 4 : 5) : 5);
    g.font = '10px UI, Segoe UI'; g.textBaseline = 'top';
    for (let t = 0; px(t) < w; t += sub) {
      const x = Math.round(px(t)) + 0.5;
      const grande = Math.abs(t / passo - Math.round(t / passo)) < 1e-6;
      g.fillStyle = grande ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.12)';
      g.fillRect(x, grande ? 11 : 16, 1, grande ? 11 : 6);
      if (grande) { g.fillStyle = 'rgba(200,204,212,.55)'; g.fillText(fmtCurto(t), x + 4, 3); }
    }
  }

  function atualizarAgulha() {
    agulha.style.transform = `translateX(${px(S.t)}px)`;
    if (S.tocando) {
      const x = px(S.t), v0 = rolagem.scrollLeft, v1 = v0 + rolagem.clientWidth;
      if (x > v1 - 40 || x < v0) rolagem.scrollLeft = x - 80;
    }
  }

  /* ── ímã ── */
  function pontosIma(excluir) {
    const r = [0, S.t];
    for (const f of S.projeto.faixas) for (const it of f.itens) { if (excluir.has(it.id)) continue; r.push(it.inicio, M.fimItem(f, it)); }
    return r;
  }
  function grudar(t, pontos) {
    if (!S.ima) return null;
    const lim = 8 / S.zoom; let melhor = null;
    for (const p of pontos) { const d = Math.abs(t - p); if (d <= lim && (!melhor || d < melhor.d)) melhor = { d, p }; }
    return melhor?.p ?? null;
  }
  function mostrarGuia(t) {
    if (t == null) { guia?.remove(); guia = null; return; }
    if (!guia) { guia = document.createElement('div'); guia.className = 'guia-ima'; conteudo.append(guia); }
    guia.style.left = px(t) + 'px';
  }

  /* ── mouse ── */
  pistas.addEventListener('pointerdown', e => {
    if (!S.projeto || e.button === 2) return;
    const itemEl = e.target.closest('.item');
    const bloco = e.target.closest('.bloco');
    if (bloco) { PV.irPara(+bloco.dataset.t + 0.001); S.sel.clear(); S.sel.add('legenda'); emitir('selecao'); return; }
    if (!itemEl) {
      if (!e.shiftKey) { S.sel.clear(); emitir('selecao'); }
      PV.irPara(tempoEm(e.clientX)); arrastarAgulha(e); return;
    }
    const id = itemEl.dataset.id;
    if (e.shiftKey || e.ctrlKey) { S.sel.has(id) ? S.sel.delete(id) : S.sel.add(id); }
    else if (!S.sel.has(id)) { S.sel.clear(); S.sel.add(id); }
    emitir('selecao');
    const modo = e.target.classList.contains('e') ? 'ini' : e.target.classList.contains('d') ? 'fim' : 'mover';
    const orig = new Map();
    for (const sid of (modo === 'mover' ? S.sel : [id])) { const r = acharItem(sid); if (r) orig.set(sid, { f: r.f, it: JSON.parse(JSON.stringify(r.it)) }); }
    arraste = { id, modo, x0: e.clientX, orig, moveu: false, el: itemEl };
    pistas.setPointerCapture(e.pointerId);
  });
  pistas.addEventListener('pointermove', e => {
    if (!arraste) return;
    const dxPx = e.clientX - arraste.x0;
    if (!arraste.moveu && Math.abs(dxPx) < 3) return;
    arraste.moveu = true;
    let dt = dxPx / S.zoom;
    const { f: f0, it: o } = arraste.orig.get(arraste.id);
    const r = acharItem(arraste.id); if (!r) return;
    const it = r.it, excl = new Set(arraste.orig.keys());
    const pts = pontosIma(excl);
    const m = S.projeto.midias[it.midia];
    if (arraste.modo === 'mover') {
      const fimO = M.fimItem(f0, o) - o.inicio;
      let ini = Math.max(0, o.inicio + dt);
      const gi = grudar(ini, pts), gf = grudar(ini + fimO, pts);
      if (gi != null) { ini = gi; mostrarGuia(gi); } else if (gf != null) { ini = gf - fimO; mostrarGuia(gf); } else mostrarGuia(null);
      dt = ini - o.inicio;
      for (const [sid, { it: so }] of arraste.orig) { const x = acharItem(sid); if (x) { x.it.inicio = Math.max(0, so.inicio + dt); if (x.f.tipo === 'texto') x.it.fim = x.it.inicio + (so.fim - so.inicio); } }
      // trocar de faixa (só um item, mesmo tipo)
      if (arraste.orig.size === 1) {
        const pista = document.elementsFromPoint(e.clientX, e.clientY).find(el => el.classList?.contains('pista'));
        const destino = pista && S.projeto.faixas.find(g => g.id === pista.dataset.faixa);
        const compat = destino && (destino.tipo === r.f.tipo || (destino.tipo === 'audio' && r.f.tipo === 'video') || (destino.tipo === 'video' && r.f.tipo === 'audio' && m?.tipo !== 'audio'));
        if (compat && destino !== r.f) {
          r.f.itens.splice(r.f.itens.indexOf(it), 1); destino.itens.push(it);
          if (destino.tipo === 'video' && !it.caixa) Object.assign(it, { caixa: { x: 0, y: 0, w: S.projeto.formato.w, h: S.projeto.formato.h } });
        }
      }
    } else if (arraste.modo === 'ini') {
      let ini = o.inicio + dt; const g = grudar(ini, pts); if (g != null) { ini = g; mostrarGuia(g); } else mostrarGuia(null);
      dt = ini - o.inicio;
      if (r.f.tipo === 'texto') { it.inicio = limitar(o.inicio + dt, 0, o.fim - 0.1); }
      else if (r.f.tipo === 'efeito') { it.inicio = limitar(o.inicio + dt, 0, o.inicio + o.dur - 0.05); it.dur = o.dur - (it.inicio - o.inicio); }
      else {
        const minE = m?.tipo === 'imagem' ? -1e9 : 0;
        dt = limitar(dt, Math.max(-o.inicio, minE - o.entrada), o.saida - o.entrada - 0.1);
        it.inicio = o.inicio + dt; it.entrada = Math.max(0, o.entrada + dt);
        if (m?.tipo === 'imagem') it.saida = o.saida;
      }
    } else {
      let fim = M.fimItem(f0, o) + dt; const g = grudar(fim, pts); if (g != null) { fim = g; mostrarGuia(g); } else mostrarGuia(null);
      dt = fim - M.fimItem(f0, o);
      if (r.f.tipo === 'texto') it.fim = Math.max(o.inicio + 0.1, o.fim + dt);
      else if (r.f.tipo === 'efeito') it.dur = Math.max(0.05, o.dur + dt);
      else it.saida = limitar(o.saida + dt, o.entrada + 0.1, m?.tipo === 'imagem' ? 1e9 : (m?.dur || 1e9));
    }
    arraste.el.classList.add('arrastando');
    renderLeve();
    mexendo();
  });
  const soltar = () => {
    if (!arraste) return;
    const moveu = arraste.moveu; arraste = null; mostrarGuia(null);
    if (moveu) commit(); else render();
  };
  pistas.addEventListener('pointerup', soltar);
  pistas.addEventListener('pointercancel', soltar);

  /* durante o arraste só reposiciona (não refaz o DOM inteiro) */
  function renderLeve() {
    for (const el of pistas.querySelectorAll('.item')) {
      const r = acharItem(el.dataset.id); if (!r) continue;
      const pista = el.parentElement;
      if (pista.dataset.faixa !== r.f.id) { const nova = pistas.querySelector(`.pista[data-faixa="${r.f.id}"]`); if (nova) nova.append(el); }
      el.style.left = px(r.it.inicio) + 'px';
      el.style.width = Math.max(4, px(M.fimItem(r.f, r.it) - r.it.inicio)) + 'px';
    }
  }

  function arrastarAgulha(e) {
    const mover = ev => PV.irPara(tempoEm(ev.clientX));
    const fim = () => { removeEventListener('pointermove', mover); removeEventListener('pointerup', fim); };
    addEventListener('pointermove', mover); addEventListener('pointerup', fim);
  }
  regua.addEventListener('pointerdown', e => { PV.irPara(tempoEm(e.clientX)); arrastarAgulha(e); });
  rotulos.addEventListener('click', e => {
    const b = e.target.closest('[data-tirar]'); if (!b) return;
    const i = S.projeto.faixas.findIndex(f => f.id === b.dataset.tirar);
    if (i >= 0 && !S.projeto.faixas[i].itens.length) { S.projeto.faixas.splice(i, 1); commit(); }
  });
  rolagem.addEventListener('scroll', () => { rotulos.scrollTop = rolagem.scrollTop; });
  rolagem.addEventListener('wheel', e => {
    if (!e.ctrlKey) { if (!e.shiftKey && Math.abs(e.deltaY) > Math.abs(e.deltaX) && rolagem.scrollHeight <= rolagem.clientHeight + 2) { rolagem.scrollLeft += e.deltaY; e.preventDefault(); } return; }
    e.preventDefault();
    const t = tempoEm(e.clientX), antes = e.clientX - rolagem.getBoundingClientRect().left;
    definirZoom(S.zoom * Math.exp(-e.deltaY * 0.0015));
    rolagem.scrollLeft = px(t) - antes;
  }, { passive: false });

  /* menu do botão direito num item */
  pistas.addEventListener('contextmenu', e => {
    const el = e.target.closest('.item'); if (!el) return;
    e.preventDefault();
    const id = el.dataset.id; if (!S.sel.has(id)) { S.sel.clear(); S.sel.add(id); emitir('selecao'); }
    const r = acharItem(id); const m = S.projeto.midias[r.it.midia];
    const itens = [
      { txt: 'Dividir na agulha', ico: 'scissors', fn: () => OPS.dividir() },
      { txt: 'Duplicar', ico: 'copy', fn: () => OPS.duplicar() },
    ];
    if (r.f.tipo === 'video' || r.f.tipo === 'audio') {
      itens.push({ txt: r.it.volume > 0 ? 'Tirar o som' : 'Ligar o som', ico: r.it.volume > 0 ? 'mute' : 'volume', fn: () => { r.it.volume = r.it.volume > 0 ? 0 : 1; commit(); } });
      if (r.f.tipo === 'video') itens.push({ txt: 'Tela cheia', ico: 'expand', fn: () => { r.it.caixa = { x: 0, y: 0, w: S.projeto.formato.w, h: S.projeto.formato.h }; commit(); } });
      if (m?.audio) itens.push({ txt: S.trans[r.it.midia] ? 'Transcrever de novo' : 'Transcrever', ico: 'captions', fn: () => OPS.transcrever([r.it.midia]) });
      if (m) itens.push({ txt: 'Substituir a mídia…', ico: 'refresh', fn: () => substituirMidia(r.it.midia) });
      if (m) itens.push({ txt: 'Mostrar o arquivo', ico: 'folder', fn: () => api.chamar('abrir', m.arquivo) });
    }
    itens.push('-', { txt: 'Apagar', ico: 'trash', fn: () => OPS.apagar(false) }, { txt: 'Apagar e fechar o buraco', ico: 'trash', fn: () => OPS.apagar(true) });
    menuContexto(e.clientX, e.clientY, itens);
  });

  /* soltar mídia da lista na pista */
  pistas.addEventListener('dragover', e => {
    if (![...e.dataTransfer.types].includes('bo/midia')) return;
    e.preventDefault(); e.stopPropagation();
    pistas.querySelectorAll('.pista.alvo').forEach(p => p.classList.remove('alvo'));
    e.target.closest('.pista')?.classList.add('alvo');
  });
  pistas.addEventListener('dragleave', () => pistas.querySelectorAll('.pista.alvo').forEach(p => p.classList.remove('alvo')));
  pistas.addEventListener('drop', e => {
    const id = e.dataTransfer.getData('bo/midia'); if (!id) return;
    e.preventDefault(); e.stopPropagation();
    pistas.querySelectorAll('.pista.alvo').forEach(p => p.classList.remove('alvo'));
    const pista = e.target.closest('.pista');
    OPS.inserirMidia(id, { faixa: pista?.dataset.faixa, tempo: tempoEm(e.clientX) });
  });

  function definirZoom(z) {
    S.zoom = limitar(z, 4, 400);
    const r = $('#zoomLinha'); r.value = S.zoom; pintarRange(r);
    render();
  }
  function encaixar() { definirZoom((rolagem.clientWidth - 40) / Math.max(5, duracao() + 1)); rolagem.scrollLeft = 0; }

  ouvir('projeto', render);
  ouvir('selecao', () => pistas.querySelectorAll('.item').forEach(el => el.classList.toggle('sel', S.sel.has(el.dataset.id))));
  ouvir('tempo', atualizarAgulha);
  ouvir('transcricoes', render);
  ouvir('midia', render);
  new ResizeObserver(() => S.projeto && render()).observe(rolagem);
  return { render, definirZoom, encaixar, tempoEm };
})();
