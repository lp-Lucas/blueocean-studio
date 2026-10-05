// ajuste v5: câmera de verdade na abertura e na cena da frase (0:22–0:24), com cortes invisíveis
// (borrão de movimento no sentido do movimento, nos dois lados do corte) e a câmera seguindo o texto digitado.
const fs = require('fs'); let s = fs.readFileSync('studio.html', 'utf8');
fs.writeFileSync('studio-v4.bak.html', s);
const rep = (a, b) => { if (!s.includes(a)) throw new Error('não achei: ' + String(a).slice(0, 90)); s = s.replace(a, b); };
const corta = (ini, fim, novo) => { const a = s.indexOf(ini), b = s.indexOf(fim, a); if (a < 0 || b < 0) throw new Error('trecho: ' + ini.slice(0, 50)); s = s.slice(0, a) + novo + s.slice(b); };
const CK = '<svg viewBox="0 0 24 24" fill="none" stroke="#062B26" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 L10 17 L19 7"/></svg>';

/* ── CSS ── */
rep('  #inAbre { position: absolute; left: 0; top: 0; z-index: 6; transform-origin: 0 50%; opacity: 0; }', `  /* sets com câmera própria: o filtro (borrão de movimento) fica fora, a câmera (transform) fica dentro */
  .camfx { position: absolute; inset: 0; z-index: 6; pointer-events: none; opacity: 0; }
  .camw { position: absolute; left: 0; top: 0; width: 0; height: 0; transform-origin: 0 0; }
  .camw .caixa-entrada { position: absolute; left: 0; top: 0; }
  #abBolha { position: absolute; left: 0; top: 0; white-space: nowrap; max-width: none; opacity: 0; }
  #abOrbe { position: absolute; left: 0; top: 0; width: 140px; height: 140px; margin: -70px 0 0 -70px; border-radius: 50%; opacity: 0;
            background: radial-gradient(circle closest-side, rgba(170, 196, 255, .95) 0%, rgba(45, 107, 255, .8) 14%, rgba(45, 107, 255, .48) 30%, rgba(45, 107, 255, .22) 50%, rgba(45, 107, 255, .07) 72%, rgba(45, 107, 255, 0) 100%); }
  .raio2 { position: absolute; left: 0; top: 0; width: 2px; height: 22px; margin: -11px 0 0 -1px; border-radius: 1px; opacity: 0;
           background: linear-gradient(rgba(120, 160, 255, .95), rgba(45, 107, 255, 0)); }
  #abCard { position: absolute; left: 0; top: 0; width: 170px; height: 302px; margin: -151px 0 0 -85px; border-radius: 13px; overflow: hidden; opacity: 0;
            border: 1px solid rgba(255, 255, 255, .16); box-shadow: 0 24px 60px rgba(0, 0, 0, .6), 0 0 50px rgba(45, 107, 255, .22); background: #111; }
  #abCard img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .selo1 { position: absolute; left: 0; top: 0; display: flex; align-items: center; gap: 7px; height: 30px; padding: 0 13px 0 5px; border-radius: 15px; font-size: 13px;
           font-weight: 600; white-space: nowrap; background: rgba(38, 40, 48, .95); border: 1px solid rgba(255, 255, 255, .14); box-shadow: 0 10px 24px rgba(0, 0, 0, .5); opacity: 0; }
  .selo1 .v { width: 20px; height: 20px; border-radius: 50%; background: #2EF2D0; display: grid; place-items: center; }
  .selo1 .v svg { width: 12px; height: 12px; }`);
rep('  #inAbre .caixa-entrada, #inFrase .caixa-entrada { align-items: center; white-space: nowrap; }', '  .camw .caixa-entrada { align-items: center; white-space: nowrap; }');

