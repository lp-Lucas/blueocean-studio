/* Conversa com o Claude Code local (CLI), sem API.
   Cada mensagem roda "claude -p" dentro da pasta do projeto, continuando a mesma sessão (--resume).
   O fluxo stream-json vira eventos simples para o chat mostrar tudo o que acontece:
     texto      o que o Claude escreve (chega aos pedaços)
     pensando   o raciocínio, quando o modelo mostra
     ferramenta cada ferramenta que ele chama (comando, arquivo lido, edição...)
     resultado  a saída dessa ferramenta
     fim        custo e tempo da resposta */
const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const U = require('./util');

/* O CLI nem sempre está no PATH: vindo pela extensão do VS Code, o executável mora numa pasta
   com a versão no nome, que muda a cada atualização. Então: config → PATH → extensão mais nova. */
function acharClaude() {
  const c = U.cfg().claude;
  if (c && fs.existsSync(c)) return c;
  const w = spawnSync('where', ['claude'], { encoding: 'utf8', windowsHide: true });
  if (w.status === 0 && w.stdout.trim()) return w.stdout.trim().split(/\r?\n/)[0];
  const local = path.join(process.env.USERPROFILE || '', '.local', 'bin', 'claude.exe');
  if (fs.existsSync(local)) return local;
  const versao = n => (n.match(/(\d+)\.(\d+)\.(\d+)/) || []).slice(1).map(Number);
  for (const base of ['.vscode', '.cursor', '.vscode-insiders']) {
    const ext = path.join(process.env.USERPROFILE || '', base, 'extensions');
    if (!fs.existsSync(ext)) continue;
    const cand = fs.readdirSync(ext).filter(n => n.startsWith('anthropic.claude-code-'))
      .map(n => ({ v: versao(n), exe: path.join(ext, n, 'resources', 'native-binary', 'claude.exe') }))
      .filter(x => fs.existsSync(x.exe))
      .sort((a, b) => b.v[0] - a.v[0] || b.v[1] - a.v[1] || b.v[2] - a.v[2]);
    if (cand.length) return cand[0].exe;
  }
  throw new Error('Não achei o Claude Code. Instale o Claude Code ou coloque o caminho do claude.exe em Configurações.');
}

const textoDe = c => typeof c === 'string' ? c
  : Array.isArray(c) ? c.map(x => x.type === 'text' ? x.text : x.type === 'image' ? '[imagem]' : '').join('\n') : '';

