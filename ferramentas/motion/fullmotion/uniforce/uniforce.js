/* Interfaces da Uniforce RECRIADAS em HTML a partir do site (receita 15 / 13) — carregar antes do base.js.
   - jornada: "Jornada do assinante" do topo do site (Onboarding → Cobrança → NPS → Retenção → Upgrade → Indicações +
     MOMENTO / AÇÃO DA UNIFORCE / RESULTADO)
   - fonte: cartões de "Integrações" (Cadastro e contrato, Financeiro e cobrança, Atendimento e chamados…)
   - ass: linha de assinante do painel de risco (sinais + score)
   Ids com o prefixo p (dois usos na mesma página não colidem). */
const ICO = {
  check: 'M5 12.5 L10 17 L19 7',
  x: 'M7 7 L17 17 M17 7 L7 17',
  seta: 'M5 12h14 M13 6l6 6-6 6',
  escudo: 'M12 3 L19 6 V11 C19 15.5 16 19 12 21 C8 19 5 15.5 5 11 V6 Z M12 8.5 V12.5 M12 15.5 V15.6',
  sobe: 'M3 17 L9 11 L13 15 L21 7 M15 7 H21 V13',
  desce: 'M3 7 L9 13 L13 9 L21 17 M15 17 H21 V11',
  share: 'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M8.6 13.5l6.8 4 M15.4 6.5l-6.8 4',
  foguete: 'M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9-.8-.8-2.1-.8-2.9-.1z M12 15l-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2z',
  dinheiro: 'M3 6h18v12H3z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 9.5v0 M18 14.5v0',
  chat: 'M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z M8.5 12h.01 M12 12h.01 M15.5 12h.01',
  contrato: 'M5 3h10l4 4v14H5z M14 3v5h5 M8.5 12.5h7 M8.5 16.5h5',
  fone: 'M3 14v-2a9 9 0 0 1 18 0v2 M21 15a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2z M3 15a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 2z',
  wifi: 'M5 12.5a10 10 0 0 1 14 0 M8.5 16a5 5 0 0 1 7 0 M2 9a15 15 0 0 1 20 0 M12 19.5h.01',
  grafico: 'M4 20V10 M10 20V4 M16 20v-7 M22 20H2',
  alerta: 'M12 3 L22 20 H2 Z M12 9.5v4.5 M12 17h.01',
  relogio: 'M12 3 a9 9 0 1 0 0.01 0 Z M12 7 V12 L15.5 14',
  gente: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8',
  raio: 'M13 2 L4 14 H12 L11 22 L20 10 H12 Z',
  base: 'M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6 M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
};
const ic = (n, cor = '#2A83E8', w = 2) => `<svg viewBox="0 0 24 24" fill="none" stroke="${cor}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"><path d="${ICO[n]}"/></svg>`;
const MARCA = (h = 40) => `<span class="marca"><img src="img/logo.png" style="height:${h}px"></span>`;

const ETAPAS = [['foguete', 'Onboarding'], ['dinheiro', 'Cobrança'], ['chat', 'NPS'], ['escudo', 'Retenção'], ['sobe', 'Upgrade'], ['share', 'Indicações']];
// Jornada do assinante: etapas (feitas = verde com ✓, ativa = azul com ícone) + as 3 caixas
function jornada(p, { ativo = 3, momento = 'Sinais financeiros, técnicos ou relacionais', acao = 'Priorização, plano de ação e acompanhamento', resultado = 'Receita protegida' } = {}) {
  const passo = 892 / 6;
  return `<div class="etps">
    <svg width="892" height="70" style="position:absolute;left:0;top:0" viewBox="0 0 892 70">
      <path d="M${passo / 2} 30 H${892 - passo / 2}" stroke="#D6E4F5" stroke-width="3" fill="none"/>
      <path id="${p}tr" d="M${passo / 2} 30 H${passo / 2 + passo * ativo}" stroke="#3DD63A" stroke-width="3" fill="none"/></svg>
    ${ETAPAS.map(([icn, nm], i) => `<div class="etp" style="left:${passo * i + passo / 2 - 70}px">
      <div class="c${i < ativo ? ' ok' : ''}" id="${p}c${i}">${i < ativo ? ic('check', '#000E1D', 2.6) : ic(icn, '#869CB6', 2)}</div>
      <span id="${p}n${i}"${i === ativo ? ' class="on"' : ''}>${nm}</span></div>`).join('')}
  </div>
  <div class="cx3" style="margin-top:14px">
    <div id="${p}m"><div class="k">Momento</div><p>${momento}</p></div>
    <div class="a" id="${p}a"><div class="k azul">Ação da Uniforce</div><p>${acao}</p></div>
    <div class="r" id="${p}r"><div class="k verde">Resultado</div><p>${resultado}</p></div>
  </div>`;
}
// ativa a etapa i (círculo azul com o ícone, anel) no tempo t0; antes disso fica como pendente
function jornadaAtiva(p, t, i, t0) {
  const c = document.getElementById(p + 'c' + i), on = t >= t0;
  if (c._on !== on) { c._on = on; c.className = 'c' + (on ? ' at' : ''); c.innerHTML = ic(ETAPAS[i][1] === 'Retenção' ? 'escudo' : ETAPAS[i][0], on ? '#fff' : '#869CB6', 2.2);
    document.getElementById(p + 'n' + i).className = on ? 'on' : ''; }
  if (on) pulsa(c, t, t0, 0.12); else c.style.transform = '';
}
// fonte de dados (cartão de Integrações): ícone + nome + descrição + status
const fonte = (id, icn, nome, desc, st = 'Conectando…') => `<div class="fonte" id="${id}"><div class="ico">${ic(icn, '#2A83E8', 2)}</div>
  <div><h5>${nome}</h5><p>${desc}</p></div><span class="pill cinza" id="${id}s">${st}</span></div>`;
// assinante no painel de risco
const ass = (id, ini, nome, sub, score) => `<div class="ass" id="${id}"><div class="av">${ini}</div><div><div class="nm">${nome}</div><div class="sb">${sub}</div></div>
  <div class="sc"><b id="${id}v" class="num">0%</b><div class="barra"><i id="${id}b"></i></div></div></div>`;
// score contando + barra enchendo (vermelho ≥ 70, âmbar abaixo)
function score(id, t, t0, v, d = 0.9) {
  const q = t < t0 ? 0 : E.cubicOut(C((t - t0) / d)), x = Math.round(v * q);
  const e = document.getElementById(id + 'v'); e.textContent = x + '%'; e.style.color = t >= t0 ? (v >= 70 ? 'var(--verm)' : '#B45309') : 'var(--mute)';
  const b = document.getElementById(id + 'b'); b.style.width = (v * q) + '%'; b.style.background = v >= 70 ? '#DC2626' : '#F59E0B';
}
const corpoDe = h => { const d = document.createElement('div'); d.innerHTML = h; return d.querySelector('.corpo').innerHTML; };
