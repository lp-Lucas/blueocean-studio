/* Prints do próprio Blue Ocean Studio em 2x (para os vídeos de anúncio do editor).
   uso: BO_ISOLADO=1 BO_PRINTS=roteiro.json electron captura-main.js
   roteiro.json = [{ "js": "código que arruma a tela", "espera": 4000, "png": "saida.png" }, ...]
   Abre o editor numa janela fora da tela (offscreen, 1720x1000 em 2x) e tira um print por passo. */
const path = require('path');
const fs = require('fs');
const electron = require('electron');
const { app } = electron;
const RAIZ = path.resolve(__dirname, '../../../..');
const Orig = electron.BrowserWindow;
let janela = null;
class Janela extends Orig {
  constructor(o) {
    o = { ...o, width: 1720, height: 1000, show: false, webPreferences: { ...o.webPreferences, offscreen: { deviceScaleFactor: 2 } } };
    super(o); janela = this;
    this.maximize = () => {}; this.show = () => {};
  }
}
// main.js recebe um "electron" com a janela trocada (o módulo original não deixa redefinir a propriedade)
const Module = require('module');
const falso = new Proxy(electron, { get: (o, k) => k === 'BrowserWindow' ? Janela : o[k] });
const carregar = Module._load;
Module._load = function (req, ...r) { return req === 'electron' ? falso : carregar.call(this, req, ...r); };
app.setName('Blue Ocean Studio');
process.chdir(RAIZ);
require(path.join(RAIZ, 'main.js'));

const roteiro = JSON.parse(fs.readFileSync(process.env.BO_PRINTS, 'utf8'));
const espera = ms => new Promise(r => setTimeout(r, ms));
app.whenReady().then(async () => {
  while (!janela) await espera(200);
  janela.webContents.setFrameRate(30);
  console.log('janela criada');
  while (janela.webContents.isLoading() || !janela.webContents.getURL()) await espera(200);
  console.log('tela carregada');
  await espera(2500);
  for (const p of roteiro) {
    try { if (p.js) await janela.webContents.executeJavaScript(p.js); } catch (e) { console.log('js erro:', e.message); }
    await espera(p.espera || 2000);
    const img = await janela.webContents.capturePage();
    fs.writeFileSync(p.png, img.toPNG());
    console.log('print', p.png, img.getSize());
    // onde fica cada painel no print (px lógicos; o png é 2x) → <png>.json, para recortar no motion
    const sels = p.medir || ['#topo', '#esquerda', '#barraComps', '#palco', '#moldura', '#linha', '#direita', '#mensagens', '.caixa-entrada', '.chat-rodape'];
    const rs = await janela.webContents.executeJavaScript(`(${JSON.stringify(sels)}).reduce((o, s) => { const e = document.querySelector(s);
      if (e) { const r = e.getBoundingClientRect(); o[s] = [r.left, r.top, r.width, r.height].map(v => Math.round(v)); } return o; }, {})`);
    fs.writeFileSync(p.png.replace(/\.png$/, '.json'), JSON.stringify(rs, null, 1));
  }
  app.exit(0);
});
