/* Base Onnira (copiada da FF Tech, receita 15; tela cheia #030303 do site, borda/arco no azul #2D6ABE): transições das telas cheias, cursor, riscos, caneta, marca-texto, confete e legenda —
   copiados do forma.html aprovado. A página define FS, ROSTO, ESTOUROS (cores) e OCULTA antes de chamar NB.iniciar(). */
const { M, E, C, L, $, pr } = FM, A = FM.anim;
const S = (g, cor, w = 2.6) => FM.svg(g, cor, w);
Object.assign(FM.GLIFO, { chev: 'M9 6 L15 12 L9 18', sobe: 'M12 19 V5 M6 11 L12 5 L18 11', desce: 'M12 5 V19 M6 13 L12 19 L18 13',
  relogio: 'M12 3 a9 9 0 1 0 0.01 0 Z M12 7 V12 L15.5 14',
  brilho: 'M11 4 L12.8 9.2 L18 11 L12.8 12.8 L11 18 L9.2 12.8 L4 11 L9.2 9.2 Z M18.5 3 V7 M16.5 5 H20.5', grade: 'M4 4 H10 V10 H4 Z M14 4 H20 V10 H14 Z M4 14 H10 V20 H4 Z M14 14 H20 V20 H14 Z',
  banco: 'M4 6 C4 2.5 20 2.5 20 6 C20 9.5 4 9.5 4 6 Z M4 6 V18 C4 21.5 20 21.5 20 18 V6 M4 12 C4 15.5 20 15.5 20 12', mais: 'M12 5 V19 M5 12 H19',
  mic: 'M12 3 a3 3 0 0 1 3 3 V12 a3 3 0 0 1 -6 0 V6 a3 3 0 0 1 3 -3 Z M5.5 11 a6.5 6.5 0 0 0 13 0 M12 17.5 V21', doc: 'M6 3 H14 L19 8 V21 H6 Z M14 3 V8 H19 M9 13 H16 M9 17 H14' });
for (const c of document.querySelectorAll('.cursor')) c.innerHTML = FM.CURSOR;
FM.iniciar({});

const circulo = (cx, cy, r) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
const retang = (cx, cy, w, h, rr) => { const x = cx - w / 2, y = cy - h / 2; rr = Math.min(rr, w / 2, h / 2);
  return `M${x + rr} ${y} H${x + w - rr} A${rr} ${rr} 0 0 1 ${x + w} ${y + rr} V${y + h - rr} A${rr} ${rr} 0 0 1 ${x + w - rr} ${y + h} H${x + rr} A${rr} ${rr} 0 0 1 ${x} ${y + h - rr} V${y + rr} A${rr} ${rr} 0 0 1 ${x + rr} ${y} Z`; };
const tranco = (t, t0) => { if (t < t0) return ''; const s = t - t0, k = Math.exp(-6 * s) * Math.sin(s * 18); return ` rotate(${-5 * k}deg) scale(${1 + 0.04 * k})`; };
function tela(t) {
  let furo = '', borda = '', vis = false, arcoT = null;
  for (const [TI, TO, circ] of FS) {
    if (t < TI || t > TO + 0.6) continue;
    vis = true;
    if (t < TO) {
      if (circ) { const r = L(1250, 300, pr(t, TI, 0.42, E.expoOut)) * (1 - pr(t, TI + 0.36, 0.3, E.cubicIn));
        if (r > 1) { furo = circulo(ROSTO[0], ROSTO[1], r); if (r < 1100) borda = furo; } }
    } else {
      const p1 = M.prog(t, TO, 0.32, E.spring), p2 = pr(t, TO + 0.2, 0.36, E.cubicInOut);
      const w = L(L(0, 430, p1), 1320, p2), h = L(L(0, 560, p1), 2400, p2);
      furo = retang(ROSTO[0], ROSTO[1], Math.max(1, w), Math.max(1, h), L(70, 0, p2)); if (p2 < 0.97) borda = furo;
      if (t >= TO + 0.02 && t < TO + 0.55) arcoT = (t - TO - 0.02) / 0.5;
      if (t >= TO + 0.56) vis = false;
    }
  }
  $('#tela').style.opacity = vis ? 1 : 0;
  $('#furoP').setAttribute('d', furo); $('#telaBorda').setAttribute('d', borda);
  const ar = $('#telaArco');
  if (arcoT != null) {
    ar.setAttribute('d', 'M 180 1250 C 360 1470, 820 1410, 930 950 C 990 710, 900 510, 760 420');
    const L0 = ar.getTotalLength(), q = E.cubicInOut(C(arcoT)), seg = L0 * 0.45;
    ar.setAttribute('stroke-dasharray', `${seg} ${L0 * 2}`); ar.setAttribute('stroke-dashoffset', L(seg, -L0, q)); ar.style.opacity = 1;
  } else ar.style.opacity = 0;
}
function cursor(el, t, t0, de, para, tc, tsai) {
  if (t < t0 || t > tsai + 0.5) { el.style.opacity = 0; return 0; }
  return FM.cursor(el, t, t0, de, para, tc, tsai);
}
const riscar = (id, cor) => { const r = document.createElement('div'); r.className = 'risca'; if (cor) r.style.background = cor; $('#' + id).appendChild(r);
  return (t, t0) => { r.style.transform = `scaleX(${pr(t, t0, 0.4, E.cubicInOut)})`; }; };
