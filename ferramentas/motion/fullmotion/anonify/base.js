/* Base Anonify (copiada da Mais Locações / FF Tech, receita 15; tela cheia #F2F4F7 do site, borda #101828, arco azul #155EEF do botão): transições das telas cheias,
   cursor, riscos, confete, legenda e câmera. A página define FS, ROSTO, ESTOUROS (cores) e OCULTA antes. */
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
  legEl.style.color = papel ? '#101828' : '#fff'; legEl.style.textShadow = papel ? 'none' : '';
  GR.forEach((g, k) => { const ini = g[0][0] - 0.05, fim = Math.min(GR[k + 1] ? GR[k + 1][0][0] - 0.05 : 99, g[g.length - 1][1] + 0.6);
    if (oc || t < ini || t >= fim) { g.el.style.opacity = 0; return; }
    g.el.style.opacity = 1;
    g.ws.forEach((s, i) => { const t0 = g[i][0] - 0.04, p = M.prog(t, t0, 0.35, E.spring), pa = pr(t, t0, 0.12, E.cubicOut);
      s.style.opacity = pa; s.style.transform = `scale(${L(0.82, 1, p)}) translateY(${(1 - pr(t, t0, 0.3)) * 12}px)`; }); });
}
const TELA_SVG = `<defs><filter id="borda" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="18" stdDeviation="22" flood-color="#000" flood-opacity=".3"/></filter>
  <mask id="furoM"><rect x="-60" y="-60" width="1200" height="2040" fill="#fff"/><path id="furoP" fill="#000" d=""/></mask></defs>
  <g mask="url(#furoM)"><rect x="-60" y="-60" width="1200" height="2040" fill="#F2F4F7"/></g>
  <path id="telaBorda" fill="none" stroke="#101828" stroke-width="12" filter="url(#borda)" d=""/>
  <path id="telaArco" fill="none" stroke="#155EEF" stroke-width="26" stroke-linecap="round" d=""/>`;
$('#tela').innerHTML = TELA_SVG;

/* marca famosa citada na fala (ex.: Amazon): o ícone pula sobre a modelo, o fundo dele se expande e vira a tela cheia */
const MARCAS = { whatsapp: { cor: '#25D366', svg: `<svg viewBox="0 0 24 24"><path fill="#fff" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>` } };
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

/* ajudantes FF Tech */
// centro do alvo na tela (o cursor clica exatamente nele, regra 7); com a janela parada o rect já é o final
const centro = el => { const r = (typeof el === 'string' ? $(el) : el).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
// o que a fala cita acende e fica aceso (fundo + contorno na cor da função)
const acende = (el, t, t0, rgb = '21,94,239', a = 0.08) => { const p = t0 == null ? 0 : pr(t, t0, 0.3, E.cubicOut);
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
