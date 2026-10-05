/* Tela de transcrição: corrigir à mão o texto que vira legenda.
   Vídeo à esquerda, texto à direita; a palavra falada acende enquanto toca.
   Clique = vai até a palavra · duplo clique (ou Enter) = corrige · Delete = esconde da legenda
   Tab = próxima palavra · sublinhado laranja = o Whisper ficou em dúvida.
   Salva sozinho em transcricoes/<mídia>.json — a legenda de todas as composições acompanha. */
const TRANS = (() => {
  const tela = document.createElement('div');
  tela.id = 'telaTrans'; tela.className = 'tela-trans oculto';
  document.body.append(tela);
  let midia = null, palavras = [], sel = -1, editando = -1, timerSalvar = null, raf = 0;

  function abrir(id = null) {
    if (!S.nome) return;
    const ids = idsComTranscricao();
    if (!ids.length) {
      const comAudio = Object.keys(S.projeto.midias).filter(m => S.projeto.midias[m].audio);
      toast(comAudio.length ? 'Nenhuma mídia transcrita ainda. Transcreva primeiro (botão direito na mídia → Transcrever).' : 'Nenhuma mídia com fala no projeto.', { tipo: 'erro', dur: 5000 });
      return;
    }
    midia = id && S.trans[id] ? id : ids[0];
    montar();
    tela.classList.remove('oculto');
  }
  /* as mídias usadas na composição aberta vêm primeiro */
  function idsComTranscricao() {
    const usadas = new Set(); for (const f of S.projeto.faixas) for (const it of f.itens) if (it.midia) usadas.add(it.midia);
    return Object.keys(S.trans).filter(id => S.projeto.midias[id] && Array.isArray(S.trans[id]))
      .sort((a, b) => (usadas.has(b) - usadas.has(a)) || (parseInt(a.slice(1)) - parseInt(b.slice(1))));
  }
  function fechar() {
    salvarJa();
    cancelAnimationFrame(raf);
    tela.querySelector('video')?.pause();
    tela.classList.add('oculto');
  }

  function montar() {
    palavras = JSON.parse(JSON.stringify(S.trans[midia] || []));
    sel = -1; editando = -1;
    const m = S.projeto.midias[midia];
    const ids = idsComTranscricao();
    tela.innerHTML = `<div class="tt-caixa">
      <header class="tt-topo">
        <div class="tt-titulo"><b>Transcrição</b><span>corrija aqui e a legenda acompanha</span></div>
        <div class="tt-midias">${ids.map(id => `<button class="tt-midia${id === midia ? ' on' : ''}" data-m="${id}" title="${esc(S.projeto.midias[id].nome)}"><span class="id">${id}</span>${esc(S.projeto.midias[id].nome.replace(/\.[^.]+$/, '').slice(0, 26))}</button>`).join('')}</div>
        <button class="icone-btn" id="ttFechar" title="Fechar (Esc)"><i data-i="x"></i></button>
      </header>
      <div class="tt-corpo">
        <aside class="tt-video">
          <div class="tt-tela"><video id="ttVideo" src="${urlMidia(S.midia[midia]?.proxy || m.arquivo, midia)}" preload="auto"></video><div class="tt-leg" id="ttLeg"></div></div>
          <div class="tt-controles"><button class="play" id="ttPlay"><i data-i="play"></i></button><span class="tempo" id="ttTempo">0:00.00</span></div>
          <div class="tt-ajuda">
            <p><kbd>clique</kbd> vai até a palavra</p>
            <p><kbd>duplo clique</kbd> ou <kbd>Enter</kbd> corrige</p>
            <p><kbd>Tab</kbd> corrige a próxima</p>
            <p><kbd>Delete</kbd> esconde (ou volta) da legenda</p>
            <p><kbd>Espaço</kbd> toca e pausa</p>
            <p><span class="duvida-ex">palavra</span> o Whisper ficou em dúvida</p>
          </div>
          <div class="tt-trocar">
            <label class="rot">Procurar e trocar nesta mídia</label>
            <input class="num" id="ttDe" placeholder="Procurar (ex.: blu ocean)">
            <input class="num" id="ttPara" placeholder="Trocar por (ex.: Blue Ocean)">
            <label class="check-linha"><input type="checkbox" id="ttTodas"> em todas as mídias</label>
            <button class="btn suave cheio" id="ttTrocarBtn">Trocar</button>
            <span class="sub" id="ttAchados"></span>
          </div>
        </aside>
        <section class="tt-texto" id="ttTexto"></section>
      </div>
    </div>`;
    aplicarIcones(tela);
    renderTexto();
    const v = tela.querySelector('#ttVideo');
    v.onplay = () => { tela.querySelector('#ttPlay').innerHTML = svgIcone('pause'); laco(); };
    v.onpause = () => { tela.querySelector('#ttPlay').innerHTML = svgIcone('play'); };
    tela.querySelector('#ttPlay').onclick = () => (v.paused ? v.play() : v.pause());
    tela.querySelector('#ttFechar').onclick = fechar;
    tela.querySelectorAll('.tt-midia').forEach(b => b.onclick = () => { salvarJa(); midia = b.dataset.m; montar(); });
    tela.querySelector('#ttDe').oninput = contarAchados;
    tela.querySelector('#ttTrocarBtn').onclick = trocarTudo;
  }

  /* frases: quebra em pontuação ou pausa > 0,7 s */
  function renderTexto() {
    const cx = tela.querySelector('#ttTexto');
    let h = '', frase = [];
    const fecha = () => {
      if (!frase.length) return;
      h += `<p class="tt-frase"><span class="tt-t">${fmtCurto(palavras[frase[0]].i)}</span><span>${frase.map(i => palavraHtml(i)).join(' ')}</span></p>`;
      frase = [];
    };
    palavras.forEach((w, i) => {
      const ant = palavras[i - 1];
      if (ant && (/[.?!…]$/.test(ant.t) || w.i - ant.f > 0.7)) fecha();
      frase.push(i);
    });
    fecha();
    cx.innerHTML = h || '<p class="sub">Sem palavras nesta mídia.</p>';
  }
  const palavraHtml = i => {
    const w = palavras[i];
    return `<span class="tt-p${w.oculta ? ' oculta' : ''}${w.p != null && w.p < 0.55 ? ' duvida' : ''}${i === sel ? ' sel' : ''}" data-i="${i}" title="${w.i.toFixed(2)}s – ${w.f.toFixed(2)}s${w.p != null ? ` · confiança ${Math.round(w.p * 100)}%` : ''}">${esc(w.t)}</span>`;
  };
  const elPalavra = i => tela.querySelector(`.tt-p[data-i="${i}"]`);
  function atualizarPalavra(i) { const el = elPalavra(i); if (el) el.outerHTML = palavraHtml(i); }

  function selecionar(i, { ir = true } = {}) {
    const ant = sel; sel = i;
    if (ant >= 0) elPalavra(ant)?.classList.remove('sel');
    const el = elPalavra(i); if (!el) return;
    el.classList.add('sel');
    el.scrollIntoView({ block: 'nearest' });
    if (ir) { const v = tela.querySelector('#ttVideo'); v.currentTime = palavras[i].i + 0.001; mostrarLegenda(); }
  }
  function editar(i) {
    const el = elPalavra(i); if (!el) return;
    editando = i; selecionar(i, { ir: false });
    el.contentEditable = 'true'; el.classList.add('editando'); el.focus();
    getSelection().selectAllChildren(el);
    const terminar = (salva, proxima) => {
      if (editando !== i) return;
      editando = -1;
      el.contentEditable = 'false';
      const novo = el.textContent.replace(/\s+/g, ' ').trim();
      if (salva && novo && novo !== palavras[i].t) { palavras[i].t = novo; palavras[i].p = 1; palavras[i].editada = true; agendarSalvar(); }
      atualizarPalavra(i);
      if (proxima != null && palavras[proxima]) editar(proxima);
    };
    el.onkeydown = e => {
      if (e.key === 'Enter') { e.preventDefault(); terminar(true); }
      else if (e.key === 'Tab') { e.preventDefault(); terminar(true, e.shiftKey ? i - 1 : i + 1); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); terminar(false); }
      e.stopPropagation();
    };
    el.onblur = () => terminar(true);
  }
  function alternarOculta(i) {
    palavras[i].oculta = !palavras[i].oculta;
    if (!palavras[i].oculta) delete palavras[i].oculta;
    atualizarPalavra(i); agendarSalvar();
  }

  /* tocar: acende a palavra falada e mostra a legenda daquele trecho em cima do vídeo */
  function laco() {
    const v = tela.querySelector('#ttVideo'); if (!v) return;
    mostrarLegenda();
    if (!v.paused) raf = requestAnimationFrame(laco);
  }
  function mostrarLegenda() {
    const v = tela.querySelector('#ttVideo'); if (!v) return;
    const t = v.currentTime;
    tela.querySelector('#ttTempo').textContent = fmt(t);
    let atual = -1;
    for (let i = 0; i < palavras.length; i++) { if (palavras[i].i <= t + 0.02 && t < palavras[i].f + 0.05) { atual = i; break; } if (palavras[i].i > t) break; }
    tela.querySelectorAll('.tt-p.agora').forEach(x => x.classList.remove('agora'));
    const leg = tela.querySelector('#ttLeg');
    if (atual >= 0) {
      const el = elPalavra(atual); el?.classList.add('agora');
      if (!v.paused) el?.scrollIntoView({ block: 'nearest' });
      // três palavras em volta, como a legenda
      const ini = Math.max(0, atual - 1), fim = Math.min(palavras.length, ini + 3);
      leg.innerHTML = palavras.slice(ini, fim).map((w, k) => w.oculta ? '' : `<span class="${ini + k === atual ? 'on' : ''}">${esc(w.t)}</span>`).join(' ');
    } else leg.innerHTML = '';
  }

  /* procurar e trocar (palavra inteira ou trecho de várias palavras) */
  const normal = s => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[.,!?;:…"“”]/g, '');
  function acharEm(lista, termo) {
    const alvo = normal(termo).split(/\s+/).filter(Boolean); if (!alvo.length) return [];
    const r = [];
    for (let i = 0; i + alvo.length <= lista.length; i++) {
      let ok = true; for (let k = 0; k < alvo.length; k++) if (normal(lista[i + k].t) !== alvo[k]) { ok = false; break; }
      if (ok) r.push(i);
    }
    return r;
  }
  function contarAchados() {
    const termo = tela.querySelector('#ttDe').value;
    tela.querySelectorAll('.tt-p.achado').forEach(x => x.classList.remove('achado'));
    const r = termo.trim() ? acharEm(palavras, termo) : [];
    const n = normal(termo).split(/\s+/).filter(Boolean).length;
    r.forEach(i => { for (let k = 0; k < n; k++) elPalavra(i + k)?.classList.add('achado'); });
    if (r.length) elPalavra(r[0])?.scrollIntoView({ block: 'center' });
    tela.querySelector('#ttAchados').textContent = termo.trim() ? `${r.length} nesta mídia` : '';
  }
  /* troca em uma lista: o trecho achado vira o texto novo na 1ª palavra (mantém o tempo), as outras somem */
  function trocarNaLista(lista, de, para) {
    const n = normal(de).split(/\s+/).filter(Boolean).length;
    const r = acharEm(lista, de);
    for (const i of r.reverse()) {
      const pont = (lista[i + n - 1].t.match(/[.,!?;:…]+$/) || [''])[0];
      lista[i] = { ...lista[i], t: para + (/[.,!?;:…]$/.test(para) ? '' : pont), f: lista[i + n - 1].f, p: 1, editada: true };
      lista.splice(i + 1, n - 1);
    }
    return r.length;
  }
  async function trocarTudo() {
    const de = tela.querySelector('#ttDe').value.trim(), para = tela.querySelector('#ttPara').value.trim();
    if (!de || !para) { toast('Preencha o que procurar e pelo que trocar.', { tipo: 'erro' }); return; }
    let total = trocarNaLista(palavras, de, para);
    salvarJa();
    if (tela.querySelector('#ttTodas').checked) {
      for (const id of idsComTranscricao()) {
        if (id === midia) continue;
        const lista = JSON.parse(JSON.stringify(S.trans[id]));
        const n = trocarNaLista(lista, de, para);
        if (n) { total += n; S.trans[id] = lista; await api.chamar('transcricao:salvar', S.nome, id, lista); }
      }
    }
    renderTexto(); contarAchados();
    PV.invalidarLegenda(); emitir('transcricoes');
    toast(total ? `Trocado em ${total} lugar(es)` : 'Nada encontrado', { tipo: total ? 'ok' : '' });
  }

  function agendarSalvar() { clearTimeout(timerSalvar); timerSalvar = setTimeout(salvarJa, 300); }
  function salvarJa() {
    clearTimeout(timerSalvar);
    if (!midia || !S.nome) return;
    if (JSON.stringify(S.trans[midia]) === JSON.stringify(palavras)) return;
    S.trans[midia] = JSON.parse(JSON.stringify(palavras));
    api.chamar('transcricao:salvar', S.nome, midia, palavras).catch(e => toast(e.message, { tipo: 'erro' }));
    PV.invalidarLegenda(); emitir('transcricoes');
  }

  tela.addEventListener('click', e => { const p = e.target.closest('.tt-p'); if (p && editando < 0) selecionar(+p.dataset.i); });
  tela.addEventListener('dblclick', e => { const p = e.target.closest('.tt-p'); if (p) editar(+p.dataset.i); });
  tela.addEventListener('pointerdown', e => { if (e.target === tela) fechar(); });
  addEventListener('keydown', e => {
    if (tela.classList.contains('oculto') || editando >= 0) return;
    if (e.target.closest?.('input')) { if (e.key === 'Escape') e.target.blur(); return; }
    const v = tela.querySelector('#ttVideo');
    if (e.key === 'Escape') { fechar(); e.stopImmediatePropagation(); }
    else if (e.key === ' ') { e.preventDefault(); v.paused ? v.play() : v.pause(); }
    else if (e.key === 'Enter' && sel >= 0) { e.preventDefault(); editar(sel); }
    else if ((e.key === 'Delete' || e.key === 'Backspace') && sel >= 0) { e.preventDefault(); alternarOculta(sel); }
    else if (e.key === 'ArrowRight' && sel < palavras.length - 1) { e.preventDefault(); selecionar(sel + 1); }
    else if (e.key === 'ArrowLeft' && sel > 0) { e.preventDefault(); selecionar(sel - 1); }
    else return;
    e.stopImmediatePropagation();
  }, true);
  // transcrição mudou por fora (Claude) com a tela aberta e sem edição: recarrega
  ouvir('transcricoes', () => {
    if (tela.classList.contains('oculto') || editando >= 0 || !midia) return;
    if (JSON.stringify(S.trans[midia]) !== JSON.stringify(palavras)) { palavras = JSON.parse(JSON.stringify(S.trans[midia] || [])); renderTexto(); }
  });
  return { abrir, fechar };
})();
