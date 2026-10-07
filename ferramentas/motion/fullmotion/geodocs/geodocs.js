/* Geodocs: mapa (copiado da SmartRota) (ruas, rio, parques, pinos numerados como no sistema do site) e utilidades das telas.
   Carregar depois do base.js. */
Object.assign(FM.GLIFO, { pin: 'M12 21 C12 21 5 14.5 5 9.5 a7 7 0 0 1 14 0 C19 14.5 12 21 12 21 Z M12 7.5 a2 2 0 1 0 0.01 0 Z',
  grade: 'M4 4 H20 V20 H4 Z M4 10 H20 M4 15 H20 M10 4 V20', ok: 'M5 12.5 L10 17.5 L19 7',
  foto: 'M4 7 H8 L10 5 H14 L16 7 H20 V19 H4 Z M12 10 a3 3 0 1 0 0.01 0 Z', doc: 'M7 3 H14 L19 8 V21 H7 Z M14 3 V8 H19 M10 13 H16 M10 17 H16',
  pasta: 'M3 6 H10 L12 8 H21 V19 H3 Z', mail: 'M3 6 H21 V18 H3 Z M3 6 L12 13 L21 6', cal: 'M4 6 H20 V20 H4 Z M4 10 H20 M8 3 V7 M16 3 V7',
  user: 'M12 4 a4 4 0 1 0 0.01 0 Z M4 21 C4 16 8 14 12 14 C16 14 20 16 20 21', semsinal: 'M3 3 L21 21 M8.5 16.5 a5 5 0 0 1 7 0 M5 13 a10 10 0 0 1 4 -2.6 M12 20 h0.01',
  lupa: 'M10.5 4 a6.5 6.5 0 1 0 0.01 0 Z M15.5 15.5 L20 20', tarefa: 'M4 5 H20 V19 H4 Z M8 12 L11 15 L16 9', camada: 'M12 3 L21 8 L12 13 L3 8 Z M3 12.5 L12 17.5 L21 12.5' });

