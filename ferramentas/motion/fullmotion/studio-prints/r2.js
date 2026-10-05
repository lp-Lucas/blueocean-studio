// roteiro dos prints do anúncio "Blue Ocean Studio" (gera r2.json para o captura-main.js)
const fs = require('fs'), path = require('path');
const D = __dirname.replace(/\\/g, '/');
const abrir = (p, t, comp) => `(async () => { await APP.abrir(${JSON.stringify(p)}); await new Promise(r => setTimeout(r, 1200));
  ${comp ? `try { await COMPS.abrir(${JSON.stringify(comp)}); } catch (e) {} await new Promise(r => setTimeout(r, 1200));` : ''}
  PV.irPara(${t}); })()`;
// conversa limpa no chat (mesmas classes que o chat.js usa)
const passo = (ico, tit, det) => `<div class="passo ok"><div class="cab"><div class="ico"><i data-i="${ico}"></i></div><div class="tit"><b>${tit}</b><span>${det}</span></div><div class="est"><i data-i="check"></i></div></div><div class="det"></div></div>`;
const conversa = `(() => { const l = document.querySelector('#mensagens'); l.innerHTML = '';
  const add = s => l.append(html(s));
  add('<div class="msg-u">Faz o gancho com a reação surpresa, legenda no padrão e corta os melhores momentos</div>');
  add('<div class="msg-c"><p>Vou seguir a receita do gancho e a da legenda.</p></div>');
  add(${JSON.stringify(passo('file', 'Lendo a receita', 'receitas/1-gancho.md'))});
  add(${JSON.stringify(passo('terminal', 'Achando os melhores momentos', 'bo texto m1 --palavras'))});
  add(${JSON.stringify(passo('edit', 'Editando a linha do tempo', 'composicoes/comp1.json'))});
  add(${JSON.stringify(passo('captions', 'Ligando a legenda', 'Montserrat Bold · caixa azul'))});
  add(${JSON.stringify(passo('image', 'Renderizando um quadro', 'bo quadro 1.20'))});
  add('<div class="msg-c"><p>Pronto. O gancho abre com a <b>tela dividida</b> e a reação surpresa, o flash azul entra na volta e a legenda está no padrão Blue Ocean. Montei 3 cortes no ritmo da fala.</p></div>');
  document.querySelector('#entrada').value = ''; })()`;
const R = [
  // 1. editor inteiro: motion da Social Media + conversa limpa
  { js: abrir('Social Media MOTION', 17.5), espera: 5000, png: 'heroi.png' },
  { js: conversa, espera: 1500, png: 'heroi-chat.png' },
  // 2. aba Processos (o que ele aprendeu)
  { js: `document.querySelector('#abasEsq [data-aba="receitas"]').click()`, espera: 1500, png: 'processos.png', medir: ['#esquerda', '#listaReceitas', '#direita', '#palco', '#moldura', '#linha', '#barraComps'] },
  // 3. vários vídeos (composições) e legenda azul
  { js: abrir('ADS JQ COPY 4', 28.8), espera: 5000, png: 'legenda.png' },
  { js: abrir('tentativa de motion', 3.0), espera: 5000, png: 'comps.png' },
  { js: abrir('tela dividia', 1.2), espera: 5000, png: 'gancho.png' },
  { js: abrir('podcastronyYTB', 640), espera: 6000, png: 'podcast.png' },
  { js: abrir('reels com rotoscopia', 28.3), espera: 5000, png: 'roto.png' },
  { js: abrir('simulação de meet', 20.4), espera: 5000, png: 'meet.png' },
  { js: abrir('gabrielSM2909-1', 19.2), espera: 5000, png: 'gabriel.png' },
];
R.forEach(p => { p.png = D + '/' + p.png; });
fs.writeFileSync(path.join(__dirname, 'r2.json'), JSON.stringify(R, null, 1));