// caneta (traço SVG desenhando), marca-texto (cresce da esquerda), letra à mão (revela da esquerda)
const tinta = (t, id, t0, d) => { const p = $('#' + id), Lp = p._L || (p._L = p.getTotalLength()); p.style.strokeDasharray = Lp; p.style.strokeDashoffset = Lp * (1 - pr(t, t0, d, E.cubicInOut)); };
const marca = (t, id, t0, d) => { $('#' + id).style.backgroundSize = `${pr(t, t0, d, E.cubicInOut) * 100}% 78%`; };
const escreve = (t, id, t0, d) => { $('#' + id).style.clipPath = `inset(-30px calc(${(1 - pr(t, t0, d, E.linear)) * 100}% - 40px) -30px -20px)`; };
const pop = (el, t, t0) => { el.style.opacity = pr(t, t0, 0.25, E.cubicOut); el.style.transform = `scale(${L(0.6, 1, M.prog(t, t0, 0.6, E.spring))})`; };
const brl = v => 'R$ ' + v.toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const cv = $('#confT').getContext('2d');
function confete(t) {
  cv.clearRect(0, 0, 1080, 1920);
  for (const { t0, ps, rgb } of ESTOUROS) for (const q of ps) {
    const s = t - t0 - q.atraso; if (s < 0 || s > q.vida) continue;
    const k = 3.4, e = (1 - Math.exp(-k * s)) / k, x = q.x0 + q.vx * e, y = q.y0 + q.vy * e + (1500 / k) * (s - e);
    const vira = Math.cos(q.flip + q.vf * s), luz = Math.abs(vira);
    cv.save(); cv.translate(x, y); cv.rotate(q.rot + q.vr * s); cv.scale(1, Math.max(0.12, luz) * Math.sign(vira || 1));
    cv.globalAlpha = Math.min(1, s / 0.04) * (1 - C((s / q.vida - 0.65) / 0.35));
    cv.fillStyle = `rgb(${rgb.map(c => Math.round(L(c * 0.7, Math.min(255, c * 1.5 + 30), luz))).join(',')})`;
    cv.fillRect(-q.w / 2, -q.h / 2, q.w, q.h); cv.restore();
  }
}

/* legenda branca sem fundo: blocos de até 2 palavras, quebrando na pontuação e nas pausas; escura sobre o papel */
const GR = [];
{ let g = [];
  PAL.forEach((w, i) => { g.push(w); const prox = PAL[i + 1];
    if (g.length >= 2 || /[.,?!…]$/.test(w[2]) || !prox || prox[0] - w[1] > 0.35) { GR.push(g); g = []; } }); }
const legEl = $('#legenda');
GR.forEach(g => { const d = document.createElement('div'); d.style.position = 'absolute'; d.style.left = '0'; d.style.right = '0';
  d.innerHTML = g.map(w => `<span>${w[2].replace(/\.\.\.$|…$/, '')}</span>`).join(''); legEl.appendChild(d); g.el = d; g.ws = [...d.children]; });
