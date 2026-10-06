"""Copy 2: troca a abertura de papel (mesa) por layout — navegador com abas, campanhas e cálculo de lucro."""
import os, shutil
D = os.path.dirname(os.path.abspath(__file__)); os.chdir(D)
p = 'copy2.html'
if not os.path.exists('copy2-papel.html'): shutil.copy(p, 'copy2-papel.html')
h = open('copy2-papel.html', encoding='utf8').read()

def cut(a, b, novo):
    global h
    i = h.index(a); j = h.index(b, i); h = h[:i] + novo + h[j:]

cut("  #folhaA { left", "  .cabI {", """  /* FS1 · layout: navegador com as abas, campanhas, cálculo de lucro */
  #win { height: 830px; }
  #win .abas { height: 84px; display: flex; align-items: flex-end; gap: 6px; padding: 0 22px; background: #E9EBEE; position: relative; z-index: 2; }
  #win .aba { width: 290px; height: 64px; border-radius: 14px 14px 0 0; display: flex; align-items: center; gap: 12px; padding: 0 20px; font: 500 23px 'Inter'; color: #5B6370; white-space: nowrap; overflow: hidden; }
  #win .aba i { width: 26px; height: 26px; border-radius: 7px; flex: none; }
  #win .aba.on { background: #fff; color: var(--tinta); font-weight: 600; }
  #carrega { position: absolute; left: 0; top: 84px; height: 4px; background: var(--azul); width: 0; z-index: 3; }
  #win .corpo { height: 746px; }
  #vCamp, #vCalc { position: absolute; left: 34px; right: 34px; top: 30px; }
  .tb { position: relative; margin-top: 24px; }
  .tr2 { display: grid; grid-template-columns: 1.7fr .7fr .9fr 1fr .9fr; align-items: center; height: 92px; border-bottom: 1.5px solid var(--linha); font: 500 27px 'Inter'; opacity: 0; }
  .tr2 > :not(:first-child) { text-align: right; } .tr2.h { height: 56px; opacity: 1; }
  .tr2.h span { font: 600 20px 'Inter'; letter-spacing: .08em; color: var(--cinza); text-transform: uppercase; }
  .ac { justify-self: end; display: inline-flex; height: 46px; padding: 0 16px; border-radius: 999px; align-items: center; font: 700 25px 'Inter'; }
  #colAc { position: absolute; top: -8px; bottom: -8px; right: -12px; width: 150px; border-radius: 16px; border: 3px solid var(--azul); background: rgba(27,84,215,.06); opacity: 0; }
  .cl { display: flex; align-items: center; height: 96px; border-bottom: 1.5px solid var(--linha); font: 500 30px 'Inter'; color: #3F4652; opacity: 0; }
  .cl b { margin-left: auto; font: 650 32px 'Inter'; color: var(--tinta); } .cl.neg b { color: var(--verm); } .cl .q { color: #A0A6AF; font-style: italic; font-weight: 500; }
  #lucro { display: flex; align-items: center; margin-top: 28px; height: 120px; padding: 0 30px; border-radius: 18px; background: var(--vermc); border: 3px solid transparent; font: 650 32px 'Inter'; color: var(--tinta); opacity: 0; }
  #lucro b { margin-left: auto; font: 800 58px 'Inter'; color: var(--verm); letter-spacing: .04em; }
  #vEst { position: absolute; left: 34px; right: 34px; top: 30px; opacity: 0; }
  .es { display: grid; grid-template-columns: 1.5fr .8fr 1.6fr; gap: 0 24px; align-items: center; height: 92px; border-bottom: 1.5px solid var(--linha); font: 500 27px 'Inter'; }
  .es .u { text-align: right; font-weight: 600; } .es .br { height: 16px; border-radius: 8px; background: var(--claro); position: relative; overflow: hidden; }
  .es .br i { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 8px; background: #9AA1AB; }
  .es .d { position: absolute; right: 0; font: 600 22px 'Inter'; color: var(--cinza); }
  .es.baixo { background: var(--vermc); margin: 0 -16px; padding: 0 16px; border-radius: 12px; border-bottom-color: transparent; }
  #apaga { position: absolute; inset: 0; background: radial-gradient(ellipse 75% 55% at 50% 42%, rgba(6,8,12,.82), rgba(4,5,8,.94)); opacity: 0; z-index: 30; pointer-events: none; }

""")

