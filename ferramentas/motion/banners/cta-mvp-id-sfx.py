"""SFX do banner "Programa MVP" (identidade) — tempos iguais aos do cta-mvp-id.html.
uso: python cta-mvp-id-sfx.py <saida.wav>"""
import sys, os
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from sfx import *

D5, D6, E6, Fs6, A6, D7 = 587.33, 1174.66, 1318.51, 1479.98, 1760.0, 2349.32
m = Mixagem(10.0)
cubicInOut = lambda p: 4 * p ** 3 if p < 0.5 else 1 - (-2 * p + 2) ** 3 / 2
m.add(0, base_ambiente(10.0), 0.06, cama=True, nome='cama ambiente (fundo animado)')

# selo
m.add(0.05, ar(0.7, 3000), 0.22, nome='selo: ar')
m.add(0.32, pop(700, 0.3, 0.3), 0.20, nome='selo: pop')
m.add(0.36, vidro(E6, 1.5, 0.7), 0.18)

# título (3 linhas) → teclas + sopros
digitar(m, 0.4, 10, 0.075, ganho=0.24, semente=13)
m.add(0.34, ar(0.9, 2200), 0.28, nome='linha 1: sopro')
m.add(0.66, ar(0.9, 2600), 0.26, nome='linha 2: sopro')
m.add(0.88, ar(0.9, 3000), 0.24, nome='linha 3: sopro')
m.add(1.05, vidro(A6, 1.8, 1.0), 0.16, nome='"caminho validado": brilho')

# caminho
for i in range(3):
    m.add(1.95 + i * 0.08, tick(2600 + 200 * i, 0.03, pan=-0.5 + 0.5 * i), 0.08, nome=f'ponto {i + 1} aparece')
curva = np.array([cubicInOut(p) for p in np.linspace(0, 1, 400)])
m.add(2.2, zip_linha(1.9, 330, 1300, curva), 0.22, nome='linha se desenha')
def quando(f):
    ps = np.linspace(0, 1, 2000); return 2.2 + 1.9 * ps[np.argmax([cubicInOut(p) >= f for p in ps])]
for i, (f, nota) in enumerate([(0.0, D6), (0.34, Fs6), (0.67, A6)]):
    m.add(quando(f) + (0.02 if f else 0.06), vidro(nota, 1.4, 0.7, pan=-0.45 + 0.45 * i), 0.22, nome=f'ponto {i + 1} acende')
m.add(3.95, pop(560, 0.4, 0.8, pan=0.45), 0.32, nome='círculo final: pop')
m.add(4.62, acorde_sucesso(D6, pan=0.4), 0.26, nome='check: sucesso')

# chamada
m.add(4.45, ar(1.1, 3400, pico=0.4), 0.18, nome='chamada entra')
digitar(m, 4.5, 9, 0.045, ganho=0.15, adianta=0.05, semente=14)

# botão
m.add(5.05, whoosh(0.35, 800, 5000, pico=0.85, q=1.0), 0.30, nome='CTA: ar')
m.add(5.3, pop(480, 0.45, 1.0), 0.40, nome='CTA: pop')
m.add(5.3, baque(0.7, 58), 0.40)
m.add(5.36, vidro(D7, 2.2, 0.8), 0.18)

# assinatura + setas
m.add(5.75, ar(0.8, 1800, pico=0.4), 0.16, nome='assinatura: ar')
m.add(5.9, vidro(D5, 1.8, 0.5), 0.14, nome='assinatura: vidro grave')
m.add(5.95, tick(1600, 0.05), 0.16, nome='seta 1')
m.add(6.07, tick(1250, 0.05), 0.16, nome='seta 2')

for k, t0 in enumerate([6.2, 7.8, 9.4]):
    m.add(t0 + 0.1, brilho(0.9), 0.13, nome=f'brilho no botão {k + 1}')

for t, n in sorted(m.salvar(sys.argv[1])):
    if n and not n.startswith('tecla'): print(f'{t:6.2f}  {n}')
