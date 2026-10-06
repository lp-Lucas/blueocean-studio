"""SFX da Copy 2: os da Copy 3 (forma-sfx.py) reencaixados pelas âncoras + os da abertura nova."""
import sys, os, json
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(D, '..', '..'))
from fmsfx import *
ANC = [a for a in json.load(open(os.path.join(D, 'ancoras.json'))) if a[0] >= 9.501]
def volta(t3):   # tempo da Copy 3 → tempo da Copy 2
    for (a0, b0), (a1, b1) in zip(ANC, ANC[1:]):
        if b0 <= t3 <= b1: return a0 + (a1 - a0) * (t3 - b0) / max(1e-6, b1 - b0)
    return None
src = open(os.path.join(D, '..', 'forma-sfx.py'), encoding='utf8').read()
i = src.index('# ── tela cheia 1'); j = src.index('# ── inserções'); src = src[:i] + src[j:]
src = src.replace('m = nova(47.4)', 'm = _M').replace('salvar(m, sys.argv[1])', '')
src = src.replace('from fmsfx import *', '')
m0 = nova(40.5); _add0 = m0.add
class P:   # mixagem que recebe tempos da Copy 3
    def add(self, t, *a, **k):
        if t < 14.7: return
        t2 = volta(t)
        if t2 is not None: _add0(max(0, t2), *a, **k)
ns = dict(globals()); ns['_M'] = P(); ns['sys'] = sys
exec(compile(src, 'forma-sfx', 'exec'), ns)
m = m0
# abertura: folha sobe, cursos entram, caneta circula, itens riscados, rota desenhando, folha desce
m.add(0.64, whoosh(0.55, 500, 2400, pico=0.45, q=0.7), 0.24, nome='folha sobe')
for k in range(8): m.add(0.95 + k * 0.11, pop(700 + 60 * k, 0.15, 0.4), 0.07, nome='curso entra')
m.add(2.0, whoosh(0.4, 2000, 700, pico=0.4, q=1.0), 0.1, nome='cursos apagam')
entra(m, 2.82, 640, 0.2)
for k in range(12): m.add(4.75 + k * 0.045, tick(r.uniform(1800, 4200), 0.02), 0.1, nome='caneta')
m.add(5.9, whoosh(0.4, 2400, 600, pico=0.4, q=1.0), 0.14, nome='troca de cena')
for k in range(4): m.add(6.1 + k * 0.12, tick(1600 + 120 * k, 0.03), 0.08, nome='item')
for k in range(4): m.add(7.2 + k * 0.09, whoosh(0.25, 1800, 4200, pico=0.3, q=1.6), 0.09, nome='risco')
m.add(8.15, whoosh(1.0, 600, 2600, pico=0.6, q=1.0), 0.14, nome='rota desenha')
for k in range(5): m.add(8.18 + k * 0.22, pop(800 + 110 * k, 0.15, 0.4), 0.08, nome='marco')
check(m, 9.06, E6, ganho=0.12)
m.add(9.3, whoosh(0.55, 500, 2400, pico=0.45, q=0.7), 0.24, nome='folha desce')
salvar(m, sys.argv[1])
