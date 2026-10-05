/* Ajustes: muda conforme a seleção (nada → projeto, legenda e áudio; vídeo; texto; efeito; legenda). */
const INSP = (() => {
  const raiz = $('#inspetor');
  let atual = '', timerCommit = null;

  const grupo = (titulo, ico, corpo) => `<div class="grupo-insp"><h4><i data-i="${ico}"></i>${titulo}</h4>${corpo}</div>`;
  const faixaRange = (rot, chave, min, max, passo, v, sufixo = '') =>
    `<div class="linha-campo"><label>${rot}</label><input type="range" data-k="${chave}" min="${min}" max="${max}" step="${passo}" value="${v}"><span class="valor" data-v="${chave}">${fmtV(v, passo)}${sufixo}</span></div>`;
  const fmtV = (v, passo) => passo < 1 ? (+v).toFixed(passo < 0.1 ? 2 : 1) : Math.round(v);
  const chave = (rot, k, on) => `<div class="linha-campo"><label style="flex:1;width:auto">${rot}</label><button class="chave${on ? ' on' : ''}" data-chave="${k}"></button></div>`;
  const num = (rot, k, v, passo = 1) => `<div class="num-rot"><input class="num" type="number" data-k="${k}" step="${passo}" value="${Math.round(v * 100) / 100}"><span>${rot}</span></div>`;

  function montar() {
    if (!S.projeto) { raiz.innerHTML = '<p class="sub">Abra um projeto.</p>'; return; }
    const ids = [...S.sel];
    const alvo = ids.length === 1 ? ids[0] : null;
    let h = '';
    if (alvo === 'legenda') h = painelLegenda(true);
    else if (alvo && acharItem(alvo)) {
      const { f, it } = acharItem(alvo);
      if (f.tipo === 'video' || f.tipo === 'audio') h = painelVideo(f, it);
      else if (f.tipo === 'texto') h = it.tipo === 'qualificacao' ? painelFaixa(it) : painelTexto(it);
      else h = painelEfeito(it);
    } else if (ids.length > 1) h = `<div class="titulo-insp"><div class="ico"><i data-i="layers"></i></div><div><b>${ids.length} itens</b><span>Delete apaga · S divide na agulha</span></div></div>`;
    else h = painelProjeto();
    raiz.innerHTML = h;
    aplicarIcones(raiz);
    raiz.querySelectorAll('input[type=range]').forEach(pintarRange);
    atual = alvo || '';
    if (alvo === 'legenda') listarBlocos();
  }

  /* ── projeto ── */
  function painelProjeto() {
    const p = S.projeto, fm = `${p.formato.w}x${p.formato.h}`;
    const formatos = [['9:16', 1080, 1920], ['4:5', 1080, 1350], ['1:1', 1080, 1080], ['16:9', 1920, 1080]];
    const semTrans = Object.entries(p.midias).filter(([id, m]) => m.audio && !S.trans[id]).length;
    return `<div class="titulo-insp"><div class="ico"><i data-i="film"></i></div><div><b>${esc(S.nome)}</b><span>${fmt(duracao())} · ${Object.keys(p.midias).length} mídia(s)</span></div></div>`
      + grupo('Formato', 'expand', `<div class="segmentos" data-grupo="formato">${formatos.map(([n, w, h]) => `<button data-v="${w}x${h}" class="${fm === `${w}x${h}` ? 'on' : ''}">${n}</button>`).join('')}</div>
        <div class="linha-campo"><label>Quadros/s</label><div class="segmentos" data-grupo="fps">${[24, 25, 30, 60].map(v => `<button data-v="${v}" class="${p.formato.fps == v ? 'on' : ''}">${v}</button>`).join('')}</div></div>`)
      + painelLegenda(false)
      + grupo('Áudio', 'wave', chave('Nivelar para rede social (−14 LUFS)', 'audio.normalizar', p.audio.normalizar)
        + chave('Limpar ruído', 'audio.limpar', p.audio.limpar) + chave('Realçar a voz', 'audio.voz', p.audio.voz))
      + (semTrans ? grupo('Transcrição', 'captions', `<p class="sub">${semTrans} mídia(s) com fala ainda sem transcrição. A legenda e o Claude usam o texto com tempo.</p><button class="btn suave cheio" data-acao="transcrever"><i data-i="captions"></i>Transcrever tudo</button>`) : '');
  }
  function painelLegenda(sozinha) {
    const L = S.projeto.legenda;
    const corpo = chave('Legenda ligada', 'legenda.ativa', L.ativa)
      + faixaRange('Tamanho', 'legenda.tam', 40, 120, 1, L.tam)
      + faixaRange('Altura', 'legenda.pos', 5, 95, 0.5, L.pos, '%')
      + faixaRange('Palavras', 'legenda.palavras', 1, 6, 1, L.palavras)
      + chave('MAIÚSCULAS', 'legenda.maiusculas', L.maiusculas)
      + linhaFonte('legenda.fonte', L.fonte)
      + `<div class="linha-campo"><label>Cores</label><input type="color" class="cor" data-k="legenda.cor" value="${L.cor}"><input type="color" class="cor" data-k="legenda.caixa" value="${L.caixa}"><button class="btn suave" data-acao="padraoLegenda" title="Voltar ao padrão Blue Ocean" style="margin-left:auto;height:28px;font-size:11.5px;padding:0 10px"><i data-i="refresh"></i>Padrão</button></div>`;
    if (!sozinha) return grupo('Legenda', 'captions', corpo);
    return `<div class="titulo-insp"><div class="ico"><i data-i="captions"></i></div><div><b>Legenda</b><span>Arraste no preview para subir ou descer</span></div></div>`
      + grupo('Estilo', 'captions', corpo)
      + grupo('Texto (clique vai até o trecho · duplo clique corrige)', 'edit', '<button class="btn suave cheio" data-acao="abrirTrans"><i data-i="captions"></i>Abrir a tela de transcrição</button><div class="blocos-legenda" id="blocosLeg"></div>');
  }
  function listarBlocos() {
    const cx = $('#blocosLeg'); if (!cx) return;
    const ws = M.palavrasLinha(S.projeto, S.trans);
    const qs = M.quadrosLegenda(S.projeto, S.trans).filter(q => q.k === 0);
    let wi = 0;
    cx.innerHTML = qs.map(q => {
      const pal = q.texto.map(() => ws[wi++]);
      return `<div class="bloco-leg" data-t="${q.ini}"><span class="t">${fmtCurto(q.ini)}</span><span>${pal.map(w => `<span class="p" data-midia="${w.midia}" data-idx="${w.idx}">${esc(w.t)}</span>`).join(' ')}</span></div>`;
    }).join('') || '<p class="sub">Sem palavras ainda. Transcreva as mídias com fala.</p>';
  }

  /* ── vídeo / imagem / áudio ── */
  function painelVideo(f, it) {
    const m = S.projeto.midias[it.midia] || { nome: '?' };
    const W = S.projeto.formato.w, H = S.projeto.formato.h;
    const presets = [
      ['Tela cheia', 0, 0, W, H], ['Metade de cima', 0, 0, W, H / 2], ['Metade de baixo', 0, H / 2, W, H / 2],
      ['60% em cima', 0, 0, W, Math.round(H * 0.6146)], ['40% embaixo', 0, Math.round(H * 0.6146), W, H - Math.round(H * 0.6146)], ['Centro 80%', W * 0.1, H * 0.1, W * 0.8, H * 0.8],
    ];
    const ehVideo = f.tipo === 'video';
    return `<div class="titulo-insp"><div class="ico"><i data-i="${m.tipo === 'imagem' ? 'image' : m.tipo === 'audio' ? 'music' : 'film'}"></i></div><div><b>${esc(m.nome)}</b><span>${it.id} · ${it.midia} · ${fmt(it.saida - it.entrada)}</span></div></div>`
      + (ehVideo ? grupo('Posição na tela', 'expand', `<div class="presets">${presets.map(([n, x, y, w, h], i) => `<button class="preset" data-preset="${i}" title="${n}"><span class="mini"><b style="top:${y / H * 100}%;height:${h / H * 100}%;${x ? `left:${x / W * 100}%;right:${(W - x - w) / W * 100}%` : ''}"></b></span>${n}</button>`).join('')}</div>
        <div class="quatro">${num('X', 'caixa.x', it.caixa.x)}${num('Y', 'caixa.y', it.caixa.y)}${num('Largura', 'caixa.w', it.caixa.w)}${num('Altura', 'caixa.h', it.caixa.h)}</div>`)
        + grupo('Enquadramento', 'eye', faixaRange('Zoom', 'zoom', 0.2, 4, 0.01, it.zoom, '×') + faixaRange('Horizontal', 'foco.x', 0, 1, 0.005, it.foco.x) + faixaRange('Vertical', 'foco.y', 0, 1, 0.005, it.foco.y)
          + '<p class="sub">No preview: arraste para mover, Alt + arrastar para enquadrar, roda do mouse para zoom.</p>') : '')
      + (m.tipo !== 'imagem' ? grupo('Som', 'volume', faixaRange('Volume', 'volume', 0, 2, 0.01, it.volume) + (m.audio ? chave('Entra na legenda', 'legenda', it.legenda !== false) : '<p class="sub">Esta mídia não tem áudio.</p>')) : '')
      + grupo('Tempo', 'scissors', `<div class="quatro">${num('Início', 'inicio', it.inicio, 0.01)}${num('Entrada', 'entrada', it.entrada, 0.01)}${num('Saída', 'saida', it.saida, 0.01)}${num('Duração', '_dur', it.saida - it.entrada, 0.01)}</div>`
        + faixaRange('Surgir', 'entra', 0, 2, 0.05, it.entra, 's') + faixaRange('Sumir', 'sai', 0, 2, 0.05, it.sai, 's'));
  }

  /* ── fontes: todas as do computador, agrupadas por família ── */
  function seletorFonte(k, atual) {
    atual = M.idFonte(atual);
    const grupos = new Map();
    for (const f of Object.values(M.FONTES)) { if (!grupos.has(f.grupo)) grupos.set(f.grupo, []); grupos.get(f.grupo).push(f); }
    const ordem = [...grupos.keys()].sort((a, b) => (b === 'Instrument Sans') - (a === 'Instrument Sans') || a.localeCompare(b));
    return `<select class="num" data-k="${k}">${ordem.map(g => `<optgroup label="${esc(g)}">${grupos.get(g).map(f => `<option value="${esc(f.id)}"${f.id === atual ? ' selected' : ''}>${esc(g)} ${esc(f.estilo)}</option>`).join('')}</optgroup>`).join('')}</select>`;
  }
  const linhaFonte = (k, atual) => `<div class="linha-campo"><label>Fonte</label>${seletorFonte(k, atual)}</div>`;

  /* ── headline ── */
  function painelTexto(it) {
    const cartoes = Object.entries(M.ESTILOS).map(([id, e]) => `<button class="estilo-h${it.estilo === id ? ' on' : ''}" data-estilo="${id}"><span class="amostra a-${id}">Aa</span>${e.nome}</button>`).join('');
    return `<div class="titulo-insp"><div class="ico"><i data-i="type"></i></div><div><b>Headline</b><span>${it.id} · ${fmt(it.fim - it.inicio)}</span></div></div>`
      + grupo('Texto', 'type', `<textarea class="num" data-k="texto" id="campoTexto">${esc(it.texto)}</textarea><p class="sub">Enter quebra a linha · **assim** fica em negrito.</p>`)
      + grupo('Estilo', 'sparkle', `<div class="estilos-h">${cartoes}</div>`)
      + grupo('Aparência', 'sliders', linhaFonte('fonte', it.fonte)
        + faixaRange('Tamanho', 'tam', 20, 240, 1, it.tam) + faixaRange('Largura', 'largura', 100, S.projeto.formato.w * 1.2, 10, it.largura)
        + faixaRange('Entrelinha', 'entrelinha', 0.6, 1.6, 0.01, it.entrelinha) + faixaRange('Contorno', 'contorno', 0, 16, 1, it.contorno)
        + `<div class="linha-campo"><label>Cor</label><input type="color" class="cor" data-k="cor" value="${it.cor}"><label style="width:auto;margin-left:10px">Fundo</label><input type="color" class="cor" data-k="fundo" value="${it.fundo || '#0137FF'}"><button class="chave${it.fundo ? ' on' : ''}" data-chave="_fundo" style="margin-left:auto"></button></div>`
        + chave('Papel rasgado atrás', 'papel', it.papel) + chave('MAIÚSCULAS', 'maiusculas', it.maiusculas)
        + `<div class="linha-campo"><label>Entrada</label><div class="segmentos" data-grupo="animacao">${[['', 'Nenhuma'], ['pop', 'Pop'], ['fade', 'Surgir']].map(([v, n]) => `<button data-v="${v}" class="${(it.animacao || '') === v ? 'on' : ''}">${n}</button>`).join('')}</div></div>`)
      + grupo('Tempo e posição', 'scissors', `<div class="quatro">${num('Início', 'inicio', it.inicio, 0.01)}${num('Fim', 'fim', it.fim, 0.01)}${num('X', 'x', it.x)}${num('Y', 'y', it.y)}</div>`);
  }

  /* ── faixa de qualificação ── */
  function painelFaixa(it) {
    const H = S.projeto.formato.h;
    const pos = [['Topo', Math.round(216 * H / 1920)], ['Meio', Math.round((H - it.altura) / 2)], ['Base', Math.round(H - it.altura - 216 * H / 1920)]];
    return `<div class="titulo-insp"><div class="ico"><i data-i="layers"></i></div><div><b>Faixa de qualificação</b><span>${it.id} · ${fmt(it.fim - it.inicio)} · arraste no preview para subir ou descer</span></div></div>`
      + grupo('Público', 'user', `<textarea class="num" data-k="texto" id="campoTexto">${esc(it.texto)}</textarea><p class="sub">Use **assim** para o negrito: Para **SAAS B2B** que já faturam acima de **R$30mil** de MRR</p>`)
      + grupo('Posição na tela', 'expand', `<div class="segmentos">${pos.map(([n, y]) => `<button data-yfaixa="${y}" class="${Math.abs(it.y - y) < 2 ? 'on' : ''}">${n}</button>`).join('')}</div>`
        + faixaRange('Altura na tela', 'y', 0, H - 40, 1, it.y) + faixaRange('Espessura', 'altura', 60, 400, 1, it.altura) + faixaRange('Tamanho', 'tam', 20, 120, 1, it.tam))
      + grupo('Aparência', 'sliders', linhaFonte('fonte', it.fonte) + '<p class="sub">O negrito usa o peso mais forte da mesma família.</p>'
        + `<div class="linha-campo"><label>Cor</label><input type="color" class="cor" data-k="cor" value="${it.cor}"></div>` + chave('Logo Blue Ocean e divisória', 'logo', it.logo))
      + grupo('Quando aparece', 'play', `<div class="segmentos" data-grupo="entrada"><button data-v="parada" class="${it.entrada === 'parada' ? 'on' : ''}">Já na tela</button><button data-v="esquerda" class="${it.entrada === 'esquerda' ? 'on' : ''}">Desliza da esquerda</button></div>`
        + (it.entrada === 'esquerda' ? faixaRange('Duração', 'durEntrada', 0.2, 3, 0.01, it.durEntrada, 's') : '')
        + `<div class="quatro">${num('Início', 'inicio', it.inicio, 0.01)}${num('Fim', 'fim', it.fim, 0.01)}</div>
        <div class="midia-acoes"><button class="btn suave" data-acao="faixaTodo"><i data-i="expand"></i>Vídeo todo</button><button class="btn suave" data-acao="faixaAgulha"><i data-i="play"></i>Na agulha</button></div>`);
  }
  function painelEfeito(it) {
    return `<div class="titulo-insp"><div class="ico"><i data-i="sparkle"></i></div><div><b>${M.EFEITOS[it.efeito].nome}</b><span>O pico do flash fica ${(M.EFEITOS[it.efeito].pico * it.dur / M.EFEITOS[it.efeito].dur).toFixed(2)}s depois do início</span></div></div>`
      + grupo('Efeito', 'sparkle', faixaRange('Intensidade', 'intensidade', 0, 2, 0.05, it.intensidade) + faixaRange('Duração', 'dur', 0.2, 2.5, 0.01, it.dur, 's')
        + `<div class="quatro">${num('Início', 'inicio', it.inicio, 0.01)}</div><p class="sub">Modo Tela: clareia a imagem sem escurecer. Coloque o início 0,2 s antes do corte para o pico esconder a troca.</p>`);
  }

  /* ── aplicar mudanças ── */
  function alvoObj() {
    const id = [...S.sel][0];
    if (!id || S.sel.size !== 1) return S.projeto;
    if (id === 'legenda') return S.projeto;
    return acharItem(id)?.it || S.projeto;
  }
  function definir(obj, caminho, v) {
    const ps = caminho.split('.'); let o = obj;
    for (let i = 0; i < ps.length - 1; i++) { o[ps[i]] = o[ps[i]] || {}; o = o[ps[i]]; }
    o[ps.at(-1)] = v;
  }
  function aplicar(k, v, continuo) {
    const o = k.startsWith('legenda.') || k.startsWith('audio.') ? S.projeto : alvoObj();
    if (k === '_dur') { o.saida = o.entrada + Math.max(0.1, v); }
    else if (k === '_fundo') { o.fundo = v ? (raiz.querySelector('[data-k=fundo]')?.value || '#0137FF') : null; }
    else if (k === 'legenda' && o !== S.projeto) { o.legenda = v ? undefined : false; if (v) delete o.legenda; }
    else definir(o, k, v);
    if (k.startsWith('legenda.') || k === 'legenda') PV.invalidarLegenda();
    if (continuo) { mexendo(); clearTimeout(timerCommit); timerCommit = setTimeout(() => commit({ doInspetor: true }), 400); }
    else commit({ doInspetor: true });
  }
  raiz.addEventListener('input', e => {
    const k = e.target.dataset.k; if (!k) return;
    let v = e.target.type === 'range' || e.target.type === 'number' ? +e.target.value : e.target.value;
    if (e.target.type === 'range') { const s = raiz.querySelector(`[data-v="${k}"]`); if (s) s.textContent = fmtV(v, +e.target.step) + (s.textContent.match(/[a-z%×]+$/)?.[0] || ''); }
    if (k === 'fundo' && !alvoObj().fundo) return;
    aplicar(k, v, true);
  });
  raiz.addEventListener('click', async e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.chave) { const on = !b.classList.contains('on'); b.classList.toggle('on', on); aplicar(b.dataset.chave, on); return; }
    const seg = b.closest('.segmentos[data-grupo]');
    if (seg) {
      seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
      const g = seg.dataset.grupo, v = b.dataset.v;
      if (g === 'formato') { const [w, h] = v.split('x').map(Number); mudarFormato(w, h); }
      else if (g === 'fps') aplicar('formato.fps', +v);
      else { aplicar(g, v || null); if (g === 'entrada') montar(); }
      return;
    }
    if (b.dataset.preset != null) {
      const W = S.projeto.formato.w, H = S.projeto.formato.h, i = +b.dataset.preset;
      const P = [[0, 0, W, H], [0, 0, W, H / 2], [0, H / 2, W, H / 2], [0, 0, W, Math.round(H * 0.6146)], [0, Math.round(H * 0.6146), W, H - Math.round(H * 0.6146)], [W * 0.1, H * 0.1, W * 0.8, H * 0.8]][i];
      const it = alvoObj(); it.caixa = { x: Math.round(P[0]), y: Math.round(P[1]), w: Math.round(P[2]), h: Math.round(P[3]) };
      commit(); return;
    }
    if (b.dataset.estilo != null) { M.aplicarEstilo(alvoObj(), b.dataset.estilo, S.projeto.formato.w); commit(); montar(); return; }
    if (b.dataset.yfaixa != null) { alvoObj().y = +b.dataset.yfaixa; commit(); montar(); return; }
    if (b.dataset.acao === 'faixaTodo') { const it = alvoObj(); it.inicio = 0; it.fim = Math.max(duracao(), 1); it.entrada = 'parada'; commit(); montar(); return; }
    if (b.dataset.acao === 'faixaAgulha') { const it = alvoObj(); const d = it.fim - it.inicio; it.inicio = +S.t.toFixed(2); if (it.fim <= it.inicio) it.fim = it.inicio + d; commit(); montar(); return; }
    if (b.dataset.acao === 'transcrever') OPS.transcrever(Object.keys(S.projeto.midias).filter(id => S.projeto.midias[id].audio && !S.trans[id]));
    if (b.dataset.acao === 'abrirTrans') { TRANS.abrir(); return; }
    if (b.dataset.acao === 'padraoLegenda') { Object.assign(S.projeto.legenda, { tam: 72, pos: 72, palavras: 3, maiusculas: false, cor: '#FFFFFF', caixa: '#0137FF', fonte: 'Montserrat' }); PV.invalidarLegenda(); commit(); }
  });
  function mudarFormato(w, h) {
    const p = S.projeto, W0 = p.formato.w, H0 = p.formato.h;
    // itens em tela cheia continuam em tela cheia; o resto escala
    for (const f of p.faixas) for (const it of f.itens) {
      if (f.tipo === 'video') {
        const c = it.caixa;
        if (c.x === 0 && c.y === 0 && c.w === W0 && c.h === H0) it.caixa = { x: 0, y: 0, w, h };
        else it.caixa = { x: Math.round(c.x * w / W0), y: Math.round(c.y * h / H0), w: Math.round(c.w * w / W0), h: Math.round(c.h * h / H0) };
      } else if (f.tipo === 'texto' && it.tipo === 'qualificacao') { it.y = Math.round(it.y * h / H0); it.altura = Math.round(it.altura * w / W0); it.tam = Math.round(it.tam * w / W0); }
      else if (f.tipo === 'texto') { it.x = Math.round(it.x * w / W0); it.y = Math.round(it.y * h / H0); it.largura = Math.round(it.largura * w / W0); }
    }
    p.formato.w = w; p.formato.h = h;
    commit();
  }
  // legenda: clique vai até o bloco, duplo clique corrige a palavra na transcrição
  raiz.addEventListener('click', e => { const bl = e.target.closest('.bloco-leg'); if (bl && !e.target.closest('[contenteditable=true]')) PV.irPara(+bl.dataset.t + 0.001); });
  raiz.addEventListener('dblclick', e => {
    const p = e.target.closest('.p'); if (!p) return;
    p.contentEditable = 'true'; p.focus();
    const sel = getSelection(); sel.selectAllChildren(p);
    const fim = async salvar => {
      p.contentEditable = 'false';
      const novo = p.textContent.trim();
      if (!salvar) { listarBlocos(); return; }
      const { midia, idx } = p.dataset;
      const lista = S.trans[midia]; if (!lista || !lista[+idx]) return;
      lista[+idx].t = novo; lista[+idx].editada = true; lista[+idx].p = 1;
      await api.chamar('transcricao:salvar', S.nome, midia, lista);
      PV.invalidarLegenda(); emitir('transcricoes');
    };
    p.onkeydown = ev => { if (ev.key === 'Enter') { ev.preventDefault(); fim(true); } if (ev.key === 'Escape') fim(false); };
    p.onblur = () => fim(true);
  });

  ouvir('selecao', montar);
  ouvir('projeto', o => { if (!o?.doInspetor) montar(); });
  ouvir('transcricoes', () => { if (atual === 'legenda') listarBlocos(); else if (!S.sel.size) montar(); });
  ouvir('focarInspetor', id => { abrirAba('ajustes'); setTimeout(() => { const c = $('#campoTexto'); if (c) { c.focus(); c.select(); } }, 60); });
  ouvir('tempo', t => {
    if (atual !== 'legenda') return;
    const bls = raiz.querySelectorAll('.bloco-leg'); let ult = null;
    bls.forEach(b => { b.classList.remove('agora'); if (+b.dataset.t <= t + 0.01) ult = b; });
    ult?.classList.add('agora');
  });
  return { montar };
})();
