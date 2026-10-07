/* Base Newmo (copiada da SmartRota/Neosync) (receita 15): transições das telas cheias, cursor, riscos, caneta, marca-texto, confete e legenda —
   copiados do forma.html aprovado. A página define FS, ROSTO, ESTOUROS (cores) e OCULTA antes de chamar NB.iniciar(). */
const { M, E, C, L, $, pr } = FM, A = FM.anim;
const S = (g, cor, w = 2.6) => FM.svg(g, cor, w);
Object.assign(FM.GLIFO, { chev: 'M9 6 L15 12 L9 18', sobe: 'M12 19 V5 M6 11 L12 5 L18 11', desce: 'M12 5 V19 M6 13 L12 19 L18 13',
  relogio: 'M12 3 a9 9 0 1 0 0.01 0 Z M12 7 V12 L15.5 14' });
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
  legEl.style.color = '#fff'; legEl.style.textShadow = '';   // tema escuro: legenda sempre branca
  GR.forEach((g, k) => { const ini = g[0][0] - 0.05, fim = Math.min(GR[k + 1] ? GR[k + 1][0][0] - 0.05 : 99, g[g.length - 1][1] + 0.6);
    if (oc || t < ini || t >= fim) { g.el.style.opacity = 0; return; }
    g.el.style.opacity = 1;
    g.ws.forEach((s, i) => { const t0 = g[i][0] - 0.04, p = M.prog(t, t0, 0.35, E.spring), pa = pr(t, t0, 0.12, E.cubicOut);
      s.style.opacity = pa; s.style.transform = `scale(${L(0.82, 1, p)}) translateY(${(1 - pr(t, t0, 0.3)) * 12}px)`; }); });
}
const TELA_SVG = `<defs><filter id="borda" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity=".45"/></filter>
  <mask id="furoM"><rect x="-60" y="-60" width="1200" height="2040" fill="#fff"/><path id="furoP" fill="#000" d=""/></mask></defs>
  <g mask="url(#furoM)"><rect x="-60" y="-60" width="1200" height="2040" fill="#000"/></g>
  <path id="telaBorda" fill="none" stroke="#fff" stroke-width="14" filter="url(#borda)" d=""/>
  <path id="telaArco" fill="none" stroke="#00C767" stroke-width="26" stroke-linecap="round" d=""/>`;
$('#tela').innerHTML = TELA_SVG;

/* marca famosa citada na fala (ex.: Amazon): o ícone pula sobre a modelo, o fundo dele se expande e vira a tela cheia */
const MARCAS = { amazon: { cor: '#232F3E', svg: `<svg viewBox="0 0 24 24"><path fill="#fff" d="M6.610 11.802c0-1.005.247-1.863.743-2.577.495-.71 1.17-1.25 2.04-1.615.796-.335 1.756-.575 2.912-.72.39-.046 1.033-.103 1.92-.174v-.37c0-.93-.105-1.558-.3-1.875-.302-.43-.78-.65-1.44-.65h-.182c-.48.046-.896.196-1.246.46-.35.27-.575.63-.675 1.096-.06.3-.206.465-.435.51l-2.52-.315c-.248-.06-.372-.18-.372-.39 0-.046.007-.09.022-.15.247-1.29.855-2.25 1.82-2.88.976-.616 2.1-.975 3.39-1.05h.54c1.65 0 2.957.434 3.888 1.29.135.15.27.3.405.48.12.165.224.314.283.45.075.134.15.33.195.57.06.254.105.42.135.51.03.104.062.3.076.615.01.313.02.493.02.553v5.28c0 .376.06.72.165 1.036.105.313.21.54.315.674l.51.674c.09.136.136.256.136.36 0 .12-.06.226-.18.314-1.2 1.05-1.86 1.62-1.963 1.71-.165.135-.375.15-.63.045a6.062 6.062 0 01-.526-.496l-.31-.347a9.391 9.391 0 01-.317-.42l-.3-.435c-.81.886-1.603 1.44-2.4 1.665-.494.15-1.093.227-1.83.227-1.11 0-2.04-.343-2.76-1.034-.72-.69-1.08-1.665-1.08-2.94l-.05-.076zM10.363 11.364c0 .566.14 1.02.425 1.364.285.34.675.512 1.155.512.045 0 .106-.007.195-.02.09-.016.134-.023.166-.023.614-.16 1.08-.553 1.424-1.178.165-.28.285-.58.36-.91.09-.32.12-.59.135-.8.015-.195.015-.54.015-1.005v-.54c-.84 0-1.484.06-1.92.18-1.275.36-1.92 1.17-1.92 2.43l-.035-.02z"/><path fill="#FF9900" d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726a17.617 17.617 0 01-10.951-.577 17.88 17.88 0 01-5.43-3.35c-.1-.074-.151-.15-.151-.22 0-.047.021-.09.051-.13zM19.525 18.391c.03-.06.075-.11.132-.17.362-.243.714-.41 1.05-.5a8.094 8.094 0 011.612-.24c.14-.012.28 0 .41.03.65.06 1.05.168 1.172.33.063.09.099.228.099.39v.15c0 .51-.149 1.11-.424 1.8-.278.69-.664 1.248-1.156 1.68-.073.06-.14.09-.197.09-.03 0-.06 0-.09-.012-.09-.044-.107-.12-.064-.24.54-1.26.806-2.143.806-2.64 0-.15-.03-.27-.087-.344-.145-.166-.55-.257-1.224-.257-.243 0-.533.016-.87.046-.363.045-.7.09-1 .135-.09 0-.148-.014-.18-.044-.03-.03-.036-.047-.02-.077 0-.017.006-.03.02-.063v-.06z"/></svg>` } , whatsapp: { cor: '#25D366', svg: `<svg viewBox="0 0 24 24"><path fill="#fff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>` }, meta: { cor: '#0467DF', svg: `<svg viewBox="0 0 24 24"><path fill="#fff" d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"/></svg>` } };
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

