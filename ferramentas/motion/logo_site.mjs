// Tira o logo do cabeçalho de um site em alta resolução (print do elemento com fundo transparente).
// uso: node logo_site.mjs <url> <saida.png> [--seletor "css"] [--escala 5] [--espera 6000]
//   sem --seletor: pega o img/svg do topo da página que tem "logo" no src/alt/classe (ou o primeiro à esquerda)
import fs from 'node:fs';
import { abrirChrome, dormir } from './chrome.mjs';

const args = process.argv.slice(2);
const [url, saida] = args;
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const SEL = opt('--seletor', ''), ESC = +opt('--escala', 5), ESPERA = +opt('--espera', 6000);

const c = await abrirChrome();
try {
  await c.cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: ESC, mobile: false });
  await c.cdp('Page.enable');
  await c.cdp('Page.navigate', { url });
  await dormir(ESPERA);
  const r = await c.avaliar(`(() => {
    let el = ${JSON.stringify(SEL)} ? document.querySelector(${JSON.stringify(SEL)}) : null;
    if (!el) {
      const cand = [...document.querySelectorAll('img, svg')].filter(e => {
        const b = e.getBoundingClientRect(); return b.top < 160 && b.width > 40 && b.height > 12 && b.left < 900;
      });
      const temLogo = e => /logo/i.test((e.getAttribute('src') || '') + (e.getAttribute('alt') || '') + (e.getAttribute('class') || '') + (e.parentElement?.className?.baseVal ?? e.parentElement?.className ?? ''));
      el = cand.find(temLogo) || cand.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left)[0];
    }
    if (!el) return null;
    // só o logo: esconde todo o resto e deixa o fundo transparente
    el.setAttribute('data-logo', '1');
    const st = document.createElement('style');
    st.textContent = 'html,body{background:transparent!important} body *{visibility:hidden!important;background:transparent!important;box-shadow:none!important} [data-logo],[data-logo] *{visibility:visible!important}';
    document.head.appendChild(st);
    const b = el.getBoundingClientRect();
    return { x: b.left + scrollX, y: b.top + scrollY, w: b.width, h: b.height, tag: el.tagName, src: el.getAttribute('src') };
  })()`);
  if (!r) throw new Error('logo não encontrado');
  await c.cdp('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  await dormir(400);
  const { data } = await c.cdp('Page.captureScreenshot', { format: 'png', clip: { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 } });
  fs.writeFileSync(saida, Buffer.from(data, 'base64'));
  console.log('logo:', saida, JSON.stringify(r));
} catch (e) { console.error('ERRO:', e.message); process.exitCode = 1; }
finally { await c.fechar(); }
