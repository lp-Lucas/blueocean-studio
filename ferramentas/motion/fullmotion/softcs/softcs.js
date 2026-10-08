/* Ajudantes Soft CS — carregar depois do base.js e do comum.js. */
Object.assign(FM.GLIFO, {
  users: 'M16 19 V17.5 A3.5 3.5 0 0 0 12.5 14 H7.5 A3.5 3.5 0 0 0 4 17.5 V19 M10 11 A3.2 3.2 0 1 0 10 4.6 A3.2 3.2 0 0 0 10 11 Z M20 19 V17.5 A3.5 3.5 0 0 0 17.5 14.2 M15.5 4.8 A3.2 3.2 0 0 1 15.5 10.9',
  pulso: 'M19.5 12.6 L12 20 L4.5 12.6 A4.6 4.6 0 0 1 12 6.4 A4.6 4.6 0 0 1 19.5 12.6 Z M3 12 H8 L10 9 L13 15 L15 12 H21',
  alerta: 'M12 4 L21 19.5 H3 Z M12 10 V14 M12 17 V17.2',
  partido: 'M19.5 12.6 L12 20 L4.5 12.6 A4.6 4.6 0 0 1 12 6.4 A4.6 4.6 0 0 1 19.5 12.6 Z M12 6.4 L10.5 10 L13.5 12.5 L11.5 16',
  medidor: 'M4.5 17 A8.5 8.5 0 1 1 19.5 17 M12 13 L15.5 9',
  sino: 'M6 16 V11 A6 6 0 0 1 18 11 V16 L19.5 18 H4.5 Z M10 20.5 H14',
  fone: 'M5 4 H9 L10.5 8.5 L8.2 10 A11 11 0 0 0 14 15.8 L15.5 13.5 L20 15 V19 A2 2 0 0 1 18 21 A15 15 0 0 1 3 6 A2 2 0 0 1 5 4 Z',
  check: 'M5 12.5 L10 17 L19 7', x: 'M6 6 L18 18 M18 6 L6 18', raio: 'M13 3 L5 13.5 H11.5 L10.5 21 L19 10 H12.5 Z',
  brilho: 'M11 4 L12.8 9.2 L18 11 L12.8 12.8 L11 18 L9.2 12.8 L4 11 L9.2 9.2 Z M18.5 3 V7 M16.5 5 H20.5',
  envia: 'M4 12 L20 4 L14 20 L11.5 13 Z M11.5 13 L20 4', seta: 'M5 12 H19 M13 6 L19 12 L13 18',
  agenda: 'M4 6 H20 V20 H4 Z M4 10 H20 M8.5 3.5 V7.5 M15.5 3.5 V7.5', calc: 'M6 3 H18 V21 H6 Z M8.5 6 H15.5 V9 H8.5 Z M9 13 H9.2 M12 13 H12.2 M15 13 H15.2 M9 17 H9.2 M12 17 H12.2 M15 17 H15.2',
  fluxo: 'M6 4 V10 A3 3 0 0 0 9 13 H15 A3 3 0 0 1 18 16 V20 M6 4 A2 2 0 1 0 6.01 4 M18 20 A2 2 0 1 0 18.01 20', sobe: 'M4 16 L10 10 L14 14 L20 8 M15 8 H20 V13',
  doc: 'M6 3 H14 L19 8 V21 H6 Z M14 3 V8 H19 M9 13 H16 M9 17 H14', planilha: 'M4 4 H20 V20 H4 Z M4 9 H20 M4 14.5 H20 M9.5 4 V20'
});
const ic = (g, cor = 'currentColor', w = 2.2) => FM.svg(g, cor, w);
const LOGO = (h, claro) => `<img src="img/${claro ? 'logo-claro' : 'logo'}.svg" style="height:${h}px;display:block">`;
const T0 = i => PAL[i][0];   // início da palavra i da fala (linha do tempo da copy)