/* ── HTML: os dois sets ── */
corta('<div id="inAbre"', '<!-- ═══ 2 e 8.', `<svg width="0" height="0" style="position:absolute"><filter id="mbA" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur id="mbAg" stdDeviation="0 0"/></filter>
  <filter id="mbF" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur id="mbFg" stdDeviation="0 0"/></filter></svg>
<div id="abFx" class="camfx"><div id="abCam" class="camw ui">
  <div class="caixa-entrada" id="abreCaixa"><div id="abreTxt"></div>
    <div class="entrada-acoes"><button class="icone-btn"><i data-i="paperclip"></i></button><button class="enviar" id="abreEnv"><i data-i="send"></i></button></div></div>
  <div class="msg-u" id="abBolha">Transforma esse podcast em 3 reels com gancho e legenda</div>
  <div id="abOrbe"></div>
  <div id="abRaios"></div>
  <div id="abCard"><img class="clip" data-c="c"></div>
  <div class="selo1" id="abSelo"><span class="v">${CK}</span>Pronto em 2 min</div>
</div></div>
<div id="frFx" class="camfx"><div id="frCam" class="camw ui">
  <div class="caixa-entrada" id="frCaixa"><div id="fraseTxt"></div>
    <div class="entrada-acoes"><button class="icone-btn"><i data-i="paperclip"></i></button><button class="enviar" id="fraseEnv"><i data-i="send"></i></button></div></div>
</div></div>

`);
corta('<div id="inFrase"', '\n\n<!-- ═══ 7.', '');
rep('<div id="tempo" class="p stat2" style="left:540px;top:900px;width:820px">', '<div id="tempo" class="p stat2" style="left:540px;top:1000px;width:820px">');
rep('style="left:540px;top:430px;font-size:66px">O que levava', 'style="left:540px;top:560px;font-size:66px">O que levava');
rep('style="left:540px;top:560px;font-size:120px;font-weight:700">uma tarde inteira', 'style="left:540px;top:690px;font-size:120px;font-weight:700">uma tarde inteira');
rep('style="left:540px;top:430px;font-size:66px">agora sai em', 'style="left:540px;top:500px;font-size:66px">agora sai em');
rep('style="left:540px;top:575px;font-size:170px;font-weight:700">minutos.', 'style="left:540px;top:650px;font-size:170px;font-weight:700">minutos.');

/* ── JS: raios no set da abertura, medidas do texto dos dois inputs ── */
rep("const RAIOS = Array.from({ length: 14 }, (_, i) => { const d = document.createElement('div'); d.className = 'raio'; $('#raios').appendChild(d); return d; });",
    "const RAIOS = Array.from({ length: 16 }, () => { const d = document.createElement('div'); d.className = 'raio2'; $('#abRaios').appendChild(d); return d; });");
