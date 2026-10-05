// Chrome headless pelo DevTools Protocol — base das ferramentas de motion.
// abrirChrome() → { cdp(method, params), fechar() }
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
export const dormir = ms => new Promise(r => setTimeout(r, ms));

export async function abrirChrome(extra = []) {
  const porta = 9300 + Math.floor(Math.random() * 500);
  const dados = fs.mkdtempSync(path.join(os.tmpdir(), 'motion-'));
  const chrome = spawn(CH, ['--headless=new', '--hide-scrollbars', '--enable-unsafe-swiftshader', '--use-angle=swiftshader',
    '--allow-file-access-from-files', '--font-render-hinting=none', `--remote-debugging-port=${porta}`,
    `--user-data-dir=${dados}`, ...extra, 'about:blank'], { stdio: 'ignore' });
  let alvo;
  for (let i = 0; i < 60 && !alvo; i++) {
    await dormir(200);
    try { alvo = (await (await fetch(`http://127.0.0.1:${porta}/json`)).json()).find(t => t.type === 'page'); } catch {}
  }
  if (!alvo) { chrome.kill(); throw new Error('Chrome não abriu'); }
  const ws = new WebSocket(alvo.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));
  let seq = 0; const pend = new Map();
  ws.addEventListener('message', ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
  });
  const cdp = (method, params = {}) => new Promise((res, rej) => {
    const id = ++seq; pend.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params }));
  });
  const avaliar = async expr => {
    const r = await cdp('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const fechar = async () => {
    try { ws.close(); } catch {}
    chrome.kill(); await dormir(500);
    try { fs.rmSync(dados, { recursive: true, force: true }); } catch {}
  };
  return { cdp, avaliar, fechar };
}
