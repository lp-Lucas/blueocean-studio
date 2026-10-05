/* Base da interface: estado, histórico, salvar, medir texto, avisos. */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const M = window.Modelo;
const api = window.bo;

const S = {
  nome: null, projeto: null, trans: {}, midia: {}, pasta: '',
  sel: new Set(), t: 0, tocando: false, mudo: false, guias: false,
  zoom: 60, ima: true, rodando: false, chat: null,
  hist: [], histI: -1,
};
const bus = new EventTarget();
const emitir = (nome, det) => bus.dispatchEvent(new CustomEvent(nome, { detail: det }));
const ouvir = (nome, fn) => bus.addEventListener(nome, e => fn(e.detail));

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const limitar = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = t => { t = Math.max(0, t || 0); const m = Math.floor(t / 60); return `${m}:${(t % 60).toFixed(2).padStart(5, '0')}`; };
const fmtCurto = t => { t = Math.max(0, t || 0); const m = Math.floor(t / 60), s = Math.floor(t % 60); return m ? `${m}:${String(s).padStart(2, '0')}` : `${(t).toFixed(1)}s`; };
/* caminho do Windows → file:// (a letra do disco fica como está) */
const urlArquivo = p => p ? 'file:///' + p.replace(/\\/g, '/').split('/').map((s, i) => i === 0 ? s : encodeURIComponent(s)).join('/') : '';
/* versão da mídia na URL: depois de substituir (mesmo caminho), o navegador não usa o vídeo antigo do cache */
const versaoMidia = id => (S.midia?.[id]?.v || 0) + (S.projeto?.midias?.[id]?.versao || 0);
const urlMidia = (p, id) => p ? urlArquivo(p) + '?v=' + versaoMidia(id) : '';
const html = (s) => { const t = document.createElement('template'); t.innerHTML = s.trim(); aplicarIcones(t.content); return t.content.firstElementChild; };
const duracao = () => S.projeto ? M.duracao(S.projeto) : 0;
function acharItem(id) {
  if (!S.projeto) return null;
  for (const f of S.projeto.faixas) { const it = f.itens.find(i => i.id === id); if (it) return { f, it }; }
  return null;
}

/* ── fontes: cada arquivo do computador vira uma família própria no preview ("F_<id>"),
      o mesmo arquivo que o libass usa na exportação ── */
const carregadas = new Map();   // id → Promise
function carregarFonte(id) {
  id = M.idFonte(id);
  if (carregadas.has(id)) return carregadas.get(id);
  const f = M.fonte(id);
  const url = f.arquivo ? urlArquivo(f.arquivo) : '../fontes/Montserrat-Bold.ttf';
  const ff = new FontFace('F_' + id.replace(/[^\w-]/g, '_'), `url('${url}')`);
  document.fonts.add(ff);
  const pr = ff.load().then(() => { cacheMedida.clear(); emitir('fonte', id); }).catch(() => {});
  carregadas.set(id, pr);
  return pr;
}
/* garante que as fontes que o projeto usa já carregaram (antes de medir para exportar) */
function fontesDoProjeto(p) {
  const ids = new Set([p.legenda?.fonte || 'Montserrat-Bold']);
  for (const f of p.faixas || []) if (f.tipo === 'texto') for (const it of f.itens) { ids.add(it.fonte); ids.add(M.negritoDe(it.fonte)); }
  return Promise.all([...ids].filter(Boolean).map(carregarFonte));
}
let fontesProntas = Promise.resolve();
const fonteCss = (id, tam) => { id = M.idFonte(id); carregarFonte(id); return `${M.emDe(id, tam)}px "F_${id.replace(/[^\w-]/g, '_')}"`; };
const ctxMedida = document.createElement('canvas').getContext('2d');
const cacheMedida = new Map();
/* largura de avanço e a tinta (esquerda/direita) do texto, em px do projeto */
function medir(texto, fonte, tam) {
  fonte = M.idFonte(fonte);
  const k = fonte + '|' + tam + '|' + texto;
  let r = cacheMedida.get(k);
  if (r) return r;
  ctxMedida.font = fonteCss(fonte, tam);
  const m = ctxMedida.measureText(texto);
  r = { largura: m.width, esq: m.actualBoundingBoxLeft, dir: m.actualBoundingBoxRight };
  if (cacheMedida.size > 5000) cacheMedida.clear();
  cacheMedida.set(k, r);
  return r;
}

