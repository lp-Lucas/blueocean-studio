/* Componentes (Leadrive → Soft CS) (receita 15) — carregar depois do base.js. */
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
// corte novo na base depois do motion pronto (receita 15): T (linha nova) → t (linha antiga em que a animação foi feita)
// velho/novo = [[início na linha, entrada no bruto, saída no bruto], …] dos itens do V1 da composição base
const WARP = (velho, novo) => T => { const p = novo.find(([i, e, s], k) => T < i + (s - e) || k === novo.length - 1); const o = p[1] + (T - p[0]);
  const q = velho.find(([i, e, s]) => o >= e - 1e-3 && o <= s + 1e-3) || velho[velho.length - 1]; return q[0] + (o - q[1]); };