/* utilidades (da SmartRota) */
Object.assign(FM.GLIFO, { ok: 'M5 12.5 L10 17.5 L19 7', robo: 'M12 3 V6 M6 8 H18 V18 H6 Z M9.5 12.5 h0.01 M14.5 12.5 h0.01 M9.5 15.5 H14.5 M3 12 V14 M21 12 V14',
  relog: 'M12 3 a9 9 0 1 0 0.01 0 Z M12 7 V12 L15.5 14', sino: 'M6 16 V11 a6 6 0 0 1 12 0 V16 L19.5 18 H4.5 Z M10 20.5 H14', seta2: 'M5 12 H19 M13 6 L19 12 L13 18' });
const alvo = (el, dx = 0, dy = 0) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2 + dx, r.top + r.height / 2 + dy]; };
const pulso = (t, t0, d = 0.8) => Math.sin(C((t - t0) / d) * Math.PI);
const WA_SVG = cor => `<svg viewBox="0 0 24 24"><path fill="${cor}" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`;
// mensagens de WhatsApp: [quando aparece, lado, html, hora] → elementos; anima() faz a conversa subir
function conversa(sel, MS) {
  const els = MS.map(([t0, lado, html, h]) => { const e = document.createElement('div'); e.className = 'msg ' + lado;
    e.innerHTML = html + (h ? `<span class="h">${h}${lado.startsWith('out') ? '<i>✓✓</i>' : ''}</span>` : ''); $(sel).appendChild(e); return e; });
  let alt = null;
  return { els, anima(t, sobe = 0) { if (!alt) alt = els.map(e => e.offsetHeight + 12);
    let desce = 0; els.forEach((e, k) => { const p = pr(t, MS[k][0], 0.3, E.cubicOut); desce += alt[k] * (1 - p); e.style.opacity = p; });
    $(sel).style.transform = `translateY(${desce - sobe}px)`; } };
}
// linhas entrando em cascata
const cascata = (els, t, a, passo = 0.08) => els.forEach((e, k) => { const q = a + k * passo; e.style.opacity = pr(t, q, 0.25, E.cubicOut); e.style.transform = `translateY(${(1 - pr(t, q, 0.5)) * -16}px)`; });
// "acende" uma linha/célula: fundo na cor a 8 % enquanto dura
const acende = (el, t, t0, t1, rgb = '0,199,103', a = 0.16) => { const f = pr(t, t0, 0.25, E.cubicOut) * (t1 == null ? 1 : 1 - pr(t, t1, 0.3)); el.style.background = f > 0.01 ? `rgba(${rgb},${a * f})` : ''; return f; };
// texto sendo digitado
const digita = (el, txt, t, t0, cps = 26) => { const n = Math.max(0, Math.min(txt.length, Math.floor((t - t0) * cps))); el.textContent = t < t0 ? '' : txt.slice(0, n); el.classList.toggle('dig', t >= t0 && n < txt.length); };
