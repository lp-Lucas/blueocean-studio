/* Interfaces do site da Leadrive RECRIADAS em HTML (receita 15 / 13): carregar antes do base.js.
   Cada função devolve o HTML de uma tela; os ids levam o prefixo p (dois usos na mesma página não colidem).
   - painelLeads: "Painel · Leads" do topo do site (AO VIVO, LEADS HOJE / CONVERTIDOS / TAXA, leads com utm, estrelas e WhatsApp)
   - painelCompleto: "Tudo o que importa, em uma única tela" (CAMPANHAS, VENDEDORES, KPIs, gráfico ÚLTIMOS 30 DIAS)
   - caminho: "O caminho do lead" (Anúncio → Clique → WhatsApp → Distribuição → Venda)
   - extensao: Extensão WhatsApp Web (conversa + painel do lead com a origem e "Registrar venda") */
const ICO = {
  anuncio: 'M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z M15.5 8.5a5 5 0 0 1 0 7',
  clique: 'M9 9l5 12 1.8-5.2L21 14Z M7.2 2.2 8 5.1 M5.1 8 2.2 7.2 M14 4.1 12 6 M6 12l-1.9 2',
  chat: 'M7.9 20A9 9 0 1 0 4 16.1L2 22Z',
  rota: 'M6 3v12 M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 9a9 9 0 0 1-9 9',
  venda: 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z M3 6h18 M16 10a4 4 0 0 1-8 0',
  painel: 'M3 3h7v9H3z M14 3h7v5h-7z M14 12h7v9h-7z M3 16h7v5H3z',
  seta: 'M5 12h14 M13 6l6 6-6 6',
  check: 'M5 12.5 L10 17 L19 7',
  sync: 'M21 12a9 9 0 0 1-15 6.7L3 16 M3 12a9 9 0 0 1 15-6.7L21 8 M21 3v5h-5 M3 21v-5h5',
  gente: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M22 21v-2a4 4 0 0 0-3-3.9 M16 3.1a4 4 0 0 1 0 7.8',
  kanban: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
  robo: 'M12 8V4H8 M4 8h16v12H4z M2 14h2 M20 14h2 M15 13v2 M9 13v2',
};
const ic = (n, cor = '#6F6FFF', w = 2) => `<svg viewBox="0 0 24 24" fill="none" stroke="${cor}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"><path d="${ICO[n]}"/></svg>`;
const MARCA = (h = 36) => `<span class="marca"><img src="img/logo-branco.png" style="height:${h}px">Leadrive</span>`;
const WA = (px = 30) => `<svg class="wa" style="width:${px}px;height:${px}px" viewBox="0 0 24 24"><path fill="#25D366" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>`;
const estrelas = n => `<span class="estr">${'★'.repeat(n)}<s>${'★'.repeat(5 - n)}</s></span>`;

/* leads do topo do site (nome, iniciais, cor, utm fonte, utm campanha, estrelas) */
const LEADS = [['Camila Ribeiro', 'CR', 'a1', 'META_ADS', 'CAMPANHA-3', 5], ['João Mendes', 'JM', 'a2', 'GOOGLE_ADS', 'SEARCH-BR', 4],
               ['Ana Paula', 'AP', 'a3', 'INSTAGRAM', 'REELS-12', 5], ['Ricardo Silva', 'RS', 'a4', 'TIKTOK', 'CREATORS', 3]];

function painelLeads(p, { titulo = 'Painel · Leads', kpis = [['Leads hoje', '312'], ['Convertidos', '47'], ['Taxa', '15%']], leads = LEADS, status = null } = {}) {
  return `<div class="bar">${MARCA(38)}<span class="tt">${titulo}</span><span class="pill ruim" id="${p}vivo"><i></i>Ao vivo</span></div>
  <div class="corpo">
    <div class="kpis" style="grid-template-columns:repeat(${kpis.length},1fr)">${kpis.map(([k, v], i) => `<div class="kpi" id="${p}k${i}"><div class="k">${k}</div><div class="v" id="${p}v${i}">${v}</div></div>`).join('')}</div>
    <div style="margin-top:22px">${leads.map(([nm, ini, c, f, cp, e], i) => `<div class="lead" id="${p}l${i}"><div class="av ${c}">${ini}</div>
      <div><div class="nm">${nm}</div><span class="utm" id="${p}u${i}"><span>utm:</span> ${f} <span>·</span> ${cp}</span></div>
      <div class="dir">${status ? `<span class="pill cinza" id="${p}s${i}">${status[i]}</span>` : estrelas(e)}${WA(32)}</div></div>`).join('')}</div>
  </div>`;
}