function conversar({ cwd, prompt, sessao, sistema, env, aoEvento, controle }) {
  return new Promise((ok, falha) => {
    let exe;
    try { exe = acharClaude(); } catch (e) { return falha(e); }
    const cfg = U.cfg();
    const args = ['-p', '--output-format', 'stream-json', '--verbose', '--include-partial-messages',
      '--permission-mode', 'acceptEdits',
      '--add-dir', U.RAIZ];
    if (U.DADOS !== U.RAIZ) args.push('--add-dir', U.DADOS);
    if (cfg.acervo && fs.existsSync(cfg.acervo)) args.push('--add-dir', cfg.acervo);
    if (sistema) args.push('--append-system-prompt-file', sistema);
    if (sessao) args.push('--resume', sessao);
    if (cfg.modelo) args.push('--model', cfg.modelo);
    // por último (a opção engole os nomes seguintes): o que ele pode usar sem pedir licença
    args.push('--allowedTools', 'Bash', 'PowerShell', 'Read', 'Write', 'Edit', 'MultiEdit', 'Glob', 'Grep', 'WebFetch', 'WebSearch', 'TodoWrite');

    const envFinal = { ...process.env, ...env };
    delete envFinal.ELECTRON_RUN_AS_NODE;
    const p = spawn(exe, args, { cwd, windowsHide: true, env: envFinal });
    controle.processo = p;
    let resto = '', errTxt = '', sessaoNova = sessao, final = null;
    const blocos = new Map();          // índice do bloco → estado
    const comStream = new Set();       // mensagens que já chegaram aos pedaços (não repetir o texto inteiro)
    let msgId = 'm';

    const linha = l => {
      let ev; try { ev = JSON.parse(l); } catch { return; }
      if (ev.session_id) sessaoNova = ev.session_id;
      if (ev.type === 'system' && ev.subtype === 'init') {
        aoEvento({ tipo: 'inicio', sessao: ev.session_id, modelo: ev.model });
      } else if (ev.type === 'stream_event') {
        const e = ev.event || {};
        if (e.type === 'message_start') { msgId = e.message?.id || ('m' + Date.now()); comStream.add(msgId); blocos.clear(); }
        else if (e.type === 'content_block_start') {
          const b = e.content_block || {};
          const chave = msgId + ':' + e.index;
          if (b.type === 'text') blocos.set(e.index, { tipo: 'texto', chave, texto: '' });
          else if (b.type === 'thinking') { blocos.set(e.index, { tipo: 'pensando', chave, texto: '' }); aoEvento({ tipo: 'pensando', chave, texto: '' }); }
          else if (b.type === 'tool_use') { blocos.set(e.index, { tipo: 'ferramenta', chave: b.id, json: '' }); aoEvento({ tipo: 'ferramenta', chave: b.id, nome: b.name, entrada: null, estado: 'escrevendo' }); }
        } else if (e.type === 'content_block_delta') {
          const bl = blocos.get(e.index), d = e.delta || {};
          if (!bl) return;
          if (d.type === 'text_delta') { bl.texto += d.text; aoEvento({ tipo: 'texto', chave: bl.chave, texto: bl.texto }); }
          else if (d.type === 'thinking_delta') { bl.texto += d.thinking; aoEvento({ tipo: 'pensando', chave: bl.chave, texto: bl.texto }); }
          else if (d.type === 'input_json_delta') bl.json += d.partial_json || '';
        } else if (e.type === 'content_block_stop') {
          const bl = blocos.get(e.index);
          if (bl?.tipo === 'pensando') aoEvento({ tipo: 'pensando', chave: bl.chave, texto: bl.texto, fim: true });
        }
      } else if (ev.type === 'assistant') {
        const id = ev.message?.id;
        for (const [i, c] of (ev.message?.content || []).entries()) {
          if (c.type === 'tool_use') aoEvento({ tipo: 'ferramenta', chave: c.id, nome: c.name, entrada: c.input, estado: 'rodando', sub: !!ev.parent_tool_use_id });
          else if (c.type === 'text' && !comStream.has(id)) aoEvento({ tipo: 'texto', chave: id + ':t' + i, texto: c.text });
        }
      } else if (ev.type === 'user') {
        const cont = ev.message?.content;
        if (Array.isArray(cont)) for (const c of cont) if (c.type === 'tool_result')
          aoEvento({ tipo: 'resultado', chave: c.tool_use_id, saida: textoDe(c.content).slice(0, 20000), erro: !!c.is_error });
      } else if (ev.type === 'result') {
        final = ev;
        aoEvento({ tipo: 'fim', custo: ev.total_cost_usd, duracao: ev.duration_ms, turnos: ev.num_turns, erro: ev.is_error ? String(ev.result || 'erro') : null });
      }
    };
    p.stdout.on('data', d => { const ls = (resto + d.toString()).split(/\r?\n/); resto = ls.pop(); ls.filter(Boolean).forEach(linha); });
    p.stderr.on('data', d => { errTxt += d.toString(); if (errTxt.length > 20000) errTxt = errTxt.slice(-10000); });
    p.on('error', falha);
    p.on('close', code => {
      if (resto) linha(resto);
      if (controle.cancelado) return ok({ sessao: sessaoNova, cancelado: true });
      if (!final && code !== 0) return falha(new Error(errTxt.trim().slice(-800) || `o Claude saiu com código ${code}`));
      ok({ sessao: sessaoNova, final });
    });
    p.stdin.write(prompt);
    p.stdin.end();
  });
}

module.exports = { acharClaude, conversar };