/* ── histórico e salvar ── */
let timerSalvar = null;
function registrar() {
  const snap = JSON.stringify(S.projeto);
  if (S.hist[S.histI] === snap) return;
  S.hist = S.hist.slice(0, S.histI + 1);
  S.hist.push(snap);
  if (S.hist.length > 150) S.hist.shift();
  S.histI = S.hist.length - 1;
  emitir('historico');
}
let salvarFn = null;
function salvarLogo() {
  const el = $('#salvo'); el.classList.add('salvando'); el.querySelector('span').textContent = 'Salvando…';
  clearTimeout(timerSalvar);
  // guarda projeto e composição de agora: se trocar de aba antes de salvar, vai para o lugar certo
  const nome = S.nome, proj = S.projeto, comp = S.comp;
  salvarFn = () => api.chamar('projetos:salvar', nome, proj, comp);
  timerSalvar = setTimeout(executarSalvar, 280);
}
async function executarSalvar() {
  const f = salvarFn; salvarFn = null;
  if (!f) return;
  const el = $('#salvo');
  try { await f(); el.querySelector('span').textContent = 'Salvo'; }
  catch (e) { el.querySelector('span').textContent = 'Erro ao salvar'; toast(e.message, { tipo: 'erro' }); }
  el.classList.remove('salvando');
}
/* grava já o que estiver esperando (antes de trocar de composição ou de projeto) */
async function salvarPendente() { clearTimeout(timerSalvar); await executarSalvar(); }
/* toda mudança do usuário passa por aqui: normaliza, guarda no histórico, salva e redesenha */
function commit(opcoes = {}) {
  M.normalizar(S.projeto);
  registrar();
  salvarLogo();
  emitir('projeto', opcoes);
}
/* mudança contínua (arrastar): redesenha sem salvar; commit() no fim do gesto */
function mexendo() { emitir('mexendo'); }
function desfazer() {
  if (S.histI <= 0) return;
  S.histI--; S.projeto = JSON.parse(S.hist[S.histI]);
  salvarLogo(); emitir('projeto', { historico: true }); emitir('historico');
  toast('Desfeito', { ico: 'undo', dur: 1200 });
}
function refazer() {
  if (S.histI >= S.hist.length - 1) return;
  S.histI++; S.projeto = JSON.parse(S.hist[S.histI]);
  salvarLogo(); emitir('projeto', { historico: true }); emitir('historico');
  toast('Refeito', { ico: 'redo', dur: 1200 });
}

/* ── avisos ── */
function toast(texto, { tipo = '', ico = null, acao = null, fn = null, dur = 3800 } = {}) {
  const el = html(`<div class="toast ${tipo}"><i data-i="${ico || (tipo === 'erro' ? 'alert' : tipo === 'ok' ? 'check' : 'sparkle')}"></i><span>${esc(texto)}</span>${acao ? `<button class="acao">${esc(acao)}</button>` : ''}</div>`);
  if (acao) el.querySelector('.acao').onclick = () => { fn?.(); sair(); };
  $('#toasts').append(el);
  const sair = () => { el.classList.add('saindo'); setTimeout(() => el.remove(), 300); };
  setTimeout(sair, dur);
}
function abrirModal(conteudo, aoMontar) {
  const cx = $('#modalCaixa');
  cx.innerHTML = conteudo; aplicarIcones(cx);
  $('#modal').classList.remove('oculto');
  aoMontar?.(cx);
  const primeiro = cx.querySelector('input,textarea'); primeiro?.focus(); primeiro?.select?.();
}
function fecharModal() { $('#modal').classList.add('oculto'); }
$('#modal').addEventListener('pointerdown', e => { if (e.target.id === 'modal') fecharModal(); });

