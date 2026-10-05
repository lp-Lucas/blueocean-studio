/* Composições: vários vídeos dentro do mesmo projeto, cada um com a sua linha do tempo.
   Uma aba por composição em cima do preview. As mídias são as mesmas para todas.
   Clique troca · duplo clique renomeia · botão direito: duplicar, aplicar nas outras, exportar, apagar. */
const COMPS = (() => {
  const barra = $('#barraComps');
  const historicos = new Map();   // composição → {hist, histI}: cada vídeo tem o seu desfazer
  const alteradas = new Set();     // mudadas pelo Claude enquanto você estava em outra

  function render() {
    if (!S.nome || !S.comps) { barra.innerHTML = ''; return; }
    const lista = S.comps.lista;
    const rolagemAntes = barra.querySelector('.comps-rolo')?.scrollLeft || 0;
    // as abas ficam numa faixa que rola para o lado; setas nas pontas quando tem aba escondida
    barra.innerHTML = `<button class="comps-seta esq" title="Ver as anteriores"><i data-i="stepback"></i></button>
      <div class="comps-rolo">${lista.map(c => `<button class="aba-comp${c.id === S.comp ? ' ativa' : ''}${alteradas.has(c.id) ? ' alterada' : ''}" data-c="${c.id}" title="${esc(c.nome)} · ${c.id}">
        <span class="nome">${esc(c.nome)}</span><span class="dur">${c.dur ? fmtCurto(c.dur) : 'vazia'}</span></button>`).join('')}
        <button class="aba-mais" id="btnNovaComp" title="Nova composição"><i data-i="plus"></i></button></div>
      <button class="comps-seta dir" title="Ver as próximas"><i data-i="stepfwd"></i></button>
      ${lista.length > 1 ? `<span class="comps-info">${lista.length} vídeos</span>` : ''}`;
    aplicarIcones(barra);
    const rolo = barra.querySelector('.comps-rolo');
    rolo.scrollLeft = rolagemAntes;
    rolo.addEventListener('scroll', setas);
    requestAnimationFrame(() => { mostrarAtiva(); setas(); });
  }
  /* setas aparecem só quando há abas escondidas daquele lado */
  function setas() {
    const rolo = barra.querySelector('.comps-rolo'); if (!rolo) return;
    barra.querySelector('.comps-seta.esq').classList.toggle('visivel', rolo.scrollLeft > 2);
    barra.querySelector('.comps-seta.dir').classList.toggle('visivel', rolo.scrollLeft + rolo.clientWidth < rolo.scrollWidth - 2);
  }
  /* a aba aberta sempre fica à vista */
  function mostrarAtiva() {
    const rolo = barra.querySelector('.comps-rolo'), a = barra.querySelector('.aba-comp.ativa');
    if (!rolo || !a) return;
    const ra = a.getBoundingClientRect(), rr = rolo.getBoundingClientRect();
    if (ra.left < rr.left) rolo.scrollLeft -= rr.left - ra.left + 24;
    else if (ra.right > rr.right) rolo.scrollLeft += ra.right - rr.right + 24;
  }
  // roda do mouse rola as abas para o lado
  barra.addEventListener('wheel', e => {
    const rolo = barra.querySelector('.comps-rolo'); if (!rolo) return;
    if (rolo.scrollWidth <= rolo.clientWidth) return;
    e.preventDefault();
    rolo.scrollLeft += Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  }, { passive: false });
  new ResizeObserver(() => setas()).observe(barra);

  async function trocar(id, { forcar = false } = {}) {
    if (!S.nome || (id === S.comp && !forcar)) return;
    await salvarPendente();
    if (S.comp) historicos.set(S.comp, { hist: S.hist, histI: S.histI });
    const d = await api.chamar('comp:abrir', S.nome, id);
    PV.pausar();
    S.comp = id; S.comps = d.comps; S.projeto = M.normalizar(d.projeto);
    const h = historicos.get(id);
    if (h) { S.hist = h.hist; S.histI = h.histI; } else { S.hist = []; S.histI = -1; }
    registrar();
    S.sel.clear(); S.t = 0;
    alteradas.delete(id);
    emitir('projeto', { abrir: true }); emitir('selecao'); emitir('historico');
    render(); atualizarFormato(); CHAT.mostrarContexto();
    setTimeout(() => LT.encaixar(), 40);
  }

  async function nova(copiarDe = null) {
    await salvarPendente();
    const nomeSug = copiarDe ? `${nomeDe(copiarDe)} (cópia)` : `Vídeo ${S.comps.lista.length + 1}`;
    const nome = await pedirNome(copiarDe ? 'Duplicar composição' : 'Nova composição', nomeSug);
    if (nome == null) return;
    const r = await api.chamar('comp:criar', S.nome, { nome, copiarDe });
    S.comps = r.comps;
    await trocar(r.id);
    toast(copiarDe ? 'Composição duplicada' : 'Composição criada', { tipo: 'ok', dur: 1600 });
  }
  const nomeDe = id => S.comps.lista.find(c => c.id === id)?.nome || id;

  function pedirNome(titulo, valor) {
    return new Promise(ok => {
      abrirModal(`<h3>${esc(titulo)}</h3><div><label class="rot">Nome</label><input class="num" id="mNomeComp" value="${esc(valor)}"></div>
        <div class="acoes"><button class="btn suave" id="mCanc">Cancelar</button><button class="btn primario" id="mOk">OK</button></div>`, cx => {
        const fim = v => { fecharModal(); ok(v); };
        cx.querySelector('#mCanc').onclick = () => fim(null);
        cx.querySelector('#mOk').onclick = () => fim(cx.querySelector('#mNomeComp').value.trim() || valor);
        cx.querySelector('#mNomeComp').onkeydown = e => { if (e.key === 'Enter') fim(e.target.value.trim() || valor); if (e.key === 'Escape') fim(null); };
      });
    });
  }

  /* levar partes de uma composição para as outras */
  const PARTES = [
    ['legenda', 'Estilo da legenda', 'tamanho, posição, cores, palavras por bloco, ligada ou não'],
    ['estilo-textos', 'Aparência dos textos', 'fonte, tamanho, cor, posição e estilo das headlines e faixas — cada vídeo mantém o próprio texto'],
    ['textos', 'Textos inteiros', 'copia headlines e faixas com o texto (substitui os textos das outras)'],
    ['efeitos', 'Efeitos', 'a faixa de efeitos (light leak) com os tempos'],
    ['audio', 'Acabamento de áudio', 'nivelar, limpar ruído, realçar voz'],
    ['formato', 'Formato', 'tamanho da tela e fps'],
  ];
  function aplicar(de) {
    const outras = S.comps.lista.filter(c => c.id !== de);
    if (!outras.length) { toast('Só existe uma composição. Crie ou duplique outra primeiro.'); return; }
    abrirModal(`<h3>Aplicar “${esc(nomeDe(de))}” nas outras</h3>
      <p class="sub">O que levar desta composição. Os vídeos (mídias e cortes) de cada uma continuam os dela.</p>
      <div class="lista-check">${PARTES.map(([k, t, d], i) => `<label class="check"><input type="checkbox" value="${k}" ${i < 2 ? 'checked' : ''}><span><b>${t}</b><small>${d}</small></span></label>`).join('')}</div>
      <div><label class="rot">Em quais</label><div class="lista-check alvos">
        <label class="check"><input type="checkbox" id="mTodas" checked><span><b>Todas as outras (${outras.length})</b></span></label>
        ${outras.map(c => `<label class="check sub-alvo"><input type="checkbox" value="${c.id}" checked><span><b>${esc(c.nome)}</b><small>${c.id}</small></span></label>`).join('')}</div></div>
      <div class="acoes"><button class="btn suave" id="mCanc">Cancelar</button><button class="btn primario" id="mAplicar">Aplicar</button></div>`, cx => {
      const todas = cx.querySelector('#mTodas'), subs = [...cx.querySelectorAll('.sub-alvo input')];
      todas.onchange = () => subs.forEach(s => { s.checked = todas.checked; });
      subs.forEach(s => s.onchange = () => { todas.checked = subs.every(x => x.checked); });
      cx.querySelector('#mCanc').onclick = fecharModal;
      cx.querySelector('#mAplicar').onclick = async () => {
        const partes = [...cx.querySelectorAll('.lista-check:not(.alvos) input:checked')].map(x => x.value);
        const em = subs.filter(s => s.checked).map(s => s.value);
        if (!partes.length || !em.length) { toast('Escolha o que aplicar e em quais.', { tipo: 'erro' }); return; }
        fecharModal();
        try {
          await salvarPendente();
          const r = await api.chamar('comp:aplicar', S.nome, { de, em: em.length === outras.length ? 'todas' : em.join(','), partes });
          S.comps = r.comps; render();
          if (r.alvos.includes(S.comp)) await trocar(S.comp, { forcar: true });
          toast(`Aplicado em ${r.alvos.length} composição(ões)`, { tipo: 'ok' });
        } catch (e) { toast(e.message, { tipo: 'erro' }); }
      };
    });
  }

  async function renomear(id) {
    const nome = await pedirNome('Renomear composição', nomeDe(id));
    if (!nome) return;
    S.comps = await api.chamar('comp:renomear', S.nome, id, nome); render(); CHAT.mostrarContexto();
  }
  async function apagar(id) {
    if (S.comps.lista.length <= 1) { toast('O projeto precisa de pelo menos uma composição.', { tipo: 'erro' }); return; }
    abrirModal(`<h3>Apagar “${esc(nomeDe(id))}”?</h3><p class="sub">A composição vai para composicoes/_apagadas dentro da pasta do projeto, dá para recuperar. As mídias não são tocadas.</p>
      <div class="acoes"><button class="btn suave" id="mCanc">Cancelar</button><button class="btn perigo" id="mApagar">Apagar</button></div>`, cx => {
      cx.querySelector('#mCanc').onclick = fecharModal;
      cx.querySelector('#mApagar').onclick = async () => {
        fecharModal();
        await salvarPendente();
        S.comps = await api.chamar('comp:apagar', S.nome, id);
        historicos.delete(id);
        if (id === S.comp) await trocar(S.comps.ativa, { forcar: true }); else render();
      };
    });
  }

  barra.addEventListener('click', e => {
    const seta = e.target.closest('.comps-seta');
    if (seta) { const rolo = barra.querySelector('.comps-rolo'); rolo.scrollBy({ left: (seta.classList.contains('esq') ? -1 : 1) * rolo.clientWidth * 0.7, behavior: 'smooth' }); return; }
    const b = e.target.closest('.aba-comp'); if (b) { trocar(b.dataset.c); return; }
    if (e.target.closest('#btnNovaComp')) {
      const r = e.target.closest('#btnNovaComp').getBoundingClientRect();
      menuContexto(r.left, r.bottom + 4, [
        { txt: 'Composição vazia', ico: 'plus', fn: () => nova(null) },
        { txt: 'Duplicar a atual', ico: 'copy', fn: () => nova(S.comp) },
      ]);
    }
  });
  barra.addEventListener('dblclick', e => { const b = e.target.closest('.aba-comp'); if (b) renomear(b.dataset.c); });
  barra.addEventListener('contextmenu', e => {
    const b = e.target.closest('.aba-comp'); if (!b) return;
    e.preventDefault();
    const id = b.dataset.c;
    menuContexto(e.clientX, e.clientY, [
      { txt: 'Abrir', ico: 'play', fn: () => trocar(id) },
      { txt: 'Renomear', ico: 'edit', fn: () => renomear(id) },
      { txt: 'Duplicar', ico: 'copy', fn: () => nova(id) },
      { txt: 'Aplicar desta nas outras…', ico: 'layers', fn: () => aplicar(id) },
      { txt: 'Exportar esta', ico: 'export', fn: () => api.chamar('exportar', S.nome, { comp: id }).catch(err => toast(err.message, { tipo: 'erro' })) },
      '-',
      { txt: 'Apagar', ico: 'trash', fn: () => apagar(id) },
    ]);
  });
  // arrastar para reordenar
  let arrastando = null;
  barra.addEventListener('pointerdown', e => { const b = e.target.closest('.aba-comp'); if (b && e.button === 0) arrastando = { id: b.dataset.c, x: e.clientX, moveu: false }; });
  addEventListener('pointermove', e => {
    if (!arrastando) return;
    if (!arrastando.moveu && Math.abs(e.clientX - arrastando.x) < 6) return;
    arrastando.moveu = true;
    const sobre = document.elementsFromPoint(e.clientX, e.clientY).find(el => el.classList?.contains('aba-comp'));
    if (!sobre || sobre.dataset.c === arrastando.id) return;
    const ids = S.comps.lista.map(c => c.id), de = ids.indexOf(arrastando.id), para = ids.indexOf(sobre.dataset.c);
    ids.splice(para, 0, ids.splice(de, 1)[0]);
    S.comps.lista.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
    render();
  });
  addEventListener('pointerup', async () => {
    if (!arrastando) return;
    const moveu = arrastando.moveu; arrastando = null;
    if (moveu) S.comps = await api.chamar('comp:ordenar', S.nome, S.comps.lista.map(c => c.id));
  });

  api.on.comps(c => {
    if (!S.nome) return;
    S.comps = { ativa: c.ativa, lista: c.lista };
    if (c.mudou && c.mudou !== S.comp) alteradas.add(c.mudou);
    render();
  });
  api.on.compAbrir(({ projeto, comp }) => { if (projeto === S.nome) trocar(comp); });
  ouvir('projeto', () => {
    // a duração da aba acompanha a linha do tempo
    const c = S.comps?.lista.find(x => x.id === S.comp);
    if (c) { const d = duracao(); if (Math.abs((c.dur || 0) - d) > 0.05) { c.dur = d; render(); } }
  });
  return { render, trocar, nova, aplicar, limpar: () => { historicos.clear(); alteradas.clear(); } };
})();
