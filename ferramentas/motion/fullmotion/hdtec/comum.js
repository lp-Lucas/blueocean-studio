/* Componentes NimoChat (receita 15) — carregar depois do base.js. */
const Q = s => [...document.querySelectorAll(s)];
// pílula que vira (texto + cor) no tempo da fala
const vira = (el, t, t0, txt, cls) => { if (el._b == null) { el._b = el.innerHTML; el._c = el.className; }
  const on = t >= t0, h = on ? txt : el._b; if (el.innerHTML !== h) el.innerHTML = h; if (cls != null) el.className = on ? 'pill ' + cls : el._c;
  if (on) pulsa(el, t, t0, 0.1); else el.style.transform = ''; };
// notificação descendo de cima
const notif = (el, t, t0, t1) => { const p = M.prog(t, t0, 0.6, E.spring), po = t1 == null ? 0 : pr(t, t1, 0.3, E.cubicIn);
  el.style.opacity = pr(t, t0, 0.2, E.cubicOut) * (1 - po); el.style.transform = `translateY(${L(-140, 0, p) - po * 40}px)`; };
// contador (valor final v, de t0 por d s)
const conta = (el, t, t0, d, v, fmt = x => Math.round(x)) => { el.textContent = fmt(t < t0 ? 0 : v * E.cubicOut(C((t - t0) / d))); };
// balão de conversa entrando (sobe + aparece)
const balao = (el, t, t0) => { const p = M.prog(t, t0, 0.5, E.spring); el.style.opacity = pr(t, t0, 0.18, E.cubicOut);
  el.style.transform = `translateY(${(1 - p) * 26}px) scale(${L(0.94, 1, p)})`; };
// ícone de marca (quadrado na cor oficial com o símbolo branco)
const mk = (nome, px = 56) => `<div class="mk" style="background:${MARCAS[nome].cor};width:${px}px;height:${px}px">${MARCAS[nome].svg}</div>`;
// digitação num campo: texto aparece letra a letra de t0 a t0+d
const digita = (el, t, t0, d, txt) => { const n = Math.round(txt.length * C((t - t0) / d)); const s = t < t0 ? '' : txt.slice(0, n);
  if (el.textContent !== s) el.textContent = s; };
// cursor que clica em vários alvos seguidos: pts = [[tChegada, alvo(el|[x,y]), clica?]…]; entra de 'de' em t0, sai em tsai
function cursorSeq(el, t, t0, de, pts, tsai) {
  if (t < t0 || t > tsai + 0.4) { el.style.opacity = 0; return 0; }
  const P = pts.map(([tt, a, c]) => [tt, Array.isArray(a) ? a : centro(a), c]);
  let x = de[0], y = de[1], ta = t0;
  for (const [tt, [px, py]] of P) { if (t < tt) { const u = E.cubicInOut(C((t - ta) / (tt - ta))); x = L(x, px, u); y = L(y, py, u); break; } x = px; y = py; ta = tt; }
  if (t > tsai) { const u = pr(t, tsai, 0.4, E.cubicIn); x = L(x, x + 260, u); y = L(y, y + 300, u); }
  let k = 0; for (const [tt, , c] of P) if (c && t >= tt && t < tt + 0.3) k = Math.sin((t - tt) / 0.3 * Math.PI);
  el.style.opacity = pr(t, t0, 0.2, E.cubicOut) * (1 - pr(t, tsai, 0.4));
  el.style.left = (x - 8) + 'px'; el.style.top = (y - 6) + 'px'; el.style.transform = `scale(${1 - 0.14 * k})`; el.style.transformOrigin = '8px 6px';
  return k;
}
