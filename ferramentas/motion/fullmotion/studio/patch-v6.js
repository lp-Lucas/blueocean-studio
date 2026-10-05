// ajuste v6: a cena "uma tarde inteira → minutos → uma frase" (18,5–24,3 s) vira tela do sistema:
// pedido digitado no chat (full motion de 2 min) → envia → chat azul trabalhando + contador da tarefa → "Concluído em 10 min" → close na frase
const fs = require('fs'); let s = fs.readFileSync('studio.html', 'utf8');
fs.writeFileSync('studio-v5.bak.html', s);
const rep = (a, b) => { if (!s.includes(a)) throw new Error('não achei: ' + String(a).slice(0, 90)); s = s.replace(a, b); };
const corta = (ini, fim, novo) => { const a = s.indexOf(ini), b = s.indexOf(fim, a); if (a < 0 || b < 0) throw new Error('trecho: ' + ini.slice(0, 50)); s = s.slice(0, a) + novo + s.slice(b); };

/* ── CSS: painel de chat da cena, com o estado "trabalhando" igual ao app ── */
rep('  .selo1 .v svg { width: 12px; height: 12px; }', `  .selo1 .v svg { width: 12px; height: 12px; }
  /* cena da frase: o chat do editor e o contador da tarefa */
  #frPainel { position: absolute; left: 0; top: 54px; width: 390px; height: 640px; display: flex; flex-direction: column; overflow: hidden; isolation: isolate; }
  #frPainel > :not(canvas) { position: relative; z-index: 1; }
  #frCv { position: absolute; inset: 0; width: 390px; height: 640px; z-index: 0; opacity: 0; border-radius: inherit; }
  #frMsgs { flex: 1; padding: 16px 14px 10px; display: flex; flex-direction: column; gap: 10px; }
  #frPainel .caixa-entrada { position: relative; left: auto; top: auto; }
  #frPainel.trab { border-color: rgba(120, 160, 255, .45); box-shadow: 0 0 40px -6px rgba(45, 107, 255, .55); }
  #frPainel.trab .chat-topo { border-bottom-color: rgba(255, 255, 255, .14); }
  #frPainel.trab .status { color: #fff; }
  #frPainel.trab .msg-u { background: #fff; color: #0B2BB0; box-shadow: 0 6px 18px rgba(0, 10, 60, .35); }
  #frPainel.trab .msg-c { color: #fff; }
  #frPainel.trab .passo { background: rgba(4, 18, 90, .5); border-color: rgba(255, 255, 255, .16); }
  #frPainel.trab .passo.rodando { border-color: rgba(255, 255, 255, .55); box-shadow: 0 0 0 3px rgba(255, 255, 255, .12); }
  #frPainel.trab .passo .tit b { color: #fff; }
  #frPainel.trab .passo .tit span, #frPainel.trab .contexto-chat { color: rgba(225, 233, 255, .75); }
  #frPainel.trab .passo .ico { background: rgba(255, 255, 255, .14); color: #fff; }
  #frPainel.trab .spin { border-color: rgba(255, 255, 255, .25); border-top-color: #fff; }
  #frPainel.trab .caixa-entrada, #frPainel.trab .chip, #frPainel.trab .anexo { background: rgba(4, 18, 90, .45); border-color: rgba(255, 255, 255, .22); color: #fff; }
  #frPainel.trab .chip i, #frPainel.trab .icone-btn { color: #fff; }
  #frPainel.trab .etiqueta { color: #fff; background: rgba(255, 255, 255, .12); border-color: rgba(255, 255, 255, .2); }
  #frTar { position: absolute; left: 30px; top: 0; width: 330px; min-width: 0; opacity: 0; }
  #frTar .l { display: flex; align-items: center; gap: 8px; width: 100%; white-space: nowrap; }
  #frTar .l b { font-weight: 600; color: #F1F2F5; }
  #frTar .l .tm { margin-left: auto; font-variant-numeric: tabular-nums; color: #A6AAB4; }
  #frTar .ok2 { width: 16px; height: 16px; border-radius: 50%; background: #2EF2D0; display: none; place-items: center; }
  #frTar .ok2 svg { width: 10px; height: 10px; }
  #frTar.feito { border-color: rgba(82, 135, 255, .6); box-shadow: 0 0 30px rgba(45, 107, 255, .35); }
  #frTar.feito .ok2 { display: grid; }
  #frTar.feito .tm { color: #7FA4FF; font-weight: 600; }
  #frMsgU { position: relative; }
  #frMsgU .gl { inset: -5px; border-radius: 20px; }`);