/* título no estilo do site: data-tx="linha 1|linha 2", [palavras] = caixa roxa atrás */
function montaTit(el) {
  el.innerHTML = el.dataset.tx.split('|').map(l => {
    let h = '';
    for (let tok of l.split(' ')) {
      const abre = tok.startsWith('['), fecha = tok.endsWith(']'); tok = tok.replace(/^\[|\]$/g, '');
      if (abre) h += '<span class="hl"><i></i>';
      h += `<span class="w">${tok}</span>` + (fecha ? '</span> ' : ' ');
    }
    return `<span class="ln">${h.trim()}</span>`; }).join('');
  el._ws = [...el.querySelectorAll('.w')];
  el._hl = [...el.querySelectorAll('.hl')].map(h => [h.firstElementChild, el._ws.indexOf(h.querySelector('.w'))]);
}
document.querySelectorAll('.tit[data-tx]').forEach(montaTit);
// cada palavra entra no tempo em que é falada (ts[i]); a caixa roxa abre da esquerda na 1ª palavra dela; tudo sai em b
function tit(el, t, ts, b, o = {}) {
  el = typeof el === 'string' ? $(el) : el;
  const { dy = -50, x = 0, y = 0 } = o;
  if (t < ts[0] - 0.08 || (b != null && t > b + 0.45)) { el.style.opacity = 0; return; }
  const po = b == null ? 0 : pr(t, b, 0.42, E.cubicIn);
  el.style.opacity = 1 - po; el.style.filter = po > 0.01 ? `blur(${po * 18}px)` : 'none';
  el.style.transform = (el.classList.contains('p') ? 'translate(-50%,-50%) ' : '') + `translate(${x}px,${y + po * dy}px)`;
  el._ws.forEach((s, i) => { const t0 = (ts[i] ?? ts[ts.length - 1]) - 0.05, p = pr(t, t0, 0.7), pa = pr(t, t0, 0.3, E.cubicOut);
    s.style.opacity = pa; s.style.filter = p > 0.995 ? 'none' : `blur(${(1 - p) * 14}px)`;
    s.style.transform = `translateY(${(1 - p) * 0.35}em) scale(${L(0.94, 1, p)})`; });
  el._hl.forEach(([bg, i]) => { const t0 = (ts[i] ?? ts[ts.length - 1]) - 0.04;
    bg.style.transform = `scaleX(${pr(t, t0, 0.5, E.expoOut)})`; bg.style.opacity = pr(t, t0, 0.15, E.linear); });
}
/* CTA: logo + título + botão; o cursor clica no botão em tc e ele "aperta"; brilho passando depois */
function cta(t, t0, ts, tc, dur) {
  A($('#cta'), t, t0, null, { de: 0.9, dy: 60 });
  tit('#ctaT', t, ts, null);
  const c = cursor($('#curC'), t, tc - 0.75, [1000, 1700], t > tc - 0.75 ? centro('#btnCta') : [0, 0], tc, dur + 1);
  $('#btnCta').style.transform = `scale(${1 - 0.06 * c})`;
  const ciclo = ((t - tc - 0.2) % 1.6 + 1.6) % 1.6; $('#brilho').style.left = (t < tc + 0.2 ? -200 : L(-200, 900, E.cubicInOut(C(ciclo / 0.8)))) + 'px';
}
// cursor solto (passeando por uma lista de pontos [t, x, y]), com clique opcional nos tempos cl
function passeia(el, t, pts, cl = []) {
  if (t < pts[0][0] - 0.25 || t > pts[pts.length - 1][0] + 0.3) { el.style.opacity = 0; return; }
  let i = 0; while (i < pts.length - 2 && t > pts[i + 1][0]) i++;
  const [ta, xa, ya] = pts[i], [tb, xb, yb] = pts[i + 1] || pts[i], u = tb > ta ? E.cubicInOut(C((t - ta) / (tb - ta))) : 1;
  const k = cl.reduce((m, tc) => Math.max(m, t >= tc && t < tc + 0.25 ? Math.sin((t - tc) / 0.25 * Math.PI) : 0), 0);
  el.style.opacity = Math.min(pr(t, pts[0][0] - 0.25, 0.25, E.linear), 1 - pr(t, pts[pts.length - 1][0], 0.3, E.linear));
  el.style.left = L(xa, xb, u) + 'px'; el.style.top = L(ya, yb, u) + 'px';
  el.style.transform = `translate(-20%,-10%) scale(${1 - 0.15 * k})`; el.style.filter = 'drop-shadow(0 6px 10px rgba(0,0,0,.35))';
}
for (const c of document.querySelectorAll('.cursor')) c.innerHTML = FM.CURSOR;
