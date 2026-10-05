/* ── câmera: [t, foco x, foco y (no app), escala, y na tela, inclinação x, inclinação y]
   Regra (v2, pedido da pessoa: "muito rápido, não dá pra entender"): a câmera CHEGA antes da ação, FICA (par de pontos
   quase iguais = parada com deriva leve) enquanto a ação acontece e só depois anda — cada movimento 0,5–1 s, suave. ── */
const CAM = [
  [-0.4, 1128, 455, 1.6, 900, 12, -8],
  [2.30, 1142, 442, 1.9, 900, 6, -4],      // "Boa noite, dono de agência" (empurra devagar)
  [3.25, 235, 225, 1.8, 900, 4, 7],        // chega no trilho
  [4.35, 245, 250, 1.85, 900, 3, 5],       // fica: clica Especialistas e Copy
  [5.30, 900, 320, 1.7, 900, 4, -3],       // seletor de cliente
  [6.90, 885, 370, 1.8, 900, 3, 2],        // fica: lista abre, escolhe Akifretes
  [7.50, 1300, 390, 1.6, 900, 3, -3],      // selo do cliente + Continuar + contadores
  [9.10, 1305, 405, 1.6, 900, 2, -2],      // fica: contadores sobem
  [9.75, 1115, 330, 1.15, 900, 4, 3],      // fonte: o card inteiro
  [11.60, 1120, 340, 1.18, 900, 2, -2],    // fica: upload e texto
  [12.35, 1385, 290, 2.0, 900, 3, -4],     // até o Gerar
  [12.95, 1390, 290, 2.05, 900, 2, -3],    // fica: clique
  [13.60, 1100, 290, 1.45, 900, 5, 3],     // gerando: status + botão
  [14.85, 1105, 295, 1.5, 900, 4, 2],      // fica
  [15.55, 1115, 560, 1.12, 960, 5, 3],     // o lote inteiro
  [16.90, 1112, 560, 1.15, 960, 3, -2],    // fica: as três peças chegam
  [17.45, 1022, 490, 1.85, 900, 3, -4],    // contexto real: peça 1
  [18.30, 1025, 495, 1.87, 900, 2, -3],    // fica
  [18.85, 1040, 650, 1.8, 900, 2, 3],      // peças 2 e 3
  [19.95, 1042, 655, 1.82, 900, 2, 2],     // fica
  [20.75, 1000, 410, 1.9, 900, 3, 4],      // peça 1 + Ajustar com IA
  [22.25, 1000, 402, 1.95, 900, 2, 2],     // fica: 👎
  [22.60, 965, 362, 2.2, 900, 2, -1],      // campo do ajuste
  [23.45, 1050, 362, 2.2, 900, 2, -2],     // acompanha a digitação
  [24.00, 1150, 430, 1.45, 900, 2, -2],    // campo + botão + headline no mesmo quadro
  [25.35, 1152, 432, 1.47, 900, 2, -1],    // fica: clique e headline reescrita
  [26.00, 1110, 560, 1.12, 960, 4, 3],     // só ela mudou
  [26.35, 1112, 555, 1.13, 960, 3, 2],
  [26.90, 1150, 280, 1.4, 860, 5, -3],     // lote salvo
  [27.05, 1150, 282, 1.42, 860, 4, -2],
  [27.75, 250, 150, 2.05, 900, 3, 6],      // as peças voam junto até o Designer
  [29.00, 255, 160, 2.15, 900, 2, 3],      // fica: Designer e Editor recebem
];
const CLIQUES = [3.55, 4.25, 5.95, 6.75, 7.55, 9.05, 11.55, 12.85, 21.9, 22.5, 24.05];
const MERGULHO = 29.05;
function camera(t) {
  const n = CAM.length; let c;
  if (t <= CAM[0][0]) c = CAM[0].slice(1); else if (t >= CAM[n - 1][0]) c = CAM[n - 1].slice(1);
  else {
    let i = 0; while (CAM[i + 1][0] <= t) i++;
    const P = k => CAM[Math.max(0, Math.min(n - 1, k))], h = CAM[i + 1][0] - CAM[i][0], s = (t - CAM[i][0]) / h;
    const h00 = 2 * s ** 3 - 3 * s ** 2 + 1, h10 = s ** 3 - 2 * s ** 2 + s, h01 = -2 * s ** 3 + 3 * s ** 2, h11 = s ** 3 - s ** 2;
    c = [1, 2, 3, 4, 5, 6].map(j => {
      const v = k => j === 3 ? Math.log(P(k)[j]) : P(k)[j];
      // tangente monotônica (Fritsch–Carlson): a câmera não passa do alvo
      const sec = k => (v(k + 1) - v(k)) / (P(k + 1)[0] - P(k)[0]);
      const tg = k => { if (k <= 0 || k >= n - 1) return 0; const a = sec(k - 1), b = sec(k); return a * b <= 0 ? 0 : 2 / (1 / a + 1 / b); };
      const r = h00 * v(i) + h10 * h * tg(i) + h01 * v(i + 1) + h11 * h * tg(i + 1);
      return j === 3 ? Math.exp(r) : r;
    });
  }
  let [fx, fy, S, sy, rx, ry] = c;
  fx += Math.sin(t * 0.9) * 3; fy += Math.cos(t * 0.7) * 2.5;   // deriva lenta (vida nas paradas)
  for (const tc of CLIQUES) S *= 1 + 0.03 * Math.sin(C((t - tc) / 0.4) * Math.PI);   // empurra leve no clique
  if (t > MERGULHO) S *= L(1, 4.2, E.cubicIn(C((t - MERGULHO) / 0.26)));   // mergulho no fim
  return { fx, fy, S, sy, rx, ry };
}
function aplicaCam(t) {
  const c = camera(t), c0 = camera(t - 1 / 30);
  $('#mundo').style.transform = `translate(540px, ${c.sy}px) perspective(1700px) rotateX(${c.rx}deg) rotateY(${c.ry}deg) scale(${c.S}) translate(${-c.fx}px, ${-c.fy}px)`;
  const dx = (c0.fx - c.fx) * c.S, dy = (c0.fy - c.fy) * c.S, dz = Math.abs(Math.log(c.S / c0.S)) * 260;
  const bx = Math.min(1.0, Math.abs(dx) * 0.03 + dz * 0.02), by = Math.min(1.0, Math.abs(dy) * 0.03 + dz * 0.02) + (t > MERGULHO ? 8 * C((t - MERGULHO) / 0.26) : 0);
  $('#mbg').setAttribute('stdDeviation', `${bx.toFixed(2)} ${by.toFixed(2)}`);
  $('#camfx').style.filter = bx + by > 0.6 ? 'url(#mb)' : 'none';
}