/* ── HTML: o set da frase vira o chat inteiro + o contador da tarefa ── */
corta('<div id="frFx" class="camfx">', '\n\n', `<div id="frFx" class="camfx"><div id="frCam" class="camw ui">
  <div class="tarefa-topo" id="frTar"><span class="l"><span class="ok2"><svg viewBox="0 0 24 24" fill="none" stroke="#062B26" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5 L10 17 L19 7"/></svg></span><b id="frTarTit">Full motion · 2:00</b><span id="frTarSt">gerando</span><span class="tm" id="frTarTm">0:00</span></span><span class="barrinha"><b id="frTarBar"></b></span></div>
  <aside id="frPainel" class="painel"><canvas id="frCv" width="780" height="1280"></canvas>
    <div class="chat-topo"><div class="chat-id"><b>Agente Editor</b><span class="status" id="frStatus"></span></div><div class="chat-topo-acoes"><span class="etiqueta">opus-5-5</span><button class="icone-btn"><i data-i="newchat"></i></button></div></div>
    <div id="frMsgs">
      <div class="msg-u" id="frMsgU" style="display:none">Faz um full motion de 2 minutos com essa narração<div class="gl"></div></div>
      <div class="passo" id="frP1" style="display:none"><div class="cab"><div class="ico"><i data-i="file"></i></div><div class="tit"><b>Lendo a receita</b><span>receitas/11-full-motion.md</span></div><div class="est"><span class="spin"></span><i data-i="check"></i></div></div></div>
      <div class="passo" id="frP2" style="display:none"><div class="cab"><div class="ico"><i data-i="sparkle"></i></div><div class="tit"><b>Animando as cenas</b><span>fullmotion/narracao.html</span></div><div class="est"><span class="spin"></span><i data-i="check"></i></div></div></div>
      <div class="passo" id="frP3" style="display:none"><div class="cab"><div class="ico"><i data-i="export"></i></div><div class="tit"><b>Exportando</b><span>full-motion-2min.mp4</span></div><div class="est"><span class="spin"></span><i data-i="check"></i></div></div></div>
      <div class="msg-c" id="frResp" style="display:none"></div>
    </div>
    <div class="chat-rodape">
      <div class="anexos" id="frAnexos"><span class="anexo"><i data-i="paperclip"></i>m1 · narração.mp3</span></div>
      <div class="caixa-entrada" id="frCaixa"><div id="fraseTxt"></div>
        <div class="entrada-acoes"><button class="icone-btn"><i data-i="paperclip"></i></button><button class="enviar" id="fraseEnv"><i data-i="send"></i></button></div></div>
      <div class="contexto-chat"><span>Full motion · narração</span><span>agulha 0.0s</span></div>
    </div>
  </aside>
</div></div>`);

