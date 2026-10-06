"""Copy 2: parte do forma.html (Copy 3 aprovada), troca a abertura (FS1 plano) e reencaixa o resto nos tempos da Copy 2."""
import os, json
D = os.path.dirname(os.path.abspath(__file__)); os.chdir(os.path.join(D, '..'))
s = open('forma.html', encoding='utf8').read()

# âncoras: tempo da Copy 2 → tempo equivalente na Copy 3 (mesma fala)
ANC = [[0, 7.0], [9.5, 7.0], [9.501, 14.78], [9.6, 14.8], [10.62, 15.83], [11.10, 16.35], [11.82, 17.09], [12.32, 17.77], [12.66, 18.51], [14.2, 20.62],
       [14.9, 21.24], [16.11, 21.90], [17.63, 23.34], [19.95, 24.3], [20.79, 25.24], [21.3, 26.5], [21.73, 28.12], [22.29, 28.78], [23.87, 29.56],
       [24.40, 30.22], [25.39, 30.54], [26.91, 31.32], [28.25, 32.84], [29.05, 33.78], [29.83, 34.82], [30.57, 35.54], [31.19, 36.0], [31.91, 36.82],
       [32.45, 37.34], [33.40, 38.6], [38.0, 43.3], [38.72, 43.98], [40.5, 47.4]]
json.dump(ANC, open(os.path.join(D, 'ancoras.json'), 'w'))

def corta(a, b, novo='', incl_b=False):
    global s
    i = s.index(a); j = s.index(b, i) + (len(b) if incl_b else 0)
    s = s[:i] + novo + s[j:]
def troca(a, b):
    global s
    assert a in s, a[:80]; s = s.replace(a, b)

