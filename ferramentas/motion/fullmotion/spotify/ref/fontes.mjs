import fs from 'node:fs';
import { abrirChrome, dormir } from '../../../chrome.mjs';
const c = await abrirChrome(['--lang=pt-BR']);
await c.cdp('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
await c.cdp('Network.enable');
await c.cdp('Network.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' });
await c.cdp('Page.enable');
await c.cdp('Page.navigate', { url: 'https://open.spotify.com/intl-pt' }); await dormir(9000);
const r = await c.avaliar(`(async()=>{ const out=[]; for (const f of document.fonts) { out.push({fam:f.family, w:f.weight, st:f.status}); }
  const urls=[]; for (const s of document.styleSheets){ try{ for(const r of s.cssRules){ if(r.type===5) urls.push(r.cssText.slice(0,400)); } }catch(e){ urls.push('X '+s.href); } }
  const imgs=[...document.querySelectorAll('[data-encore-id="card"] img')].map(i=>({src:i.src, alt:i.alt}));
  return JSON.stringify({out, urls, imgs}); })()`);
fs.writeFileSync('ref/fontes.json', r);
await c.fechar();