/* ── JS: texto, bolinhas genéricas e a câmera nova da cena ── */
rep("const FRASE = 'Monta 3 reels desse podcast no padrão';", "const FRASE = 'Faz um full motion de 2 minutos';");
rep('function pensaBolinhas(t) {', `const frg = $('#frCv').getContext('2d');
const frgr = (() => { const g = frg.createLinearGradient(0, 0, 390 * 0.4, 640); g.addColorStop(0, '#1B4FF0'); g.addColorStop(0.55, '#0F3AD6'); g.addColorStop(1, '#0A2AA8'); return g; })();
function bolinhasAzuis(g, gr, w, h, t) {
  g.setTransform(2, 0, 0, 2, 0, 0); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let y = -17; y < h + 17; y += 17) for (let x = -17; x < w + 17; x += 17) {
    const a = Math.sin(x * 0.011 + t * 0.7) + Math.sin(y * 0.0085 - t * 0.5) + Math.sin((x - y) * 0.0065 + t * 0.32), v = a / 3;
    const dx = 5.5 * Math.sin(y * 0.021 + t * 1.05 + a * 0.7), dy = 5.5 * Math.cos(x * 0.019 - t * 0.85 + a * 0.7);
    const k = Math.min(NIV - 1, Math.floor(Math.abs(v) * NIV));
    g.fillStyle = v > 0 ? PCLAROS[k] : PESCUROS[k];
    g.beginPath(); g.arc(x + dx, y + dy, 1.15 + Math.abs(v) * 0.75, 0, 6.2832); g.fill();
  }
}
function pensaBolinhas(t) {`);
// posição de um elemento dentro do set (px do set, sem a câmera)
corta('/* câmera da frase:', '\n}\n', `/* posição de um elemento dentro do set (sem a câmera) */
const noSet = (el, set) => { let x = 0, y = 0; while (el && el !== set) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; } return [x, y]; };
/* câmera da cena da frase: chat inteiro → corte → close no texto → corte → botão, clique → abre no contador da tarefa → fecha na frase enviada */
function fraseCam(t) {
  const set = $('#frCam'), cx = $('#frCaixa'), [ix, iy] = noSet(cx, set), W = cx.offsetWidth, H = cx.offsetHeight;
  const car = ix + caretEm(LARG2, FRASE, t, 19.05, 20.3), bot = ix + W - 22, yc = iy + H / 2;
  const mu = $('#frMsgU'), [mx, my] = noSet(mu, set), mc = [mx + mu.offsetWidth / 2, my + mu.offsetHeight / 2];
  if (t < 19.0) { const p = C((t - 18.45) / 0.55);   // o chat inteiro, câmera descendo até o input
    return { fx: 195 + L(-20, 15, p) + 90 * E.cubicIn(C((t - 18.9) / 0.1)) / 1.9, fy: L(330, 520, E.cubicInOut(p)), S: L(1.75, 2.05, E.cubicOut(p)), bx: pulso(t, 18.47, 26) + pulso(t, 19.0) }; }
  if (t < 20.45) { const p = C((t - 19.0) / 1.45), S = L(4.0, 4.35, p);   // close: o cursor do texto parado, o texto corre
    return { fx: Math.max(ix + 80, car - 70 / S) - 90 * (1 - E.cubicOut(C((t - 19.0) / 0.14))) / S + 90 * E.cubicIn(C((t - 20.35) / 0.1)) / S, fy: yc + Math.sin(t * 2.4) * 1.2, S, bx: pulso(t, 19.0) + pulso(t, 20.45) }; }
  if (t < 21.12) { const p = C((t - 20.45) / 0.67);   // botão de enviar; empurra no clique
    return { fx: bot - 90 * (1 - E.cubicOut(C((t - 20.45) / 0.16))) / 4.2, fy: yc, S: L(4.0, 4.3, p) + 0.7 * E.cubicOut(C((t - 20.95) / 0.12)), bx: pulso(t, 20.45) }; }
  if (t < 22.45) { const q = E.cubicInOut(C((t - 21.12) / 0.5)), p = C((t - 21.12) / 1.33);   // abre: contador da tarefa em cima, chat trabalhando embaixo
    return { fx: L(bot, 195, q), fy: L(yc, 175, q), S: L(5.0, 2.45, q) + 0.15 * p + 0.25 * E.cubicOut(C((t - 22.02) / 0.3)) * (1 - C((t - 22.3) / 0.2)) };
  }
  if (t < 24.08) { const q = E.cubicInOut(C((t - 22.45) / 0.6)), p = C((t - 22.45) / 1.63);   // fecha na frase enviada: uma frase só
    return { fx: L(195, mc[0], q), fy: L(175, mc[1], q), S: L(2.7, 3.7, q) + 0.25 * p };
  }
  const w = E.cubicIn(C((t - 24.08) / 0.22));
  return { fx: mc[0], fy: mc[1], S: 3.95 * L(1, 4, w) };
}`);