function legenda(t) {
  const oc = OCULTA.some(([a, b]) => t >= a && t < b);
  const papel = (window.PAPEL_TOPO ?? 9999) < 1460;
  legEl.style.color = papel ? '#1C1A17' : '#fff'; legEl.style.textShadow = papel ? 'none' : '';
  GR.forEach((g, k) => { const ini = g[0][0] - 0.05, fim = Math.min(GR[k + 1] ? GR[k + 1][0][0] - 0.05 : 99, g[g.length - 1][1] + 0.6);
    if (oc || t < ini || t >= fim) { g.el.style.opacity = 0; return; }
    g.el.style.opacity = 1;
    g.ws.forEach((s, i) => { const t0 = g[i][0] - 0.04, p = M.prog(t, t0, 0.35, E.spring), pa = pr(t, t0, 0.12, E.cubicOut);
      s.style.opacity = pa; s.style.transform = `scale(${L(0.82, 1, p)}) translateY(${(1 - pr(t, t0, 0.3)) * 12}px)`; }); });
}
const TELA_SVG = `<defs><filter id="borda" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity=".45"/></filter>
  <mask id="furoM"><rect x="-60" y="-60" width="1200" height="2040" fill="#fff"/><path id="furoP" fill="#000" d=""/></mask></defs>
  <g mask="url(#furoM)"><rect x="-60" y="-60" width="1200" height="2040" fill="#030303"/></g>
  <path id="telaBorda" fill="none" stroke="#2D6ABE" stroke-width="14" filter="url(#borda)" d=""/>
  <path id="telaArco" fill="none" stroke="#2D6ABE" stroke-width="26" stroke-linecap="round" d=""/>`;
$('#tela').innerHTML = TELA_SVG;