function painelCompleto(p, { camps = ['Black Friday · Meta', 'Search · Google Brand', 'Reels · Criadores'], vends = ['Letícia M.', 'Diego A.', 'Paula T.'],
  kpis = [['Leads', '312'], ['Convertidos', '47'], ['Receita', 'R$ 18.420'], ['CPL', 'R$ 12']], sel = 0 } = {}) {
  return `<div class="bar">${MARCA(38)}<span class="tt">Painel completo</span><span class="pill cinza">Últimos 30 dias</span></div>
  <div class="corpo" style="display:flex;gap:26px">
    <div class="lat" style="width:270px;flex:none">
      <div class="k" style="margin:4px 0 12px 4px">Campanhas</div>${camps.map((c, i) => `<div class="it${i === sel ? ' on' : ''}" id="${p}c${i}">${c}</div>`).join('')}
      <div class="k" style="margin:26px 0 12px 4px">Vendedores</div>${vends.map((c, i) => `<div class="it" id="${p}d${i}">${c}</div>`).join('')}
    </div>
    <div style="flex:1;min-width:0">
      <div class="k">Campanha selecionada</div>
      <div style="display:flex;align-items:center;margin-top:6px"><div id="${p}tit" style="font:650 34px 'INT';letter-spacing:-.02em;white-space:nowrap">${camps[sel]}</div><span style="margin-left:auto">${estrelas(4)}</span></div>
      <div class="kpis" style="grid-template-columns:1fr 1fr;margin-top:20px">${kpis.map(([k, v], i) => `<div class="kpi" id="${p}k${i}"><div class="k">${k}</div><div class="v" id="${p}v${i}" style="font-size:40px">${v}</div></div>`).join('')}</div>
      <div class="kpi" style="margin-top:16px;padding:18px 20px 10px"><div style="display:flex;align-items:center"><div class="k">Últimos 30 dias</div>
        <span style="margin-left:auto;font:500 17px 'INT';color:var(--texto);display:flex;gap:14px;align-items:center"><span><b style="color:#8B8BFF">●</b> Leads</span><span><b style="color:#00D4FF">●</b> Vendas</span></span></div>
        <svg viewBox="0 0 560 190" width="100%" style="display:block;margin-top:6px">
          <defs><linearGradient id="${p}gA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6F6FFF" stop-opacity=".45"/><stop offset="1" stop-color="#6F6FFF" stop-opacity="0"/></linearGradient>
          <linearGradient id="${p}gB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#00D4FF" stop-opacity=".35"/><stop offset="1" stop-color="#00D4FF" stop-opacity="0"/></linearGradient>
          <clipPath id="${p}clip"><rect id="${p}clipR" x="0" y="0" width="560" height="190"/></clipPath></defs>
          <g clip-path="url(#${p}clip)">
          <path d="M10 92 C80 78 150 58 210 56 C270 54 300 66 340 60 C390 46 450 38 540 30 V190 H10 Z" fill="url(#${p}gA)"/>
          <path d="M10 92 C80 78 150 58 210 56 C270 54 300 66 340 60 C390 46 450 38 540 30" stroke="#8B8BFF" stroke-width="3.5" fill="none"/>
          <path d="M10 150 C90 142 160 130 230 128 C300 126 330 130 380 118 C440 104 490 98 540 88 V190 H10 Z" fill="url(#${p}gB)"/>
          <path id="${p}lnB" d="M10 150 C90 142 160 130 230 128 C300 126 330 130 380 118 C440 104 490 98 540 88" stroke="#00D4FF" stroke-width="3.5" fill="none"/></g>
          <circle id="${p}pto" cx="540" cy="30" r="7" fill="#8B8BFF"/>
        </svg></div>
    </div>
  </div>`;
}

