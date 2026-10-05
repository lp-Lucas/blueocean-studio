/* Blue Ocean Studio — processo principal.
   Janela do editor, projetos, chat com o Claude CLI, tarefas, exportação,
   e o servidor interno que atende o comando "bo" que o Claude usa no terminal. */
const { app, BrowserWindow, ipcMain, dialog, shell, nativeImage, Menu, Notification } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const crypto = require('crypto');
const U = require('./motor/util');
const T = require('./motor/tarefas');
const P = require('./motor/projeto');
const F = require('./motor/ferramentas');
const E = require('./motor/exportar');
const C = require('./motor/claude');
const M = require('./motor/modelo');
const Fo = require('./motor/fontes');

// BO_ISOLADO (testes): roda ao lado do programa aberto, com dados e porta do "bo" separados
const ISOLADO = !!process.env.BO_ISOLADO;
const ARQ_CONTROLE = path.join(__dirname, ISOLADO ? '.controle-teste.json' : '.controle.json');
if (ISOLADO) app.setPath('userData', path.join(require('os').tmpdir(), 'blueocean-studio-teste'));
else if (!app.requestSingleInstanceLock()) { app.quit(); process.exit(0); }

let janela = null;
const enviar = (canal, dado) => { if (janela && !janela.isDestroyed()) janela.webContents.send(canal, dado); };

/* ── janela ───────────────────────────────────────────────────────────── */
function criarJanela() {
  janela = new BrowserWindow({
    width: 1600, height: 960, minWidth: 1180, minHeight: 700,
    backgroundColor: '#07080B',
    title: 'Blue Ocean Studio',
    icon: path.join(__dirname, 'assets', 'icone.png'),
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#07080B', symbolColor: '#8A93A6', height: 44 },
    show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: false, backgroundThrottling: false },
  });
  Menu.setApplicationMenu(null);
  janela.loadFile(path.join(__dirname, 'ui', 'index.html'));
  janela.once('ready-to-show', () => { janela.maximize(); janela.show(); });
  // teste automático (desenvolvimento): roda um script na tela e tira um print
  if (process.env.BO_CAPTURA) janela.webContents.once('did-finish-load', async () => {
    const espera = ms => new Promise(r => setTimeout(r, ms));
    await espera(+process.env.BO_ESPERA || 2500);
    if (process.env.BO_DEV_JS) {
      try { await janela.webContents.executeJavaScript(fs.readFileSync(process.env.BO_DEV_JS, 'utf8')); }
      catch (e) { console.log('DEV_JS erro:', e.message); }
      await espera(+process.env.BO_ESPERA2 || 1500);
    }
    const img = await janela.webContents.capturePage();
    fs.writeFileSync(process.env.BO_CAPTURA, img.toPNG());
    console.log('captura ok');
    if (process.env.BO_SAIR) app.quit();
  });
  janela.webContents.on('console-message', (e, ...a) => { if (process.env.BO_CAPTURA) { const d = a[0]?.message ?? a[1]; const lvl = a[0]?.level ?? a[0]; if (String(lvl).match(/warn|error|2|3/)) console.log('[tela]', d); } });
  janela.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i'))) janela.webContents.toggleDevTools();
    if (input.type === 'keyDown' && input.control && input.key.toLowerCase() === 'r' && input.shift) janela.webContents.reloadIgnoringCache();
  });
}
app.on('second-instance', () => { if (janela) { if (janela.isMinimized()) janela.restore(); janela.focus(); } });

/* ── tarefas → tela ── */
T.eventos.on('mudou', t => enviar('tarefa', t));
T.eventos.on('sumiu', id => enviar('tarefa-sumiu', id));
T.eventos.on('log', l => enviar('tarefa-log', l));

/* ── observador: quando o Claude (ou qualquer um) mexe nos arquivos do projeto, a tela acompanha ── */
let observador = null, projetoAberto = null, compAberta = null;   // a composição que está na tela
const esperas = new Map();
function observar(nome) {
  try { observador?.close(); } catch {}
  projetoAberto = nome;
  const d = P.dir(nome);
  observador = fs.watch(d, { recursive: true }, (ev, arq) => {
    if (!arq) return;
    const a = arq.replace(/\\/g, '/');
    if (a.endsWith('.tmp') || a.includes('.parcial') || a.startsWith('saidas/') || a.startsWith('quadros/')) return;
    let chave = null;
    if (a === 'projeto.json') chave = 'projeto';
    else if (/^composicoes\/[\w-]+\.json$/.test(a)) chave = 'comp:' + a.slice(12, -5);
    else if (a.startsWith('transcricoes/') && a.endsWith('.json')) chave = 'transcricoes';
    else if (a.startsWith('cache/') && (a.endsWith('.proxy.mp4') || a.endsWith('.onda.json') || a.endsWith('.thumb.jpg'))) chave = 'midia';
    if (!chave) return;
    clearTimeout(esperas.get(chave));
    esperas.set(chave, setTimeout(() => avisarMudanca(nome, chave), 180));
  });
}
function avisarMudanca(nome, chave) {
  if (nome !== projetoAberto) return;
  if (chave === 'projeto' || chave.startsWith('comp:')) {
    const comp = chave.startsWith('comp:') ? chave.slice(5) : null;
    const f = comp ? P.arqComp(nome, comp) : P.arqProjeto(nome);
    let txt; try { txt = fs.readFileSync(f, 'utf8'); } catch { return; }
    if (P.foiEuQueGravei(f, txt)) return;
    try { JSON.parse(txt); }
    catch (e) { enviar('aviso', { tipo: 'erro', texto: `${comp ? 'composicoes/' + comp : 'projeto'}.json ficou inválido: ` + e.message.slice(0, 120) }); return; }
    try {
      enviar('comps', { ...P.composicoes(nome), mudou: comp });
      if (!comp || comp === compAberta) enviar('projeto-externo', P.carregar(nome, compAberta));
    } catch (e) { enviar('aviso', { tipo: 'erro', texto: e.message.slice(0, 160) }); }
  } else if (chave === 'transcricoes') enviar('transcricoes', P.transcricoes(nome));
  else if (chave === 'midia') enviar('midia-pronta', dadosMidia(nome));
}
function dadosMidia(nome) {
  const d = P.dir(nome), r = {};
  let p; try { p = P.carregar(nome); } catch { return r; }
  for (const id of Object.keys(p.midias)) {
    const proxy = path.join(d, 'cache', id + '.proxy.mp4');
    const onda = path.join(d, 'cache', id + '.onda.json');
    const thumb = path.join(d, 'cache', id + '.thumb.jpg');
    const v = f => { try { return Math.round(fs.statSync(f).mtimeMs); } catch { return 0; } };
    r[id] = { proxy: fs.existsSync(proxy) ? proxy : null, onda: U.ler(onda, null), thumb: fs.existsSync(thumb) ? thumb : null, v: v(proxy) + v(thumb) + (p.midias[id].versao || 0) };
  }
  return r;
}

