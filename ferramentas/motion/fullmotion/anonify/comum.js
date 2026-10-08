/* Componentes Anonify (receita 15) — carregar depois do base.js.
   Sistema recriado dos prints do site: menu lateral (Home, Empresa, Denúncias, Relatórios, Atividades · Perfil, Suporte),
   pílulas de status do sistema, campo sendo digitado e a linha do tempo do caso (ilustração da 1ª parte). */
const Q = s => [...document.querySelectorAll(s)];
const vira = (el, t, t0, txt, cls) => { if (el._b == null) { el._b = el.innerHTML; el._c = el.className; }
  const on = t >= t0, h = on ? txt : el._b; if (el.innerHTML !== h) el.innerHTML = h; if (cls != null) el.className = on ? 'pill ' + cls : el._c;
  if (on) pulsa(el, t, t0, 0.1); else el.style.transform = ''; };
const conta = (el, t, t0, d, v, fmt = x => Math.round(x)) => { const s = fmt(v * E.cubicOut(C((t - t0) / d))); if (el.textContent !== s) el.textContent = s; };
// texto sendo digitado no campo (com o cursor de texto piscando enquanto digita)
const digita = (el, txt, t, t0, cps = 16) => { const n = Math.max(0, Math.min(txt.length, Math.floor((t - t0) * cps)));
  const s = t < t0 ? '' : txt.slice(0, n), car = t >= t0 - 0.4 && (n < txt.length || (t * 2.2) % 1 < 0.6);
  const h = `<span class="dig">${s}</span>` + (car ? '<span class="car"></span>' : ''); if (el.innerHTML !== h) el.innerHTML = h; };
const liga = (el, t, t0) => { const p = M.prog(t, t0, 0.4, E.spring), q = C(p); el.style.background = t >= t0 ? '#155EEF' : '#EAECF0';
  el.firstElementChild.style.transform = `translateX(${(t >= t0 ? L(0, 24, p) : 0)}px)`; };

// ícones do menu do sistema (traço, como no print)
const IC = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1Z"/>',
  empresa: '<circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  denuncias: '<path d="M3 13 6 5h12l3 8v6H3Z"/><path d="M3 13h5l1.5 2.5h5L16 13h5"/>',
  relatorios: '<path d="M14 3H6v18h12V7Z"/><path d="M14 3v4h4M12 11v6M9 14h6"/>',
  atividades: '<path d="M13 2 4 14h8l-1 8 9-12h-8Z"/>',
  perfil: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>',
  suporte: '<path d="M5 20v-6M12 20V6M19 20v-9"/>'
};
const icone = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${IC[n]}</svg>`;
function lateral(ativo) {
  const it = (k, nome) => `<div class="mi${k === ativo ? ' on' : ''}" data-k="${k}">${icone(k)}${nome}</div>`;
  return `<div class="side"><img class="lg" src="img/logo.png">${it('home', 'Home')}${it('empresa', 'Empresa')}${it('denuncias', 'Denúncias')}${it('relatorios', 'Relatórios')}${it('atividades', 'Atividades')}<hr>${it('perfil', 'Perfil')}${it('suporte', 'Suporte')}</div>`;
}
for (const s of document.querySelectorAll('[data-lateral]')) s.insertAdjacentHTML('afterbegin', lateral(s.dataset.lateral));
// menu: troca o item ativo no clique
const menuAtivo = (sis, k) => Q(sis + ' .mi').forEach(e => e.classList.toggle('on', e.dataset.k === k));

/* linha do tempo do caso (ilustração: caminho se completando, 3 marcos) — SVG 892 × 170 dentro de um cartão de inserção.
   marcos em x 140 / 446 / 752; rótulo e sub em baixo; a linha se desenha entre eles no tempo da fala */
function linhaTempo(id, rotulos) {
  const el = $('#' + id), X = [140, 446, 752];
  el.innerHTML = `<svg width="892" height="176" viewBox="0 0 892 176">
    <path d="M164 56 H422" stroke="#EAECF0" stroke-width="8" stroke-linecap="round"/><path d="M470 56 H728" stroke="#EAECF0" stroke-width="8" stroke-linecap="round"/>
    <path id="${id}a" d="M164 56 H422" stroke="#155EEF" stroke-width="8" stroke-linecap="round" fill="none"/>
    <path id="${id}b" d="M470 56 H728" stroke="#155EEF" stroke-width="8" stroke-linecap="round" fill="none"/>
    ${X.map((x, k) => `<circle id="${id}m${k}" cx="${x}" cy="56" r="20" fill="#fff" stroke="#D0D5DD" stroke-width="7"/>
      <text class="cxb" id="${id}r${k}" x="${x}" y="124" text-anchor="middle">${rotulos[k][0]}</text>
      <text class="cx" id="${id}s${k}" x="${x}" y="158" text-anchor="middle" style="opacity:0">${rotulos[k][1]}</text>`).join('')}
    <path id="${id}ok" d="M740 57 l8 8 l16 -18" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" style="opacity:0"/>
  </svg>`;
}
// marco k aceso (cor: azul = chegou, vermelho = problema, verde = resolvido)
const COR = { azul: '#155EEF', verm: '#D92D20', verde: '#067647' };
function marco(id, k, t, t0, cor = 'azul', cheio = true) {
  const c = $(`#${id}m${k}`); if (t < t0) { c.setAttribute('stroke', '#D0D5DD'); c.setAttribute('fill', '#fff'); c.style.transform = ''; return; }
  c.setAttribute('stroke', COR[cor]); c.setAttribute('fill', cheio ? COR[cor] : '#fff');
  const s = L(0.6, 1, M.prog(t, t0, 0.6, E.spring)); c.style.transformOrigin = `${c.getAttribute('cx')}px 56px`; c.style.transform = `scale(${s})`;
}
const subMarco = (id, k, t, t0, cor) => { const s = $(`#${id}s${k}`); s.style.opacity = pr(t, t0, 0.3, E.cubicOut); if (cor) s.style.fill = COR[cor]; };
const corLinha = (id, seg, cor) => $(`#${id}${seg}`).setAttribute('stroke', COR[cor]);