/* ── cursor: grupos de movimentos [sai, chega, alvo, clique] ── */
const CURSOR = [
  { ini: 2.9, fim: 4.45, de: [1000, 1500], segs: [[2.95, 3.45, '#riEsp', 3.55], [3.7, 4.15, '#itCopy', 4.25]] },
  { ini: 5.3, fim: 9.3, de: [1000, 1650], segs: [[5.35, 5.85, '#sel', 5.95], [6.2, 6.65, '#opAki', 6.75], [6.95, 7.45, '#c0', 7.55], [8.75, 9.0, '#c1', 9.05]] },
  { ini: 11.05, fim: 13.2, de: [1000, 1650], segs: [[11.1, 11.45, '#c2', 11.55], [12.15, 12.7, '#btGerar', 12.85]] },
  { ini: 20.9, fim: 24.4, de: [880, 1650], segs: [[20.95, 21.7, '#p0down', 21.9], [22.05, 22.4, '#ajIn', 22.5], [23.5, 23.95, '#btAj', 24.05]] },
];
function cursor(t) {
  const el = $('#cursor'), g = CURSOR.find(g => t >= g.ini && t < g.fim + 0.5);
  if (!g) { el.style.opacity = 0; return; }
  let pos = g.de, clk = 0;
  for (let i = 0; i < g.segs.length; i++) {
    const [a, b, alvo, tc] = g.segs[i]; if (t < a) break;
    const de = i ? centro($(g.segs[i - 1][2])) : g.de, para = centro($(alvo));
    if (g.segs[i - 1]?.[2] === '#ajIn') de[0] += 170;
    if (alvo === '#ajIn') para[0] += 170;
    pos = [L(de[0], para[0], E.cubicInOut(C((t - a) / (b - a)))), L(de[1], para[1], E.cubicInOut(C((t - a) / (b - a))))];
    clk = Math.max(clk, Math.sin(C((t - tc) / 0.22) * Math.PI));
  }
  const ps = pr(t, g.fim, 0.5, E.cubicIn);
  el.style.opacity = pr(t, g.ini, 0.15, E.linear) * (1 - ps);
  el.style.left = (pos[0] + ps * 260) + 'px'; el.style.top = (pos[1] + ps * 300) + 'px';
  el.style.transform = `translate(-20%,-10%) scale(${1 - 0.16 * clk})`;
  el.style.filter = 'drop-shadow(0 6px 10px rgba(0,0,0,.45))';
}

