"""Copy 1: troca a abertura de papel (relatório impresso) por layout — tela de campanhas da Amazon Ads."""
import os, shutil
D = os.path.dirname(os.path.abspath(__file__)); os.chdir(D)
p = 'copy1.html'
if not os.path.exists('copy1-papel.html'): shutil.copy(p, 'copy1-papel.html')
h = open('copy1-papel.html', encoding='utf8').read()

def cut(a, b, novo):
    global h
    i = h.index(a); j = h.index(b, i); h = h[:i] + novo + h[j:]

cut("  #folhaA { left", "  /* inserções */", """  /* FS1 · layout: Amazon Ads — campanhas do mês */
  #win { height: 980px; }
  #win .abas { height: 84px; display: flex; align-items: flex-end; gap: 6px; padding: 0 22px; background: #E9EBEE; position: relative; z-index: 2; }
  #win .aba { width: 290px; height: 64px; border-radius: 14px 14px 0 0; display: flex; align-items: center; gap: 12px; padding: 0 20px; font: 500 23px 'Inter'; color: #5B6370; white-space: nowrap; overflow: hidden; }
  #win .aba i { width: 26px; height: 26px; border-radius: 7px; flex: none; }
  #win .aba.on { background: #fff; color: var(--tinta); font-weight: 600; }
  #win .corpo { height: 896px; }
  #vCamp { position: absolute; left: 34px; right: 34px; top: 30px; }
  #vCamp .topo { display: flex; align-items: flex-start; } #fechado { margin-left: auto; background: var(--vermc); color: var(--verm); opacity: 0; }
  .tb { position: relative; margin-top: 24px; }
  .tr2 { display: grid; grid-template-columns: 1.7fr .8fr .9fr 1fr .9fr; align-items: center; height: 92px; border-bottom: 1.5px solid var(--linha); font: 500 27px 'Inter'; opacity: 0; margin: 0 -14px; padding: 0 14px; border-radius: 12px; }
  .tr2 > :not(:first-child) { justify-self: end; } .tr2.h { height: 56px; opacity: 1; }
  .tr2.h span { font: 600 20px 'Inter'; letter-spacing: .08em; color: var(--cinza); text-transform: uppercase; }
  .tr2.tot { font-weight: 700; border-bottom: none; }
  .cel { display: inline-flex; align-items: center; gap: 6px; height: 46px; padding: 0 14px; margin-right: -14px; border-radius: 999px; }
  .cel svg { width: 22px; display: none; }
  #colAc { position: absolute; top: -8px; bottom: 84px; right: -12px; width: 160px; border-radius: 16px; border: 3px solid var(--azul); background: rgba(27,84,215,.06); opacity: 0; }
  #toast { position: absolute; left: 34px; right: 34px; bottom: 34px; height: 112px; border-radius: 16px; background: var(--tinta); color: #fff; display: flex; align-items: center; gap: 20px; padding: 0 26px; opacity: 0; }
  #toast .ic { width: 60px; height: 60px; border-radius: 14px; background: rgba(255,255,255,.12); display: grid; place-items: center; flex: none; } #toast .ic svg { width: 32px; }
  #toast b { font: 650 28px 'Inter'; display: block; } #toast small { font: 500 23px 'Inter'; color: rgba(255,255,255,.65); }

""")

cut("<!-- ═════ TELA CHEIA 1", "<!-- ═════ INSERÇÕES", """<!-- ═════ TELA CHEIA 1 (0,93 → 12,55): layout — campanhas do mês na Amazon Ads ═════ -->
<div class="p card app fs" id="win" style="left:540px;top:790px">
  <div class="abas"><div class="aba on"><i style="background:#232F3E"></i>Amazon Ads</div><div class="aba"><i style="background:#FF9900"></i>Seller Central</div></div>
  <div class="corpo">
    <div id="vCamp">
      <div class="topo"><div><h3>Campanhas · setembro</h3><p>Sponsored Products · Loja Casa Prática</p></div><span class="pill" id="fechado">Mês fechado</span></div>
      <div class="tb"><div id="colAc"></div>
        <div class="tr2 h"><span>Campanha</span><span>Lance</span><span>Orç./dia</span><span>Gasto</span><span style="text-transform:none">ACoS</span></div>
        <div class="tr2"><span>Fone BT – Exata</span><span class="cel" id="L1">R$ 3,80</span><span class="cel" id="O1">R$ 300</span><span>R$ 4.120</span><span class="cel ac">48,0%</span></div>
        <div class="tr2"><span>Garrafa Térmica</span><span>R$ 0,95</span><span class="cel" id="O2">R$ 20</span><span>R$ 590</span><span class="cel ac">14,0%</span></div>
        <div class="tr2"><span>Kit Facas – Ampla</span><span>R$ 2,60</span><span>R$ 150</span><span>R$ 2.870</span><span class="cel ac">56,1%</span></div>
        <div class="tr2"><span>Luminária LED</span><span>R$ 1,10</span><span>R$ 40</span><span>R$ 1.050</span><span class="cel ac">17,0%</span></div>
        <div class="tr2"><span>Organizador</span><span>R$ 1,90</span><span>R$ 120</span><span>R$ 2.240</span><span class="cel ac">50,0%</span></div>
        <div class="tr2 tot"><span>Total do mês</span><span></span><span></span><span class="cel" id="GT">R$ 10.870</span><span>38,0%</span></div>
      </div>
    </div>
  </div>
  <div id="toast"><div class="ic" id="toastI"></div><div><b>Relatório de setembro disponível</b><small>30/09 às 23:58 · Amazon Ads</small></div></div>
</div>

""")

