/* Componentes Mais Locações (receita 15) — carregar depois do base.js.
   Mapa recriado do sistema do site (fundo claro, ruas brancas, praças verdes, pinos navy), rota com o caminhão andando,
   pílulas que viram, e a tela da oferta Black Friday (copies 3, 6 e 8). */
const Q = s => [...document.querySelectorAll(s)];
const vira = (el, t, t0, txt, cls) => { if (el._b == null) { el._b = el.innerHTML; el._c = el.className; }
  const on = t >= t0, h = on ? txt : el._b; if (el.innerHTML !== h) el.innerHTML = h; if (cls != null) el.className = on ? 'pill ' + cls : el._c;
  if (on) pulsa(el, t, t0, 0.1); else el.style.transform = ''; };

// ruas de um bairro (determinístico): avenidas largas, ruas finas, duas praças
function mapa(el, seed = 3) {
  const w = el.offsetWidth, h = el.offsetHeight; let s = seed;
  const R = () => (s = (s * 9301 + 49297) % 233280) / 233280;
  let g = `<svg viewBox="0 0 ${w} ${h}">`;
  for (let k = 0; k < 3; k++) { const x = R() * w * 0.8, y = R() * h * 0.8; g += `<rect x="${x}" y="${y}" width="${90 + R() * 90}" height="${60 + R() * 70}" rx="14" fill="#DCE8D0"/>`; }
  for (let x = -40; x < w + 40; x += 70 + R() * 40) g += `<path d="M${x} -20 L${x + (R() - 0.5) * 120} ${h + 20}" stroke="#fff" stroke-width="7"/>`;
  for (let y = -10; y < h + 40; y += 64 + R() * 36) g += `<path d="M-20 ${y} L${w + 20} ${y + (R() - 0.5) * 90}" stroke="#fff" stroke-width="7"/>`;
  g += `<path d="M-20 ${h * 0.62} C ${w * 0.3} ${h * 0.5}, ${w * 0.6} ${h * 0.78}, ${w + 20} ${h * 0.58}" stroke="#F7E7A6" stroke-width="18" fill="none"/>`;
  g += `<path d="M${w * 0.3} -20 C ${w * 0.36} ${h * 0.4}, ${w * 0.22} ${h * 0.7}, ${w * 0.3} ${h + 20}" stroke="#F7E7A6" stroke-width="16" fill="none"/>`;
  el.insertAdjacentHTML('afterbegin', g + '</svg>');
}
const PINO = cor => `<svg viewBox="0 0 44 56"><path d="M22 54 C22 54 4 35 4 21 A18 18 0 1 1 40 21 C40 35 22 54 22 54 Z" fill="${cor}" stroke="#fff" stroke-width="3"/></svg>`;
// pino em (x, y) dentro do mapa; txt curto dentro ("?" ou nº); rot = rótulo embaixo
function pino(el, x, y, txt = '', cor = '#01235C', rot = '') {
  const p = document.createElement('div'); p.className = 'pino'; p.style.left = x + 'px'; p.style.top = y + 'px'; p.innerHTML = PINO(cor) + `<b>${txt}</b>`; el.appendChild(p);
  if (rot) { const r = document.createElement('div'); r.className = 'rot'; r.style.left = x + 'px'; r.style.top = y + 'px'; r.textContent = rot; el.appendChild(r); p._rot = r; }
  return p;
}
const pinoCor = (p, cor, txt) => { const path = p.querySelector('path'); if (path.getAttribute('fill') !== cor) path.setAttribute('fill', cor); if (txt != null && p.querySelector('b').textContent !== txt) p.querySelector('b').textContent = txt; };
const popPino = (p, t, t0) => { pop(p, t, t0); if (p._rot) p._rot.style.opacity = pr(t, t0 + 0.15, 0.3, E.cubicOut); };
// rota: path SVG navy por cima do mapa + caminhão (círculo verde-limão com contorno navy) andando na frente do traço
function rota(el, d, id) {
  el.insertAdjacentHTML('beforeend', `<svg style="position:absolute;inset:0;width:100%;height:100%"><path id="${id}" d="${d}" fill="none" stroke="#0B3A9E" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <circle id="${id}c" r="15" fill="#B1E83A" stroke="#01235C" stroke-width="5" opacity="0"/></svg>`);
}
function andaRota(t, id, t0, d) {
  tinta(t, id, t0, d); const p = $('#' + id), c = $('#' + id + 'c'), L0 = p._L || (p._L = p.getTotalLength());
  const q = E.cubicInOut(C((t - t0) / d)), pt = p.getPointAtLength(L0 * q);
  c.setAttribute('cx', pt.x); c.setAttribute('cy', pt.y); c.setAttribute('opacity', t >= t0 ? 1 : 0);
}
const notif = (el, t, t0, t1) => { const p = M.prog(t, t0, 0.6, E.spring), po = t1 == null ? 0 : pr(t, t1, 0.3, E.cubicIn);
  el.style.opacity = pr(t, t0, 0.2, E.cubicOut) * (1 - po); el.style.transform = `translateY(${L(-140, 0, p) - po * 40}px)`; };
