// Prints de um site tela por tela (rolando), para sites com animação de entrada.
// uso: node print_rolando.mjs <url> <pasta> [--largura 1440] [--alto 900] [--escala 1] [--passo 800]
import fs from 'node:fs'; import path from 'node:path';
import { abrirChrome, dormir } from './chrome.mjs';
const a = process.argv.slice(2); const [url, pasta] = a;
const opt = (n, d) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : d; };
const W = +opt('--largura', 1440), H = +opt('--alto', 900), ESC = +opt('--escala', 1), PASSO = +opt('--passo', 800);
fs.mkdirSync(pasta, { recursive: true });
const c = await abrirChrome();
try {
  await c.cdp('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: ESC, mobile: W < 600 });
  await c.cdp('Page.enable'); await c.cdp('Page.navigate', { url }); await dormir(6000);
  const total = await c.avaliar('document.documentElement.scrollHeight');
  let i = 0;
  for (let y = 0; y < total; y += PASSO) {
    await c.avaliar(`scrollTo(0, ${y})`); await dormir(1300);
    const r = await c.cdp('Page.captureScreenshot', { format: 'png' });
    fs.writeFileSync(path.join(pasta, `${String(i++).padStart(2, '0')}.png`), Buffer.from(r.data, 'base64'));
  }
  console.log('prints:', i, 'altura', total);
} finally { await c.fechar(); }
