/* Tarefas em segundo plano (transcrição, proxy, download, exportação).
   Tudo que roda aparece na tela com etapa e porcentagem. */
const { EventEmitter } = require('events');

const eventos = new EventEmitter();
const lista = new Map();
let seq = 0;

function criar(titulo, projeto) {
  const t = { id: 't' + (++seq), titulo, projeto, etapa: 'iniciando…', pct: null, log: [], fim: false, erro: null, inicio: Date.now(), controle: {} };
  lista.set(t.id, t);
  avisar(t);
  return t;
}
function avisar(t) { eventos.emit('mudou', resumo(t)); }
const resumo = t => ({ id: t.id, titulo: t.titulo, projeto: t.projeto, etapa: t.etapa, pct: t.pct, fim: t.fim, erro: t.erro, inicio: t.inicio });

let ultimo = 0;
function progresso(t, etapa, pct) {
  if (etapa != null) t.etapa = etapa;
  if (pct !== undefined) t.pct = pct == null ? null : Math.max(0, Math.min(100, Math.round(pct)));
  // não inunda a tela: no máximo ~8 avisos por segundo
  const agora = Date.now();
  if (agora - ultimo > 120) { ultimo = agora; avisar(t); }
}
function log(t, s) { t.log.push(s); if (t.log.length > 400) t.log.shift(); eventos.emit('log', { id: t.id, linha: s }); }

async function rodar(titulo, projeto, fn) {
  const t = criar(titulo, projeto);
  try {
    const r = await fn(t);
    t.fim = true; t.pct = 100; t.etapa = 'pronto';
    return r;
  } catch (e) {
    t.fim = true; t.erro = e.message; t.etapa = 'erro';
    throw e;
  } finally {
    avisar(t);
    setTimeout(() => { lista.delete(t.id); eventos.emit('sumiu', t.id); }, 60000);
  }
}
function cancelar(id) {
  const t = lista.get(id);
  if (!t || t.fim) return false;
  t.controle.cancelado = true;
  try { t.controle.processo?.kill(); } catch {}
  return true;
}
const todas = () => [...lista.values()].map(resumo);

module.exports = { eventos, rodar, progresso, log, cancelar, todas };
