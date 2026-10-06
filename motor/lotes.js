/* Lotes: vários clientes de uma vez. Cada lote = cliente + brutos (links e/ou arquivos) + site + receita.
   "Gerar" cria um projeto para o lote, importa os arquivos e manda o Claude seguir a receita sozinho, do começo ao fim.
   Uma fila roda N lotes ao mesmo tempo (padrão 2: cada um usa placa de vídeo e Claude). Depois o lote é um projeto
   comum: abre no editor e continua pelo chat.
   Fica salvo em <dados>/lotes.json. */
const fs = require('fs');
const path = require('path');
const U = require('./util');
const P = require('./projeto');

const ARQ = () => path.join(U.DADOS, 'lotes.json');
let estado = null, deps = null;
const ATIVOS = new Set();          // ids rodando agora

function ler() {
  if (estado) return estado;
  estado = U.ler(ARQ(), { simultaneos: 2, seq: 0, lista: [] });
  // o programa fechou no meio: quem estava rodando fica "interrompido" (dá para continuar)
  for (const l of estado.lista) if (['na-fila', 'preparando', 'trabalhando'].includes(l.estado)) { l.estado = 'interrompido'; l.passo = 'o programa foi fechado no meio'; }
  return estado;
}
let timer = null;
function gravar() {
  clearTimeout(timer);
  timer = setTimeout(() => U.gravar(ARQ(), estado), 300);
  deps?.enviar('lotes', publico());
}
const publico = () => ({ simultaneos: estado.simultaneos, lista: estado.lista });
const achar = id => { const l = ler().lista.find(x => x.id === id); if (!l) throw new Error('lote não encontrado'); return l; };

function novo(dados = {}) {
  const e = ler();
  const id = 'l' + (++e.seq);
  const l = { id, cliente: '', links: '', arquivos: [], site: '', receita: dados.receita || '', formato: '9:16', obs: '', exportar: false,
    estado: 'rascunho', passo: '', projeto: null, criado: Date.now(), ...dados, id };
  e.lista.push(l); gravar();
  return l;
}
const CAMPOS = ['cliente', 'links', 'arquivos', 'site', 'receita', 'formato', 'obs', 'exportar', 'etapa'];
function salvar(id, campos) {
  const l = achar(id);
  for (const k of CAMPOS) if (k in campos) l[k] = campos[k];
  gravar();
  return l;
}
function apagar(id) {
  if (ATIVOS.has(id)) throw new Error('este lote está rodando; pare antes de apagar');
  const e = ler(); e.lista = e.lista.filter(x => x.id !== id); gravar();
}
function simultaneos(n) { ler().simultaneos = Math.max(1, Math.min(4, +n || 2)); gravar(); proximo(); }

/* ── fila ── */
function gerar(ids) {
  for (const id of [].concat(ids)) {
    const l = achar(id);
    if (ATIVOS.has(id) || l.estado === 'na-fila') continue;
    if (!String(l.cliente).trim()) throw new Error('dê um nome ao cliente do lote');
    if (!String(l.links).trim() && !l.arquivos.length) throw new Error(`${l.cliente}: falta o bruto (link ou arquivo)`);
    if (!l.receita) throw new Error(`${l.cliente}: escolha a receita`);
    l.estado = 'na-fila'; l.passo = 'esperando a vez'; l.erro = null; l.pedido = Date.now();
  }
  gravar(); proximo();
}
function proximo() {
  const e = ler();
  while (ATIVOS.size < e.simultaneos) {
    const l = e.lista.filter(x => x.estado === 'na-fila').sort((a, b) => a.pedido - b.pedido)[0];
    if (!l) break;
    ATIVOS.add(l.id);
    rodar(l).finally(() => { ATIVOS.delete(l.id); gravar(); proximo(); });
  }
}
function nomeLivre(base) {
  const existentes = new Set(P.listar().map(p => p.nome.toLowerCase()));
  let n = U.limparNome(base) || 'Lote', i = 2;
  const b = n;
  while (existentes.has(n.toLowerCase())) n = `${b} ${i++}`;
  return n;
}

