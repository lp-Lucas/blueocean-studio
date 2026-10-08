// Recorta, em alta resolução e com fundo transparente, cada "celular" desenhado em HTML numa página (mockups de app).
// uso: node print_celulares.mjs <url> <pasta> [--escala 3]
import fs from 'node:fs'; import path from 'node:path';
import { abrirChrome, dormir } from './chrome.mjs';
const a = process.argv.slice(2); const [url, pasta] = a;
const opt = (n, d) => { const i = a.indexOf(n); return i >= 0 ? a[i + 1] : d; };
const ESC = +opt('--escala', 3);
fs.mkdirSync(pasta, { recursive: true });
const c = await abrirChrome();
try {
  await c.cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: ESC, mobile: false });
  await c.cdp('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  await c.cdp('Page.enable'); await c.cdp('Page.navigate', { url }); await dormir(6000);
  // rola a página toda para disparar as animações de entrada
  await c.avaliar(`(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=400){scrollTo(0,y);await new Promise(r=>setTimeout(r,300))}})()`);
  const lista = await c.avaliar(`(() => {
    const out = [];
    for (const el of document.querySelectorAll('div')) {
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el), rad = parseFloat(cs.borderTopLeftRadius) || 0;
      if (r.width > 200 && r.width < 460 && r.height / r.width > 1.75 && r.height / r.width < 2.4 && rad >= 24)
        out.push({ y: r.top + scrollY, x: r.left, w: r.width, h: r.height });
    }
    // fica só com o de fora (o maior) de cada grupo sobreposto
    return out.filter(o => !out.some(p => p !== o && p.w >= o.w && p.h >= o.h && p.x <= o.x && p.y <= o.y && p.x + p.w >= o.x + o.w && p.y + p.h >= o.y + o.h && (p.w > o.w || p.h > o.h)));
  })()`);
  let i = 0;
  for (const o of lista) {
    await c.avaliar(`scrollTo(0, ${Math.max(0, o.y - 100)})`); await dormir(1500);
    const sy = await c.avaliar('scrollY');
    const r = await c.cdp('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true,
      clip: { x: o.x, y: o.y, width: o.w, height: o.h, scale: 1 } });
    const f = path.join(pasta, `cel-${String(i++).padStart(2, '0')}.png`);
    fs.writeFileSync(f, Buffer.from(r.data, 'base64'));
    console.log(f, Math.round(o.x), Math.round(o.y), Math.round(o.w), Math.round(o.h));
  }
} finally { await c.fechar(); }
