/* Edição em lotes: uma aba por cliente. Passo 1: bruto (links ou arquivos) + site. Passo 2: a receita pronta → Gerar.
   Cada lote vira um projeto que o Claude edita sozinho; dá para abrir vários e gerar todos (a fila roda N ao mesmo tempo).
   Pronto, o lote abre no editor e segue pelo chat. */
const LOTES = (() => {
  const tela = document.createElement('div');
  tela.id = 'lotes'; tela.className = 'tela-lotes oculto';
  document.body.appendChild(tela);
  const RECEITA_PADRAO = '15-motion-identidade-cliente';
  let dados = { simultaneos: 2, lista: [] }, receitas = [], sel = null, relogio = null;
  const RODANDO = ['na-fila', 'preparando', 'trabalhando'];
  const lote = () => dados.lista.find(l => l.id === sel);
  const nomeArq = p => String(p).split(/[\\/]/).pop();
  const links = l => String(l.links || '').split(/\s+/).filter(x => /^https?:\/\//i.test(x));
  const temBruto = l => links(l).length || (l.arquivos || []).length;
  const pronto1 = l => String(l.cliente || '').trim() && temBruto(l);
  const prontoGerar = l => l.estado !== 'pronto' && !RODANDO.includes(l.estado) && pronto1(l) && l.receita;
  const dur = ms => { const s = Math.max(0, Math.round(ms / 1000)); return s >= 3600 ? `${Math.floor(s / 3600)} h ${Math.floor(s % 3600 / 60)} min` : s >= 60 ? `${Math.floor(s / 60)} min ${s % 60} s` : `${s} s`; };
  const ROTULO = { rascunho: 'Rascunho', 'na-fila': 'Na fila', preparando: 'Preparando', trabalhando: 'Editando', pronto: 'Pronto', erro: 'Erro', interrompido: 'Parado' };

  /* ── salvar campo (com espera, para não gravar a cada tecla) ── */
  const pend = new Map();
  function salvar(campos) {
    const l = lote(); if (!l) return;
    Object.assign(l, campos);
    const id = l.id, atual = { ...(pend.get(id)?.campos || {}), ...campos };
    clearTimeout(pend.get(id)?.t);
    pend.set(id, { campos: atual, t: setTimeout(() => { pend.delete(id); api.chamar('lotes:salvar', id, atual).catch(e => toast(e.message, { tipo: 'erro' })); }, 350) });
    renderAbas(); renderRodape();
  }
  async function salvarJa() {
    for (const [id, p] of pend) { clearTimeout(p.t); await api.chamar('lotes:salvar', id, p.campos); }
    pend.clear();
  }

  /* ── desenho ── */
  function render() {
    const nGerar = dados.lista.filter(prontoGerar).length;
    tela.innerHTML = `<div class="lt-caixa">
      <header class="lt-topo">
        <div class="lt-tit"><h1>Edição em lotes</h1><p>Um lote por cliente: o bruto, o site e a receita. Clique em Gerar e o Claude faz o resto — cada lote vira um projeto que você ajusta pelo chat.</p></div>
        <div class="lt-acoes">
          <div class="lt-sim" title="Quantos lotes o Claude edita ao mesmo tempo"><span>Ao mesmo tempo</span><div class="segmentos" id="ltSim">${[1, 2, 3, 4].map(n => `<button data-n="${n}" class="${dados.simultaneos === n ? 'on' : ''}">${n}</button>`).join('')}</div></div>
          <button class="btn suave" id="ltGerarTodos" ${nGerar ? '' : 'disabled'}><i data-i="raio"></i>Gerar todos${nGerar ? ` (${nGerar})` : ''}</button>
          <button class="icone-btn" id="ltFechar" title="Voltar"><i data-i="x"></i></button>
        </div>
      </header>
      <nav class="lt-abas" id="ltAbas"></nav>
      <section class="lt-corpo" id="ltCorpo"></section>
    </div>`;
    aplicarIcones(tela);
    tela.querySelector('#ltFechar').onclick = fechar;
    tela.querySelector('#ltSim').onclick = e => { const b = e.target.closest('button'); if (b) api.chamar('lotes:simultaneos', +b.dataset.n); };
    tela.querySelector('#ltGerarTodos').onclick = async () => { await salvarJa(); gerar(dados.lista.filter(prontoGerar).map(l => l.id)); };
    renderAbas(); renderCorpo();
  }

  function renderAbas() {
    const nav = tela.querySelector('#ltAbas'); if (!nav) return;
    nav.innerHTML = dados.lista.map(l => `<button class="lt-aba est-${l.estado}${l.id === sel ? ' on' : ''}" data-id="${l.id}" title="${esc(ROTULO[l.estado] || '')}">
        <span class="pt"></span><span class="nm">${esc(String(l.cliente || '').trim() || 'Novo lote')}</span>${RODANDO.includes(l.estado) ? '' : `<span class="x" data-x="${l.id}" title="Apagar lote"><i data-i="x"></i></span>`}</button>`).join('')
      + `<button class="lt-aba-nova" id="ltNovo"><i data-i="plus"></i>Novo lote</button>`;
    aplicarIcones(nav);
    nav.querySelectorAll('.lt-aba').forEach(b => b.onclick = e => {
      if (e.target.closest('[data-x]')) return apagar(e.target.closest('[data-x]').dataset.x);
      sel = b.dataset.id; renderAbas(); renderCorpo();
    });
    nav.querySelector('#ltNovo').onclick = novo;
    nav.querySelector('.lt-aba.on')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function renderCorpo() {
    const c = tela.querySelector('#ltCorpo'); if (!c) return;
    clearInterval(relogio);
    const l = lote();
    if (!l) { c.innerHTML = `<div class="lt-vazio"><p>Nenhum lote ainda.</p><button class="btn primario" id="ltNovo2"><i data-i="plus"></i>Novo lote</button></div>`; aplicarIcones(c); c.querySelector('#ltNovo2').onclick = novo; return; }
    if (RODANDO.includes(l.estado)) return renderRodando(c, l);
    if (['pronto', 'erro', 'interrompido'].includes(l.estado)) return renderFim(c, l);
    return l.etapa === 2 ? renderReceita(c, l) : renderMaterial(c, l);
  }

  const passos = n => `<div class="lt-passos"><span class="${n === 1 ? 'on' : 'feito'}"><b>${n > 1 ? '✓' : '1'}</b>Material</span><i></i><span class="${n === 2 ? 'on' : ''}"><b>2</b>Receita</span></div>`;

  function renderMaterial(c, l) {
    c.innerHTML = `${passos(1)}
      <div class="lt-form">
        <div class="campo"><label class="rot">Cliente</label><input class="num grande" id="fCliente" placeholder="Ex.: Neosync" value="${esc(l.cliente)}" spellcheck="false"></div>
        <div class="campo"><label class="rot">Brutos</label>
          <textarea class="num" id="fLinks" rows="3" spellcheck="false" placeholder="Cole o link da pasta do Drive ou dos vídeos — um por linha">${esc(l.links)}</textarea>
          <button class="lt-soltar" id="fSoltar" type="button"><i data-i="upload"></i><span>Ou solte os arquivos aqui · <u>escolher no computador</u></span></button>
          <div class="lt-arqs">${(l.arquivos || []).map((a, i) => `<span class="lt-arq" title="${esc(a)}"><i data-i="film"></i>${esc(nomeArq(a))}<button data-i-arq="${i}" title="Tirar"><i data-i="x"></i></button></span>`).join('')}</div>
        </div>
        <div class="campo"><label class="rot">Site do cliente</label><input class="num grande" id="fSite" placeholder="https://" value="${esc(l.site)}" spellcheck="false"></div>
      </div>
      <div class="lt-rodape" id="ltRodape"></div>`;
    aplicarIcones(c);
    c.querySelector('#fCliente').oninput = e => salvar({ cliente: e.target.value });
    c.querySelector('#fLinks').oninput = e => salvar({ links: e.target.value });
    c.querySelector('#fSite').oninput = e => salvar({ site: e.target.value.trim() });
    c.querySelector('#fSoltar').onclick = async () => { const fs = await api.chamar('midia:escolher'); if (fs.length) addArquivos(fs); };
    c.querySelectorAll('[data-i-arq]').forEach(b => b.onclick = () => { const a = [...l.arquivos]; a.splice(+b.dataset.iArq, 1); salvar({ arquivos: a }); renderCorpo(); });
    if (!l.cliente) c.querySelector('#fCliente').focus();
    renderRodape();
  }
  function addArquivos(caminhos) {
    const l = lote(); if (!l) return;
    salvar({ arquivos: [...new Set([...(l.arquivos || []), ...caminhos])] });
    renderCorpo();
  }

  function renderRodape() {
    const r = tela.querySelector('#ltRodape'); const l = lote(); if (!r || !l) return;
    if (l.etapa === 2) {
      r.innerHTML = `<button class="btn suave" id="fVoltar"><i data-i="chevron" style="transform:rotate(90deg)"></i>Voltar</button>
        <button class="btn primario grande" id="fGerar" ${prontoGerar(l) ? '' : 'disabled'}><i data-i="sparkle"></i>Gerar</button>`;
      aplicarIcones(r);
      r.querySelector('#fVoltar').onclick = () => { salvar({ etapa: 1 }); renderCorpo(); };
      r.querySelector('#fGerar').onclick = async () => { await salvarJa(); gerar([l.id]); };
      return;
    }
    const falta = !String(l.cliente || '').trim() ? 'Falta o nome do cliente' : !temBruto(l) ? 'Falta o bruto: cole um link ou solte os arquivos' : !l.site ? 'Sem o site, o Claude não tem de onde tirar a identidade visual' : '';
    r.innerHTML = `<span class="sub">${esc(falta)}</span><button class="btn primario grande" id="fContinuar" ${pronto1(l) ? '' : 'disabled'}>Continuar<i data-i="chevron" style="transform:rotate(-90deg)"></i></button>`;
    aplicarIcones(r);
    r.querySelector('#fContinuar').onclick = () => { salvar({ etapa: 2 }); renderCorpo(); };
  }

  function renderReceita(c, l) {
    const r = receitas.find(x => x.id === l.receita) || receitas[0];
    if (r && r.id !== l.receita) salvar({ receita: r.id });
    const nl = links(l).length, na = (l.arquivos || []).length;
    c.innerHTML = `${passos(2)}
      <div class="lt-receita">
        <span class="ico"><i data-i="${r?.icone || 'estrela'}"></i></span>
        <div class="txt"><span class="rot">Receita</span><b>${esc(r?.titulo || 'Sem receita')}</b><p>${esc(r?.resumo || '')}</p></div>
      </div>
      <div class="lt-linha">
        <div class="campo"><label class="rot">Trocar a receita</label><select class="num" id="fReceita">${receitas.map(x => `<option value="${x.id}" ${x.id === r?.id ? 'selected' : ''}>${esc(x.titulo)}</option>`).join('')}</select></div>
      </div>
      <div class="lt-ficha">
        <div><span class="rot">Cliente</span><b>${esc(l.cliente)}</b></div>
        <div><span class="rot">Brutos</span><b>${[nl ? `${nl} link${nl > 1 ? 's' : ''}` : '', na ? `${na} arquivo${na > 1 ? 's' : ''}` : ''].filter(Boolean).join(' + ')}</b></div>
        <div><span class="rot">Site</span><b>${esc(l.site || '—')}</b></div>
      </div>
      <div class="campo"><label class="rot">Observações para o Claude <span class="sub">(opcional)</span></label><textarea class="num" id="fObs" rows="3" placeholder="Ex.: são 3 copies; a copy 2 tem duas tomadas, usar a segunda">${esc(l.obs)}</textarea></div>
      <label class="lt-check"><span class="chave ${l.exportar ? 'on' : ''}" id="fExportar"></span><span>Exportar os vídeos no final<span class="sub">Desligado, ele deixa tudo pronto para você revisar no editor antes.</span></span></label>
      <div class="lt-rodape" id="ltRodape"></div>`;
    aplicarIcones(c);
    c.querySelector('#fReceita').onchange = e => { salvar({ receita: e.target.value }); renderCorpo(); };
    c.querySelector('#fObs').oninput = e => salvar({ obs: e.target.value });
    c.querySelector('.lt-check').onclick = () => { salvar({ exportar: !l.exportar }); c.querySelector('#fExportar').classList.toggle('on', l.exportar); };
    renderRodape();
  }

  function passoAtual(l) {
    if (l.estado !== 'trabalhando' || !l.ultimo) return { tit: l.passo || ROTULO[l.estado], det: '' };
    try { const d = CHAT.descrever(l.ultimo); return { tit: d.tit, det: d.det || '' }; } catch { return { tit: l.passo, det: '' }; }
  }
  function renderRodando(c, l) {
    const p = passoAtual(l);
    c.innerHTML = `<div class="lt-status rodando">
        <div class="lt-anel"><span></span></div>
        <span class="rot">${ROTULO[l.estado]}</span>
        <h2>${esc(l.cliente)}</h2>
        <p class="lt-passo">${esc(p.tit)}</p>${p.det ? `<code class="det">${esc(String(p.det).slice(0, 140))}</code>` : ''}
        <div class="lt-meta"><span id="ltTempo">${l.inicio && l.estado !== 'na-fila' ? dur(Date.now() - l.inicio) : 'esperando a vez'}</span>${l.passos ? `<span>${l.passos} passos</span>` : ''}${l.custo != null ? `<span>US$ ${(+l.custo).toFixed(2)}</span>` : ''}</div>
        <div class="lt-botoes">${l.projeto ? `<button class="btn suave" id="ltAbrir"><i data-i="eye"></i>Acompanhar no projeto</button>` : ''}<button class="btn perigo" id="ltParar"><i data-i="stop"></i>${l.estado === 'na-fila' ? 'Tirar da fila' : 'Parar'}</button></div>
      </div>`;
    aplicarIcones(c);
    c.querySelector('#ltAbrir')?.addEventListener('click', () => abrirProjeto(l.projeto));
    c.querySelector('#ltParar').onclick = () => api.chamar('lotes:parar', l.id);
    if (l.inicio && l.estado !== 'na-fila') relogio = setInterval(() => { const t = c.querySelector('#ltTempo'); if (t) t.textContent = dur(Date.now() - l.inicio); }, 1000);
  }
  function renderFim(c, l) {
    const ok = l.estado === 'pronto';
    c.innerHTML = `<div class="lt-status ${ok ? 'ok' : 'falhou'}">
        <div class="lt-selo"><i data-i="${ok ? 'check' : 'alert'}"></i></div>
        <span class="rot">${ROTULO[l.estado]}</span>
        <h2>${esc(l.cliente)}</h2>
        <div class="lt-meta">${l.inicio && l.fim ? `<span>${dur(l.fim - l.inicio)}</span>` : ''}${l.custo != null ? `<span>US$ ${(+l.custo).toFixed(2)}</span>` : ''}${l.projeto ? `<span>projeto “${esc(l.projeto)}”</span>` : ''}</div>
        ${ok ? (l.resumo ? `<div class="lt-resumo">${esc(l.resumo)}</div>` : '') : `<p class="erro">${esc(l.erro || l.passo || '')}</p>`}
        <div class="lt-botoes">
          ${ok ? '' : `<button class="btn suave" id="ltDeNovo"><i data-i="refresh"></i>${l.projeto ? 'Continuar de onde parou' : 'Tentar de novo'}</button>`}
          ${l.projeto ? `<button class="btn primario" id="ltAbrir"><i data-i="edit"></i>Abrir no editor</button>` : ''}
        </div>
      </div>`;
    aplicarIcones(c);
    c.querySelector('#ltAbrir')?.addEventListener('click', () => abrirProjeto(l.projeto));
    c.querySelector('#ltDeNovo')?.addEventListener('click', () => gerar([l.id]));
  }

  /* ── ações ── */
  async function novo() {
    await salvarJa();
    const r = receitas.find(x => x.id === RECEITA_PADRAO) || receitas[0];
    const l = await api.chamar('lotes:novo', { receita: r?.id || '' });
    if (!dados.lista.some(x => x.id === l.id)) dados.lista.push(l);
    sel = l.id; render();
  }
  async function apagar(id) {
    const l = dados.lista.find(x => x.id === id);
    if (l && (l.cliente || l.links || l.arquivos?.length) && !confirm(`Apagar o lote "${l.cliente || 'Novo lote'}"? O projeto que ele criou continua na lista de projetos.`)) return;
    try { await api.chamar('lotes:apagar', id); } catch (e) { return toast(e.message, { tipo: 'erro' }); }
    dados.lista = dados.lista.filter(x => x.id !== id);
    if (sel === id) sel = dados.lista[dados.lista.length - 1]?.id || null;
    render();
  }
  async function gerar(ids) {
    if (!ids.length) return;
    try { await api.chamar('lotes:gerar', ids); toast(ids.length > 1 ? `${ids.length} lotes na fila` : 'Lote na fila — o Claude começa já', { tipo: 'ok', ico: 'sparkle' }); }
    catch (e) { toast(e.message, { tipo: 'erro' }); }
  }
  async function abrirProjeto(nome) {
    fechar();
    if (S.nome === nome) fecharInicio(); else await APP.abrir(nome);
  }

  // arquivos soltos em qualquer lugar da tela vão para o lote aberto (no passo do material)
  tela.addEventListener('dragover', e => { if (lote()?.estado === 'rascunho' && lote()?.etapa !== 2) { e.preventDefault(); tela.querySelector('#fSoltar')?.classList.add('alvo'); } });
  tela.addEventListener('dragleave', e => { if (e.target === tela || e.target.id === 'fSoltar') tela.querySelector('#fSoltar')?.classList.remove('alvo'); });
  tela.addEventListener('drop', e => {
    if (lote()?.estado !== 'rascunho' || lote()?.etapa === 2) return;
    e.preventDefault(); e.stopPropagation();
    const fs = [...e.dataTransfer.files].map(f => api.caminhoDe(f)).filter(Boolean);
    if (fs.length) addArquivos(fs);
  });

  // atualizações do motor (fila, passo atual, fim)
  api.on.lotes(d => {
    const antes = lote();
    const estadoAntes = antes?.estado, ultimoAntes = JSON.stringify([antes?.ultimo, antes?.passo, antes?.custo]);
    // o que está sendo digitado e ainda não foi gravado vale mais que a cópia que chegou
    for (const l of d.lista) { const p = pend.get(l.id); if (p) Object.assign(l, p.campos); }
    dados = d;
    $('#btnLotes')?.classList.toggle('rodando', d.lista.some(l => RODANDO.includes(l.estado)));
    if (tela.classList.contains('oculto')) return;
    const l = lote();
    if (!l) { sel = dados.lista[0]?.id || null; return render(); }
    renderAbas();
    const btn = tela.querySelector('#ltGerarTodos'); const n = dados.lista.filter(prontoGerar).length;
    if (btn) { btn.disabled = !n; btn.lastChild.textContent = `Gerar todos${n ? ` (${n})` : ''}`; }
    tela.querySelectorAll('#ltSim button').forEach(b => b.classList.toggle('on', +b.dataset.n === dados.simultaneos));
    if (l.estado !== estadoAntes || (RODANDO.includes(l.estado) && JSON.stringify([l.ultimo, l.passo, l.custo]) !== ultimoAntes)) renderCorpo();
  });

  async function abrir() {
    [dados, receitas] = await Promise.all([api.chamar('lotes:listar'), api.chamar('receitas:listar').catch(() => [])]);
    if (!sel || !lote()) sel = (dados.lista.find(l => RODANDO.includes(l.estado)) || dados.lista[dados.lista.length - 1])?.id || null;
    tela.classList.remove('oculto');
    render();
    if (!dados.lista.length) novo();
  }
  function fechar() { salvarJa(); clearInterval(relogio); tela.classList.add('oculto'); }
  return { abrir, fechar };
})();