/* ── JS: a cena (substitui a anterior) ── */
corta("  FM.linha('l1', t,", '\n  /* 7 ─', `  // pedido no chat → envia → o agente trabalha (chat azul, passos) → contador da tarefa → "Concluído em 10 min" → close na frase
  {
    const vis = t >= 18.45 && t < 24.32, c = vis ? fraseCam(t) : null, c0 = vis ? fraseCam(t - 1 / 30) : null;
    if (vis) aplicaCam($('#frFx'), $('#frCam'), 'mbF', c, c0, pr(t, 18.45, 0.05, E.linear) * (1 - pr(t, 24.22, 0.08, E.linear)));
    else $('#frFx').style.opacity = 0;
    digita($('#fraseTxt'), FRASE, t, 19.05, 20.3);
    if (t > 21.0) $('#fraseTxt').innerHTML = '<span class="ph">Descreva a edição</span>';
    $('#frAnexos').style.display = t > 21.0 ? 'none' : '';
    { const k = Math.sin(C((t - 20.9) / 0.22) * Math.PI); $('#fraseEnv').style.transform = \`scale(\${1 - 0.14 * k})\`; $('#fraseEnv').style.filter = k > 0 ? \`brightness(\${1 + k * 0.5})\` : ''; }
    // a mensagem entra no chat
    const mu = $('#frMsgU'); mu.style.display = t >= 21.0 ? '' : 'none';
    if (t >= 21.0) parte(mu, t, 21.0, null, { dx: 30, dy: 14, din: 0.5 });
    brilho(mu.querySelector('.gl'), t, 22.7, 1.3);
    // chat azul enquanto trabalha (do envio até concluir)
    const trab = t >= 21.02 && t < 22.1, op = t < 21.0 || t > 22.7 ? 0 : pr(t, 21.0, 0.35, E.cubicOut) * (1 - pr(t, 22.08, 0.5, E.cubicIn));
    $('#frPainel').classList.toggle('trab', trab); $('#frCv').style.opacity = op; if (op > 0) bolinhasAzuis(frg, frgr, 390, 640, t);
    $('#frStatus').textContent = trab ? 'trabalhando' : '';
    [[21.3, 21.58], [21.58, 21.84], [21.84, 22.02]].forEach(([a, b], i) => { const ps = $('#frP' + (i + 1)); ps.style.display = t >= a ? '' : 'none';
      if (t >= a) { parte(ps, t, a, null, { dy: 12, desf: 6, din: 0.35 }); ps.classList.toggle('rodando', t < b); ps.classList.toggle('feito', t >= b);
        ps.querySelector('.spin').style.transform = \`rotate(\${t * 720}deg)\`; } });
    { const r = $('#frResp'), txt = 'Pronto! Full motion de 2:00 exportado em 10 min.'; r.style.display = t >= 22.05 ? '' : 'none';
      if (t >= 22.05) r.textContent = txt.slice(0, Math.round(C((t - 22.05) / 0.45) * txt.length)); }
    // o contador da tarefa no topo: corre até 10:00 e conclui
    { const tar = $('#frTar'), p = pr(t, 21.2, 0.82, E.cubicInOut), vel = Math.sin(Math.PI * C((t - 21.2) / 0.82)), feito = t >= 22.02;
      if (t < 21.1) tar.style.opacity = 0; else parte(tar, t, 21.1, null, { dy: -16, s0: 0.85, din: 0.5 });
      if (feito) { const tr = Math.exp(-(t - 22.02) * 6) * Math.sin((t - 22.02) * 26); tar.style.transform += \` scale(\${1 + 0.06 * Math.abs(tr)}) rotate(\${-2 * tr}deg)\`; }
      tar.classList.toggle('feito', feito);
      $('#frTarTit').textContent = feito ? 'Concluído em 10 min' : 'Full motion · 2:00';
      $('#frTarSt').textContent = feito ? '' : 'gerando';
      const seg = Math.round(L(0, 600, p)); $('#frTarTm').textContent = feito ? '10:00' : \`\${Math.floor(seg / 60)}:\${String(seg % 60).padStart(2, '0')}\`;
      $('#frTarTm').style.filter = vel > 0.05 && !feito ? \`blur(\${vel * 0.8}px)\` : 'none';
      $('#frTarBar').style.width = (feito ? 100 : L(3, 100, p)) + '%'; }
  }
  if (t > 20.2 && t < 21.3) cur = [20.5, [960, 1480], $('#fraseEnv'), 20.95, 21.2];
`);
// confete no "minutos", saindo do contador da tarefa (fica na tela)
rep('{ t0: 22.1, ps: FM.criaConfete(7, 80, 540, 1060, 860, 300) }', '{ t0: 22.03, ps: FM.criaConfete(7, 80, 540, 520, 820, 110) }');
fs.writeFileSync('studio.html', s); console.log('ok');