/* marca famosa citada na fala (ex.: Amazon): o ícone pula sobre a modelo, o fundo dele se expande e vira a tela cheia */
const MARCAS = { aws: { cor: '#232F3E', svg: `<svg viewBox="0 0 24 24"><path fill="#fff" d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.2l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 0 1-.303.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.416-.287-.807-.415l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 0 1-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167zM21.698 16.207c-2.626 1.94-6.442 2.969-9.722 2.969-4.598 0-8.74-1.7-11.87-4.526-.247-.223-.024-.527.272-.351 3.384 1.963 7.559 3.153 11.877 3.153 2.914 0 6.114-.607 9.06-1.852.439-.2.814.287.383.607zM22.792 14.961c-.336-.43-2.22-.207-3.074-.103-.255.032-.295-.192-.063-.36 1.5-1.053 3.967-.75 4.254-.399.287.36-.08 2.826-1.485 4.007-.215.184-.423.088-.327-.151.32-.79 1.03-2.57.695-2.994z"/></svg>` }, amazon: { cor: '#232F3E', svg: `<svg viewBox="0 0 24 24"><path fill="#fff" d="M6.610 11.802c0-1.005.247-1.863.743-2.577.495-.71 1.17-1.25 2.04-1.615.796-.335 1.756-.575 2.912-.72.39-.046 1.033-.103 1.92-.174v-.37c0-.93-.105-1.558-.3-1.875-.302-.43-.78-.65-1.44-.65h-.182c-.48.046-.896.196-1.246.46-.35.27-.575.63-.675 1.096-.06.3-.206.465-.435.51l-2.52-.315c-.248-.06-.372-.18-.372-.39 0-.046.007-.09.022-.15.247-1.29.855-2.25 1.82-2.88.976-.616 2.1-.975 3.39-1.05h.54c1.65 0 2.957.434 3.888 1.29.135.15.27.3.405.48.12.165.224.314.283.45.075.134.15.33.195.57.06.254.105.42.135.51.03.104.062.3.076.615.01.313.02.493.02.553v5.28c0 .376.06.72.165 1.036.105.313.21.54.315.674l.51.674c.09.136.136.256.136.36 0 .12-.06.226-.18.314-1.2 1.05-1.86 1.62-1.963 1.71-.165.135-.375.15-.63.045a6.062 6.062 0 01-.526-.496l-.31-.347a9.391 9.391 0 01-.317-.42l-.3-.435c-.81.886-1.603 1.44-2.4 1.665-.494.15-1.093.227-1.83.227-1.11 0-2.04-.343-2.76-1.034-.72-.69-1.08-1.665-1.08-2.94l-.05-.076zM10.363 11.364c0 .566.14 1.02.425 1.364.285.34.675.512 1.155.512.045 0 .106-.007.195-.02.09-.016.134-.023.166-.023.614-.16 1.08-.553 1.424-1.178.165-.28.285-.58.36-.91.09-.32.12-.59.135-.8.015-.195.015-.54.015-1.005v-.54c-.84 0-1.484.06-1.92.18-1.275.36-1.92 1.17-1.92 2.43l-.035-.02z"/><path fill="#FF9900" d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726a17.617 17.617 0 01-10.951-.577 17.88 17.88 0 01-5.43-3.35c-.1-.074-.151-.15-.151-.22 0-.047.021-.09.051-.13zM19.525 18.391c.03-.06.075-.11.132-.17.362-.243.714-.41 1.05-.5a8.094 8.094 0 011.612-.24c.14-.012.28 0 .41.03.65.06 1.05.168 1.172.33.063.09.099.228.099.39v.15c0 .51-.149 1.11-.424 1.8-.278.69-.664 1.248-1.156 1.68-.073.06-.14.09-.197.09-.03 0-.06 0-.09-.012-.09-.044-.107-.12-.064-.24.54-1.26.806-2.143.806-2.64 0-.15-.03-.27-.087-.344-.145-.166-.55-.257-1.224-.257-.243 0-.533.016-.87.046-.363.045-.7.09-1 .135-.09 0-.148-.014-.18-.044-.03-.03-.036-.047-.02-.077 0-.017.006-.03.02-.063v-.06z"/></svg>` } };
function marcaExpande(t, nome, t0, cx = 540, cy = 330) {
  let el = document.getElementById('marcaX');
  if (!el) { el = document.createElement('div'); el.id = 'marcaX'; el.innerHTML = `<div class="bg"></div><div class="gl">${MARCAS[nome].svg}</div>`;
    el.querySelector('.bg').style.background = MARCAS[nome].cor; $('#tela').after(el); }
  if (t < t0 || t > t0 + 1.45) { el.style.display = 'none'; return; }
  el.style.display = 'block';
  const ps = M.prog(t, t0, 0.55, E.spring), pe = pr(t, t0 + 0.6, 0.5, E.cubicInOut), sai = pr(t, t0 + 1.08, 0.32, E.cubicOut);
  const w = L(260, 1500, pe), h = L(260, 2400, pe), x = L(cx, 540, pe), y = L(cy, 960, pe);
  const bg = el.querySelector('.bg'), gl = el.querySelector('.gl');
  Object.assign(bg.style, { left: (x - w / 2) + 'px', top: (y - h / 2) + 'px', width: w + 'px', height: h + 'px', borderRadius: L(56, 0, pe) + 'px',
    transform: `scale(${L(0.3, 1, ps)})`, opacity: C(pr(t, t0, 0.12, E.linear)) * (1 - sai) });
  Object.assign(gl.style, { left: (x - 80) + 'px', top: (y - 80) + 'px', transform: `scale(${L(0.3, 1, ps) * (1 + pe * 0.8)})`, opacity: C(pr(t, t0, 0.12, E.linear)) * (1 - C(pe * 2)) });
}
const fim = () => { if (!window.RENDER) { const t0 = performance.now(); const loop = () => { window.quadro(((performance.now() - t0) / 1000) % window.DURACAO); requestAnimationFrame(loop); }; loop(); } };