rep(`let LARG = null;
const medeLarg = () => { const el = $('#abreTxt'), w = []; for (let n = 0; n <= PEDIDO.length; n++) { el.textContent = PEDIDO.slice(0, n); w.push(el.offsetWidth); }
  el.style.width = (w[w.length - 1] + 6) + 'px'; el.textContent = ''; return w; };`,
`const FRASE = 'Monta 3 reels desse podcast no padrão';
let LARG = null, LARG2 = null;
const medeLarg = (el, txt) => { const w = []; for (let n = 0; n <= txt.length; n++) { el.textContent = txt.slice(0, n); w.push(el.offsetWidth); }
  el.style.width = (w[w.length - 1] + 6) + 'px'; el.textContent = ''; return w; };
/* posição do cursor do texto (px do input) com a digitação contínua */
const caretEm = (larg, txt, t, a, b) => { const n = C((t - a) / (b - a)) * txt.length, i = Math.floor(n); return 14 + L(larg[i], larg[Math.min(i + 1, txt.length)], n - i); };
/* corte invisível: borrão de movimento curto dos dois lados do corte */
const pulso = (t, tc, forca = 34) => forca * Math.exp(-(((t - tc) / 0.045) ** 2));
/* câmera de um set: transform dentro, borrão de movimento (pela velocidade + pulsos dos cortes) no filtro de fora */
function aplicaCam(fx, cam, filtro, c, c0, opac) {
  cam.style.transform = \`translate(540px, \${c.sy ?? 960}px) scale(\${c.S}) translate(\${-c.fx}px, \${-c.fy}px)\`;
  const dx = (c0.fx - c.fx) * c.S, dy = (c0.fy - c.fy) * c.S, dz = Math.abs(Math.log(c.S / c0.S)) * 260;
  const bx = Math.min(30, Math.abs(dx) * 0.28 + dz * 0.4 + (c.bx || 0)), by = Math.min(30, Math.abs(dy) * 0.28 + dz * 0.4 + (c.by || 0));
  $('#' + filtro + 'g').setAttribute('stdDeviation', \`\${bx.toFixed(2)} \${by.toFixed(2)}\`);
  fx.style.filter = bx + by > 0.4 ? \`url(#\${filtro})\` : 'none';
  fx.style.opacity = opac;
}
/* câmera da abertura: plano aberto da barra → corte → close seguindo o texto → corte → botão → sobe com a mensagem → criativo */
function abreCam(t) {
  const W = $('#abreCaixa').offsetWidth, H = $('#abreCaixa').offsetHeight, BW = $('#abBolha').offsetWidth, BH = $('#abBolha').offsetHeight;
  const car = caretEm(LARG, PEDIDO, t, 0.05, 1.55), bot = W - 22;
  const P = [W - BW / 2, -300];
  if (t < 0.62) { const p = C((t + 0.4) / 1.02);   // plano aberto: a barra inteira, zoom leve indo para o lado
    return { fx: W * 0.5 + L(-40, 40, p) + 90 * E.cubicIn(C((t - 0.5) / 0.12)) / 2.2, fy: H / 2, S: L(1.95, 2.3, E.cubicOut(p)), bx: pulso(t, 0.62) }; }
  if (t < 1.58) { const p = C((t - 0.62) / 0.96), S = L(4.0, 4.4, p);   // close: o cursor do texto fica no mesmo lugar e o texto corre
    return { fx: car - 80 / S - 90 * (1 - E.cubicOut(C((t - 0.62) / 0.14))) / S + 90 * E.cubicIn(C((t - 1.46) / 0.12)) / S, fy: H / 2 + Math.sin(t * 2.6) * 1.5,
             S, bx: pulso(t, 0.62) + pulso(t, 1.58) }; }
  if (t < 1.98) { const p = C((t - 1.58) / 0.4);   // botão de enviar; empurra no clique
    return { fx: bot - 90 * (1 - E.cubicOut(C((t - 1.58) / 0.16))) / 4.2 - 6 * (1 - p), fy: H / 2, S: L(4.0, 4.35, p) + 0.7 * E.cubicOut(C((t - 1.9) / 0.12)), bx: pulso(t, 1.58) }; }
  const sobe = E.cubicInOut(C((t - 1.98) / 0.44)), bolY = L(H / 2, P[1], sobe);
  if (t < 2.42) {   // a mensagem sobe e a câmera vai junto, abrindo
    const q = E.cubicInOut(C((t - 1.98) / 0.42));
    return { fx: L(bot, P[0], q), fy: L(H / 2, L(H / 2, P[1], E.cubicInOut(C((t - 2.02) / 0.44))), 1), S: L(5.05, 2.6, q) };
  }
  if (t < 3.32) { const p = C((t - 2.42) / 0.9);   // vira luz e sai o criativo; empurra devagar
    return { fx: P[0] + Math.sin(t * 2) * 3, fy: P[1] + L(14, 34, p), S: L(2.6, 2.95, E.cubicOut(p)) }; }
  const w = E.cubicIn(C((t - 3.32) / 0.2));   // mergulha no criativo (vai para o logo)
  return { fx: P[0], fy: P[1] + 34, S: 2.95 * L(1, 5, w) };
}
/* câmera da frase: barra inteira → corte → close no texto → corte → botão, clique → mergulho */
function fraseCam(t) {
  const W = $('#frCaixa').offsetWidth, H = $('#frCaixa').offsetHeight, car = caretEm(LARG2, FRASE, t, 22.55, 23.28), bot = W - 22;
  if (t < 22.78) { const p = C((t - 22.42) / 0.36);
    return { fx: W * 0.5 + L(-50, 30, p) + 90 * E.cubicIn(C((t - 22.68) / 0.1)) / 2.4, fy: H / 2, S: L(2.2, 2.55, E.cubicOut(p)), bx: pulso(t, 22.78) + pulso(t, 22.45, 26) }; }
  if (t < 23.32) { const p = C((t - 22.78) / 0.54), S = L(4.1, 4.4, p);
    return { fx: car - 80 / S - 90 * (1 - E.cubicOut(C((t - 22.78) / 0.14))) / S + 90 * E.cubicIn(C((t - 23.22) / 0.1)) / S, fy: H / 2, S, bx: pulso(t, 22.78) + pulso(t, 23.32) }; }
  if (t < 24.08) { const p = C((t - 23.32) / 0.76);
    return { fx: bot - 90 * (1 - E.cubicOut(C((t - 23.32) / 0.16))) / 4.2, fy: H / 2, S: L(4.0, 4.3, p) + 0.8 * E.cubicOut(C((t - 23.6) / 0.14)), bx: pulso(t, 23.32) }; }
  const w = E.cubicIn(C((t - 24.08) / 0.22));
  return { fx: bot, fy: H / 2, S: 5.1 * L(1, 4, w) };
}`);

