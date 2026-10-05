// Renderiza uma página de motion (HTML com window.quadro(t)) em vídeo, quadro a quadro, sem perder quadro.
// uso: node render.mjs <pagina.html> <saida.mp4> [--dur 10] [--fps 30] [--w 1080] [--h 1920]
//                      [--quadro 3.2 --png saida.png]   (um quadro só, para conferir)
//                      [--params '{"chave":"valor"}']    (vai para window.PARAMS antes da página carregar)
//                      [--sobre video.mp4]   (inserções: página com fundo transparente desenhada por cima do vídeo;
//                                             o áudio do vídeo vai junto; nos quadros/folhas o vídeo aparece embaixo)
// A página define window.DURACAO (opcional) e window.quadro(t) (async ou não), que desenha o instante t.
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { abrirChrome, dormir } from './chrome.mjs';

const args = process.argv.slice(2);
const [pagina, saida] = args;
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const FPS = +opt('--fps', 30), W = +opt('--w', 1080), H = +opt('--h', 1920);
const UM = opt('--quadro', null), PNG = opt('--png', null), PARAMS = opt('--params', '{}');
const SOBRE = opt('--sobre', null);
const ALFA = args.includes('--alfa');   // fundo transparente → .webm VP9 com canal alfa
const ffmpeg = a => new Promise(r => spawn('ffmpeg', ['-v', 'error', '-y', ...a], { stdio: 'inherit' }).on('close', r));
// quadro do vídeo de baixo + png transparente da página → png composto (para conferir)
const compor = async (t, png, saidaPng) => {
  const tmp = saidaPng + '.top.png'; fs.writeFileSync(tmp, png);
  await ffmpeg(['-ss', String(t), '-i', SOBRE, '-i', tmp, '-filter_complex', `[0:v]scale=${W}:${H}[b];[b][1:v]overlay=0:0`, '-frames:v', '1', saidaPng]);
  fs.rmSync(tmp, { force: true });
};

const c = await abrirChrome();
try {
  await c.cdp('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  if (SOBRE || ALFA) await c.cdp('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } });
  await c.cdp('Page.enable');
  await c.cdp('Page.addScriptToEvaluateOnNewDocument', { source: `window.PARAMS = ${PARAMS}; window.RENDER = true;` });
  await c.cdp('Page.navigate', { url: pathToFileURL(path.resolve(pagina)).href });
  await dormir(1500);
  await c.avaliar(`(async () => { await document.fonts.ready; if (window.pronto) await window.pronto; })()`);
  const DUR = +opt('--dur', 0) || await c.avaliar('window.DURACAO || 10');
  const tirar = async t => {
    await c.avaliar(`(async () => { await window.quadro(${t}); await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))); })()`);
    const { data } = await c.cdp('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
    return Buffer.from(data, 'base64');
  };
  if (UM != null && UM.includes(',')) {
    // vários quadros → uma folha (saida = png), 4 por linha, em escala 1/3
    const ts = UM.split(',').map(Number), pasta = fs.mkdtempSync(path.join(path.dirname(path.resolve(saida)), 'q-'));
    for (const [i, t] of ts.entries()) {
      const f = path.join(pasta, `${String(i).padStart(3, '0')}.png`);
      if (SOBRE) await compor(t, await tirar(t), f); else fs.writeFileSync(f, await tirar(t));
    }
    const col = Math.min(4, ts.length), lin = Math.ceil(ts.length / col);
    await new Promise(r => spawn('ffmpeg', ['-v', 'error', '-y', '-i', path.join(pasta, '%03d.png'), '-vf',
      `scale=360:-1,tile=${col}x${lin}:padding=6`, '-frames:v', '1', saida], { stdio: 'inherit' }).on('close', r));
    fs.rmSync(pasta, { recursive: true, force: true });
    console.log('folha', ts.join(' '), '→', saida);
  } else if (UM != null) {
    if (SOBRE) await compor(+UM, await tirar(+UM), PNG || saida); else fs.writeFileSync(PNG || saida, await tirar(+UM));
    console.log('quadro', UM, '→', PNG || saida);
  } else {
    const n = Math.round(DUR * FPS);
    const pipe = ['-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-'];
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', ...(SOBRE
      ? ['-i', SOBRE, ...pipe, '-filter_complex', `[0:v]scale=${W}:${H},fps=${FPS}[b];[b][1:v]overlay=0:0:eof_action=pass[v]`, '-map', '[v]', '-map', '0:a?', '-c:a', 'copy', '-t', String(DUR)]
      : pipe),
      ...(ALFA   // peça transparente para pôr por cima do vídeo no editor (WebM VP9 com alfa)
        ? ['-c:v', 'libvpx-vp9', '-pix_fmt', 'yuva420p', '-b:v', '0', '-crf', '24', '-deadline', 'good', '-cpu-used', '4', '-row-mt', '1', '-auto-alt-ref', '0', saida]
        : ['-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-tune', 'film', '-movflags', '+faststart', saida])],
      { stdio: ['pipe', 'inherit', 'inherit'] });
    const fim = new Promise(r => ff.on('close', r));
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      const buf = await tirar(i / FPS);
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 30 === 0) process.stdout.write(`\r${i}/${n} quadros (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
    ff.stdin.end();
    const cod = await fim;
    console.log(`\r${n}/${n} quadros → ${saida} (${((Date.now() - t0) / 1000).toFixed(0)} s)${cod ? ' ERRO ffmpeg ' + cod : ''}`);
  }
} catch (e) { console.error('ERRO:', e.message); process.exitCode = 1; }
finally { await c.fechar(); }