const ETAPAS = [['anuncio', 'Anúncio'], ['clique', 'Clique'], ['chat', 'WhatsApp'], ['rota', 'Distribuição'], ['venda', 'Venda']];
function caminho(p, etapas = ETAPAS) {
  const n = etapas.length, passo = 892 / n;
  return `<div style="position:relative;height:216px;margin-top:18px">
    <svg width="892" height="120" style="position:absolute;left:0;top:0" viewBox="0 0 892 120">
      <path d="M${passo / 2} 52 H${892 - passo / 2}" stroke="rgba(111,111,255,.35)" stroke-width="3" stroke-dasharray="7 9" fill="none"/>
      <path id="${p}trilha" d="M${passo / 2} 52 H${892 - passo / 2}" stroke="#6F6FFF" stroke-width="5" stroke-linecap="round" fill="none"/></svg>
    ${etapas.map(([icn, nm], i) => `<div style="position:absolute;left:${passo * i}px;width:${passo}px;top:0;display:flex;flex-direction:column;align-items:center">
      <div class="eta" id="${p}e${i}" style="width:100px;height:100px">${ic(icn, '#8B8BFF', 2)}</div>
      <div class="k" style="font-size:15px;margin-top:14px">Etapa 0${i + 1}</div>
      <div id="${p}n${i}" style="font:650 25px 'INT';letter-spacing:-.01em;margin-top:4px;white-space:nowrap">${nm}</div></div>`).join('')}
  </div>`;
}
// liga a etapa i no tempo t0 (ícone vira índigo cheio, nome acende); a trilha anda até a etapa
function caminhoAnda(p, t, tempos) {
  const n = tempos.length, passo = 892 / n; let ate = 0;
  tempos.forEach((t0, i) => { const on = pr(t, t0, 0.3, E.cubicOut), e = document.getElementById(p + 'e' + i);
    e.style.background = on > 0.01 ? `rgba(72,72,240,${0.25 + 0.6 * on})` : ''; e.style.borderColor = on > 0.01 ? '#8B8BFF' : '';
    brilha(e, t, t0);
    e.querySelector('path').setAttribute('stroke', on > 0.5 ? '#fff' : '#8B8BFF');
    document.getElementById(p + 'n' + i).style.color = on > 0.5 ? '#fff' : 'var(--cinza)';
    if (t >= t0) ate = i - 1 + pr(t, t0 - 0.35, 0.35, E.cubicInOut); });
  const tr = document.getElementById(p + 'trilha'), Lt = 892 - passo;
  tr.style.strokeDasharray = Lt; tr.style.strokeDashoffset = Lt * (1 - C(ate / (n - 1)));
}

function extensao(p, { lead = LEADS[0], msgs = [['c', 'Oi! Vi o anúncio e queria saber o preço.', '14:02'], ['v', 'Oi, Camila! Te mando agora 😊', '14:03'], ['c', 'Fechado, pode gerar o pedido.', '14:09']],
  campos = [['Origem', 'META_ADS'], ['Campanha', 'CAMPANHA-3'], ['Anúncio', 'Criativo vídeo 02'], ['Vendedor', 'Letícia M.']], botao = 'Registrar venda' } = {}) {
  return `<div class="bar" style="background:#202C33">${WA(40)}<span class="tt" style="color:#E9EDEF">WhatsApp Web</span><span class="pill roxo">${MARCA(24).replace('class="marca"', 'class="marca" style="font-size:20px;gap:8px"')}</span></div>
  <div class="corpo" style="padding:0;background:#0B141A">
    <div style="display:flex;align-items:center;gap:16px;height:88px;padding:0 30px;background:#1A2329;border-bottom:1.5px solid rgba(255,255,255,.06)">
      <div class="av ${lead[2]}" style="width:52px;height:52px">${lead[1]}</div><div><div style="font:600 25px 'INT';color:#E9EDEF">${lead[0]}</div><div style="font:400 18px 'INT';color:#8696A0">online</div></div></div>
    <div class="chat" id="${p}chat" style="padding:24px 30px 22px">${msgs.map(([q, tx, h], i) => `<div class="bal ${q}" id="${p}b${i}">${tx}<small>${h}</small></div>`).join('')}</div>
    <div style="padding:0 30px 30px"><div class="kpi" id="${p}lado" style="background:var(--card);border-color:rgba(111,111,255,.45);padding:22px 26px">
      <div style="display:flex;align-items:center"><div class="k roxo">Lead identificado · Leadrive</div><span style="margin-left:auto">${estrelas(lead[5])}</span></div>
      ${campos.map(([k, v], i) => `<div class="li" id="${p}f${i}" style="height:62px;font-size:23px${i === 0 ? ';margin-top:10px' : ''}"><span style="color:var(--cinza)">${k}</span><b class="mono" style="font:500 22px 'JBM';color:var(--lilas)">${v}</b></div>`).join('')}
      <div style="display:flex;justify-content:center;margin-top:18px"><div class="btn" id="${p}btn" style="height:76px;font-size:27px;padding:0 40px">${botao}</div></div>
    </div></div>
  </div>`;
}
// só o miolo (.corpo) de uma tela pronta: para montar janelas com abas (cada aba = o corpo de uma interface do site)
const corpoDe = h => { const d = document.createElement('div'); d.innerHTML = h; return d.querySelector('.corpo').innerHTML; };

// pulso de brilho em volta do ícone da etapa (sem escala: o scale nesse cartão deixava uma cópia recortada do ícone num quadro)
const brilha = (e, t, t0, rgb = '111,111,255') => { const k = t >= t0 ? Math.sin(C((t - t0) / 0.5) * Math.PI) : 0;
  e.style.transform = ''; e.style.boxShadow = k > 0.01 ? `0 0 0 ${(6 * k).toFixed(1)}px rgba(${rgb},${(0.35 * k).toFixed(2)}), 0 0 30px rgba(72,72,240,.25)` : ''; };