// fundo do mapa: quadras inclinadas, avenidas, rio e parques — mesma cara do mapa claro do sistema
function mapaFundo(w, h, seed = 3) {
  const R = FM.rng(seed); let s = `<rect width="${w}" height="${h}" fill="#E7EEF4"/>`;
  for (let k = 0; k < 3; k++) { const x = R() * w * 0.8, y = R() * h * 0.8; s += `<rect x="${x}" y="${y}" width="${90 + R() * 120}" height="${60 + R() * 90}" rx="18" fill="#D5EBDC"/>`; }
  s += `<path d="M -40 ${h * 0.82} C ${w * 0.25} ${h * 0.62}, ${w * 0.45} ${h * 1.05}, ${w * 0.7} ${h * 0.78} S ${w + 60} ${h * 0.55}, ${w + 80} ${h * 0.6}" fill="none" stroke="#C9E0F4" stroke-width="44"/>`;
  s += `<g transform="rotate(-13 ${w / 2} ${h / 2})">`;
  for (let x = -w; x < 2 * w; x += 64 + R() * 26) s += `<line x1="${x}" y1="${-h}" x2="${x}" y2="${2 * h}" stroke="#fff" stroke-width="7"/>`;
  for (let y = -h; y < 2 * h; y += 58 + R() * 24) s += `<line x1="${-w}" y1="${y}" x2="${2 * w}" y2="${y}" stroke="#fff" stroke-width="7"/>`;
  s += `</g>`;
  s += `<path d="M -20 ${h * 0.18} C ${w * 0.3} ${h * 0.3}, ${w * 0.6} ${h * 0.05}, ${w + 20} ${h * 0.32}" fill="none" stroke="#fff" stroke-width="17"/>`;
  s += `<path d="M ${w * 0.38} -20 C ${w * 0.3} ${h * 0.4}, ${w * 0.55} ${h * 0.7}, ${w * 0.48} ${h + 20}" fill="none" stroke="#fff" stroke-width="17"/>`;
  return s;
}
// pino: tipo 'num' (verde, número), 'cinza' (sem ordem, ?), 'ok' (entregue), 'pt' (ponto pequeno)
function pino(x, y, txt, tipo = 'num', id = '') {
  const r = tipo === 'pt' ? 11 : 20;
  const cor = { num: ['#3D7A89', '#fff', '#fff'], cinza: ['#fff', '#8794A3', '#8794A3'], ok: ['#15803D', '#fff', '#fff'], pt: ['#5B6B80', '#fff', '#fff'] }[tipo];
  return `<g ${id ? `id="${id}"` : ''} class="pino" data-x="${x}" data-y="${y}" transform="translate(${x} ${y})">
    <circle r="${r + 4}" fill="rgba(16,32,57,.12)" cy="2"/><circle r="${r}" fill="${cor[0]}" stroke="${cor[1]}" stroke-width="3"/>
    ${txt ? `<text text-anchor="middle" dy="7" font-size="${tipo === 'pt' ? 12 : 20}" fill="${cor[2]}">${txt}</text>` : ''}</g>`;
}
// aparece com mola (pinos e marcas no mapa)
function popSvg(g, t, t0) {
  const x = g.dataset.x, y = g.dataset.y, s = L(0.2, 1, M.prog(t, t0, 0.55, E.spring));
  g.style.opacity = pr(t, t0, 0.15, E.cubicOut); g.setAttribute('transform', `translate(${x} ${y}) scale(${t < t0 ? 0.2 : s})`);
}
// desenha um traço (rota) do começo ao fim entre t0 e t0+d
function traco(p, t, t0, d) { const Lp = p._L || (p._L = p.getTotalLength()); p.style.strokeDasharray = Lp; p.style.strokeDashoffset = Lp * (1 - pr(t, t0, d, E.cubicInOut)); }
// centro de um elemento na tela (para o cursor cair exatamente no alvo)
const alvo = (el, dx = 0, dy = 0) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2 + dx, r.top + r.height / 2 + dy]; };
// pulso de destaque (0→1→0) para "acender" o que a fala cita
const pulso = (t, t0, d = 0.8) => Math.sin(C((t - t0) / d) * Math.PI);
// foto de campo ilustrada (chapada, sem degradê): 'obra' (prédio + grua) ou 'solar' (painéis + inversor)
function fotoCampo(w, h, tipo = 'obra') {
  let s = `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="xMidYMid slice"><rect width="${w}" height="${h}" fill="#BFD7E2"/>`;
  if (tipo === 'obra') {
    s += `<rect x="${w * 0.12}" y="${h * 0.28}" width="${w * 0.46}" height="${h * 0.5}" fill="#9AA6B2"/>`;
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += `<rect x="${w * 0.15 + i * w * 0.14}" y="${h * 0.33 + j * h * 0.14}" width="${w * 0.09}" height="${h * 0.08}" fill="#6B7785"/>`;
    s += `<line x1="${w * 0.7}" y1="${h * 0.08}" x2="${w * 0.7}" y2="${h * 0.78}" stroke="#E0A526" stroke-width="${w * 0.018}"/><line x1="${w * 0.42}" y1="${h * 0.12}" x2="${w * 0.95}" y2="${h * 0.12}" stroke="#E0A526" stroke-width="${w * 0.018}"/>`;
    s += `<line x1="${w * 0.86}" y1="${h * 0.12}" x2="${w * 0.86}" y2="${h * 0.34}" stroke="#475569" stroke-width="3"/><rect x="${w * 0.82}" y="${h * 0.34}" width="${w * 0.08}" height="${h * 0.07}" fill="#475569"/>`;
  } else {
    for (let i = 0; i < 4; i++) s += `<path d="M${w * 0.04 + i * w * 0.24} ${h * 0.66} L${w * 0.1 + i * w * 0.24} ${h * 0.36} L${w * 0.26 + i * w * 0.24} ${h * 0.36} L${w * 0.22 + i * w * 0.24} ${h * 0.66} Z" fill="#1E3A5F" stroke="#CBD5E1" stroke-width="3"/>`;
    s += `<rect x="${w * 0.4}" y="${h * 0.6}" width="${w * 0.2}" height="${h * 0.22}" rx="6" fill="#E2E8F0" stroke="#64748B" stroke-width="3"/><circle cx="${w * 0.5}" cy="${h * 0.71}" r="${h * 0.04}" fill="#15803D"/>`;
  }
  return s + `<rect y="${h * 0.78}" width="${w}" height="${h * 0.22}" fill="#B49B7E"/></svg>`;
}
// linha que acende (fundo na cor da função, f de 0 a 1)
const acende = (el, f, rgb = '61,122,137') => { el.style.background = f > 0.01 ? `rgba(${rgb},${0.09 * f})` : ''; };
// digita um texto entre t0 e t0+d (cursor de texto enquanto digita)
const digita = (el, txt, t, t0, d) => { const n = Math.round(txt.length * pr(t, t0, d, E.linear));
  const v = txt.slice(0, n) + (t >= t0 && t < t0 + d + 0.4 ? '<span class="caret"></span>' : ''); if (el._v !== v) { el.innerHTML = v; el._v = v; } };
// mensagens de WhatsApp: [quando aparece (-1 = já está), lado, html, hora] → elementos
function conversa(cont, MS) { return MS.map(([t0, lado, html, h]) => { const e = document.createElement('div'); e.className = 'msg ' + lado;
  e.innerHTML = html + (h ? `<span class="h">${h}${lado.startsWith('out') ? '<i>✓✓</i>' : ''}</span>` : ''); cont.appendChild(e); return e; }); }
// anima a conversa: mensagens novas sobem empurrando as antigas
function rolaConversa(cont, msgs, MS, t, alt, extra = 0) { let desce = 0;
  msgs.forEach((e, k) => { const p = pr(t, MS[k][0], 0.3, E.cubicOut); desce += alt[k] * (1 - p); e.style.opacity = p; });
  cont.style.transform = `translateY(${desce - extra}px)`; }
