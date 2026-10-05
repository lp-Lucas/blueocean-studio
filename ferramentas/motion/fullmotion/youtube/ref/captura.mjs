// prints de referência do youtube.com (home, busca, vídeo) + logo e medidas dos componentes
import fs from 'node:fs';
import { abrirChrome, dormir } from '../../../chrome.mjs';
const c = await abrirChrome(['--lang=pt-BR', '--accept-lang=pt-BR']);
await c.cdp('Emulation.setDeviceMetricsOverride', { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
await c.cdp('Network.enable');
await c.cdp('Network.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36', acceptLanguage: 'pt-BR' });
await c.cdp('Page.enable');
const ir = async (url, nome, espera = 6000) => {
  await c.cdp('Page.navigate', { url }); await dormir(espera);
  // fecha o aviso de cookies se aparecer
  await c.avaliar(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>/Aceitar|Accept|Rejeitar|Reject/i.test(b.textContent)); b&&b.click();})()`).catch(()=>{});
  await dormir(1500);
  const { data } = await c.cdp('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(`ref/${nome}.png`, Buffer.from(data, 'base64')); console.log('ok', nome);
};
await ir('https://www.youtube.com/?hl=pt-BR&gl=BR', 'home');
const info = await c.avaliar(`(() => {
  const st = (sel, props) => { const e = document.querySelector(sel); if (!e) return null; const s = getComputedStyle(e), r = e.getBoundingClientRect();
    const o = { x: r.x, y: r.y, w: r.width, h: r.height }; props.forEach(p => o[p] = s[p]); return o; };
  const P = ['fontFamily','fontSize','fontWeight','color','backgroundColor','borderRadius','border','lineHeight'];
  return JSON.stringify({
    logo: (document.querySelector('ytd-topbar-logo-renderer svg, #logo-icon svg, yt-icon#logo-icon svg') || {}).outerHTML,
    busca: st('form.ytSearchboxComponentSearchForm, ytd-searchbox #container, .ytSearchboxComponentInputBox', P),
    botaoBusca: st('.ytSearchboxComponentSearchButton, #search-icon-legacy', P),
    chip: st('yt-chip-cloud-chip-renderer, ytd-feed-filter-chip-bar-renderer #chips > *', P),
    titulo: st('#video-title', P), thumb: st('ytd-thumbnail, yt-thumbnail-view-model', P),
    meta: st('#metadata-line span, .yt-content-metadata-view-model__metadata-text', P),
    body: st('body', P), masthead: st('#masthead-container, ytd-masthead', P), guia: st('ytd-mini-guide-renderer, #guide', P),
  }); })()`);
fs.writeFileSync('ref/home.json', info);
await ir('https://www.youtube.com/results?search_query=como+trocar+pneu+sozinho&hl=pt-BR&gl=BR', 'busca');
const info2 = await c.avaliar(`(() => { const st = (sel) => { const e = document.querySelector(sel); if (!e) return null; const s = getComputedStyle(e), r = e.getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, f: s.fontFamily, fs: s.fontSize, fw: s.fontWeight, c: s.color, br: s.borderRadius, bg: s.backgroundColor }; };
  const vids = [...document.querySelectorAll('ytd-video-renderer')].slice(0, 6).map(v => ({ titulo: v.querySelector('#video-title')?.textContent.trim(), canal: v.querySelector('#channel-name #text, ytd-channel-name a')?.textContent.trim(),
     meta: v.querySelector('#metadata-line')?.textContent.trim().replace(/\s+/g,' '), dur: v.querySelector('badge-shape, .badge-shape-wiz__text, ytd-thumbnail-overlay-time-status-renderer')?.textContent.trim(),
     href: v.querySelector('a#thumbnail')?.href, thumb: v.querySelector('img')?.src }));
  return JSON.stringify({ vids, card: st('ytd-video-renderer'), thumb: st('ytd-video-renderer ytd-thumbnail'), titulo: st('ytd-video-renderer #video-title'), meta: st('ytd-video-renderer #metadata-line span'), desc: st('ytd-video-renderer .metadata-snippet-text') }); })()`);
fs.writeFileSync('ref/busca.json', info2);
const v = JSON.parse(info2).vids.find(v => v.href && v.href.includes('watch'));
if (v) {
  await ir(v.href.split('&')[0] + '&hl=pt-BR', 'video', 9000);
  const info3 = await c.avaliar(`(() => { const st = (sel) => { const e = document.querySelector(sel); if (!e) return null; const s = getComputedStyle(e), r = e.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height, f: s.fontFamily, fs: s.fontSize, fw: s.fontWeight, c: s.color, br: s.borderRadius, bg: s.backgroundColor, txt: (e.textContent||'').trim().slice(0,60) }; };
    return JSON.stringify({ player: st('#movie_player'), titulo: st('#title h1'), inscrever: st('#subscribe-button button'), avatar: st('#owner #avatar img'), canal: st('#owner #channel-name'),
      like: st('segmented-like-dislike-button-view-model, #segmented-like-button'), share: st('#top-level-buttons-computed > *:nth-child(2)'), desc: st('#description'),
      progresso: st('.ytp-play-progress'), barra: st('.ytp-progress-bar'), relac: st('#related'), chipsRel: st('#related yt-chip-cloud-chip-renderer') }); })()`);
  fs.writeFileSync('ref/video.json', info3);
  await c.avaliar('window.scrollTo(0, 900)'); await dormir(3500);
  const { data } = await c.cdp('Page.captureScreenshot', { format: 'png' }); fs.writeFileSync('ref/comentarios.png', Buffer.from(data, 'base64'));
}
await c.fechar();