/* ── o .ass sai do preview (ele mede as palavras com a mesma fonte que desenha) ── */
const pedidosAss = new Map();
function pedirAss(projeto, trans, ini, fim) {
  return new Promise((ok, falha) => {
    if (!janela || janela.isDestroyed()) return falha(new Error('a janela do editor precisa estar aberta'));
    const id = crypto.randomUUID();
    const t = setTimeout(() => { pedidosAss.delete(id); falha(new Error('o preview não respondeu a tempo')); }, 20000);
    pedidosAss.set(id, txt => { clearTimeout(t); ok(txt); });
    enviar('pedir-ass', { id, projeto, trans, ini, fim });
  });
}
ipcMain.on('ass-pronto', (e, { id, pacote }) => { const cb = pedidosAss.get(id); if (cb) { pedidosAss.delete(id); cb(pacote || {}); } });

async function exportarProjeto(nome, { arquivo, ini = 0, fim = null, pasta, comp } = {}) {
  const p = M.normalizar(P.carregar(nome, comp));
  // com várias composições, o arquivo leva o nome da composição
  if (!arquivo && P.composicoes(nome).lista.length > 1) arquivo = `${nome} - ${p.compNome}`;
  const dur = M.duracao(p);
  if (dur <= 0) throw new Error('a linha do tempo está vazia');
  const trans = P.transcricoes(nome);
  const pacote = await pedirAss(p, trans, ini, fim ?? dur);
  const dirSaida = pasta || path.join(P.dir(nome), 'saidas');
  let base = U.limparNome(arquivo || nome).replace(/\.mp4$/i, '') || 'video';
  let destino = path.join(dirSaida, base + '.mp4');
  for (let n = 2; fs.existsSync(destino) && !arquivo; n++) destino = path.join(dirSaida, `${base} (${n}).mp4`);
  return T.rodar('Exportando ' + path.basename(destino), nome, async t => {
    const r = await E.exportar(p, destino, { ini, fim, pacote, controle: t.controle, tmpDir: path.join(P.dir(nome), 'cache'),
      aoPct: f => T.progresso(t, 'renderizando', f * 100) });
    enviar('exportado', { projeto: nome, arquivo: r.destino });
    return r;
  });
}
async function quadroProjeto(nome, tempo, destino, comp) {
  const p = M.normalizar(P.carregar(nome, comp));
  const fps = p.formato.fps;
  const ini = Math.max(0, +tempo), fim = ini + 1.5 / fps;
  const pacote = await pedirAss(p, P.transcricoes(nome), ini, fim);
  destino = destino || path.join(P.dir(nome), 'quadros', `${p.comp}-quadro-${ini.toFixed(2)}s.png`);
  await E.exportar(p, destino, { ini, fim, pacote, quadro: true, tmpDir: path.join(P.dir(nome), 'cache') });
  return destino;
}

/* ── chat ─────────────────────────────────────────────────────────────── */
const conversas = new Map();   // projeto → controle do processo
const arqChat = nome => path.join(P.dir(nome), 'chat.json');
let porta = 0; const TOKEN = crypto.randomBytes(16).toString('hex');

function sistemaGerado() {
  const modelo = fs.readFileSync(path.join(__dirname, 'motor', 'sistema.md'), 'utf8');
  const receitas = listarReceitas().map(r => `- **${r.titulo}** — ${r.resumo}\n  arquivo: ${r.arquivo}`).join('\n');
  const txt = modelo.replaceAll('{{APP}}', __dirname).replaceAll('{{RECEITAS}}', receitas).replaceAll('{{ACERVO}}', U.cfg().acervo);
  const f = path.join(__dirname, 'motor', '.sistema-gerado.md');
  fs.writeFileSync(f, txt);
  return f;
}

function mesclar(lista, ev) {
  if (ev.tipo === 'inicio') return;
  const i = ev.chave ? lista.findIndex(x => x.chave === ev.chave && (x.tipo === ev.tipo || (x.tipo === 'ferramenta' && ev.tipo === 'resultado'))) : -1;
  if (ev.tipo === 'resultado') {
    const f = lista.find(x => x.tipo === 'ferramenta' && x.chave === ev.chave);
    if (f) { f.saida = ev.saida; f.erro = ev.erro; f.estado = ev.erro ? 'erro' : 'ok'; }
    return;
  }
  if (i >= 0) { const antigo = lista[i]; Object.assign(antigo, ev, ev.entrada == null && antigo.entrada ? { entrada: antigo.entrada } : {}); }
  else lista.push({ ...ev, quando: Date.now() });
}

