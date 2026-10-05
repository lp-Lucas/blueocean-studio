// ajuste v4 do studio.html: abertura numa linha só com câmera seguindo o texto, chat azul "trabalhando",
// telas do "minutos" e dos números redesenhadas no estilo dos painéis do editor
const fs = require('fs'); let s = fs.readFileSync('studio.html', 'utf8');
fs.writeFileSync('studio-v3.bak.html', s);
const rep = (a, b) => { if (!s.includes(a)) throw new Error('não achei: ' + a.slice(0, 80)); s = s.replace(a, b); };
const CLOCK = '<svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8.5"/><path d="M12 8.5 V13 L15 15 M9.5 2.5 H14.5"/></svg>';
const DOWN = '<svg viewBox="0 0 24 24"><path d="M12 5 V19 M6 13 L12 19 L18 13"/></svg>';
const DOLAR = '<svg viewBox="0 0 24 24"><path d="M12 3 V21 M16.5 7.5 C16 5.5 14 5 12 5 C9.5 5 8 6.3 8 8 C8 12 16.5 10 16.5 15 C16.5 17 14.5 18.5 12 18.5 C9.5 18.5 7.8 17.5 7.4 15.5"/></svg>';

/* CSS novo */
rep('  .cursor { position: absolute; left: 0; top: 0; }', `  .cursor { position: absolute; left: 0; top: 0; }
  /* abertura: o input numa linha só, a câmera acompanha o texto até o botão */
  #inAbre { position: absolute; left: 0; top: 0; z-index: 6; transform-origin: 0 50%; opacity: 0; }
  #inAbre .caixa-entrada, #inFrase .caixa-entrada { align-items: center; white-space: nowrap; }
  #abreTxt, #fraseTxt { flex: none; white-space: pre; padding: 5px 0; line-height: 1.45; font-size: 13px; }
  #bolha { width: auto !important; }
  #bolhaTxt { white-space: nowrap; }
  /* chat trabalhando (igual ao app): painel azul com bolinhas */
  #direita .fundo-pensando { opacity: 0; }
  #direita.trabalhando .spin { border-color: rgba(255, 255, 255, .25); border-top-color: #fff; }
  /* cartões de número no estilo dos painéis do editor */
  .stat2 { width: 900px; padding: 44px 48px; border-radius: 40px; background: rgba(22, 23, 28, .92); border: 2px solid rgba(255, 255, 255, .08);
           box-shadow: inset 0 2px 0 rgba(255, 255, 255, .06), 0 40px 100px rgba(0, 0, 0, .6); font-family: 'UI'; letter-spacing: -0.01em; }
  .cab2 { display: flex; align-items: center; gap: 26px; margin-bottom: 34px; }
  .ico2 { width: 96px; height: 96px; border-radius: 28px; background: rgba(45, 107, 255, .16); display: grid; place-items: center; flex: none; }
  .ico2 svg { width: 50px; height: 50px; fill: none; stroke: #5287FF; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .stat2 .t2 { font-size: 52px; font-weight: 700; letter-spacing: -0.03em; white-space: nowrap; }
  .stat2 .t1 { font-size: 28px; color: #6E7380; font-weight: 500; margin-top: 2px; }
  .pill2 { margin-left: auto; display: flex; align-items: center; gap: 10px; height: 62px; padding: 0 26px 0 20px; border-radius: 31px; background: rgba(45, 107, 255, .16);
           color: #7FA4FF; font-size: 28px; font-weight: 600; white-space: nowrap; }
  .pill2 svg { width: 30px; height: 30px; fill: none; stroke: currentColor; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }
  .barra2 { display: flex; align-items: center; gap: 22px; margin-top: 22px; }
  .rot2 { width: 120px; font-size: 28px; color: #A6AAB4; font-weight: 500; }
  .trilho { flex: 1; height: 34px; border-radius: 17px; background: rgba(255, 255, 255, .05); overflow: hidden; }
  .trilho b { display: block; height: 100%; border-radius: 17px; background: #3A3E4A; transform-origin: 0 50%; }
  .trilho b.az { background: linear-gradient(90deg, #2D6BFF, #5287FF); box-shadow: 0 0 24px rgba(45, 107, 255, .6); }
  .val2 { width: 140px; text-align: right; font-size: 32px; font-weight: 700; font-variant-numeric: tabular-nums; }
  .az2 { color: #7FA4FF; }
  .graf2 { position: relative; }
  .graf2 svg { display: block; width: 804px; height: 230px; overflow: visible; }
  .eixo2 { display: flex; justify-content: space-between; margin-top: 14px; font-size: 24px; color: #6E7380; }
  #timerTxt { font-size: 132px; font-weight: 700; letter-spacing: -0.03em; font-variant-numeric: tabular-nums; line-height: 1; }`);