// contador (valor final v, de t0 por d s)
const conta = (el, t, t0, d, v, fmt = x => Math.round(x)) => { el.textContent = fmt(v * E.cubicOut(C((t - t0) / d))); };

/* ═══ tela da oferta Black Friday (proposta no sistema) ═══ */
const OFERTA_HTML = `<div class="cam" id="camO"><div class="p card app fs" id="ofe" style="left:540px;top:810px">
  <div class="bar"><img src="img/logo-claro.svg"><span class="tt">Proposta · Black Friday</span><span class="pill lima" id="oTag">Black Friday</span></div>
  <div class="corpo">
    <div class="topo"><div><h3>Sua condição especial</h3><p>Válida só durante a Black Friday</p></div></div>
    <div style="margin-top:18px">
      <div class="row o"><span class="nm">Implantação<span>Configuração e treinamento da equipe</span></span><span class="pill cinza" id="oDesc">Preço cheio</span></div>
      <div class="row o"><span class="nm">1ª mensalidade<span>Início do plano</span></span><span class="pill cinza" id="oJan">Neste mês</span></div>
      <div class="row o"><span class="nm">Gestão completa<span>Contratos, cobranças e rastreio dos ativos</span></span><span class="pill azul">Num só lugar</span></div>
    </div>
    <div style="display:flex;justify-content:center;margin-top:34px"><div class="btn" id="oBtn">Garantir condição</div></div>
  </div></div></div>`;
// tempos: { ent, tag ("Black Friday"), dez ("10%"), jan ("janeiro"), clique (opcional), sai }
function oferta(t, o) {
  A($('#ofe'), t, o.ent, o.sai - 0.1, { de: 0.88, dy: 120, dout: 0.2 });
  const rs = Q('#ofe .row.o'); cascata(rs, t, o.ent + 0.2, 0.1);
  vira($('#oDesc'), t, o.dez, '−10% de desconto', 'vivo'); acende(rs[0], t, o.dez, '21,128,61');
  vira($('#oJan'), t, o.jan, 'Só em janeiro', 'vivo'); acende(rs[1], t, o.jan, '21,128,61');
  pulsa($('#oTag'), t, o.tag, 0.18);
  if (o.clique != null) {
    const cl = cursor($('#curO'), t, o.clique - 0.75, [980, 1480], t > o.clique - 0.75 ? centro('#oBtn') : [0, 0], o.clique, o.sai - 0.2);
    $('#oBtn').style.transform = `scale(${1 - 0.06 * cl})`;
    const ok = t >= o.clique + 0.12; $('#oBtn').className = ok ? 'btn ok' : 'btn'; const tx = ok ? 'Condição garantida ✓' : 'Garantir condição'; if ($('#oBtn').textContent !== tx) $('#oBtn').textContent = tx;
  }
  const fimC = o.clique != null ? [[o.clique - 0.5, '#oBtn', 1.1, 1, -1, 0, -60], [o.sai, '#oBtn', 1.16, 0, 1, 0, -60]]
                                : [[o.jan + 0.6, [rs[1], '#oBtn'], 1.08, 1, -1], [o.sai, [rs[1], '#oBtn'], 1.12, 0, 1]];
  camera(t, '#camO', [[o.ent + 0.05, [540, 810], 0.92, 3, -3], [o.tag + 0.4, '#ofe .topo', 1.0, 2, 2, 0, 120], [o.dez - 0.4, rs[0], 1.08, 2, -1], [o.jan - 0.4, rs[1], 1.12, 1, 2], ...fimC]);
}
