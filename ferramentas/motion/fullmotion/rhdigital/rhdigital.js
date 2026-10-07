/* RH Digital: telas recriadas em layout (receita 15) e reaproveitadas nas 4 copies. Carregar depois do base.js.
   Planilha de controle manual + WhatsApp (tela cheia 1), plataforma RH Digital (tela cheia 2), cartões de inserção e CTA.
   Nomes, números e mensagens são ilustrativos. */
Object.assign(FM.GLIFO, { ok: 'M5 12.5 L10 17.5 L19 7', chev: 'M9 6 L15 12 L9 18', lupa: 'M10.5 4 a6.5 6.5 0 1 0 0.01 0 Z M15.5 15.5 L20 20',
  grade: 'M4 4 H20 V20 H4 Z M4 10 H20 M4 15 H20 M10 4 V20', doc: 'M7 3 H14 L19 8 V21 H7 Z M14 3 V8 H19 M10 13 H16 M10 17 H16',
  envia: 'M21 3 L10 14 M21 3 L14 21 L10 14 L3 10 Z', sino: 'M6 16 V11 a6 6 0 0 1 12 0 V16 L20 18 H4 Z M10 21 H14' });
const alvo = (el, dx = 0, dy = 0) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2 + dx, r.top + r.height / 2 + dy]; };
const pulso = (t, t0, d = 0.8) => Math.sin(C((t - t0) / d) * Math.PI);
const P_ = (c, t, ponto = true) => `<span class="pill ${c}">${ponto ? '<i></i>' : ''}${t}</span>`;
const mk = (tag, cls, html = '', pai = document.body) => { const e = document.createElement(tag); if (cls) e.className = cls; e.innerHTML = html; pai.appendChild(e); return e; };
const novoCursor = () => { const c = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); c.setAttribute('class', 'cursor'); c.setAttribute('viewBox', '0 0 24 30');
  c.innerHTML = FM.CURSOR; document.body.appendChild(c); return c; };
// clique: cursor próprio, chega 0,55 s antes, clica em tc, sai 0,5 s depois
const clique = (el, cur, t, tc, alvoEl, de = [1010, 1560], dx = 0, dy = 0) => {
  if (t < tc - 0.55 || t > tc + 1.0) { cur.style.opacity = 0; return 0; }
  if (!cur._p || t < tc - 0.3) cur._p = alvo(alvoEl, dx, dy);
  return FM.cursor(cur, t, tc - 0.55, de, cur._p, tc, tc + 0.5);
};
const conta = (t, t0, d, de, ate) => Math.round(L(de, ate, pr(t, t0, d, E.cubicInOut)));

const PESSOAS = [['CM', 'Carla Mendes', 'Financeiro'], ['BA', 'Bruno Alves', 'Comercial'], ['DR', 'Diego Rocha', 'Operações'], ['FL', 'Fernanda Lima', 'Marketing'],
  ['JS', 'João Pedro Silva', 'TI'], ['MC', 'Mariana Costa', 'Atendimento'], ['RS', 'Rafael Souza', 'Logística'], ['PN', 'Patrícia Nunes', 'Jurídico']];
const DOCS_PL = ['Holerite set.', 'Aviso de férias', 'Termo LGPD'];
const PEND = [[0, 1, 1, 0, 1, 0, 1, 0], [1, 0, 1, 1, 0, 0, 1, 1], [0, 1, 0, 1, 1, 1, 0, 1]];   // pendentes por documento (planilha)

/* ═════ TELA CHEIA 1: planilha de controle + WhatsApp ═════
   o = { primeira: 'pl'|'wa', abas: [[tc, 'pl'|'wa'], …], pend, col, contaT, contaN, confere, docAbas: [[tc, k], …],
         cobra: [t0, n, dt], busca: [t0, t1] } */
