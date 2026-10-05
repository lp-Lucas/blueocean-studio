/* Liga tudo: projetos, mídia, receitas, atalhos, tarefas, exportação. */

/* ── operações de edição ── */
const OPS = {
  dividir() {
    const t = S.t, p = S.projeto; let n = 0;
    const alvos = S.sel.size ? [...S.sel].map(acharItem).filter(Boolean)
      : p.faixas.filter(f => f.tipo === 'video' || f.tipo === 'audio' || f.tipo === 'texto').flatMap(f => f.itens.map(it => ({ f, it })));
    for (const { f, it } of alvos) {
      const fim = M.fimItem(f, it);
      if (!(t > it.inicio + 0.02 && t < fim - 0.02) || f.tipo === 'efeito') continue;
      const b = JSON.parse(JSON.stringify(it)); b.id = M.novoId(f.tipo === 'texto' ? 't' : 'c');
      if (f.tipo === 'texto') { it.fim = t; b.inicio = t; }
      else { const corte = it.entrada + (t - it.inicio); it.saida = corte; b.entrada = corte; b.inicio = t; it.sai = 0; b.entra = 0; }
      f.itens.push(b); n++;
      if (S.sel.has(it.id)) S.sel.add(b.id);
    }
    if (n) { commit(); toast(`Dividido em ${fmt(t)}`, { ico: 'scissors', dur: 1500 }); }
  },
  apagar(fecharBuraco) {
    if (!S.sel.size) return;
    if (S.sel.has('legenda')) { S.projeto.legenda.ativa = false; S.sel.delete('legenda'); }
    for (const id of S.sel) {
      const r = acharItem(id); if (!r) continue;
      const { f, it } = r, dur = M.fimItem(f, it) - it.inicio, ini = it.inicio;
      f.itens.splice(f.itens.indexOf(it), 1);
      if (fecharBuraco) for (const o of f.itens) if (o.inicio >= ini) { o.inicio = Math.max(0, o.inicio - dur); if (f.tipo === 'texto') o.fim -= dur; }
    }
    S.sel.clear(); emitir('selecao'); commit();
  },
  duplicar() {
    for (const id of [...S.sel]) {
      const r = acharItem(id); if (!r) continue;
      const b = JSON.parse(JSON.stringify(r.it)); b.id = M.novoId('c');
      const d = M.fimItem(r.f, r.it) - r.it.inicio;
      b.inicio = M.fimItem(r.f, r.it); if (r.f.tipo === 'texto') b.fim = b.inicio + d;
      r.f.itens.push(b);
    }
    commit();
  },
  inserirMidia(id, { faixa, tempo } = {}) {
    const p = S.projeto, m = p.midias[id]; if (!m) return;
    let f = p.faixas.find(x => x.id === faixa);
    if (!f || !((f.tipo === 'video' && m.tipo !== 'audio') || f.tipo === 'audio')) {
      f = m.tipo === 'audio' ? (p.faixas.find(x => x.tipo === 'audio') || (p.faixas.push({ id: 'A1', tipo: 'audio', nome: 'Áudio', itens: [] }), p.faixas.at(-1))) : p.faixas.find(x => x.tipo === 'video');
    }
    const fimFaixa = f.itens.reduce((a, it) => Math.max(a, M.fimItem(f, it)), 0);
    const it = { id: M.novoId('c'), midia: id, inicio: tempo != null ? tempo : fimFaixa, entrada: 0, saida: m.tipo === 'imagem' ? 5 : m.dur };
    f.itens.push(it);
    S.sel.clear(); S.sel.add(it.id);
    commit(); emitir('selecao');
    if (Object.keys(p.midias).length && M.duracao(p) <= it.saida + 0.01) setTimeout(() => LT.encaixar(), 50);
  },
  texto() {
    const p = S.projeto, f = p.faixas.find(x => x.tipo === 'texto');
    // headline no padrão atual: papel rasgado azul, na altura da referência (centro a 395 px de 1920)
    const it = M.aplicarEstilo({ id: M.novoId('t'), inicio: +S.t.toFixed(2), fim: +(S.t + 4.5).toFixed(2), texto: 'Sua headline\naqui', x: p.formato.w / 2, y: Math.round(p.formato.h * 395 / 1920), largura: Math.round(p.formato.w * 0.8) }, 'papel', p.formato.w);
    f.itens.push(it); S.sel.clear(); S.sel.add(it.id); commit(); emitir('selecao'); emitir('focarInspetor', it.id);
  },
  faixa() {
    const p = S.projeto, f = p.faixas.find(x => x.tipo === 'texto');
    const it = { id: M.novoId('q'), tipo: 'qualificacao', inicio: +S.t.toFixed(2), fim: Math.max(duracao(), S.t + 5), texto: 'Para **SAAS B2B** que já faturam acima de **R$30mil** de MRR', entrada: S.t > 0.05 ? 'esquerda' : 'parada' };
    f.itens.push(it); S.sel.clear(); S.sel.add(it.id); commit(); emitir('selecao'); emitir('focarInspetor', it.id);
  },
  leak() {
    const f = S.projeto.faixas.find(x => x.tipo === 'efeito');
    const it = { id: M.novoId('fx'), efeito: 'lightleak', inicio: Math.max(0, +(S.t - 0.2).toFixed(2)) };
    f.itens.push(it); S.sel.clear(); S.sel.add(it.id); commit(); emitir('selecao');
    toast('Light leak com o pico na agulha', { ico: 'sparkle', dur: 1800 });
  },
  novaFaixa() {
    const p = S.projeto; const n = p.faixas.filter(f => f.tipo === 'video').length + 1;
    let id = 'V' + n; while (p.faixas.some(f => f.id === id)) id += "'";
    const ult = p.faixas.map(f => f.tipo).lastIndexOf('video');
    p.faixas.splice(ult + 1, 0, { id, tipo: 'video', nome: 'Vídeo ' + n, itens: [] });
    commit();
  },
  async transcrever(ids) {
    if (!ids.length) { toast('Nada para transcrever.'); return; }
    try { S.trans = await api.chamar('transcrever', S.nome, ids); emitir('transcricoes'); toast('Transcrição pronta', { tipo: 'ok' }); }
    catch (e) { toast(e.message, { tipo: 'erro', dur: 7000 }); }
  },
};