cut("<!-- ═════ TELA CHEIA 1", "<!-- ═════ INSERÇÕES", """<!-- ═════ TELA CHEIA 1 (1,45 → 13,95): layout — campanhas no escuro, troca de abas, a conta do lucro ═════ -->
<div class="p card app fs" id="win" style="left:540px;top:790px">
  <div class="abas"><div class="aba"><i style="background:#232F3E"></i>Amazon Ads</div><div class="aba"><i style="background:#FF9900"></i>Seller Central</div><div class="aba"><i style="background:#1E8E3E"></i>Cálculo de lucro</div></div>
  <div id="carrega"></div>
  <div class="corpo">
    <div id="vCamp">
      <h3>Campanhas · setembro</h3><p>Sponsored Products · Loja Casa Prática</p>
      <div class="tb"><div id="colAc"></div>
        <div class="tr2 h"><span>Campanha</span><span>Lance</span><span>Orç./dia</span><span>Gasto</span><span style="text-transform:none">ACoS</span></div>
        <div class="tr2"><span>Fone BT – Exata</span><span>R$ 3,80</span><span>R$ 300</span><span>R$ 4.120</span><span class="ac">48,0%</span></div>
        <div class="tr2"><span>Garrafa Térmica</span><span>R$ 0,95</span><span>R$ 20</span><span>R$ 590</span><span class="ac">14,0%</span></div>
        <div class="tr2"><span>Kit Facas – Ampla</span><span>R$ 2,60</span><span>R$ 150</span><span>R$ 2.870</span><span class="ac">56,1%</span></div>
        <div class="tr2"><span>Luminária LED</span><span>R$ 1,10</span><span>R$ 40</span><span>R$ 1.050</span><span class="ac">17,0%</span></div>
        <div class="tr2"><span>Organizador</span><span>R$ 1,90</span><span>R$ 120</span><span>R$ 2.240</span><span class="ac">50,0%</span></div>
      </div>
    </div>
    <div id="vEst">
      <h3>Estoque · Full (FBA)</h3><p>Quantos dias cada produto ainda aguenta</p>
      <div style="margin-top:24px" id="esL">
        <div class="tr2 h" style="grid-template-columns:1.5fr .8fr 1.6fr;display:grid"><span>Produto</span><span>Unid.</span><span>Dura</span></div>
      </div>
    </div>
    <div id="vCalc" style="opacity:0">
      <h3>Fone BT · quanto sobra por venda?</h3><p>Conta feita na mão, produto por produto</p>
      <div style="margin-top:18px">
        <div class="cl"><span>Preço de venda</span><b class="num">R$ 129,90</b></div>
        <div class="cl neg"><span>Comissão Amazon (15%)</span><b class="num">− R$ 19,49</b></div>
        <div class="cl neg"><span>Tarifa FBA</span><b class="num">− R$ 18,40</b></div>
        <div class="cl"><span>Anúncio por venda</span><b class="q">não sei</b></div>
      </div>
      <div id="lucro">Lucro por venda<b>???</b></div>
    </div>
  </div>
</div>
<div id="apaga"></div>

""")

cut("// caneta no post-it", "window.quadro", "")

