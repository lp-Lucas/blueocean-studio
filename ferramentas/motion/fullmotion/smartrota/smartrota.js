/* SmartRota: mapa da rota (ruas, rio, parques, pinos numerados como no sistema do site) e utilidades das telas.
   Carregar depois do base.js. */
Object.assign(FM.GLIFO, { pin: 'M12 21 C12 21 5 14.5 5 9.5 a7 7 0 0 1 14 0 C19 14.5 12 21 12 21 Z M12 7.5 a2 2 0 1 0 0.01 0 Z',
  grade: 'M4 4 H20 V20 H4 Z M4 10 H20 M4 15 H20 M10 4 V20', ok: 'M5 12.5 L10 17.5 L19 7' });

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
  const cor = { num: ['#0CA47C', '#fff', '#fff'], cinza: ['#fff', '#8794A3', '#8794A3'], ok: ['#B8C3CF', '#fff', '#fff'], pt: ['#5B6B80', '#fff', '#fff'] }[tipo];
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