FM.iniciar({ grupos: GRUPOS, legendaFixa: true, legendaSoSemTexto: true, estouros: [] });

/* tempos das ações (segundos do vídeo, já com os respiros da narração — ver respiros.json) */
const T = {
  esp: 3.55, copy: 4.25, pagina: 4.35, sel: 5.95, aki: 6.75, chip: 7.3, c0: 7.55, pecas: 7.6,
  cont: [8.0, 8.35, 8.7], c1: 9.05, fonte: 9.1, arq: 9.55, pousa: 9.9, ok: 10.6, ref: [10.7, 11.35], c2: 11.55, geracao: 11.6,
  gerar: 12.85, status: [13.0, 13.6, 14.2], revisar: 15.0, peca: 0.45, salvo: 16.5, mk: [17.5, 18.0, 18.9, 19.4], apaga: 20.4,
  down: 21.9, campo: 22.5, dig: [22.6, 23.45], ajuste: 24.05, nova: [24.3, 25.1], ajustada: 25.25, escurece: [25.3, 26.1],
  lote: 26.4, voaD: 27.25, des: 27.83, voaE: 28.08, edi: 28.64, sai: 29.15, logo: 29.25,
  fim1: [29.69, 30.39, 30.6], fim2: [31.1, 31.52, 31.78], brilho: 31.6,
};