cut("  /* ── FS1 · 1,45 → 14,1 ── */", "  /* ── inserções · 14,1", """  /* ── FS1 · 1,45 → 13,95: layout ── */
  A($('#win'), t, 1.72, 13.85, { de: 0.88, dy: 120, dout: 0.2 });
  // "gerenciei campanhas"
  linhasC.forEach((e, k) => { const a = 2.9 + k * 0.12; e.style.opacity = pr(t, a, 0.25, E.cubicOut); e.style.transform = `translateY(${(1 - pr(t, a, 0.5)) * 22}px)`; });
  // "completamente no escuro": a tela apaga; volta no "ficava"
  const ap = pr(t, 4.3, 0.7, E.cubicInOut) * (1 - pr(t, 5.85, 0.45, E.cubicInOut));
  $('#apaga').style.opacity = ap;
  window.PAPEL_TOPO = t > 1.9 && t < 14.2 && ap < 0.35 ? 0 : 9999;
  // "trocando de aba": o cursor pula de aba em aba; "olhando o ACoS aqui" acende a coluna; "calcular… lucro" abre a conta
  const TROCAS = [[6.25, 1], [7.55, 0], [8.85, 1], [9.55, 2]];
  let ativa = 0, ult = -9; for (const [tt, a] of TROCAS) if (t >= tt) { ativa = a; ult = tt; }
  abas.forEach((e, k) => e.classList.toggle('on', k === ativa));
  $('#carrega').style.width = (t - ult < 0.5 ? pr(t, ult, 0.35, E.cubicOut) * 100 : 0) + '%';
  $('#vCamp').style.opacity = ativa === 0 ? (ult < 0 ? 1 : C((t - ult) / 0.25)) : 0;
  $('#vEst').style.opacity = ativa === 1 ? C((t - ult - 0.1) / 0.25) : 0;
  estL.forEach(([e, d], k) => { const a = 6.4 + k * 0.08, baixo = d < 10 && t >= 9.0 + (d === 3 ? 0.2 : 0);
    e.style.transform = `translateY(${(1 - pr(t, a, 0.5)) * 20}px)`; e.classList.toggle('baixo', baixo);
    e.querySelector('.br i').style.background = baixo ? 'var(--verm)' : '#9AA1AB'; e.querySelector('.num').style.color = baixo ? 'var(--verm)' : ''; });
  $('#vCalc').style.opacity = ativa === 2 ? pr(t, 9.5, 0.2, E.cubicOut) : 0;
  { const KC = [[6.0, 230, 1500], [6.2, 504, 420], [7.5, 224, 420], [8.8, 504, 420], [9.5, 784, 420], [10.2, 1000, 1400]];
    const el = $('#cur3'); if (t < 5.95 || t > 10.4) el.style.opacity = 0; else {
      let x = KC[0][1], y = KC[0][2]; for (let i = 1; i < KC.length; i++) { const p = pr(t, KC[i - 1][0], KC[i][0] - KC[i - 1][0], E.cubicInOut); if (t >= KC[i - 1][0]) { x = L(KC[i - 1][1], KC[i][1], p); y = L(KC[i - 1][2], KC[i][2], p); } }
      const cl = Math.max(...TROCAS.map(([tt]) => Math.sin(C((t - tt + 0.05) / 0.22) * Math.PI)));
      el.style.opacity = pr(t, 5.95, 0.15, E.linear) * (1 - pr(t, 10.2, 0.2)); el.style.left = x + 'px'; el.style.top = y + 'px';
      el.style.transform = `translate(-20%,-10%) scale(${1 - 0.15 * cl})`; el.style.filter = 'drop-shadow(0 6px 10px rgba(0,0,0,.35))'; } }
  { const pc = pr(t, 7.8, 0.35, E.cubicOut); $('#colAc').style.opacity = pc; $('#colAc').style.transform = `scaleY(${L(0.92, 1, pc)})`;
    pills.forEach(([e, v], k) => { const on = t >= 7.92 + k * 0.08; e.style.background = on ? (v > 30 ? 'var(--vermc)' : 'var(--verdec)') : 'transparent'; e.style.color = on ? (v > 30 ? 'var(--verm)' : 'var(--verde)') : ''; }); }
  calcs.forEach((e, k) => { const a = [9.95, 10.45, 11.0, 11.6][k]; e.style.opacity = pr(t, a, 0.25, E.cubicOut); e.style.transform = `translateX(${(1 - pr(t, a, 0.5)) * 40}px)`; });
  { pop($('#lucro'), t, 12.25); const pu = Math.sin(C((t - 13.05) / 0.5) * Math.PI); $('#lucro').style.borderColor = t >= 13.05 ? 'var(--verm)' : 'transparent';
    if (t >= 13.05) $('#lucro').style.transform = `scale(${1 + 0.04 * pu})`; }

""")
h = h.replace("const FS = [[25.98, 31.05, true]];", "const FS = [[1.45, 13.95, true], [25.98, 31.05, true]];")
h = h.replace("const linhas = [...document.querySelectorAll('#roi .ln2')];", """const linhas = [...document.querySelectorAll('#roi .ln2')];
const linhasC = [...document.querySelectorAll('#vCamp .tr2:not(.h)')], abas = [...document.querySelectorAll('#win .aba')], calcs = [...document.querySelectorAll('#vCalc .cl')];
const ESTQ = [['Fone BT', 12, 4], ['Garrafa Térmica', 340, 61], ['Kit Facas', 85, 22], ['Luminária LED', 9, 3], ['Organizador', 210, 48]];
const estL = ESTQ.map(([n, u, d]) => { const e = document.createElement('div'); e.className = 'es';
  e.innerHTML = `<span>${n}</span><span class="u num">${u} un.</span><div style="position:relative;display:flex;align-items:center;gap:16px"><div class="br" style="flex:1"><i style="width:${Math.min(100, d / 61 * 100)}%"></i></div><span style="width:110px;text-align:right;font:600 25px Inter;color:#5B6370">${d} dias</span></div>`;
  $('#esL').appendChild(e); return [e, d]; });
const pills = [...document.querySelectorAll('#vCamp .ac')].map(e => [e, parseFloat(e.textContent.replace(',', '.'))]);""")
assert 'folhaA' not in h and 'medir' not in h, 'sobrou papel'
h = h.replace('<svg class="cursor" id="cur2" viewBox="0 0 24 30"></svg>', '<svg class="cursor" id="cur2" viewBox="0 0 24 30"></svg>\n<svg class="cursor" id="cur3" viewBox="0 0 24 30"></svg>')
open(p, 'w', encoding='utf8').write(h); print('ok')
