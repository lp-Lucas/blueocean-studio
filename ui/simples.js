/* Interface padrão: só o essencial — preview com a barra de tempo, o chat, os arquivos e os processos.
   É só outra forma de MOSTRAR o programa: tudo aqui chama as mesmas funções da interface avançada
   (importar, tocar, mover a agulha, mandar pedido ao chat). A avançada continua igual e é escolhida no topo. */
const SIMPLES = (() => {
  const painel = $('#simples'), barra = $('#barraSimples');
  let receitas = [], arrastando = false;

  /* ── modo ── */
  function definirModo(modo, { salvar = true } = {}) {
    const padrao = modo === 'padrao';
    document.body.classList.toggle('modo-padrao', padrao);
    $$('#modoUI button').forEach(b => b.classList.toggle('on', b.dataset.m === modo));
    if (salvar) try { localStorage.setItem('modoInterface', modo); } catch {}
    if (padrao) { renderPainel(); atualizarBarra(); }
    // o preview muda de tamanho com o layout: redimensiona depois que o CSS aplicar
    requestAnimationFrame(() => { PV.dimensionar(); PV.redesenhar(); });
  }
  $('#modoUI').addEventListener('click', e => { const b = e.target.closest('button'); if (b) definirModo(b.dataset.m); });
  const ehPadrao = () => document.body.classList.contains('modo-padrao');

  /* ── coluna da esquerda: arquivos e o que fazer ── */
  async function renderPainel() {
    if (!ehPadrao()) return;
    if (!receitas.length) { try { receitas = await api.chamar('receitas:listar'); } catch {} }
    const midias = S.projeto ? Object.entries(S.projeto.midias) : [];
    painel.innerHTML = `
      <section class="s-bloco">
        <h3>Seus arquivos</h3>
        <button class="s-adicionar" id="sAdicionar"><span class="mais"><i data-i="plus"></i></span><b>Adicionar vídeos</b><span>ou arraste para cá</span></button>
        <form class="s-link" id="sLink"><input id="sLinkInput" placeholder="Colar link do YouTube, Instagram, Drive" spellcheck="false"><button title="Baixar"><i data-i="download"></i></button></form>
        <div class="s-midias">${midias.length ? midias.map(([id, m]) => {
          const th = S.midia[id]?.thumb;
          return `<button class="s-midia" data-id="${id}" title="Clique para falar deste arquivo no chat">
            <span class="s-thumb" style="${th ? `background-image:url('${urlMidia(th, id)}')` : ''}">${th ? '' : `<i data-i="${m.tipo === 'audio' ? 'music' : m.tipo === 'imagem' ? 'image' : 'film'}"></i>`}</span>
            <span class="s-nome">${esc(m.nome.replace(/\.[^.]+$/, ''))}</span></button>`;
        }).join('') : '<p class="s-vazio">Nenhum arquivo ainda.</p>'}</div>
      </section>
      <section class="s-bloco">
        <h3>O que você quer fazer?</h3>
        <div class="s-acoes">${receitas.map(r => `<button class="s-acao" data-r="${r.id}"><span class="ico"><i data-i="${r.icone}"></i></span><span>${esc(r.titulo)}</span></button>`).join('')}</div>
        <p class="s-dica">Ou escreva no chat o que quer no vídeo.</p>
      </section>`;
    aplicarIcones(painel);
    painel.querySelector('#sAdicionar').onclick = async () => importar(await api.chamar('midia:escolher'));
    painel.querySelector('#sLink').onsubmit = e => {
      e.preventDefault();
      const url = painel.querySelector('#sLinkInput').value.trim();
      if (!/^https?:\/\//.test(url)) { toast('Cole um link que comece com http', { tipo: 'erro' }); return; }
      painel.querySelector('#sLinkInput').value = '';
      toast('Baixando… acompanhe no topo', { ico: 'download' });
      importar([url]);
    };
    // clicar num arquivo: cita ele no chat (o Claude sabe qual é pelo número)
    painel.querySelectorAll('.s-midia').forEach(b => b.onclick = () => {
      const m = S.projeto.midias[b.dataset.id]; if (!m) return;
      const ent = $('#entrada');
      ent.value = (ent.value.trim() ? ent.value.trimEnd() + ' ' : '') + `${b.dataset.id} (${m.nome}) `;
      ent.dispatchEvent(new Event('input')); ent.focus();
    });
    painel.querySelectorAll('.s-acao').forEach(b => b.onclick = () => {
      const r = receitas.find(x => x.id === b.dataset.r); if (r) CHAT.usarPedido(r.pedido || r.titulo);
    });
  }

  /* ── barra de tempo embaixo do preview ── */
  barra.innerHTML = `<button class="play" id="sPlay" title="Tocar / pausar (Espaço)"><i data-i="play"></i></button>
    <span class="s-tempo" id="sTempo">0:00</span>
    <input type="range" id="sAgulha" min="0" max="1" step="0.01" value="0">
    <span class="s-tempo fraco" id="sTotal">0:00</span>
    <button class="s-print btn-print" id="sPrint" title="Print deste momento para o chat (Ctrl+P)"><i data-i="camera"></i><span>Print para o chat</span></button>`;
  aplicarIcones(barra);
  const agulha = barra.querySelector('#sAgulha');
  const mmss = t => { t = Math.max(0, t || 0); return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`; };
  function atualizarBarra() {
    if (!ehPadrao() || !S.projeto) return;
    const d = Math.max(0.01, duracao());
    agulha.max = d;
    if (!arrastando) agulha.value = S.t;
    pintarRange(agulha);
    barra.querySelector('#sTempo').textContent = mmss(S.t);
    barra.querySelector('#sTotal').textContent = mmss(d);
  }
  agulha.addEventListener('input', () => { PV.irPara(+agulha.value); pintarRange(agulha); });
  agulha.addEventListener('pointerdown', () => { arrastando = true; });
  addEventListener('pointerup', () => { arrastando = false; });
  barra.querySelector('#sPlay').onclick = () => PV.alternar();
  barra.querySelector('#sPrint').onclick = () => CHAT.printar();
  ouvir('tocando', on => { barra.querySelector('#sPlay').innerHTML = `<i>${svgIcone(on ? 'pause' : 'play')}</i>`; barra.querySelector('#sPlay').classList.toggle('tocando', on); });

  ouvir('tempo', atualizarBarra);
  ouvir('projeto', () => { atualizarBarra(); renderPainelLeve(); });
  ouvir('midia', renderPainelLeve);
  let timer = null;
  function renderPainelLeve() { clearTimeout(timer); timer = setTimeout(renderPainel, 200); }

  // começa no modo que a pessoa escolheu da última vez (avançada se nunca escolheu)
  let inicial = 'avancada'; try { inicial = localStorage.getItem('modoInterface') || 'avancada'; } catch {}
  definirModo(inicial, { salvar: false });
  return { definirModo };
})();
