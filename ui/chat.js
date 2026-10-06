/* Chat com o Claude: cada passo aparece na hora (texto, raciocínio, ferramenta e resultado). */
const CHAT = (() => {
  const lista = $('#mensagens'), entrada = $('#entrada');
  const els = new Map();       // chave → elemento
  let anexos = [];             // {id, nome}
  let colado = true;           // rolar junto quando está no fim

  lista.addEventListener('scroll', () => { colado = lista.scrollHeight - lista.scrollTop - lista.clientHeight < 60; });
  const rolar = () => { if (colado) lista.scrollTop = lista.scrollHeight; };

  /* nome amigável de cada ferramenta */
  function descrever(ev) {
    const e = ev.entrada || {}, n = ev.nome;
    const arq = p => String(p || '').split(/[\\/]/).slice(-2).join('/');
    if (n === 'Bash' || n === 'PowerShell') {
      const c = String(e.command || '');
      const bo = c.match(/(?:^|[;&|]\s*|\s)bo\s+(\w+)(.*)$/m);
      if (bo) {
        const nomes = { estado: 'Lendo a linha do tempo', importar: 'Importando mídia', transcrever: 'Transcrevendo', texto: 'Lendo a transcrição', silencio: 'Procurando silêncio', folha: 'Gerando folha de contato', quadro: 'Renderizando um quadro', legenda: 'Conferindo a legenda', exportar: 'Exportando o vídeo', receitas: 'Lendo as receitas', ajuda: 'Vendo os comandos' };
        return { ico: bo[1] === 'quadro' || bo[1] === 'folha' ? 'image' : bo[1] === 'exportar' ? 'export' : bo[1] === 'transcrever' ? 'captions' : 'terminal', tit: nomes[bo[1]] || 'Comando do editor', det: c };
      }
      if (/ffmpeg|ffprobe/.test(c)) return { ico: 'film', tit: e.description || 'Processando vídeo (ffmpeg)', det: c };
      if (/yt-dlp/.test(c)) return { ico: 'download', tit: e.description || 'Baixando', det: c };
      return { ico: 'terminal', tit: e.description || 'Rodando um comando', det: c };
    }
    if (n === 'Read') {
      const img = /\.(png|jpe?g|webp)$/i.test(e.file_path || '');
      return { ico: img ? 'eye' : 'file', tit: img ? 'Olhando a imagem' : /receitas/.test(e.file_path) ? 'Lendo a receita' : /projeto\.json$/.test(e.file_path) ? 'Lendo a linha do tempo' : 'Lendo arquivo', det: arq(e.file_path), img: img ? e.file_path : null };
    }
    if (n === 'Edit' || n === 'MultiEdit') return { ico: 'edit', tit: /projeto\.json$/.test(e.file_path) ? 'Editando a linha do tempo' : /transcricoes/.test(e.file_path) ? 'Corrigindo a transcrição' : 'Editando arquivo', det: arq(e.file_path) };
    if (n === 'Write') return { ico: 'edit', tit: /receitas/.test(e.file_path) ? 'Salvando uma receita' : /projeto\.json$/.test(e.file_path) ? 'Reescrevendo a linha do tempo' : 'Criando arquivo', det: arq(e.file_path) };
    if (n === 'Glob' || n === 'Grep') return { ico: 'search', tit: 'Procurando', det: e.pattern || '' };
    if (n === 'WebFetch') return { ico: 'globe', tit: 'Abrindo página', det: e.url || '' };
    if (n === 'WebSearch') return { ico: 'globe', tit: 'Pesquisando na web', det: e.query || '' };
    if (n === 'Task' || n === 'Agent') return { ico: 'brain', tit: 'Subagente: ' + (e.description || ''), det: '' };
    return { ico: 'terminal', tit: n || 'Ferramenta', det: '' };
  }

  function elUsuario(ev) {
    const d = html(`<div class="msg-u">${esc(ev.texto)}</div>`);
    // prints do preview anexados: aparecem junto da mensagem
    if (ev.imagens?.length) {
      const g = html(`<div class="msg-prints">${ev.imagens.map(p => `<img src="${urlArquivo(p)}" title="Abrir">`).join('')}</div>`);
      g.querySelectorAll('img').forEach((im, i) => im.onclick = () => abrirImagem(ev.imagens[i]));
      d.prepend(g);
    }
    return d;
  }
  function elTexto(ev) { const d = html(`<div class="msg-c"></div>`); d.innerHTML = markdown(ev.texto); return d; }
  function elPensando(ev) {
    const d = html(`<div class="pensando${ev.fim ? '' : ' vivo'}"><div class="rot"><i data-i="brain"></i><span>${ev.fim ? 'Raciocínio' : 'Pensando…'}</span></div><div class="txt"></div></div>`);
    d.querySelector('.txt').textContent = ev.texto || '';
    d.onclick = () => d.classList.toggle('aberto');
    if (ev.fim && !String(ev.texto || '').trim()) d.classList.add('oculto');
    return d;
  }
  function elPlano(ev) {
    const todos = ev.entrada?.todos || [];
    const d = html(`<div class="passo ok"><div class="plano"></div></div>`);
    d.querySelector('.plano').innerHTML = `<div style="font-size:11px;color:var(--texto-3);text-transform:uppercase;letter-spacing:.7px;margin-bottom:4px">Plano</div>` + todos.map(t =>
      `<div class="it ${t.status === 'completed' ? 'feito' : t.status === 'in_progress' ? 'fazendo' : ''}"><span class="b">${t.status === 'completed' ? svgIcone('check') : ''}</span><span>${esc(t.status === 'in_progress' ? (t.activeForm || t.content) : t.content)}</span></div>`).join('');
    return d;
  }
  function elFerramenta(ev) {
    if (ev.nome === 'TodoWrite') return elPlano(ev);
    const d = descrever(ev);
    const estado = ev.estado === 'ok' ? 'ok' : ev.estado === 'erro' ? 'erro' : 'rodando';
    const el = html(`<div class="passo ${estado}"><div class="cab"><div class="ico"><i data-i="${d.ico}"></i></div><div class="tit"><b></b><span></span></div><div class="est">${estado === 'ok' ? '<i data-i="check"></i>' : estado === 'erro' ? '<i data-i="x"></i>' : ''}</div></div><div class="det"></div></div>`);
    el.querySelector('.tit b').textContent = d.tit;
    el.querySelector('.tit span').textContent = d.det.split('\n')[0];
    const det = el.querySelector('.det');
    let h = '';
    if (ev.entrada) {
      const e = ev.entrada;
      const mostra = ev.nome === 'Bash' ? e.command : ev.nome === 'Edit' ? `${e.file_path}\n\n− ${String(e.old_string).slice(0, 1500)}\n\n+ ${String(e.new_string).slice(0, 1500)}` : ev.nome === 'Write' ? `${e.file_path}\n\n${String(e.content).slice(0, 3000)}` : JSON.stringify(e, null, 1);
      h += `<div class="rot-det">Entrada</div><pre>${esc(mostra)}</pre>`;
    }
    if (ev.saida != null) h += `<div class="rot-det">${ev.erro ? 'Erro' : 'Resultado'}</div><pre>${esc(String(ev.saida).slice(0, 8000))}</pre>`;
    det.innerHTML = h;
    // quadro que o Claude renderizou ou olhou: aparece no chat
    const img = d.img || (ev.saida && String(ev.saida).match(/(?:quadro|folha): (.+\.png)/)?.[1]);
    if (img && (ev.estado === 'ok' || d.img)) {
      const mini = html(`<div class="img-mini"><img src="${urlArquivo(img.trim())}?v=${ev.quando || Date.now()}"></div>`);
      mini.querySelector('img').onclick = ev2 => { ev2.stopPropagation(); abrirImagem(img.trim()); };
      mini.querySelector('img').onerror = () => mini.remove();
      el.append(mini);
    }
    el.querySelector('.cab').onclick = () => el.classList.toggle('aberto');
    return el;
  }
  function elFim(ev) {
    const partes = [];
    if (ev.cancelado) partes.push('interrompido');
    else if (ev.erro) partes.push('erro: ' + ev.erro.slice(0, 200));
    else partes.push('pronto');
    if (ev.duracao) partes.push(ev.duracao >= 60000 ? `${Math.round(ev.duracao / 60000)} min` : `${Math.round(ev.duracao / 1000)}s`);
    if (ev.custo) partes.push('US$ ' + ev.custo.toFixed(2).replace('.', ','));
    return html(`<div class="fim-turno${ev.erro ? ' erro' : ''}">${esc(partes.join(' · '))}</div>`);
  }
  function construir(ev) {
    if (ev.tipo === 'usuario') return elUsuario(ev);
    if (ev.tipo === 'texto') return elTexto(ev);
    if (ev.tipo === 'pensando') return elPensando(ev);
    if (ev.tipo === 'ferramenta') return elFerramenta(ev);
    if (ev.tipo === 'fim') return elFim(ev);
    if (ev.tipo === 'divisor') return html(`<div class="divisor-chat">— ${esc(ev.texto)} —</div>`);
    return null;
  }

  /* estado do chat na memória (mesma regra de mescla do processo principal) */
  function mesclar(ev) {
    const ms = S.chat.mensagens;
    if (ev.tipo === 'inicio') { S.chat.modelo = ev.modelo; mostrarModelo(); return null; }
    if (ev.tipo === 'resultado') {
      const f = ms.find(x => x.tipo === 'ferramenta' && x.chave === ev.chave);
      if (f) { f.saida = ev.saida; f.erro = ev.erro; f.estado = ev.erro ? 'erro' : 'ok'; }
      return f;
    }
    const i = ev.chave ? ms.findIndex(x => x.chave === ev.chave && x.tipo === ev.tipo) : -1;
    if (i >= 0) { const a = ms[i]; Object.assign(a, ev, ev.entrada == null && a.entrada ? { entrada: a.entrada } : {}); return a; }
    const novo = { ...ev, quando: Date.now() }; ms.push(novo); return novo;
  }
  function aplicar(ev) {
    const alvo = mesclar(ev);
    if (!alvo) return;
    lista.querySelector('.chat-vazio')?.remove();
    const velho = els.get(alvo.chave + alvo.tipo);
    // texto chegando aos pedaços: só troca o conteúdo
    if (velho && alvo.tipo === 'texto') { velho.innerHTML = markdown(alvo.texto); velho.classList.toggle('cursor-texto', S.rodando); rolar(); return; }
    if (velho && alvo.tipo === 'pensando') { velho.querySelector('.txt').textContent = alvo.texto; velho.classList.toggle('vivo', !alvo.fim); velho.classList.toggle('oculto', !!alvo.fim && !String(alvo.texto || '').trim()); velho.querySelector('.rot span').textContent = alvo.fim ? 'Raciocínio' : 'Pensando…'; rolar(); return; }
    const novo = construir(alvo);
    if (!novo) return;
    if (velho) { if (velho.classList.contains('aberto')) novo.classList.add('aberto'); velho.replaceWith(novo); } else lista.append(novo);
    els.set(alvo.chave + alvo.tipo, novo);
    lista.querySelectorAll('.cursor-texto').forEach(x => { if (x !== novo) x.classList.remove('cursor-texto'); });
    if (alvo.tipo === 'texto' && S.rodando) novo.classList.add('cursor-texto');
    rolar();
  }
  function renderTudo() {
    lista.innerHTML = ''; els.clear();
    const ms = S.chat?.mensagens || [];
    if (!ms.length) {
      lista.append(html(`<div class="chat-vazio"><b>Sem mensagens neste projeto.</b>Escreva o que quer na edição — por exemplo “gancho com a reação surpresa” ou “legenda no padrão”. Cada passo do Claude aparece aqui, e o resultado, no preview.</div>`));
    }
    for (const ev of ms) { const el = construir(ev); if (el) { lista.append(el); els.set(ev.chave + ev.tipo, el); } }
    colado = true; lista.scrollTop = lista.scrollHeight;
    mostrarModelo();
  }
  function mostrarModelo() { $('#chatModelo').textContent = S.chat?.modelo ? S.chat.modelo.replace(/^claude-/, '').replace(/-\d{8}$/, '') : ''; $('#chatModelo').classList.toggle('oculto', !S.chat?.modelo); }
  function estado(rodando) {
    S.rodando = rodando;
    $('#direita').classList.toggle('trabalhando', rodando);
    PENSA.ligar(rodando);
    $('#chatStatusTxt').textContent = rodando ? 'trabalhando…' : '';
    $('#btnEnviar').classList.toggle('oculto', rodando);
    $('#btnParar').classList.toggle('oculto', !rodando);
    if (!rodando) lista.querySelectorAll('.cursor-texto').forEach(x => x.classList.remove('cursor-texto'));
  }

  /* ── enviar ── */
  async function enviar(texto) {
    texto = (texto ?? entrada.value).trim();
    if (!texto || !S.nome) return;
    if (S.rodando) { toast('O Claude ainda está trabalhando. Espere ou clique em parar.', { tipo: 'erro' }); return; }
    await salvarPendente();
    const ctx = { comp: S.comp, tempo: S.t, duracao: duracao(), selecao: [...S.sel].map(id => { const r = acharItem(id); return r ? `${id} (${r.f.id}${r.it.midia ? ', ' + r.it.midia : ''})` : id; }),
      anexos: anexos.filter(a => !a.print).map(a => `${a.id} (${a.nome})`), prints: anexos.filter(a => a.print).map(a => ({ caminho: a.caminho, tempo: a.tempo, comp: a.comp, tipo: a.colada ? 'imagem' : 'print' })) };
    entrada.value = ''; ajustarAltura(); anexos = []; mostrarAnexos();
    colado = true;
    try { await api.chamar('chat:enviar', S.nome, texto, ctx); }
    catch (e) { toast(e.message, { tipo: 'erro' }); }
  }
  function ajustarAltura() { entrada.style.height = 'auto'; entrada.style.height = Math.min(180, entrada.scrollHeight) + 'px'; }
  entrada.addEventListener('input', ajustarAltura);
  entrada.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } });
  $('#btnEnviar').onclick = () => enviar();
  $('#btnParar').onclick = () => api.chamar('chat:parar', S.nome);
  $('#btnNovaConversa').onclick = async () => {
    if (S.rodando) return;
    S.chat = await api.chamar('chat:nova', S.nome);
    renderTudo(); toast('Nova conversa: o Claude começa sem o histórico anterior.', { ico: 'newchat' });
  };
  function mostrarContexto() {
    const c = $('#contextoChat');
    if (!S.projeto) { c.innerHTML = ''; return; }
    const partes = [];
    if (S.comps?.lista.length > 1) partes.push(S.comps.lista.find(c => c.id === S.comp)?.nome || S.comp);
    partes.push(`agulha ${fmtCurto(S.t)}`);
    if (S.sel.size) partes.push(`selecionado: ${[...S.sel].join(', ')}`);
    c.innerHTML = partes.map(p => `<span>${esc(p)}</span>`).join('');
  }
  let ultimoCtx = 0;
  ouvir('tempo', () => { const a = performance.now(); if (a - ultimoCtx > 250) { ultimoCtx = a; mostrarContexto(); } });
  ouvir('selecao', mostrarContexto);

  /* anexos: arquivos entram no projeto e o Claude fica sabendo */
  async function anexar(caminhos) {
    if (!caminhos.length || !S.nome) return;
    try {
      toast(`Importando ${caminhos.length} arquivo(s)…`, { ico: 'upload', dur: 1600 });
      const r = await api.chamar('midia:importar', S.nome, caminhos);
      APP.receberProjeto(r.projeto, r.midia);
      for (const id of r.ids) if (!anexos.some(a => a.id === id)) anexos.push({ id, nome: r.projeto.midias[id]?.nome });
      mostrarAnexos();
    } catch (e) { toast(e.message, { tipo: 'erro' }); }
  }
  function mostrarAnexos() {
    const c = $('#anexos');
    c.innerHTML = anexos.map((a, i) => a.print
      ? `<span class="anexo anexo-print"><img src="${urlArquivo(a.caminho)}"><span>${a.colada ? 'Imagem colada' : `Print · ${fmt(a.tempo)}`}</span><button data-i2="${i}"><i data-i="x"></i></button></span>`
      : `<span class="anexo"><i data-i="paperclip"></i>${esc(a.id)} · ${esc(a.nome)}<button data-i2="${i}"><i data-i="x"></i></button></span>`).join('');
    aplicarIcones(c);
    c.querySelectorAll('button').forEach(b => b.onclick = () => { anexos.splice(+b.dataset.i2, 1); mostrarAnexos(); });
  }
  $('#btnAnexar').onclick = async () => anexar(await api.chamar('midia:escolher'));
  const caixa = $('#caixaEntrada');
  caixa.addEventListener('dragover', e => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); e.stopPropagation(); caixa.classList.add('alvo'); } });
  caixa.addEventListener('dragleave', () => caixa.classList.remove('alvo'));
  /* Ctrl+V: imagem copiada (print do Windows, navegador…) entra como anexo de imagem;
     arquivo copiado no Explorer: imagem vira anexo de imagem, vídeo/áudio entra no projeto como mídia */
  entrada.addEventListener('paste', async e => {
    if (!S.nome) return;
    const itens = [...(e.clipboardData?.items || [])];
    const arquivos = [...(e.clipboardData?.files || [])];
    const caminhos = arquivos.map(f => api.caminhoDe(f)).filter(Boolean);
    const imagens = itens.filter(i => i.kind === 'file' && i.type.startsWith('image/'));
    if (!caminhos.length && !imagens.length) return;   // texto: cola normal
    e.preventDefault();
    const deDisco = caminhos.filter(c => /\.(png|jpe?g|webp|gif|bmp)$/i.test(c));
    const midias = caminhos.filter(c => !deDisco.includes(c));
    for (const c of deDisco) anexos.push({ print: true, colada: true, caminho: c });
    if (!caminhos.length) {
      for (const it of imagens) {
        const blob = it.getAsFile(); if (!blob) continue;
        const b64 = await new Promise(ok => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.readAsDataURL(blob); });
        try {
          const caminho = await api.chamar('chat:colarImagem', S.nome, b64, (blob.type.split('/')[1] || 'png').replace('jpeg', 'jpg'));
          anexos.push({ print: true, colada: true, caminho });
        } catch (err) { toast('Não consegui colar a imagem: ' + err.message, { tipo: 'erro' }); }
      }
    }
    mostrarAnexos();
    if (midias.length) anexar(midias);
    if (deDisco.length || imagens.length) toast('Imagem anexada — escreva o que quer', { ico: 'image', dur: 1800 });
  });
  caixa.addEventListener('drop', e => {
    caixa.classList.remove('alvo');
    const fs = [...e.dataTransfer.files]; if (!fs.length) return;
    e.preventDefault(); e.stopPropagation(); $('#soltar').classList.add('oculto');
    anexar(fs.map(f => api.caminhoDe(f)).filter(Boolean));
  });
  lista.addEventListener('click', e => { const a = e.target.closest('a[data-link]'); if (a) { e.preventDefault(); const l = a.dataset.link; if (/^[A-Z]:[\\/]/i.test(l)) api.chamar('abrir', l); } });

  function abrirImagem(p) {
    abrirModal(`<img src="${urlArquivo(p)}?v=${Date.now()}" style="max-width:100%;max-height:75vh;border-radius:12px;display:block;margin:auto"><div class="acoes"><button class="btn suave" id="mAbrir"><i data-i="folder"></i>Mostrar arquivo</button><button class="btn primario" id="mOk">Fechar</button></div>`,
      cx => { cx.style.width = 'auto'; cx.querySelector('#mOk').onclick = fecharModal; cx.querySelector('#mAbrir').onclick = () => api.chamar('abrir', p); });
  }

  /* receitas como atalhos acima da caixa de texto */
  function chips(receitas) {
    const c = $('#chips');
    c.innerHTML = receitas.map(r => `<button class="chip" data-id="${r.id}" title="${esc(r.resumo)}"><i data-i="${r.icone}"></i>${esc(r.titulo.replace(/ (com|por|de|e) .*$/i, ''))}</button>`).join('');
    aplicarIcones(c);
    c.querySelectorAll('.chip').forEach(b => b.onclick = () => { const r = receitas.find(x => x.id === b.dataset.id); usarPedido(r.pedido || r.titulo); });
  }
  function usarPedido(txt) {
    entrada.value = txt; ajustarAltura(); entrada.focus();
    const i = txt.indexOf('['); if (i >= 0) entrada.setSelectionRange(i, txt.indexOf(']') + 1); else entrada.setSelectionRange(txt.length, txt.length);
  }

  api.on.chatEvento(({ projeto, ev }) => { if (projeto === S.nome && S.chat) aplicar(ev); });
  api.on.chatEstado(({ projeto, rodando }) => { if (projeto === S.nome) estado(rodando); });
  /* print do preview: renderiza o quadro da agulha e anexa na próxima mensagem */
  let printando = false;
  async function printar() {
    if (!S.nome || printando) return;
    if (duracao() <= 0) { toast('A linha do tempo está vazia.', { tipo: 'erro' }); return; }
    printando = true;
    document.querySelectorAll('.btn-print').forEach(b => b.classList.add('carregando'));
    try {
      PV.pausar();
      await salvarPendente();
      const t = S.t;
      const caminho = await api.chamar('quadro:print', S.nome, t, S.comp);
      anexos.push({ print: true, caminho, tempo: t, comp: S.comp });
      mostrarAnexos();
      entrada.focus();
      toast(`Print de ${fmt(t)} anexado — escreva o que quer mudar`, { ico: 'camera', dur: 2500 });
    } catch (e) { toast('Não consegui fazer o print: ' + e.message, { tipo: 'erro' }); }
    printando = false;
    document.querySelectorAll('.btn-print').forEach(b => b.classList.remove('carregando'));
  }
  return { renderTudo, estado, chips, usarPedido, anexar, mostrarContexto, printar, descrever };
})();