CSS = """  /* FS1 plano (Copy 2): vitrine de cursos → mais conteúdo × direção */
  #abre1 { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; z-index: 7; pointer-events: none; display: none; }
  #abre1 .fundo { position: absolute; left: -20px; top: -20px; width: 1120px; height: 1990px; background: #F5FAF8; box-shadow: 0 -16px 40px rgba(0,0,0,.28); }
  #abre1 .rot { position: absolute; font: 600 24px 'Pop'; letter-spacing: .22em; color: #1D6C67; }
  #abre1 .cnt { position: absolute; right: 90px; top: 206px; font: 500 24px 'Inter'; color: #64748B; }
  #cenaA, #cenaB { position: absolute; inset: 0; }
  .curso { position: absolute; width: 440px; height: 250px; background: #fff; border: 1.5px solid #E2E8E6; border-radius: 22px; padding: 18px; opacity: 0; }
  .curso .th { height: 116px; border-radius: 14px; display: grid; place-items: center; }
  .curso .th img { height: 96px; }
  .curso .nm { font: 700 28px 'Inter'; color: #0F172A; margin-top: 16px; letter-spacing: -0.01em; }
  .curso .mt { font: 500 21px 'Inter'; color: #64748B; margin-top: 6px; }
  .curso.forma { border: 3px solid #1D6C67; }
  #abre1 .item { position: absolute; left: 90px; width: 900px; height: 104px; border-bottom: 1.5px solid #DCE5E2; display: flex; align-items: center; gap: 24px;
              font: 600 42px 'Inter'; color: #334155; opacity: 0; letter-spacing: -0.01em; }
  #abre1 .item small { margin-left: auto; font: 500 24px 'Inter'; color: #94A3B8; }
  #abre1 .item .rs { position: absolute; left: -8px; top: 50%; height: 7px; width: 0; background: #E06448; border-radius: 4px; }
  #rota { position: absolute; left: 0; top: 0; overflow: visible; }
  #rota .tr { fill: none; stroke: #1D6C67; stroke-width: 10; stroke-linecap: round; }
  #rota .base { fill: none; stroke: #D5E3DF; stroke-width: 10; stroke-linecap: round; stroke-dasharray: 2 22; }
  .marco { position: absolute; display: flex; align-items: center; gap: 14px; font: 700 30px 'Inter'; color: #0F172A; opacity: 0; white-space: nowrap; }
  .marco span { background: #F5FAF8; padding: 2px 8px; border-radius: 8px; }
  .marco i { width: 30px; height: 30px; border-radius: 50%; background: #fff; border: 7px solid #1D6C67; flex: none; }
  .marco.fim i { background: #1D6C67; }
  .marca-c { fill: none; stroke: #E06448; stroke-width: 8; stroke-linecap: round; }
"""
HTML = """<div id="abre1"><div class="fundo"></div>
  <div id="cenaA">
    <div class="rot" style="left:90px;top:206px">CURSOS PARA A OAB</div><div class="cnt">128 resultados</div>
    <div id="vitrine"></div>
    <svg width="1080" height="1920" style="position:absolute;left:0;top:0;overflow:visible"><path class="marca-c" id="circ" d="M 560 545 C 640 498, 960 500, 1012 560 C 1060 640, 1040 800, 990 830 C 900 880, 620 872, 552 820 C 500 760, 505 600, 575 540"/></svg>
  </div>
  <div id="cenaB">
    <div class="rot" style="left:90px;top:300px" id="rotA">MAIS CONTEÚDO</div>
    <div class="item" style="top:350px">300 PDFs<small>baixados</small><i class="rs"></i></div>
    <div class="item" style="top:454px">120 h de videoaula<small>sem ordem</small><i class="rs"></i></div>
    <div class="item" style="top:558px">2.000 questões soltas<small>sem filtro</small><i class="rs"></i></div>
    <div class="item" style="top:662px">Resumo de tudo<small>da faculdade</small><i class="rs"></i></div>
    <div class="rot" style="left:90px;top:880px;opacity:0" id="rotB">DIREÇÃO</div>
    <svg id="rota" width="1080" height="1920"><path class="base" d="M 130 1330 C 330 1330, 330 1010, 540 1010 S 760 1250, 950 1010"/><path class="tr" id="rotaP" d="M 130 1330 C 330 1330, 330 1010, 540 1010 S 760 1250, 950 1010"/></svg>
    <div class="marco" style="left:115px;top:1312px"><i></i><span>Hoje</span></div>
    <div class="marco" style="left:316px;top:1152px"><i></i><span>Cronograma</span></div>
    <div class="marco" style="left:440px;width:200px;top:930px;flex-direction:column-reverse;gap:6px"><i></i><span>Questões FGV</span></div>
    <div class="marco" style="left:737px;top:1082px"><i></i><span>Revisão</span></div>
    <div class="marco fim" style="left:860px;width:180px;top:930px;flex-direction:column-reverse;gap:6px"><i></i><span>Aprovação</span></div>
  </div>
</div>
"""
JS = """  /* ── FS1 (Copy 2) · 0 → 9,6: vitrine de cursos → mais conteúdo × direção ── */
  {
    const sobe = pr(T, 0.66, 0.55, E.cubicOut), desce = pr(T, 9.32, 0.5, E.cubicIn), f1 = $('#abre1');
    const vis = T > 0.6 && T < 9.9;
    f1.style.display = vis ? 'block' : 'none';
    const y = L(1990, 0, sobe) + desce * 2080;
    f1.style.transform = `translateY(${y}px)`;
    window.PAPEL_TOPO = vis ? y - 20 : 9999;
    // vitrine: muitos cursos entram; no "mas" apagam; o da Forma de Estudos sobe; câmera aproxima e a caneta circula
    const saiA = pr(T, 5.9, 0.4, E.cubicIn);
    $('#cenaA').style.opacity = 1 - saiA;
    $('#cenaA').style.transformOrigin = '780px 690px';
    $('#cenaA').style.transform = `scale(${1 + 0.14 * pr(T, 4.3, 1.4, E.cubicInOut)}) translateY(${-saiA * 40}px)`;
    CURSOS.forEach((el, k) => {
      const a = 0.95 + k * 0.11, p = pr(T, a, 0.55), pa = pr(T, a, 0.2, E.cubicOut);
      const forma = k === 3, apaga = forma ? 0 : pr(T, 2.0, 0.45, E.cubicOut), destaque = forma ? M.prog(T, 2.82, 0.7, E.spring) : 0;
      el.style.opacity = pa * (1 - apaga * 0.62);
      el.style.filter = apaga > 0.01 ? `grayscale(${apaga})` : 'none';
      el.style.transform = `translateY(${(1 - p) * 30}px) scale(${L(0.94, 1, p) * (1 + 0.06 * destaque)})`;
      el.style.boxShadow = forma && T > 2.82 ? `0 ${18 * C(destaque)}px ${40 * C(destaque)}px rgba(29,108,103,.22)` : 'none';
    });
    const circ = $('#circ'), Lc = circ._L || (circ._L = circ.getTotalLength());
    circ.style.strokeDasharray = Lc; circ.style.strokeDashoffset = Lc * (1 - pr(T, 4.75, 0.55, E.cubicInOut));
    // mais conteúdo (riscado no "conteúdo.") → direção (rota até a aprovação)
    const entraB = pr(T, 6.0, 0.4, E.cubicOut);
    $('#cenaB').style.opacity = T < 5.95 ? 0 : entraB;
    const dim = pr(T, 8.0, 0.4, E.cubicOut);
    [...document.querySelectorAll('#abre1 .item')].forEach((el, k) => {
      const a = 6.1 + k * 0.12, p = pr(T, a, 0.5), pa = pr(T, a, 0.2, E.cubicOut);
      el.style.opacity = pa * (1 - dim * 0.65); el.style.transform = `translateY(${(1 - p) * 24}px)`;
      el.querySelector('.rs').style.width = (pr(T, 7.2 + k * 0.09, 0.3, E.cubicInOut) * 520) + 'px';
    });
    $('#rotA').style.opacity = entraB * (1 - dim * 0.65);
    $('#rotB').style.opacity = pr(T, 8.1, 0.3, E.cubicOut);
    const rp = $('#rotaP'), Lr = rp._L || (rp._L = rp.getTotalLength());
    rp.style.strokeDasharray = Lr; rp.style.strokeDashoffset = Lr * (1 - pr(T, 8.15, 1.0, E.cubicInOut));
    document.querySelector('#rota .base').style.opacity = pr(T, 8.05, 0.3);
    [...document.querySelectorAll('#abre1 .marco')].forEach((el, k) => {
      const a = 8.18 + k * 0.22, p = M.prog(T, a, 0.6, E.spring);
      el.style.opacity = pr(T, a, 0.2, E.cubicOut); el.style.transform = `scale(${L(0.6, 1, p)})`; el.style.transformOrigin = '15px 50%';
    });
  }
"""
VITRINE = """
// vitrine de cursos (Copy 2): genéricos em tons neutros + o da Forma de Estudos
const CURSOS = [['Intensivão OAB', '★ 4,6 · 180 h de aula', '#D9DEE7'], ['OAB Reta Final', '★ 4,4 · 96 h de aula', '#E7DED0'], ['Maratona 1ª Fase', '★ 4,5 · 210 h de aula', '#DCD8EE'],
  ['Forma de Estudos', 'Cronograma pronto · padrão FGV', null], ['OAB em 30 Dias', '★ 4,3 · 60 h de aula', '#F0DAD1'], ['Combo OAB Total', '★ 4,7 · 320 h de aula', '#D5E6E0'],
  ['Revisão Express', '★ 4,2 · 40 h de aula', '#E5E7EB'], ['Turma OAB Online', '★ 4,5 · 150 h de aula', '#E8E1D6']].map(([n, m, cor], k) => {
  const d = document.createElement('div'); d.className = 'curso' + (cor ? '' : ' forma');
  d.innerHTML = `<div class="th" style="background:${cor || '#F5FAF8'}">${cor ? '' : '<img src="img/logo.png">'}</div><div class="nm">${n}</div><div class="mt">${m}</div>`;
  d.style.left = (90 + (k % 2) * 460) + 'px'; d.style.top = (270 + Math.floor(k / 2) * 285) + 'px';
  $('#vitrine').appendChild(d); return d; });
"""
corta('  /* FS1 · mesa de estudo', '  /* FS2 · Espaço do Aluno', CSS)
corta('<div id="mesa">', '<div id="vinheta"></div>\n', HTML, incl_b=True)
corta('  /* ── FS1 · 0 → 7,52: mesa de estudo ── */', '  /* ── inserções', '')
corta('\n// grade da semana do planner (vazia)', 'Y0 + RH * j }); }', VITRINE, incl_b=True)
troca('<script src="palavras.js"></script>', '<script src="copy2/palavras.js"></script>')
troca('window.DURACAO = 47.4;', 'window.DURACAO = 40.5;\nconst ANC = ' + json.dumps(ANC) + ';\n'
      'const WARP = x => { for (let i = 1; i < ANC.length; i++) if (x <= ANC[i][0]) { const [a0, b0] = ANC[i - 1], [a1, b1] = ANC[i]; return b0 + (b1 - b0) * C((x - a0) / Math.max(1e-6, a1 - a0)); } return ANC[ANC.length - 1][1]; };')
troca('window.quadro = function (t) {\n  FM.antes(t);', 'window.quadro = function (T) {\n  const t = WARP(T);\n  FM.antes(t);')
troca('  /* ── inserções · 7,52', JS + '\n  /* ── inserções · 7,52')
troca('  confete(t);\n  legenda(t);', '  confete(t);\n  legenda(T);')
troca('const OCULTA = [[0.86, 1.32], [35.45, 38.62]];', 'const OCULTA = [[0.66, 1.15], [30.5, 33.45]];')
troca("const papel = t > 0.7 && t < 7.9 && (window.PAPEL_TOPO ?? 9999) < 1460;", "const papel = (window.PAPEL_TOPO ?? 9999) < 1460;")
open('copy2.html', 'w', encoding='utf8').write(s)
print('ok')