/* ── JS: abertura (substitui do "o input numa linha só" até o selo antigo) ── */
corta('  // o input numa linha só;', '\n  /* 2 ─', `  if (!LARG2) LARG2 = medeLarg($('#fraseTxt'), FRASE);
  {
    const c = abreCam(t), c0 = abreCam(t - 1 / 30);
    aplicaCam($('#abFx'), $('#abCam'), 'mbA', c, c0, t > 3.6 ? 0 : 1 - pr(t, 3.42, 0.1, E.linear));
    const W = $('#abreCaixa').offsetWidth, H = $('#abreCaixa').offsetHeight, BW = $('#abBolha').offsetWidth, BH = $('#abBolha').offsetHeight, P = [W - BW / 2, -300];
    digita($('#abreTxt'), PEDIDO, t, 0.05, 1.55);
    if (t > 1.97) $('#abreTxt').innerHTML = '<span class="ph">Descreva a edição</span>';
    $('#abreCaixa').style.opacity = 1 - pr(t, 2.02, 0.16, E.linear);
    { const k = Math.sin(C((t - 1.9) / 0.22) * Math.PI); $('#abreEnv').style.transform = \`scale(\${1 - 0.14 * k})\`; $('#abreEnv').style.filter = k > 0 ? \`brightness(\${1 + k * 0.5})\` : ''; }
    // a mensagem sai do input e sobe; no alto é sugada para a luz
    { const b = $('#abBolha'), sobe = E.cubicInOut(C((t - 1.98) / 0.44)), y = L(H / 2, P[1], sobe), su = E.cubicIn(C((t - 2.36) / 0.16));
      b.style.opacity = t < 1.98 ? 0 : pr(t, 1.98, 0.06, E.linear) * (1 - su);
      b.style.transform = \`translate(\${P[0] - BW / 2}px, \${y - BH / 2}px) scale(\${L(1, 0.15, su)})\`; b.style.transformOrigin = '50% 50%'; }
    { const o = $('#abOrbe'), pin = pr(t, 2.34, 0.16, E.cubicOut), po = pr(t, 2.5, 0.4, E.cubicIn);
      o.style.opacity = t < 2.34 ? 0 : pin * (1 - po); o.style.transform = \`translate(\${P[0]}px, \${P[1]}px) scale(\${L(0.3, 1.2, pin) * L(1, 2.6, po)})\`; }
    RAIOS.forEach((r, i) => { const a = i / RAIOS.length * Math.PI * 2 + 0.2, p = pr(t, 2.48, 0.55, E.cubicOut), d = L(14, 150, p);
      r.style.opacity = t < 2.48 || t > 3.1 ? 0 : (1 - p);
      r.style.transform = \`translate(\${P[0] + Math.cos(a) * d}px, \${P[1] + Math.sin(a) * d}px) rotate(\${a * 180 / Math.PI + 90}deg) scaleY(\${L(0.4, 1.4, p)})\`; });
    // o criativo pronto nasce da luz, girando para a frente
    { const k = $('#abCard'), sp = M.prog(t, 2.48, 0.9, E.spring), rot = E.cubicOut(C((t - 2.48) / 0.75));
      k.style.opacity = t < 2.48 ? 0 : pr(t, 2.48, 0.12, E.linear);
      k.style.transform = \`translate(\${P[0]}px, \${P[1] + 34}px) perspective(700px) rotateY(\${L(65, 0, rot)}deg) rotateZ(\${L(-8, 0, rot)}deg) scale(\${L(0.2, 1, sp)})\`;
      k.style.filter = t < 2.75 ? \`blur(\${(1 - C((t - 2.48) / 0.27)) * 6}px)\` : 'none'; }
    { const e = $('#abSelo'), sp = M.prog(t, 2.98, 0.7, E.spring); e.style.opacity = t < 2.98 ? 0 : pr(t, 2.98, 0.12, E.linear);
      e.style.transform = \`translate(\${P[0]}px, \${P[1] + 34 + 151 + 28}px) translate(-50%, -50%) scale(\${L(0.5, 1, sp)})\`; }
  }
  if (t > 1.5 && t < 2.2) cur = [1.6, [960, 1480], $('#abreEnv'), 1.92, 2.08];
`);
// o raio antigo e o vídeo pronto antigo saíram junto com o trecho acima