/* ── quadro ── */
window.quadro = async function (t) {
  FM.antes(t);
  bolinhas(t);
  const mundo = $('#mundo');
  mundo.style.opacity = t > T.sai + 0.2 ? 0 : 1 - pr(t, T.sai, 0.16, E.cubicIn);
  if (t <= T.sai + 0.2) aplicaCam(t); else $('#camfx').style.filter = 'none';

  /* 1 ─ home: "Boa noite, dono de agência" → trilho → Especialistas → Copy */
  { const s = $('#saud'), p = pr(t, -0.35, 0.8), sai = pr(t, T.copy, 0.3, E.cubicIn);
    s.style.opacity = C((t + 0.35) / 0.3) * (1 - sai);
    s.style.transform = `translate(-50%,-50%) translateY(${(1 - p) * 26 - sai * 20}px) scale(${L(0.94, 1, p)})`;
    s.style.filter = (1 - p) * 10 + sai * 12 > 0.3 ? `blur(${(1 - p) * 10 + sai * 12}px)` : 'none';
    const o = s.querySelector('img'), po = M.prog(t, -0.2, 0.9, E.spring); o.style.transform = `rotate(${L(-25, 0, po)}deg) scale(${L(0.4, 1, po)})`; }
  parte($('#homeIn'), t, -0.5, T.copy - 0.05, { dy: 30, dout: 0.3 });
  { const k = E.cubicInOut(C((t - T.esp) / 0.3)); $('#railAt').style.top = L(95, 138, k) + 'px'; }
  aperta($('#riEsp'), t, T.esp, 0.15);
  { const sw = E.cubicInOut(C((t - T.esp - 0.05) / 0.4)), x = L(345, 320, sw);
    $('#divisa').style.left = x + 'px'; $('#grade').style.left = (x + 1) + 'px'; $('#grade').style.width = (1909 - x - 1) + 'px'; }
  parte($('#ladoH'), t, -1, T.esp + 0.03, { dout: 0.25, ox: -30 });
  parte($('#ladoE'), t, T.esp + 0.1, null, { dx: -26, din: 0.6 });
  [...$('#ladoE').querySelectorAll('.item, .rot')].forEach((el, i) => parte(el, t, T.esp + 0.1 + i * 0.04, null, { dx: -18, din: 0.5, desf: 6 }));
  const copyOn = t >= T.copy;
  $('#itCopy').classList.toggle('on', copyOn); $('#barCopy').style.opacity = copyOn ? 1 : 0; aperta($('#itCopy'), t, T.copy, 0.05);

  /* 2 ─ a página do agente se monta */
  parte($('#hdr'), t, T.pagina, null, { dy: -24 });
  parte($('#abas'), t, T.pagina + 0.1, null, { dy: -16 });
  parte($('#passos'), t, T.pagina + 0.2, null, { dy: 20, s0: 0.97 });
  // passos: pílula azul desliza para a etapa ativa; concluídos ficam verde-água
  const MUD = [[-9, 0], [T.pecas, 1], [T.fonte, 2], [T.geracao, 4], [T.revisar, 5], [T.lote, 6]];
  const FEITO = [[0, T.pecas], [1, T.fonte], [2, T.geracao], [4, T.revisar], [5, T.lote]];
  { let a0 = 0, a1 = 0, tc = -9; for (const [tt, i] of MUD) if (t >= tt) { a0 = a1; a1 = i; tc = tt; }
    const p = M.prog(t, tc, 0.6, E.spring);
    $('#stPill').style.left = L(STX[a0], STX[a1], p) + 'px';
    const feito = i => FEITO.some(([k, tt]) => k === i && t >= tt);
    STN.forEach((_, i) => { const e = $('#st' + i); e.classList.toggle('on', i === a1); e.classList.toggle('ok', feito(i) && i !== a1);
      e.classList.toggle('dim', i >= 5 && i > a1 && !feito(i)); });
    FEITO.forEach(([k, tt]) => { const i = $('#st' + k + ' i'); const q = M.prog(t, tt, 0.6, E.spring); i.style.transform = t >= tt ? `scale(${L(0.4, 1, q)})` : ''; }); }

  // etapa 1: cliente
  etapa($('#s0'), t, T.pagina + 0.3, T.pecas);
  aperta($('#sel'), t, T.sel, 0.04);
  { const dd = $('#dd'), p = pr(t, T.sel + 0.05, 0.35), q = pr(t, T.aki + 0.05, 0.15, E.cubicIn);
    dd.style.opacity = t < T.sel + 0.05 ? 0 : p * (1 - q); dd.style.transform = `translateY(${(1 - p) * -8}px) scale(${L(0.97, 1, p)})`; dd.style.transformOrigin = '50% 0';
    const alvo = CLIENTES.indexOf('Akifretes'), hl = E.cubicInOut(C((t - 6.2) / 0.45)) * alvo;
    $('#ddHl').style.top = (5 + hl * 32) + 'px'; $('#ddHl').style.opacity = t < 6.2 ? 0.35 : 1;
    [...dd.children].slice(1).forEach((o, i) => { const pp = pr(t, T.sel + 0.07 + i * 0.04, 0.35); o.style.opacity = pp; o.style.transform = `translateY(${(1 - pp) * -6}px)`; }); }
  $('#selTx').textContent = t >= T.aki ? 'Akifretes' : '— escolha o cliente —';
  { const ok = t >= T.aki; $('#c0').className = 'bt fx ' + (ok ? 'br' : 'cz'); $('#c0M').style.opacity = ok ? 0 : 1; aperta($('#c0'), t, T.c0, 0.08); }
  if (t < T.chip) $('#chipCli').style.opacity = 0; else pop($('#chipCli'), t, T.chip, 0.4);

  // etapa 2: peças — os contadores sobem (MOFU 2, BOFU 1), um de cada vez
  etapa($('#s1'), t, T.pecas, T.fonte);
  rola($('#vMofu'), t, [[T.cont[0], 1], [T.cont[1], 2]]); rola($('#vBofu'), t, [[T.cont[2], 1]]);
  { const n = T.cont.filter(x => t >= x).length; $('#tot').textContent = n; $('#tot2').textContent = n; }
  [['#vMofu', T.cont.slice(0, 2)], ['#vBofu', [T.cont[2]]]].forEach(([id, ts]) => { const b = $(id).nextElementSibling; const k = Math.max(0, ...ts.map(tc => Math.sin(C((t - tc + 0.06) / 0.24) * Math.PI)));
    b.style.background = k > 0 ? `rgba(0,60,255,${0.9 * k})` : ''; b.style.borderColor = k > 0 ? '#003CFF' : ''; b.style.color = k > 0 ? '#fff' : ''; b.style.transform = `scale(${1 - 0.12 * k})`; });
  aperta($('#c1'), t, T.c1, 0.08);

  // etapa 3: fonte — o anúncio que já vendeu bem cai na área de upload
  etapa($('#s2'), t, T.fonte, T.geracao);
  { const a = $('#arq'), p = pr(t, T.arq, T.pousa - T.arq, E.cubicIn), some = pr(t, T.pousa, 0.12, E.linear);
    a.style.opacity = t < T.arq ? 0 : C((t - T.arq) / 0.08) * (1 - some);
    a.style.transform = `translate(${L(260, 0, p)}px, ${L(-120, 79, p)}px) rotate(${L(14, -4, p)}deg) scale(${L(1.15, 0.6, p)})`;
    const dz = $('#dz'), hov = t >= T.pousa - 0.2 && t < T.pousa + 0.2; dz.style.borderColor = hov ? '#2D6BFF' : t >= T.pousa + 0.2 ? 'rgba(0,222,185,.45)' : '';
    dz.style.borderStyle = t >= T.pousa ? 'solid' : 'dashed'; dz.style.background = hov ? 'rgba(45,107,255,.10)' : '';
    $('#dzVazio').style.opacity = t < T.pousa ? 1 : 0;
    parte($('#dzArq'), t, T.pousa, null, { dy: 6, din: 0.4, desf: 6 });
    $('#dzBar').style.width = (pr(t, T.pousa + 0.02, T.ok - T.pousa - 0.08, E.cubicInOut) * 100) + '%'; $('#dzBar').parentElement.style.opacity = 1 - pr(t, T.ok - 0.04, 0.15);
    pop($('#dzOk'), t, T.ok, 0.5); }
  aperta($('#c2'), t, T.c2, 0.08);
  { const REF = '“Seu caminhão não precisa voltar vazio. Na Akifretes você acha carga de retorno perto de você, sem mensalidade.” — anúncio Meta, CTR 3,8%';
    const r = $('#refTx'); if (t < T.ref[0]) { r.textContent = 'Ou cole aqui uma copy já pronta/validada pra IA usar como base (ex.: um anúncio antigo que performou bem)...'; r.style.color = '#A3A6AE'; }
    else { r.textContent = REF.slice(0, Math.round(C((t - T.ref[0]) / (T.ref[1] - T.ref[0])) * REF.length)); r.style.color = '#E9EAEE'; } }

  // etapa 4: geração — clique em "Gerar lote (3)" no "Gerar"; o agente mostra o que está fazendo
  etapa($('#s3'), t, T.geracao, T.revisar);
  aperta($('#btGerar'), t, T.gerar, 0.08);
  { const ger = t >= T.gerar + 0.07; $('#gIco').style.display = ger ? 'none' : ''; $('#gSpin').style.display = ger ? '' : 'none';
    $('#gTx').textContent = ger ? 'Gerando…' : 'Gerar lote (3)'; $('#gSpin').style.transform = `rotate(${t * 720}deg)`; $('#gSpin2').style.transform = `rotate(${t * 720}deg)`;
    const b = $('#gBrilho'); b.style.opacity = ger ? 1 : 0; b.style.transform = `translateX(${((t - T.gerar) * 200) % 220 - 60}px)`;
    const st = $('#gStatus'); parte(st, t, T.status[0] - 0.05, null, { dx: -12, din: 0.45, desf: 6 });
    const k = T.status.filter(x => t >= x).length - 1, txt = ['Lendo o contexto de Akifretes…', 'Aplicando a Régua V7…', 'Escrevendo 3 peças…'][Math.max(0, k)];
    $('#gStTx').textContent = txt; const q = pr(t, T.status[Math.max(0, k)], 0.3); $('#gStTx').style.opacity = q; $('#gStTx').style.transform = `translateY(${(1 - q) * 6}px)`; }

  // etapa 5: revisar — as três peças chegam uma a uma
  etapa($('#s4'), t, T.revisar, T.lote);
  PECAS.forEach((_, k) => { const a = T.revisar + 0.2 + k * T.peca; parte($('#pc' + k), t, a, null, { dy: 30, s0: 0.96, din: 0.7 });
    [0, 1, 2].forEach(j => { const ln = $(`#ln${k}${j}`), b = a + 0.15 + j * 0.12, p = pr(t, b, 0.55, E.cubicOut);
      ln.style.clipPath = `inset(-4px ${(1 - p) * 100}% -4px 0)`; ln.style.opacity = t < b ? 0 : 1; }); });
  if (t < T.salvo) $('#salvo').style.opacity = 0; else { pop($('#salvo'), t, T.salvo, 0.5); const g = Math.sin(C((t - T.salvo) / 1.0) * Math.PI);
    $('#salvo').style.boxShadow = g > 0 ? `0 0 ${24 * g}px ${4 * g}px rgba(2,213,178,.35)` : ''; }
  // marca-texto no contexto do cliente ("contexto real de quem você atende")
  { const mks = [...$('#s4').querySelectorAll('.mk')], apaga = 1 - pr(t, T.apaga, 0.4, E.cubicIn);
    mks.forEach((m, i) => { m.style.backgroundSize = `${pr(t, T.mk[i], 0.55, E.cubicInOut) * 100}% 70%`; m.style.backgroundImage = `linear-gradient(rgba(0,222,185,${0.3 * apaga}), rgba(0,222,185,${0.3 * apaga}))`; }); }
  // "se uma peça não convenceu": 👎 na peça 1, "encurta a headline", só ela é reescrita
  { const dn = $('#p0down'), on = t >= T.down; aperta(dn, t, T.down, 0.2);
    dn.style.color = on ? '#FF6B6B' : ''; dn.style.borderColor = on ? 'rgba(255,107,107,.5)' : ''; dn.style.background = on ? 'rgba(255,107,107,.12)' : '';
    const sel = t >= T.down && t < T.escurece[1] + 0.3 ? pr(t, T.down, 0.3) * (1 - pr(t, T.escurece[1] - 0.2, 0.3)) : 0;
    $('#pc0').style.borderColor = sel > 0.01 ? `rgba(45,107,255,${0.25 + 0.6 * sel})` : '';
    $('#pc0').style.boxShadow = sel > 0.01 ? `0 0 ${34 * sel}px ${4 * sel}px rgba(45,107,255,.28)` : '';
    const foco = t >= T.campo && t < T.ajuste + 0.05, ajI = $('#ajIn'); ajI.style.borderColor = foco ? '#2D6BFF' : ''; ajI.style.boxShadow = foco ? '0 0 0 3px rgba(45,107,255,.18)' : '';
    if (t < T.campo) $('#ajTx').innerHTML = '<span class="ph">Cirurgia pontual mantendo estrutura, ICP e funil - ex.: encurta as headlines, tom mais direto...</span>';
    else if (t < T.ajuste + 0.05) digita($('#ajTx'), AJUSTE, t, T.dig[0], T.dig[1]);
    else $('#ajTx').innerHTML = `<span style="color:#8E929C">${AJUSTE}</span>`;
    const bA = $('#btAj'), ativo = t >= T.dig[0] + 0.05; bA.className = 'ab bt fx ' + (ativo ? 'br' : 'cz'); aperta(bA, t, T.ajuste, 0.1);
    // a headline velha some, a nova é escrita no lugar; contador de caracteres desce
    const h = $('#h0'), velho = h.querySelector('.velho'), novo = h.querySelector('.novo'), sai = pr(t, T.ajuste + 0.05, 0.25, E.cubicIn);
    velho.style.opacity = 1 - sai; velho.style.filter = sai > 0.01 ? `blur(${sai * 6}px)` : 'none';
    const pn = C((t - T.nova[0]) / (T.nova[1] - T.nova[0]));
    novo.innerHTML = t < T.nova[0] ? '' : NOVA_HEAD.slice(0, Math.round(pn * NOVA_HEAD.length)) + (t < T.nova[1] + 0.3 ? '<span class="car"></span>' : '');
    const old = semTag(PECAS[0][2][0][2]).length;
    $('#h0c').textContent = (t < T.nova[0] ? old : Math.round(L(old, NOVA_HEAD.length, pn))) + 'c';
    $('#h0c').style.color = t >= T.nova[0] && t < T.lote ? '#00DEB9' : '';
    if (t < T.ajustada) $('#p0aj').style.opacity = 0; else pop($('#p0aj'), t, T.ajustada, 0.5);
    const dim = t >= T.escurece[0] && t < T.lote ? pr(t, T.escurece[0], 0.3) * (1 - pr(t, T.escurece[1], 0.3)) : 0;
    [1, 2].forEach(k => { const e = $('#pc' + k); if (t > T.revisar + 1.5) e.style.opacity = 1 - 0.55 * dim; }); }

  // etapa 6: lote salvo — o resto já foi para o designer e para o editor
  etapa($('#s5'), t, T.lote, null);
  if (t >= T.lote + 0.15) { const q = M.prog(t, T.lote + 0.15, 0.6, E.spring); $('#loteOk').style.transform = `scale(${L(0.4, 1, q)}) rotate(${L(-20, 0, q)}deg)`; }
  { const des = $('#itDes'), edi = $('#itEdi');
    const voo = (d, t0, de, para) => { const p = E.cubicInOut(C((t - t0) / 0.5)), arco = Math.sin(p * Math.PI) * -90;
      d.style.opacity = t < t0 || t > t0 + 0.55 ? 0 : C((t - t0) / 0.08) * (1 - pr(t, t0 + 0.36, 0.12, E.linear));
      d.style.left = L(de[0], para[0], p) + 'px'; d.style.top = (L(de[1], para[1], p) + arco) + 'px';
      d.style.transform = `scale(${L(1, 0.15, p)}) rotate(${L(0, -8, p)}deg)`; };
    VOOS.forEach((d, i) => { const g = i < 3 ? 0 : 1, k = i % 3;
      voo(d, (g ? T.voaE : T.voaD) + k * 0.07, [960 + k * 60, 282 + k * 8], g ? [292, 156] : [292, 119]); });
    [[des, T.des], [edi, T.edi]].forEach(([el, tc]) => { const b = $('#' + el.id + 'B'); if (t < tc) { b.style.opacity = 0; el.style.background = ''; el.style.color = ''; el.style.boxShadow = ''; return; }
      pop(b, t, tc, 0.4); const g = Math.exp(-(t - tc) * 2.2); el.style.background = `rgba(45,107,255,${0.12 + 0.35 * g})`; el.style.color = '#fff';
      el.style.boxShadow = `0 0 ${30 * g}px ${4 * g}px rgba(45,107,255,${0.4 * g})`; });
    $('#wDes').style.color = t >= T.des ? '#fff' : ''; $('#wEdi').style.color = t >= T.edi ? '#fff' : ''; }

  /* 7 ─ assinatura: Agente de Copy no Blue OS */
  FM.anim($('#brilho'), t, T.logo - 0.04, null, { de: 0.4, desf: 60, esc: 1 + Math.sin(t * 2) * 0.03, y: -40 });
  FM.anim($('#onda'), t, T.logo, null, { de: 0.3, rot: -14, y: -40 + Math.sin((t - T.logo) * 1.6) * 6, extra: ` scale(${1 + 0.02 * C(t - T.logo - 0.9)})` });
  FM.linha('fim1', t, T.fim1, 99, { extra: ' translateY(-40px)' });
  FM.linha('fim2', t, T.fim2, 99, { extra: ' translateY(-40px)' });
  { const g = Math.sin(C((t - T.brilho) / 0.9) * Math.PI); $('#fim2').querySelector('.tl').style.textShadow = g > 0 ? `0 0 ${50 * g}px rgba(0,222,185,${0.7 * g})` : ''; }

  cursor(t);
  FM.depois(t);
  $('#leg').style.top = '1610px'; $('#leg').style.color = '#fff';
  // a pílula só aparece junto com a primeira palavra do bloco (sem pílula vazia na troca)
  [...$('#leg').children].forEach(d => { if (d.style.opacity !== '0') { const w = d.querySelector('.w'); d.style.opacity = w ? Math.min(1, +w.style.opacity * 1.6) : 1; } });
};