function montaFS1(o) {
  const w = mk('div', 'p card win fs', '', document.body); w.id = 'fs1'; Object.assign(w.style, { left: '540px', top: '810px', height: '900px' });
  w.innerHTML = `<div class="abas"><div class="aba" id="abPl"><i style="background:#1E8E3E">${FM.svg('grade', '#fff', 2.6)}</i>Controle de assinaturas</div>
    <div class="aba" id="abWa"><i style="background:#25D366">${FM.svg('chat', '#fff', 2.6)}</i>WhatsApp</div></div><div class="carrega" id="car1"></div>
    <div class="corpo" style="height:816px">
      <div class="vista" id="vPl"><div class="ferr"><span style="color:#1E8E3E">${FM.svg('grade', '#1E8E3E', 2.4).replace('<svg', '<svg style="width:32px"')}</span>
        <span id="plNome">Holerite · setembro</span><span class="pill cinza num" id="plConta">48 colaboradores</span></div>
        <div class="gr" id="gr"><div class="colHL" id="plHL" style="left:612px;width:288px;height:${52 + 8 * 74 + 4}px"></div>
          <div class="sr th"><span class="n"></span><span class="c1">Colaborador</span><span class="c2">Documento</span><span class="c3">Status</span></div></div>
        <div class="sheetTabs" id="plTabs">${DOCS_PL.map((d, k) => `<span id="plTab${k}">${d}</span>`).join('')}</div></div>
      <div class="vista" id="vWa" style="opacity:0"><div class="wahd">WhatsApp<span class="pill verm num" id="waConta" style="opacity:0">Cobradas 0 de 9</span></div>
        <div class="busca">${FM.svg('lupa', '#667781', 2.4)}<span id="waBusca">Pesquisar</span></div><div class="wal" id="wal" style="height:610px"></div></div>
    </div>`;
  const linhas = PESSOAS.map(([a, n], k) => { const e = mk('div', 'sr', `<span class="n num">${k + 2}</span><span class="c1">${n}</span><span class="c2" data-c="2"></span><span class="c3"><span class="st"></span><span class="ck"></span></span>`, $('#gr'));
    e._st = e.querySelector('.st'); e._ck = e.querySelector('.ck'); e._d = e.querySelector('.c2'); if (o.confere == null) e._ck.style.display = 'none'; return e; });
  // conversas do WhatsApp
  const BASE = [['ER', 'Equipe RH', 'Reunião de alinhamento às 15h', '08:02'], ['CM', 'Carla Mendes', 'Já assinei, obrigada!', '07:48'], ['FL', 'Fernanda Lima', 'Assinado ✓', 'Ontem'],
    ['MC', 'Mariana Costa', 'Pode me reenviar o link?', 'Ontem'], ['PN', 'Patrícia Nunes', 'Ok, vejo hoje ainda', 'Ontem'], ['GS', 'Gestores', 'Lembrem a equipe de assinar', 'Seg'], ['AL', 'Ana Luiza', 'Bom dia!', 'Seg']];
  const BUSCA = [['CM', 'Carla Mendes', 'Já <mark>assin</mark>ei, obrigada!', '07:48'], ['BA', 'Bruno Alves', 'Vou <mark>assin</mark>ar amanhã', 'Ontem'], ['MC', 'Mariana Costa', 'Qual o link para <mark>assin</mark>ar?', 'Ontem'],
    ['DR', 'Diego Rocha', '<mark>Assin</mark>o depois do almoço', 'Seg'], ['GS', 'Gestores', 'Quem já <mark>assin</mark>ou o holerite?', 'Seg'], ['RS', 'Rafael Souza', 'Não recebi para <mark>assin</mark>ar', 'Sex']];
  const COB = [1, 2, 4, 6].map((k, j) => { const p = PESSOAS[k]; return [p[0], p[1], `<i>✓✓</i>Você: Oi, ${p[1].split(' ')[0]}! Falta assinar o holerite de setembro.`, `09:1${j + 2}`]; });
  const cv = ([a, n, m, h], pai) => mk('div', 'cv', `<div class="av2">${a}</div><div class="tx">${n}<span>${m}</span></div><span class="h">${h}</span>`, pai);
  const novos = o.cobra ? COB.slice(0, o.cobra[1]).reverse().map(r => cv(r, $('#wal'))) : [];
  (o.busca ? BUSCA : BASE).forEach(r => cv(r, $('#wal')));
  const curs = (o.abas || []).map(() => novoCursor()), cursD = (o.docAbas || []).map(() => novoCursor());
  return { w, linhas, novos, curs, cursD };
}
function fs1(t, F, o, TI, TO) {
  A(F.w, t, TI + 0.05, TO - 0.1, { de: 0.88, dy: 120, dout: 0.2 });
  // aba ativa (clique do cursor em cada troca)
  let aba = o.primeira, tAba = -9;
  (o.abas || []).forEach(([tc, qual], k) => { clique(F.w, F.curs[k], t, tc, qual === 'wa' ? $('#abWa') : $('#abPl')); if (t >= tc + 0.05) { aba = qual; tAba = tc; } });
  $('#abPl').classList.toggle('on', aba === 'pl'); $('#abWa').classList.toggle('on', aba === 'wa');
  const tr = pr(t, tAba + 0.05, 0.22, E.cubicOut);
  $('#vPl').style.opacity = aba === 'pl' ? tr : 0; $('#vWa').style.opacity = aba === 'wa' ? tr : 0;
  $('#car1').style.width = (t > tAba && t < tAba + 0.5 ? pr(t, tAba, 0.45, E.cubicOut) * 100 : 0) + '%'; $('#car1').style.opacity = t < tAba + 0.45 ? 1 : 0;
  // documento da planilha (abas de baixo)
  let doc = 0; (o.docAbas || []).forEach(([tc, k], j) => { clique(F.w, F.cursD[j], t, tc, $('#plTab' + k)); if (t >= tc + 0.05) doc = k; });
  DOCS_PL.forEach((d, k) => $('#plTab' + k).classList.toggle('on', k === doc));
  $('#plNome').textContent = ['Holerite · setembro', 'Aviso de férias · outubro', 'Termo LGPD · 2026'][doc];
  const tDoc = (o.docAbas || []).filter(([tc]) => t >= tc + 0.05).map(([tc]) => tc).pop() ?? -9;
  F.linhas.forEach((e, k) => { const pend = PEND[doc][k], a = (o.pend ?? 99) + k * 0.07, acesa = t >= a || tDoc > 0;
    e._d.textContent = DOCS_PL[doc];
    e._st.textContent = pend ? 'Pendente' : 'Assinado'; e._st.className = 'st ' + (pend ? 'pend' : 'ok');
    if (pend && acesa) { e._st.style.color = 'var(--verm)'; e.style.background = `rgba(201,55,42,${0.07 + 0.05 * pulso(t, Math.max(a, tDoc), 0.5)})`; }
    else { e._st.style.color = ''; e.style.background = ''; }
    e.style.opacity = pr(t, TI + 0.25 + k * 0.06, 0.25, E.cubicOut);
    // conferência manual: a caixinha é marcada linha a linha
    const tc = (o.confere ?? 99) + k * 0.16, ok = t >= tc;
    if (e._ck._ok !== ok) { e._ck.innerHTML = ok ? FM.svg('ok', '#fff', 3.2) : ''; e._ck._ok = ok; }
    e._ck.style.background = ok ? 'var(--lar)' : '#fff'; e._ck.style.borderColor = ok ? 'var(--lar)' : '#C5C9D3';
    e._ck.style.transform = `scale(${ok ? L(0.6, 1, M.prog(t, tc, 0.45, E.spring)) : 1})`;
    if (ok && t < tc + 0.35) e.style.background = `rgba(255,85,0,${0.08 * pulso(t, tc, 0.35)})`; });
  $('#plHL').style.opacity = o.col != null ? pr(t, o.col, 0.2, E.cubicOut) * (1 - pr(t, o.col + 2.2, 0.3)) : 0;
  if (o.contaT != null) { const on = t >= o.contaT, n = o.contaN[doc] ?? o.contaN[0];
    $('#plConta').className = 'pill num ' + (on ? 'verm' : 'cinza'); $('#plConta').innerHTML = on ? `<i></i>${n} pendentes` : '48 colaboradores';
    $('#plConta').style.transform = `scale(${1 + 0.1 * pulso(t, Math.max(o.contaT, tDoc), 0.45)})` + tranco(t, Math.max(o.contaT, tDoc) + 0.05); }
  // WhatsApp: cobrança um por um (cada conversa nova entra no topo) ou busca digitada
  if (o.cobra) { const [t0, n, dt] = o.cobra; let k = 0;
    F.novos.forEach((e, j) => { const a = t0 + (n - 1 - j) * dt, p = pr(t, a, 0.3, E.cubicOut); if (t >= a) k++;
      e.style.height = 98 * p + 'px'; e.style.opacity = p; e.style.overflow = 'hidden'; e.style.background = p > 0 ? `rgba(255,85,0,${0.08 * pulso(t, a, 0.6)})` : ''; });
    $('#waConta').style.opacity = pr(t, t0 - 0.1, 0.2, E.cubicOut); $('#waConta').innerHTML = `<i></i>Cobradas ${k} de 9`;
    $('#waConta').style.transform = `scale(${1 + 0.08 * pulso(t, t0 + (k - 1) * dt, 0.3)})`; }
  if (o.busca) { const [b0, b1] = o.busca, q = 'assinou', n = Math.round(L(0, q.length, pr(t, b0, b1 - b0, E.linear)));
    $('#waBusca').innerHTML = n ? `<b>${q.slice(0, n)}</b><span class="car" style="opacity:${Math.floor(t * 3) % 2}"></span>` : 'Pesquisar';
    document.querySelectorAll('#wal mark').forEach(m => { m.style.background = n >= 5 ? '#FFE9A8' : 'transparent'; }); }
}

