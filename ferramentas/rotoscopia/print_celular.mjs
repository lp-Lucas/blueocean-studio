// Print de página como se fosse tirado num celular (emulação real de iPhone pelo Chrome DevTools Protocol).
// Fecha avisos de login/cookie e banners fixos antes do print (Instagram, sites de notícia).
//
// uso: node print_celular.mjs <url> <saida.png> [--alto 3000] [--espera 6000] [--manter-fixos]
//   largura 1080 px (390 pt × 2,77); --alto = altura total do print em px; --espera = ms para a página carregar
//   --largura 300  celular mais estreito: logo/foto de perfil e textos maiores (usado nos perfis de Instagram)
//   --instagram  tira a barra "Instagram · Entrar · Abrir aplicativo" e o rodapé "Cadastre-se" (aprovado: deixam o
//                anúncio com cara de "low ticket"; o perfil tem que parecer limpo)
//   --remover "texto1|texto2"  apaga a barra/faixa inteira que contém esse texto
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const [url, saida] = args;
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? Number(args[i + 1]) : d; };
const RMV = (() => { const i = args.indexOf('--remover'); return i >= 0 ? args[i + 1].split('|') : []; })();
if (args.includes('--instagram')) RMV.push('Abrir aplicativo', 'Abrir o app', 'Open app', 'Cadastre-se', 'Desfrute da experiência', 'Entrar');
const LARG = opt('--largura', 390);   // pt do celular simulado; menor = tudo maior (perfil de Instagram: 300)
const ALTO = opt('--alto', 3000), ESPERA = opt('--espera', 6000), MANTER = args.includes('--manter-fixos');
const CH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PORTA = 9300 + Math.floor(Math.random() * 500);
const dados = fs.mkdtempSync(path.join(os.tmpdir(), 'printcel-'));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';

const chrome = spawn(CH, ['--headless=new', '--disable-gpu', '--hide-scrollbars', `--remote-debugging-port=${PORTA}`,
  `--user-data-dir=${dados}`, 'about:blank'], { stdio: 'ignore' });
const dormir = ms => new Promise(r => setTimeout(r, ms));

let ws, seq = 0; const pend = new Map();
const cdp = (method, params = {}) => new Promise((res, rej) => {
  const id = ++seq; pend.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params }));
});

try {
  let alvo;
  for (let i = 0; i < 50 && !alvo; i++) {
    await dormir(200);
    try { alvo = (await (await fetch(`http://127.0.0.1:${PORTA}/json`)).json()).find(t => t.type === 'page'); } catch {}
  }
  if (!alvo) throw new Error('Chrome não abriu');
  ws = new WebSocket(alvo.webSocketDebuggerUrl);
  await new Promise(r => ws.addEventListener('open', r));
  ws.addEventListener('message', ev => { const m = JSON.parse(ev.data); if (m.id && pend.has(m.id)) { const p = pend.get(m.id); pend.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } });

  const DSF = 1080 / LARG;
  await cdp('Network.setUserAgentOverride', { userAgent: UA, platform: 'iPhone' });
  await cdp('Emulation.setDeviceMetricsOverride', { width: LARG, height: Math.round(ALTO / DSF), deviceScaleFactor: DSF, mobile: true });
  await cdp('Emulation.setTouchEmulationEnabled', { enabled: true });
  await cdp('Page.enable');
  await cdp('Page.navigate', { url });
  await dormir(ESPERA);
  if (!MANTER) {
    await cdp('Runtime.evaluate', { expression: `(() => {
      // avisos de login/cookie: diálogos e camadas fixas por cima da página
      document.querySelectorAll('[role=dialog],[aria-modal=true]').forEach(e => (e.closest('[role=presentation]') || e).remove());
      for (const e of document.querySelectorAll('body *')) {
        const s = getComputedStyle(e);
        if ((s.position === 'fixed' || s.position === 'sticky') && e.getBoundingClientRect().top > 60) e.remove();
        else if (s.position === 'fixed' && e.offsetHeight > innerHeight * 0.5) e.remove();
      }
      // barras com textos pedidos: sobe do texto até o maior bloco ainda "baixo" (barra), e apaga
      for (const txt of ${JSON.stringify(RMV)}) {
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const achados = [];
        while (w.nextNode()) if (w.currentNode.nodeValue.trim() === txt || w.currentNode.nodeValue.includes(txt) && txt.length > 8) achados.push(w.currentNode.parentElement);
        for (let e of achados) {
          let alvo = e;
          while (alvo.parentElement && alvo.parentElement !== document.body && alvo.parentElement.offsetHeight < 260) alvo = alvo.parentElement;
          alvo.remove();
        }
      }
      document.documentElement.style.overflow = 'auto'; document.body.style.overflow = 'auto';
    })()` });
    await dormir(800);
  }
  const { data } = await cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  fs.writeFileSync(saida, Buffer.from(data, 'base64'));
  console.log('print:', path.resolve(saida));
} catch (e) {
  console.error('ERRO:', e.message); process.exitCode = 1;
} finally {
  try { ws?.close(); } catch {}
  chrome.kill();
  await dormir(500);
  try { fs.rmSync(dados, { recursive: true, force: true }); } catch {}
}
