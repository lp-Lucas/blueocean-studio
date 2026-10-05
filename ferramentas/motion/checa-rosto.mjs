// Confere se alguma inserção (camada #camada) encosta na pessoa: a cada 0,1 s mede a caixa de cada peça visível
// e conta os pixels da máscara da pessoa (mascaras-limpas, com o mesmo zoom do vídeo) dentro dela.
// uso: node checa-rosto.mjs comp6
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { abrirChrome, dormir } from './chrome.mjs';
const reel = process.argv[2];
const c = await abrirChrome();
try {
  await c.cdp('Emulation.setDeviceMetricsOverride', { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false });
  await c.cdp('Page.enable');
  await c.cdp('Page.addScriptToEvaluateOnNewDocument', { source: `window.PARAMS = {"reel":"${reel}"}; window.RENDER = true;` });
  await c.cdp('Page.navigate', { url: pathToFileURL(path.resolve('fullmotion/reels-podcast.html')).href });
  await dormir(1500);
  await c.avaliar('(async () => { await document.fonts.ready; if (window.pronto) await window.pronto; })()');
  const r = await c.avaliar(`(async () => {
    const cv = document.createElement('canvas'); cv.width = 270; cv.height = 480; const g = cv.getContext('2d', { willReadFrequently: true });
    const out = []; const vid = document.getElementById('vid');
    for (let t = 0; t < window.DURACAO; t += 0.1) {
      await window.quadro(t);
      if (getComputedStyle(document.getElementById('vidBox')).opacity < 0.5 || document.getElementById('claro').style.opacity == 1) continue;
      const n = vid._n, mk = new Image(); mk.src = MASCARAS + String(n).padStart(4, '0') + '.png';
      try { await mk.decode(); } catch { continue; }
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 270, 480);
      const m = new DOMMatrix(getComputedStyle(vid).transform);
      g.setTransform(m.a / 4, m.b, m.c, m.d / 4, (540 - 540 * m.a + m.e) / 4, (960 - 960 * m.d + m.f) / 4);
      g.drawImage(mk, 0, 0, 1080, 1920);
      const px = g.getImageData(0, 0, 270, 480).data;
      for (const el of document.querySelectorAll('#camada .p')) {
        if (!(parseFloat(el.style.opacity) > 0.3)) continue;
        const b = el.getBoundingClientRect(); let k = 0;
        for (let y = Math.max(0, b.top / 4 | 0); y < Math.min(480, b.bottom / 4); y++) for (let x = Math.max(0, b.left / 4 | 0); x < Math.min(270, b.right / 4); x++) if (px[(y * 270 + x) * 4] > 128) k++;
        if (k > 6) out.push(t.toFixed(1) + ' ' + (el.id || el.className) + ' ' + k + 'px');
      }
    }
    return out; })()`);
  console.log(reel, r.length ? r.join('\n') : 'nenhuma inserção encosta na pessoa');
} finally { await c.fechar(); }
