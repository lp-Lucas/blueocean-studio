// prints de referência do open.spotify.com + logo e medidas dos componentes
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
const ir = async (url, nome, espera = 8000) => {
  await c.cdp('Page.navigate', { url }); await dormir(espera);
  await c.avaliar(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>/Aceitar|Accept|Fechar|Close/i.test(b.textContent)); b&&b.click();})()`).catch(()=>{});
  await dormir(1500); await print(nome);
};
const medir = `(() => {
  const st = (sel) => { const e = document.querySelector(sel); if (!e) return null; const s = getComputedStyle(e), r = e.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, f: s.fontFamily, fs: s.fontSize, fw: s.fontWeight, c: s.color, bg: s.backgroundColor, br: s.borderRadius, txt: (e.textContent||'').trim().slice(0,80) }; };
  const todos = (sel, n=12) => [...document.querySelectorAll(sel)].slice(0, n).map(e => { const r = e.getBoundingClientRect(); return { txt: (e.textContent||'').trim().slice(0,80), x: r.x, y: r.y, w: r.width, h: r.height, img: e.querySelector('img')?.src }; });
  return JSON.stringify({
    logo: (document.querySelector('a[aria-label="Spotify"] svg, header svg[role="img"], svg[aria-label="Spotify"]') || {}).outerHTML,
    body: st('body'), main: st('main'), nav: st('nav'), busca: st('input[data-testid="search-input"], form[role="search"] input'),
    titulo: st('h2'), card: st('[data-testid="card-click-handler"]')||st('[data-encore-id="card"]'), cardImg: st('[data-encore-id="card"] img'),
    cardTitulo: st('[data-encore-id="card"] [data-encore-id="text"]'), botaoVerde: st('button[data-encore-id="buttonPrimary"], [data-testid="play-button"]'),
    barra: st('[data-testid="now-playing-bar"], footer'), biblioteca: st('[data-testid="left-sidebar"], nav[aria-label]'),
    secoes: todos('section h2', 10), cards: todos('[data-encore-id="card"]', 16),
  }); })()`;
await ir('https://open.spotify.com/intl-pt', 'home');
fs.writeFileSync('ref/home.json', await c.avaliar(medir));
await c.avaliar('document.querySelector("main [data-overlayscrollbars-viewport], main .os-viewport, main")?.scrollBy?.(0, 900)'); await dormir(2500); await print('home2');
await ir('https://open.spotify.com/intl-pt/search', 'busca');
fs.writeFileSync('ref/busca.json', await c.avaliar(medir));
await ir('https://open.spotify.com/intl-pt/playlist/37i9dQZF1DXcBWIGoYBM5M', 'playlist');
fs.writeFileSync('ref/playlist.json', await c.avaliar(`(() => { const st = (sel) => { const e = document.querySelector(sel); if (!e) return null; const s = getComputedStyle(e), r = e.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height, f: s.fontFamily, fs: s.fontSize, fw: s.fontWeight, c: s.color, bg: s.backgroundColor, br: s.borderRadius, txt: (e.textContent||'').trim().slice(0,80) }; };
  const linhas = [...document.querySelectorAll('[data-testid="tracklist-row"]')].slice(0, 10).map(r => ({ txt: r.innerText.replace(/\\n+/g,' | '), img: r.querySelector('img')?.src }));
  return JSON.stringify({ capa: st('[data-testid="playlist-image"] img, .main-entityHeader-image, main img'), capaSrc: document.querySelector('main img')?.src, titulo: st('h1'), linhas, play: st('[data-testid="play-button"]'), linha: st('[data-testid="tracklist-row"]') }); })()`));
await c.fechar();
