"""SFX do banner "Programa MVP" (linha Blue) — tempos iguais aos do cta-mvp-blue.html.
uso: python cta-mvp-blue-sfx.py <saida.wav>"""
import sys, os
import numpy as np
sys.path.insert(0, os.path.dirname(__file__))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
import importlib.util
from sfx import *

esp = importlib.util.spec_from_file_location('esc', os.path.join(os.path.dirname(__file__), 'cta-escale-blue-sfx.py'))
esc = importlib.util.module_from_spec(esp); esp.loader.exec_module(esc)   # cabecalho() e botao()

D6, E6, Fs6, A6 = 1174.66, 1318.51, 1479.98, 1760.0
m = Mixagem(10.0)
cubicInOut = lambda p: 4 * p ** 3 if p < 0.5 else 1 - (-2 * p + 2) ** 3 / 2
m.add(0, base_ambiente(10.0), 0.06, cama=True, nome='cama ambiente (fundo)')

esc.cabecalho(m, 0.1)
# selo
m.add(0.7, ar(0.6, 3000), 0.18, nome='selo: ar')
m.add(0.9, pop(700, 0.3, 0.3), 0.18, nome='selo: pop')
# título (3 linhas)
digitar(m, 1.0, 10, 0.075, ganho=0.24, semente=23)
m.add(0.94, ar(0.9, 2200), 0.28, nome='linha 1: sopro')
m.add(1.24, ar(0.9, 2600), 0.26, nome='linha 2: sopro')
m.add(1.47, ar(0.9, 3000), 0.24, nome='linha 3: sopro')
m.add(1.65, vidro(A6, 1.8, 1.0), 0.16, nome='"caminho validado": brilho')
# caminho
for i in range(3):
    m.add(2.55 + i * 0.08, tick(2600 + 200 * i, 0.03, pan=-0.5 + 0.5 * i), 0.08, nome=f'ponto {i + 1} aparece')
curva = np.array([cubicInOut(p) for p in np.linspace(0, 1, 400)])
m.add(2.8, zip_linha(1.9, 330, 1300, curva), 0.22, nome='linha se desenha')
def quando(f):
    ps = np.linspace(0, 1, 2000); return 2.8 + 1.9 * ps[np.argmax([cubicInOut(p) >= f for p in ps])]
for i, (f, nota) in enumerate([(0.0, D6), (0.34, Fs6), (0.67, A6)]):
    m.add(quando(f) + (0.02 if f else 0.06), vidro(nota, 1.4, 0.7, pan=-0.45 + 0.45 * i), 0.22, nome=f'ponto {i + 1} acende')
m.add(4.55, pop(560, 0.4, 0.8, pan=0.45), 0.32, nome='círculo final: pop')
m.add(5.22, acorde_sucesso(D6, pan=0.4), 0.26, nome='check: sucesso')
# caixa da chamada
m.add(4.95, whoosh(0.5, 700, 2600, pico=0.4, q=1.1), 0.20, nome='caixa da chamada')
digitar(m, 5.15, 9, 0.045, ganho=0.15, adianta=0.05, semente=24)
esc.botao(m, 5.9)

for t, n in sorted(m.salvar(sys.argv[1])):
    if n and not n.startswith('tecla'): print(f'{t:6.2f}  {n}')