/* ajudantes Onnira */
const Q = s => [...document.querySelectorAll(s)];
// pílula/texto que vira (texto + classe) no tempo da fala
const vira = (el, t, t0, txt, cls) => { if (el._b == null) { el._b = el.innerHTML; el._c = el.className; }
  const on = t >= t0, h = on ? txt : el._b; if (el.innerHTML !== h) el.innerHTML = h; if (cls != null) el.className = on ? 'pill ' + cls : el._c;
  if (on) pulsa(el, t, t0, 0.1); else el.style.transform = ''; };
// digitação: o texto aparece letra a letra de t0 a t0+d
const digita = (el, t, t0, d, txt) => { const n = Math.round(txt.length * C((t - t0) / d)); const s = t < t0 ? '' : txt.slice(0, n); if (el.textContent !== s) el.textContent = s; };
// contador (de 0 ao valor final v em d s)
const conta = (el, t, t0, d, v, fmt = x => Math.round(x).toLocaleString('pt-BR')) => { const s = fmt(t < t0 ? 0 : v * E.cubicOut(C((t - t0) / d))); if (el.textContent !== s) el.textContent = s; };
// bolha de conversa entrando (sobe + aparece); antes de t0 fica fora
const bolha = (el, t, t0) => { const p = M.prog(t, t0, 0.5, E.spring); el.style.opacity = pr(t, t0, 0.18, E.cubicOut);
  el.style.transform = `translateY(${(1 - p) * 26}px) scale(${L(0.96, 1, p)})`; };
// caminho se completando (ilustração da fala): o traço vai até o marco k no tempo ts[k]; marcos acendem na palavra
function caminho(t, path, marcos, ts, d = 0.5, ruim = -1) {
  const Lp = path._L || (path._L = path.getTotalLength()); let f = 0;
  ts.forEach((tk, k) => { if (k && t >= tk - d) f = Math.max(f, (k - 1 + pr(t, tk - d, d, E.cubicInOut)) / (ts.length - 1)); });
  path.style.strokeDasharray = Lp; path.style.strokeDashoffset = Lp * (1 - f);
  marcos.forEach((m, k) => { const on = t >= ts[k]; m.classList.toggle(k === ruim ? 'ruim' : 'on', on); if (on) pulsa(m, t, ts[k], 0.18); else m.style.transform = ''; });
}

