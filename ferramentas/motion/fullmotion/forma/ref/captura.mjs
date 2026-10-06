import fs from 'node:fs';
import { abrirChrome, dormir } from '../../../chrome.mjs';
const c = await abrirChrome(['--lang=pt-BR']);
await c.cdp('Page.enable'); await c.cdp('Network.enable');
await c.cdp('Network.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36' });
for (const [w,h,nome,mob] of [[1440,900,'desk',false],[430,932,'mob',true]]) {
  await c.cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: mob?2:1, mobile: mob });
  await c.cdp('Page.navigate', { url: 'https://www.formadeestudos.com.br/' }); await dormir(8000);
  const H = await c.avaliar('document.documentElement.scrollHeight');
  for (let y = 0, i = 0; y < Math.min(H, 14000) && i < 14; y += h, i++) {
    await c.avaliar(`window.scrollTo(0,${y})`); await dormir(900);
    const { data } = await c.cdp('Page.captureScreenshot', { format: 'jpeg', quality: 70 });
    fs.writeFileSync(`ref/${nome}-${String(i).padStart(2,'0')}.jpg`, Buffer.from(data, 'base64'));
  }
  if (!mob) {
    const info = await c.avaliar(`(() => {
      const cores = {}, fontes = {};
      for (const e of document.querySelectorAll('body *')) { const s = getComputedStyle(e); const r = e.getBoundingClientRect(); if (!r.width) continue;
        const a = r.width*r.height; cores['bg '+s.backgroundColor] = (cores['bg '+s.backgroundColor]||0)+a;
        if (e.childNodes.length && [...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())) { cores['tx '+s.color]=(cores['tx '+s.color]||0)+1; fontes[s.fontFamily+' '+s.fontWeight]=(fontes[s.fontFamily+' '+s.fontWeight]||0)+1; }
        if (s.backgroundImage && s.backgroundImage.includes('gradient')) cores['gr '+s.backgroundImage.slice(0,140)]=1; }
      const top = o => Object.entries(o).sort((a,b)=>b[1]-a[1]).slice(0,30);
      const imgs = [...document.querySelectorAll('img')].map(i=>[i.src, i.alt, Math.round(i.getBoundingClientRect().width)]).slice(0,60);
      const txt = document.body.innerText.slice(0, 6000);
      const btn = [...document.querySelectorAll('a,button')].filter(b=>b.textContent.trim()).slice(0,40).map(b=>{const s=getComputedStyle(b);return [b.textContent.trim().slice(0,40), s.backgroundColor, s.color, s.borderRadius, s.fontFamily.slice(0,30), s.fontWeight]});
      return JSON.stringify({ cores: top(cores), fontes: top(fontes), imgs, btn, txt, title: document.title }, null, 1); })()`);
    fs.writeFileSync('ref/info.json', info);
  }
}
await c.fechar(); console.log('ok');