async function enviarMensagem(nome, texto, contexto = {}) {
  if (conversas.has(nome)) throw new Error('o Claude ainda está respondendo neste projeto');
  const chat = U.ler(arqChat(nome), { sessao: null, mensagens: [] });
  const chaveU = 'u' + Date.now();
  const prints = (contexto.prints || []).filter(p => p && p.caminho);
  const msgU = { tipo: 'usuario', chave: chaveU, texto, quando: Date.now(), ...(prints.length ? { imagens: prints.map(p => p.caminho) } : {}) };
  chat.mensagens.push(msgU);
  U.gravar(arqChat(nome), chat);
  enviar('chat-evento', { projeto: nome, ev: msgU });

  const linhasCtx = [`Projeto: ${nome}`];
  if (contexto.tempo != null) linhasCtx.push(`Agulha em ${(+contexto.tempo).toFixed(2)}s de ${(+contexto.duracao || 0).toFixed(2)}s.`);
  try {
    const cs = P.composicoes(nome), atual = cs.lista.find(c => c.id === (contexto.comp || compAberta || cs.ativa)) || cs.lista[0];
    linhasCtx.push(`Composição aberta na tela: ${atual.id} "${atual.nome}" (arquivo composicoes/${atual.id}.json).`);
    if (cs.lista.length > 1) linhasCtx.push(`Composições do projeto: ${cs.lista.map(c => `${c.id} "${c.nome}"`).join(', ')}.`);
  } catch {}
  if (contexto.selecao?.length) linhasCtx.push(`Selecionado na linha do tempo: ${contexto.selecao.join(', ')}.`);
  if (contexto.anexos?.length) linhasCtx.push(`Anexos importados agora: ${contexto.anexos.join(', ')}.`);
  for (const p of prints) linhasCtx.push(p.tipo === 'imagem'
    ? `Imagem que a pessoa colou no chat (abra com Read para ver): ${p.caminho}`
    : `Print do preview em ${(+p.tempo).toFixed(2)}s da composição ${p.comp || ''} (é o quadro exatamente como vai sair; abra com Read para ver): ${p.caminho}`);
  const prompt = `<editor>\n${linhasCtx.join('\n')}\n</editor>\n\n${texto}`;

  const controle = {};
  conversas.set(nome, controle);
  enviar('chat-estado', { projeto: nome, rodando: true });
  let salvar = null;
  const inicioTurno = Date.now() - 1000;
  const agendarSalvar = () => { clearTimeout(salvar); salvar = setTimeout(() => U.gravar(arqChat(nome), chat), 400); };
  const aoEvento = ev => {
    if (!ev.chave && ev.tipo !== 'inicio') ev.chave = ev.tipo + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    if (ev.tipo === 'inicio') { chat.sessao = ev.sessao; chat.modelo = ev.modelo; }
    mesclar(chat.mensagens, ev);
    agendarSalvar();
    enviar('chat-evento', { projeto: nome, ev });
  };
  const tentar = sessao => C.conversar({
    cwd: P.dir(nome), prompt, sessao, sistema: sistemaGerado(), controle, aoEvento,
    env: { BO_PORTA: String(porta), BO_TOKEN: TOKEN, BO_PROJETO: nome, BO_APP: __dirname,
      PATH: path.join(__dirname, 'bin') + path.delimiter + process.env.PATH },
  });
  try {
    let r;
    try { r = await tentar(chat.sessao); }
    catch (e) {
      // sessão antiga sumiu (outra máquina, limpeza): começa uma nova sem perder o histórico na tela
      if (chat.sessao && /session|conversation|resume|No conversation/i.test(e.message)) { chat.sessao = null; r = await tentar(null); }
      else throw e;
    }
    if (r?.sessao) chat.sessao = r.sessao;
    if (r?.cancelado) aoEvento({ tipo: 'fim', chave: 'f' + Date.now(), cancelado: true });
  } catch (e) {
    aoEvento({ tipo: 'fim', chave: 'f' + Date.now(), erro: e.message });
  } finally {
    clearTimeout(salvar);
    U.gravar(arqChat(nome), chat);
    conversas.delete(nome);
    enviar('chat-estado', { projeto: nome, rodando: false });
    notificarFim(nome, chat, inicioTurno);
  }
}

