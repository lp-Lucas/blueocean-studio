// prints de referência do claude.ai (+ claude.com) — logo, fontes, cores e medidas
import fs from 'node:fs';
import { abrirChrome, dormir } from '../../../chrome.mjs';
const c = await abrirChrome(['--lang=pt-BR', '--accept-lang=pt-BR']);
await c.cdp('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
await c.cdp('Network.enable');
await c.cdp('Network.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', acceptLanguage: 'pt-BR' });
await c.cdp('Page.enable');
const print = async nome => {
  const { data } = await c.cdp('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`ref/${nome}.png`, Buffer.from(data, 'base64')); console.log('ok', nome);
};
const medir = `(async () => {
  const st = (e) => { if (!e) return null; const s = getComputedStyle(e), r = e.getBoundingClientRect();
    return { tag: e.tagName, x: r.x, y: r.y, w: r.width, h: r.height, f: s.fontFamily, fs: s.fontSize, fw: s.fontWeight, c: s.color, bg: s.backgroundColor, br: s.borderRadius, bd: s.border, sh: s.boxShadow, txt: (e.textContent||'').trim().slice(0,80) }; };
  const q = s => document.querySelector(s);
  const fontes = []; for (const f of document.fonts) fontes.push(f.family + ' ' + f.weight + ' ' + f.style + ' ' + f.status);
  const faces = []; for (const s of document.styleSheets) { try { for (const r of s.cssRules) if (r.type === 5) faces.push(r.cssText.slice(0, 300)); } catch (e) { faces.push('X ' + s.href); } }
  const svgs = [...document.querySelectorAll('svg')].slice(0, 12).map(s => s.outerHTML.slice(0, 4000));
  const textos = [...document.querySelectorAll('h1,h2,h3,p,button,a,input,textarea,[contenteditable]')].slice(0, 60).map(st);
  const vars = {}; const cs = getComputedStyle(document.documentElement);
  for (const s of document.styleSheets) { try { for (const r of s.cssRules) if (r.selectorText === ':root' || r.selectorText?.includes('[data-theme')) for (const p of r.style) if (p.startsWith('--')) vars[r.selectorText.slice(0,30) + ' ' + p] = r.style.getPropertyValue(p).trim(); } catch (e) {} }
  return JSON.stringify({ url: location.href, body: st(document.body), fontes, faces, svgs, textos, vars }, null, 1); })()`;
const ir = async (url, nome, espera = 9000) => {
  await c.cdp('Page.navigate', { url }); await dormir(espera);
  await c.avaliar(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>/Aceitar|Accept all|Accept/i.test(b.textContent)); b&&b.click();})()`).catch(()=>{});
  await dormir(1500); await print(nome);
  fs.writeFileSync(`ref/${nome}.json`, await c.avaliar(medir));
};
await ir('https://claude.ai/new', 'claude-ai');
await ir('https://claude.ai/login', 'login');
await ir('https://claude.com/', 'claude-com');
await ir('https://claude.com/product/overview', 'produto');
await c.fechar();