/* HTML: abertura numa linha só */
rep('<div id="bolha"', `<div id="inAbre" class="ui"><div class="caixa-entrada" id="abreCaixa"><div id="abreTxt"></div>
  <div class="entrada-acoes"><button class="icone-btn"><i data-i="paperclip"></i></button><button class="enviar" id="abreEnv"><i data-i="send"></i></button></div></div></div>
<div id="bolha"`);
/* HTML: chat com o fundo "trabalhando" */
rep('<aside id="direita" class="painel">', '<aside id="direita" class="painel"><canvas class="fundo-pensando" id="pensaCv" width="780" height="1892"></canvas>');
/* HTML: cena 6 */
rep('style="left:540px;top:520px;font-size:66px">O que levava', 'style="left:540px;top:430px;font-size:66px">O que levava');
rep('style="left:540px;top:660px;font-size:120px;font-weight:700">uma tarde inteira', 'style="left:540px;top:560px;font-size:120px;font-weight:700">uma tarde inteira');
rep('style="left:540px;top:520px;font-size:66px">agora sai em', 'style="left:540px;top:430px;font-size:66px">agora sai em');
rep('style="left:540px;top:680px;font-size:170px;font-weight:700">minutos.', 'style="left:540px;top:575px;font-size:170px;font-weight:700">minutos.');
rep(/<div id="timer"[^\n]*\n/.exec(s)[0], `<div id="tempo" class="p stat2" style="left:540px;top:900px;width:820px">
  <div class="cab2" style="margin-bottom:20px"><div class="ico2">${CLOCK}</div><div class="t1" style="font-size:30px;color:#A6AAB4;margin:0">Tempo de edição</div>
    <div class="pill2" id="tempoSt"><span id="tempoStTxt">manual</span></div></div>
  <div id="timerTxt">4:00:00</div>
  <div class="trilho" style="margin-top:30px;height:16px"><b id="tempoBar" class="az"></b></div>
</div>
<div id="inFrase" class="p ui" style="left:540px;top:1250px"><div class="caixa-entrada"><div id="fraseTxt" style="width:250px"></div>
  <div class="entrada-acoes"><button class="icone-btn"><i data-i="paperclip"></i></button><button class="enviar" id="fraseEnv"><i data-i="send"></i></button></div></div></div>
`);
/* HTML: cena 7 */
const k1i = s.indexOf('<div id="k1"'), k2f = s.indexOf('<div id="parede"');
s = s.slice(0, k1i) + `<div id="k1" class="p stat2" style="left:540px;top:620px">
  <div class="cab2"><div class="ico2">${CLOCK}</div><div><div class="t2">Horas editando</div><div class="t1">por vídeo</div></div><div class="pill2" id="k1p">${DOWN}menos</div></div>
  <div class="barra2"><span class="rot2">Antes</span><div class="trilho"><b id="bAntes"></b></div><span class="val2" id="vAntes">4 h</span></div>
  <div class="barra2"><span class="rot2">Agora</span><div class="trilho"><b id="bAgora" class="az" style="width:7%"></b></div><span class="val2 az2" id="vAgora">3 min</span></div>
</div>
<div id="k2" class="p stat2" style="left:540px;top:1080px">
  <div class="cab2"><div class="ico2">${DOLAR}</div><div><div class="t2">Custo por vídeo</div><div class="t1">a cada vídeo novo</div></div><div class="pill2" id="k2p">${DOWN}menos</div></div>
  <div class="graf2"><svg viewBox="0 0 804 230">
    <defs><linearGradient id="g2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2D6BFF" stop-opacity=".35"/><stop offset="1" stop-color="#2D6BFF" stop-opacity="0"/></linearGradient></defs>
    <path d="M0 40 H804 M0 115 H804 M0 190 H804" stroke="rgba(255,255,255,.06)" stroke-width="2"/>
    <path id="area2" d="M 0 40 C 140 50, 220 90, 330 120 S 560 175, 804 190 L 804 230 L 0 230 Z" fill="url(#g2)"/>
    <path id="curva" d="M 0 40 C 140 50, 220 90, 330 120 S 560 175, 804 190" fill="none" stroke="#5287FF" stroke-width="8" stroke-linecap="round"/>
    <circle id="ponto" r="13" fill="#fff" stroke="#2D6BFF" stroke-width="7"/></svg>
    <div class="eixo2"><span>1º vídeo</span><span>10º vídeo</span></div></div>
</div>
` + s.slice(k2f);