function menuContexto(x, y, itens) {
  const m = $('#menuCtx');
  m.innerHTML = itens.map((it, i) => it === '-' ? '<hr>' : `<button data-k="${i}"><i data-i="${it.ico || 'estrela'}"></i>${esc(it.txt)}</button>`).join('');
  aplicarIcones(m);
  m.classList.remove('oculto');
  const r = m.getBoundingClientRect();
  m.style.left = Math.min(x, innerWidth - r.width - 8) + 'px';
  m.style.top = Math.min(y, innerHeight - r.height - 8) + 'px';
  m.onclick = e => { const b = e.target.closest('button'); if (!b) return; m.classList.add('oculto'); itens[+b.dataset.k].fn(); };
}
addEventListener('pointerdown', e => { if (!e.target.closest('#menuCtx')) $('#menuCtx').classList.add('oculto'); if (!e.target.closest('.pop,#btnTarefas,#btnProjeto')) $$('.pop').forEach(p => p.classList.add('oculto')); }, true);

/* slider com a trilha preenchida até o valor */
function pintarRange(r) { const p = (r.value - r.min) / (r.max - r.min) * 100; r.style.setProperty('--p', p + '%'); }
document.addEventListener('input', e => { if (e.target.type === 'range') pintarRange(e.target); });

/* markdown simples para o chat e as receitas */
function markdown(md) {
  const blocos = [];
  md = String(md || '').replace(/```(\w*)\n?([\s\S]*?)```/g, (_, l, c) => { blocos.push(`<pre><code>${esc(c.replace(/\n$/, ''))}</code></pre>`); return `\u0000${blocos.length - 1}\u0000`; });
  const inline = s => esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="#" data-link="$2">$1</a>');
  const linhas = md.split('\n'); const out = []; let i = 0;
  while (i < linhas.length) {
    const l = linhas[i];
    if (/^\u0000\d+\u0000$/.test(l.trim())) { out.push(blocos[+l.trim().slice(1, -1)]); i++; continue; }
    if (/^\s*\|.*\|\s*$/.test(l) && /^\s*\|[\s:|-]+\|\s*$/.test(linhas[i + 1] || '')) {
      const cel = s => s.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      let t = `<table><thead><tr>${cel(l).map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>`;
      i += 2;
      while (i < linhas.length && /^\s*\|.*\|\s*$/.test(linhas[i])) { t += `<tr>${cel(linhas[i]).map(c => `<td>${inline(c)}</td>`).join('')}</tr>`; i++; }
      out.push(t + '</tbody></table>'); continue;
    }
    if (/^#{1,4}\s/.test(l)) { out.push(`<h3>${inline(l.replace(/^#+\s/, ''))}</h3>`); i++; continue; }
    if (/^\s*([-*]|\d+\.)\s/.test(l)) {
      const ord = /^\s*\d+\./.test(l); const itens = [];
      while (i < linhas.length && /^\s*([-*]|\d+\.)\s/.test(linhas[i])) { itens.push(`<li>${inline(linhas[i].replace(/^\s*([-*]|\d+\.)\s/, ''))}</li>`); i++; }
      out.push(`<${ord ? 'ol' : 'ul'}>${itens.join('')}</${ord ? 'ol' : 'ul'}>`); continue;
    }
    if (/^>\s?/.test(l)) { out.push(`<p style="color:var(--texto-2)">${inline(l.replace(/^>\s?/, ''))}</p>`); i++; continue; }
    if (!l.trim()) { i++; continue; }
    const par = [];
    while (i < linhas.length && linhas[i].trim() && !/^(#{1,4}\s|\s*([-*]|\d+\.)\s|\s*\||\u0000)/.test(linhas[i])) { par.push(inline(linhas[i])); i++; }
    if (par.length) out.push(`<p>${par.join('<br>')}</p>`); else i++;
  }
  return out.join('');
}