async function rodar(l) {
  const { enviarMensagem, receitas } = deps;
  try {
    l.estado = 'preparando'; l.inicio = Date.now(); l.fim = null; l.custo = null; gravar();
    const continuar = !!l.projeto && fs.existsSync(path.join(P.dir(l.projeto), 'projeto.json'));
    if (!continuar) {
      l.passo = 'criando o projeto'; gravar();
      l.projeto = nomeLivre(l.cliente);
      P.criar(l.projeto, l.formato || '9:16');
      if (l.arquivos.length) {
        l.passo = `importando ${l.arquivos.length} arquivo${l.arquivos.length > 1 ? 's' : ''}`; gravar();
        await P.importar(l.projeto, l.arquivos, {});
      }
    }
    const r = receitas().find(x => x.id === l.receita);
    if (!r) throw new Error('receita não encontrada: ' + l.receita);
    l.estado = 'trabalhando'; l.passo = 'o Claude está lendo a receita'; gravar();
    await enviarMensagem(l.projeto, continuar ? textoContinuar(l, r) : textoPedido(l, r));
    // como terminou: o último "fim" da conversa diz se deu erro e quanto custou
    const chat = U.ler(path.join(P.dir(l.projeto), 'chat.json'), { mensagens: [] });
    const fim = [...chat.mensagens].reverse().find(m => m.tipo === 'fim');
    l.custo = fim?.custo ?? null;
    if (fim?.cancelado) { l.estado = 'interrompido'; l.passo = 'parado por você'; }
    else if (fim?.erro) { l.estado = 'erro'; l.erro = fim.erro; l.passo = 'parou com erro'; }
    else { l.estado = 'pronto'; l.passo = 'pronto para revisar'; l.resumo = [...chat.mensagens].reverse().find(m => m.tipo === 'texto')?.texto?.slice(0, 1200) || ''; }
  } catch (e) {
    l.estado = 'erro'; l.erro = e.message; l.passo = 'parou com erro';
  }
  l.fim = Date.now();
}

function textoPedido(l, r) {
  const midias = (() => { try { return Object.entries(P.carregar(l.projeto).midias || {}).map(([id, m]) => `${id} (${path.basename(m.arquivo)})`); } catch { return []; } })();
  const links = String(l.links).split(/\s+/).filter(x => /^https?:\/\//i.test(x));
  return [
    `[Lote] Edição em lote para o cliente "${l.cliente}". A pessoa NÃO está acompanhando agora: faça o processo inteiro`,
    `sozinho, sem parar para perguntar. Quando houver dúvida, decida pelo padrão da receita e, no fim, liste as decisões`,
    `que tomou, o que é conteúdo ilustrativo e o que vale a pessoa conferir.`,
    ``,
    `Siga a receita "${r.titulo}" — leia o arquivo antes de começar: ${r.arquivo}`,
    ``,
    links.length ? `Brutos (links):\n${links.map(x => '- ' + x).join('\n')}` : '',
    midias.length ? `Brutos já importados no projeto: ${midias.join(', ')}` : '',
    l.site ? `Site do cliente: ${l.site}` : '',
    l.obs ? `Observações da pessoa: ${l.obs}` : '',
    ``,
    l.exportar ? `No fim, exporte as composições finais (bo exportar --comp ... para cada uma) e diga onde ficaram.`
      : `Não exporte: deixe as composições finais prontas e abertas para a pessoa revisar no editor.`,
  ].filter((x, i, a) => x !== '' || a[i - 1] !== '').join('\n');
}
const textoContinuar = (l, r) => `[Lote] Continue o lote do cliente "${l.cliente}" de onde parou, seguindo a receita "${r.titulo}" (${r.arquivo}). ` +
  `Confira o que já está feito no projeto antes de refazer qualquer coisa. Mesmas regras: não pare para perguntar; no fim, liste as decisões que tomou.`;

function parar(id) {
  const l = achar(id);
  if (l.estado === 'na-fila') { l.estado = 'rascunho'; l.passo = ''; gravar(); return; }
  if (l.projeto) deps.pararChat(l.projeto);
}

/* passo atual de cada lote, a partir dos eventos do chat do projeto */
function aoEvento(projeto, ev) {
  if (!estado) return;
  const l = estado.lista.find(x => x.projeto === projeto && ATIVOS.has(x.id));
  if (!l || !ev) return;
  if (ev.tipo === 'ferramenta' && ev.estado === 'rodando' && !ev.sub) { l.ultimo = { nome: ev.nome, entrada: ev.entrada }; l.passos = (l.passos || 0) + 1; gravar(); }
  else if (ev.tipo === 'fim' && ev.custo != null) { l.custo = ev.custo; gravar(); }
}

function iniciar(d) { deps = d; ler(); }
// ao fechar o programa: grava já o que estava esperando os 300 ms
function gravarJa() { if (estado) { clearTimeout(timer); U.gravar(ARQ(), estado); } }
module.exports = { iniciar, gravarJa, listar: () => (ler(), publico()), novo, salvar, apagar, gerar, parar, simultaneos, aoEvento };