/* JS: barras antigas fora */
rep(/const BARS = [^\n]*\n[^\n]*\n/.exec(s)[0], '');
/* JS: bolinhas do chat trabalhando (ui/pensando.js → PENSA) + medidas da abertura */
rep('const P3 = (rx, ry, rz = 0) =>', `const pg = $('#pensaCv').getContext('2d');
const PCLAROS = tons([255, 255, 255], [0.14, 0.92]), PESCUROS = tons([3, 14, 72], [0.18, 0.78]);
const pgr = (() => { const g = pg.createLinearGradient(0, 0, 390 * 0.4, 946); g.addColorStop(0, '#1B4FF0'); g.addColorStop(0.55, '#0F3AD6'); g.addColorStop(1, '#0A2AA8'); return g; })();
function pensaBolinhas(t) {
  pg.setTransform(2, 0, 0, 2, 0, 0); pg.fillStyle = pgr; pg.fillRect(0, 0, 390, 946);
  for (let y = -17; y < 946 + 17; y += 17) for (let x = -17; x < 390 + 17; x += 17) {
    const a = Math.sin(x * 0.011 + t * 0.7) + Math.sin(y * 0.0085 - t * 0.5) + Math.sin((x - y) * 0.0065 + t * 0.32), v = a / 3;
    const dx = 5.5 * Math.sin(y * 0.021 + t * 1.05 + a * 0.7), dy = 5.5 * Math.cos(x * 0.019 - t * 0.85 + a * 0.7);
    const k = Math.min(NIV - 1, Math.floor(Math.abs(v) * NIV));
    pg.fillStyle = v > 0 ? PCLAROS[k] : PESCUROS[k];
    pg.beginPath(); pg.arc(x + dx, y + dy, 1.15 + Math.abs(v) * 0.75, 0, 6.2832); pg.fill();
  }
}
/* abertura: largura do texto a cada letra (a câmera segue o cursor) */
const PEDIDO = 'Transforma esse podcast em 3 reels com gancho e legenda';
const LARG = (() => { const el = $('#abreTxt'), w = []; for (let n = 0; n <= PEDIDO.length; n++) { el.textContent = PEDIDO.slice(0, n); w.push(el.offsetWidth); }
  el.style.width = (w[w.length - 1] + 6) + 'px'; el.textContent = ''; return w; })();
const P3 = (rx, ry, rz = 0) =>`);

/* JS: abertura */
const iA = s.indexOf("  const PEDIDO = 'Transforma"), iB = s.indexOf('  // a mensagem sai do input e sobe');
if (iA < 0 || iB < 0) throw new Error('abertura');
s = s.slice(0, iA) + `  // o input numa linha só; a câmera acompanha o cursor do texto e, no fim, vai até o botão de enviar
  { const el = $('#inAbre'), S1 = L(3.0, 3.3, E.cubicInOut(C((t + 0.4) / 2.3))), X0 = 70;
    digita($('#abreTxt'), PEDIDO, t, 0.05, 1.55);
    if (t > 1.97) $('#abreTxt').innerHTML = '<span class="ph">Descreva a edição</span>';
    const n = C((t - 0.05) / 1.5) * PEDIDO.length, i0 = Math.floor(n), wc = L(LARG[i0], LARG[Math.min(i0 + 1, PEDIDO.length)], n - i0);
    const panC = Math.max(0, X0 + S1 * (14 + wc) - 720);
    const larg = $('#abreCaixa').offsetWidth, panB = X0 + S1 * (larg - 22) - 620;
    const pan = t < 1.5 ? panC : L(Math.max(0, X0 + S1 * (14 + LARG[LARG.length - 1]) - 720), panB, E.cubicInOut(C((t - 1.5) / 0.35)));
    const pin = pr(t, -0.4, 0.5), po = pr(t, 2.0, 0.3, E.cubicIn);
    el.style.opacity = pin * (1 - po); el.style.filter = (1 - pin) + po > 0.02 ? \`blur(\${((1 - pin) + po) * 14}px)\` : 'none';
    el.style.transform = \`translate(\${X0 - pan}px, 1000px) translateY(-50%) scale(\${S1})\`; }
  { const k = Math.sin(C((t - 1.9) / 0.22) * Math.PI); $('#abreEnv').style.transform = \`scale(\${1 - 0.12 * k})\`; $('#abreEnv').style.filter = k > 0 ? \`brightness(\${1 + k * 0.4})\` : ''; }
  if (t < 2.4) cur = [1.2, [980, 1500], $('#abreEnv'), 1.92, 2.25];
` + s.slice(iB);