/* ═════ TELA CHEIA 2: plataforma RH Digital ═════
   o = { inicio: 'docs'|'status', envia, abre, centraliza, docsLuz, status, auto, assina: [t0, dt] } */
const DOCS_APP = [['Holerite · setembro', '48 colaboradores', 39, 48], ['Aviso de férias', '12 colaboradores', 9, 12], ['Termo de LGPD', '48 colaboradores', 44, 48],
  ['Política de home office', '48 colaboradores', 30, 48], ['Recibo de vale-transporte', '36 colaboradores', 33, 36], ['Acordo de banco de horas', '20 colaboradores', 14, 20]];
const TAB_APP = [[0, 1], [1, 0], [2, 0], [3, 1], [4, 0], [6, 0]];   // [pessoa, assinado]
function montaFS2(o) {
  const w = mk('div', 'p card app fs'); w.id = 'fs2'; Object.assign(w.style, { left: '540px', top: '815px', height: '970px' });
  w.innerHTML = `<div class="bar"><img src="img/logo.png"><div class="nav"><span id="nDoc">Documentos</span><span id="nAss">Assinaturas</span><span>Equipe</span></div><div class="av">RH</div></div>
    <div class="corpo" style="height:870px">
      <div class="vista" id="vDocs"><div class="cab"><div><h3>Documentos</h3><p>Tudo em um lugar · ${DOCS_APP.length} ativos</p></div>
        ${o.envia != null ? `<div class="btn peq" id="btnEnv">${FM.svg('envia', '#fff', 2.4)}Enviar para assinatura</div>` : `<span class="pill cinza" id="docsP">Status em tempo real</span>`}</div>
        <div id="docs" style="margin-top:14px"></div></div>
      <div class="vista" id="vSt" style="opacity:0"><div class="cab"><div><h3>Holerite · setembro</h3><p>Enviado para 48 colaboradores</p></div><span class="pill lar" id="stP"><i></i>Em andamento</span></div>
        <div class="prog"><span>Assinaturas</span><div class="tr"><i id="progI"></i></div><span class="q num" id="progQ">39 de 48</span></div>
        <div class="auto" id="autoR">${FM.svg('sino', 'var(--tinta)', 2.2).replace('<svg', '<svg style="width:30px"')}Cobrança automática<span>de quem não assinou</span><div class="sw" id="sw"><i></i></div></div>
        <div id="tab" style="margin-top:10px;position:relative"><div class="colHL" id="stHL"></div><div class="pe th"><span class="k">Colaborador</span><span class="k">Status</span></div></div></div>
      <div class="toast" id="toast"><b>${FM.svg('ok', '#fff', 3.2)}</b>Enviado para 48 colaboradores</div>
    </div>`;
  const docs = DOCS_APP.map(([n, s, a, tot], k) => { const e = mk('div', 'doc', `<div class="ic">${FM.svg('doc', 'var(--lar)', 2.2)}</div><div class="tx">${n}<span>${s}</span></div>
    <div class="tr"><i style="width:${a / tot * 100}%"></i></div><span class="q num">${a}/${tot}</span>`, $('#docs')); e._q = e.querySelector('.q'); e._i = e.querySelector('.tr i'); return e; });
  const pes = TAB_APP.map(([p, ok]) => { const [a, n, ar] = PESSOAS[p]; const e = mk('div', 'pe', `<div class="av2">${a}</div><div class="tx">${n}<span>${ar}</span></div>${P_(ok ? 'vivo' : 'cinza', ok ? 'Assinado' : 'Pendente')}`, $('#tab'));
    e._p = e.querySelector('.pill'); e._ok = ok; return e; });
  return { w, docs, pes, cEnv: novoCursor(), cAbre: novoCursor(), cAuto: novoCursor() };
}
function fs2(t, F, o, TI, TO) {
  A(F.w, t, TI + 0.05, TO - 0.1, { de: 0.88, dy: 120, dout: 0.2 });
  // documentos
  if (o.envia != null) { const cl = clique(F.w, F.cEnv, t, o.envia, $('#btnEnv'), [1010, 1500], 40, 0); $('#btnEnv').style.transform = `scale(${1 - 0.06 * cl})`;
    const env = t >= o.envia + 0.05; F.docs[0]._i.style.width = (env ? pr(t, o.envia + 0.3, 0.6, E.cubicOut) * 81 : 0) + '%'; F.docs[0]._q.textContent = env ? `${conta(t, o.envia + 0.3, 0.6, 0, 39)}/48` : 'Rascunho';
    F.docs[0].style.background = `rgba(255,85,0,${0.08 * pulso(t, o.envia + 0.05, 1.0)})`;
    const ts = pr(t, o.envia + 0.1, 0.25, E.cubicOut) * (1 - pr(t, o.envia + 1.05, 0.2)); $('#toast').style.opacity = ts; $('#toast').style.transform = `translateX(-50%) translateY(${(1 - ts) * 20}px)`; }
  F.docs.forEach((e, k) => { e.style.opacity = pr(t, TI + 0.25 + k * 0.07, 0.25, E.cubicOut);
    if (o.docsLuz != null && (k || o.envia == null)) { const a = o.docsLuz + k * 0.12; e.style.background = `rgba(255,85,0,${0.07 * pulso(t, a, 0.9)})`; } });
  if (o.centraliza != null && $('#docsP')) { const on = t >= o.centraliza; $('#docsP').className = 'pill ' + (on ? 'lar' : 'cinza'); $('#docsP').innerHTML = (on ? '<i></i>' : '') + 'Status em tempo real';
    $('#docsP').style.transform = `scale(${1 + 0.1 * pulso(t, o.centraliza, 0.45)})`; }
  // abre o holerite → tela de status
  let st = o.inicio === 'status', tSt = TI;
  if (o.abre != null) { clique(F.w, F.cAbre, t, o.abre, F.docs[0], [1010, 1500], 120, 0); if (t >= o.abre + 0.05) { st = true; tSt = o.abre; } }
  $('#nDoc').classList.toggle('on', !st); $('#nAss').classList.toggle('on', st);
  const q = pr(t, tSt + 0.05, 0.22, E.cubicOut); $('#vDocs').style.opacity = st ? 0 : 1; $('#vSt').style.opacity = st ? (o.inicio === 'status' ? 1 : q) : 0;
  F.pes.forEach((e, k) => e.style.opacity = pr(t, tSt + 0.15 + k * 0.07, 0.25, E.cubicOut));
  // status: contorno na coluna de status
  { const hl = $('#stHL'); if (!hl._m && t >= (o.status ?? 99) - 0.1) { const ps = F.pes.map(e => e._p.offsetLeft); const l = Math.min(...ps) - 12, wd = 250 + 12;
      Object.assign(hl.style, { left: (868 + 14 - wd - 2) + 'px', width: wd + 'px', top: '50px', height: (F.pes.length * 82 + 2) + 'px' }); hl._m = 1; }
    hl.style.opacity = o.status != null ? pr(t, o.status, 0.2, E.cubicOut) * (1 - pr(t, o.status + 1.4, 0.3)) : 0; }
  // cobrança automática
  const ton = o.auto ?? 99, on = t >= ton + 0.05; clique(F.w, F.cAuto, t, ton, $('#sw'), [1010, 1500]);
  $('#sw').style.background = on ? 'var(--lar)' : '#CDD1DA'; $('#sw i').style.left = (4 + 34 * (on ? pr(t, ton, 0.25, E.cubicOut) : 0)) + 'px';
  $('#autoR').style.borderColor = on ? 'var(--lar)' : 'var(--linha)'; $('#autoR').style.background = on ? `rgba(255,85,0,${0.05 + 0.05 * pulso(t, ton, 0.6)})` : '';
  const [a0, dt] = o.assina; let j = 0;
  F.pes.forEach((e, k) => { if (e._ok) return; const tl = ton + 0.3 + j * 0.12, ta = a0 + j * dt; j++;
    const est = t >= ta ? 'a' : t >= tl ? 'l' : 'p';
    if (e._est !== est) { e._p.className = 'pill ' + { a: 'vivo', l: 'lar', p: 'cinza' }[est]; e._p.innerHTML = '<i></i>' + { a: 'Assinado', l: 'Lembrete enviado', p: 'Pendente' }[est]; e._est = est; }
    const tq = est === 'a' ? ta : tl; e._p.style.transform = `scale(${est === 'p' ? 1 : L(0.75, 1, M.prog(t, tq, 0.5, E.spring))})`;
    e.style.background = est === 'a' ? `rgba(21,128,61,${0.08 * pulso(t, ta, 0.7)})` : ''; });
  const fimA = a0 + (j - 1) * dt + 0.2, n = conta(t, a0, fimA - a0, 39, 48);
  $('#progQ').textContent = `${n} de 48`; $('#progI').style.width = n / 48 * 100 + '%';
  const tudo = n >= 48; $('#stP').className = 'pill ' + (tudo ? 'vivo' : 'lar'); $('#stP').innerHTML = '<i></i>' + (tudo ? 'Concluído' : 'Em andamento');
  $('#stP').style.transform = `scale(${1 + 0.12 * pulso(t, fimA, 0.45)})`;
}

