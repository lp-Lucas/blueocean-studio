"""Copy 1: base no forma.html (shell, legenda, transições, CTA) + abertura, inserções e plataforma próprias (tempos reais T)."""
import os, json
D = os.path.dirname(os.path.abspath(__file__)); os.chdir(os.path.join(D, '..'))
s = open('forma.html', encoding='utf8').read()
ANC = [[0, 7.0], [37.0, 7.0], [37.001, 43.2], [37.28, 43.3], [37.8, 43.98], [41.0, 47.4]]   # só o CTA vem da Copy 3

def corta(a, b, novo='', incl_b=False):
    global s
    i = s.index(a); j = s.index(b, i) + (len(b) if incl_b else 0); s = s[:i] + novo + s[j:]
def troca(a, b):
    global s
    assert a in s, a[:80]; s = s.replace(a, b, 1)

CSS = """  /* ── Copy 1 ── abertura plana */
  #k1 { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; z-index: 7; pointer-events: none; display: none; }
  #k1 .fundo { position: absolute; left: -20px; top: -20px; width: 1120px; height: 1990px; background: #F5FAF8; box-shadow: 0 -16px 40px rgba(0,0,0,.28); }
  .k1rot { position: absolute; font: 600 24px 'Pop'; letter-spacing: .22em; color: #1D6C67; }
  #k1A, #k1B, #k1C { position: absolute; inset: 0; }
  #k1num { position: absolute; left: 80px; top: 330px; font: 800 400px/1 'Pop'; color: #1D6C67; letter-spacing: -0.06em; }
  #k1ex { position: absolute; left: 92px; top: 760px; font: 700 76px 'Pop'; color: #0F172A; letter-spacing: -0.02em; }
  #k1pausa { position: absolute; left: 820px; top: 400px; width: 170px; height: 170px; border-radius: 50%; background: #E06448; display: flex; gap: 22px; align-items: center; justify-content: center; opacity: 0; }
  #k1pausa i { width: 26px; height: 74px; border-radius: 6px; background: #fff; }
  #k1rel { position: absolute; left: 90px; top: 960px; width: 900px; display: flex; align-items: center; gap: 30px; opacity: 0; }
  #k1rel svg { width: 190px; height: 190px; flex: none; }
  #k1rel .n { font: 800 84px 'Pop'; color: #0F172A; font-variant-numeric: tabular-nums; }
  #k1rel .l { font: 600 28px 'Inter'; color: #64748B; }
  #k1cal { position: absolute; left: 90px; top: 360px; width: 900px; background: #fff; border: 1.5px solid #E2E8E6; border-radius: 26px; overflow: hidden; }
  #k1cal .cab { height: 96px; background: #1D6C67; color: #fff; display: flex; align-items: center; padding: 0 34px; font: 700 40px 'Pop'; letter-spacing: .06em; }
  #k1cal .cab small { margin-left: auto; font: 600 24px 'Inter'; letter-spacing: 0; opacity: .8; }
  #k1cal .g { display: grid; grid-template-columns: repeat(7, 1fr); padding: 18px 26px 26px; gap: 8px; }
  #k1cal .g div { height: 84px; display: grid; place-items: center; font: 600 32px 'Inter'; color: #334155; border-radius: 14px; position: relative; }
  #k1cal .g .s { font: 700 20px 'Inter'; color: #94A3B8; height: 40px; letter-spacing: .1em; }
  #k1pub { position: absolute; left: 90px; top: 268px; height: 62px; padding: 0 22px 0 14px; border-radius: 999px; background: #E6F1EF; color: #1D6C67; font: 700 26px 'Inter'; display: flex; align-items: center; gap: 10px; opacity: 0; }
  #k1pub svg { width: 26px; }
  .k1circ { fill: none; stroke: #E06448; stroke-width: 7; stroke-linecap: round; }
  #k1gente { position: absolute; left: 90px; top: 1060px; width: 900px; display: grid; grid-template-columns: repeat(10, 1fr); gap: 18px 0; justify-items: center; }
  #k1gente i { width: 58px; height: 58px; border-radius: 50%; background: #CBD5D2; opacity: 0; position: relative; }
  #k1gente i::after { content: ''; position: absolute; left: 50%; top: 13px; width: 20px; height: 20px; margin-left: -10px; border-radius: 50%; background: rgba(255,255,255,.75); }

  /* ── Copy 1 ── inserções (faixa acima da cabeça) */
  .k1chip { display: flex; align-items: center; gap: 16px; height: 86px; padding: 0 34px 0 16px; border-radius: 999px; background: #fff; font: 700 34px 'Pop';
            white-space: nowrap; box-shadow: 0 16px 40px rgba(0,0,0,.28); color: #0F172A; }
  .k1chip .bol { width: 58px; height: 58px; border-radius: 50%; display: grid; place-items: center; }
  .k1chip .bol svg { width: 32px; }
  .k1card { width: 960px; padding: 26px 32px; border-radius: 30px; background: #fff; box-shadow: 0 20px 50px rgba(0,0,0,.28); }
  .k1card .t { display: flex; align-items: center; font: 700 32px 'Pop'; color: #0F172A; }
  .k1card .t small { margin-left: auto; font: 600 24px 'Inter'; color: #64748B; }
  #k1mats { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; height: 112px; overflow: hidden; }
  #k1mats span { height: 50px; padding: 0 18px; border-radius: 999px; background: #F1F5F4; font: 600 23px 'Inter'; color: #334155; display: flex; align-items: center; opacity: 0; }
  .k1bar { margin-top: 18px; }
  .k1bar .r { display: flex; justify-content: space-between; font: 600 25px 'Inter'; color: #334155; }
  .k1bar .r b { font: 800 28px 'Pop'; }
  .k1bar .tr { height: 26px; border-radius: 13px; background: #EEF2F1; margin-top: 8px; overflow: hidden; }
  .k1bar .tr i { display: block; height: 100%; border-radius: 13px; }
  .k1risca { position: absolute; left: -3%; right: -3%; top: 50%; height: 7px; border-radius: 4px; background: #E06448; transform-origin: 0 50%; transform: scaleX(0); }

  /* ── Copy 1 ── plataforma: plano pelo peso da FGV */
  #k1app { width: 940px; height: 980px; overflow: hidden; }
  #k1app .top { height: 118px; background: #1D6C67; display: flex; align-items: center; gap: 22px; padding: 0 34px; color: #fff; }
  #k1app .top .lg { height: 78px; padding: 6px 16px; border-radius: 16px; background: #fff; display: grid; place-items: center; }
  #k1app .top .lg img { height: 66px; }
  #k1app .top .nm { font: 700 34px 'Pop'; }
  #k1app .top .av { margin-left: auto; width: 62px; height: 62px; border-radius: 50%; background: #E3A64A; color: #fff; display: grid; place-items: center; font: 700 26px 'Inter'; }
  #k1app .abas { display: flex; gap: 12px; padding: 22px 34px 0; }
  #k1app .aba { height: 62px; padding: 0 26px; border-radius: 14px; display: flex; align-items: center; font: 600 28px 'Inter'; color: rgba(15,23,42,.6); }
  #k1app .aba.on { background: rgba(44,122,117,.1); color: #2C7A75; }
  #k1app .corpo { position: absolute; left: 34px; right: 34px; top: 220px; }
  #k1app h3 { font: 700 38px 'Pop'; color: #0F172A; } #k1app h3 + p { font: 500 25px 'Inter'; color: #64748B; margin-top: 4px; }
  #k1app .rot { font: 700 21px 'Inter'; letter-spacing: .16em; color: #94A3B8; margin: 30px 0 10px; }
  .k1lin { display: flex; align-items: center; gap: 18px; height: 60px; font: 600 27px 'Inter'; color: #1E293B; opacity: 0; }
  .k1lin .nm { width: 300px; } .k1lin .tr { flex: 1; height: 22px; border-radius: 11px; background: #EEF2F1; overflow: hidden; }
  .k1lin .tr i { display: block; height: 100%; width: 0; border-radius: 11px; background: #1D6C67; }
  .k1lin .v { width: 34px; text-align: right; font: 700 26px 'Inter'; color: #64748B; }
  .k1lin .ok { width: 38px; height: 38px; border-radius: 50%; background: #198754; display: grid; place-items: center; opacity: 0; }
  .k1lin .ok svg { width: 22px; }
  #k1lista, #k1linha { position: absolute; left: 0; right: 0; top: 110px; }
  #k1gerar { position: absolute; left: 34px; right: 34px; top: 840px; height: 86px; border-radius: 999px; background: #1D6C67; color: #fff; font: 700 32px 'Inter'; display: flex; align-items: center; justify-content: center; gap: 12px; }
  #k1trilho { position: relative; height: 30px; border-radius: 15px; background: #EEF2F1; margin-top: 70px; }
  #k1trilho i { position: absolute; left: 0; top: 0; bottom: 0; width: 0; border-radius: 15px; background: #1D6C67; }
  #k1trilho .sem { position: absolute; top: -2px; bottom: -2px; width: 3px; background: #fff; }
  #k1flag { position: absolute; right: -6px; top: -78px; height: 56px; padding: 0 18px; border-radius: 12px; background: #E06448; color: #fff; font: 700 25px 'Inter'; display: flex; align-items: center; white-space: nowrap; opacity: 0; }
  #k1hoje { position: absolute; left: 0; top: -60px; font: 700 25px 'Inter'; color: #1D6C67; }
  #k1fases { display: flex; justify-content: space-between; margin-top: 26px; font: 600 24px 'Inter'; color: #64748B; }
  #k1fases span { opacity: 0; }
"""
HTML = """<div id="k1"><div class="fundo"></div>
  <div id="k1A"><div class="k1rot" style="left:92px;top:270px">EXAME DE ORDEM UNIFICADO</div>
    <div id="k1num">48º</div><div id="k1ex">Exame da OAB</div><div id="k1pausa"><i></i><i></i></div>
    <div id="k1rel"><svg viewBox="0 0 200 200"><circle cx="100" cy="100" r="84" fill="none" stroke="#DCE7E4" stroke-width="16"/><circle id="k1anel" cx="100" cy="100" r="84" fill="none" stroke="#1D6C67" stroke-width="16" stroke-linecap="round" transform="rotate(-90 100 100)"/></svg>
      <div><div class="n" id="k1seg">0:00</div><div class="l">os próximos segundos</div></div></div></div>
  <div id="k1B"><div id="k1pub"></div>
    <div id="k1cal"><div class="cab">JANEIRO<small>dia da prova</small></div><div class="g" id="k1g"></div></div>
    <div class="k1rot" style="left:92px;top:1000px" id="k1rotG">CANDIDATOS</div><div id="k1gente"></div></div>
</div>

<div class="p k1chip" id="k1sem" style="left:540px;top:330px"><div class="bol" style="background:#FDECE7" id="k1semX"></div><span style="position:relative" id="k1semT">Estudar sem plano</span></div>
<div class="p k1card" id="k1fac" style="left:540px;top:320px"><div class="t">Revisar toda a faculdade<small id="k1facN">0 matérias</small></div><div id="k1mats"></div></div>
<div class="p k1card" id="k1conf" style="left:540px;top:320px"><div class="t">Chegando perto da prova<small>semana da prova</small></div>
  <div class="k1bar"><div class="r">Confiança<b id="k1confV" style="color:#E06448">80%</b></div><div class="tr"><i id="k1confB" style="background:#E06448;width:80%"></i></div></div>
  <div class="k1bar"><div class="r">Energia<b id="k1enV" style="color:#E06448">75%</b></div><div class="tr"><i id="k1enB" style="background:#E3A64A;width:75%"></i></div></div></div>
<div class="p k1card" id="k1cai" style="left:540px;top:320px"><div class="t">O que você estudou<small>× o que cai</small></div>
  <div class="k1bar"><div class="r">Não cai no exame<b id="k1nV" style="color:#94A3B8">0%</b></div><div class="tr"><i id="k1nB" style="background:#B8C4C1;width:0"></i></div></div>
  <div class="k1bar"><div class="r">Cai no exame<b id="k1cV" style="color:#1D6C67">0%</b></div><div class="tr"><i id="k1cB" style="background:#1D6C67;width:0"></i></div></div></div>
<div class="p k1chip" id="k1esf" style="left:540px;top:330px"><div class="bol" style="background:#FDECE7" id="k1esfX"></div><span style="position:relative" id="k1esfT">Falta de esforço</span></div>
<div class="p k1chip" id="k1dir" style="left:540px;top:330px;background:#1D6C67;color:#fff"><div class="bol" style="background:#fff" id="k1dirOk"></div>Falta de direção</div>

<div class="p card fs" id="k1app" style="left:540px;top:800px">
  <div class="top"><div class="lg"><img src="img/logo.png"></div><div class="nm">Espaço do Aluno</div><div class="av">VC</div></div>
  <div class="abas"><div class="aba on">Cronograma</div><div class="aba">Questões</div><div class="aba">Mentoria</div><div class="aba">Simulados</div></div>
  <div class="corpo"><h3>Seu plano · 48º Exame</h3><p>Montado pelo que a FGV mais cobra</p>
    <div id="k1lista"><div class="rot">PESO NA PROVA (QUESTÕES)</div></div>
    <div id="k1linha" style="opacity:0"><div class="rot">ATÉ A PROVA</div>
      <div id="k1trilho"><div id="k1hoje">Hoje</div><i id="k1fill"></i><div id="k1flag">10 de janeiro · Prova</div></div>
      <div id="k1fases"><span>Base</span><span>Questões FGV</span><span>Revisão</span><span>Simulados</span></div></div>
  </div>
  <div id="k1gerar"><span id="k1gerarT">Gerar meu cronograma</span></div>
</div>
"""
SETUP = """
// ── Copy 1: montagem dos elementos
$('#k1pub').innerHTML = S('check', '#1D6C67', 3) + 'Edital publicado';
$('#k1semX').innerHTML = S('x', '#E06448', 3); $('#k1esfX').innerHTML = S('x', '#E06448', 3); $('#k1dirOk').innerHTML = S('check', '#1D6C67', 3.2);
const rk1sem = riscar('k1semT'), rk1esf = riscar('k1esfT');
{ const g = $('#k1g'); ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].forEach(d => { const e = document.createElement('div'); e.className = 's'; e.textContent = d; g.appendChild(e); });
  for (let i = 0; i < 4; i++) g.appendChild(document.createElement('div'));   // janeiro começa numa quinta (ilustrativo)
  for (let d = 1; d <= 24; d++) { const e = document.createElement('div'); e.textContent = d; if (d === 10) e.id = 'k1d10'; g.appendChild(e); }
  $('#k1d10').innerHTML = '10<svg style="position:absolute;inset:-14px;overflow:visible" viewBox="0 0 120 112"><path class="k1circ" id="k1c10" d="M 64 8 C 20 4, 4 40, 10 66 C 18 100, 96 106, 112 66 C 122 34, 96 6, 52 12"/></svg>'; }
const K1G = Array.from({ length: 30 }, (_, k) => { const i = document.createElement('i'); $('#k1gente').appendChild(i); return i; });
const K1ERRO = new Set([0, 1, 3, 4, 6, 7, 8, 10, 12, 13, 14, 16, 17, 19, 20, 22, 23, 25, 26, 28, 29]);
const K1MATS = ['Civil', 'Penal', 'Trabalho', 'Tributário', 'Empresarial', 'Ambiental', 'Consumidor', 'Administrativo', 'Constitucional', 'ECA', 'Internacional',
  'Previdenciário', 'Processo Civil', 'Processo Penal', 'Direitos Humanos', 'Filosofia', 'Eleitoral', 'Financeiro'];
const k1mats = K1MATS.map(n => { const e = document.createElement('span'); e.textContent = n; $('#k1mats').appendChild(e); return e; });
const K1PESO = [['Ética Profissional', 8], ['Direito Civil', 7], ['Constitucional', 6], ['Direito Penal', 6], ['Processo Civil', 6], ['Administrativo', 5], ['Trabalho', 5]];
const k1lin = K1PESO.map(([n, v], k) => { const e = document.createElement('div'); e.className = 'k1lin';
  e.innerHTML = `<div class="nm">${n}</div><div class="tr"><i></i></div><div class="v">${v}</div><div class="ok">${S('check', '#fff', 3.4)}</div>`; $('#k1lista').appendChild(e); return [e, v, k]; });
{ const tr = $('#k1trilho'); for (let i = 1; i < 12; i++) { const e = document.createElement('div'); e.className = 'sem'; e.style.left = (i / 12 * 100) + '%'; tr.appendChild(e); } }
"""
JS = """  /* ── Copy 1 · abertura (0 → 12,6): 48º Exame · para tudo · próximos segundos → janeiro, dia 10 → a maioria erra ── */
  {
    const sobe = pr(T, 0.84, 0.55, E.cubicOut), desce = pr(T, 12.42, 0.5, E.cubicIn), k1 = $('#k1');
    const vis = T > 0.78 && T < 13.0;
    k1.style.display = vis ? 'block' : 'none';
    const y = L(1990, 0, sobe) + desce * 2080;
    k1.style.transform = `translateY(${y}px)`;
    window.PAPEL_TOPO = vis ? y - 20 : 9999;
    const saiA = pr(T, 6.05, 0.35, E.cubicIn);
    $('#k1A').style.opacity = 1 - saiA; $('#k1A').style.transform = `translateY(${-saiA * 40}px)`;
    const pn = pr(T, 1.7, 0.7), pe = pr(T, 2.74, 0.6);
    $('#k1num').style.opacity = pr(T, 1.7, 0.25, E.cubicOut); $('#k1num').style.transform = `translateY(${(1 - pn) * 60}px)`;
    $('#k1ex').style.opacity = pr(T, 2.74, 0.25, E.cubicOut); $('#k1ex').style.transform = `translateY(${(1 - pe) * 30}px)`;
    const pp = M.prog(T, 3.6, 0.6, E.spring);
    $('#k1pausa').style.opacity = pr(T, 3.6, 0.15, E.cubicOut); $('#k1pausa').style.transform = `scale(${L(0.4, 1, pp)})`;
    $('#k1rel').style.opacity = pr(T, 4.56, 0.3, E.cubicOut); $('#k1rel').style.transform = `translateY(${(1 - pr(T, 4.56, 0.6)) * 30}px)`;
    const seg = C((T - 4.75) / 1.25) * 5; $('#k1seg').textContent = '0:0' + Math.floor(seg);
    const an = $('#k1anel'), La = 2 * Math.PI * 84; an.style.strokeDasharray = La; an.style.strokeDashoffset = La * (1 - C((T - 4.75) / 1.25) * 0.42);
    // janeiro: edital publicado no "saiu", dia 10 circulado no "janeiro"
    const entraB = pr(T, 6.2, 0.45, E.cubicOut), sobeCal = pr(T, 9.2, 0.6, E.cubicInOut);
    $('#k1B').style.opacity = T < 6.15 ? 0 : entraB;
    $('#k1cal').style.transform = `translateY(${(1 - pr(T, 6.2, 0.6)) * 50}px)`;
    $('#k1pub').style.opacity = pr(T, 7.45, 0.3, E.cubicOut); $('#k1pub').style.transform = `scale(${L(0.7, 1, M.prog(T, 7.45, 0.6, E.spring))})`;
    const c10 = $('#k1c10'), Lc = c10._L || (c10._L = c10.getTotalLength()); c10.style.strokeDasharray = Lc; c10.style.strokeDashoffset = Lc * (1 - pr(T, 8.72, 0.45, E.cubicInOut));
    // a maioria comete o mesmo erro
    $('#k1rotG').style.opacity = pr(T, 9.3, 0.3, E.cubicOut);
    K1G.forEach((e, k) => { const a = 9.35 + k * 0.025; e.style.opacity = pr(T, a, 0.25, E.cubicOut); e.style.transform = `scale(${L(0.5, 1, M.prog(T, a, 0.5, E.spring))})`;
      const er = K1ERRO.has(k) ? pr(T, 10.94 + (k % 10) * 0.03, 0.3, E.cubicOut) : 0;
      e.style.background = er > 0.5 ? '#E06448' : '#CBD5D2'; e.style.transform += ` translateY(${K1ERRO.has(k) ? tranco(T, 12.16) ? -8 * Math.exp(-6 * Math.max(0, T - 12.16)) * Math.abs(Math.sin((T - 12.16) * 14)) : 0 : 0}px)`; });
  }
  /* ── Copy 1 · inserções (topo) ── */
  A($('#k1sem'), T, 13.3, 14.45, { de: 0.82, dy: -50 }); rk1sem(T, 13.75);
  A($('#k1fac'), T, 14.5, 16.75, { de: 0.86, dy: -60 });
  { let n = 0; k1mats.forEach((e, k) => { const a = 14.75 + k * 0.08, p = pr(T, a, 0.25, E.cubicOut); e.style.opacity = p; e.style.transform = `scale(${L(0.6, 1, p)})`; if (T >= a) n++; });
    $('#k1facN').textContent = n + (n === 1 ? ' matéria' : ' matérias'); }
  A($('#k1conf'), T, 17.75, 20.65, { de: 0.86, dy: -60 });
  { const p = pr(T, 18.9, 1.4, E.cubicInOut), c = L(80, 18, p), en = L(75, 22, pr(T, 18.9, 1.2, E.cubicInOut));
    $('#k1confB').style.width = c + '%'; $('#k1confV').textContent = Math.round(c) + '%'; $('#k1enB').style.width = en + '%'; $('#k1enV').textContent = Math.round(en) + '%'; }
  A($('#k1cai'), T, 20.75, 25.15, { de: 0.86, dy: -60 });
  { const n = pr(T, 22.43, 1.0, E.quintOut) * 78, c = pr(T, 23.53, 1.0, E.quintOut) * 22;
    $('#k1nB').style.width = n + '%'; $('#k1nV').textContent = Math.round(n) + '%'; $('#k1cB').style.width = c + '%'; $('#k1cV').textContent = Math.round(c) + '%'; }
  A($('#k1esf'), T, 25.22, 26.6, { de: 0.82, dy: -50 }); rk1esf(T, 26.07);
  A($('#k1dir'), T, 26.68, 27.6, { de: 0.8, dy: -50, extra: tranco(T, 27.19) });
  /* ── Copy 1 · plataforma (27,7 → 37,25): plano pelo peso da FGV → caminho até 10 de janeiro ── */
  A($('#k1app'), T, 28.0, 37.15, { de: 0.88, dy: 120, dout: 0.2 });
  k1lin.forEach(([e, v, k]) => { const a = 29.3 + k * 0.1; e.style.opacity = pr(T, a, 0.25, E.cubicOut); e.style.transform = `translateY(${(1 - pr(T, a, 0.5)) * 20}px)`;
    e.querySelector('.tr i').style.width = (pr(T, 31.0 + k * 0.08, 0.8, E.quintOut) * v / 8 * 100) + '%';
    const ok = e.querySelector('.ok'), po = k < 5 ? pr(T, 32.0 + k * 0.08, 0.3, E.cubicOut) : 0; ok.style.opacity = po; ok.style.transform = `scale(${L(0.4, 1, M.prog(T, 32.0 + k * 0.08, 0.6, E.spring))})`;
    if (k >= 5) e.style.opacity = parseFloat(e.style.opacity) * (1 - 0.55 * pr(T, 32.2, 0.4)); });
  { const cl = cursor($('#cur2'), T, 32.3, [1020, 1500], [600, 1268], 32.8, 33.3); $('#k1gerar').style.transform = `scale(${1 - 0.04 * cl})`;
    $('#k1gerarT').textContent = T < 32.85 ? 'Gerar meu cronograma' : 'Cronograma gerado ✓'; $('#k1gerar').style.background = T < 32.85 ? '#1D6C67' : '#198754';
    const tr = pr(T, 33.0, 0.5, E.cubicInOut); $('#k1lista').style.opacity = 1 - tr; $('#k1linha').style.opacity = tr; $('#k1linha').style.transform = `translateY(${(1 - tr) * 30}px)`;
    $('#k1fill').style.width = (pr(T, 35.0, 1.4, E.cubicInOut) * 100) + '%';
    [...$('#k1fases').children].forEach((e, k) => { e.style.opacity = pr(T, 33.6 + k * 0.25, 0.3, E.cubicOut); });
    const fl = M.prog(T, 36.29, 0.6, E.spring); $('#k1flag').style.opacity = pr(T, 36.29, 0.2, E.cubicOut); $('#k1flag').style.transform = `scale(${L(0.5, 1, fl)})`; $('#k1flag').style.transformOrigin = '100% 100%'; }
"""
corta('  /* FS1 · mesa de estudo', '  /* FS2 · Espaço do Aluno', CSS)
corta('<div id="mesa">', '<div id="vinheta"></div>\n', HTML, incl_b=True)
corta('  /* ── FS1 · 0 → 7,52: mesa de estudo ── */', '  /* ── inserções · 7,52', '')
corta('\n// grade da semana do planner (vazia)', 'Y0 + RH * j }); }', SETUP, incl_b=True)
troca('<script src="palavras.js"></script>', '<script src="copy1/palavras.js"></script>')
troca('window.DURACAO = 47.4;', 'window.DURACAO = 41.0;\nconst ANC = ' + json.dumps(ANC) + ';\n'
      'const WARP = x => { for (let i = 1; i < ANC.length; i++) if (x <= ANC[i][0]) { const [a0, b0] = ANC[i - 1], [a1, b1] = ANC[i]; return b0 + (b1 - b0) * C((x - a0) / Math.max(1e-6, a1 - a0)); } return ANC[ANC.length - 1][1]; };')
