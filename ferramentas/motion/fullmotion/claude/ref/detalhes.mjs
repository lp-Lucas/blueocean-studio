// cores resolvidas (tema escuro e claro), logo SVG, textos pt-BR e fontes do claude.ai
import fs from 'node:fs';
import { abrirChrome, dormir } from '../../../chrome.mjs';
const c = await abrirChrome(['--lang=pt-BR', '--accept-lang=pt-BR']);
await c.cdp('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
await c.cdp('Network.enable');
await c.cdp('Network.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', acceptLanguage: 'pt-BR' });
await c.cdp('Page.enable');
await c.cdp('Page.navigate', { url: 'https://claude.ai/new' }); await dormir(9000);
const r = await c.avaliar(`(() => {
  const nomes = ['bg-000','bg-100','bg-200','bg-300','bg-400','bg-500','text-000','text-100','text-200','text-300','text-400','text-500','border-100','border-200','border-300','border-400','accent-000','accent-100','accent-brand','brand-000','brand-100','oncolor-100','danger-100','success-100'];
  const ler = () => { const cs = getComputedStyle(document.documentElement); const o = {};
    nomes.forEach(n => { const v = cs.getPropertyValue('--' + n).trim(); const d = document.createElement('div'); d.style.color = v.match(/^[\\d.]+ [\\d.]+% [\\d.]+%/) ? 'hsl(' + v + ')' : v; document.body.appendChild(d); o[n] = v + ' => ' + getComputedStyle(d).color; d.remove(); }); return o; };
  const h = document.documentElement; const attrs = [...h.attributes].map(a => a.name + '=' + a.value);
  const escuro = ler();
  const modo = h.getAttribute('data-mode'); h.setAttribute('data-mode', modo === 'dark' ? 'light' : 'dark'); h.classList.toggle('dark');
  const outro = ler();
  const logo = [...document.querySelectorAll('svg')].map(s => s.outerHTML).filter(s => s.length < 6000);
  const strings = document.body.textContent.match(/"pt-BR":\\{[^}]*\\}/g);
  return JSON.stringify({ attrs, escuro, outro, logo, strings }, null, 1); })()`);
fs.writeFileSync('detalhes.json', r);
await c.fechar();
