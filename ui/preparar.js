/* Preparar: na primeira abertura (ou em Configurações → Verificar instalação) confere o que o programa precisa
   e instala o que falta, mostrando cada passo. Só aparece sozinha quando falta alguma coisa. */
const PREP = (() => {
  const ICO = { ffmpeg: 'film', ytdlp: 'download', git: 'terminal', claude: 'sparkle', whisper: 'captions', login: 'user' };
  let itens = [], instalando = false, vigiaLogin = null;
  const tela = document.createElement('div');
  tela.id = 'preparar'; tela.className = 'oculto';
  document.body.appendChild(tela);

  const faltam = () => itens.filter(i => !i.ok && i.id !== 'login');

  function render() {
    const login = itens.find(i => i.id === 'login');
    const tudoOk = itens.length && itens.every(i => i.ok);
    tela.innerHTML = `<div class="prep-caixa">
      <div class="prep-topo"><img src="../assets/icone.png" alt=""><div><h2>Preparar o Blue Ocean Studio</h2>
        <p class="sub">${tudoOk ? 'Tudo pronto para editar.' : instalando ? 'Instalando… pode deixar a janela aberta.' : 'Na primeira vez, o programa instala as ferramentas que usa. Fica tudo na sua conta, sem pedir administrador.'}</p></div></div>
      <div class="prep-lista">${itens.map(i => `
        <div class="prep-item ${i.estado || (i.ok ? 'ok' : 'falta')}" data-id="${i.id}">
          <span class="ico"><i data-i="${ICO[i.id]}"></i></span>
          <div class="txt"><b>${esc(i.nome)}</b><span>${esc(i.msg || i.det || i.desc)}${!i.ok && !i.estado && i.tam ? ' · ' + esc(i.tam) : ''}</span>
            ${i.estado === 'instalando' ? `<div class="barrinha${i.pct == null ? ' indef' : ''}"><b style="width:${Math.round((i.pct || 0) * 100)}%"></b></div>` : ''}</div>
          <span class="estado">${i.estado === 'instalando' ? '<span class="girando"></span>'
            : i.ok ? '<i data-i="check"></i>'
            : i.id === 'login' ? `<button class="btn suave" id="prepEntrar" ${itens.find(x => x.id === 'claude')?.ok ? '' : 'disabled'}>Entrar</button>`
            : i.estado === 'erro' ? '<i data-i="alert"></i>' : '<span class="falta-pt"></span>'}</span>
        </div>`).join('')}</div>
      <div class="acoes">
        <button class="btn suave" id="prepFechar" ${instalando ? 'disabled' : ''}>${tudoOk ? 'Fechar' : 'Agora não'}</button>
        ${faltam().length ? `<button class="btn primario" id="prepInstalar" ${instalando ? 'disabled' : ''}><i data-i="download"></i>${instalando ? 'Instalando…' : itens.some(i => i.estado === 'erro') ? 'Tentar de novo' : 'Instalar o que falta'}</button>`
          : tudoOk ? '<button class="btn primario" id="prepFechar2">Começar</button>' : ''}
      </div>
      ${login && !login.ok && !faltam().length ? '<p class="sub prep-nota">Clique em <b>Entrar</b>: abre uma janela do Claude e o navegador para você confirmar a sua conta (Pro, Max ou Team).</p>' : ''}
    </div>`;
    aplicarIcones(tela);
    tela.querySelector('#prepFechar')?.addEventListener('click', fechar);
    tela.querySelector('#prepFechar2')?.addEventListener('click', fechar);
    tela.querySelector('#prepInstalar')?.addEventListener('click', instalar);
    tela.querySelector('#prepEntrar')?.addEventListener('click', entrar);
  }

  async function verificar() {
    itens = await api.chamar('preparar:verificar');
    render();
    return itens;
  }
  async function instalar() {
    instalando = true;
    const ids = faltam().map(i => i.id);
    itens.forEach(i => { if (ids.includes(i.id)) { i.estado = null; i.msg = 'na fila'; } });
    render();
    try { await api.chamar('preparar:instalar', ids); } catch (e) { toast(e.message, { tipo: 'erro' }); }
    instalando = false;
    const antes = new Map(itens.map(i => [i.id, i]));
    await verificar();
    // o que deu erro continua mostrando o motivo
    itens.forEach(i => { const a = antes.get(i.id); if (!i.ok && a?.estado === 'erro') { i.estado = 'erro'; i.msg = a.msg; } });
    render();
  }
  async function entrar() {
    try { await api.chamar('preparar:entrar'); } catch (e) { return toast(e.message, { tipo: 'erro' }); }
    const l = itens.find(i => i.id === 'login'); l.estado = 'instalando'; l.pct = null; l.msg = 'confirme no navegador e volte aqui'; render();
    clearInterval(vigiaLogin);
    vigiaLogin = setInterval(async () => {
      const novos = await api.chamar('preparar:verificar');
      if (novos.find(i => i.id === 'login')?.ok) { clearInterval(vigiaLogin); itens = novos; render(); }
    }, 3000);
  }
  function abrir() { tela.classList.remove('oculto'); render(); }
  function fechar() { clearInterval(vigiaLogin); tela.classList.add('oculto'); }

  api.on.preparar(ev => {
    const i = itens.find(x => x.id === ev.id); if (!i) return;
    i.estado = ev.estado === 'ok' ? null : ev.estado; i.msg = ev.msg; i.pct = ev.pct;
    if (ev.estado === 'ok') i.ok = true;
    render();
  });

  // na abertura: só aparece se faltar algo
  verificar().then(l => { if (l.some(i => !i.ok)) abrir(); }).catch(() => {});
  return { abrir: async () => { abrir(); await verificar(); } };
})();