/* ── JS: cena da frase ── */
corta("  FM.linha('l1', t,", '\n  /* 7 ─', `  FM.linha('l1', t, [18.64, 18.96, 19.06], 21.05);
  FM.linha('l2', t, [19.40, 19.56, 19.84], 21.05);
  $('#risco').style.transform = \`scaleX(\${pr(t, 20.45, 0.45, E.cubicInOut)})\`;
  FM.linha('l3', t, [21.18, 21.54, 21.88], 22.3);
  FM.linha('l4', t, [22.02], 22.3, { extra: \` scale(\${1 + 0.05 * Math.exp(-(t - 22.02) * 5) * Math.sin((t - 22.02) * 20)})\` });
  // o cartão do tempo: entra embaixo, sobe e cresce quando o tempo começa a correr
  { const sob = E.cubicInOut(C((t - 20.95) / 0.5));
    FM.anim($('#tempo'), t, 19.84, 22.3, { de: 0.85, y: L(0, 60, sob) + Math.sin(t * 1.3) * 6, esc: L(1, 1.12, sob), dout: 0.15 }); }
  { const p = pr(t, 21.3, 0.8, E.cubicInOut), vel = Math.sin(Math.PI * C((t - 21.3) / 0.8));
    $('#timerTxt').textContent = hhmmss(L(4 * 3600, 180, p));
    $('#timerTxt').style.color = p > 0.98 ? '#7FA4FF' : '#F1F2F5';
    $('#timerTxt').style.filter = vel > 0.05 ? \`blur(\${vel * 3.5}px)\` : 'none';
    $('#timerTxt').style.transform = \`translateY(\${vel * 6}px)\`;
    $('#tempoBar').style.transform = \`scaleX(\${L(0.03, 1, p)})\`;
    $('#tempoStTxt').textContent = t < 21.3 ? 'manual' : p < 0.98 ? 'com o agente…' : 'pronto ✓';
    const tranco = t > 22.1 ? Math.exp(-(t - 22.1) * 6) * Math.sin((t - 22.1) * 26) : 0;
    if (t > 22.1) $('#tempo').style.transform += \` rotate(\${-3 * tranco}deg) scale(\${1 + 0.05 * Math.abs(tranco)})\`; }
  if (t > 22.46) { ['#l3', '#l4', '#tempo'].forEach(q => { $(q).style.opacity = 0; }); }
  // "com apenas uma frase": corte para o input, a câmera segue o texto, corta para o botão, clique e mergulha
  {
    const vis = t >= 22.45 && t < 24.32, c = vis ? fraseCam(t) : null, c0 = vis ? fraseCam(t - 1 / 30) : null;
    if (vis) aplicaCam($('#frFx'), $('#frCam'), 'mbF', c, c0, pr(t, 22.45, 0.04, E.linear) * (1 - pr(t, 24.22, 0.08, E.linear)));
    else $('#frFx').style.opacity = 0;
    digita($('#fraseTxt'), FRASE, t, 22.55, 23.28);
    const k = Math.sin(C((t - 23.56) / 0.22) * Math.PI), g = Math.sin(C((t - 23.6) / 0.6) * Math.PI);
    $('#fraseEnv').style.transform = \`scale(\${1 - 0.14 * k})\`;
    $('#fraseEnv').style.boxShadow = g > 0 ? \`0 0 0 \${4 * g}px rgba(45,107,255,.25), 0 0 \${16 * g}px \${4 * g}px rgba(45,107,255,.4)\` : '';
  }
  if (t > 23.3 && t < 24.0) cur = [23.34, [960, 1480], $('#fraseEnv'), 23.6, 23.86];
`);
rep('{ t0: 22.48, ps: FM.criaConfete(7, 80, 540, 900, 760, 260) }', '{ t0: 22.1, ps: FM.criaConfete(7, 80, 540, 1060, 860, 300) }');
rep("  if (!LARG) LARG = medeLarg();", "  if (!LARG) LARG = medeLarg($('#abreTxt'), PEDIDO);");
fs.writeFileSync('studio.html', s); console.log('ok');
