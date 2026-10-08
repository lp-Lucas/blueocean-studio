// Print da página inteira de um site (para tirar componentes/cores). uso: node print_site.mjs <url> <saida.png> [--largura 1440] [--espera 7000]
import fs from 'node:fs';
import { abrirChrome, dormir } from './chrome.mjs';
const a = process.argv.slice(2); const [url, saida] = a;
const opt = (n, d) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : d; };
const W = +opt('--largura', 1440), ESPERA = +opt('--espera', 7000);
const c = await abrirChrome();
try {
  await c.cdp('Emulation.setDeviceMetricsOverride', { width: W, height: 900, deviceScaleFactor: 1, mobile: false });
  await c.cdp('Page.enable'); await c.cdp('Page.navigate', { url }); await dormir(ESPERA);
  // rola até o fim para disparar animações de entrada
  const H = await c.avaliar(`(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,250))}scrollTo(0,0);await new Promise(r=>setTimeout(r,800));return document.documentElement.scrollHeight})()`);
  await c.cdp('Emulation.setDeviceMetricsOverride', { width: W, height: Math.min(H, 12000), deviceScaleFactor: 1, mobile: false });
  await dormir(1500);
  const r = await c.cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.writeFileSync(saida, Buffer.from(r.data, 'base64')); console.log('ok', W, H);
} finally { c.fechar(); }
