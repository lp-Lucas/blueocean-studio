import os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
f = 'forma.html'; s = open(f, encoding='utf8').read()
rd = lambda n: open('trechos/' + n, encoding='utf8').read()
css, html, js = rd('css.txt'), rd('html.txt'), rd('js.txt')

fim_css = '  #seta { width: 300px; height: 120px; }\n'
a = s.index('  /* FS1 · edital */'); b = s.index(fim_css) + len(fim_css)
s = s[:a] + css + s[b:]
a = s.index('<div id="cena1"'); b = s.index('<!-- ═════ TELA CHEIA 2')
s = s[:a] + html + '\n' + s[b:]
a = s.index('  /* ── FS1 · 0 → 7,52 ── */'); b = s.index('  /* ── inserções · 7,52 → 30,22 ── */')
s = s[:a] + js + '\n' + s[b:]

GRADE = """
// grade da semana do planner (vazia)
{ const g = $('#grade'), NS = 'http://www.w3.org/2000/svg', el = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); g.appendChild(e); return e; };
  const X0 = 90, CW = 125, Y0 = 70, RH = 125;
  ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].forEach((d, i) => { el('text', { x: X0 + CW * i + CW / 2, y: 44, 'text-anchor': 'middle' }).textContent = d; });
  ['8h', '10h', '14h', '16h', '19h', '21h'].forEach((h, i) => { el('text', { x: 0, y: Y0 + RH * i + 40 }).textContent = h; });
  for (let i = 0; i <= 6; i++) el('line', { x1: X0 + CW * i, y1: Y0 - 10, x2: X0 + CW * i, y2: Y0 + RH * 6 });
  for (let j = 0; j <= 6; j++) el('line', { x1: 0, y1: Y0 + RH * j, x2: X0 + CW * 6, y2: Y0 + RH * j }); }"""
R = [
  ('    <rect x="-60" y="-60" width="1200" height="2040" fill="url(#pontos)"/>\n', ''),
  ('    <ellipse id="brilho1" cx="840" cy="1500" rx="700" ry="700" fill="url(#brilhoC)"/>\n', ''),
  ("  $('#brilho1').setAttribute('cx', 840 + 120 * Math.sin(t * 0.5)); $('#brilho1').setAttribute('cy', 1500 - 160 * Math.cos(t * 0.37));\n", ''),
  ("const FS = [[-1, 7.52, false], [30.22, 38.6, true]];", "const FS = [[30.22, 38.6, true]];"),
  ("const OCULTA = [[-1, 7.56], [35.45, 38.62]];", "const OCULTA = [[35.45, 38.62]];"),
  ("const riscoImp = riscar('improvT'), riscoDec = riscar('decT');", "const riscoImp = riscar('improvT'), riscoDec = riscar('decT');" + GRADE),
  ("function legenda(t) {\n  const oc = OCULTA.some(([a, b]) => t >= a && t < b);",
   "function legenda(t) {\n  const oc = OCULTA.some(([a, b]) => t >= a && t < b);\n"
   "  const papel = t > 0.7 && t < 7.9 && (window.PAPEL_TOPO ?? 9999) < 1460;   // no papel: tinta escura, sem sombra\n"
   "  legEl.style.color = papel ? '#1C1A17' : '#fff'; legEl.style.textShadow = papel ? 'none' : '';"),
]
for x, y in R:
    assert x in s, x[:70]
    s = s.replace(x, y)
open(f, 'w', encoding='utf8').write(s)
print('ok')