/* notificação do Windows quando o Claude termina: o resumo é o começo da última resposta dele */
function notificarFim(nome, chat, desde) {
  if (!Notification.isSupported()) return;
  const doTurno = chat.mensagens.filter(m => (m.quando || 0) >= desde);
  const fim = [...doTurno].reverse().find(m => m.tipo === 'fim');
  if (fim?.cancelado) return;
  const texto = [...doTurno].reverse().find(m => m.tipo === 'texto')?.texto || '';
  const limpo = texto.replace(/[*_`#>|]/g, '').replace(/s+/g, ' ').trim();
  const dur = fim?.duracao ? (fim.duracao >= 60000 ? ` em ${Math.round(fim.duracao / 60000)} min` : ` em ${Math.round(fim.duracao / 1000)} s`) : '';
  const n = new Notification({
    title: fim?.erro ? `O Claude parou com erro · ${nome}` : `Claude terminou${dur} · ${nome}`,
    body: fim?.erro ? fim.erro.slice(0, 180) : (limpo.slice(0, 180) + (limpo.length > 180 ? '…' : '')) || 'Edição pronta.',
    icon: path.join(__dirname, 'assets', 'icone.png'),
  });
  n.on('click', () => { if (janela) { if (janela.isMinimized()) janela.restore(); janela.show(); janela.focus(); } });
  n.show();
}

/* ── receitas (processos salvos) ── */
const DIR_RECEITAS = path.join(__dirname, 'receitas');
function listarReceitas() {
  if (!fs.existsSync(DIR_RECEITAS)) return [];
  return fs.readdirSync(DIR_RECEITAS).filter(f => f.endsWith('.md')).sort().map(f => {
    const txt = fs.readFileSync(path.join(DIR_RECEITAS, f), 'utf8');
    const titulo = (txt.match(/^#\s+(.+)$/m) || [, f])[1].trim();
    const resumo = (txt.match(/^>\s*(.+)$/m) || [, ''])[1].trim();
    const pedido = (txt.match(/^Pedido:\s*(.+)$/m) || [, ''])[1].trim();
    const icone = (txt.match(/^Ícone:\s*(\S+)/m) || [, 'estrela'])[1].trim();
    return { id: f.replace(/\.md$/, ''), arquivo: path.join(DIR_RECEITAS, f), titulo, resumo, pedido, icone };
  });
}

/* ── IPC da tela ──────────────────────────────────────────────────────── */
const trata = (canal, fn) => ipcMain.handle(canal, async (e, ...a) => {
  try { return { ok: true, r: await fn(...a) }; } catch (err) { return { ok: false, erro: err.message }; }
});
// lista com uma capa (miniatura da primeira mídia que já tem) para a página inicial
trata('projetos:listar', () => P.listar().map(p => {
  const cache = path.join(P.dir(p.nome), 'cache');
  let capa = null;
  try {
    const t = fs.readdirSync(cache).filter(f => f.endsWith('.thumb.jpg')).sort((a, b) => parseInt(a.slice(1)) - parseInt(b.slice(1)))[0];
    if (t) capa = path.join(cache, t);
  } catch {}
  return { ...p, capa };
}));
trata('projetos:criar', (nome, formato) => { P.criar(nome, formato); return P.listar(); });
trata('projetos:apagar', nome => { if (projetoAberto === nome) { try { observador?.close(); } catch {} projetoAberto = null; } P.apagar(nome); return P.listar(); });
trata('projetos:abrir', nome => {
  const projeto = P.carregar(nome);
  observar(nome);
  compAberta = projeto.comp;
  // mídia sem proxy/onda (importada pelo Claude, ou proxy apagado): prepara em segundo plano
  for (const id of Object.keys(projeto.midias || {})) P.prepararPreview(nome, id).catch(() => {});
  return { projeto, comps: P.composicoes(nome), chat: U.ler(arqChat(nome), { sessao: null, mensagens: [] }), transcricoes: P.transcricoes(nome),
    midia: dadosMidia(nome), pasta: P.dir(nome), rodando: conversas.has(nome) };
});
trata('projetos:salvar', (nome, projeto, comp) => { P.salvar(nome, projeto, comp || projeto.comp); return true; });
trata('comp:listar', nome => P.composicoes(nome));
trata('comp:abrir', (nome, comp) => { compAberta = P.ativarComp(nome, comp); return { projeto: P.carregar(nome, compAberta), comps: P.composicoes(nome) }; });
trata('comp:criar', (nome, op) => { const id = P.criarComp(nome, op || {}); return { id, comps: P.composicoes(nome) }; });
trata('comp:renomear', (nome, comp, novo) => { P.renomearComp(nome, comp, novo); return P.composicoes(nome); });
trata('comp:apagar', (nome, comp) => { P.apagarComp(nome, comp); return P.composicoes(nome); });
trata('comp:ordenar', (nome, ids) => { P.ordenarComps(nome, ids); return P.composicoes(nome); });
trata('comp:aplicar', (nome, op) => { const alvos = P.aplicarEm(nome, op); return { alvos, comps: P.composicoes(nome) }; });
trata('midia:importar', async (nome, caminhos, opcoes = {}) => {
  const ids = await P.importar(nome, caminhos, { soAudio: !!opcoes.soAudio, baixar: (url, dir, o) => F.baixar(url, dir, nome, o) });
  return { ids, projeto: P.carregar(nome, compAberta), midia: dadosMidia(nome) };
});
trata('midia:escolher', async () => {
  const r = await dialog.showOpenDialog(janela, { properties: ['openFile', 'multiSelections'],
    filters: [{ name: 'Vídeo, imagem e áudio', extensions: ['mp4', 'mov', 'm4v', 'mkv', 'webm', 'png', 'jpg', 'jpeg', 'webp', 'wav', 'mp3', 'm4a'] }] });
  return r.canceled ? [] : r.filePaths;
});
trata('pasta:escolher', async () => { const r = await dialog.showOpenDialog(janela, { properties: ['openDirectory'] }); return r.canceled ? null : r.filePaths[0]; });
/* substituir mídia: troca o arquivo e, se pedido, confere a transcrição com a do arquivo novo */
async function substituir(nome, id, arquivo, { verificar = false } = {}) {
  const antiga = U.ler(path.join(P.dir(nome), 'transcricoes', id + '.json'), null);
  const r = await P.substituirMidia(nome, id, arquivo);
  let relatorio = null;
  if (verificar && r.depois.audio) {
    const nova = await F.transcrever(nome, id);
    if (antiga && antiga.length) {
      const al = F.alinharTranscricao(antiga, nova);
      U.gravar(path.join(P.dir(nome), 'transcricoes', id + '.json'), al.lista);
      relatorio = al.relatorio;
    } else relatorio = { total: nova.length, novas: nova.length, iguais: 0, trocadas: 0, removidas: 0, correcoesMantidas: 0, ocultasMantidas: 0, deslocamento: 0 };
  }
  enviar('projeto-externo', P.carregar(nome, compAberta));
  enviar('midia-pronta', dadosMidia(nome));
  enviar('transcricoes', P.transcricoes(nome));
  // quantos cortes usam essa mídia, em quais composições (para a tela dizer o que vai acompanhar)
  let usos = 0; const comps = [];
  for (const c of P.composicoes(nome).lista) {
    const v = P.carregar(nome, c.id); let n = 0;
    for (const f of v.faixas || []) for (const it of f.itens || []) if (it.midia === id) n++;
    if (n) { usos += n; comps.push(c.nome); }
  }
  return { antes: r.antes, depois: r.depois, relatorio, usos, comps };
}
trata('midia:substituir', (nome, id, arquivo, op) => substituir(nome, id, arquivo, op));
trata('midia:moverCortes', (nome, id, delta) => { const n = P.moverCortes(nome, id, +delta); enviar('projeto-externo', P.carregar(nome, compAberta)); return n; });
/* print do preview: o quadro daquele momento, renderizado igual à exportação, para anexar no chat */
/* imagem colada no chat (Ctrl+V): vira um arquivo na pasta do projeto para o Claude abrir */
trata('chat:colarImagem', (nome, base64, ext) => {
  const destino = path.join(P.dir(nome), 'quadros', `colada-${Date.now()}.${/^(png|jpe?g|webp|gif)$/i.test(ext) ? ext : 'png'}`);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, Buffer.from(base64, 'base64'));
  return destino;
});
trata('quadro:print', (nome, tempo, comp) => quadroProjeto(nome, +tempo, path.join(P.dir(nome), 'quadros', `print-${(+tempo).toFixed(2)}s-${Date.now()}.png`), comp));
trata('midia:escolherUm', async (titulo) => {
  const r = await dialog.showOpenDialog(janela, { title: titulo || 'Escolher arquivo', properties: ['openFile'],
    filters: [{ name: 'Vídeo, imagem e áudio', extensions: ['mp4', 'mov', 'm4v', 'mkv', 'webm', 'png', 'jpg', 'jpeg', 'webp', 'wav', 'mp3', 'm4a'] }] });
  return r.canceled ? null : r.filePaths[0];
});
trata('transcrever', async (nome, ids) => { for (const id of ids) await F.transcrever(nome, id); return P.transcricoes(nome); });
trata('transcricao:salvar', (nome, id, palavras) => { U.gravar(path.join(P.dir(nome), 'transcricoes', id + '.json'), palavras); return true; });
trata('exportar', (nome, op) => exportarProjeto(nome, op));
trata('chat:enviar', (nome, texto, ctx) => { enviarMensagem(nome, texto, ctx); return true; });
trata('chat:parar', nome => { const c = conversas.get(nome); if (c) { c.cancelado = true; try { require('child_process').spawnSync('taskkill', ['/pid', String(c.processo.pid), '/t', '/f'], { windowsHide: true }); } catch {} } return true; });
trata('chat:nova', nome => { const chat = U.ler(arqChat(nome), { mensagens: [] }); chat.sessao = null; chat.mensagens.push({ tipo: 'divisor', chave: 'd' + Date.now(), texto: 'Nova conversa', quando: Date.now() }); U.gravar(arqChat(nome), chat); return chat; });
trata('tarefas:listar', () => T.todas());
trata('tarefas:cancelar', id => T.cancelar(id));
trata('receitas:listar', () => listarReceitas());
trata('fontes:listar', () => Fo.listar());
trata('receitas:ler', id => fs.readFileSync(path.join(DIR_RECEITAS, path.basename(id) + '.md'), 'utf8'));
trata('config:ler', () => { let claude = ''; try { claude = C.acharClaude(); } catch {} return { ...U.cfg(), claudeAchado: claude }; });
trata('config:gravar', c => U.gravarCfg(c));
trata('abrir', alvo => { if (fs.existsSync(alvo) && fs.statSync(alvo).isFile()) shell.showItemInFolder(alvo); else shell.openPath(alvo); return true; });
trata('abrirArquivo', alvo => shell.openPath(alvo));

/* ── servidor do "bo": o Claude chama pelo terminal, o app executa e mostra na tela ── */
const ajudaBo = `bo — comandos do Blue Ocean Studio (rode na pasta do projeto)
  bo estado                          resumo da linha do tempo (mídias, faixas, itens, duração)
  bo importar <arquivo|pasta|link>… [--audio]  põe mídia no projeto (link é baixado; --audio baixa só o áudio)
  bo transcrever <m1 m2…|todas>      transcreve com tempo por palavra (Whisper na placa de vídeo)
  bo texto <m1> [--palavras]         mostra a transcrição com tempo (frases, ou palavra a palavra)
  bo silencio <m1> [--limiar -30] [--minimo 0.35]   trechos de silêncio da mídia
  bo folha <m1|linha> [--n 12] [--de s] [--ate s]    folha de contato (png) para você olhar
  bo quadro <segundos>               renderiza um quadro da linha do tempo exatamente como vai sair (png)
  bo legenda                         blocos de legenda como vão aparecer (tempo na linha do tempo)
  bo exportar [--nome X] [--de s] [--ate s] [--pasta dir]   renderiza o vídeo final
  bo fontes [busca]                  fontes do computador (id para o campo "fonte")
  bo receitas                        lista os processos salvos
  bo substituir m3 "novo.mov" [--verificar] [--mover-cortes]   troca o arquivo da mídia mantendo tudo que usa ela

composições (vários vídeos no mesmo projeto; todos os comandos aceitam --comp compX):
  bo comps                           lista as composições
  bo comp nova "Nome" [--copiar compX]   cria (vazia, ou cópia de outra)
  bo comp renomear compX "Nome" | bo comp apagar compX | bo comp abrir compX (mostra na tela)
  bo aplicar --de compX --em todas|comp2,comp3 --partes legenda,audio,formato,textos,estilo-textos,efeitos
  bo exportar --todas                exporta todas as composições`;

function argsBo(lista) {
  const pos = [], op = {};
  for (let i = 0; i < lista.length; i++) {
    const a = lista[i];
    if (a.startsWith('--')) { const k = a.slice(2); const v = lista[i + 1]; if (v == null || v.startsWith('--')) op[k] = true; else { op[k] = v; i++; } }
    else pos.push(a);
  }
  return { pos, op };
}

async function comandoBo(nome, cmd, lista, escrever) {
  const { pos, op } = argsBo(lista);
  const comp = op.comp || null;
  const carregar = () => M.normalizar(P.carregar(nome, comp));
  switch (cmd) {
    case undefined: case 'ajuda': case 'help': escrever(ajudaBo); return;
    case 'estado': {
      const p = carregar();
      const cs = P.composicoes(nome);
      escrever(`composição ${p.comp} "${p.compNome}" (${cs.lista.findIndex(c => c.id === p.comp) + 1} de ${cs.lista.length}) — arquivo composicoes/${p.comp}.json`);
      escrever(`formato ${p.formato.w}x${p.formato.h} ${p.formato.fps}fps · duração ${M.duracao(p).toFixed(2)}s`);
      escrever('\nmídias:');
      const trans = P.transcricoes(nome);
      for (const [id, m] of Object.entries(p.midias))
        escrever(`  ${id}  ${m.nome}  ${m.tipo} ${m.w}x${m.h} ${m.dur.toFixed(2)}s${m.audio ? '' : ' (sem áudio)'}${trans[id] ? ' · transcrito' : ''}\n      ${m.arquivo}`);
      escrever('\nfaixas (a primeira de vídeo fica embaixo):');
      for (const f of p.faixas) {
        escrever(`  ${f.id} (${f.tipo}) — ${f.itens.length} item(ns)`);
        for (const it of f.itens) {
          const fim = M.fimItem(f, it).toFixed(2);
          if (f.tipo === 'video' || f.tipo === 'audio') escrever(`    ${it.id}: ${it.midia} ${it.inicio.toFixed(2)}→${fim}s  (arquivo ${it.entrada.toFixed(2)}–${it.saida.toFixed(2)})  caixa ${Math.round(it.caixa?.x ?? 0)},${Math.round(it.caixa?.y ?? 0)} ${Math.round(it.caixa?.w ?? 0)}x${Math.round(it.caixa?.h ?? 0)} zoom ${it.zoom ?? 1} foco ${it.foco ? it.foco.x + ',' + it.foco.y : '-'} vol ${it.volume}`);
          else if (it.tipo === 'qualificacao') escrever(`    ${it.id}: FAIXA "${it.texto.slice(0, 70)}" ${it.inicio.toFixed(2)}→${fim}s topo y=${it.y} altura ${it.altura} entrada ${it.entrada}${it.entrada === 'esquerda' ? ` (${it.durEntrada}s)` : ''} fonte ${it.fonte}`);
          else if (f.tipo === 'texto') escrever(`    ${it.id}: HEADLINE "${it.texto.replace(/\n/g, ' / ').slice(0, 60)}" estilo ${it.estilo} ${it.inicio.toFixed(2)}→${fim}s centro ${Math.round(it.x)},${Math.round(it.y)} tam ${it.tam} fonte ${it.fonte}`);
          else escrever(`    ${it.id}: ${it.efeito} ${it.inicio.toFixed(2)}→${fim}s`);
        }
      }
      escrever(`\nlegenda: ${p.legenda.ativa ? 'ligada' : 'desligada'} (tam ${p.legenda.tam}, pos ${p.legenda.pos}%, ${p.legenda.palavras} palavras)`);
      escrever(`áudio: ${p.audio.normalizar ? `normaliza ${p.audio.lufs} LUFS` : 'sem normalizar'}${p.audio.limpar ? ', limpa ruído' : ''}${p.audio.voz ? ', realça voz' : ''}`);
      return;
    }
    case 'importar': {
      if (!pos.length) throw new Error('diga o que importar: bo importar "C:\\pasta\\video.mp4"');
      const ids = await P.importar(nome, pos, { soAudio: !!op.audio, baixar: (url, dir, o) => F.baixar(url, dir, nome, o), aoLog: escrever });
      escrever('importado: ' + ids.join(', '));
      enviar('projeto-externo', P.carregar(nome, compAberta));
      enviar('midia-pronta', dadosMidia(nome));
      return;
    }
    case 'transcrever': {
      const p = carregar();
      const ids = pos[0] === 'todas' || !pos.length ? Object.keys(p.midias).filter(id => p.midias[id].audio) : pos;
      for (const id of ids) {
        escrever(`── ${id} (${p.midias[id]?.nome}) ──`);
        const pal = await F.transcrever(nome, id, { contexto: op.contexto || '' });
        escrever(F.textoFrases(pal));
      }
      enviar('transcricoes', P.transcricoes(nome));
      return;
    }
    case 'texto': {
      const trans = P.transcricoes(nome);
      for (const id of pos.length ? pos : Object.keys(trans)) {
        const pal = trans[id];
        if (!pal) { escrever(`${id}: ainda não transcrito (bo transcrever ${id})`); continue; }
        escrever(`── ${id} ──`);
        if (op.palavras) escrever(pal.map((w, i) => `${i}\t${w.i.toFixed(2)}\t${w.f.toFixed(2)}\t${w.t}`).join('\n'));
        else escrever(F.textoFrases(pal));
      }
      return;
    }
    case 'silencio': {
      const m = carregar().midias[pos[0]];
      if (!m) throw new Error('mídia não encontrada: ' + pos[0]);
      const s = await F.silencios(m.arquivo, +(op.limiar ?? -30), +(op.minimo ?? 0.35));
      escrever(s.length ? s.map(([a, b]) => `${a.toFixed(2)} → ${b == null ? 'fim' : b.toFixed(2)}  (${b == null ? '' : (b - a).toFixed(2) + 's'})`).join('\n') : 'nenhum silêncio com esses parâmetros');
      return;
    }
    case 'folha': {
      const alvo = pos[0] || 'linha';
      const n = Math.min(24, +(op.n || 12));
      const destino = path.join(P.dir(nome), 'quadros', `folha-${alvo}-${Date.now()}.png`);
      if (alvo === 'linha') {
        const p = carregar(); const dur = M.duracao(p);
        const de = +(op.de || 0), ate = +(op.ate || dur);
        const tmp = [];
        for (let i = 0; i < n; i++) {
          const t = de + (ate - de) * (i + 0.5) / n;
          tmp.push(await quadroProjeto(nome, t, path.join(P.dir(nome), 'cache', `f${i}.png`), comp));
        }
        const col = Math.min(n, 6);
        const fonte = U.paraFiltro(path.join(U.RAIZ, 'fontes', 'Montserrat-Bold.ttf'));
        const entradas = tmp.flatMap(f => ['-i', f]);
        const esc = tmp.map((_, i) => `[${i}]scale=200:-2,drawtext=fontfile='${fonte}':text='${(de + (ate - de) * (i + 0.5) / n).toFixed(2)}s':x=6:y=6:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.6:boxborderw=4[q${i}]`).join(';');
        await U.rodar('ffmpeg', ['-y', '-v', 'error', ...entradas, '-filter_complex', `${esc};${tmp.map((_, i) => `[q${i}]`).join('')}xstack=inputs=${n}:layout=${tmp.map((_, i) => `${(i % col) ? Array.from({ length: i % col }, () => 'w0').join('+') : '0'}_${Math.floor(i / col) ? Array.from({ length: Math.floor(i / col) }, () => 'h0').join('+') : '0'}`).join('|')}:fill=0x08090D`, destino]);
        tmp.forEach(f => { try { fs.unlinkSync(f); } catch {} });
      } else {
        const m = carregar().midias[alvo];
        if (!m) throw new Error('mídia não encontrada: ' + alvo);
        await F.folha(m.arquivo, destino, { n, ini: +(op.de || 0), fim: op.ate != null ? +op.ate : null });
      }
      escrever('folha: ' + destino + '\n(abra com a ferramenta Read para ver)');
      return;
    }
    case 'quadro': {
      if (pos[0] == null) throw new Error('diga o tempo: bo quadro 3.5');
      const f = await quadroProjeto(nome, +pos[0], op.saida ? path.resolve(op.saida) : null, comp);
      escrever('quadro: ' + f + '\n(abra com a ferramenta Read para ver)');
      return;
    }
    case 'legenda': {
      const p = carregar();
      const q = M.quadrosLegenda(p, P.transcricoes(nome));
      if (!q.length) { escrever('sem palavras: transcreva as mídias com áudio (bo transcrever todas)'); return; }
      const blocos = []; for (const x of q) if (x.k === 0) blocos.push(x);
      escrever(`legenda ${p.legenda.ativa ? 'LIGADA' : 'DESLIGADA'} — ${blocos.length} blocos`);
      for (const b of blocos) escrever(`[${b.ini.toFixed(2)}] ${b.texto.join(' ')}`);
      return;
    }
    case 'exportar': {
      const alvos = op.todas ? P.composicoes(nome).lista.map(c => c.id) : [comp];
      for (const c of alvos) {
        const r = await exportarProjeto(nome, { arquivo: op.todas ? undefined : op.nome, ini: +(op.de || 0), fim: op.ate != null ? +op.ate : null, pasta: op.pasta, comp: c });
        escrever(`exportado: ${r.destino} (${r.dur.toFixed(2)}s)`);
      }
      return;
    }
    case 'substituir': {
      const [id, arquivo] = pos;
      if (!id || !arquivo) throw new Error('use: bo substituir m3 "C:\\caminho\\novo.mov" [--verificar] [--mover-cortes]');
      const r = await substituir(nome, id, path.resolve(arquivo), { verificar: !!op.verificar });
      escrever(`${id}: ${r.antes.nome} → ${r.depois.nome} (${r.antes.dur.toFixed(2)}s → ${r.depois.dur.toFixed(2)}s) · usada em ${r.usos} corte(s): ${r.comps.join(', ') || 'nenhuma composição'}`);
      if (r.relatorio) {
        const q = r.relatorio;
        escrever(`transcrição: ${q.iguais} iguais, ${q.trocadas} trocadas, ${q.novas} novas, ${q.removidas} removidas; ${q.correcoesMantidas} correção(ões) e ${q.ocultasMantidas} palavra(s) escondida(s) mantidas`);
        escrever(`a fala andou ${q.deslocamento >= 0 ? '+' : ''}${q.deslocamento.toFixed(2)}s no arquivo novo${q.deslocamentoUniforme ? ' (uniforme)' : ' (não uniforme: confira cada corte)'}`);
        if (op['mover-cortes'] && Math.abs(q.deslocamento) >= 0.03) escrever(`cortes movidos: ${P.moverCortes(nome, id, q.deslocamento)}`);
      }
      enviar('projeto-externo', P.carregar(nome, compAberta));
      return;
    }
    case 'comps': {
      const cs = P.composicoes(nome);
      for (const c of cs.lista) escrever(`${c.id === cs.ativa ? '▶' : ' '} ${c.id.padEnd(8)} "${c.nome}"  ${c.dur.toFixed(1)}s · ${c.itens} item(ns)  composicoes/${c.id}.json`);
      return;
    }
    case 'comp': {
      const [acao, ...resto] = pos;
      if (acao === 'nova') {
        const id = P.criarComp(nome, { nome: resto.join(' '), copiarDe: op.copiar || null });
        escrever(`criada: ${id}${op.copiar ? ` (cópia de ${op.copiar})` : ''} — arquivo composicoes/${id}.json`);
      } else if (acao === 'renomear') { P.renomearComp(nome, resto[0], resto.slice(1).join(' ')); escrever('renomeada'); }
      else if (acao === 'apagar') { P.apagarComp(nome, resto[0]); escrever('apagada (fica em composicoes/_apagadas)'); }
      else if (acao === 'abrir') { const id = P.ativarComp(nome, resto[0]); enviar('comp-abrir', { projeto: nome, comp: id }); escrever('aberta na tela: ' + id); }
      else throw new Error('use: bo comp nova "Nome" [--copiar compX] | renomear compX "Nome" | apagar compX | abrir compX');
      enviar('comps', P.composicoes(nome));
      return;
    }
    case 'aplicar': {
      if (!op.partes) throw new Error(`diga as partes: bo aplicar --de comp1 --em todas --partes ${P.PARTES.join(',')}`);
      const alvos = P.aplicarEm(nome, { de: op.de || comp, em: op.em || 'todas', partes: op.partes });
      escrever(`aplicado (${op.partes}) em: ${alvos.join(', ') || 'nenhuma'}`);
      enviar('comps', P.composicoes(nome));
      if (alvos.includes(compAberta)) enviar('projeto-externo', P.carregar(nome, compAberta));
      return;
    }
    case 'fontes': {
      const busca = (pos.join(' ') || '').toLowerCase();
      const lista = Fo.listar().filter(f => !busca || `${f.grupo} ${f.estilo} ${f.id}`.toLowerCase().includes(busca));
      escrever(`${lista.length} fonte(s) — use o id no campo "fonte" (padrão das headlines e faixas: ${M.FONTE_PADRAO})`);
      for (const f of lista) escrever(`  ${f.id.padEnd(34)} ${f.grupo} ${f.estilo}${f.italico ? ' (itálico)' : ''}`);
      return;
    }
    case 'receitas': {
      for (const r of listarReceitas()) escrever(`${r.titulo} — ${r.resumo}\n  ${r.arquivo}`);
      return;
    }
    default: throw new Error(`comando desconhecido: ${cmd}\n\n${ajudaBo}`);
  }
}

function subirServidor() {
  return new Promise(ok => {
    const srv = http.createServer((req, res) => {
      if (req.method !== 'POST' || req.url !== '/bo') { res.writeHead(404); return res.end(); }
      let corpo = '';
      req.on('data', d => { corpo += d; });
      req.on('end', async () => {
        let q; try { q = JSON.parse(corpo); } catch { res.writeHead(400); return res.end(); }
        if (q.token !== TOKEN) { res.writeHead(403); return res.end('token inválido'); }
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        const escrever = s => res.write(String(s) + '\n');
        const nome = q.projeto || projetoAberto;
        enviar('bo', { projeto: nome, cmd: q.cmd, args: q.args });
        try {
          if (!nome || !fs.existsSync(P.arqProjeto(nome))) throw new Error('não sei qual é o projeto (rode dentro da pasta do projeto)');
          await comandoBo(nome, q.cmd, q.args || [], escrever);
          res.end('@@SAIDA 0\n');
        } catch (e) { res.end('ERRO: ' + e.message + '\n@@SAIDA 1\n'); }
      });
    });
    srv.listen(0, '127.0.0.1', () => {
      porta = srv.address().port;
      U.gravar(ARQ_CONTROLE, { porta, token: TOKEN, pid: process.pid });
      ok();
    });
  });
}

/* ── atualização: quando o código do programa muda (o Claude corrigiu algo), avisa e oferece reiniciar ── */
function vigiarAtualizacao() {
  // o OneDrive "toca" nos arquivos ao sincronizar sem mudar nada: compara o conteúdo com o da abertura
  const hash = f => { try { return crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex'); } catch { return null; } };
  const pastas = [__dirname, path.join(__dirname, 'motor'), path.join(__dirname, 'ui')];
  const inicio = new Map();
  for (const p of pastas) for (const f of fs.readdirSync(p)) if (/\.(js|css|html|mjs)$/i.test(f)) inicio.set(path.join(p, f), hash(path.join(p, f)));
  let avisado = false, timer = null;
  for (const p of pastas) {
    try {
      fs.watch(p, (ev, arq) => {
        if (avisado || !arq || !/\.(js|css|html|mjs)$/i.test(arq)) return;
        clearTimeout(timer);
        timer = setTimeout(() => {   // espera terminar de gravar
          const f = path.join(p, arq);
          if (hash(f) === inicio.get(f)) return;
          avisado = true;
          enviar('atualizacao', { arquivo: arq });
        }, 1500);
      });
    } catch {}
  }
}
trata('reiniciar', () => {
  if (conversas.size) throw new Error('o Claude ainda está trabalhando; espere ele terminar para reiniciar');
  app.relaunch(); app.exit(0);
});

app.whenReady().then(async () => {
  vigiarAtualizacao();
  app.setAppUserModelId('com.blueocean.studio');
  if (process.platform === 'win32' && !ISOLADO && /Blue Ocean Studio.exe$/i.test(process.execPath)) {
    const opcoes = { target: process.execPath, args: `"${__dirname}"`, cwd: __dirname, icon: path.join(__dirname, 'assets', 'icone.ico'), iconIndex: 0,
      appUserModelId: 'com.blueocean.studio', description: 'Editor de vídeo da Blue Ocean com o Claude' };
    const atalho = path.join(app.getPath('appData'), 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Blue Ocean Studio.lnk');
    try { shell.writeShortcutLink(atalho, fs.existsSync(atalho) ? 'replace' : 'create', opcoes); } catch {}
  }
  await subirServidor();
  criarJanela();
});
app.on('window-all-closed', () => {
  for (const c of conversas.values()) { try { require('child_process').spawnSync('taskkill', ['/pid', String(c.processo.pid), '/t', '/f'], { windowsHide: true }); } catch {} }
  try { fs.unlinkSync(ARQ_CONTROLE); } catch {}
  app.quit();
});