// centro do alvo na tela (o cursor clica exatamente nele, regra 7); com a janela parada o rect já é o final
const centro = el => { const r = (typeof el === 'string' ? $(el) : el).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
// o que a fala cita acende e fica aceso (fundo + contorno na cor da função)
const acende = (el, t, t0, rgb = '96,165,250', a = 0.12) => { const p = t0 == null ? 0 : pr(t, t0, 0.3, E.cubicOut);
  el.style.background = p > 0.01 ? `rgba(${rgb},${a * p})` : ''; el.style.boxShadow = p > 0.01 ? `inset 0 0 0 1.5px rgba(${rgb},${0.55 * p})` : ''; return p; };
const cascata = (els, t, t0, passo = 0.1, dy = 18) => els.forEach((e, k) => { const a = t0 + k * passo;
  e.style.opacity = pr(t, a, 0.25, E.cubicOut); e.style.transform = `translateY(${(1 - pr(t, a, 0.5)) * dy}px)`; });
// troca de aba: [[t, índice]…]; a vista nova entra subindo, a barra de carregamento corre sob as abas
function abasDe(t, abas, vistas, trocas, carrega) {
  let at = 0, ult = -9; for (const [tt, a] of trocas) if (t >= tt) { at = a; ult = tt; }
  abas.forEach((e, k) => e.classList.toggle('on', k === at));
  vistas.forEach((v, k) => { const p = k === at ? pr(t, ult, 0.3, E.cubicOut) : 0; v.style.opacity = k === at ? (ult < 0 ? 1 : p) : 0;
    v.style.transform = `translateY(${k === at && ult >= 0 ? (1 - p) * 24 : 0}px)`; });
  if (carrega) carrega.style.width = (t - ult < 0.5 ? pr(t, ult, 0.35, E.cubicOut) * 100 : 0) + '%';
  return at;
}
const pulsa = (el, t, t0, k = 0.12) => { if (t >= t0) el.style.transform = `scale(${1 + k * Math.sin(C((t - t0) / 0.4) * Math.PI)})` + tranco(t, t0); };

/* câmera 3D das telas cheias (receita 13, versão "linear e suave" — FF Tech 06/10/2026): pontos [t, alvo, S, rx, ry, ox, oy]
   ligados em linha reta (velocidade constante) + média móvel de 0,8 s nas viradas (sem tranco). Os pontos são todos
   diferentes = a câmera nunca para. Zoom só até onde a linha inteira cabe (rótulo + pílula): nada de close que corta
   informação. Presa às bordas da janela; deriva lenta de 2–3 px; sem borrão. alvo = seletor/elemento, lista ou [x, y]. */
const FOCO = [540, 810];   // centro das janelas das telas cheias
function camera(t, wrap, kf) {
  const w = typeof wrap === 'string' ? $(wrap) : wrap;
  if (!w._K) {   // mede os alvos com tudo no lugar final (sem câmera e sem as animações de entrada)
    const salvo = [w, ...w.querySelectorAll('*')].filter(e => e.style.transform).map(e => [e, e.style.transform]);
    salvo.forEach(([e]) => e.style.transform = '');
    const jr = w.firstElementChild.getBoundingClientRect(); w._jan = [jr.left, jr.right, jr.left + jr.width / 2];
    const caixa = a => { const es = (Array.isArray(a) ? a : [a]).map(e => typeof e === 'string' ? $(e) : e).map(e => e.getBoundingClientRect());
      const l = Math.min(...es.map(r => r.left)), r = Math.max(...es.map(r => r.right)), tp = Math.min(...es.map(r => r.top)), b = Math.max(...es.map(r => r.bottom));
      return [(l + r) / 2, (tp + b) / 2]; };
    w._K = kf.map(([tt, alvo, S = 1, rx = 0, ry = 0, ox = 0, oy = 0]) => {
      const [x, y] = Array.isArray(alvo) && typeof alvo[0] === 'number' ? alvo : caixa(alvo);
      return [tt, x + ox, y + oy, S, rx, ry]; });
    salvo.forEach(([e, tr]) => e.style.transform = tr);
  }
  const K = w._K, lin = x => { if (x <= K[0][0]) return K[0].slice(1); if (x >= K[K.length - 1][0]) return K[K.length - 1].slice(1);
    let i = 0; while (x > K[i + 1][0]) i++; const u = (x - K[i][0]) / (K[i + 1][0] - K[i][0]); return K[i].slice(1).map((a, c) => L(a, K[i + 1][c + 1], u)); };
  const N = 8, v = [0, 0, 0, 0, 0];   // média móvel: arredonda só as viradas, o resto é linear
  for (let k = -N; k <= N; k++) lin(t + k * 0.05).forEach((a, c) => v[c] += a / (2 * N + 1));
  let [fx, fy, S, rx, ry] = v;
  const [jl, jr, jcx] = w._jan, meia = 540 / S + 14 / S;            // presa às bordas: com zoom a janela cobre a largura toda
  fx = jr - jl > 2 * meia ? Math.min(Math.max(fx, jl + meia), jr - meia) : jcx;
  fx += 2.5 * Math.sin(t * 0.9); fy += 2 * Math.cos(t * 0.7);
  w.style.transform = `translate(${FOCO[0]}px, ${FOCO[1]}px) perspective(1700px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${S}) translate(${-fx}px, ${-fy}px)`;
}
// segura no alvo de a até b empurrando de leve (+3 %): a câmera nunca congela
const fica = (a, b, alvo, S, rx = 0, ry = 0, ox = 0, oy = 0) => [[a, alvo, S, rx, ry, ox, oy], [b, alvo, S * 1.03, rx * 0.6, ry * 0.6, ox, oy]];

// WARP: [[t novo, t antigo]…] — depois de cortar a base, a animação continua no tempo antigo (interpolação linear)
const warpT = t => { const W = window.WARP; if (!W) return t; let i = 0; while (i < W.length - 2 && t > W[i + 1][0]) i++;
  const [a0, b0] = W[i], [a1, b1] = W[i + 1]; return b0 + (t - a0) * (b1 - b0) / (a1 - a0); };