cut("/* caneta: caminhos medidos", "window.quadro", """const linhasC = [...document.querySelectorAll('#vCamp .tr2:not(.h)')];
const acs = [...document.querySelectorAll('#vCamp .ac')].map(e => { const v = parseFloat(e.textContent.replace(',', '.')); e.innerHTML = `<span>${e.textContent}</span>` + S('sobe', '#C9372A', 3); return [e, v]; });
$('#toastI').innerHTML = S('agenda', '#fff', 2.4);
const cel = (id, t, t0, ruim) => { const e = $('#' + id), on = t >= t0; e.style.background = on ? (ruim ? 'var(--vermc)' : 'var(--verdec)') : 'transparent'; e.style.color = on ? (ruim ? 'var(--verm)' : 'var(--verde)') : '';
  e.style.fontWeight = on ? 700 : ''; e.style.transform = on ? `scale(${1 + 0.12 * Math.sin(C((t - t0) / 0.35) * Math.PI)})` : ''; };

""")

cut("  /* ── FS1 · 0,93", "  /* ── inserções · 12,7", """  /* ── FS1 · 0,93 → 12,55: layout das campanhas ── */
  A($('#win'), t, 1.2, 12.45, { de: 0.88, dy: 120, dout: 0.2 });
  if (t > 1.3 && t < 12.9) window.PAPEL_TOPO = 0;
  linhasC.forEach((e, k) => { const a = k < 5 ? 1.5 + k * 0.1 : 2.8; e.style.opacity = pr(t, a, 0.25, E.cubicOut); e.style.transform = `translateY(${(1 - pr(t, a, 0.5)) * 22}px)`; });
  // "perdido dinheiro": o total gasto acende
  cel('GT', t, 2.9, true);
  // "campanha com lance errado": a linha do Fone BT e o lance
  linhasC[0].style.background = t >= 4.95 ? 'rgba(201,55,42,.06)' : 'transparent'; cel('L1', t, 5.85, true);
  // "orçamento mal distribuído": R$ 300 na pior campanha, R$ 20 na melhor
  cel('O1', t, 6.55, true); cel('O2', t, 7.25, false);
  // "ACoS subindo": a coluna acende e os valores sobem
  { const pc = pr(t, 8.6, 0.35, E.cubicOut); $('#colAc').style.opacity = pc;
    acs.forEach(([e, v], k) => { const ruim = v > 30, on = t >= 8.7 + k * 0.08, s = ruim ? pr(t, 8.7 + k * 0.08, 0.9, E.cubicOut) : 1;
      e.firstChild.textContent = (ruim ? v - 14 * (1 - s) : v).toFixed(1).replace('.', ',') + '%';
      e.style.background = on ? (ruim ? 'var(--vermc)' : 'var(--verdec)') : 'transparent'; e.style.color = on ? (ruim ? 'var(--verm)' : 'var(--verde)') : '';
      e.style.fontWeight = on ? 700 : ''; e.querySelector('svg').style.display = on && ruim ? 'block' : 'none'; }); }
  // "só percebe no fim do mês": chega o relatório; "quando já era": mês fechado
  { const p = pr(t, 10.2, 0.45, E.cubicOut); $('#toast').style.opacity = pr(t, 10.2, 0.2, E.cubicOut); $('#toast').style.transform = `translateY(${(1 - p) * 60}px)`;
    pop($('#fechado'), t, 11.62); if (t >= 11.62) $('#fechado').style.transform += tranco(t, 11.62); }

""")
h = h.replace("const FS = [[21.62, 28.6, true]];", "const FS = [[0.93, 12.55, true], [21.62, 28.6, true]];")
assert 'folhaA' not in h and 'medir' not in h, 'sobrou papel'
open(p, 'w', encoding='utf8').write(h); print('ok')