/* ═════ cartões de inserção (faixa de cima, centro y 300) ═════ */
function cartao(id, cab, linhas) {
  const e = mk('div', 'p card ins'); e.id = id; Object.assign(e.style, { left: '540px', top: '300px' });
  e.innerHTML = `<div class="cabI">${cab}</div>` + linhas.map((l, k) => `<div class="li" id="${id}L${k}">${l}</div>`).join(''); return e;
}
const acende = (el, t, t0, cor = '201,55,42', a = 0.08) => { const f = t >= t0 ? 1 : 0; el.style.background = f ? `rgba(${cor},${a + 0.05 * pulso(t, t0, 0.5)})` : ''; };
function montaCTA(tit) {
  const e = mk('div', 'p card'); e.id = 'cta'; Object.assign(e.style, { left: '540px', top: '300px' });
  e.innerHTML = `<img src="img/logo.png"><div class="tit">${tit}</div><div class="btn" id="btnCta"><div id="brilho"></div>Preencher formulário ${FM.svg('chev', '#fff', 3)}</div>`;
  return novoCursor();
}
function cta(t, cur, a, tc) {
  A($('#cta'), t, a, null, { de: 0.86, dy: -60 });
  const cl = clique(null, cur, t, tc, $('#btnCta'), [1020, 760], 60, 6); $('#btnCta').style.transform = `scale(${1 - 0.06 * cl})`;
  const ciclo = ((t - tc - 0.15) % 1.6 + 1.6) % 1.6; $('#brilho').style.left = (t < tc + 0.15 ? -200 : L(-200, 700, E.cubicInOut(C(ciclo / 0.8)))) + 'px';
}