troca('window.quadro = function (t) {\n  FM.antes(t);\n  tela(t);', 'window.quadro = function (T) {\n  const t = WARP(T);\n  FM.antes(t);\n  tela(T);')
troca('const FS = [[30.22, 38.6, true]];', 'const FS = [[27.7, 37.25, true]];')
troca('  /* ── inserções · 7,52', JS + '\n  /* ── inserções · 7,52')
troca('  confete(t);\n  legenda(t);', '  confete(t);\n  legenda(T);')
troca('const OCULTA = [[0.86, 1.32], [35.45, 38.62]];', 'const OCULTA = [[0.84, 1.3]];')
troca("const papel = t > 0.7 && t < 7.9 && (window.PAPEL_TOPO ?? 9999) < 1460;", "const papel = (window.PAPEL_TOPO ?? 9999) < 1460;")
troca('Curso completo para o<br><b>48º Exame da OAB</b></div>', 'Fale com a nossa equipe<br><b>48º Exame da OAB</b></div>')
troca('Saiba mais <span id="btnCtaI">', 'Preencher formulário <span id="btnCtaI">')
troca('#btnCta { position: relative; margin: 18px 0 0; height: 84px; width: 420px;', '#btnCta { position: relative; margin: 18px 0 0; height: 84px; width: 510px;')
open('copy1.html', 'w', encoding='utf8').write(s)
print('ok')
