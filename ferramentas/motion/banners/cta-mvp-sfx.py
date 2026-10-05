"""SFX do banner "Programa MVP" — tempos iguais aos do cta-mvp.html.
uso: python cta-mvp-sfx.py <saida.wav>"""
import sys, os
import numpy as np
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
from sfx import *

D6, E6, Fs6, A6, D7 = 1174.66, 1318.51, 1479.98, 1760.0, 2349.32
m = Mixagem(10.5)
cubicInOut = lambda p: 4 * p ** 3 if p < 0.5 else 1 - (-2 * p + 2) ** 3 / 2

# fundo de seda → cama ambiente
m.add(0, base_ambiente(10.5), 0.06, cama=True, nome='cama ambiente (fundo animado)')

# selo "Programa MVP para SaaS" surge → pop de vidro
m.add(0.05, ar(0.7, 3000), 0.22, nome='selo: ar')
m.add(0.32, pop(700, 0.3, 0.3), 0.20, nome='selo: pop')
m.add(0.36, vidro(E6, 1.5, 0.7), 0.18)

# título palavra a palavra (3 linhas)
digitar(m, 0.4, 10, 0.075, ganho=0.24, semente=3)          # "Se você quer lançar seu SaaS, precisa de um caminho validado"
m.add(0.34, ar(0.9, 2200), 0.28, nome='linha 1: sopro')
m.add(0.64, ar(0.9, 2600), 0.26, nome='linha 2: sopro')
m.add(1.02, ar(0.9, 3000), 0.24, nome='linha 3: sopro')
m.add(1.2, vidro(A6, 1.8, 1.0), 0.16, nome='"caminho validado": brilho')

# o bloco todo sobe para abrir espaço → whoosh subindo
m.add(2.05, whoosh(1.5, 280, 2600, pico=0.45, q=1.2, corpo=0.25), 0.34, nome='bloco sobe')

# pontos do caminho aparecem → tiques bem leves
for i in range(3):
    m.add(2.45 + i * 0.08, tick(2600 + 200 * i, 0.03, pan=-0.5 + 0.5 * i), 0.08, nome=f'ponto {i + 1} aparece')

# a linha se desenha → tom + ar que sobe junto com a linha (mesma curva da animação)
curva = np.array([cubicInOut(p) for p in np.linspace(0, 1, 400)])
m.add(2.7, zip_linha(1.9, 330, 1300, curva), 0.22, nome='linha se desenha')

# a linha passa por cada ponto → nota de vidro subindo (ponto 1, 2, 3)
def quando(f):   # instante em que a linha (cubicInOut de 2.7 por 1.9 s) chega na fração f
    ps = np.linspace(0, 1, 2000); return 2.7 + 1.9 * ps[np.argmax([cubicInOut(p) >= f for p in ps])]
for i, (f, nota) in enumerate([(0.0, D6), (0.34, Fs6), (0.67, A6)]):
    m.add(quando(f) + (0.02 if f else 0.06), vidro(nota, 1.4, 0.7, pan=-0.45 + 0.45 * i), 0.22, nome=f'ponto {i + 1} acende')

# o círculo final nasce com mola e o check se fecha → pop + acorde de sucesso
m.add(4.45, pop(560, 0.4, 0.8, pan=0.45), 0.32, nome='círculo final: pop')
m.add(5.12, acorde_sucesso(D6, pan=0.4), 0.26, nome='check: sucesso')

# chamada entra
m.add(4.95, ar(1.1, 3400, pico=0.4), 0.18, nome='chamada entra')
digitar(m, 5.0, 9, 0.045, ganho=0.15, adianta=0.05, semente=4)     # "Clica no link abaixo e veja como funciona o programa"

# botão "Saiba mais" → golpe principal
m.add(5.65, whoosh(0.35, 800, 5000, pico=0.85, q=1.0), 0.30, nome='CTA: ar')
m.add(5.9, pop(480, 0.45, 1.0), 0.40, nome='CTA: pop')
m.add(5.9, baque(0.7, 58), 0.40)
m.add(5.96, vidro(D7, 2.2, 0.8), 0.18)

# setas para baixo
m.add(6.55, tick(1600, 0.05), 0.16, nome='seta 1')
m.add(6.67, tick(1250, 0.05), 0.16, nome='seta 2')

# reflexo passando no botão (a cada 1,6 s)
for k, t0 in enumerate([6.8, 8.4]):
    m.add(t0 + 0.1, brilho(0.9), 0.13, nome=f'brilho no botão {k + 1}')

for t, n in sorted(m.salvar(sys.argv[1])):
    if n: print(f'{t:6.2f}  {n}')
