/* bo — o Claude chama isto no terminal; quem executa é o Blue Ocean Studio aberto
   (assim tudo aparece na tela, com progresso). Veja "bo ajuda". */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const APP = path.dirname(fileURLToPath(import.meta.url));
let porta = process.env.BO_PORTA, token = process.env.BO_TOKEN;
try { const c = JSON.parse(fs.readFileSync(path.join(APP, process.env.BO_CONTROLE || '.controle.json'), 'utf8')); if (!porta || !token) ({ porta, token } = c); else if (String(c.porta) !== String(porta)) ({ porta, token } = c); } catch {}
if (!porta) { console.error('O Blue Ocean Studio não está aberto. Abra o programa e tente de novo.'); process.exit(2); }

// projeto: variável do app, ou a pasta projetos/<nome> em que o comando rodou
let projeto = process.env.BO_PROJETO || null;
const rel = path.relative(path.join(APP, 'projetos'), process.cwd());
if (!rel.startsWith('..') && !path.isAbsolute(rel) && rel) projeto = rel.split(path.sep)[0];

const [cmd, ...args] = process.argv.slice(2);
const req = http.request({ host: '127.0.0.1', port: porta, path: '/bo', method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
  let resto = '', codigo = 0;
  res.setEncoding('utf8');
  res.on('data', d => {
    const ls = (resto + d).split('\n'); resto = ls.pop();
    for (const l of ls) { const m = l.match(/^@@SAIDA (\d+)/); if (m) codigo = +m[1]; else process.stdout.write(l + '\n'); }
  });
  res.on('end', () => { if (resto) { const m = resto.match(/^@@SAIDA (\d+)/); if (m) codigo = +m[1]; else process.stdout.write(resto + '\n'); } process.exit(codigo); });
});
req.on('error', e => { console.error('Não consegui falar com o Blue Ocean Studio (' + e.message + '). Ele está aberto?'); process.exit(2); });
req.end(JSON.stringify({ token, projeto, cmd, args, cwd: process.cwd() }));