/* JS: chat azul enquanto o agente trabalha (do envio até a resposta) */
rep('  /* 3 ─ gancho,', `  { const op = t < 6.55 || t > 13.95 ? 0 : pr(t, 6.55, 0.5, E.cubicOut) * (1 - pr(t, 13.3, 0.6, E.cubicIn));
    $('#direita').classList.toggle('trabalhando', t >= 6.6 && t < 13.55);
    $('#pensaCv').style.opacity = op; if (op > 0) pensaBolinhas(t); }

  /* 3 ─ gancho,`);

/* JS: cena 6 */
rep(/  FM\.anim\(\$\('#timer'\)[\s\S]*?brilho\(\$\('#frase \.gl'\), t, 23\.4, 1\.0\);\n/.exec(s)[0], `  FM.anim($('#tempo'), t, 19.84, 24.3, { de: 0.85 });
  { const p = pr(t, 21.4, 1.05, E.cubicInOut); $('#timerTxt').textContent = hhmmss(L(4 * 3600, 180, p));
    $('#timerTxt').style.color = p > 0.98 ? '#7FA4FF' : '#F1F2F5';
    $('#tempoBar').style.transform = \`scaleX(\${L(0.03, 1, p)})\`;
    $('#tempoStTxt').textContent = t < 21.4 ? 'manual' : p < 0.98 ? 'com o agente…' : 'pronto ✓';
    const tranco = t > 22.48 ? Math.exp(-(t - 22.48) * 6) * Math.sin((t - 22.48) * 26) : 0;
    if (t > 22.48) $('#tempo').style.transform += \` rotate(\${-3 * tranco}deg) scale(\${1 + 0.04 * Math.abs(tranco)})\`; }
  FM.anim($('#inFrase'), t, 22.5, 24.3, { de: 0.85, dy: 90, esc: 2.75 });
  digita($('#fraseTxt'), 'Monta 3 reels desse podcast no padrão', t, 22.6, 23.3);
  if (t > 23.68) $('#fraseTxt').innerHTML = '<span class="ph">Enviado</span>';
  { const k = Math.sin(C((t - 23.58) / 0.22) * Math.PI), g = Math.sin(C((t - 23.62) / 0.9) * Math.PI);
    $('#fraseEnv').style.transform = \`scale(\${1 - 0.12 * k})\`;
    $('#fraseEnv').style.boxShadow = g > 0 ? \`0 0 0 \${6 * g}px rgba(45,107,255,.25), 0 0 \${30 * g}px \${6 * g}px rgba(45,107,255,.35)\` : ''; }
  if (t > 22.8 && t < 24.2) cur = [22.9, [900, 1650], $('#fraseEnv'), 23.62, 23.95];
`);
rep("{ t0: 22.48, ps: FM.criaConfete(7, 80, 540, 930, 700, 150), cor: 'branco' }", "{ t0: 22.48, ps: FM.criaConfete(7, 80, 540, 900, 760, 260) }");

/* JS: cena 7 */
rep(/  FM\.anim\(\$\('#k1'\)[\s\S]*?pop\(\$\('#k2 \.seta'\), t, 26\.9\);\n/.exec(s)[0], `  FM.anim($('#k1'), t, 24.44, 27.1, { de: 0.85, extra: P3(5, -6) });
  $('#bAntes').style.transform = \`scaleX(\${pr(t, 24.7, 0.7, E.cubicOut)})\`;
  $('#bAgora').style.transform = \`scaleX(\${M.prog(t, 25.15, 0.7, E.spring)})\`;
  $('#vAntes').style.opacity = pr(t, 24.9, 0.3); $('#vAgora').style.opacity = pr(t, 25.3, 0.3);
  pop($('#k1p'), t, 25.4, 0.6);
  FM.anim($('#k2'), t, 26.02, 27.15, { de: 0.85, extra: P3(5, 6) });
  { const p = pr(t, 26.3, 0.85, E.cubicInOut), pt = curva.getPointAtLength(curvaL * p);
    curva.setAttribute('stroke-dasharray', \`\${curvaL} \${curvaL}\`); curva.setAttribute('stroke-dashoffset', L(curvaL, 0, p));
    $('#area2').style.clipPath = \`inset(0 \${(1 - p) * 100}% 0 0)\`;
    $('#ponto').setAttribute('cx', pt.x); $('#ponto').setAttribute('cy', pt.y); $('#ponto').style.opacity = t < 26.3 ? 0 : 1; }
  pop($('#k2p'), t, 26.95, 0.6);
`);
fs.writeFileSync('studio.html', s); console.log('ok');
