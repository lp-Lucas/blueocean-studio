// Busca vídeos no Pexels pelo Chrome (o site bloqueia curl). uso: node busca_pexels.mjs "termo de busca" [--n 30]
// imprime: id  título  link de download (arquivo HD que a página usa)
import { abrirChrome, dormir } from './chrome.mjs';
const a = process.argv.slice(2); const termo = a[0];
const N = +(a[a.indexOf('--n') + 1] || 30);
const c = await abrirChrome();
try {
  await c.cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 2400, deviceScaleFactor: 1, mobile: false });
  await c.cdp('Page.enable');
  await c.cdp('Page.navigate', { url: 'https://www.pexels.com/search/videos/' + encodeURIComponent(termo) + '/?orientation=landscape' });
  for (let k = 0; k < 8 && (await c.avaliar("document.title")).includes("momento"); k++) await dormir(4000); await dormir(4000);
  await c.avaliar(`(async()=>{for(let y=0;y<6000;y+=800){scrollTo(0,y);await new Promise(r=>setTimeout(r,500))}})()`);
  const r = await c.avaliar(`(() => {
    const re = new RegExp('/video/([a-z0-9-]+)-([0-9]+)/?$');
    const out = [];
    for (const a of document.querySelectorAll('a[href*="/video/"]')) {
      const m = a.href.match(re); if (!m) continue;
      const art = a.closest('article'); const v = art ? art.querySelector('video source, video') : null;
      out.push({ id: m[2], t: m[1], v: v ? (v.src || v.getAttribute('src') || '') : '' });
    }
    return JSON.stringify(out);
  })()`);
  const vistos = new Set();
  for (const o of JSON.parse(r)) { if (vistos.has(o.id)) continue; vistos.add(o.id); console.log(o.id, o.t, o.v || ''); if (vistos.size >= N) break; }
  if (!vistos.size) console.log('nada — título da página:', await c.avaliar('document.title'));
} finally { await c.fechar(); }