/* ── abas da esquerda ── */
function abrirAba(nome) {
  const bs = $$('#abasEsq button');
  bs.forEach((b, i) => { const on = b.dataset.aba === nome; b.classList.toggle('ativa', on); if (on) $('.aba-indicador').style.transform = `translateX(${i * 100}%)`; });
  $$('.aba-corpo').forEach(c => c.classList.toggle('ativa', c.dataset.corpo === nome));
}
$$('#abasEsq button').forEach(b => b.onclick = () => abrirAba(b.dataset.aba));
ouvir('selecao', () => { if (S.sel.size) abrirAba('ajustes'); });

/* ── mídia ── */
function renderMidia() {
  const c = $('#listaMidia');
  if (!S.projeto) { c.innerHTML = ''; return; }
  const usados = new Set(); for (const f of S.projeto.faixas) for (const it of f.itens) if (it.midia) usados.add(it.midia);
  c.innerHTML = Object.entries(S.projeto.midias).map(([id, m]) => {
    const info = S.midia[id] || {};
    const precisaProxy = m.tipo === 'video' && (m.codec !== 'h264' || Math.max(m.w, m.h) > 1920 || /10|12/.test(m.pix || '') || m.hdr);
    return `<div class="card-midia" draggable="true" data-id="${id}" title="${esc(m.arquivo)}">
      <div class="thumb" style="${info.thumb ? `background-image:url('${urlMidia(info.thumb, id)}')` : ''}">${info.thumb ? '' : `<i data-i="${m.tipo === 'audio' ? 'music' : m.tipo === 'imagem' ? 'image' : 'film'}"></i>`}</div>
      <span class="id">${id}</span>
      <span class="selos">${S.trans[id] ? '<span class="selo ok" title="Transcrito"><i data-i="captions" style="width:10px;height:10px"></i></span>' : ''}${precisaProxy && !info.proxy ? '<span class="selo carregando" title="Preparando preview"></span>' : ''}${usados.has(id) ? '' : '<span class="selo" title="Não está na linha do tempo">livre</span>'}</span>
      <div class="info"><div class="nome">${esc(m.nome)}</div><div class="meta">${m.tipo === 'imagem' ? 'imagem' : fmtCurto(m.dur)} · ${m.tipo === 'audio' ? 'só áudio' : `${m.w}×${m.h}`}${m.audio || m.tipo === 'imagem' ? '' : ' · mudo'}</div></div></div>`;
  }).join('');
  aplicarIcones(c);
  c.querySelectorAll('.card-midia').forEach(el => {
    el.ondragstart = e => { e.dataTransfer.setData('bo/midia', el.dataset.id); e.dataTransfer.effectAllowed = 'copy'; };
    el.ondblclick = () => OPS.inserirMidia(el.dataset.id);
    el.oncontextmenu = e => {
      e.preventDefault();
      const id = el.dataset.id, m = S.projeto.midias[id];
      menuContexto(e.clientX, e.clientY, [
        { txt: 'Pôr na linha do tempo', ico: 'plus', fn: () => OPS.inserirMidia(id) },
        { txt: 'Pôr na agulha', ico: 'plus', fn: () => OPS.inserirMidia(id, { tempo: S.t }) },
        ...(m.audio && S.trans[id] ? [{ txt: 'Corrigir a transcrição', ico: 'edit', fn: () => TRANS.abrir(id) }] : []),
        ...(m.audio ? [{ txt: S.trans[id] ? 'Transcrever de novo' : 'Transcrever', ico: 'captions', fn: () => OPS.transcrever([id]) }] : []),
        { txt: 'Substituir…', ico: 'refresh', fn: () => substituirMidia(id) },
        { txt: 'Mostrar o arquivo', ico: 'folder', fn: () => api.chamar('abrir', m.arquivo) },
        '-',
        { txt: 'Tirar do projeto', ico: 'trash', fn: () => {
          if (S.projeto.faixas.some(f => f.itens.some(it => it.midia === id))) { toast('Essa mídia está na linha do tempo. Apague os itens antes.', { tipo: 'erro' }); return; }
          delete S.projeto.midias[id]; commit(); renderMidia();
        } },
      ]);
    };
  });
}
async function importar(caminhos, opcoes = {}) {
  if (!caminhos?.length || !S.nome) return;
  try {
    const r = await api.chamar('midia:importar', S.nome, caminhos, opcoes);
    APP.receberProjeto(r.projeto, r.midia);
    toast(`${r.ids.length} mídia(s) no projeto`, { tipo: 'ok' });
    return r.ids;
  } catch (e) { toast(e.message, { tipo: 'erro', dur: 7000 }); }
}
$('#btnImportar').onclick = async () => importar(await api.chamar('midia:escolher'));
$('#btnImportarPasta').onclick = async () => { const p = await api.chamar('pasta:escolher'); if (p) importar([p]); };
$('#formLink').onsubmit = e => {
  e.preventDefault();
  const url = $('#inputLink').value.trim(); if (!/^https?:\/\//.test(url)) { toast('Cole um link que comece com http', { tipo: 'erro' }); return; }
  $('#inputLink').value = '';
  const soAudio = $('#modoLink .on')?.dataset.v === 'audio';
  toast(soAudio ? 'Baixando só o áudio… acompanhe no topo' : 'Baixando… acompanhe no topo', { ico: soAudio ? 'music' : 'download' });
  importar([url], { soAudio });
};
$('#modoLink').onclick = e => {
  const b = e.target.closest('button'); if (!b) return;
  $$('#modoLink button').forEach(x => x.classList.toggle('on', x === b));
  $('#inputLink').placeholder = b.dataset.v === 'audio' ? 'Colar link para baixar só o áudio' : 'Colar link (YouTube, Instagram, Drive…)';
};

/* arrastar arquivos do Windows para a janela */
let contaArraste = 0;
addEventListener('dragenter', e => { if (e.dataTransfer.types.includes('Files')) { contaArraste++; $('#soltar').classList.remove('oculto'); } });
addEventListener('dragleave', e => { if (e.dataTransfer.types.includes('Files') && --contaArraste <= 0) { contaArraste = 0; $('#soltar').classList.add('oculto'); } });
addEventListener('dragover', e => { if (e.dataTransfer.types.includes('Files')) e.preventDefault(); });
addEventListener('drop', async e => {
  contaArraste = 0; $('#soltar').classList.add('oculto');
  const fs = [...(e.dataTransfer.files || [])]; if (!fs.length) return;
  e.preventDefault();
  if (!S.nome) { toast('Crie ou abra um projeto primeiro.', { tipo: 'erro' }); return; }
  const caminhos = fs.map(f => api.caminhoDe(f)).filter(Boolean);
  const naLinha = e.target.closest('#linha');
  const tempo = naLinha ? LT.tempoEm(e.clientX) : null;
  const pista = e.target.closest('.pista')?.dataset.faixa;
  const ids = await importar(caminhos);
  if (ids?.length && (naLinha || e.target.closest('#palco'))) {
    let t = tempo;
    for (const id of ids) { OPS.inserirMidia(id, { faixa: pista, tempo: t }); if (t != null) t += S.projeto.midias[id].tipo === 'imagem' ? 5 : S.projeto.midias[id].dur; }
  }
});

/* ── substituir mídia: versão nova do motion sem refazer o resto ── */
async function substituirMidia(id) {
  const m = S.projeto.midias[id]; if (!m) return;
  const arquivo = await api.chamar('midia:escolherUm', `Arquivo novo para ${m.nome}`);
  if (!arquivo) return;
  const novoNome = arquivo.split(/[\\/]/).pop();
  const temTrans = !!S.trans[id] && m.audio;
  const usos = []; for (const f of S.projeto.faixas) for (const it of f.itens) if (it.midia === id) usos.push(it.id);
  const cab = `<h3>Substituir ${esc(id)}</h3>
    <div class="troca-arq"><span class="de">${esc(m.nome)}</span><i data-i="stepfwd"></i><span class="para">${esc(novoNome)}</span></div>
    <p class="sub">Cortes, headlines, faixas, legenda e efeitos que usam esta mídia continuam no lugar${usos.length ? ` (${usos.length} corte(s) nesta composição)` : ''}.</p>`;
  const executar = async verificar => {
    fecharModal();
    toast(verificar ? 'Substituindo e conferindo a transcrição… acompanhe no topo' : 'Substituindo…', { ico: 'refresh', dur: 2500 });
    try {
      const r = await api.chamar('midia:substituir', S.nome, id, arquivo, { verificar });
      if (r.relatorio) resumoSubstituicao(id, r); else toast(`${id} agora é ${r.depois.nome}`, { tipo: 'ok' });
    } catch (e) { toast('Não consegui substituir: ' + e.message, { tipo: 'erro', dur: 8000 }); }
  };
  if (!temTrans) {
    abrirModal(cab + `<div class="acoes"><button class="btn suave" id="mCanc">Cancelar</button><button class="btn primario" id="mSo">Substituir</button></div>`, cx => {
      cx.querySelector('#mCanc').onclick = fecharModal; cx.querySelector('#mSo').onclick = () => executar(false);
    });
    return;
  }
  abrirModal(cab + `<div class="opcoes-subst">
      <button class="opcao" id="mVerif"><span class="ico"><i data-i="captions"></i></span><span><b>Verificar a transcrição</b>
        <small>Transcreve o vídeo novo e compara com o antigo: suas correções e palavras escondidas ficam, a legenda pega o tempo novo. Use quando a fala, o corte ou o tempo mudou.</small></span></button>
      <button class="opcao" id="mSo"><span class="ico"><i data-i="film"></i></span><span><b>Só substituir o vídeo</b>
        <small>Mantém a transcrição como está. Use quando só o visual (motion, cor) mudou e a fala está no mesmo tempo.</small></span></button>
    </div>
    <div class="acoes"><button class="btn suave" id="mCanc">Cancelar</button></div>`, cx => {
    cx.querySelector('#mCanc').onclick = fecharModal;
    cx.querySelector('#mVerif').onclick = () => executar(true);
    cx.querySelector('#mSo').onclick = () => executar(false);
  });
}
function resumoSubstituicao(id, r) {
  const q = r.relatorio;
  const d = q.deslocamento || 0, mexeu = Math.abs(d) >= 0.05;
  const s = v => (v >= 0 ? '+' : '−') + Math.abs(v).toFixed(2).replace('.', ',') + ' s';
  const linhas = [
    [`${q.iguais}`, 'palavras iguais'], [`${q.trocadas}`, 'trocadas'], [`${q.novas}`, 'novas'], [`${q.removidas}`, 'removidas'],
  ];
  abrirModal(`<h3>${esc(id)} substituída</h3>
    <div class="troca-arq"><span class="de">${esc(r.antes.nome)}</span><i data-i="stepfwd"></i><span class="para">${esc(r.depois.nome)}</span></div>
    <div class="numeros">${linhas.map(([n, t]) => `<div><b>${n}</b><span>${t}</span></div>`).join('')}</div>
    <p class="sub">${q.correcoesMantidas || q.ocultasMantidas ? `Mantidas: ${q.correcoesMantidas} correção(ões) suas e ${q.ocultasMantidas} palavra(s) escondida(s). ` : ''}A legenda já está com o tempo do vídeo novo${r.comps.length ? ` em ${r.comps.join(', ')}` : ''}.</p>
    ${mexeu ? `<div class="alerta-tempo"><b>A fala está ${s(d)} ${d > 0 ? 'mais tarde' : 'mais cedo'} no vídeo novo${q.deslocamentoUniforme ? '' : ' (não em todo o vídeo)'}.</b>
      <span>${q.deslocamentoUniforme ? `Os cortes que usam ${esc(id)} ainda apontam para o tempo antigo. Mover os cortes junto mantém cada trecho na mesma fala.` : 'O tempo mudou de um jeito diferente em cada parte: confira os cortes na linha do tempo, ou peça ao Claude para reajustar.'}</span></div>` : ''}
    <div class="acoes"><button class="btn suave" id="mTrans">Ver a transcrição</button>
      ${mexeu && q.deslocamentoUniforme ? `<button class="btn suave" id="mFicar">Deixar os cortes</button><button class="btn primario" id="mMover">Mover os cortes ${s(d)}</button>` : '<button class="btn primario" id="mOk">Pronto</button>'}</div>`, cx => {
    cx.querySelector('#mTrans').onclick = () => { fecharModal(); TRANS.abrir(id); };
    cx.querySelector('#mOk')?.addEventListener('click', fecharModal);
    cx.querySelector('#mFicar')?.addEventListener('click', fecharModal);
    cx.querySelector('#mMover')?.addEventListener('click', async () => {
      fecharModal();
      const n = await api.chamar('midia:moverCortes', S.nome, id, d);
      toast(`${n} corte(s) movidos ${s(d)}`, { tipo: 'ok' });
    });
  });
}

/* ── receitas ── */
let ultimasReceitas = '';
async function renderReceitas() {
  let rs = [];
  try { rs = await api.chamar('receitas:listar'); } catch {}
  const assin = JSON.stringify(rs);
  if (assin === ultimasReceitas) return;
  ultimasReceitas = assin;
  CHAT.chips(rs);
  const c = $('#listaReceitas');
  c.innerHTML = rs.map((r, i) => `<div class="card-receita" data-id="${r.id}" style="animation-delay:${i * 40}ms">
    <div class="cab"><span class="ico"><i data-i="${r.icone}"></i></span><b>${esc(r.titulo)}</b></div>
    <p>${esc(r.resumo)}</p>
    <div class="acoes"><button class="btn primario" data-usar style="height:28px;font-size:12px"><i data-i="send"></i>Usar</button><button class="btn suave" data-ver style="height:28px;font-size:12px"><i data-i="book"></i>Ver o processo</button></div>
    <div class="corpo-md"></div></div>`).join('')
    + `<button class="btn suave cheio" id="btnNovaReceita"><i data-i="plus"></i>Salvar o que fizemos como receita</button>`;
  aplicarIcones(c);
  c.querySelectorAll('.card-receita').forEach(el => {
    const r = rs.find(x => x.id === el.dataset.id);
    el.querySelector('[data-usar]').onclick = () => CHAT.usarPedido(r.pedido || r.titulo);
    el.querySelector('[data-ver]').onclick = async () => {
      if (!el.classList.contains('aberta')) { const md = await api.chamar('receitas:ler', r.id); el.querySelector('.corpo-md').innerHTML = markdown(md.replace(/^(Ícone|Pedido):.*$/gm, '').replace(/^#s.*$/m, '').replace(/^>s.*$/m, '')); }
      el.classList.toggle('aberta');
    };
  });
  $('#btnNovaReceita').onclick = () => CHAT.usarPedido('Salve o processo que acabamos de fazer como uma receita nova, com as decisões que eu aprovei, para usar sempre assim.');
}

/* ── projetos ── */
const APP = {
  async abrir(nome) {
    try {
      await salvarPendente();
      const d = await api.chamar('projetos:abrir', nome);
      PV.pausar();
      COMPS.limpar();
      S.comps = d.comps; S.comp = d.projeto.comp;
      S.nome = nome; S.projeto = M.normalizar(d.projeto); S.trans = d.transcricoes; S.midia = d.midia; S.pasta = d.pasta; S.chat = d.chat;
      S.sel.clear(); S.t = 0; S.hist = []; S.histI = -1; registrar();
      localStorage.setItem('ultimoProjeto', nome);
      $('#nomeProjeto').textContent = nome;
      $('#boasVindas').classList.add('oculto');
      atualizarFormato();
      emitir('projeto', { abrir: true }); emitir('selecao'); emitir('transcricoes');
      renderMidia(); CHAT.renderTudo(); CHAT.estado(d.rodando); CHAT.mostrarContexto(); COMPS.render();
      setTimeout(() => LT.encaixar(), 60);
    } catch (e) { toast('Não consegui abrir: ' + e.message, { tipo: 'erro' }); }
  },
  receberProjeto(p, midia) {
    S.projeto = M.normalizar(p); if (midia) S.midia = midia;
    for (const id of [...S.sel]) if (id !== 'legenda' && !acharItem(id)) S.sel.delete(id);
    registrar(); emitir('projeto', { externo: true }); renderMidia(); atualizarFormato();
  },
};
function atualizarFormato() {
  const f = S.projeto.formato, r = f.w / f.h;
  const nome = Math.abs(r - 9 / 16) < 0.01 ? '9:16' : Math.abs(r - 0.8) < 0.01 ? '4:5' : Math.abs(r - 1) < 0.01 ? '1:1' : Math.abs(r - 16 / 9) < 0.01 ? '16:9' : '';
  $('#infoFormato').textContent = `${nome ? nome + ' · ' : ''}${f.w}×${f.h} · ${f.fps}fps`;
}
ouvir('projeto', o => { if (S.projeto) { atualizarFormato(); $('#vazio').classList.toggle('oculto', duracao() > 0); $('#tempoTotal').textContent = fmt(duracao()); if (!o?.abrir) renderMidiaLeve(); } });
let timerMidia = null; const renderMidiaLeve = () => { clearTimeout(timerMidia); timerMidia = setTimeout(renderMidia, 200); };

function novoProjeto() {
  let formato = '9:16';
  const hoje = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
  abrirModal(`<h3>Novo projeto</h3>
    <div><label class="rot">Nome</label><input class="num" id="mNome" value="Projeto ${hoje}"></div>
    <div><label class="rot">Formato</label><div class="formatos">${[['9:16', 18, 32, 'Reels'], ['4:5', 24, 30, 'Feed'], ['1:1', 28, 28, 'Quadrado'], ['16:9', 36, 20, 'YouTube']].map(([n, w, h, d]) => `<button class="formato${n === '9:16' ? ' on' : ''}" data-f="${n}"><span class="r" style="width:${w}px;height:${h}px"></span><b>${n}</b><span style="font-size:10.5px;color:var(--texto-3)">${d}</span></button>`).join('')}</div></div>
    <div class="acoes"><button class="btn suave" id="mCancelar">Cancelar</button><button class="btn primario" id="mCriar">Criar</button></div>`, cx => {
    cx.querySelectorAll('.formato').forEach(b => b.onclick = () => { formato = b.dataset.f; cx.querySelectorAll('.formato').forEach(x => x.classList.toggle('on', x === b)); });
    cx.querySelector('#mCancelar').onclick = fecharModal;
    const criar = async () => {
      const nome = cx.querySelector('#mNome').value.trim(); if (!nome) return;
      try { await api.chamar('projetos:criar', nome, formato); fecharModal(); const lista = await api.chamar('projetos:listar'); APP.abrir(lista.find(p => p.nome.toLowerCase() === nome.replace(/[\\/:*?"<>|'`]/g, '').replace(/\s+/g, ' ').trim().toLowerCase())?.nome || lista[0].nome); }
      catch (e) { toast(e.message, { tipo: 'erro' }); }
    };
    cx.querySelector('#mCriar').onclick = criar;
    cx.querySelector('#mNome').onkeydown = e => { if (e.key === 'Enter') criar(); };
  });
}
async function listaProjetosHtml() {
  const ps = await api.chamar('projetos:listar');
  return { ps, h: ps.map(p => `<button class="pop-item${p.nome === S.nome ? ' atual' : ''}" data-p="${esc(p.nome)}"><span class="ico" style="${p.capa ? `background-image:url('${urlArquivo(p.capa)}')` : ''}">${p.capa ? '' : '<i data-i="film"></i>'}</span><span style="flex:1;min-width:0"><b>${esc(p.nome)}</b><span>${p.midias} mídia(s) · ${new Date(p.alterado).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span></span></button>`).join('') };
}
$('#btnProjeto').onclick = async () => {
  const pop = $('#popProjetos');
  if (!pop.classList.contains('oculto')) { pop.classList.add('oculto'); return; }
  const { h } = await listaProjetosHtml();
  pop.innerHTML = `<h5>Projetos</h5>${h}<hr style="border:0;height:1px;background:var(--borda);margin:6px 0"><button class="pop-item" id="popNovo"><span class="ico" style="color:var(--azul-claro)"><i data-i="plus"></i></span><b>Novo projeto</b></button>`;
  aplicarIcones(pop);
  const r = $('#btnProjeto').getBoundingClientRect();
  pop.style.left = r.left + 'px'; pop.style.top = (r.bottom + 6) + 'px';
  pop.classList.remove('oculto');
  pop.querySelectorAll('[data-p]').forEach(b => b.onclick = () => { pop.classList.add('oculto'); APP.abrir(b.dataset.p); });
  pop.querySelector('#popNovo').onclick = () => { pop.classList.add('oculto'); novoProjeto(); };
};
/* ── página inicial: projetos em cartões com capa, e os processos salvos ── */
const quando = ms => {
  const d = new Date(ms), hoje = new Date();
  const ontem = new Date(hoje); ontem.setDate(hoje.getDate() - 1);
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === hoje.toDateString()) return 'hoje, ' + hora;
  if (d.toDateString() === ontem.toDateString()) return 'ontem, ' + hora;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) + ', ' + hora;
};
const nomeFormato = f => { if (!f) return ''; const r = f.w / f.h; return Math.abs(r - 9 / 16) < .01 ? '9:16' : Math.abs(r - .8) < .01 ? '4:5' : Math.abs(r - 1) < .01 ? '1:1' : Math.abs(r - 16 / 9) < .01 ? '16:9' : `${f.w}×${f.h}`; };
async function boasVindas() {
  const ps = await api.chamar('projetos:listar');
  let rs = []; try { rs = await api.chamar('receitas:listar'); } catch {}
  const bv = $('#boasVindas');
  bv.innerHTML = `<div class="bv-caixa">
    <div class="bv-heroi"><div class="logo"><img src="../assets/logo.png" alt=""></div>
      <div><h1>Blue Ocean Studio</h1><p>${ps.length ? `${ps.length} projeto${ps.length > 1 ? 's' : ''} · o Claude edita com os processos aprovados da Blue Ocean` : 'Crie o primeiro projeto para começar a editar.'}</p></div>
      <button class="btn primario" id="bvNovo"><i data-i="plus"></i>Novo projeto</button></div>
    <section class="bv-secao"><h2>Projetos recentes</h2><div class="bv-grade">
      ${ps.map((p, i) => `<button class="bv-card" data-p="${esc(p.nome)}" style="animation-delay:${Math.min(i, 12) * 35}ms">
        <div class="capa" style="${p.capa ? `background-image:url('${urlArquivo(p.capa)}')` : ''}">${p.capa ? '' : '<i data-i="film"></i>'}<span class="fmt">${nomeFormato(p.formato)}</span></div>
        <div class="txt"><b>${esc(p.nome)}</b><span>${p.midias} mídia${p.midias === 1 ? '' : 's'} · ${quando(p.alterado)}</span></div></button>`).join('')}
      <button class="bv-card bv-novo" id="bvNovo2"><span class="mais"><i data-i="plus"></i></span>Novo projeto</button>
    </div></section>
    ${rs.length ? `<section class="bv-secao"><h2>Processos salvos</h2><div class="bv-processos">${rs.map(r => `<button class="bv-proc" data-r="${r.id}"><span class="ico"><i data-i="${r.icone}"></i></span><span><b>${esc(r.titulo)}</b><span>${esc(r.resumo)}</span></span></button>`).join('')}</div></section>` : ''}
  </div>`;
  bv.prepend(BOLINHAS_INICIO.canvas);   // o innerHTML apagou o canvas das bolinhas: devolve
  aplicarIcones(bv); bv.classList.remove('oculto');
  bv.querySelector('#bvNovo').onclick = novoProjeto;
  bv.querySelector('#bvNovo2').onclick = novoProjeto;
  // o projeto que já está aberto só volta para ele, sem recarregar
  bv.querySelectorAll('[data-p]').forEach(b => b.onclick = () => b.dataset.p === S.nome ? fecharInicio() : APP.abrir(b.dataset.p));
  bv.querySelectorAll('[data-r]').forEach(b => b.onclick = () => {
    const r = rs.find(x => x.id === b.dataset.r);
    if (!S.nome) { toast('Abra ou crie um projeto para usar o processo.'); return; }
    fecharInicio(); CHAT.usarPedido(r.pedido || r.titulo);
  });
}
function fecharInicio() { if (S.nome) $('#boasVindas').classList.add('oculto'); }
$('#btnHome').onclick = () => { $('#boasVindas').classList.contains('oculto') ? boasVindas() : fecharInicio(); };

/* ── tarefas ── */
const tarefas = new Map();
function renderTarefas() {
  const vivas = [...tarefas.values()].filter(t => !t.fim);
  // no topo só aparece o que está rodando: título, porcentagem e uma barra fina
  const pil = $('#btnTarefas');
  pil.classList.toggle('oculto', !vivas.length);
  const p = vivas.find(t => t.pct != null);
  if (vivas.length) {
    $('#txtTarefas').textContent = `${vivas[0].titulo.slice(0, 40)}${p ? ` — ${p.pct}%` : ''}${vivas.length > 1 ? ` (+${vivas.length - 1})` : ''}`;
    $('#barraTarefas').parentElement.classList.toggle('indef', !p);
    $('#barraTarefas').style.width = (p ? p.pct : 0) + '%';
  }
  const pop = $('#popTarefas');
  if (pop.classList.contains('oculto')) return;
  pop.innerHTML = '<h5>Tarefas</h5>' + ([...tarefas.values()].reverse().map(t => `<div class="tarefa${t.erro ? ' erro' : ''}"><div class="l1"><b>${esc(t.titulo)}</b><span>${t.fim ? (t.erro ? 'erro' : 'pronto') : t.pct != null ? t.pct + '%' : ''}</span>${!t.fim ? `<button class="icone-btn" data-cancelar="${t.id}" title="Cancelar" style="width:22px;height:22px"><i data-i="x"></i></button>` : ''}</div>
    <div class="barra${!t.fim && t.pct == null ? ' indef' : ''}"><b style="width:${t.fim ? 100 : t.pct || 0}%;${t.erro ? 'background:var(--perigo)' : ''}"></b></div><div class="etapa">${esc(t.erro || t.etapa || '')}</div></div>`).join('') || '<div class="bv-vazio">Nada rodando.</div>');
  aplicarIcones(pop);
  pop.querySelectorAll('[data-cancelar]').forEach(b => b.onclick = () => api.chamar('tarefas:cancelar', b.dataset.cancelar));
}
$('#btnTarefas').onclick = () => {
  if (!tarefas.size) return;
  const pop = $('#popTarefas'); pop.classList.toggle('oculto');
  const r = $('#btnTarefas').getBoundingClientRect();
  pop.style.left = Math.max(10, r.left + r.width / 2 - 180) + 'px'; pop.style.top = (r.bottom + 8) + 'px'; pop.style.width = '360px';
  renderTarefas();
};
api.on.tarefa(t => { tarefas.set(t.id, t); renderTarefas(); if (t.fim && t.erro && t.erro !== 'cancelado') toast(`${t.titulo}: ${t.erro.slice(0, 160)}`, { tipo: 'erro', dur: 8000 }); });
api.on.tarefaSumiu(id => { tarefas.delete(id); renderTarefas(); });

/* ── mudanças vindas de fora (Claude) ── */
let timerAviso = null;
api.on.projetoExterno(p => {
  if (!S.nome) return;
  S.realcar = true;
  APP.receberProjeto(p);
  const av = $('#avisoExterno'); av.classList.add('ver');
  clearTimeout(timerAviso); timerAviso = setTimeout(() => av.classList.remove('ver'), 2600);
});
api.on.transcricoes(t => { S.trans = t; emitir('transcricoes'); renderMidiaLeve(); });
api.on.midiaPronta(m => { S.midia = m; emitir('midia'); renderMidiaLeve(); });
api.on.aviso(a => toast(a.texto, { tipo: a.tipo }));
api.on.exportado(({ arquivo }) => toast('Vídeo exportado: ' + arquivo.split(/[\\/]/).pop(), { tipo: 'ok', acao: 'Mostrar', fn: () => api.chamar('abrir', arquivo), dur: 10000 }));
/* o .ass da exportação é montado aqui, com a mesma medida de texto do preview */
api.on.pedirAss(async ({ id, projeto, trans, ini, fim }) => {
  try {
    const p = M.normalizar(projeto);
    await fontesDoProjeto(p);
    api.responderAss(id, M.gerarExportacao(p, trans, medir, ini, fim));
  }
  catch (e) { api.responderAss(id, {}); toast('Erro ao montar a legenda: ' + e.message, { tipo: 'erro' }); }
});

/* ── exportar ── */
$('#btnExportar').onclick = () => {
  if (!S.nome) return;
  if (duracao() <= 0) { toast('A linha do tempo está vazia.', { tipo: 'erro' }); return; }
  let pasta = null;
  const nComps = S.comps?.lista.length || 1;
  abrirModal(`<h3>Exportar vídeo</h3>
    ${nComps > 1 ? `<div><label class="rot">O que exportar</label><div class="segmentos" id="mQuais"><button data-v="esta" class="on">Esta composição</button><button data-v="todas">Todas as ${nComps}</button></div></div>` : ''}<p class="sub">${S.projeto.formato.w}×${S.projeto.formato.h} · ${S.projeto.formato.fps}fps · ${fmt(duracao())} · H.264 + AAC, pronto para postar.</p>
    <div><label class="rot">Nome do arquivo</label><input class="num" id="mNomeArq" value="${esc(nComps > 1 ? `${S.nome} - ${S.comps.lista.find(c => c.id === S.comp)?.nome || ''}` : S.nome)}"></div>
    <div><label class="rot">Pasta</label><div style="display:flex;gap:8px"><input class="num" id="mPasta" readonly value="Pasta do projeto (saidas)"><button class="btn suave" id="mEscolher"><i data-i="folder"></i>Escolher</button></div></div>
    <div class="acoes"><button class="btn suave" id="mCancelar">Cancelar</button><button class="btn primario" id="mExportar">Exportar</button></div>`, cx => {
    cx.querySelector('#mCancelar').onclick = fecharModal;
    cx.querySelector('#mEscolher').onclick = async () => { const p = await api.chamar('pasta:escolher'); if (p) { pasta = p; cx.querySelector('#mPasta').value = p; } };
    const quais = cx.querySelector('#mQuais');
    if (quais) quais.onclick = e => {
      const b = e.target.closest('button'); if (!b) return;
      quais.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      cx.querySelector('#mNomeArq').disabled = b.dataset.v === 'todas';
      cx.querySelector('#mNomeArq').value = b.dataset.v === 'todas' ? 'cada vídeo com o nome da composição' : `${S.nome} - ${S.comps.lista.find(c => c.id === S.comp)?.nome || ''}`;
    };
    cx.querySelector('#mExportar').onclick = async () => {
      const todas = cx.querySelector('#mQuais .on')?.dataset.v === 'todas';
      const arquivo = cx.querySelector('#mNomeArq').value.trim() || S.nome;
      fecharModal();
      await salvarPendente();
      toast(todas ? `Exportando ${nComps} vídeos… acompanhe no topo` : 'Exportando… acompanhe no topo', { ico: 'export' });
      try {
        if (todas) { for (const c of S.comps.lista) await api.chamar('exportar', S.nome, { pasta, comp: c.id }); }
        else await api.chamar('exportar', S.nome, { arquivo, pasta, comp: S.comp });
      } catch (e) { if (e.message !== 'cancelado') toast(e.message, { tipo: 'erro', dur: 9000 }); }
    };
  });
};

/* ── configurações ── */
$('#btnConfig').onclick = async () => {
  const c = await api.chamar('config:ler');
  abrirModal(`<h3>Configurações</h3>
    <div><label class="rot">Modelo do Claude</label><div class="segmentos" id="mModelo">${[['', 'Padrão'], ['opus', 'Opus'], ['sonnet', 'Sonnet'], ['haiku', 'Haiku']].map(([v, n]) => `<button data-v="${v}" class="${(c.modelo || '') === v ? 'on' : ''}">${n}</button>`).join('')}</div></div>
    <div><label class="rot">Claude Code (claude.exe)</label><input class="num" id="mClaude" value="${esc(c.claude)}" placeholder="${esc(c.claudeAchado || 'não encontrado')}"><p class="sub" style="margin-top:4px">Vazio = acha sozinho. Em uso: ${esc(c.claudeAchado || 'nenhum')}</p></div>
    <div><label class="rot">Python com faster-whisper (transcrição)</label><input class="num" id="mPython" value="${esc(c.python)}"></div>
    <div><label class="rot">Acervo de reações</label><input class="num" id="mAcervo" value="${esc(c.acervo)}"></div>
    <div><label class="rot">Codificador</label><div class="segmentos" id="mEnc">${[['h264_nvenc', 'Placa NVIDIA'], ['libx264', 'Processador']].map(([v, n]) => `<button data-v="${v}" class="${c.encoder === v ? 'on' : ''}">${n}</button>`).join('')}</div></div>
    <div class="acoes"><button class="btn suave" id="mVerificar" style="margin-right:auto"><i data-i="check"></i>Verificar instalação</button><button class="btn suave" id="mCancelar">Cancelar</button><button class="btn primario" id="mSalvar">Salvar</button></div>`, cx => {
    cx.querySelector('#mVerificar').onclick = () => { fecharModal(); PREP.abrir(); };
    cx.querySelectorAll('.segmentos').forEach(s => s.onclick = e => { const b = e.target.closest('button'); if (b) s.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); });
    cx.querySelector('#mCancelar').onclick = fecharModal;
    cx.querySelector('#mSalvar').onclick = async () => {
      await api.chamar('config:gravar', { modelo: cx.querySelector('#mModelo .on')?.dataset.v || '', claude: cx.querySelector('#mClaude').value.trim(), python: cx.querySelector('#mPython').value.trim(), acervo: cx.querySelector('#mAcervo').value.trim(), encoder: cx.querySelector('#mEnc .on')?.dataset.v || 'h264_nvenc' });
      fecharModal(); toast('Configurações salvas', { tipo: 'ok' });
    };
  });
};

/* ── topo, transporte e ferramentas ── */
$('#btnPasta').onclick = () => S.pasta && api.chamar('abrir', S.pasta);
$('#btnDesfazer').onclick = desfazer;
$('#btnRefazer').onclick = refazer;
ouvir('historico', () => { $('#btnDesfazer').disabled = S.histI <= 0; $('#btnRefazer').disabled = S.histI >= S.hist.length - 1; });
$('#btnPlay').onclick = () => PV.alternar();
$('#btnInicio').onclick = () => PV.irPara(0);
const passoQuadro = n => { PV.pausar(); PV.irPara(S.t + n / (S.projeto?.formato.fps || 30)); };
$('#btnVoltaQuadro').onclick = () => passoQuadro(-1);
$('#btnAvancaQuadro').onclick = () => passoQuadro(1);
$('#btnMudo').onclick = () => { S.mudo = !S.mudo; $('#btnMudo').innerHTML = svgIcone(S.mudo ? 'mute' : 'volume'); $('#btnMudo').classList.toggle('ativo', S.mudo); };
$('#btnGuias').onclick = () => { S.guias = !S.guias; $('#btnGuias').classList.toggle('ativo', S.guias); PV.redesenhar(); };
ouvir('tocando', on => {
  const b = $('#btnPlay');
  b.innerHTML = `<i class="troca">${svgIcone(on ? 'pause' : 'play')}</i>`;   // <i> mantém o tamanho do ícone
  b.classList.toggle('tocando', on);
});
ouvir('tempo', t => { $('#tempoAtual').textContent = fmt(t); });
$('#btnDividir').onclick = () => OPS.dividir();
$('#btnApagar').onclick = e => OPS.apagar(e.shiftKey);
$('#btnTexto').onclick = () => S.projeto && OPS.texto();
$('#btnQualif').onclick = () => S.projeto && OPS.faixa();
$('#btnTrans').onclick = () => TRANS.abrir();
$('#btnPrint').onclick = () => CHAT.printar();
$('#btnLeak').onclick = () => S.projeto && OPS.leak();
$('#btnFaixa').onclick = () => S.projeto && OPS.novaFaixa();
$('#btnIma').onclick = () => { S.ima = !S.ima; $('#btnIma').classList.toggle('ativa', S.ima); };
$('#zoomLinha').oninput = e => LT.definirZoom(+e.target.value);
$('#btnZoomMais').onclick = () => LT.definirZoom(S.zoom * 1.4);
$('#btnZoomMenos').onclick = () => LT.definirZoom(S.zoom / 1.4);
$('#btnEncaixar').onclick = () => LT.encaixar();

/* divisor entre preview e linha do tempo */
$('#divisor').onpointerdown = e => {
  const linha = $('#linha'), h0 = linha.offsetHeight, y0 = e.clientY;
  const mover = ev => { linha.style.height = limitar(h0 - (ev.clientY - y0), 160, innerHeight * 0.7) + 'px'; };
  const fim = () => { removeEventListener('pointermove', mover); removeEventListener('pointerup', fim); localStorage.setItem('alturaLinha', linha.style.height); };
  addEventListener('pointermove', mover); addEventListener('pointerup', fim);
};
if (localStorage.getItem('alturaLinha')) $('#linha').style.height = localStorage.getItem('alturaLinha');

/* ── teclado ── */
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  const digitando = e.target.closest?.('input, textarea, [contenteditable=true]');
  if (e.ctrlKey && k === 'z' && !digitando) { e.preventDefault(); e.shiftKey ? refazer() : desfazer(); return; }
  if (e.ctrlKey && k === 'y' && !digitando) { e.preventDefault(); refazer(); return; }
  if (e.key === 'Escape') { fecharInicio(); fecharModal(); $$('.pop').forEach(p => p.classList.add('oculto')); if (!digitando) { S.sel.clear(); emitir('selecao'); } return; }
  if (digitando || !S.projeto || !$('#modal').classList.contains('oculto')) return;
  if (k === ' ') { e.preventDefault(); PV.alternar(); }
  else if (k === 's' && !e.ctrlKey) OPS.dividir();
  else if (e.ctrlKey && k === 'k') { e.preventDefault(); OPS.dividir(); }
  else if (k === 'delete' || k === 'backspace') OPS.apagar(e.shiftKey);
  else if (e.ctrlKey && k === 'd') { e.preventDefault(); OPS.duplicar(); }
  else if (k === 'arrowleft') { e.preventDefault(); e.shiftKey ? PV.irPara(S.t - 1) : passoQuadro(-1); }
  else if (k === 'arrowright') { e.preventDefault(); e.shiftKey ? PV.irPara(S.t + 1) : passoQuadro(1); }
  else if (k === 'home') PV.irPara(0);
  else if (k === 'end') PV.irPara(duracao());
  else if (k === 't') OPS.texto();
  else if (k === 'l') OPS.leak();
  else if (k === 'q') OPS.faixa();
  else if (e.ctrlKey && k === 't') { e.preventDefault(); TRANS.abrir(); }
  else if (e.ctrlKey && k === 'p') { e.preventDefault(); CHAT.printar(); }
  else if (k === '=' || k === '+') LT.definirZoom(S.zoom * 1.4);
  else if (k === '-') LT.definirZoom(S.zoom / 1.4);
  else if (e.ctrlKey && k === 'a') { e.preventDefault(); S.sel.clear(); for (const f of S.projeto.faixas) for (const it of f.itens) S.sel.add(it.id); emitir('selecao'); }
});

/* ── início ── */
(async () => {
  try { M.definirFontes(await api.chamar('fontes:listar')); } catch (e) { toast('Não consegui ler as fontes: ' + e.message, { tipo: 'erro' }); }
  aplicarIcones();
  $$('input[type=range]').forEach(pintarRange);
  await renderReceitas();
  const ultimo = localStorage.getItem('ultimoProjeto');
  const ps = await api.chamar('projetos:listar').catch(() => []);
  if (ultimo && ps.some(p => p.nome === ultimo)) APP.abrir(ultimo);
  else boasVindas();
  try { (await api.chamar('tarefas:listar')).forEach(t => tarefas.set(t.id, t)); renderTarefas(); } catch {}
  // receitas podem ser criadas pelo Claude: relê de vez em quando
  setInterval(renderReceitas, 20000);
})();

/* o programa foi atualizado (código novo no disco): oferece reiniciar para usar a versão nova */
api.on.atualizacao(() => {
  toast('O Blue Ocean Studio foi atualizado. Reinicie para usar a versão nova.', {
    ico: 'refresh', acao: 'Reiniciar agora', dur: 600000,
    fn: async () => { try { await api.chamar('reiniciar'); } catch (e) { toast(e.message, { tipo: 'erro' }); } },
  });
});
