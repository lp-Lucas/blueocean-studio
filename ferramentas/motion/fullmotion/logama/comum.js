/* ajudantes comuns das 3 copies LOGAMA (depois do base.js) */
const COR = { tinta: [13, 28, 39], verm: [201, 55, 42], verde: [21, 128, 61] };
// linha que acende na palavra e fica acesa (fundo 7 % + contorno curto no pico)
const acende = (el, t, t0, cor = 'tinta') => { const c = COR[cor], p = pr(t, t0, 0.3, E.cubicOut), fl = Math.sin(C((t - t0) / 0.5) * Math.PI);
  el.style.background = p > 0.01 ? `rgba(${c},${0.07 * p})` : ''; el.style.boxShadow = fl > 0.02 ? `inset 0 0 0 ${2.5 * fl}px rgba(${c},.6)` : '';
  if (cor === 'verm') { const b = el.querySelector('b'); if (b) b.style.color = p > 0.5 ? 'var(--verm)' : ''; } };
// caixa "???" vermelha: contorno + tranco na palavra
const acendeAlerta = (el, t, t0) => { const on = t >= t0, b = el.querySelector('b'); el.style.borderColor = on ? 'var(--verm)' : 'transparent';
  el.style.background = on ? 'var(--vermc)' : 'var(--claro)'; b.textContent = on ? '???' : '—'; b.style.color = on ? 'var(--verm)' : '#B9B6B3';
  if (t >= t0) el.style.transform = `scale(${1 + 0.04 * Math.sin(C((t - t0) / 0.5) * Math.PI)})` + tranco(t, t0); };
// check cinza → verde na palavra
const CKV = S('check', '#fff', 3.2), CKC = S('check', '#B9B6B3', 3.2);
const marcaOk = (el, t, t0) => { const ck = el.querySelector('.ck'), on = t >= t0;
  if (ck.dataset.on !== String(on)) { ck.innerHTML = on ? CKV : CKC; ck.style.background = on ? 'var(--verde)' : 'var(--claro)'; ck.dataset.on = on; }
  ck.style.transform = on ? `scale(${L(0.6, 1, M.prog(t, t0, 0.6, E.spring))})` : '';
  el.style.background = on ? `rgba(21,128,61,${0.06 * pr(t, t0, 0.3)})` : ''; };
const digita = (id, t, t0, txt, dur = 0.35) => { const el = $('#' + id), n = Math.round(C((t - t0) / dur) * txt.length), s = t < t0 ? '' : txt.slice(0, n), cur = t >= t0 && t < t0 + dur + 0.25;
  if (el.dataset.v !== s + cur) { el.innerHTML = `<span class="vl">${s}</span>` + (cur ? '<i class="cur"></i>' : ''); el.dataset.v = s + cur; }
  el.style.borderColor = cur ? 'var(--tinta)' : ''; };
